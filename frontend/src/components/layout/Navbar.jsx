import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { FaCalendarAlt, FaUserCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box 
      position="fixed" 
      w="100%" 
      zIndex={1000}
      bg={isScrolled ? 'white' : 'transparent'}
      boxShadow={isScrolled ? 'md' : 'none'}
      transition="all 0.3s"
    >
      <Flex
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        bg={isScrolled ? 'white' : 'rgba(255, 255, 255, 0.8)'}
        backdropFilter={isScrolled ? 'none' : 'blur(10px)'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('blue.600', 'white')}
            fontWeight="bold"
            fontSize="xl"
            as={RouterLink}
            to="/"
          >
            HAWO Salon
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {isAuthenticated() ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar
                  size={'sm'}
                  name={user?.name}
                  src={user?.avatar}
                  bg="blue.500"
                  color="white"
                />
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<Icon as={FaUserCog} />}
                  as={RouterLink}
                  to="/profile"
                >
                  Profile
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem as={RouterLink} to="/admin/dashboard">
                    Admin Dashboard
                  </MenuItem>
                )}
                {user?.role === 'stylist' && (
                  <MenuItem as={RouterLink} to="/stylist/dashboard">
                    Stylist Dashboard
                  </MenuItem>
                )}
                <MenuDivider />
                <MenuItem
                  icon={<Icon as={FaSignOutAlt} />}
                  onClick={handleLogout}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/login"
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'blue.500'}
                _hover={{
                  bg: 'blue.600',
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('blue.600', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    {
      label: 'Services',
      href: '/services',
    },
    {
      label: 'Stylists',
      href: '/stylists',
    },
    ...(isAuthenticated()
      ? [
          {
            label: 'My Bookings',
            href: '/bookings',
          },
        ]
      : []),
    ...(isAuthenticated() && user?.role === 'admin'
      ? [
          {
            label: 'Admin',
            children: [
              {
                label: 'Dashboard',
                subLabel: 'View admin dashboard',
                href: '/admin/dashboard',
              },
              {
                label: 'Users',
                subLabel: 'Manage users',
                href: '/admin/users',
              },
              {
                label: 'Services',
                subLabel: 'Manage services',
                href: '/admin/services',
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <Stack direction={'row'} spacing={4} align="center">
      {navItems.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                p={2}
                href={navItem.href ?? '#'}
                as={navItem.href ? RouterLink : undefined}
                to={navItem.href}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={ChevronDownIcon}
                    transition={'all .25s ease-in-out'}
                    w={4}
                    h={4}
                    ml={1}
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      href={href}
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'blue.400' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'blue.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  const { isAuthenticated, user } = useAuth();
  
  const navItems = [
    {
      label: 'Services',
      href: '/services',
    },
    {
      label: 'Stylists',
      href: '/stylists',
    },
    ...(isAuthenticated()
      ? [
          {
            label: 'My Bookings',
            href: '/bookings',
          },
          {
            label: 'Profile',
            href: '/profile',
          },
        ]
      : []),
    ...(isAuthenticated() && user?.role === 'admin'
      ? [
          {
            label: 'Admin Dashboard',
            href: '/admin/dashboard',
          },
          {
            label: 'Manage Users',
            href: '/admin/users',
          },
          {
            label: 'Manage Services',
            href: '/admin/services',
          },
        ]
      : []),
    ...(isAuthenticated() && user?.role === 'stylist'
      ? [
          {
            label: 'Stylist Dashboard',
            href: '/stylist/dashboard',
          },
          {
            label: 'My Availability',
            href: '/stylist/availability',
          },
        ]
      : []),
  ];

  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {navItems.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, href }) => {
  return (
    <Stack spacing={4}>
      <Flex
        py={2}
        as={RouterLink}
        to={href}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
      </Flex>
    </Stack>
  );
};

export default Navbar;
