import { BannerForm } from '@/components/admin/BannerForm';

export default function NovoBannerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-2">Novo Banner</h1>
      <p className="text-sm text-gray-600 mb-6">
        Crie um novo banner para o slider da página inicial
      </p>
      <BannerForm />
    </div>
  );
}
