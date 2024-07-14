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
  IconButton,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import style from "../utils/modalStyle";

const DEFAULTSTATE = {
  title: "",
  description: "",
  criteria: [],
  criteriaCategory: "",
  categoryValue: "",
  newValues: {},
}

export default function CreateProjectModal({ open, handleHide, handleCreateProject, lang }) {
  const [title, setTitle] = useState(DEFAULTSTATE.title);
  const [description, setDescription] = useState(DEFAULTSTATE.description);
  const [criteria, setCriteria] = useState(DEFAULTSTATE.criteria);
  const [criteriaCategory, setCriteriaCategory] = useState(DEFAULTSTATE.criteriaCategory);
  const [categoryValue, setCategoryValue] = useState(DEFAULTSTATE.categoryValue);
  const [newValues, setNewValues] = useState(DEFAULTSTATE.newValues);

  const categories = ["Bedroom", "Bathroom", "Kitchen", "Living Room", "Dining Room", "Garage", "Yard", "Outdoors", "Basement", "Attic", "Laundry Room", "Office", "Gym", "Storage", "Other"];
  const spanishCategories = ["Dormitorio", "Baño", "Cocina", "Sala de estar", "Comedor", "Garaje", "Patio", "Exteriores", "Sótano", "Ático", "Lavandería", "Oficina", "Gimnasio", "Almacenamiento", "Otro"];

  const isFormFilled = title && description && criteria.length > 0;

  const resetState = () => {
    setTitle(DEFAULTSTATE.title);
    setDescription(DEFAULTSTATE.description);
    setCriteria(DEFAULTSTATE.criteria);
    setCriteriaCategory(DEFAULTSTATE.criteriaCategory);
    setCategoryValue(DEFAULTSTATE.categoryValue);
    setNewValues(DEFAULTSTATE.newValues);
  }

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
      setNewValues({ ...newValues, [id]: "" });
    }
  };

  return (
    <Modal open={open} onClose={handleHide}>
      <Box sx={style}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h4" component="h2" gutterBottom>{lang === "en" ? "Create Project" : "Crear Proyecto"}</Typography>
          <IconButton onClick={handleHide}><CloseIcon /></IconButton>
        </Box>
        <TextField
          fullWidth
          label={lang === "en" ? "Title" : "Título"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label={lang === "en" ? "Description" : "Descripción"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={2}
        />
        <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 3 }}>
          {lang === "en" ? "Project Criteria" : "Criterios del Proyecto"}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{lang === "en" ? "Category" : "Categoría"}</InputLabel>
            <Select
              value={criteriaCategory}
              onChange={(e) => setCriteriaCategory(e.target.value)}
              label="Category"
            >
              {lang === "en" ? categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              )) : spanishCategories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label={lang === "en" ? "Criteria" : "Criterio"}
            placeholder={`${criteriaCategory} Criteria`}
            value={categoryValue}
            onChange={(e) => setCategoryValue(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={addCriteria}
            startIcon={lang === "en" ? <AddIcon /> : null}
          >
            {lang === "en" ? "Add" : "Añadir"}
          </Button>
        </Box>
        <List>
          {criteria.map((c) => {
            const category = Object.keys(c.details)[0];
            return (
              <React.Fragment key={c.id}>
                <ListItem alignItems="flex-start">
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1">{category}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.details[category].join(", ")}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder={`Add more ${category} criteria`}
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
                  </Box>
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
          onClick={async () => {
            await handleCreateProject(title, description, criteria);
            resetState();
            handleHide();
          }}
          sx={{ mt: 3 }}
        >
          {lang === "en" ? "Create Project" : "Crear Proyecto"}
        </Button>
      </Box>
    </Modal>
  );
}

CreateProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleCreateProject: PropTypes.func.isRequired,
  lang: PropTypes.string
};