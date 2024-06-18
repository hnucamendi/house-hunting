import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
    
      <h1>House Hunting with Denise 2024</h1>
      <p>This page is meant to organize the houses we visit along with a place to track the rating
        of each house based on some criteria we define 
        <Link to={`/house-criteria`}>Criteria </Link>
      </p>
    </div>
  );
};

export default LandingPage;