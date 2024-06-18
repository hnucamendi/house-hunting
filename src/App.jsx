import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import CriteriaConfigPage from './pages/CriteriaConfigPage';
import CalculationPage from './pages/CalculationPage';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <h1>House Rating App</h1>
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/project/:id/configure" element={<CriteriaConfigPage />} />
          <Route path="/project/:id/calculate" element={<CalculationPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
