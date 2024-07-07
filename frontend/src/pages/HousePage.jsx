import { useLocation } from "react-router-dom"
import { useSessionCheck } from "../utils/authService"
import {
  Container,
  Card,
  Button,
  Row,
  Col,
} from "react-bootstrap"
import AddHouseModal from "../components/AddHouseModal"
import { useEffect, useState, useMemo } from "react"

export default function HousePage() {
  useSessionCheck();
  const [userProject, setUserProject] = useState({});
  const [hideAddHouse, setHideAddHouse] = useState(true);
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
        calculateAverageScore(data?.project?.houseEntries)
      })
  }, [url, projectId])

  const handleShow = () => setHideAddHouse(false);
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
    } catch (error) {
      console.error(`Error adding house: ${error}`)
    }
  }

  const mapCriteria = useMemo(() => {
    const map = {};
    userProject?.project?.criteria.forEach((c) => {
      map[c.id] = c.category;
    })
    return map;
  }, [userProject?.project?.criteria])

  if (userProject !== null) {
    return (
      <Container>
        <Card>
          <Card.Body key={userProject?.projectId}>
            <Card.Title>{userProject?.project?.title}</Card.Title>
            <Card.Text>{userProject?.project?.description}</Card.Text>
            <Button onClick={() => setHideAddHouse(!hideAddHouse)}>
              Add House
            </Button>
            {
              hideAddHouse ? null :
                <AddHouseModal
                  handleShow={handleShow}
                  handleHide={handleHide}
                  handleAddHouse={handleAddHouse}
                  criteria={userProject?.project?.criteria}
                />
            }
          </Card.Body>
          {
            userProject?.project?.houseEntries != null
              ? <Card.Body>
                {userProject?.project?.houseEntries.map((houseEntry, index) => (
                  <Card key={index}>
                    <Card.Body>
                      <Card.Title>{houseEntry.address}</Card.Title>
                      {
                        houseEntry.scores.map((score, index) => (
                          <div key={index}>
                            <Row>
                              <Col>
                                {mapCriteria[score.criteriaId]}
                              </Col>
                              <Col>
                                {score.score}
                              </Col>
                            </Row>
                          </div>
                        ))
                      }
                      <Row>
                        <Col>
                          <Card.Text>Average Score:</Card.Text>
                        </Col>
                        <Col>
                          {houseEntry.scores.averageScore}
                        </Col>
                        <Card.Text>Notes:</Card.Text>
                      </Row>
                      {
                        houseEntry?.notes.map((note, index) => (
                          <div key={index}>
                            {note}
                          </div>
                        ))
                      }
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
              : <Card.Body>
                <Card.Text>No house entries found</Card.Text>
                <Button onClick={() => setHideAddHouse(!hideAddHouse)}>
                  Add House
                </Button>
                {
                  hideAddHouse ? null :
                    <AddHouseModal
                      handleShow={handleShow}
                      handleHide={handleHide}
                      handleAddHouse={handleAddHouse}
                      criteria={userProject?.project?.criteria}
                    />
                }
              </Card.Body>
          }
        </Card>
      </Container>
    );
  }

  return (
    <Container className="projects-page">
      <h1>Loading...</h1>
    </Container>
  )
}