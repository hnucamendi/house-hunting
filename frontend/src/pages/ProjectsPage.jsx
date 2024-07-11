import { useEffect, useState } from 'react';
import { useSessionCheck } from '../utils/authService';
import CreateProjectModal from '../components/CreateProjectModal';
import Project from '../components/Project';
import "../styles/pages/projectsPage.css";


const LandingPage = () => {
  useSessionCheck();
  const [userData, setUserData] = useState(null)
  const [uploadProjectCount, setUploadProjectCount] = useState(0)
  const [hideCreateProject, setHideCreateProject] = useState(true)
  const url = "https://api.hnucamendi.net/projects"

  useEffect(() => {
    fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === "No projects found") {
          setUserData(null)
          return
        }
        setUserData(data)
        return
      });
  }, [url, uploadProjectCount])

  const handleShow = () => setHideCreateProject(false)
  const handleHide = () => setHideCreateProject(true)

  const handleCreateProject = (title, description, criteria) => {
    if (title === "" || description === "" || criteria.length === 0) {
      alert("Please fill out all fields")
      return
    }

    try {
      fetch('https://api.hnucamendi.net/project', {
        method: "POST",
        body: JSON.stringify({
          project: {
            title: title,
            description: description,
            criteria: criteria,
          }
        }),
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
        }
      }).then(() => setUploadProjectCount(uploadProjectCount + 1))
    } catch (error) {
      console.error(`Error creating project: ${error}`)
    }
  }

  if (userData !== null && userData.length > 0) {
    return (
      <div>
        <h1>Your Projects</h1>
        <button
          onClick={() => setHideCreateProject(!hideCreateProject)}>
          Create New Project
        </button>
        {
          hideCreateProject ? null :
            <CreateProjectModal
              handleShow={handleShow}
              handleHide={handleHide}
              handleCreateProject={handleCreateProject}
            />
        }
        <div className="projects-page">
          <div>
            {userData.map((p, i) => (
              <Project key={userData?.projectId || i}>
                <p>{p.project.title}</p>
                <pe>{p.project.description}</pe>
                <button href={`/projects/${p.projectId}`}>View Project</button>
              </Project>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (userData === null) {
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

  return (
    <div className="projects-page">
      <h1>Loading...</h1>
    </div>
  )
};

export default LandingPage;