import { useState } from "react"
import PropTypes from 'prop-types';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Container,
  Dropdown,
} from 'react-bootstrap';

export default function CreateProjectModal({ handleShow, handleHide, handleCreateProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState([]);
  const [criteriaCategory, setCriteriaCategory] = useState("");
  const [criteriaValue, setCriteriaValue] = useState([]);
  const [criteriaValues, setCriteriaValues] = useState([]);

  const categories = ["Bedroom", "Bathroom", "Kitchen", "Living Room", "Dining Room", "Garage", "Yard", "Outdoors", "Basement", "Attic", "Laundry Room", "Office", "Gym", "Storage", "Other"]

  const isFormFilled = title && description && criteria.length > 0;


  return (
    <Modal show={handleShow} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <h1>Create a New Project</h1>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Modal.Title>
            <h3>Project</h3>
          </Modal.Title>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
              }}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
              }}
            />
          </Form.Group>
          <Modal.Title>
            <h3>Project Criteria</h3>
          </Modal.Title>

          <Container>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                      {criteriaCategory || "Select Category"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {categories.map((category, i) => (
                        <Dropdown.Item key={i} onClick={() => setCriteriaCategory(category)}>{category}</Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Value</Form.Label>
                  <Form.Control
                    type="text"
                    name="value"
                    value={criteriaValue}
                    onChange={(e) => {
                      const newCriteriaValue = e.target.value;
                      setCriteriaValues([...criteriaValue, newCriteriaValue]);
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button
              variant="secondary"
              onClick={() => {
                setCriteria([
                  ...criteria,
                  {
                    [criteriaCategory]: criteriaValues
                  }
                ]);
                setCriteriaCategory("");
                setCriteriaValue("");
              }}
            >
              Add Criteria
            </Button>
          </Container>
          {criteria.map((c, i) => (
            <div key={i}>
              <Row>
                <Col>
                  {c.category}
                </Col>
                <Col>
                  {Object.keys(c.details).map((detail, j) => (
                    <div key={j}>
                      {c.details[detail]}
                    </div>
                  ))}
                </Col>
                <Col>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      criteria.splice(i, 1);
                      setCriteria([...criteria]);
                    }}>
                    Delete Criteria
                  </Button>
                </Col>
              </Row>
            </div>
          ))}
          <Button
            disabled={!isFormFilled}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleCreateProject(title, description, criteria);
              handleHide();
            }}
          >
            Create!
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

CreateProjectModal.propTypes = {
  handleShow: PropTypes.func.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleCreateProject: PropTypes.func.isRequired
};