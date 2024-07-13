import { useLocation } from "react-router-dom"
import { useSessionCheck } from "../utils/authService"
import AddHouseModal from "../components/AddHouseModal"
import { useEffect, useState, useMemo } from "react"
import React from "react"
import {
  Box,
  Button,
  Typography,
  Stack,
  Grid,
  List,
  ListItem,
  Card,
  CardContent,
  CardHeader,
  Container,
} from '@mui/material';

export default function HousePage() {
  useSessionCheck();
  const [userProject, setUserProject] = useState({});
  const [hideAddHouse, setHideAddHouse] = useState(true);
  const [houseEntryCount, setHouseEntryCount] = useState(0);
  const location = useLocation();

  const projectId = location.pathname.split("/")[2];

  const calculateAverageScore = (houseEntries) => {
    houseEntries.forEach((houseEntry) => {
      let total = 0;
      let count = 0;
      houseEntry.scores.forEach((score) => {
        total += score.score;
        count++;
      })
      houseEntry.scores.averageScore = total / count;
    })
  }

  const url = useMemo(() => {
    const u = new URL(`https://api.hnucamendi.net/project`);
    u.searchParams.append("projectId", projectId);
    return u;
  }, [projectId])

  useEffect(() => {
    fetch(url, {
      method: "GET",
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setUserProject(data);
        calculateAverageScore(data?.project?.houseEntries || [])
      })
  }, [url, projectId, houseEntryCount])

  const handleHide = () => setHideAddHouse(true);

  const handleAddHouse = (address, scores, notes) => {
    if (address === "") {
      alert("Please fill out address field")
      return
    }

    if (notes.length === 0) {
      notes.push("No notes")
    }

    try {
      fetch(url, {
        method: "PUT",
        body: JSON.stringify({
          address: address,
          scores: scores,
          notes: notes,
        }),
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
        }
      })
        .then(() => setHouseEntryCount(houseEntryCount + 1))
    } catch (error) {
      console.error(`Error adding house: ${error}`)
    }
  }

  const mapCriteria = useMemo(() => {
    const map = {};
    userProject?.project?.criteria.forEach((c) => {
      map[c.id] = Object.keys(c.details)[0];
    })
    return map;
  }, [userProject?.project?.criteria])


  if (userProject !== null) {
    return (
      <Container>
        <div key={userProject?.projectId}>
          <Typography variant="h2">{userProject?.project?.title}</Typography>
          <Typography variant="h3">{userProject?.project?.description}</Typography>
          <Button onClick={() => setHideAddHouse(!hideAddHouse)}>
            Add House
          </Button>
          {
            hideAddHouse ? null :
              <AddHouseModal
                open={!hideAddHouse}
                handleHide={handleHide}
                handleAddHouse={handleAddHouse}
                criteria={userProject?.project?.criteria}
              />
          }
        </div>
        {
          userProject?.project?.houseEntries != null
            ? <div>
              {userProject?.project?.houseEntries.map((houseEntry, index) => (
                <React.Fragment key={index}>
                  <Card variant="outlined">
                    <CardHeader
                      title={houseEntry.address}
                      subheader={"Average Score: " + houseEntry.scores.averageScore}
                    />
                    <CardContent>
                      {
                        houseEntry.scores.map((score, index) => (
                          <React.Fragment key={index}>
                            <Stack
                              direction="row"
                              spacing={2}
                            >
                              <Box>
                                {mapCriteria[score.criteriaId] + ":"}
                              </Box>
                              <Box>
                                {score.score}
                              </Box>
                            </Stack>
                          </React.Fragment>
                        ))
                      }
                      <List>
                        <Typography>Notes:</Typography>
                        {
                          houseEntry?.notes.map((note, index) => (
                            <React.Fragment key={index}>
                              <ListItem>
                                {note}
                              </ListItem>
                            </React.Fragment>
                          ))}
                      </List>
                    </CardContent>
                  </Card>
                </React.Fragment>
              ))}
            </div>
            : <div>
              <Typography>No house entries found</Typography>
              <Button onClick={() => setHideAddHouse(!hideAddHouse)}>
                Add House
              </Button>
              {
                hideAddHouse ? null :
                  <AddHouseModal
                    open={!hideAddHouse}
                    handleHide={handleHide}
                    handleAddHouse={handleAddHouse}
                    criteria={userProject?.project?.criteria}
                  />
              }
            </div>
        }
      </Container>
    );
  }

  return (
    <Box>
      <Typography variant="h2">Loading...</Typography>
    </Box>
  )
}