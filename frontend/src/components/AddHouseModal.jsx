import { useState } from "react"
import PropTypes from 'prop-types';
import React from "react";
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
  Stack,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import style from "../utils/modalStyle";

export default function CreateProjectModal({ open, handleHide, handleAddHouse, criteria }) {
  const [address, setAddress] = useState('');
  const [scores, setScores] = useState([]);
  const [notes, setNotes] = useState([]);

  const [note, setNote] = useState('');

  const handleAddNote = (value) => {
    const newNotes = [...notes];
    newNotes.push(value);
    setNotes(newNotes);

    setNote("")
  };

  return (
    <Modal open={open} onHide={handleHide}>
      <Box sx={style}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h4">House Information</Typography>
          <IconButton onClick={handleHide}><CloseIcon /></IconButton>
        </Box>
        <Box>
          <FormControl fullWidth>
            <InputLabel htmlFor="address">Address</InputLabel>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </FormControl>
          <FormControl>
            <InputLabel htmlFor="notes">Notes</InputLabel>
            <Input
              id="notes"
              type="text"
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
              }}
              required
            />
            {notes.map((note, index) => (
              <div key={index}>
                {note}
                <Button onClick={() => notes.splice(index, 1)}>Delete Note</Button>
              </div>
            ))}
            <Button onClick={(e) => {
              e.preventDefault()
              handleAddNote(note)
            }}>
              Add Note
            </Button>
          </FormControl>
          {criteria.map((criterion, index) => (
            <React.Fragment key={index}>
              <Divider orientation="horizontal" flexItem />
              <Stack
                alignItems="center"
                justifyContent={"space-between"}
                direction="row"
                divider={<Divider orientation="vertical" flexItem />}
                spacing={2}
              >
                {criterion.category}
                <List sx={{ width: "75%" }}>
                  {Object.keys(criterion.details).map((detail, index) => (
                    <React.Fragment key={index} >
                      <ListItem>
                        <ListItemText>{detail}</ListItemText>
                      </ListItem>
                      <ListItem>
                        <ListItemText>{criterion.details[detail]} </ListItemText>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
                <FormControl>
                  <InputLabel htmlFor="scores" sx={{ color: "rgba(0, 0, 0, .45)" }}>score (1-5)</InputLabel>
                  <Input
                    id="scores"
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
                      newScores[index] = { score: Number(e.target.value), criteriaId: criterion.id };
                      setScores(newScores);
                    }}
                    required
                  />
                </FormControl>
              </Stack>
              <Divider orientation="horizontal" flexItem />
            </React.Fragment>
          ))}
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
        </Box>
      </Box>
    </Modal >
  );


}

CreateProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleAddHouse: PropTypes.func.isRequired,
  criteria: PropTypes.arrayOf(PropTypes.object).isRequired,
};