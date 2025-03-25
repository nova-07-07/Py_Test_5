import { useState } from "react";
import './VirtualEnvInput.css'

export default function VirtualEnvInput({ setEnvPath, setGetEnv, startExecution }) {
  const [path, setPath] = useState("");

  function handleSetEnvPath() {
    if (path.trim()) {
      setEnvPath(path);
      setGetEnv(false);
      startExecution(path);
    } else {
      alert("Please enter a valid path.");
    }
  }

  return (
    <div className="container">
      <div className="input-box">
        <h2>Enter Virtual Env Path</h2>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="Path to virtual env"
        />
        <button onClick={handleSetEnvPath}>Submit</button>
      </div>
    </div>
  );
}
