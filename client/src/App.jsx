import "./App.css";
import axios from "axios";
import { useState, useRef } from "react";
import FolderView from "./FolderView";

function App() {
  const [path, setPath] = useState("");
  const [folderData, setFolderData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [flode, setFlode] = useState(false);

  const cancelTokenSource = useRef(null);

  const fetchFolders = async () => {
    if (!path.trim()) {
      alert("Please enter a valid path.");
      return;
    }
    setOutput("");
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
    if (!selectedFile?.path) {
      setOutput("No file selected.");
      return;
    }

    if (loading) {
      cancelTokenSource.current?.cancel("Execution stopped by user.");
      setLoading(false);
      setOutput("Execution stopped.");
      return;
    }

    setLoading(true);
    setOutput("");

    cancelTokenSource.current = axios.CancelToken.source();
    
    console.log(cancelTokenSource.current);
    try {
      const response = await axios.post(
        "http://localhost:5000/execute-script",
        { file_path: selectedFile.path },
        {
          headers: { "Content-Type": "application/json" },
          cancelToken: cancelTokenSource.current.token,
        }
      );

      setOutput(response.data.output || response.data.error || "No output");
    } catch (error) {
      if (axios.isCancel(error)) {
        setOutput("Execution stopped.");
      } else {
        console.error("Error executing Python file:", error);
        setOutput("Execution failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="nav">
        <h1 className="hed">Test Execution GUI</h1>
        <div className="inputdev">
          <input
            type="text"
            className="pathIn"
            placeholder="Enter folder path or git URL"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
          <button className="gobtn" onClick={fetchFolders}>
            <b>Go</b>
          </button>
        </div>
        <p className="rund">
          <b>
            {selectedFile?.filename || "No file selected"}
            <button
              className="run-btn"
              onClick={executePythonFile}
              disabled={loading && !cancelTokenSource.current}
            >
              {loading ? "Stop" : "Run"}
            </button>
          </b>
        </p>
      </div>
      <div className="mainbody">
        <div className="left">
          {flode ? <h1>Loading...</h1> : (
            <FolderView folderData={folderData || {}} setSelectedFile={setSelectedFile} />
          )}
        </div>
        <div className="right">
          {selectedFile ? (
            <div className="right-1">
              <h2 className="ter-tit">Output</h2>
              <pre className="output">
                {loading ? "Running..." : output}
              </pre>
            </div>
          ) : (
            <h1 className="ter-tit">Click a Python file to select</h1>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
