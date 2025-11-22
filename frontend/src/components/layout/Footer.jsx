import { Box, Container, Stack, Text, Link, useColorModeValue, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYelp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Services', to: '/services' },
    { label: 'Stylists', to: '/stylists' },
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, label: 'Facebook', href: '#' },
    { icon: <FaTwitter />, label: 'Twitter', href: '#' },
    { icon: <FaInstagram />, label: 'Instagram', href: '#' },
    { icon: <FaYelp />, label: 'Yelp', href: '#' },
  ];

  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt={10}
    >
      <Container as="footer" role="contentinfo" maxW="container.xl" py={10}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={8}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
        >
          <Box>
            <Text fontWeight="bold" fontSize="lg" mb={2}>
              HAWO Salon
            </Text>
            <Text maxW="300px" fontSize="sm">
              Your premier destination for beauty and wellness. Professional services tailored to your needs.
            </Text>
          </Box>

          <Stack direction="row" spacing={6}>
            {socialLinks.map((link, index) => (
              <Link 
                key={index} 
                href={link.href} 
                isExternal
                aria-label={link.label}
                fontSize="xl"
                color={useColorModeValue('gray.600', 'gray.400')}
                _hover={{ color: 'blue.500' }}
              >
                {link.icon}
              </Link>
            ))}
          </Stack>
        </Stack>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify="space-between"
          mt={10}
          pt={10}
          borderTopWidth={1}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Text fontSize="sm">
            &copy; {currentYear} HAWO Salon. All rights reserved.
          </Text>
          
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 2, md: 6 }}
            flexWrap="wrap"
          >
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                as={RouterLink}
                to={link.to}
                fontSize="sm"
                _hover={{ textDecoration: 'underline' }}
              >
                {link.label}
              </Link>
            ))}
          </Flex>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
