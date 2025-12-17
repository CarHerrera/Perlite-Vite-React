/* eslint-disable @typescript-eslint/no-explicit-any */
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useState, useSyncExternalStore } from "react";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { ValueOf } from "@excalidraw/excalidraw/utility-types";
import { FileId } from "@excalidraw/excalidraw/element/types";
import { DataURL, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
//import {ExcalidrawImperativeAPI} from "@excalidraw/excalidraw/types";
interface phpOutput{
  fileId: FileId,
  filePath: RequestInfo,
  extension: ValueOf<{
    readonly png: "image/png";
  }>
}
interface jsonOutput {
    jsonOutput: string,
    files: Array<phpOutput>
}

function App() {
  function getSnapshot(){
    return localStorage.getItem("drawing");
  }
  function subscribe(callback:EventListener){
    window.addEventListener('storage', callback);
    return () => {window.removeEventListener('storage',callback)};
  }
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const getDrwaing = useSyncExternalStore(subscribe, getSnapshot);
//  console.log(getDrwaing);
  console.log(excalidrawAPI);
  useEffect( () => {
    const drawCheck  = getDrwaing;
//  console.log(drawCheck);
    if (drawCheck != "f" && drawCheck != null){
      fetch(drawCheck)
            .then(response => {	
              let x = response.json();
//		console.log(x);
		return x;
            })
            .then(data => {
//	      console.log(JSON.stringify(data));
//	      console.log(JSON.parse(data['jsonOutput']));
	      const output:jsonOutput = JSON.parse(JSON.stringify(data));
		console.log(output);
              const excalJson = JSON.parse(output['jsonOutput']);
//	      console.log(excalJson);
              const files = output['files'];
              const eles = convertToExcalidrawElements(excalJson['elements']);
              const appState = excalJson['appState'];
              files.forEach((f:phpOutput)  =>{
                fetch(f['filePath'])
                .then(res => res.blob())
                .then(image => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                  if(reader.result !== null && typeof reader.result === 'string'){
                    const imageDataURL:DataURL = reader.result as DataURL;
                    if(excalidrawAPI != null) {
                      excalidrawAPI.addFiles([{
                          id: f['fileId'],
                          dataURL: imageDataURL,
                          mimeType: f['extension'],
                          created: 0
                        }]);
                      }
                    }
                  }
                  reader.readAsDataURL(image);                  
                })
              })
                if(excalidrawAPI != null) {
                  excalidrawAPI.updateScene({elements: eles, appState:appState});
                }

            })
          .catch(error => console.error('Error:', error));
    }
  });
  return (
    <>
      <div style={{height:"97vh", width:"100%"}}>
           <Excalidraw theme="dark" initialData={{scrollToContent:true}} excalidrawAPI={(api) => setExcalidrawAPI(api)} />
       </div>
    </>
  )
}

export default App
