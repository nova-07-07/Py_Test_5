import "./App.css";
import axios from "axios";
import { useState, useRef } from "react";
import FolderView from "./FolderView";
import VirtualEnvInput from "./VirtualEnvInput.jsx";
import SettingsMenu from "./SettingsMenu";

function Dashboard() {
  const [path, setPath] = useState("");
  const [folderData, setFolderData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [flode, setFlode] = useState(false);
  const [getenv, setGetEnv] = useState(false);
  const [envpath, setEnvPath] = useState("");
  const cancelTokenSource = useRef(null);

  const fetchFolders = async () => {
    if (!path.trim()) {
      alert("Please enter a valid path.");
      return;
    }

    setOutput("");
    setFlode(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:5000/get-folder?path=${encodeURIComponent(path)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFolderData(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);

      if (error.response?.status === 401) {
        alert("Unauthorized access! Please log in again.");
        localStorage.removeItem("token"); // Remove invalid token
        setFolderData("UNAUTHORIZED");
      } else {
        setFolderData(null);
      }
    }

    setFlode(false);
  };

  const executePythonFile = async () => {
    if (!selectedFile?.path) {
      setOutput("No file selected.");
      return;
    }

    if (!envpath) {
      setGetEnv(true);
    } else {
      startExecution(envpath);
    }
  };

  const startExecution = async (envPath) => {
    if (!envPath) {
      setOutput("No virtual environment path provided.");
      return;
    }

    setEnvPath(envPath);
    setGetEnv(false);

    if (loading) {
      cancelTokenSource.current?.cancel("Execution stopped by user.");
      setLoading(false);
      setOutput("Execution stopped.");
      return;
    }

    setLoading(true);
    setOutput("");

    cancelTokenSource.current = axios.CancelToken.source();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/execute-script",
        { file_path: selectedFile.path, env_path: envPath },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cancelToken: cancelTokenSource.current.token,
        }
      );

      console.log("Execution response", response.data);
      setOutput(response.data.stdout || response.data.stderr || "No output");
    } catch (error) {
      console.error("Execution error", error);

      if (error.response?.status === 401) {
        alert("Unauthorized access! Please log in again.");
        localStorage.removeItem("token");
        setOutput("UNAUTHORIZED");
      } else {
        setOutput("Execution failed: " + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ opacity: getenv ? 0.2 : 1 }} onClick={() => getenv && setGetEnv(false)}>
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

          {/* <p className="rund">
            <div>
              <span className="epath" onClick={() => setGetEnv(true)}>
                Env_Path: {envpath || "Click to set"}
              </span>
            </div>
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
          </p> */}
            <b className="run_set"> 
              <span className="hee">{selectedFile?.filename || "No file selected"}</span>
              <button
                className="run-btn"
                onClick={executePythonFile}
                disabled={loading && !cancelTokenSource.current}
              >
                {loading ? "Stop" : "Run"}
              </button>
              <SettingsMenu setGetEnv={setGetEnv}/>
            </b>
          
        </div>

        <div className="mainbody">
          <div className="left">
            {flode ? <h1>Loading...</h1> : <FolderView folderData={folderData || {}} setSelectedFile={setSelectedFile} />}
          </div>
          <div className="right">
            {selectedFile ? (
              <div className="right-1">
                <h2 className="ter-tit">Output</h2>
                <pre className="output">{loading ? "Running..." : output}</pre>
              </div>
            ) : (
              <h1 className="ter-tit">Click a Python file to select</h1>
            )}
          </div>
        </div>
      </div>

      {getenv && <VirtualEnvInput setEnvPath={startExecution} setGetEnv={setGetEnv} envPath={envpath}/>}
    </>
  );
}

export default Dashboard;
