import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Hero = styled.div`
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80');
  background-size: cover;
  background-position: center;
  height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 10px;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
`;

const Home = () => {
  return (
    <Container>
      <Hero>
        <Title>Welcome to Hawo</Title>
        <Subtitle>Your Premium Beauty & Wellness Destination</Subtitle>
      </Hero>
      <h2>Our Services</h2>
      <p>Explore our wide range of beauty and wellness treatments designed just for you.</p>
    </Container>
  );
};

export default Home;
