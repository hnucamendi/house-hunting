import { useState } from "react"
import PropTypes from 'prop-types';

export default function CreateProjectModal({ handleHide, handleCreateProject }) {
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
    <div>
      <h2>
        <p>
          <h1>Create a New Project</h1>
        </p>
      </h2>
      <div>
        <form>
          <p>
            <h3>Project</h3>
          </p>
          <div>
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
              }}
            />
          </div>
          <div>
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
              }}
            />
          </div>
          <p>
            <h3>Project Criteria</h3>
          </p>
          <div>
            <div>
              <label>Category</label>
              <div>
                <div id="dropdown-basic">
                  {criteriaCategory || "Select Category"}
                </div>
                <div>
                  {categories.map((category, i) => (
                    <div key={i} onClick={() => setCriteriaCategory(category)}>{category}</div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label>Value</label>
              <input
                type="text"
                name="value"
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
              />
            </div>
            <button
              onClick={addCriteria}
            >
              Add Category
            </button>
          </div>
          {criteria.map((c, i) => (
            <div key={i}>
              <h4>{Object.keys(c.details)[0]}</h4>
              <ul>
                {c.details[Object.keys(c.details)[0]].map((value, j) => (
                  <li key={j}>{value}</li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Add new value"
                value={criteriaValue}
                onChange={(e) => setCriteriaValue(e.target.value)}
              />
              <button onClick={() => addValueToCategory(i)}>
                Add Criteria
              </button>
              <button onClick={() => removeCriteria(i)}>
                Remove Criteria
              </button>
            </div>
          ))}
          <button
            disabled={!isFormFilled}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleCreateProject(title, description, criteria);
              handleHide();
            }}
          >
            Create!
          </button>
        </form>
      </div>
    </div>
  );
}

CreateProjectModal.propTypes = {
  handleShow: PropTypes.func.isRequired,
  handleHide: PropTypes.func.isRequired,
  handleCreateProject: PropTypes.func.isRequired
};