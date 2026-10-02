import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NegotiationChatClient from '@/components/NegotiationChatClient';

export default async function AdminOfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div className="p-6">
      <NegotiationChatClient offerId={id} isAdmin={true} />
    </div>
  );
}
