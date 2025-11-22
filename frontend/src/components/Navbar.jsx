import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background: #fff;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
`;

const Logo = styled(Link)`
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
`;

const NavMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #007bff;
  }
`;

const Button = styled(Link)`
  background: #007bff;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: #0056b3;
  }
`;

const Navbar = () => {
    return (
        <Nav>
            <Logo to="/">Hawo</Logo>
            <NavMenu>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/services">Services</NavLink>
                <NavLink to="/login">Login</NavLink>
                <Button to="/register">Sign Up</Button>
            </NavMenu>
        </Nav>
    );
};

export default Navbar;
