import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
// import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
// import { DataURL, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

function App() {

  return (
    <>
      <div style={{height:"95vh", width:"100%"}}>
           <Excalidraw theme="dark"  />
       </div>
    </>
  )
}

export default App
