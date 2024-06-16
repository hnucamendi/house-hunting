import { useState } from "react";
import CategoryInput from "./pages/CategoryInput";
import RatingInput from "./pages/RatingInput";

const App = () => {
  const [categories, setCategories] = useState([]);
  const [ratings, setRatings] = useState({});

  const addCategory = (category) => {
    setCategories([...categories, category]);
  };

  const updateRating = (category, rating) => {
    setRatings({ ...ratings, [category]: rating });
  };

  const calculateAverage = () => {
    const total = Object.values(ratings).reduce(
      (acc, rating) => acc + parseFloat(rating || 0),
      0,
    );
    return (total / categories.length).toFixed(2);
  };

  return (
    <div className="App">
      <h1>House Rating App</h1>
      <CategoryInput addCategory={addCategory} />
      {categories.map((category, index) => (
        <RatingInput
          key={index}
          category={category}
          updateRating={updateRating}
        />
      ))}
      <h2>Average Score: {calculateAverage()}</h2>
    </div>
  );
};

export default App;
