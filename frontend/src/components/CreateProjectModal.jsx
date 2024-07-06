import { useState } from "react"
import PropTypes from 'prop-types';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Container
} from 'react-bootstrap';

export default function CreateProjectModal({ handleShow, handleHide, handleCreateProject }) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    projectCriteria: [
      {
        category: '',
        details: {},
      }
    ]
  });
  const [isProjectTitleFilled, setIsProjectTitleFilled] = useState(false);
  const [isProjectDescriptionFilled, setIsProjectDescriptionFilled] = useState(false);
  const [isProjectCriteriaCategory, setIsProjectCriteriaCategory] = useState(false);
  const [isProjectCriteriaKey, setIsProjectCriteriaKey] = useState(false);
  const [isProjectCriteriaValue, setIsProjectCriteriaValue] = useState(false);

  const isFormFilled = isProjectCriteriaCategory && isProjectCriteriaKey && isProjectCriteriaValue && isProjectDescriptionFilled && isProjectTitleFilled;

  const handleChange = (e, catIndex, critIndex, field, type) => {
    const { value } = e.target;
    const updatedFormData = { ...formData };

    if (type === 'projectTitle' || type === 'projectDescription') {
      updatedFormData[type] = value;
    } else if (type === 'category') {
      updatedFormData.projectCriteria[catIndex].category = value;
    } else if (type === 'criteriaKey') {
      const oldKey = Object.keys(updatedFormData.projectCriteria[catIndex].details)[critIndex];
      const updatedCriteria = { ...updatedFormData.projectCriteria[catIndex].details };
      delete updatedCriteria[oldKey];
      updatedCriteria[value] = updatedFormData.projectCriteria[catIndex].details[oldKey];
      updatedFormData.projectCriteria[catIndex].details = updatedCriteria;
    } else if (type === 'criteriaValue') {
      const key = Object.keys(updatedFormData.projectCriteria[catIndex].details)[critIndex];
      updatedFormData.projectCriteria[catIndex].details[key] = value;
    }

    setFormData(updatedFormData);
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      projectCriteria: [...formData.projectCriteria, { category: '', details: {} }]
    });
  };

  const addCriteria = (catIndex) => {
    const updatedCategories = [...formData.projectCriteria];
    updatedCategories[catIndex].details = { ...updatedCategories[catIndex].details, '': '' };
    setFormData({
      ...formData,
      projectCriteria: updatedCategories
    });
  };

  return (
    <Modal show={handleShow} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <h1>Create a New Project</h1>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleCreateProject(formData);
        }}>
          <Modal.Title>
            <h3>Project</h3>
          </Modal.Title>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={formData.projectTitle}
              onChange={(e) => {
                setIsProjectTitleFilled(false);
                handleChange(e, null, null, 'projectTitle', 'projectTitle')
                if (e.target.value !== "") {
                  setIsProjectTitleFilled(true);
                }
              }}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={formData.projectDescription}
              onChange={(e) => {
                setIsProjectDescriptionFilled(false);
                handleChange(e, null, null, 'projectDescription', 'projectDescription')
                if (e.target.value !== "") {
                  setIsProjectDescriptionFilled(true);
                }
              }}
              required
            />
          </Form.Group>
          <Modal.Title>
            <h3>Project Criteria</h3>
          </Modal.Title>
          {formData.projectCriteria.map((item, catIndex) => (
            <Container key={catIndex}>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={item.category}
                      onChange={(e) => {
                        setIsProjectCriteriaCategory(false);
                        handleChange(e, catIndex, null, 'category', 'category')
                        if (e.target.value !== "") {
                          setIsProjectCriteriaCategory(true);
                        }
                      }}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {Object.entries(item.details).map(([key, value], critIndex) => (
                <Row key={critIndex}>
                  <Col>
                    <Form.Group>
                      <Form.Label>Item</Form.Label>
                      <Form.Control
                        type="text"
                        name="key"
                        value={key}
                        onChange={(e) => {
                          setIsProjectCriteriaKey(false);
                          handleChange(e, catIndex, critIndex, 'criteriaKey', 'criteriaKey')
                          if (e.target.value !== "") {
                            setIsProjectCriteriaKey(true);
                          }
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Value</Form.Label>
                      <Form.Control
                        type="text"
                        name="value"
                        value={value}
                        onChange={(e) => {
                          setIsProjectCriteriaValue(false);
                          handleChange(e, catIndex, critIndex, 'criteriaValue', 'criteriaValue')
                          if (e.target.value !== "") {
                            setIsProjectCriteriaValue(true);
                          }
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ))}

              <Button variant="secondary" onClick={() => addCriteria(catIndex)}>
                Add Criteria
              </Button>
            </Container>
          ))}
          <Button variant="secondary" onClick={addCategory}>
            Add Category
          </Button>
          <Button disabled={!isFormFilled} onClick={(e) => {
            e.preventDefault();
            handleCreateProject(formData)
            handleHide();
          }}
            type="submit"
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