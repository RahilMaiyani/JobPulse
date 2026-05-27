jest.mock('../src/services/emailService', () => ({
  sendApplicationReceivedEmail: jest.fn(),
  sendStatusUpdateEmail: jest.fn(),
  sendTestAvailableEmail: jest.fn(),
  sendTestResultEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  sendInterviewScheduledEmail: jest.fn(),
}));

process.env.JWT_SECRET = 'test_secret';
