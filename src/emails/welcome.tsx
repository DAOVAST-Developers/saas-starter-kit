import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

export interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to SaaS Starter</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <Heading>Welcome, {name}!</Heading>
          <Text>
            Thanks for signing up. Your account is ready — head to your dashboard
            to get started.
          </Text>
          <Link href={dashboardUrl}>Open dashboard</Link>
        </Container>
      </Body>
    </Html>
  );
}
