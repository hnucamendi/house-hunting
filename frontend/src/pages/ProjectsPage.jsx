import Project from '../components/Project';
import "../styles/pages/projectsPage.css";

const LandingPage = () => {
  return (
    <div className="projects-page">
      <h1>Your Projects</h1>
      <Project>
        <h2>Title</h2>
        <p>Description</p>
        <button>Select</button>
      </Project>
    </div>
  );
};

export default LandingPage;