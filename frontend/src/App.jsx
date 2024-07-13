import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/public/Login.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import HousePage from "./pages/HousePage.jsx";
import Confirm from "./pages/public/Confirm.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PropTypes from "prop-types";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const App = () => {
  const theme = createTheme({
    palette: {
      background: {
        paper: '#fff',
      },
      text: {
        primary: '#173A5E',
        secondary: '#46505A',
      },
      action: {
        active: '#001E3C',
      },
      success: {
        main: '#009688',
      },
    },
  });


  const isAuthenticated = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    return !!accessToken;
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
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
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <HousePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

App.propTypes = {
  children: PropTypes.node,
};

export default App;
