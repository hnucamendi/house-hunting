import { useLocation } from "react-router-dom"
import {
  Container,
  Card,
  Button
} from "react-bootstrap"
import AddHouseModal from "../components/AddHouseModal"
import { useEffect, useState } from "react"

export default function HousePage() {
  const [userProjects, setUserProjects] = useState([]);
  const [hideAddHouse, setHideAddHouse] = useState(true);
  const location = useLocation();

  const projectId = location.pathname.split("/")[2];
  const url = `https://api.hnucamendi.net/projects`;


  const handleShow = () => setHideAddHouse(false);
  const handleHide = () => setHideAddHouse(true);
  const handleAddHouse = (address, scores, notes) => {
    try {
      fetch(`https://api.hnucamendi.net/projects?projectId=${projectId}}`, {
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
        data?.projects.filter((project) => {
          if (project.id === projectId) {
            setUserProjects(project)
          }
        }) || setUserProjects(null)
      })
  }, [url, projectId])

  // console.log(userProjects.criteria)

  if (userProjects?.id === projectId) {
    return (
      <Container>
        <Card>
          <Card.Body key={userProjects.id}>
            <Card.Title>{userProjects.title}</Card.Title>
            <Card.Text>{userProjects.description}</Card.Text>
          </Card.Body>
          {
            userProjects?.houseEntries != null
              ? <Card.Body>
                {userProjects?.houseEntries.map((houseEntry) => (
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
                      criteria={userProjects.criteria}
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