// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Home from './pages/Home';
import Hotels from "./pages/Hotels"
import Restaurant from './pages/Restaurant'
import './index.css';   // optional – global styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/restaurants" element={<Restaurant />} />
      </Routes>
    </Router>
  );
}

export default App;