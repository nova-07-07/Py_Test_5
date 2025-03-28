import React from "react";
import "./VirtualEnvInput.css";

const List_item = ({ items, handleDelete, handleUse, envPath }) => {
  return (
    <div className="ul_l">
      {items.map((item, index) => (
        <div
          className="li_l"
          style={item === envPath ? { backgroundColor: "burlywood"} : {}}
          key={index}
        >
          <span className="indexno">{index + 1}</span>
          <span className="name">{item}</span>
          <div>
            <button className="usebtn" onClick={() => handleUse(item)}>Use</button> 
            <button className="deletebtn" onClick={() => handleDelete(index)}>Remove</button>     
          </div>
        </div>
      ))}
    </div>
  );
};

export default List_item;
