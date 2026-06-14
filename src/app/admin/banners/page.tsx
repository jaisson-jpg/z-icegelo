import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zice-dark)]">Banners</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie os banners do slider da página inicial
          </p>
        </div>
        <Link href="/admin/banners/novo" className="btn-primary text-sm">
          ➕ Novo Banner
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--zice-ice)]">
              <tr>
                <th className="text-left p-3">Ordem</th>
                <th className="text-left p-3">Imagem</th>
                <th className="text-left p-3">Título</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className={`border-t ${!banner.active ? 'opacity-50 bg-gray-50' : ''}`}>
                  <td className="p-3 text-gray-500">{banner.sortOrder}</td>
                  <td className="p-3">
                    <div className="relative w-32 h-16 rounded-lg overflow-hidden border">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title || 'Banner'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-3 font-medium">{banner.title || 'Sem título'}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        banner.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/banners/${banner.id}`}
                        className="p-2 text-[var(--zice-medium)] hover:bg-[var(--zice-ice)] rounded-lg"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {banners.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            Nenhum banner cadastrado.{' '}
            <Link href="/admin/banners/novo" className="text-[var(--zice-medium)] font-semibold hover:underline">
              Cadastrar o primeiro
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
