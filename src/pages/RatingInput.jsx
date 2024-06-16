const RatingInput = ({ category, updateRating }) => {
  const handleRatingChange = (e) => {
    updateRating(category, e.target.value);
  };

  return (
    <div>
      <label>{category}:</label>
      <input type="number" min="1" max="5" onChange={handleRatingChange} />
    </div>
  );
};

export default RatingInput;
