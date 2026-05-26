"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type ChartPoint = { label: string; total: number; count: number };

export function SalesCharts({
  weekly,
  monthly,
  yearly,
}: {
  weekly: ChartPoint[];
  monthly: ChartPoint[];
  yearly: ChartPoint[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  if (!mounted) return <div className="space-y-8 animate-pulse">
    <div className="h-64 bg-gray-50 rounded-xl border"></div>
    <div className="h-64 bg-gray-50 rounded-xl border"></div>
    <div className="h-64 bg-gray-50 rounded-xl border"></div>
  </div>;

  return (
    <div className="space-y-8">
      <ChartBlock title="Vendas — Últimas 8 semanas" data={weekly} formatBRL={formatBRL} />
      <ChartBlock title="Vendas — Últimos 12 meses" data={monthly} formatBRL={formatBRL} line />
      <ChartBlock title="Vendas — Por ano" data={yearly} formatBRL={formatBRL} />
    </div>
  );
}

function ChartBlock({
  title,
  data,
  formatBRL,
  line,
}: {
  title: string;
  data: ChartPoint[];
  formatBRL: (v: number) => string;
  line?: boolean;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-bold text-[var(--zice-dark)] mb-2">{title}</h3>
        <p className="text-sm text-gray-500">Sem dados confirmados ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-4 sm:p-6">
      <h3 className="font-bold text-[var(--zice-dark)] mb-4 text-sm sm:text-base">{title}</h3>
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {line ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Line type="monotone" dataKey="total" stroke="#00a0e3" strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Bar dataKey="total" fill="#004a80" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
