"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erro no cadastro");
      return;
    }
    router.push("/minha-conta");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--zice-dark)] text-center mb-2">Cadastro</h1>
      <p className="text-center text-gray-600 mb-8 text-sm">
        Crie sua conta e acumule pontos Z-ice em cada compra
      </p>
      <form onSubmit={handleSubmit} className="ice-card rounded-2xl p-8 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        {(["name", "email", "phone", "password"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field === "name" ? "Nome" : field === "phone" ? "Telefone" : field === "password" ? "Senha" : "E-mail"}
            </label>
            <input
              type={field === "email" ? "email" : field === "password" ? "password" : "text"}
              className="input-field"
              required={field !== "phone"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Cadastrando..." : "Criar conta"}
        </button>
        <p className="text-center text-sm text-gray-600">
          Já tem conta?{" "}
          <Link href="/login" className="text-[var(--zice-medium)] font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
