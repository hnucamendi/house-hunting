import PropTypes from 'prop-types';
import "../styles/project.css";

const Project = ({children}) => {
  return (
    <div className="project">
      {children}
    </div>
  );
};

Project.propTypes = {
  children: PropTypes.node.isRequired
};

export default Project;
