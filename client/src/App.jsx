import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import "./Authentication.css"

function Home() {
    return (
        <div className="well-container" >
            <h1 className="test hee">welcom to Test Execution GUI
            </h1>
            <div className="mt-5">
                <Link to="/signin" className="btn">Sign In</Link>
                <Link to="/signup" className="btn">Sign Up</Link>
            </div>
        </div>
    );
}

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: email, password: password }),
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            navigate("/dashboard");
        } else {
            alert("Invalid credentials");
        }
    } catch (error) {
        
        alert("Network error, please try again later");
    }
};


  return (
      <div className="auth-container">
          <h1>Sign In</h1>
          <form onSubmit={handleSubmit}>
              <input type="email" style={{color: "black"}} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" style={{color: "black"}} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit">Sign In</button>
          </form>
          <Link to="/signup">Don't have an account? Sign Up</Link>
      </div>
  );
}


function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); 
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
  
      try {
        await axios.post("http://localhost:5000/signup", { name,  email, password }, 
          { headers: { "Content-Type": "application/json" } }
        );
        navigate("/signin");
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setError("User already exists! Please sign in.");
        } else {
          setError("Signup failed. Please try again.");
        }
      }
    };
  
    return (
      <div className="auth-container">
        <h1>Sign Up</h1>
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error if any */}
        <form onSubmit={handleSubmit}>
          <input type="text" style={{color: "black"}} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" style={{color: "black"}} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" style={{color: "black"}} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Sign Up</button>
        </form>
        <Link to="/signin">Already have an account? Sign In</Link>
      </div>
    );
  }
  

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
