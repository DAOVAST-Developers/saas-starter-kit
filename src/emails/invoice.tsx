import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

export interface InvoiceEmailProps {
  name: string;
  amount: string;
  plan: string;
  periodEnd: string;
}

export default function InvoiceEmail({
  name,
  amount,
  plan,
  periodEnd,
}: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your payment was successful</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <Heading>Payment received</Heading>
          <Text>Hi {name},</Text>
          <Text>
            We&apos;ve received your payment of <strong>{amount}</strong> for the{' '}
            <strong>{plan}</strong> plan. Your subscription is active until{' '}
            {periodEnd}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
