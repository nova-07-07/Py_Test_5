import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Home_page.css'

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [envPath, setEnvPath] = useState([]);
  const [usedPath , setUsedPath] = useState([]);
  const navigate = useNavigate();

  const fetchUsedpath = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Something is wrong. Please login again.");
      navigate("/signin");
      return;
    }
  
    try {
      const response = await axios.get("http://localhost:5000/get-used-paths", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.used_paths && response.data.used_paths.length > 0) {
        setUsedPath(response.data.used_paths);
      } else {
        setUsedPath(["No paths used yet."]);
      }
    } catch (error) {
      console.error("Error fetching used paths:", error);
  
      if (error.response && error.response.status === 401) {
        alert("Session expired or invalid. Please log in again.");
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }
  
      setUsedPath(["Error fetching used paths."]);
    }
  };
  
  

  const fetchEnvPaths = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get("http://localhost:5000/get-env-paths", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.env_paths) {
        const paths = response.data.env_paths.map((path) => [path.split(/[\\/]/).pop(), path]);
        setItems(paths);
      }
    } catch (err) {
      console.error("Error fetching environment paths:", err);
    }
  };

  useEffect(() => {
    fetchUsedpath();
    fetchEnvPaths();
  }, []);

  function handleDashGo() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized access! Please log in again.");
      navigate("/signin");
    }
    navigate("/dashboard");
  }

  return (
    <div className="home_page_All">
      <div className="home_page_nav">
        <button className="DashGoBtn" onClick={()=>{handleDashGo()}}>Go to Dashboard</button>
      </div>
      <div className="home_page_body">
        <div className="home_page_URL_DIV">
          {usedPath.map((path, index) => (
                <div
                  className="home_page_li_l_path"
                  key={index}
                >
                  <span className="home_page_indexno">{path}</span>
                </div>
              ))}
        </div>
        <div className="home_page_env">
          <h2><b>Your Environments</b></h2>
          <div className="home_page_ul_l">
            {items.map((item, index) => (
              <div
                className="home_page_li_l"
                key={index}
                style={item[1] === envPath[1] ? { backgroundColor: "burlywood" } : {}}
              >
                <span className="home_page_indexno">{index + 1}.</span>
                <span className="home_page_name">{item[0]}</span>
                
              </div>
            ))}
          </div>
          </div>
      </div>
      
    </div>
  );
};

export default HomePage;
