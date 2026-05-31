"use client";

import { useState } from "react";
import { Calculator, Scale, DollarSign, Info } from "lucide-react";

export function SmartCalculator() {
  const [weight, setWeight] = useState<number>(0);
  const [costPerKg, setCostPerKg] = useState<number>(0.5); // Custo base sugerido
  const [margin, setMargin] = useState<number>(100); // Margem sugerida 100%
  
  const totalCost = weight * costPerKg;
  const suggestedPrice = totalCost * (1 + margin / 100);
  const profit = suggestedPrice - totalCost;

  return (
    <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Calculator size={24} />
        </div>
        <div>
          <h3 className="font-bold text-[var(--zice-dark)]">Calculadora Inteligente</h3>
          <p className="text-xs text-gray-500 uppercase font-bold">Sugestão de Preço Final</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
            <Scale size={14} /> Peso do Gelo (kg)
          </label>
          <input
            type="number"
            min="0"
            className="input-field"
            value={weight || ""}
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="Ex: 5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
            <DollarSign size={14} /> Custo p/ kg (R$)
          </label>
          <input
            type="number"
            step="0.1"
            className="input-field"
            value={costPerKg || ""}
            onChange={(e) => setCostPerKg(Number(e.target.value))}
            placeholder="Ex: 0.50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
            📈 Margem Desejada (%)
          </label>
          <input
            type="number"
            className="input-field"
            value={margin || ""}
            onChange={(e) => setMargin(Number(e.target.value))}
            placeholder="Ex: 100"
          />
        </div>
      </div>

      <div className="bg-[var(--zice-ice)] rounded-2xl p-6 border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Custo Total</p>
          <p className="text-xl font-bold text-gray-600">R$ {totalCost.toFixed(2)}</p>
        </div>
        <div className="text-center border-x border-blue-200">
          <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Preço Sugerido</p>
          <p className="text-3xl font-black text-[var(--zice-dark)]">R$ {suggestedPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-green-400 uppercase mb-1">Lucro Estimado</p>
          <p className="text-xl font-bold text-green-600">R$ {profit.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <Info className="text-blue-500 shrink-0" size={20} />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Dica Z-ice:</strong> Para gelo em cubo, o custo médio por kg (incluindo energia e embalagem) costuma variar entre R$ 0,40 e R$ 0,70. Margens acima de 100% são ideais para cobrir custos fixos e investimentos em máquinas.
        </p>
      </div>
    </div>
  );
}
