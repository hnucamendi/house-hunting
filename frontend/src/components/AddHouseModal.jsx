import { useState } from "react"
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Input,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import style from "../utils/modalStyle";

const DEFAULTSTATE = {
  address: "",
  scores: [],
  notes: [],
  note: "",
}

export default function CreateProjectModal({ open, handleHide, handleAddHouse, criteria, lang }) {
  const [address, setAddress] = useState(DEFAULTSTATE.address);
  const [scores, setScores] = useState(DEFAULTSTATE.scores);
  const [notes, setNotes] = useState(DEFAULTSTATE.notes);
  const [note, setNote] = useState(DEFAULTSTATE.note);

  const resetState = () => {
    setAddress(DEFAULTSTATE.address);
    setScores(DEFAULTSTATE.scores);
    setNotes(DEFAULTSTATE.notes);
    setNote(DEFAULTSTATE.note);
  }

  const handleAddNote = (value) => {
    const newNotes = [...notes];
    newNotes.push(value);
    setNotes(newNotes);

    setNote("")
  };

  return (
    <Modal open={open} onClose={handleHide}>
      <Box sx={style}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h4">{lang === "en" ? "House Information" : "Información de la casa"}</Typography>
          <IconButton onClick={handleHide}><CloseIcon /></IconButton>
        </Box>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="address">{lang === "en" ? "Address" : "dirección"}</InputLabel>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="notes">{lang === "en" ? "Notes" : "Notas"}</InputLabel>
                <Input
                  id="notes"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                />
              </FormControl>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddNote(note);
                }}
                sx={{ mt: 1 }}
              >
                {lang === "en" ? "Add Note" : "Añadir Nota"}
              </Button>
              <List>
                {notes.map((note, index) => (
                  <ListItem key={index} secondaryAction={
                    <Button onClick={() => {
                      const newNotes = [...notes];
                      newNotes.splice(index, 1);
                      // Assuming you have a setNotes function
                      setNotes(newNotes);
                    }}>
                      Delete
                    </Button>
                  }>
                    <ListItemText primary={note} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {criteria.map((criterion, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6">{criterion.category}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <List>
                    {Object.entries(criterion.details).map(([detail, values], detailIndex) => (
                      <ListItem key={detailIndex}>
                        <ListItemText
                          primary={detail}
                          secondary={values.join(', ')}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor={`scores-${index}`} sx={{ color: "rgba(0, 0, 0, .45)" }}>
                      {lang === "en" ? "Score (1-5)" : "Puntuación (1-5)"}
                    </InputLabel>
                    <Input
                      id={`scores-${index}`}
                      type="number"
                      value={scores[index]?.score || ""}
                      onChange={(e) => {
                        const value = Math.min(Math.max(Number(e.target.value), 0), 5);
                        const newScores = [...scores];
                        newScores[index] = { score: value, criteriaId: criterion.id };
                        setScores(newScores);
                      }}
                      inputProps={{ min: 0, max: 5, step: 0.1 }}
                      required
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={address === ""}
            onClick={async (e) => {
              e.preventDefault();
              await handleAddHouse(address, scores, notes);
              resetState();
              handleHide();
            }}
            type="submit"
            sx={{ mt: 3 }}
          >
            {lang === "en" ? "Add House" : "Añadir Casa"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );


}

CreateProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleAddHouse: PropTypes.func.isRequired,
  criteria: PropTypes.arrayOf(PropTypes.object).isRequired,
  lang: PropTypes.string
};