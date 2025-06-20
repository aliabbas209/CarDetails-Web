import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyGrid from "./components/DataGridTable";
import CarDetails from "./components/CarDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MyGrid />} />
        <Route path="/details/:id" element={<CarDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
