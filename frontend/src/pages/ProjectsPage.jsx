import { useEffect, useState } from 'react';
import Project from '../components/Project';
import "../styles/pages/projectsPage.css";


const LandingPage = () => {
  const [projects, setProjects] = useState([])
  const url = new URL('http://api.hnucamendi.net/projects')
  url.searchParams.append('id', "1234")
  url.searchParams.append('project_id', "1234")

  
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
  })

  console.log({projects})

  return (
    <div className="projects-page">
      <h1>Your Projects</h1>
      {projects.map((project) => (
        <Project key={project.id}>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <button>Select</button>
        </Project>
      ))}
    </div>
  );
};

export default LandingPage;