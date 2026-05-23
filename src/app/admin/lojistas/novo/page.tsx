import { LojistaForm } from "@/components/admin/LojistaForm";

export default function NovoLojistaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-6">Novo Lojista</h1>
      <LojistaForm />
    </div>
  );
}
