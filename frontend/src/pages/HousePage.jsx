import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSessionCheck } from '../utils/authService';
import AddHouseModal from '../components/AddHouseModal';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Home as HomeIcon, Add as AddIcon } from '@mui/icons-material';

const HousePage = () => {
  useSessionCheck();
  const [userProject, setUserProject] = useState(null);
  const [isAddHouseModalOpen, setIsAddHouseModalOpen] = useState(false);
  const [houseEntryCount, setHouseEntryCount] = useState(0);
  const location = useLocation();

  const projectId = location.pathname.split('/')[2];

  const calculateAverageScore = (houseEntries) => {
    return houseEntries.map((houseEntry) => ({
      ...houseEntry,
      averageScore: houseEntry.scores.reduce((total, score) => total + score.score, 0) / houseEntry.scores.length,
    }));
  };

  const url = useMemo(() => {
    const u = new URL(`https://api.hnucamendi.net/project`);
    u.searchParams.append('projectId', projectId);
    return u;
  }, [projectId]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('idToken')}`,
          },
        });
        const data = await response.json();
        const updatedData = {
          ...data,
          project: {
            ...data.project,
            houseEntries: calculateAverageScore(data.project.houseEntries || []),
          },
        };
        setUserProject(updatedData);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [url, houseEntryCount]);

  const handleAddHouse = async (address, scores, notes) => {
    if (address === '') {
      alert('Please fill out address field');
      return;
    }

    try {
      await fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
          address,
          scores,
          notes: notes.length ? notes : ['No notes'],
        }),
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('idToken')}`,
        },
      });
      setHouseEntryCount((prev) => prev + 1);
      setIsAddHouseModalOpen(false);
    } catch (error) {
      console.error(`Error adding house: ${error}`);
    }
  };

  const mapCriteria = useMemo(() => {
    const map = {};
    userProject?.project?.criteria.forEach((c) => {
      map[c.id] = Object.keys(c.details)[0];
    });
    return map;
  }, [userProject?.project?.criteria]);

  if (!userProject) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h3" gutterBottom>
          {userProject.project.title}
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          {userProject.project.description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddHouseModalOpen(true)}
          sx={{ mb: 3 }}
        >
          Add House
        </Button>
        <AddHouseModal
          open={isAddHouseModalOpen}
          handleHide={() => setIsAddHouseModalOpen(false)}
          handleAddHouse={handleAddHouse}
          criteria={userProject.project.criteria}
        />
      </Box>

      {userProject.project.houseEntries?.length ? (
        <Grid container spacing={3}>
          {userProject.project.houseEntries.map((houseEntry, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardHeader
                  avatar={<HomeIcon />}
                  title={houseEntry.address}
                  subheader={`Average Score: ${houseEntry.averageScore.toFixed(2)}`}
                />
                <CardContent>
                  <List>
                    {houseEntry.scores.map((score, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem>
                          <ListItemText
                            primary={mapCriteria[score.criteriaId]}
                            secondary={`Score: ${score.score}`}
                          />
                        </ListItem>
                        {idx < houseEntry.scores.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  <Box mt={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Notes:
                    </Typography>
                    {houseEntry.notes.map((note, idx) => (
                      <Chip key={idx} label={note} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" color="textSecondary" align="center">
          No house entries found. Add a house to get started!
        </Typography>
      )}
    </Container>
  );
};

export default HousePage;