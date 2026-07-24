"use client";

import { useState } from "react";

const priceSeries = {
  "Costillar de Cerdo Notable": [4890, 5050, 4980, 5290, 5450, 5590],
  "Pechuga con Hueso Languiru": [3190, 3250, 3380, 3320, 3490, 3650],
  "Posta Rosada Minerva": [6790, 6950, 7210, 7140, 7390, 7650],
  "Trimming 90/10": [3990, 4120, 4050, 4270, 4390, 4480],
} as const;

const campaigns = ["Feb", "Mar", "Abr", "May", "Jun", "Jul"] as const;
const chart = { height: 220, left: 58, top: 20, width: 650 };
const currency = new Intl.NumberFormat("es-CL", {
  currency: "CLP",
  maximumFractionDigits: 0,
  style: "currency",
});

type ProductName = keyof typeof priceSeries;

export function ProductPriceTrend() {
  const [product, setProduct] = useState<ProductName>("Costillar de Cerdo Notable");
  const values = priceSeries[product];
  const min = Math.floor((Math.min(...values) - 250) / 500) * 500;
  const max = Math.ceil((Math.max(...values) + 250) / 500) * 500;
  const range = max - min;
  const x = (index: number) => chart.left + (index * chart.width) / (values.length - 1);
  const y = (value: number) => chart.top + chart.height - ((value - min) / range) * chart.height;
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const change = ((values.at(-1)! - values[0]) / values[0]) * 100;
  const gridValues = [max, Math.round((max + min) / 2), min];

  return (
    <div className="rounded-xl border border-dashed border-blue/35 bg-blue-50/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue">
            Funcionalidad adicional — se puede integrar a la intranet
          </p>
          <h2 className="mt-2 text-lg font-semibold text-navy">Evolución de precio por campaña</h2>
          <p className="mt-1 text-sm text-ink/55">Datos demostrativos en pesos chilenos por kilo.</p>
        </div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/55">
          Producto
          <select
            className="mt-1.5 block min-w-64 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-navy outline-none focus:border-blue"
            onChange={(event) => setProduct(event.target.value as ProductName)}
            value={product}
          >
            {Object.keys(priceSeries).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_180px]">
        <div className="overflow-x-auto rounded-xl bg-white p-3">
          <svg aria-label={`Evolución del precio de ${product}`} className="h-auto min-w-[620px] w-full" role="img" viewBox="0 0 760 285">
            {gridValues.map((value) => (
              <g key={value}>
                <line stroke="#dce3ef" strokeDasharray="5 5" x1={chart.left} x2={chart.left + chart.width} y1={y(value)} y2={y(value)} />
                <text fill="#6b7280" fontSize="12" textAnchor="end" x={chart.left - 10} y={y(value) + 4}>
                  {currency.format(value)}
                </text>
              </g>
            ))}
            <polygon
              fill="#77a8ff"
              opacity="0.14"
              points={`${chart.left},${chart.top + chart.height} ${points} ${chart.left + chart.width},${chart.top + chart.height}`}
            />
            <polyline fill="none" points={points} stroke="#0b2a55" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            {values.map((value, index) => (
              <g key={campaigns[index]}>
                <circle cx={x(index)} cy={y(value)} fill="#fff" r="6" stroke="#77a8ff" strokeWidth="4" />
                <text fill="#071d43" fontSize="12" fontWeight="600" textAnchor="middle" x={x(index)} y={y(value) - 14}>
                  {currency.format(value)}
                </text>
                <text fill="#6b7280" fontSize="12" textAnchor="middle" x={x(index)} y={chart.top + chart.height + 28}>
                  {campaigns[index]} 2026
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <PriceCard label="Última campaña" value={currency.format(values.at(-1)!)} />
          <PriceCard label="Variación período" positive={change >= 0} value={`${change >= 0 ? "+" : ""}${change.toFixed(1)}%`} />
          <PriceCard label="Promedio" value={currency.format(Math.round(values.reduce((sum, value) => sum + value, 0) / values.length))} />
        </div>
      </div>
    </div>
  );
}

function PriceCard({
  label,
  positive,
  value,
}: {
  label: string;
  positive?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs text-ink/50">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${positive === undefined ? "text-navy" : positive ? "text-emerald-700" : "text-red-700"}`}>
        {value}
      </p>
    </div>
  );
}
