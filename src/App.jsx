import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import CriteriaConfigPage from './pages/CriteriaConfigPage';
import CalculationPage from './pages/CalculationPage';
import './index.css';
import outputs from '/amplify_outputs.json';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs)

const App = () => {
  return (
    <Authenticator>
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
    </Authenticator>
  );
};

export default App;
