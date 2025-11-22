import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route is role-protected and user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    // User is authenticated but doesn't have the required role
    // Redirect to home page or show unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;
