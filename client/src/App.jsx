import "./App.css";
import axios from "axios";
import { useState } from "react";
import FolderView from "./FolderView";

function App() {
  const [path, setPath] = useState("");
  const [folderData, setFolderData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false); 
  const [flod , setFlode] = useState(false)

  const fetchFolders = async () => {
    if (!path.trim()) {
      alert("Please enter a valid path.");
      return;
    }
    setFlode(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/get-folder?path=${encodeURIComponent(path)}`
      );
      setFolderData(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      setFolderData(null);
    }
    setFlode(false);
  };

  const executePythonFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setOutput(""); 

    try {
      const response = await axios.post(
        "http://localhost:5000/execute-script",
        { file_path: selectedFile.path },
        { headers: { "Content-Type": "application/json" } }
      );

      setOutput(response.data.output || response.data.error || "No output");
    } catch (error) {
      console.error("Error executing Python file:", error);
      setOutput("Execution failed.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
      <div className="nav">
        <h1 className="hed">Execute Python File</h1>
        <div className="inputdev">
          <input
            type="text"
            className="pathIn"
            placeholder="Enter folder path or git url"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
          <button className="gobtn" onClick={fetchFolders}>
            <b>Go</b>
          </button>
        </div>
      </div>
      <div className="mainbody">
         <div className="left">
        {flod ? <h1>Loding...</h1>:
       
          <FolderView folderData={folderData} setSelectedFile={setSelectedFile} />
        }</div>
        <div className="right">
          {selectedFile ? (
            <>
              <div className="right-1">
                <div className="ter">
                  <h2 className="ter-tit">Output</h2>
                  <pre className="output">
                    {loading ? "Running..." : output}
                  </pre>
                </div>
              </div>
              <div className="rundev">
                <p>
                  <b>
                    {selectedFile.filename}
                    <button
                      className="run-btn"
                      onClick={executePythonFile}
                      disabled={loading} 
                    >
                      {loading ? "Running..." : "Run"} 
                    </button>
                  </b>
                </p>
              </div>
            </>
          ) : (
            <h1 className="ter-tit">Click a Python file to select</h1>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
