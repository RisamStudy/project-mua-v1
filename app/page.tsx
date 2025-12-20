import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect ke login sebagai halaman pertama
  redirect('/login');
}