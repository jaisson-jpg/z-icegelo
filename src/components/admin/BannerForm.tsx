'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type BannerFormData = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  active: boolean;
  sortOrder: number;
};

export function BannerForm({ banner }: { banner?: BannerFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(banner?.imageUrl || null);

  const [form, setForm] = useState({
    title: banner?.title || '',
    description: banner?.description || '',
    imageUrl: banner?.imageUrl || '',
    linkUrl: banner?.linkUrl || '',
    active: banner?.active ?? true,
    sortOrder: banner?.sortOrder || 0,
  });

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (imageFile) fd.append('image', imageFile);

    const url = banner
      ? `/api/admin/banners/${banner.id}`
      : '/api/admin/banners';
    const res = await fetch(url, {
      method: banner ? 'PATCH' : 'POST',
      body: fd,
    });

    setLoading(false);
    if (res.ok) {
      router.push('/admin/banners');
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || 'Erro ao salvar banner');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 sm:p-6 space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">Imagem do Banner *</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="rounded-xl object-cover w-full sm:w-64 h-32"
            />
          ) : (
            <div className="w-full sm:w-64 h-32 ice-gradient rounded-xl flex items-center justify-center text-4xl">
              🖼️
            </div>
          )}
          <div className="flex-1 space-y-3">
            <label className="flex items-center gap-2 btn-outline cursor-pointer text-sm w-fit">
              <span>📤</span>
              Escolher arquivo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </label>
            <div>
              <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Ou cole um link de imagem:</p>
              <input
                type="text"
                placeholder="https://exemplo.com/banner.jpg"
                className="input-field text-xs py-2"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            className="input-field"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Link</label>
          <input
            type="url"
            className="input-field"
            placeholder="https://exemplo.com"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          className="input-field min-h-[80px]"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ordem</label>
          <input
            type="number"
            className="input-field"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <input
            type="checkbox"
            className="w-5 h-5 accent-[var(--zice-medium)]"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <label className="text-sm font-medium">Banner Ativo</label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
        {loading ? 'Salvando...' : banner ? 'Atualizar Banner' : 'Criar Banner'}
      </button>
    </form>
  );
}
