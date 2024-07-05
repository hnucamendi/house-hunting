import { useEffect, useState, useMemo } from 'react';
import CreateProjectModal from '../components/CreateProjectModal';
import Project from '../components/Project';
import "../styles/pages/projectsPage.css";


const LandingPage = () => {
  const [projects, setProjects] = useState([])
  const [uploadProjectCount, setUploadProjectCount] = useState(0)
  const [hideCreateProject, setHideCreateProject] = useState(true)

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
  }, [url, uploadProjectCount])

  const handleShow = () => setHideCreateProject(false)
  const handleHide = () => setHideCreateProject(true)

  const handleCreateProject = (e) => {
    try {
      fetch('https://api.hnucamendi.net/projects', {
        method: "POST",
        body: JSON.stringify({
          projects: [
            {
              title: e.projectTitle,
              description: e.projectDescription,
              criteria: e.projectCriteria,
              houseEntries: [],
            }
          ]
        }),
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
        }
      })

      setUploadProjectCount(uploadProjectCount + 1)
    } catch (error) {
      console.error(`Error creating project: ${error}`)
    }
  }

  if (projects.length > 0) {
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
  }

  if (!projects.house_entries) {
    return (
      <div className="projects-page">
        <h1>Uh Oh ... You dont have any projects yet!</h1>
        <button onClick={() => setHideCreateProject(!hideCreateProject)}
        >
          Create Project
        </button>
        {
          hideCreateProject ? null :
            <CreateProjectModal
              handleShow={handleShow}
              handleHide={handleHide}
              handleCreateProject={handleCreateProject}
            />
        }
      </div>
    )
  }
};

export default LandingPage;