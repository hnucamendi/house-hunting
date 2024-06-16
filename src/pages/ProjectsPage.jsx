import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');

  const addProject = () => {
    setProjects([...projects, { name: projectName, id: projects.length }]);
    setProjectName('');
  };

  return (
    <div>
      <h2>Projects</h2>
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Enter project name"
      />
      <button onClick={addProject}>Add Project</button>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link to={`/project/${project.id}/configure`}>{project.name}{project.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsPage;
