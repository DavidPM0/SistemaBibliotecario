"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { apiJson, formatMoney } from "@/lib/client";
import { Client, Work } from "@/lib/types";

type NewWork = {
  name: string;
  clientId: string;
  type: string;
  status: "Presupuestando" | "En Progreso" | "Finalizado";
  progress: number;
  totalValue: number;
  startDate: string;
  dueDate: string;
  description: string;
  location: string;
};

const initialForm: NewWork = {
  name: "",
  clientId: "",
  type: "Industrial",
  status: "Presupuestando",
  progress: 0,
  totalValue: 0,
  startDate: "",
  dueDate: "",
  description: "",
  location: ""
};

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewWork>(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [worksPayload, clientsPayload] = await Promise.all([
      apiJson<Work[]>("/api/works"),
      apiJson<Client[]>("/api/clients")
    ]);
    setWorks(worksPayload);
    setClients(clientsPayload);
    setForm((current) => ({ ...current, clientId: current.clientId || clientsPayload[0]?.id || "" }));
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return works.filter((work) => {
      const byName = `${work.name} ${work.clientName}`.toLowerCase().includes(query.toLowerCase());
      const byStatus = statusFilter === "Todos" || work.status === statusFilter;
      return byName && byStatus;
    });
  }, [works, query, statusFilter]);

  async function createWork(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await apiJson("/api/works", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear obra");
    }
  }

  async function increaseProgress(work: Work) {
    const next = Math.min(100, work.progress + 10);
    await apiJson(`/api/works/${work.id}`, {
      method: "PUT",
      body: JSON.stringify({ progress: next, status: next === 100 ? "Finalizado" : "En Progreso" })
    });
    await load();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Gestión de Obras y Proyectos</h2>
          <p>Administrar obras, presupuestos y avance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Nueva Obra</button>
      </div>

      <div className="grid-4">
        <article className="card metric"><h4>Presupuestando</h4><b>{works.filter((w) => w.status === "Presupuestando").length}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#ff730f" }}><h4>En Progreso</h4><b>{works.filter((w) => w.status === "En Progreso").length}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#18a957" }}><h4>Finalizadas</h4><b>{works.filter((w) => w.status === "Finalizado").length}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#9b3cf7" }}><h4>Valor Total Activas</h4><b>{formatMoney(works.reduce((acc, item) => acc + item.totalValue, 0))}</b></article>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="toolbar">
        <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre de obra..." />
        <select className="search" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>Todos</option>
          <option>Presupuestando</option>
          <option>En Progreso</option>
          <option>Finalizado</option>
        </select>
      </div>

      <section className="work-grid">
        {filtered.map((work) => (
          <article key={work.id} className="card">
            <div className="work-card-head">
              <h3 className="work-title">{work.name}</h3>
              <span className={`badge work-status ${work.status === "Finalizado" ? "badge-gray" : "badge-blue"}`}>{work.status}</span>
            </div>
            <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>{work.clientName}</div>
            <div className="progress"><span style={{ width: `${work.progress}%` }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><small>Progreso</small><strong>{work.progress}%</strong></div>
            <p style={{ margin: "10px 0 0" }}>Valor total: <strong>{formatMoney(work.totalValue)}</strong></p>
            {work.delayDays > 0 && work.status !== "Finalizado" ? (
              <div className="alert-row" style={{ marginTop: 10 }}>Retraso de {work.delayDays} días</div>
            ) : null}
            <div className="actions">
              <button className="btn btn-ghost" onClick={() => void increaseProgress(work)}>+10% avance</button>
            </div>
          </article>
        ))}
      </section>

      <Modal open={open} title="Nueva Obra - Información General" onClose={() => setOpen(false)}>
        <form onSubmit={createWork}>
          <div className="field"><label>Cliente</label><select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div>
          <div className="field"><label>Nombre del proyecto</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="row">
            <div className="field"><label>Tipo de obra</label><input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required /></div>
            <div className="field"><label>Valor total (S/)</label><input type="number" min={0} value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: Number(e.target.value) })} /></div>
          </div>
          <div className="field"><label>Descripción detallada</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div className="field"><label>Ubicación de la obra</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
          <div className="row">
            <div className="field"><label>Fecha de inicio</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div className="field"><label>Fecha de fin estimada</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></div>
          </div>
          {error ? <div className="error-box">{error}</div> : null}
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-primary">Guardar Obra</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

