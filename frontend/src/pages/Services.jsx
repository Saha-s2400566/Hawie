import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const ServiceTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const Price = styled.span`
  color: #007bff;
  font-weight: bold;
  font-size: 1.1rem;
`;

const Description = styled.p`
  color: #666;
  margin: 1rem 0;
  line-height: 1.5;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #000;
  }
`;

const Services = () => {
    const services = [
        {
            id: 1,
            name: 'Hair Styling',
            price: '$50',
            description: 'Professional hair styling services for all hair types. Includes wash, cut, and style.',
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80'
        },
        {
            id: 2,
            name: 'Facial Treatment',
            price: '$80',
            description: 'Rejuvenating facial treatments to cleanse, exfoliate, and nourish your skin.',
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
        },
        {
            id: 3,
            name: 'Massage Therapy',
            price: '$100',
            description: 'Relaxing full-body massage to relieve stress and muscle tension.',
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
        },
        {
            id: 4,
            name: 'Manicure & Pedicure',
            price: '$45',
            description: 'Complete nail care services including shaping, cuticle care, and polish.',
            image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
        }
    ];

    return (
        <Container>
            <Header>
                <Title>Our Services</Title>
                <p>Discover our premium beauty and wellness treatments</p>
            </Header>
            <Grid>
                {services.map(service => (
                    <Card key={service.id}>
                        <Image src={service.image} alt={service.name} />
                        <Content>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <ServiceTitle>{service.name}</ServiceTitle>
                                <Price>{service.price}</Price>
                            </div>
                            <Description>{service.description}</Description>
                            <Button>Book Now</Button>
                        </Content>
                    </Card>
                ))}
            </Grid>
        </Container>
    );
};

export default Services;
