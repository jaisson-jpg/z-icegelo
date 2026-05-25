"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

import { cn, maskPhone } from "@/lib/utils";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "",
    address: "",
    city: "",
    number: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, phone: maskPhone(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Erro no cadastro");
        setLoading(false);
        return;
      }
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/minha-conta");
      }
      router.refresh();
    } catch (err) {
      setError("Ocorreu um erro ao tentar criar sua conta. Verifique sua conexão.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--zice-dark)] text-center mb-2">Cadastro</h1>
      <p className="text-center text-gray-600 mb-8 text-sm">
        Crie sua conta e acumule pontos Z-ice em cada compra
      </p>
      <form onSubmit={handleSubmit} className="ice-card rounded-2xl p-8 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo *</label>
            <input
              type="text"
              className="input-field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-mail *</label>
              <input
                type="email"
                className="input-field"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="text"
                className="input-field"
                required
                placeholder="(47) 99999-9999"
                value={form.phone}
                onChange={handlePhoneChange}
                maxLength={15}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Endereço *</label>
              <input
                type="text"
                className="input-field"
                required
                placeholder="Rua, Avenida..."
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nº *</label>
              <input
                type="text"
                className="input-field"
                required
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cidade *</label>
            <input
              type="text"
              className="input-field"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha *</label>
            <input
              type="password"
              className="input-field"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className={cn("btn-primary w-full mt-4", loading && "btn-loading")}>
          {loading ? "" : "Criar conta"}
        </button>
        <p className="text-center text-sm text-gray-600 pt-2">
          Já tem conta?{" "}
          <Link href={redirect ? `/login?redirect=${redirect}` : "/login"} className="text-[var(--zice-medium)] font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Carregando...</div>}>
      <CadastroForm />
    </Suspense>
  );
}
