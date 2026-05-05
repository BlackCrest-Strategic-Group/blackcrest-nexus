import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/">BlackCrest Strategic Group</Link>
      <div>
        <Link to="/nexus">Procurement Intelligence</Link>
      </div>
    </nav>
  );
}
