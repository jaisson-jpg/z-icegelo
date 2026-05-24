export type Neighborhood = {
  name: string;
  distanceKm: number;
};

// Lista de bairros de Guaramirim e arredores (Distâncias aproximadas a partir da Rua Lauro Zimmerman, 3947)
// Lista pré-ordenada para evitar problemas de hidratação
export const NEIGHBORHOODS: Neighborhood[] = [
  { name: "Amizade", distanceKm: 3.2 },
  { name: "Avaí", distanceKm: 2.5 },
  { name: "Bananal do Sul", distanceKm: 6.2 },
  { name: "Beira Rio", distanceKm: 3.5 },
  { name: "Brüderthal", distanceKm: 7.5 },
  { name: "Centro (Guaramirim)", distanceKm: 1.5 },
  { name: "Centro (Jaraguá do Sul)", distanceKm: 10.0 },
  { name: "Corticeira", distanceKm: 4.8 },
  { name: "Imigrantes", distanceKm: 2.0 },
  { name: "Jaraguá Esquerdo (Jaraguá)", distanceKm: 8.5 },
  { name: "Rio Branco", distanceKm: 5.0 },
  { name: "Outro / Não listado", distanceKm: 12.0 },
];

export function calculateDeliveryFee(distanceKm: number, totalSacos: number, totalOrder: number): number {
  // Regra 1: Grátis se for dentro de 2km
  if (distanceKm <= 2) return 0;

  // Regra 2: Grátis se o pedido for acima de R$ 100,00
  if (totalOrder >= 100) return 0;

  // Regra 3: Cálculo por veículo
  // Até 2 sacos = Moto (R$ 1.00 por km)
  // Mais de 2 sacos = Carro (R$ 3.50 por km)
  const ratePerKm = totalSacos <= 2 ? 1.0 : 3.5;
  
  return distanceKm * ratePerKm;
}
