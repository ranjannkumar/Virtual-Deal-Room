import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Home = () => <h1>Welcome to Virtual Deal Room</h1>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
