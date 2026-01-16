/* eslint-disable react-hooks/exhaustive-deps */
import { CheckPage } from "./currentPage";
import { useEffect, useState } from "react";

interface phpOut {
    status: string,
    notes: Record<string, baseJSON>;
    global_filter: string[];
}

interface baseJSON {
  order: string[];
  count: number;
  type: string;
  [key: number]: Record<string, string>;
  sort: {
    property: string,
    direction: string
  }[] | [];
  localFilter: string[];
}
interface SiteSettings{
    uriPath: string,
    vaultName: string,
}
type view = {
    viewName : string,
    viewType: string,
    allViews: boolean,
    sortView: boolean,
    sortBy: {
        property: string,
        direction: string
     }[] | [],
    addingSort: boolean,
    filterView: boolean,
    showSort: boolean,
    addingFilter: boolean,
    filterBy: {
        filterType: number,
        query: Query[],
    },
    showFilter: boolean
}
type Query = [string, string, string];

function Bases({props}: {props:SiteSettings}){
    const pageCheck = CheckPage();
    const [getQueryRes, setQueryRes] = useState<Record<string, baseJSON>>();
    const [getView, setView] = useState<view>(
        {viewName:"", viewType:"", allViews: false, sortView:false, filterView:false, 
        sortBy:[{ 
            property: "title", 
            direction:"ASC" 
        }], addingSort:false, addingFilter:false, 
        filterBy: {
            filterType: 1,
            query: [["", "",""]]
        },
        showSort: false, showFilter: false
    });
    const [getGlobalFilter, setGlobalFilter] = useState<string[]>([]);
    async function getBase(){
        if (pageCheck !== null && pageCheck.includes("base")) {
            document.getElementById("middlePane")!.style.display = "none";
             return fetch(`${props.uriPath}bases.php?base=${pageCheck}`,{
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                        return data;
                        
                });
        } else {
            return [];
        }
        
    }
    useEffect(() => {
        
        let ignore = false;
        async function fetchData() {
            const json:phpOut = await getBase();
            if (!ignore) {
                setQueryRes(json.notes);
                setGlobalFilter(json.global_filter);
                if(json.notes !== undefined && json.status === "success"){
                    const name = Object.keys(json.notes)[0]
                    if(getView.viewName === ""){
                        setView({
                            viewName: name,
                            viewType: json.notes[name].type,
                            allViews: false, sortView:false, filterView:false,
                            sortBy:json.notes[name].sort, addingSort:false, addingFilter:false, 
                            filterBy: {
                                filterType: 1,
                                query: [["","",""]]
                            }, showSort: false, showFilter: false});
                            
                            
                    }
                    
                }
            };
            
        }
        if(pageCheck && pageCheck.includes("base") ){
            document.getElementById("middlePane")!.style.display = "none";
            document.getElementById("TheBase")!.style.display = "block";  
            fetchData();
        } else {
            document.getElementById("middlePane")!.style.display = "block";
            document.getElementById("TheBase")!.style.display = "none";
        }
        return () => { ignore = true; }
        }, [pageCheck, getView]);
    return <>
        {
        pageCheck !== null && pageCheck.includes("base") ? 
            (
            <>
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", margin: "8px"}}>
                {pageCheck}
            </div>
            <div className="bases-view" style={{overflowY:'auto', height:"100%"}} onClick={(e)=> {
                e.stopPropagation();
                setView({
                        viewName: getView.viewName,
                        viewType: getView.viewType,
                        allViews: false, sortView:false, filterView:false,
                        sortBy:getView.sortBy, filterBy:getView.filterBy,
                        addingSort:false, addingFilter:false,
                        showSort: false, showFilter: false,
                
                    });
            }}>

                <Header notes={getQueryRes} getView={getView} setView={setView} globalFilter={getGlobalFilter} ></Header>
                <BaseItems notes={getQueryRes} props={props} currView={getView}></BaseItems>
            </div>
                
            
            </>
            ) : 
            <></>
        }   
    </>
}


