import { Box, Button, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Box bg="blue.600" color="white" py={20}>
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} align="center">
            <Box flex={1} mb={{ base: 10, md: 0 }}>
              <Heading as="h1" size="2xl" mb={4}>
                Welcome to HAWO Salon
              </Heading>
              <Text fontSize="xl" mb={8}>
                Book your next beauty treatment with our expert stylists and enjoy a premium experience.
              </Text>
              <Flex gap={4}>
                {!isAuthenticated() ? (
                  <>
                    <Button as={RouterLink} to="/register" colorScheme="white" variant="outline">
                      Sign Up
                    </Button>
                    <Button as={RouterLink} to="/login" colorScheme="white" variant="solid">
                      Login
                    </Button>
                  </>
                ) : (
                  <Button as={RouterLink} to="/bookings" colorScheme="white" variant="solid">
                    My Bookings
                  </Button>
                )}
                <Button as={RouterLink} to="/services" colorScheme="blue" variant="solid">
                  View Services
                </Button>
              </Flex>
            </Box>
            <Box flex={1} display={{ base: 'none', md: 'block' }}>
              {/* Add a nice illustration or image here */}
              <Box bg="blue.500" h="300px" borderRadius="lg" />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack textAlign="center" maxW="3xl" mx="auto">
              <Heading as="h2" size="xl">
                Why Choose HAWO Salon?
              </Heading>
              <Text color="gray.600">
                Experience the difference with our professional services and expert stylists.
              </Text>
            </VStack>

            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={8}
              justify="space-between"
              w="full"
            >
              {[
                {
                  title: 'Expert Stylists',
                  description: 'Our team of professionals are trained to deliver exceptional results.',
                },
                {
                  title: 'Quality Products',
                  description: 'We use only the best products for your hair and beauty needs.',
                },
                {
                  title: 'Easy Booking',
                  description: 'Book your appointment online in just a few clicks.',
                },
              ].map((feature, index) => (
                <Box
                  key={index}
                  p={6}
                  bg="white"
                  borderRadius="lg"
                  boxShadow="sm"
                  flex={1}
                  textAlign="center"
                >
                  <Text fontWeight="bold" fontSize="lg" mb={2}>
                    {feature.title}
                  </Text>
                  <Text color="gray.600">{feature.description}</Text>
                </Box>
              ))}
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box bg="blue.50" py={16}>
        <Container maxW="container.md" textAlign="center">
          <Heading as="h2" size="xl" mb={6}>
            Ready to Book Your Appointment?
          </Heading>
          <Text fontSize="lg" mb={8} color="gray.600">
            Join hundreds of satisfied customers who trust HAWO Salon for their beauty needs.
          </Text>
          <Button
            as={RouterLink}
            to={isAuthenticated() ? '/bookings/new' : '/register'}
            colorScheme="blue"
            size="lg"
          >
            {isAuthenticated() ? 'Book Now' : 'Get Started'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
