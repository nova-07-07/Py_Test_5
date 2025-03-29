import { useState } from "react";
import "./SettingsMenu.css";
import { useNavigate } from "react-router-dom";

export default function SettingsMenu({setGetEnv , SetShowReportSave , SetShowReportShow , setDisplayBlack}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [testSettingsOpen, setTestSettingsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [testType, setTestType] = useState("java");

  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token"); 
      } 
      navigate("/");
    } catch (error) {
      alert("Network error, please try again.");
    }
  };


  return (
    <div className="settings-container">
      {!menuOpen && (
        <button className="settings-button" onClick={() => setMenuOpen(!menuOpen)}>
          ⚙️
        </button>
      )}
      
      {menuOpen && !testSettingsOpen &&!reportsOpen && (
        <><button className="settings-button" onClick={() => {setMenuOpen(!menuOpen);setTestSettingsOpen(false)}}>
        ⚙️
      </button>
        <div className="menu-container">
          <ul>
            <li><button className="btn_select" onClick={()=>{localStorage.removeItem("token");navigate("/SignIn")}} >Login</button></li>
            <li><button className="btn_select" onClick={handleLogout}>Logout</button></li>
            <li><button className="btn_select" onClick={() => setTestSettingsOpen(true)}>Test Settings</button></li>
            <li><button className="btn_select" onClick={() => setReportsOpen(true)}>Reports</button></li>
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
            <button className="btn_select" onClick={()=>{setGetEnv(true);setMenuOpen(!menuOpen);setTestSettingsOpen(false);setDisplayBlack(true)}} >Environment</button>
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

      {
        menuOpen && reportsOpen && (<div >
          <button className="settings-button" onClick={() => {setMenuOpen(!menuOpen);setTestSettingsOpen(false)}}>
            ⚙️
          </button>
          <div className="left-nav-con">
          <div className="test-settings-container">
            <button className="back-button" onClick={() => setReportsOpen(false)}>← Back</button>
            <div>
              <button className="btn_select" onClick={()=>{SetShowReportSave(true);setMenuOpen(!menuOpen);setTestSettingsOpen(false);setReportsOpen(false); setDisplayBlack(true)}} >Save Reports</button>
              </div>
            <div>
              <button className="btn_select" onClick={()=>{SetShowReportShow(true);;setMenuOpen(!menuOpen);setTestSettingsOpen(false);setReportsOpen(false);setDisplayBlack(true)}} >Show Reports</button>
            </div></div>
          </div></div>
        )
      }
    </div>
  );
}
