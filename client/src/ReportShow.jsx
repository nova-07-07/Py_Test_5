import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './ReportShow-new.css';
import downlode from '../public/downlode.png'

const ReportShow = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [content, setContent] = useState("Report Body Content");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [itemName , setItemName ] = useState(null);

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

    const handleDownload = () => {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `report-${itemName}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            position: "fixed",
            top: "10%",
            left: "10%",
            right: "10%",
            bottom: "10%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80vw",
            height: "80vh",
            color: "black",
            pointerEvents: "auto",
            backgroundColor: "rgb(230, 230, 230)",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.7)",
            outline: 0,
            overflow: "auto",
            padding: "0px",
        }}>
            <div className="sidebar">
                <h1 className="top_bar">
                    Reports{" "}
                    <input
                        className="ml-2 p-1 border rounded iiiinpu"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        type="text"
                        placeholder="Search..."
                    />
                </h1>
                {filteredItems.length !== 0 ? (
                    filteredItems.map((item, index) => (
                        <div
                            key={index}
                            className="sidebar_item"
                            onClick={() =>{ setContent(item.file_data);setItemName(item.file_name)}}
                        >
                            {item.file_name || `Report ${index + 1}`}
                        </div>
                    ))
                ) : (
                    <div className="p-2 h-10 border-b border-gray-600">No Reports Found</div>
                )}
            </div>

            <div className="save_r_body">
                <div className="save_r_body_nav">
                <button title={`Download report- ${itemName}.txt`} onClick={handleDownload} className="download_btn imgBtn">
                    {itemName && <img src={downlode} alt="Download" className="download_icon" />}
                </button>   
                </div>
                <div className="body_content">
                    <pre>{content}</pre>
                </div>
            </div>
            
        </div>
    );
};

export default ReportShow;
