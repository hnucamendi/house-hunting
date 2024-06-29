import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/ProjectsPage';
import Criteria from './pages/Criteria';
import Rating from './pages/Rating';
import Nav from './components/Nav';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/house-criteria" element={<Criteria />} />
          <Route path="/house-ratings" element={<Rating />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
