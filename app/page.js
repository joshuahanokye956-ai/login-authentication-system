import { redirect } from 'next/navigation';
import { currentUser, home } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Index() {
  const u = await currentUser();
  redirect(u ? home[u.role] : '/login');
}
