import "./App.css";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import FolderView from "./FolderView";
import VirtualEnvInput from "./VirtualEnvInput.jsx";
import SettingsMenu from "./SettingsMenu";
import ReportSave from "./ReportSave.jsx";
import ReportShow from "./ReportShow.jsx";
import './Dashboard.css'
import DisplayArguments from "./DisplayArguments.jsx";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const navigate = useNavigate();
  const [path, setPath] = useState("https://github.com/praveen-16-16/Python_Pytest");
  const [folderData, setFolderData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [flode, setFlode] = useState(false);
  const [getenv, setGetEnv] = useState(false);
  const [showReportSave ,SetShowReportSave] = useState(false);
  const [showReportShow ,SetShowReportShow] = useState(false);
  const [envpath, setEnvPath] = useState("");
  const cancelTokenSource = useRef(null);
  const [disBlack , setDisplayBlack] = useState(false);
  const [testType , setTestType] = useState("python");
  const [settingExit , setSettingExit] = useState(false);
  const [argObject , setArgObj] = useState([]);
  const [displayArgComp , setDisplayArgComp] = useState(false);
  const [argArray , setArgArray] = useState([]);
  const [argInputs , setArgInput] = useState([])

  function backgroundSelect() {
        SetShowReportSave(false);
        SetShowReportShow(false);
        setGetEnv(false);
        setDisplayBlack(false)
        setSettingExit(false);
        setDisplayArgComp(false);
  }

  useEffect(()=>{
    if (!selectedFile?.path) {
      setOutput("Select File and click Run");
    }else {
      setOutput("Click Run to run the selected file.")
    }
    
  },[envpath])

  useEffect(()=>{
    
    
  },[settingExit])

  const fetchFolders = async () => {
    if (!path.trim()) {
      alert("Please enter a valid path.");
      return;
    }

    

    setOutput("");
    setArgObj([]);
    setArgArray([]);
    setArgInput([]);
    setFlode(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:5000/get-folder?path=${encodeURIComponent(path)}&testType=${encodeURIComponent(testType)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(testType);
      

      setFolderData(response.data);
      
      function findConftestPaths(obj) {
        let result = [];
    
        function traverse(node) {
            if (!node || !node.items) return;
            
            for (let item of node.items) {
                if (!item.isfolder && item.name === "conftest.py") {
                    result.push(item.path);
                } else if (item.isfolder) {
                    traverse(item);
                }
            }
        }
        
        traverse(obj);
        return result;
    }
    
    setArgObj(findConftestPaths(response.data));
    } catch (error) {
      console.error("Error fetching folders:", error);

      if (error.response?.status === 401) {
        alert("Unauthorized access! Please log in again.");
        localStorage.removeItem("token"); 
        navigate("/")
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
      setGetEnv(true); // Show VirtualEnvInput
      setDisplayBlack(true);
      return;
    }
  
    if (argObject.length !== 0) {
      let Argpath = null;
  
      for (const element of argObject) {
        if (element.replace(/\\conftest\.py$/, '') === selectedFile.path.replace(/\\[^\\]*\.py$/, '')) {
          try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
              "http://localhost:5000/chech_arg",
              { path: element },
              { headers: { Authorization: `Bearer ${token}` } }
            );
  
            Argpath = element;
            setArgArray(response.data);
          } catch (error) {
            console.error("Execution error", error);
          }
        }
      }
  
      if (Argpath) {
        setDisplayArgComp(true);
        return;
      }
    }
    startExecution(envpath);
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
    if (testType == "e") {
      alert("please enter test type");
      return;
    }
    cancelTokenSource.current = axios.CancelToken.source();

    try {
      const token = localStorage.getItem("token");
      const args = argObject !== 0 ? argInputs : {};  
      const response = await axios.post(
        "http://localhost:5000/execute-script",
        { file_path: selectedFile.path, env_path: envPath ,testType : testType ,arg: args},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cancelToken: cancelTokenSource.current.token,
        }
      );

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
     <div 
      style={{ opacity: disBlack ? 0.2 : 1 }} 
      onClick={() => {
        if (disBlack) {
          backgroundSelect();
        }
      }}
    >

        <div className="nav">
        <div className="nav_one" style={{ display: "flex" }}>
            <span className="hed">Test Execution GUI</span>
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
          </div>
          <div className="nav_two">
            <b className="run_set"> 
              <div>
                  <span className="hee">{selectedFile?.filename || "No file selected"}</span>
                <button
                  className="run-btn"
                  onClick={executePythonFile}
                  disabled={loading && !cancelTokenSource.current}
                >
                  {loading ? "Stop" : "Run"}
                </button>
              </div>
              
              <SettingsMenu 
                SetShowReportSave={SetShowReportSave} 
                setGetEnv={setGetEnv} 
                SetShowReportShow={SetShowReportShow} 
                setDisplayBlack={setDisplayBlack} 
                setTestType={setTestType}
                SetDisplayBlack={setDisplayBlack}
                setSettingExit={setSettingExit}
                settingExit={settingExit}
              />
            </b>
            </div>
        </div>

        <div className="mainbody" onClick={() => {
          if(settingExit){
          backgroundSelect()
          }
        }}>
          <div className="left">
            {flode ? <h1>Loading...</h1> : <FolderView folderData={folderData || {}} setSelectedFile={setSelectedFile} />}
          </div>
          <div className="right">
            {selectedFile ? (
              <div className="right-1">
                <h2 className="ter-tit">Output</h2>
                <pre className="output">
                  {loading ? "Running..." : `${output}`}
                </pre>
              </div>
            ) : (
              <h1 className="ter-tit">Click a Python file to select</h1>
            )}
          </div>
        </div>
      </div>

      {getenv && <VirtualEnvInput setEnvPath={setEnvPath} setGetEnv={setGetEnv} envPath={envpath} backgroundSelect={backgroundSelect} />}
      {showReportSave && <ReportSave SetShowReportSave={SetShowReportSave} output={output} backgroundSelect={backgroundSelect}/>}
      { showReportShow && <ReportShow /> }
      { displayArgComp && <DisplayArguments argArray={argArray} setArgInput={setArgInput} argInputs={argInputs} startExecution={startExecution} envpath={envpath} setDisplayArgComp={setDisplayArgComp} setDisplayBlack={setDisplayBlack}/>}
    </>
  );
}

export default Dashboard;
