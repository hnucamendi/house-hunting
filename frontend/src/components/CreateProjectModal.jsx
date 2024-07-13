import React, { useState } from "react";
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
};

export default function CreateProjectModal({ open, handleHide, handleCreateProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState([]);
  const [criteriaCategory, setCriteriaCategory] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [newValues, setNewValues] = useState({});

  const categories = ["Bedroom", "Bathroom", "Kitchen", "Living Room", "Dining Room", "Garage", "Yard", "Outdoors", "Basement", "Attic", "Laundry Room", "Office", "Gym", "Storage", "Other"];

  const isFormFilled = title && description && criteria.length > 0;

  const addCriteria = () => {
    if (criteriaCategory && categoryValue) {
      setCriteria([
        ...criteria,
        {
          id: Date.now().toString(),
          details: {
            [criteriaCategory]: [categoryValue]
          }
        }
      ]);
      setCriteriaCategory("");
      setCategoryValue("");
    }
  };

  const removeCriteria = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const addValueToCategory = (id) => {
    if (newValues[id]) {
      setCriteria(criteria.map(c => {
        if (c.id === id) {
          const category = Object.keys(c.details)[0];
          return {
            ...c,
            details: {
              [category]: [...c.details[category], newValues[id]]
            }
          };
        }
        return c;
      }));
      setNewValues({ ...newValues, [id]: '' });
    }
  };

  return (
    <Modal open={open} onClose={handleHide}>
      <Box sx={style}>
        <Typography variant="h4" component="h2" gutterBottom>
          Create Project
        </Typography>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={2}
        />
        <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 3 }}>
          Project Criteria
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={criteriaCategory}
              onChange={(e) => setCriteriaCategory(e.target.value)}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Value"
            value={categoryValue}
            onChange={(e) => setCategoryValue(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={addCriteria}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
        <List>
          {criteria.map((c) => {
            const category = Object.keys(c.details)[0];
            return (
              <React.Fragment key={c.id}>
                <ListItem>
                  <ListItemText
                    primary={category}
                    secondary={
                      <React.Fragment>
                        {c.details[category].join(", ")}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Add new value"
                            value={newValues[c.id] || ''}
                            onChange={(e) => setNewValues({ ...newValues, [c.id]: e.target.value })}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => addValueToCategory(c.id)}
                            disabled={!newValues[c.id]}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => removeCriteria(c.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disabled={!isFormFilled}
          onClick={() => {
            handleCreateProject(title, description, criteria);
            handleHide();
          }}
          sx={{ mt: 3 }}
        >
          Create Project
        </Button>
      </Box>
    </Modal>
  );
}

CreateProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleCreateProject: PropTypes.func.isRequired
};