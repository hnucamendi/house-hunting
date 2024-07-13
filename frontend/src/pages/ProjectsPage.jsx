import { useEffect, useState } from 'react';
import { useSessionCheck } from '../utils/authService';
import CreateProjectModal from '../components/CreateProjectModal';
import Project from '../components/Project';
import {
  Box,
  Button,
  Typography,
  Stack,
  Grid,
  Container,
} from '@mui/material';
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
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" justifyContent="center" mb={4}>
          <Typography variant="h2">Your Projects</Typography>
          <Button variant="contained" size="small"
            onClick={() => setHideCreateProject(!hideCreateProject)}>
            Create New Project
          </Button>
          {
            hideCreateProject ? null :
              <CreateProjectModal
                open={!hideCreateProject}
                handleHide={handleHide}
                handleCreateProject={handleCreateProject}
              />
          }
        </Stack>
        <Grid container spacing={3} justifyContent="center">
          {userData.map((p, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.projectId || i}>
              <Project >
                <Typography variant="h3">{p.project.title}</Typography>
                <Typography variant="h5">{p.project.description}</Typography>
                <Button href={`/projects/${p.projectId}`}>View Project</Button>
              </Project>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (userData === null) {
    return (
      <Box className="projects-page">
        <Typography variant="h2">Uh Oh.. You dont have any projects yet!</Typography>
        <Button variant="contained" size="large" onClick={() => setHideCreateProject(!hideCreateProject)}>
          Create Project
        </Button>
        {
          hideCreateProject ? null :
            <CreateProjectModal
              open={!hideCreateProject}
              handleHide={handleHide}
              handleCreateProject={handleCreateProject}
            />
        }
      </Box>
    )
  }

  return (
    <Box className="projects-page">
      <Typography variant="h2" align="center">Loading...</Typography>
    </Box>
  )
};

export default LandingPage;