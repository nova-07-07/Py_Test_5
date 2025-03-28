import { useState } from "react";
import "./VirtualEnvInput.css";
import List_item from "./List_item";

export default function VirtualEnvInput({ setEnvPath, setGetEnv, envPath }) {
  const [path, setPath] = useState("");
  const [items, setItems] = useState(["venv", "kenv", "menv", "oenv", "jenv"]);

  function handleSetEnvPath() {
    if (path.trim()) {
      setItems([...items, path]);
      setPath("");
    } else {
      alert("Please enter a valid path.");
    }
  }

  function handleDelete(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleUse(item) {
    setEnvPath(item); 
    setGetEnv(false);
  }

  return (
    <div className="container">
      <div className="nav">
        <h2>Virtual Environments</h2>

        <div>
          <input
            className="path_in"
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="Path to virtual env"
          />
          <button className="addBtn" onClick={handleSetEnvPath}>Add</button>
        </div>
      </div>
      <div className="bod">
        <List_item envPath={envPath} items={items} handleDelete={handleDelete} handleUse={handleUse} />
      </div>
    </div>
  );
}
