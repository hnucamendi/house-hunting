import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const CriteriaConfigPage = () => {
  const { id } = useParams();
  const [criteria, setCriteria] = useState([]);
  const [criteriaName, setCriteriaName] = useState('');
  const [criteriaItems, setCriteriaItems] = useState({});

  const addCriteria = () => {
    setCriteria([...criteria, criteriaName]);
    setCriteriaName('');
  };

  const addCriteriaItem = (criteriaName, item) => {
    setCriteriaItems({
      ...criteriaItems,
      [criteriaName]: [...(criteriaItems[criteriaName] || []), item],
    });
  };

  return (
    <div>
      <h2>Configure Criteria for Project {id}</h2>
      <input
        type="text"
        value={criteriaName}
        onChange={(e) => setCriteriaName(e.target.value)}
        placeholder="Enter criteria name"
      />
      <button onClick={addCriteria}>Add Criteria</button>
      <ul>
        {criteria.map((criteriaName, index) => (
          <li key={index}>
            {criteriaName}
            <input
              type="text"
              placeholder="Add item"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCriteriaItem(criteriaName, e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <ul>
              {(criteriaItems[criteriaName] || []).map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Link to={`/project/${id}/calculate`}>Go to Calculation</Link>
    </div>
  );
};

export default CriteriaConfigPage;
