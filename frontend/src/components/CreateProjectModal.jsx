import { useState } from "react"
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  Grid,
  Input,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "50%",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function CreateProjectModal({ open, handleHide, handleCreateProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState([]);
  const [criteriaCategory, setCriteriaCategory] = useState("");
  const [categoryValue, setCategoryValue] = useState([]);
  const [criteriaValue, setCriteriaValue] = useState([]);

  const categories = ["Bedroom", "Bathroom", "Kitchen", "Living Room", "Dining Room", "Garage", "Yard", "Outdoors", "Basement", "Attic", "Laundry Room", "Office", "Gym", "Storage", "Other"]

  const isFormFilled = title && description && criteria.length > 0;

  const addCriteria = () => {
    if (criteriaCategory && categoryValue) {
      setCriteria([
        ...criteria,
        {
          id: "",
          details: {
            [criteriaCategory]: [categoryValue]
          }
        }
      ]);
      setCriteriaCategory("");
      setCategoryValue("");
    }
  };

  const removeCriteria = (index) => {
    const newCriteria = [...criteria];
    newCriteria.splice(index, 1);
    setCriteria(newCriteria);
  };

  const addValueToCategory = (index) => {
    if (criteriaValue) {
      const newCriteria = [...criteria];
      const category = Object.keys(newCriteria[index].details)[0];
      newCriteria[index].details[category].push(criteriaValue);
      setCriteria(newCriteria);
      setCategoryValue("");
    }
  };

  return (
    <Modal open={open} onClose={handleHide}>
      <Box sx={style}>
        <Typography variant="h5" align="center">Create Project</Typography>
        <Stack spacing={2} alignItems={"center"} justifyContent={"center"}>
          <Grid container>
            <Grid item>
              <Typography variant="h6">Title</Typography>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Typography variant="h6">Description</Typography>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
          <Typography variant="h4">Project Criteria</Typography>
          <Grid container>
            <Grid item>
              <Typography variant="h6">Category</Typography>
              <FormControl fullWidth>
                <InputLabel id="select-label">Select Category</InputLabel>
                <Select
                  id="select"
                  value={criteriaCategory}
                  onChange={(e) => setCriteriaCategory(e.target.value)}
                  label="Select Category"
                >
                  {categories.map((category, i) => (
                    <MenuItem
                      key={i}
                      value={category}
                      onClick={() => setCriteriaCategory(category)}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Typography variant="h6">Value</Typography>
              <Input
                type="text"
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            onClick={addCriteria}
          >
            Add Category
          </Button>
          {criteria.map((c, i) => (
            <div key={i}>
              <Typography variant="h6">{Object.keys(c.details)[0]}</Typography>
              <ul>
                {c.details[Object.keys(c.details)[0]].map((value, j) => (
                  <li key={j}>{value}</li>
                ))}
              </ul>
              <Input
                type="text"
                placeholder="Add new value"
                value={criteriaValue}
                onChange={(e) => setCriteriaValue(e.target.value)}
              />
              <Button variant="contained" onClick={() => addValueToCategory(i)}>
                Add Criteria
              </Button>
              <Button variant="contained" onClick={() => removeCriteria(i)}>
                Remove Criteria
              </Button>
            </div>
          ))}
          <Button
            disabled={!isFormFilled}
            onClick={() => {
              handleCreateProject(title, description, criteria);
              handleHide();
            }}
          >
            Create!
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

{/* <Modal.Header closeButton>
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
                    value={categoryValue}
                    onChange={(e) => setCategoryValue(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button
              variant="secondary"
              onClick={addCriteria}
            >
              Add Category
            </Button>
          </Container>
          {criteria.map((c, i) => (
            <div key={i}>
              <h4>{Object.keys(c.details)[0]}</h4>
              <ul>
                {c.details[Object.keys(c.details)[0]].map((value, j) => (
                  <li key={j}>{value}</li>
                ))}
              </ul>
              <Form.Control
                type="text"
                placeholder="Add new value"
                value={criteriaValue}
                onChange={(e) => setCriteriaValue(e.target.value)}
              />
              <Button variant="secondary" onClick={() => addValueToCategory(i)}>
                Add Criteria
              </Button>
              <Button variant="danger" onClick={() => removeCriteria(i)}>
                Remove Criteria
              </Button>
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
       */}

CreateProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleCreateProject: PropTypes.func.isRequired
};