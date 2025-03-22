import React, { useState } from "react";

function FolderView({ folderData, setSelectedFile }) {
  const [isOpen, setOpen] = useState(false);

  if (!folderData || !folderData.items) {
    return <p style={{ fontSize: "18px" }}>No items found in this folder.</p>;
  }

  return (
    <div style={{ cursor: "pointer", fontSize: "20px" }}>
      <h3 onClick={() => setOpen(!isOpen)} style={{ fontSize: "22px" }}>
        {"📂"} {folderData.name}
      </h3>
      {isOpen && (
        <ul style={{ marginLeft: "25px" }}>
          {folderData.items.map((item, index) => (
            <li key={index} style={{ listStyleType: "none", display: "flex", alignItems: "center", marginBottom: "8px" }}>
              {item.isfolder ? (
                <FolderView folderData={item} setSelectedFile={setSelectedFile} /> 
              ) : (
                <>
                  <img
                    src="/pythonImg.png"
                    alt="File Icon"
                    style={{ width: "30px", height: "30px", marginRight: "10px", cursor: item.name.endsWith(".py") ? "pointer" : "default" }}
                    onClick={() => item.name.endsWith(".py") && setSelectedFile({ filename: item.name, path: item.path })}
                  />
                  <span
                    onClick={() => item.name.endsWith(".py") && setSelectedFile({ filename: item.name, path: item.path })}
                    style={item.name.endsWith(".py") ? { color: "blue", textDecoration: "underline", cursor: "pointer" } : {}}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FolderView;
  