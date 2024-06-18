import  { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/criteria.css';

const Criteria = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [subCriteria, setSubCriteria] = useState({});
  const [subCriteriaName, setSubCriteriaName] = useState('');

  const addCategory = () => {
    if (categoryName) {
      setCategories([...categories, categoryName]);
      setCategoryName('');
    }
  };

  const addSubCriteria = (category) => {
    if (subCriteriaName) {
      setSubCriteria({
        ...subCriteria,
        [category]: [...(subCriteria[category] || []), subCriteriaName]
      });
      setSubCriteriaName('');
    }
  };

  return (
    <div className="criteria-config">
      <h2>Configure Criteria for Project {id}</h2>
      <div className="category-input">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter criteria category"
        />
        <button onClick={addCategory}>Add Category</button>
      </div>
      <ul>
        {categories.map((category, index) => (
          <li key={index}>
            <div className="category">
              <h3>{category}</h3>
              <div className="subcriteria-input">
                <input
                  type="text"
                  value={subCriteriaName}
                  onChange={(e) => setSubCriteriaName(e.target.value)}
                  placeholder={`Add sub-criteria for ${category}`}
                />
                <button onClick={() => addSubCriteria(category)}>Add Sub-Criteria</button>
              </div>
              <ul>
                {(subCriteria[category] || []).map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Criteria;
