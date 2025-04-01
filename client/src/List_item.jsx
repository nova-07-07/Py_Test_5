import React from "react";
import "./VirtualEnvInput.css";

const List_item = ({ items, handleDelete, handleUse, envPath }) => {
  
  return (
    <div className="ul_l">
      {items.map((item, index) => (
        <div
          className="li_l"
          style={item[1] === envPath[1] ? { backgroundColor: "burlywood"} : {}}
          key={index}
        >
          <span className="indexno">{index + 1}</span>
          <span className="name">{item[0]}</span> 
          <div className="btns">
            <button className="deletebtn" onClick={() => handleDelete(index)}>Remove</button> 
            <button className="usebtn" style={{ border: item[1] === envPath[1] ? "none" : "2px solid blue" }}  onClick={() => handleUse(item)}>{item[1] === envPath[1] ? <span className="gg"></span> : <span>Use</span>}</button>     
          </div>
        </div>
      ))}
    </div>
  );
};

export default List_item;
