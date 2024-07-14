import { useMemo, useEffect, useState } from 'react';
import { useSessionCheck } from '../utils/authService';
import CreateProjectModal from '../components/CreateProjectModal';
import SettingsModal from '../components/SettingsModal';
import Cookies from 'js-cookie';
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
  IconButton,
} from '@mui/material';
import { Add as AddIcon, AdminPanelSettings as SettingsIcon } from '@mui/icons-material';

const ProjectsPage = () => {
  useSessionCheck();
  const [projects, setProjects] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [uploadProjectCount, setUploadProjectCount] = useState(0);
  const [settingsChange, setSettingsChange] = useState(0);

  const url = useMemo(() => {
    return new URL(`https://api.homemendi.com/`);
  }, []);

  const language = useMemo(() => {
    return projects?.settings?.language || Cookies.get('language') || "en"
  }, [projects]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("https://api.homemendi.com/projects",
          {
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
  }, [uploadProjectCount, settingsChange]);

  const setLanguageCookie = (lang) => {
    Cookies.set('language', lang, { expires: 365, path: '/', sameSite: 'strict' });
  };

  const handleConfigureLanguage = async (ln) => {
    url.pathname = 'settings';
    try {
      const response = await fetch(url,
        {
          method: "PUT",
          body: JSON.stringify({
            settings: { language: ln }
          }),
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
          }
        });

      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }

      setLanguageCookie(ln);
      setSettingsChange(prev => prev + 1);
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error(`Error configuring language:`, error);
      alert("Failed to configure language. Please try again.");
    }
  };

  const handleCreateProject = async (title, description, criteria) => {
    if (title === "" || description === "" || criteria.length === 0) {
      alert("Please fill out all fields");
      return;
    }

    url.pathname = 'project';

    try {
      const response = await fetch(url,
        {
          method: "POST",
          body: JSON.stringify({
            settings: { language: language },
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
    <Container maxWidth="lg" >
      <Box my={4}>
        <IconButton onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}><SettingsIcon /></IconButton>
        <Typography variant="h2" align="center" gutterBottom>
          {language === "en" ? "Your Projects" : "Tus Proyectos"}
        </Typography>
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateProjectModalOpen(!isCreateProjectModalOpen)}
          >
            {language === "en" ? "Create New Project" : "Crear Nuevo Proyecto"}
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
                      {language === "en" ? "View Project" : "Ver Proyecto"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" mt={4}>
            <Typography variant="h5" gutterBottom>
              {language === "en" ? "You dont have any projects yet!" : "¡Aún no tienes proyectos!"}
            </Typography>
            <Typography variant="body1">
              {language === "en" ? "Click the button above to create your first project." : "Haz clic en el botón de arriba para crear tu primer proyecto."}
            </Typography>
          </Box>
        )}
      </Box>

      <CreateProjectModal
        open={isCreateProjectModalOpen}
        handleHide={() => setIsCreateProjectModalOpen(!isCreateProjectModalOpen)}
        handleCreateProject={handleCreateProject}
        lang={language}
      />

      <SettingsModal
        open={isSettingsModalOpen}
        handleHide={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
        handleConfigureLanguage={handleConfigureLanguage}
        lang={language}
      />
    </Container>
  );
};

export default ProjectsPage;