import { useEffect, useState, useMemo } from 'react';
import Project from '../components/Project';
import "../styles/pages/projectsPage.css";


const LandingPage = () => {
  const [projects, setProjects] = useState([])
  const url = useMemo(() => {
    const newUrl = new URL('https://api.hnucamendi.net/projects');
    newUrl.searchParams.append('id', "user1234");
    newUrl.searchParams.append('project_id', "project1234");
    return newUrl;
  }, []);

  useEffect(() => {
    fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
      }
    })
      .then((response) => response.json())
      .then((data) => setProjects(data));
  }, [url])

  console.log(Object.keys(projects), projects.house_entries)
  return (
    <div className="projects-page">
      <h1>Your Projects</h1>
      {projects.house_entries.map((project) => (
        <Project key={project.id}>
          <h2>{project.address}</h2>
          <div>
            <h3>{project.notes.title}</h3>
            <p>{project.notes.note}</p>
          </div>
          <div>
            <h3>{project.scores.title}</h3>
            <p>{project.scores.score}</p>
          </div>
          <button>Select</button>
        </Project>
      ))}
    </div>
  );
};

export default LandingPage;