function BaseItems({notes, props, currView}:{
    notes: Record<string, baseJSON> | undefined,
    props:SiteSettings, currView:view | undefined
    }){
    if(notes == undefined || !currView?.viewName || !notes[currView.viewName]){
        return <></>
    }
    const{sort, order, type, count, localFilter, ...currentBase} = notes[currView.viewName];
    // Don't need these rn
    void sort;
    void count;
    // Filter the Cotent Based on the current View's filter settings
    const filtered = Array.from(Object.entries(currentBase)).filter((row) => {
        let include = [];
        // Include is our Stack to determine if we include the row or not
        for(const filterCond of currView.filterBy.query){
            if(filterCond[0] === "" && filterCond[1] === "" && filterCond[2] === ""){
                continue;
            } else {
                const prop = filterCond[0];
                const condition = filterCond[1];
                const val = filterCond[2];
                // TODO: Handle the undefined cases here
                if(row[1][prop] === undefined){
                    if(currView.filterBy.filterType === 1){
                        return false;
                    } else {
                        if(currView.filterBy.filterType === 2){
                            continue;
                        } else if (currView.filterBy.filterType === 3){
                            return  true;
                        }
                    }
                    
                }
                // 1 is AND 2 is OR 3 is NOT
                // Need to add all the other variations that the bases have.
                switch (condition) {
                    case "is":
                        if(row[1][prop] !== val){
                            if(currView.filterBy.filterType === 1){
                                include.push(false);
                            } else if(currView.filterBy.filterType === 2){
                                include.push(false);
                            } else if (currView.filterBy.filterType === 3) {
                                include.push(true);
                            }
                        } else {
                            if(currView.filterBy.filterType === 1){
                                include.push(true);
                            } else if(currView.filterBy.filterType === 2){
                                include.push(true);
                            } else if (currView.filterBy.filterType === 3) {
                                include.push(false);
                            }
                        }
                        break;
                    case "is not":
                        // Cases where Prop != X
                        if(row[1][prop] !== val){
                            if(currView.filterBy.filterType === 1){
                                include.push(true);
                            } else if(currView.filterBy.filterType === 2){
                                include.push(true);
                            } else if (currView.filterBy.filterType === 3) {
                                include.push(false);
                            }
                        } else {
                            if(currView.filterBy.filterType === 1){
                                include.push(false);
                            } else if(currView.filterBy.filterType === 2){
                                include.push(false);
                            } else if (currView.filterBy.filterType === 3) {
                                include.push(true);
                            }
                        }
                        break;
                    default:
                        break;
                }
                // console.log(row[1][prop]);
            }
        }   

        // All will not include if it finds one false, Or will include is it finds one true. Not will include if it doesn't find any true
        if(currView.filterBy.filterType ===1){
            return !include.includes(false);
        } else if(currView.filterBy.filterType ===2){
            return include.includes(true);
        } else {
            return !include.includes(true);
        }
    })
    // console.log(Array.from(filtered));
    // filter to sort the notes based on the current view's sort settings
    const sorted = Array.from(filtered).sort((p1,p2) => {
        let ret;
        for(const sortSetting of currView.sortBy){
            switch (sortSetting.property) {
                case  "file.name": 
                    ret = p1[1]['title'].localeCompare(p2[1]['title']);
                    break;
                default:
                    const val1 = p1[1][sortSetting.property];
                    const val2 = p2[1][sortSetting.property];
                    if(val1 === undefined && val2 === undefined ){
                        ret = 0;
                    } else if (val1 === undefined && val2 !== undefined){
                        ret = -1;
                    } else if (val1 !== undefined && val2 === undefined){
                        ret = 1;
                    } else {
                        ret = val1.trim().localeCompare(val2.trim());
                    }
                    break;
            }

            if(ret == 0){
                continue;
            } else {
                if(sortSetting.direction !== "ASC"){
                    ret = -ret; 
                } else {
                    ret = ret; 
                }
                break;
            }
        }
        
        return ret === undefined ? 0 : ret;
    });
    let retCount = filtered.length;
    // Set the count for the notes
    if (document.getElementById("count") !== null){
        document.getElementById("count")!.innerText = `Results: ${retCount}`;
    }
    // This is the HTML that will be generated for each note in the view
    // The title will always be included in the base, any other properties found will be appended at  the end
    const html = sorted.map((arr,i) => {
    let properties;
    if(order.length == 0){
        const title = arr[1]['title']!.split('/');
        const resp = title.pop()?.slice(0,-3);
        properties =  (
            <div key={1}>
                <div key={1} className="bases-prop-header">Title</div>
                <div key={2} className="bases-prop-value">{resp}</div>
            </div>
        ); 
    } else {
        properties = order.map((s:string,i:number) => {
            if(s === 'title'){
                const title = arr[1]['title']!.split('/');
                const resp = title.pop()?.slice(0,-3);
                return (
                <div key={i} >
                    <div key={1} className="bases-prop-header">Title</div>
                    <div key={2} className="bases-prop-value">{resp}&nbsp;</div>
                </div>
                )
            } else {
                return (
                <div key={i} >
                    <div key={1} className="bases-prop-header">{s}</div>
                    <div key={2} className="bases-prop-value">{arr[1][s]}&nbsp;</div>
                </div>
                )
            };
        })
    }    
    let card;
    // This is initializing the card for the row in case there is no images
    if(arr[1]['image'] === undefined){
        card = (
            <div key={i} className='bases-item' onClick={() => {
                let encodedURI = decodeURIComponent(arr[1]['title'].slice(2,-3));
                encodedURI = encodedURI.replaceAll('~', '%80');
                encodedURI = encodedURI.replaceAll('-', '~');
                encodedURI = encodedURI.replaceAll(' ', '-');
                window.location.href = props.uriPath +encodedURI;
             }}>
                <div className="bases-cover"></div>
                <div className="bases-properties">
                    {properties}
                </div>
                
            </div>
        );
    } else {
        // This includes the image and will also make the card clickable to go to the note
        const img = arr[1]['image']!.slice(3, -3);
        const title = arr[1]['title']!.split('/');
        title.pop();    
        title.shift();
        const imgSrc= `${props.uriPath}${props.vaultName}/${title.join("/")}/${img}`;
        card = (
            <div key={i} className='bases-item' onClick={() => {
                let encodedURI = decodeURIComponent(arr[1]['title'].slice(2,-3));
                encodedURI = encodedURI.replaceAll('~', '%80');
                encodedURI = encodedURI.replaceAll('-', '~');
                encodedURI = encodedURI.replaceAll(' ', '-');
                window.location.href = props.uriPath +encodedURI;
            }}>
                
                <img className="bases-img" src={imgSrc}></img>
                <div className="bases-properties">
                    {properties}
                </div>
            </div>
        );
    }
    return card;
    })
    
    return (<div className="bases-result-container">{html}</div>);
    
}
function Header({notes, getView, setView, globalFilter}: 
    {
        notes: Record<string, baseJSON> | undefined, 
        getView:view, 
        setView:React.Dispatch<React.SetStateAction<view>>,
        globalFilter: string[]
    }){
    
    if(notes == undefined || !getView || !globalFilter){
        return <></>
    }
    
    useEffect(() => {
        // If viewName doesn't exist in current notes, reset to first available view
        if(!notes[getView.viewName]){
            const firstViewName = Object.keys(notes)[0];
            if(firstViewName){
                setView({
                    viewName: firstViewName,
                    viewType: notes[firstViewName].type,
                    allViews: false, sortView:false, filterView:false,
                    sortBy:notes[firstViewName].sort, 
                    filterBy: {
                                filterType: 1,
                                query: [["", "",""]]
                    },
                    addingSort:false, addingFilter:false,
                    showSort: false, showFilter: false,
            
                });
            }
        }
    }, [notes, getView.viewName]);
    
    if(!notes[getView.viewName]){
        return <></>;
    }
    // if(globalFilter === undefined ){
    //     return <></>;
    // }
    const {count, sort, type, order, localFilter, ...rest} = notes[getView.viewName];
    const notes_arr = Object.entries(notes);
    // This maps the "views" (They're respective names). Will match and have an svg next to it
    const options = notes_arr.map((arr, i) => {
        if(arr[1].type === "table") {
            return (
            <div style={{zIndex:"9999"}} key={i} onClick={(e) => {
                e.stopPropagation();
                setView({
                    viewName: arr[0],
                    viewType: arr[1].type,
                    allViews: false, 
                    sortView:false, 
                    filterView:false,
                    sortBy:sort, 
                    filterBy: getView.filterBy,
                    addingSort:false, addingFilter:false,
                    showSort: false, showFilter: false,
            
                })
                
            }}><div className="bases-toolbar-item bases-toolbar-views" >
                    <span className="text-button-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-table"><path d="M12 3v18"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path></svg></span>
                    <span style={{paddingLeft: "10px"}} >{arr[0]}</span>
                    {/* <span className="text-button-icon mod-aux"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-chevrons-up-down"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg></span> */}
                </div>
            </div>
            )
        } else {
            return (
            <div style={{zIndex:"9999"}} key={i} onClick={(e) => {
                e.stopPropagation();
                setView({
                    viewName: arr[0],
                    viewType: arr[1].type,
                    allViews: false, 
                    sortView:false, 
                    filterView:false,
                    sortBy:sort, 
                    filterBy: getView.filterBy,
                    addingSort:false, addingFilter:false,
                    showSort: false, showFilter: false,
            
                })
                
            }}><div className="bases-toolbar-item bases-toolbar-views">
                    <span className="text-button-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-layout-grid"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></span>
                    <span style={{paddingLeft: "3px"}} >{arr[0]}</span>
                    
                </div></div>
        )
        }
    });

    // This grabs every possible value for each property
    const possibleValues = new Map<string, Set<string>>();
    Array.from(Object.entries(rest)).map((entry) => {
        
        const row = Object.keys(entry[1]);
        row.forEach((x) => {
            if(possibleValues.has(x)){
                possibleValues.get(x)?.add(entry[1][x]);
            } else {
                const data = entry[1][x];
                const set = new Set<string>;
                set.add(data);
                possibleValues.set(x, set);
            }
        })
    });
    // For the drop down, this will get properties that are not already being sorted by
    const properties =  Array.from(possibleValues.keys()).filter((s) => {
        for(const sortOrder of getView.sortBy){

            if(sortOrder.property === s){
                return false;
            } else if (s === 'title' && sortOrder.property ==='file.name') {
                return false;
            }
        }
        return true;
    });
    // These are the options that will be generated for the sort by dropdown
    const possSorts = Array.from(properties).map((x) => {
        switch(x){
            case "file.name":
                return <option value='title'>{'title'}</option>
            default:
                return <option value={x}>{x}</option>

        }
    })
    // These are the current columns being sorted by. They have ASC/DESC direction and a delete button.
    const columns  = Array.from(getView.sortBy).map((x,i) =>{
        return (<div key={i} style={{display:"flex"}} onClick={(e) =>{
                e.stopPropagation();
                setView({
                            viewName: getView.viewName,
                            viewType: getView.viewType,
                            allViews: false, sortView:false, filterView:false,
                            sortBy: getView.sortBy, filterBy: getView.filterBy,
                            addingSort:false, addingFilter:false,
                            showSort: false, showFilter: false,
                    
                        })
            }}>
            <div style={{margin:"10px"}}>
                {x.property === 'file.name' ? 'title' : x.property}
            </div>
            <div style={{margin:"10px"}} onClick={(e) =>{
                e.stopPropagation();
                let temp = getView.sortBy; 
                temp[i].direction = getView.sortBy[i].direction === "ASC" ? "DESC" : "ASC";
                setView({
                            viewName: getView.viewName,
                            viewType: getView.viewType,
                            allViews: false, sortView:false, filterView:false,
                            sortBy: temp, filterBy: getView.filterBy,
                            addingSort:false, addingFilter:false,
                            showSort: false, showFilter: false,
                    
                        })
            }}>
                {x.direction}
            </div>
            <div style={{margin:"10px"}} onClick={(e) =>{
                e.stopPropagation();
                const filt = getView.sortBy.filter((s) => s.property !== x.property);
                setView({
                            viewName: getView.viewName,
                            viewType: getView.viewType,
                            allViews: false, sortView:false, filterView:false,
                            sortBy: filt, filterBy: getView.filterBy,
                            addingSort:false, addingFilter:false,
                            showSort: false, showFilter: false,
                    
                        })
            }}>del</div>
        </div>)
    })
    // This gets all the possible attributes that all the notes in the view have.
    const filters = Array.from(possibleValues.keys()).map((x,i) =>{
        return (<option key={i} value={x}>{x}</option>)
    })
    // This is for the global filters. Will show AND or OR based on the type of filter
    const activeGlobal = globalFilter.map((x,i) => {
        if(i=== 0){
            return (<div key={i} style={{margin:"10px"}}>{x}</div>)
        } else {
            switch(getView.filterBy.filterType){
                case 1:
                    return (<div key={i} style={{margin:"10px"}}>AND {x}</div>)
                default:
                    return (<div key={i} style={{margin:"10px"}}>OR {x}</div>)
            }
            
        }
        
    });
    const activeLocal = localFilter.map((x,i) => {
        if(i=== 0){
            return (<div key={i} style={{margin:"10px"}}>{x}</div>)
        } else {
            switch(getView.filterBy.filterType){
                case 1:
                    return (<div key={i} style={{margin:"10px"}}>AND {x}</div>)
                default:
                    return (<div key={i} style={{margin:"10px"}}>OR {x}</div>)
            }
            
        }
    });
    const queryConditions = (<>
        <option value=""></option>
        <option value="is">is</option>
        <option value="is not">is not</option>
        </>
    );
    const userFilters = getView.filterBy.query.map((q,i) => {
        if(q[0] !== "" && q[1] !== "" && q[2] !== ""){
            
            const arr = [...possibleValues.get(q[0])?.values() || []];
            const allOptions = arr.map((x,j) => 
                <option style={{overflow:"hidden"}} key={j} value={x}>{x}</option>
            )
             return (<div key={i} style={{display:"flex", alignItems:"center", marginInlineEnd:"auto", margin:"10px"}} > 
                {i !== getView.filterBy.query.length -1  || getView.filterBy.query.length === 2 ? "" : (getView.filterBy.filterType === 1 ? ("AND") : ("OR"))} 
                <select key={i} onChange={(e) => {
                    e.stopPropagation();
                    getView.filterBy.query[i][0] = e.target.value;
                    getView.filterBy.query[i][2] = [...possibleValues.get(e.target.value)?.values() || []][0];
                    setView({
                       viewName: getView.viewName, viewType: getView.viewType, allViews: false, 
                       sortView:false, filterView:true, sortBy:getView.sortBy, filterBy: getView.filterBy,
                       addingSort:false, addingFilter:false, showSort: false, showFilter: false, 
                    });
                    
                }}
                 value={q[0]}>
                    {filters}
                </select>
                <select  onChange={(e) => {
                    e.stopPropagation();
                    getView.filterBy.query[i][1] = e.target.value;
                    setView({
                       viewName: getView.viewName, viewType: getView.viewType, allViews: false, 
                       sortView:false, filterView:true, sortBy:getView.sortBy, filterBy: getView.filterBy,
                       addingSort:false, addingFilter:false, showSort: false, showFilter: false, 
                    });
                }} key={i+1} value={q[1]}>
                    {queryConditions}
                </select>
                <select style={{overflow:"hidden"}} onChange={(e) => {
                    e.stopPropagation();
                    getView.filterBy.query[i][2] = e.target.value;
                    setView({
                       viewName: getView.viewName, viewType: getView.viewType, allViews: false, 
                       sortView:false, filterView:true, sortBy:getView.sortBy, filterBy: getView.filterBy,
                       addingSort:false, addingFilter:false, showSort: false, showFilter: false, 
                    });
                }} key={i+2} value={q[2]}>
                    {allOptions}
                </select>
             </div>);
        } else {
           return; 
        }
    });
    return (  
    <>    
        <div style={{paddingBottom:"5px"}}className="bases-header">	
            <div className="bases-toolbar">
                <div className="bases-toolbar-views" >
                    
                    <div className="text-button-label" onClick={(e) => {
                        e.stopPropagation();
                        setView({
                            viewName: getView.viewName,
                            viewType: type,
                            allViews: true, sortView:false, filterView:false,
                            sortBy:getView.sortBy, filterBy: getView.filterBy,
                            addingSort:false, addingFilter:false,
                            showSort: false, showFilter: false,
                    
                        })
                    }}>
                        { getView.viewType === "table" ? 
                            (<><span className="text-button-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-table"><path d="M12 3v18"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path></svg></span>
                             <span style={{paddingLeft: "3px"}}  className="text-button-label">{getView.viewName}</span></>):
                            (<>
                                <span className="text-button-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-layout-grid"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></span>
                                <span style={{paddingLeft: "3px"}}  className="text-button-label">{getView.viewName}</span>
                            </>)
                        }
                        {
                            getView.allViews && (<div style={{backgroundColor:"#000", position:"absolute", zIndex:"9999"}}>
                                {options}
                            </div>) 
                        }
                    </div>
                    
                </div>
                <div style={{paddingLeft: "10px"}} id="count" className="bases-toolbar-item bases-toolbar-res">Results: {count}</div>
                <div style={{paddingRight: "10px"}} className="text-button-label" onClick={(e) =>{
                    e.stopPropagation();
                    setView({
                            viewName: getView.viewName,
                            viewType: type,
                            allViews: false, sortView:true, filterView:false,
                            sortBy:getView.sortBy, filterBy: getView.filterBy,
                            addingSort:false, addingFilter:false,
                            showSort: false, showFilter: false,
                    
                        })
                    }
                }>Sort
                {getView.sortView && (
                    <div style={{minWidth:"200px", maxWidth:"300px",backgroundColor:"#000", position:"absolute", right:"65px"}}>
                        <div style={{display:"flex"}}>Group By: 
                        <select>{possSorts}</select>
                        </div>
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <hr style={{margin:"10px", width:"100%"}}></hr>
                            <div style={{marginInlineStart:"auto", paddingRight: "10px",backgroundColor:"#000"}} onClick={(e) => {
                            e.stopPropagation();
                            setView({
                                viewName: getView.viewName,
                                viewType: type,
                                allViews: false, sortView:false, filterView:false,
                                sortBy: [], filterBy: getView.filterBy,
                                addingSort:false, addingFilter:false,
                                showSort: false, showFilter: false,
                        
                            });
                        }}>
                            Reset Sort</div>
                        </div>
                        
                        
                        {columns}
                        {!getView.addingSort ? 
                        (<div onClick={(e) => {
                            e.stopPropagation();
                            setView({
                                viewName: getView.viewName,
                                viewType: type,
                                allViews: false, sortView:true, filterView:false,
                                sortBy: getView.sortBy, filterBy: getView.filterBy,
                                addingSort:true, addingFilter:false,
                                showSort: false, showFilter: false,
                        
                            });
                        }}>Add Sort</div >)
                        :
                        (<div style={{display:"flex"}}onClick={(e) => {
                            e.stopPropagation();
                        }}>
                            <select key={1} defaultValue="" onChange={(e) => {
                                if(e.target.value === "") return;
                                const newSort = {
                                    property: e.target.value,
                                    direction: "ASC"
                                }
                                setView({
                                    viewName: getView.viewName,
                                    viewType: type,
                                    allViews: false, sortView:true, filterView:false,
                                    sortBy:getView.sortBy === undefined ? [newSort] : [newSort, ...getView.sortBy],  filterBy: getView.filterBy,
                                    addingSort:false, addingFilter:false,
                                    showSort: false, showFilter: false,
                            
                                });
                                
                            }}>
                                {possSorts}
                            </select>
                            {/* <select>
                                <option>ASC</option>
                                <option>DESC</option>
                            </select> */}
                            </div>)
                    }
                    </div>
                )}
                </div>
                
                <div style={{paddingRight: "10px"}} className="text-button-label"  onClick={(e) =>{
                    e.stopPropagation();
                    setView({
                            viewName: getView.viewName,
                            viewType: type,
                            allViews: false, sortView:false, filterView:true,
                            sortBy:getView.sortBy, filterBy: getView.filterBy,
                            addingSort:false, addingFilter:false,
                            showSort: false, showFilter: false,
                    
                        })
                    }
                }>Filter
                {
                     getView.filterView && (<div style={{minWidth:"200px", maxWidth:"300px",backgroundColor:"#000", position:"absolute", right:"0px"}}>
                        <div style={{margin:"20px"}}>
                            The following are filters that are applied on every view for this base:
                        </div>
                        {activeGlobal}
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <hr style={{margin:"10px", width:"100%"}}></hr>
                            <div style={{marginInlineStart:"auto", paddingRight: "10px",backgroundColor:"#000"}} onClick={(e) => {
                                e.stopPropagation();
                                setView({
                                        viewName: getView.viewName,
                                        viewType: type,
                                        allViews: false, sortView:false, filterView:true,
                                        sortBy: getView.sortBy, 
                                        filterBy: {
                                            filterType: 1,
                                            query: [["","",""]]
                                        },
                                        addingSort:false, addingFilter:false,
                                        showSort: false, showFilter: false
                                    });
                                }}>
                                Reset Filters</div>

                                { !getView.addingFilter ? (
                                    <>
                                        <div style={{margin:"10px"}} >This View</div>  
                                            {activeLocal}
                                            <select style={{margin:"10px"}}  key={2} defaultValue="" onChange={(e) =>{
                                                    e.stopPropagation();
                                                    let q: Query = ["", "", ""];
                                                    let filter;
                                                    if(getView.filterBy === undefined){
                                                        filter = {
                                                            filterType: parseInt(e.target.value),
                                                            query:[q]
                                                        };
                                                    } else {
                                                        filter = {
                                                            filterType: parseInt(e.target.value),
                                                            query: [q, ...getView.filterBy.query]
                                                        }
                                                    }
                                                    setView({
                                                            viewName: getView.viewName,
                                                            viewType: type,
                                                            allViews: false, sortView:false, filterView:true,
                                                            sortBy: getView.sortBy, filterBy: filter,
                                                            addingSort:false, addingFilter:false,
                                                            showSort: false, showFilter: true
                                                        });
                                                }}>
                                                    <option value={1}>All of the following are true </option>
                                                    <option value={2}>One of the follwing are true  </option>
                                                    <option value={3}>None of the following are true    </option>
                                                </select> 
                                        <div>

                                            
                                            <div>
                                                
                                                
                                                {getView.filterBy.query.length > 1 ? (
                                                    <div>
                                                        Custom Set Filters:
                                                        {userFilters}
                                                        <hr style={{margin:"10px", width:"100%"}}></hr>
                                                    </div>) : <>&nbsp;</>}
                                                Add new filters:

                                            </div>
                                            
                                            
                                            <div>
                                                <br></br>
                                                <select key={3}  value={getView.filterBy.query[0][0]} onChange={(e) =>{
                                                    e.stopPropagation();
                                                    let queries: Query;
                                                    let filter: {
                                                        filterType:number,
                                                        query: Query[],
                                                    };
                                                    if(getView.filterBy.query.length === 0) {
                                                        queries = [e.target.value, "", ""];
                                                        getView.filterBy.query.push(queries)
                                                         filter = {
                                                            filterType: getView.filterBy.filterType,
                                                            query: getView.filterBy.query
                                                        };
                                                    } else {
                                                        queries = getView.filterBy.query[0];
                                                        queries[0] = e.target.value;
                                                        filter = {
                                                            filterType: getView.filterBy.filterType,
                                                            query: getView.filterBy.query
                                                        };
                                                    }
                                                    setView({
                                                            viewName: getView.viewName, viewType: type,
                                                            allViews: false, sortView:false, filterView:true,
                                                            sortBy: getView.sortBy, filterBy: filter,
                                                            addingSort:false, addingFilter:false,
                                                            showSort: false, showFilter: true
                                                    });
                                                }}>
                                                    <option value=""></option>
                                                    {filters}
                                                </select>
                                                <select key={4} value={getView.filterBy.query[0][1]} onChange={(e) =>{
                                                    e.stopPropagation();
                                                        let queries: Query;
                                                        let filter: {
                                                            filterType:number,
                                                            query: Query[],
                                                        };
                                                        if(getView.filterBy.query.length === 0) {
                                                            queries = ["",e.target.value, ""];
                                                            getView.filterBy.query.push(queries)
                                                            filter = {
                                                                filterType: getView.filterBy.filterType,
                                                                query: getView.filterBy.query
                                                            };
                                                        } else {
                                                            queries = getView.filterBy.query[0];
                                                            queries[1] = e.target.value;
                                                            filter = {
                                                                filterType: getView.filterBy.filterType,
                                                                query: getView.filterBy.query
                                                            };
                                                        }
                                                        setView({
                                                                viewName: getView.viewName,
                                                                viewType: type,
                                                                allViews: false, sortView:false, filterView:true,
                                                                sortBy: getView.sortBy, filterBy: filter,
                                                                addingSort:false, addingFilter:false,
                                                                showSort: false, showFilter: true
                                                        });
                                                    }}>
                                                    {queryConditions}
                                                </select>

                                                {(getView.filterBy.query[getView.filterBy.query.length-1][1] !== "" 
                                                && getView.filterBy.query[getView.filterBy.query.length-1][0] !== "") ? (
                                                    <select key={5} defaultValue="" onChange={(e) =>{
                                                        const queries: Query = getView.filterBy.query[0];
                                                        queries[2] = e.target.value;
                                                        const filter = {
                                                            filterType: getView.filterBy.filterType,
                                                            query: [ ["", "",""] as Query,
                                                            ...getView.filterBy.query
                                                            ]
                                                        };
                                                        
                                                        setView({
                                                                viewName: getView.viewName,
                                                                viewType: type,
                                                                allViews: false, sortView:false, filterView:true,
                                                                sortBy: getView.sortBy, filterBy: filter,
                                                                addingSort:false, addingFilter:false,
                                                                showSort: false, showFilter: true
                                                        });
                                                        e.target.value = "";
                                                    }}>
                                                        <option value=""></option>
                                                        { [...possibleValues.get(getView.filterBy.query[0][0])?.values() || []].map((x,i) => {
                                                            return <option key={i} value={x}>{x}</option>
                                                        })}
                                                        </select>
                                                ) : (<></>)}
                                            </div>
                                        </div>
                                    </>
                                ) 
                                :
                                 (
                                    <div></div>
                                    )

                                }
                            </div>
                        </div>)
                    }</div>
            </div>
        </div>       
    </>                                      
)
}

export default Bases;