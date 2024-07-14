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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import style from "../utils/modalStyle";

export default function CreateProjectModal({ open, handleHide, handleConfigureLanguage, lang }) {
  const [language, setLanguage] = useState("");

  return (
    <Modal open={open} onClose={handleHide}>
      <Box sx={style}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h4">{lang === "en" ? "Settings" : "configuración"}</Typography>
          <IconButton onClick={handleHide}><CloseIcon /></IconButton>
        </Box>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel id="language">{lang === "en" ? "Language" : "idioma"}</FormLabel>
                <RadioGroup
                  id="language"
                  aria-labelledby="languge"
                  name="language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <FormControlLabel value="en" control={<Radio />} label="English" />
                  <FormControlLabel value="es" control={<Radio />} label="Español" />
                </RadioGroup>
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
            {lang === "en" ? "Save" : "guardar"}
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
  lang: PropTypes.string.isRequired,
};