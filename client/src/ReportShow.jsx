import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ReportShow.css";

const ReportShow = () => {
    const [items, setItems] = useState([]);
    const [content, setContent] = useState("Report Body Content");
    const navigate = useNavigate();

    function eLog() {
        alert("something is wrong please login again")
        navigate("/signin")
    }

    useEffect(() => {
        const fetchReports = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await axios.get("http://localhost:5000/get-user-reports", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });


                setItems(response.data.reports);
            } catch (error) {
                console.error("Error fetching reports:", error);
                setContent("Error fetching reports: " + (error.response?.data?.message || error.message));
                 eLog();
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="main_container">
            <div className="sidebar">
                <h1>Reports</h1>
                {items.length !== 0 ? (
                    items.map((item, index) => (
                        <div key={index} className="sidebar_item" onClick={()=>{setContent(item.file_data)}}>
                            {item.file_name || `Report ${index + 1}`}
                        </div>
                    ))
                ) : (
                    <div className="sidebar_item">No Reports Available</div>
                )}
            </div>
            <div className="body_content"><pre>{content}</pre></div>
        </div>
    );
};

export default ReportShow;
