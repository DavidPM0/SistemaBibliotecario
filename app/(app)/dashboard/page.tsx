"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/client";

type DashboardPayload = {
  metrics: {
    worksActive: number;
    worksBudgeting: number;
    workValue: number;
    inventoryValue: number;
    alerts: { lowStock: number; overduePayments: number; upcomingPayments: number };
  };
  lowStock: Array<{ id: string; name: string; stock: number; stockMin: number }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then(setData);
  }, []);

  if (!data) return <div className="card">Cargando dashboard...</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Buenos días, Luis Orlando</h2>
          <p>Resumen del sistema y alertas críticas</p>
        </div>
      </div>

      <div className="grid-4">
        <article className="card metric"><h4>Obras Activas</h4><b>{data.metrics.worksActive}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#ff730f" }}><h4>En Presupuestando</h4><b>{data.metrics.worksBudgeting}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#18a957" }}><h4>Valor en Obras</h4><b>{formatMoney(data.metrics.workValue)}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#9b3cf7" }}><h4>Inventario Valorizado</h4><b>{formatMoney(data.metrics.inventoryValue)}</b></article>
      </div>

      <section className="card" style={{ borderColor: "#ffdbdb" }}>
        <h3 style={{ marginTop: 0 }}>Alertas Críticas del Sistema</h3>
        <div className="grid-4" style={{ marginBottom: 0 }}>
          <div className="card"><strong>Stock Bajo</strong><div>{data.metrics.alerts.lowStock}</div></div>
          <div className="card"><strong>Pagos Vencidos</strong><div>{data.metrics.alerts.overduePayments}</div></div>
          <div className="card"><strong>Pagos Próximos</strong><div>{data.metrics.alerts.upcomingPayments}</div></div>
          <div className="card"><strong>Total Alertas</strong><div>{data.metrics.alerts.lowStock + data.metrics.alerts.overduePayments + data.metrics.alerts.upcomingPayments}</div></div>
        </div>

        {data.lowStock.map((material) => (
          <div key={material.id} className="alert-row">
            <strong>Stock crítico de {material.name}</strong>
            <div>Stock actual ({material.stock}) está por debajo del mínimo ({material.stockMin})</div>
          </div>
        ))}
      </section>
    </>
  );
}

