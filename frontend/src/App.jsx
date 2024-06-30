import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/public/Login.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import Confirm from "./pages/public/Confirm.jsx";
import './index.css';

const App = () => {
    const isAuthenticated = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    return !!accessToken;
  };
  
    return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate replace to="/projects" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route
          path="/home"
          element={
            isAuthenticated() ? <ProjectsPage /> : <Navigate replace to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
