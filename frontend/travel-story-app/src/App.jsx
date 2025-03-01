import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import React from 'react'

import Login from "./pages/Auth/login"
import SignUp from "./pages/Auth/signup"
import Home from "./pages/Home/home"

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/dashboard" exact element= {<Home/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App