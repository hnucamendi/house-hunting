import { useState } from "react"
import PropTypes from 'prop-types';
import "../styles/modal.css"

export default function CreateProjectModal({ hideModal, handleCreateProject }) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    projectCriteriaName: '',
    projectCriteriaValue: '',
    projectCriteria: []
  });

  const handleChange = (e) => {
    const {
      projectTitle,
      projectDescription,
      projectCriteriaName,
      projectCriteriaValue
    } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [projectTitle]: projectTitle,
      [projectDescription]: projectDescription,
      [projectCriteriaName]: projectCriteriaName,
      [projectCriteriaValue]: projectCriteriaValue
    }));
  }

  return (
    < div hidden={hideModal} className="modal" >
      <h1>Test</h1>
      <form>
        <h2>Project Details</h2>
        <div>
          <div>
            <label htmlFor="projectTitle">Title</label>
            <input
              id="projectTitle"
              className="inputText"
              type="text"
              value={formData.projectTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="projectDescription">Description</label>
            <textarea
              id="projectDescription"
              className="inputText"
              type="text"
              value={formData.projectDescription}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <h2>Project Criteria</h2>
          <div>
            <label htmlFor="projectCriteriaName">Item name</label>
            <input
              id="projectCriteriaName"
              className="inputText"
              type="text"
              value={formData.projectCriteriaName}
              onChange={handleChange}
              required
            />
            <label htmlFor="projectCriteriaValue">Item Value</label>
            <input
              id="projectCriteriaValue"
              className="inputText"
              type="text"
              value={formData.projectCriteriaValue}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button onClick={() => handleCreateProject(formData)} type="submit">
          Create!
        </button>
      </form>
    </div >
  );
}

CreateProjectModal.propTypes = {
  hideModal: PropTypes.bool.isRequired,
  handleCreateProject: PropTypes.func.isRequired
};