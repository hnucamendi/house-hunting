import { useState } from 'react';
import { useParams } from 'react-router-dom';

const CalculationPage = () => {
  const { id } = useParams();
  const [ratings, setRatings] = useState({});
  const [criteria, setCriteria] = useState([
    // This should be loaded from state or database
  ]);

  const updateRating = (criteriaName, item, rating) => {
    setRatings({
      ...ratings,
      [criteriaName]: {
        ...(ratings[criteriaName] || {}),
        [item]: rating,
      },
    });
  };

  const calculateAverage = () => {
    let total = 0;
    let count = 0;

    for (const criteriaName in ratings) {
      for (const item in ratings[criteriaName]) {
        total += parseFloat(ratings[criteriaName][item] || 0);
        count++;
      }
    }

    return (total / count).toFixed(2);
  };

  return (
    <div>
      <h2>Calculate Scores for Project {id}</h2>
      {criteria.map((criteriaName, index) => (
        <div key={index}>
          <h3>{criteriaName}</h3>
          {(criteria[criteriaName] || []).map((item, itemIndex) => (
            <div key={itemIndex}>
              <label>{item}</label>
              <input
                type="number"
                min="1"
                max="5"
                onChange={(e) => updateRating(criteriaName, item, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
      <h2>Average Score: {calculateAverage()}</h2>
    </div>
  );
};

export default CalculationPage;
