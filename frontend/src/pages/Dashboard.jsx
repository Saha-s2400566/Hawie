import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #f5f5f5;
  color: #666;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #f5f5f5;
`;

const Status = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  background: ${props => {
        switch (props.status) {
            case 'Confirmed': return '#e3fcef';
            case 'Pending': return '#fff8c5';
            case 'Cancelled': return '#ffe5e5';
            default: return '#f5f5f5';
        }
    }};
  color: ${props => {
        switch (props.status) {
            case 'Confirmed': return '#006644';
            case 'Pending': return '#8a6a00';
            case 'Cancelled': return '#cc0000';
            default: return '#666';
        }
    }};
`;

const Dashboard = () => {
    const appointments = [
        { id: 1, service: 'Hair Styling', date: '2023-11-25', time: '10:00 AM', status: 'Confirmed' },
        { id: 2, service: 'Facial Treatment', date: '2023-11-28', time: '2:30 PM', status: 'Pending' },
        { id: 3, service: 'Manicure', date: '2023-11-20', time: '4:00 PM', status: 'Completed' }
    ];

    return (
        <Container>
            <Header>
                <Title>Welcome back, User!</Title>
            </Header>

            <StatsGrid>
                <StatCard>
                    <StatValue>3</StatValue>
                    <StatLabel>Upcoming Appointments</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>12</StatValue>
                    <StatLabel>Total Bookings</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>$450</StatValue>
                    <StatLabel>Total Spent</StatLabel>
                </StatCard>
            </StatsGrid>

            <Section>
                <SectionTitle>Recent Appointments</SectionTitle>
                <Table>
                    <thead>
                        <tr>
                            <Th>Service</Th>
                            <Th>Date</Th>
                            <Th>Time</Th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(apt => (
                            <tr key={apt.id}>
                                <Td>{apt.service}</Td>
                                <Td>{apt.date}</Td>
                                <Td>{apt.time}</Td>
                                <Td><Status status={apt.status}>{apt.status}</Status></Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Section>
        </Container>
    );
};

export default Dashboard;
