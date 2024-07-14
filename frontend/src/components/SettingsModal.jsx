import { useState } from "react"
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Button,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Input,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import style from "../utils/modalStyle";

export default function CreateProjectModal({ open, handleHide, handleConfigureLanguage }) {
  const [language, setLanguage] = useState("en");

  //test

  return (
    <Modal open={open} onClose={handleHide}>
      <Box sx={style}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h4">House Information</Typography>
          <IconButton onClick={handleHide}><CloseIcon /></IconButton>
        </Box>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="address">Address</InputLabel>
                <Input
                  id="address"
                  type="text"
                  required
                />
              </FormControl>
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={async (e) => {
              e.preventDefault();
              await handleConfigureLanguage(language);
              handleHide();
            }}
            type="submit"
            sx={{ mt: 3 }}
          >
            Add House
          </Button>
        </Box>
      </Box>
    </Modal>
  );


}

CreateProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleConfigureLanguage: PropTypes.func.isRequired,
};