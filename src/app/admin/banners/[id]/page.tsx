import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BannerForm } from '@/components/admin/BannerForm';
import Link from 'next/link';

export default async function EditarBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/banners"
          className="text-sm text-[var(--zice-medium)] hover:underline"
        >
          ← Voltar para banners
        </Link>
        <h1 className="text-2xl font-bold text-[var(--zice-dark)] mt-2">Editar Banner</h1>
      </div>
      <BannerForm banner={banner} />
    </div>
  );
}
