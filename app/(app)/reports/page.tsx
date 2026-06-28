"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson, formatMoney } from "@/lib/client";
import { Client, Payment, Work } from "@/lib/types";

export default function ReportsPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    Promise.all([
      apiJson<Work[]>("/api/works"),
      apiJson<Client[]>("/api/clients"),
      apiJson<Payment[]>("/api/payments")
    ]).then(([worksPayload, clientsPayload, paymentsPayload]) => {
      setWorks(worksPayload);
      setClients(clientsPayload);
      setPayments(paymentsPayload);
    });
  }, []);

  const totals = useMemo(() => {
    const billed = works.reduce((acc, work) => acc + work.totalValue, 0);
    const paid = payments.filter((payment) => payment.status === "Pagado").reduce((acc, payment) => acc + payment.amount, 0);
    const pending = billed - paid;
    return { billed, paid, pending };
  }, [works, payments]);

  const delayed = works.filter((work) => work.delayDays > 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Reportes y Analítica</h2>
          <p>Resumen financiero y seguimiento integral</p>
        </div>
      </div>

      <div className="grid-4">
        <article className="card metric"><h4>Total Facturado</h4><b>{formatMoney(totals.billed)}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#18a957" }}><h4>Total Pagado</h4><b>{formatMoney(totals.paid)}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#ff730f" }}><h4>Saldo Pendiente</h4><b>{formatMoney(totals.pending)}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#9b3cf7" }}><h4>Obras Activas</h4><b>{works.filter((work) => work.status !== "Finalizado").length}</b></article>
      </div>

      <section className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>Comportamiento de pagos</h3>
        <div className="grid-4">
          <div className="card"><strong>Días de retraso promedio</strong><div>{delayed.length === 0 ? 0 : Math.round(delayed.reduce((acc, item) => acc + item.delayDays, 0) / delayed.length)} días</div></div>
          <div className="card"><strong>Tasa de cumplimiento</strong><div>{works.length === 0 ? 0 : Math.round((works.filter((work) => work.delayDays === 0).length / works.length) * 100)}%</div></div>
          <div className="card"><strong>Pagos con retraso</strong><div>{payments.filter((payment) => payment.status === "Vencido").length}</div></div>
          <div className="card"><strong>Clientes</strong><div>{clients.length}</div></div>
        </div>
      </section>

      <section className="card table-wrap">
        <h3 style={{ marginTop: 0 }}>Historial de Obras</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Obra</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Avance</th>
              <th>Valor Total</th>
              <th>Retraso</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.id}>
                <td>{work.name}</td>
                <td>{work.clientName}</td>
                <td>{work.type}</td>
                <td><span className={work.status === "Finalizado" ? "badge badge-gray" : "badge badge-blue"}>{work.status}</span></td>
                <td>{work.progress}%</td>
                <td>{formatMoney(work.totalValue)}</td>
                <td>{work.delayDays > 0 ? `${work.delayDays} días` : "Sin retraso"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

