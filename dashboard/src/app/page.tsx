import { redirect } from 'next/navigation'

export default function Home() {
  // Simply redirect to login - middleware will handle redirecting logged-in users to dashboard
  redirect('/login')
}
