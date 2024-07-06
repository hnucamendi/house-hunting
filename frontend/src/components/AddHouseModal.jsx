import { useState } from "react"
import PropTypes from 'prop-types';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
} from 'react-bootstrap';

export default function CreateProjectModal({ handleShow, handleHide, handleAddHouse, criteria }) {
  const [address, setAddress] = useState('');
  const [scores, setScores] = useState([]);
  const [notes, setNotes] = useState([]);

  const [note, setNote] = useState('');

  const handleAddNote = (e) => {
    setNotes([...notes, e]);
    setNote("")
  };

  return (
    <Modal show={handleShow} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <h1>Add House</h1>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleAddHouse();
        }}>
          <Modal.Title>
            <h3>House Information</h3>
          </Modal.Title>
          <Form.Group>
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              type="text"
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
              }}
              required
            />
            {notes.map((note, index) => (
              <Row key={index}>
                <Col>
                  {note}
                </Col>
                <Col>
                  <Button onClick={() => notes.splice(index, 1)}>Delete Note</Button>
                </Col>
              </Row>
            ))}
            <Button onClick={(e) => {
              e.preventDefault()
              handleAddNote(note)
            }}>
              Add Note
            </Button>
          </Form.Group>
          <Form.Group>
            <Form.Label>Scores</Form.Label>
            {criteria.map((criterion, index) => (
              <div key={index}>
                <Row>
                  <Col>
                    {criterion.category}
                    {Object.keys(criterion.details).map((detail, index) => (
                      <div key={index}>
                        <ul>
                          <li>{detail}</li>
                          <ul>
                            <li>{criterion.details[detail]} </li>
                          </ul>
                        </ul>
                      </div>
                    ))
                    }
                  </Col>
                  <Col>
                    <Form.Control
                      key={index}
                      type="number"
                      value={scores[index]?.score || ""}
                      onChange={(e) => {
                        if (e.target.value >= 5) {
                          e.target.value = 5;
                        }

                        if (e.target.value <= 0) {
                          e.target.value = 0;
                        }
                        const newScores = [...scores];
                        newScores[index] = { score: e.target.value, criteriaId: criterion.category };
                        setScores(newScores);
                      }}
                      required
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </Form.Group>
          <Button
            disabled={address === ""}
            onClick={(e) => {
              e.preventDefault();
              handleAddHouse(address, scores, notes);
              handleHide();
            }}
            type="submit"
          >
            Add House
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );


}

CreateProjectModal.propTypes = {
  handleShow: PropTypes.func.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleAddHouse: PropTypes.func.isRequired,
  criteria: PropTypes.arrayOf(PropTypes.object).isRequired,
};