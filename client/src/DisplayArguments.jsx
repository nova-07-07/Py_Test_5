import React, { useEffect, useState } from "react";
import "./DisplayItems.css"; 

const DisplayArguments = () => {
  const [items, setItems] = useState([]);
  const [values, setValues] = useState([]);

  useEffect(() => {
    const res = ["arg1--", "arg2--", "arg3--", "arg4--"];
    setItems(res);
    setValues(res.map((val) => [val, ""]));
  }, []);

  function handleChange(index, val) {
    setValues((prevValues) =>
      prevValues.map((item, i) => (i === index ? [item[0], val] : item))
    );
  }

  return (
    <div className="main_container">
      <div className="nav_arg">
        <h2 className="tt-Arg">Arguments</h2>
        <button className="uBtn">Use</button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="item">
          {item}
          <h1>:</h1>
          <input
            className="input_val"
            type="text"
            value={values[index]?.[1] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayArguments;
