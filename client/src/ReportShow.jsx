import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ReportShow.css";

const ReportShow = () => {
    const [items, setItems] = useState([]); 
    const [filteredItems, setFilteredItems] = useState([]); 
    const [content, setContent] = useState("Report Body Content");
    const [searchQuery, setSearchQuery] = useState(""); 
    const navigate = useNavigate();

    function eLog() {
        alert("Something is wrong, please login again");
        navigate("/signin");
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
                setFilteredItems(response.data.reports); 
            } catch (error) {
                console.error("Error fetching reports:", error);
                setContent("Error fetching reports: " + (error.response?.data?.message || error.message));
                eLog();
            }
        };

        fetchReports();
    }, []);

    function handleSearch(value) {
        setSearchQuery(value);
        if (value === "") {
            setFilteredItems(items); 
        } else {
            const filtered = items.filter(item =>
                (item.file_name || "").toLowerCase().includes(value.toLowerCase()) 
            );
            setFilteredItems(filtered);
        }
    }

    return (
        <div className="main_container">
            <div className="sidebar">
                <h1 className="top_bar">
                    Reports <input value={searchQuery} onChange={(e) => handleSearch(e.target.value)} type="text" placeholder="Search..." />
                </h1>
                {filteredItems.length !== 0 ? (
                    filteredItems.map((item, index) => (
                        <div key={index} className="sidebar_item" onClick={() => setContent(item.file_data)}>
                            {item.file_name || `Report ${index + 1}`}
                        </div>
                    ))
                ) : (
                    <div className="sidebar_item">No Reports Found</div>
                )}
            </div>
            <div className="body_content"><pre>{content}</pre></div>
        </div>
    );
};

export default ReportShow;
