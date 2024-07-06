import { useLocation } from "react-router-dom"
import {
  Container,
  Card,
  Button
} from "react-bootstrap"
import AddHouseModal from "../components/AddHouseModal"
import { useEffect, useState, useMemo } from "react"

export default function HousePage() {
  const [userProject, setUserProject] = useState({});
  const [hideAddHouse, setHideAddHouse] = useState(true);
  const location = useLocation();

  const projectId = location.pathname.split("/")[2];

  const url = useMemo(() => {
    const u = new URL(`https://api.hnucamendi.net/project`);
    u.searchParams.append("projectId", projectId);
    return u;
  }, [projectId])


  const handleShow = () => setHideAddHouse(false);
  const handleHide = () => setHideAddHouse(true);
  const handleAddHouse = (address, scores, notes) => {
    try {
      fetch(url, {
        method: "PUT",
        body: JSON.stringify({
          houseEntries: [
            {
              address: address,
              scores: scores,
              notes: notes,
            }
          ]
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
        setUserProject(data)
      })
  }, [url, projectId])

  if (userProject != null) {
    return (
      <Container>
        <Card>
          <Card.Body key={userProject?.projectId}>
            <Card.Title>{userProject?.project?.title}</Card.Title>
            <Card.Text>{userProject?.project?.description}</Card.Text>
          </Card.Body>
          {
            userProject?.project?.houseEntries != null
              ? <Card.Body>
                {userProject?.project?.houseEntries.map((houseEntry) => (
                  <Card key={houseEntry.id}>
                    <Card.Body>
                      <Card.Title>{houseEntry.title}</Card.Title>
                      <Card.Text>{houseEntry.description}</Card.Text>
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