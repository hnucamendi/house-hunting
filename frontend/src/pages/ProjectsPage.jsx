import { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Container,
} from 'react-bootstrap';
import CreateProjectModal from '../components/CreateProjectModal';
import Project from '../components/Project';
import "../styles/pages/projectsPage.css";


const LandingPage = () => {
  const [userData, setUserData] = useState([])
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
      .then((response) => response.json())
      .then((data) => setUserData(data));
  }, [url, uploadProjectCount])

  const handleShow = () => setHideCreateProject(false)
  const handleHide = () => setHideCreateProject(true)

  const handleCreateProject = (e) => {
    if (e.projectTitle === "" || e.projectDescription === "" || e.projectCriteria.length === 0) {
      alert("Please fill out all fields")
      return
    }

    try {
      fetch('https://api.hnucamendi.net/project', {
        method: "POST",
        body: JSON.stringify({
          project: {
            title: e.projectTitle,
            description: e.projectDescription,
            criteria: e.projectCriteria,
            houseEntries: [],
          }
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

  if (userData.length > 0) {
    return (
      <Container>
        <h1>Your Projects</h1>
        <Button
          onClick={() => setHideCreateProject(!hideCreateProject)}>
          Create New Project
        </Button>
        {
          hideCreateProject ? null :
            <CreateProjectModal
              handleShow={handleShow}
              handleHide={handleHide}
              handleCreateProject={handleCreateProject}
            />
        }
        <Card className="projects-page">
          <Card.Body>
            {userData.map((p, i) => (
              <Project key={userData?.projectId || i}>
                <Card.Title>{p.project.title}</Card.Title>
                <Card.Subtitle>{p.project.description}</Card.Subtitle>
                <Button variant="primary" href={`/projects/${p.projectId}`}>View Project</Button>
              </Project>
            ))}
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (userData === null) {
    return (
      <Container className="projects-page">
        <h1>Uh Oh ... You dont have any projects yet!</h1>
        <Button onClick={() => setHideCreateProject(!hideCreateProject)}
        >
          Create Project
        </Button>
        {
          hideCreateProject ? null :
            <CreateProjectModal
              handleShow={handleShow}
              handleHide={handleHide}
              handleCreateProject={handleCreateProject}
            />
        }
      </Container>
    )
  }

  return (
    <Container className="projects-page">
      <h1>Loading...</h1>
    </Container>
  )
};

export default LandingPage;