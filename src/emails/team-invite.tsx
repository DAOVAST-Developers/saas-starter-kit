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

export interface TeamInviteEmailProps {
  orgName: string;
  role: string;
  acceptUrl: string;
}

export default function TeamInviteEmail({
  orgName,
  role,
  acceptUrl,
}: TeamInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to {orgName}</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <Heading>Join {orgName}</Heading>
          <Text>
            You&apos;ve been invited to join <strong>{orgName}</strong> as a{' '}
            <strong>{role}</strong>.
          </Text>
          <Link href={acceptUrl}>Accept invitation</Link>
        </Container>
      </Body>
    </Html>
  );
}
