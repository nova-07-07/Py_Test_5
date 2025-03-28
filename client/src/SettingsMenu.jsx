import { useState } from "react";
import "./SettingsMenu.css";

export default function SettingsMenu({setGetEnv}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [testSettingsOpen, setTestSettingsOpen] = useState(false);
  const [testType, setTestType] = useState("java");

  return (
    <div className="settings-container">
      {!menuOpen && (
        <button className="settings-button" onClick={() => setMenuOpen(!menuOpen)}>
          ⚙️
        </button>
      )}
      
      {menuOpen && !testSettingsOpen && (
        <><button className="settings-button" onClick={() => {setMenuOpen(!menuOpen);setTestSettingsOpen(false)}}>
        ⚙️
      </button>
        <div className="menu-container">
          <ul>
            <li><button className="btn_select" onClick={() => alert('Login Clicked')}>Login</button></li>
            <li><button className="btn_select" onClick={() => alert('Logout Clicked')}>Logout</button></li>
            <li><button className="btn_select" onClick={() => setTestSettingsOpen(true)}>Test Settings</button></li>
          </ul>
        </div></>
      )}
      
      {menuOpen && testSettingsOpen && (<div >
        <button className="settings-button" onClick={() => {setMenuOpen(!menuOpen);setTestSettingsOpen(false)}}>
          ⚙️
        </button>
        <div className="left-nav-con">
        <div className="test-settings-container">
          <button className="back-button" onClick={() => setTestSettingsOpen(false)}>← Back</button>
          <div>
            <button className="btn_select" onClick={()=>{setGetEnv(true);setMenuOpen(!menuOpen);setTestSettingsOpen(false)}} >Environment</button>
          </div>
          <div>
            <label className="test_type_lab ">Test Type</label>
            <select className="dropdown" value={testType} onChange={(e) => setTestType(e.target.value)}>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cucumber">Cucumber</option>
            </select>
          </div></div>
        </div></div>
      )}
    </div>
  );
}
