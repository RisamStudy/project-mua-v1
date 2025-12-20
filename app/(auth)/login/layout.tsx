import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - RORO MUA Admin',
  description: 'Sign in to your RORO MUA admin dashboard',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}