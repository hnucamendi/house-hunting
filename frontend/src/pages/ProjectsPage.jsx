import { useEffect, useState } from 'react';
import { useSessionCheck } from '../utils/authService';
import CreateProjectModal from '../components/CreateProjectModal';
import {
  Box,
  Button,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ProjectsPage = () => {
  useSessionCheck();
  const [projects, setProjects] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [uploadProjectCount, setUploadProjectCount] = useState(0);

  const url = "https://api.hnucamendi.net/projects";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
          }
        });

        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }

        const data = await response.json();
        setProjects(data.message === "No projects found" ? [] : data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [url, uploadProjectCount]);

  const handleCreateProject = async (title, description, criteria) => {
    if (title === "" || description === "" || criteria.length === 0) {
      alert("Please fill out all fields");
      return;
    }

    try {
      const response = await fetch('https://api.hnucamendi.net/project', {
        method: "POST",
        body: JSON.stringify({
          project: { title, description, criteria }
        }),
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
        }
      });

      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }

      setUploadProjectCount(prev => prev + 1);
      setIsCreateProjectModalOpen(false);
    } catch (error) {
      console.error(`Error creating project:`, error);
      alert("Failed to create project. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h2" align="center" gutterBottom>
          Your Projects
        </Typography>
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateProjectModalOpen(true)}
          >
            Create New Project
          </Button>
        </Box>

        {projects && projects.length > 0 ? (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.projectId}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {project.project.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {project.project.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" href={`/projects/${project.projectId}`}>
                      View Project
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" mt={4}>
            <Typography variant="h5" gutterBottom>
              You dont have any projects yet!
            </Typography>
            <Typography variant="body1">
              Click the button above to create your first project.
            </Typography>
          </Box>
        )}
      </Box>

      <CreateProjectModal
        open={isCreateProjectModalOpen}
        handleHide={() => setIsCreateProjectModalOpen(false)}
        handleCreateProject={handleCreateProject}
      />
    </Container>
  );
};

export default ProjectsPage;