import { Badge, Box, Heading } from '@chakra-ui/react';

function App() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bg="gray.50"
    >
      <Badge>
        <Heading size="5xl">Personal Library Management System</Heading>
      </Badge>
    </Box>
  );
}

export default App;

