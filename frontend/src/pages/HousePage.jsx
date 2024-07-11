import { useLocation } from "react-router-dom"
import { useSessionCheck } from "../utils/authService"
import AddHouseModal from "../components/AddHouseModal"
import { useEffect, useState, useMemo } from "react"

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
      <div>
        <div>
          <div key={userProject?.projectId}>
            <p>{userProject?.project?.title}</p>
            <p>{userProject?.project?.description}</p>
            <button onClick={() => setHideAddHouse(!hideAddHouse)}>
              Add House
            </button>
            {
              hideAddHouse ? null :
                <AddHouseModal
                  handleShow={handleShow}
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
                  <div key={index}>
                    <div>
                      <p>{houseEntry.address}</p>
                      {
                        houseEntry.scores.map((score, index) => (
                          <div key={index}>
                            {mapCriteria[score.criteriaId]}
                            {score.score}
                          </div>
                        ))
                      }
                      <p>Average Score:</p>
                      {Number(houseEntry.scores.averageScore.toFixed(2))}
                      <p>Notes:</p>
                      {
                        houseEntry?.notes.map((note, index) => (
                          <div key={index}>
                            {note}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))}
              </div>
              : <div>
                <p>No house entries found</p>
                <button onClick={() => setHideAddHouse(!hideAddHouse)}>
                  Add House
                </button>
                {
                  hideAddHouse ? null :
                    <AddHouseModal
                      handleShow={handleShow}
                      handleHide={handleHide}
                      handleAddHouse={handleAddHouse}
                      criteria={userProject?.project?.criteria}
                    />
                }
              </div>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <h1>Loading...</h1>
    </div>
  )
}