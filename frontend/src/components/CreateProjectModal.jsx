import { useState } from "react"
import PropTypes from 'prop-types';
import "../styles/modal.css"
import { Modal, Form, Button, Row, Col, Container } from 'react-bootstrap';

export default function CreateProjectModal({ handleShow, handleHide, handleCreateProject }) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    projectCategories: [{ category: '', criteria: [{ title: '', value: '' }] }]
  });

  // const handleChange = (e) => {
  //   const {
  //     projectTitle,
  //     projectDescription,
  //     projectCriteriaName,
  //     projectCriteriaValue
  //   } = e.target;

  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [projectTitle]: projectTitle,
  //     [projectDescription]: projectDescription,
  //     [projectCriteriaName]: projectCriteriaName,
  //     [projectCriteriaValue]: projectCriteriaValue
  //   }));
  // }

  const handleChange = (e, catIndex, critIndex, field) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData };

    if (field === 'projectTitle' || field === 'projectDescription') {
      updatedFormData[field] = value;
    } else if (field === 'category') {
      updatedFormData.projectCategories[catIndex][name] = value;
    } else if (field === 'criteria') {
      updatedFormData.projectCategories[catIndex].criteria[critIndex][name] = value;
    }

    setFormData(updatedFormData);
  };


  const addCategory = () => {
    setFormData({
      ...formData,
      projectCategories: [...formData.projectCategories, { category: '', criteria: [{ title: '', value: '' }] }]
    });
  };

  const addCriteria = (catIndex) => {
    const updatedCategories = [...formData.projectCategories];
    updatedCategories[catIndex].criteria.push({ title: '', value: '' });
    setFormData({
      ...formData,
      projectCategories: updatedCategories
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
        <Form>
          <Modal.Title>
            <h3>Project</h3>
          </Modal.Title>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={formData.projectTitle}
              onChange={(e) => handleChange(e, null, null, 'projectTitle')}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={formData.projectDescription}
              onChange={(e) => handleChange(e, null, null, 'projectDescription')}
              required
            />
          </Form.Group>
          <Modal.Title>
            <h3>Project Criteria</h3>
          </Modal.Title>
          {formData.projectCategories.map((category, catIndex) => (
            <Container key={catIndex}>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={category.category}
                      onChange={(e) => handleChange(e, catIndex, null, 'category')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              {category.criteria.map((criteria, critIndex) => (
                <Row key={critIndex}>
                  <Col>
                    <Form.Group>
                      <Form.Label>Item</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={criteria.title}
                        onChange={(e) => handleChange(e, catIndex, critIndex, 'criteria')}
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
                        value={criteria.value}
                        onChange={(e) => handleChange(e, catIndex, critIndex, 'criteria')}
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
          <Button onClick={(e) => {
            e.preventDefault();
            handleCreateProject(formData)
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