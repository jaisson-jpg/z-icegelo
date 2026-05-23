"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erro no login");
      return;
    }
    if (data.user?.role === "ADMIN") router.push("/admin");
    else if (data.user?.role === "LOJISTA") router.push("/lojista");
    else router.push("/minha-conta");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--zice-dark)] text-center mb-8">Entrar</h1>
      <form onSubmit={handleSubmit} className="ice-card rounded-2xl p-8 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            className="input-field"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            className="input-field"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-center text-sm text-gray-600">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-[var(--zice-medium)] font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
