import { useState } from "react";

const CategoryInput = ({ addCategory }) => {
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category) {
      addCategory(category);
      setCategory("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Add a new category"
      />
      <button type="submit">Add Category</button>
    </form>
  );
};

export default CategoryInput;
