import { useState } from "react"
import PropTypes from 'prop-types';

export default function CreateProjectModal({ handleHide, handleAddHouse, criteria }) {
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
    <div>
      < h2 >
        <h2>
          <h1>Add House</h1>
        </h2>
      </h2 >
      <div>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddHouse();
        }}>
          <h2>
            <h3>House Information</h3>
          </h2>
          <div>
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Notes</label>
            <input
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
                <button onClick={() => notes.splice(index, 1)}>Delete Note</button>
              </div>
            ))}
            <button onClick={(e) => {
              e.preventDefault()
              handleAddNote(note)
            }}>
              Add Note
            </button>
          </div>
          <div>
            <label>Scores</label>
            {criteria.map((criterion, index) => (
              <div key={index}>
                {criterion.category}
                {Object.keys(criterion.details).map((detail, index) => (
                  <div key={index}>
                    <ul>
                      <li>{detail}</li>
                      <ul>
                        <li>{criterion.details[detail]} </li>
                      </ul>
                    </ul>
                  </div>
                ))
                }
                <input
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
              </div>
            ))}
          </div>
          <button
            disabled={address === ""}
            onClick={(e) => {
              e.preventDefault();
              handleAddHouse(address, scores, notes);
              handleHide();
            }}
            type="submit"
          >
            Add House
          </button>
        </form >
      </div >
    </div >
  );
}

CreateProjectModal.propTypes = {
  handleShow: PropTypes.func.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleAddHouse: PropTypes.func.isRequired,
  criteria: PropTypes.arrayOf(PropTypes.object).isRequired,
};