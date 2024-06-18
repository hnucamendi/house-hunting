import { Link } from 'react-router-dom';
import '../styles/nav.css';  // Assuming you want to add some custom styles

const Nav = () => {
  return (
    <nav className="nav">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/house-criteria">House Criteria</Link>
        </li>
        <li>
          <Link to="/house-ratings">House Ratings</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
