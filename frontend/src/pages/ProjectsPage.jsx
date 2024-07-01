import { useEffect, useState, useMemo } from 'react';
// import Project from '../components/Project';
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
      .then((data) => console.log({data}));
  }, [url])

  return (
    <div className="projects-page">
      <h1>Your Projects</h1>
      {/* {projects.map((project) => (
        <Project key={project.id}>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <button>Select</button>
        </Project>
      ))} */}
    </div>
  );
};

export default LandingPage;