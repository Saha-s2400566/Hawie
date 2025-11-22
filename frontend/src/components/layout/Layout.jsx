import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box as="main" flexGrow={1} pt={20}>
        <Container maxW="container.xl">
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
