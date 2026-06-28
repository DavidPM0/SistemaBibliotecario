"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { apiJson } from "@/lib/client";
import { Client } from "@/lib/types";

type ClientForm = {
  type: "Persona Natural" | "Empresa";
  name: string;
  ruc: string;
  address: string;
  district: string;
  phone: string;
  email: string;
  status: "Activo" | "Inactivo";
  contactPerson: string;
};

const initialForm: ClientForm = {
  type: "Persona Natural",
  name: "",
  ruc: "",
  address: "",
  district: "",
  phone: "",
  email: "",
  status: "Activo" as const,
  contactPerson: ""
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const payload = await apiJson<Client[]>("/api/clients");
    setClients(payload);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createClient(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await apiJson<Client>("/api/clients", {
        method: "POST",
        body: JSON.stringify({ ...form, contactPerson: form.contactPerson || undefined })
      });
      setOpen(false);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar cliente");
    }
  }

  async function remove(id: string) {
    try {
      await apiJson(`/api/clients/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar cliente");
    }
  }

  const filtered = clients.filter((client) => {
    const value = `${client.name} ${client.ruc}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Gestión de Clientes</h2>
          <p>Administrar clientes y sus datos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Registrar Cliente</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="toolbar">
        <input className="search" placeholder="Buscar por nombre, RUC o razón social..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <section className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Razón Social</th>
              <th>RUC</th>
              <th>Tipo</th>
              <th>Obras Activas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id}>
                <td>{client.name}<div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{client.district}</div></td>
                <td>{client.ruc}</td>
                <td><span className="badge badge-gray">{client.type}</span></td>
                <td>{client.activeWorks}</td>
                <td><span className={client.status === "Activo" ? "badge badge-blue" : "badge badge-red"}>{client.status}</span></td>
                <td><button className="btn btn-ghost" onClick={() => void remove(client.id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal open={open} title="Registrar Nuevo Cliente" onClose={() => setOpen(false)}>
        <form onSubmit={createClient}>
          <div className="field">
            <label>Tipo de cliente</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "Persona Natural" | "Empresa" })}>
              <option>Persona Natural</option>
              <option>Empresa</option>
            </select>
          </div>
          <div className="row">
            <div className="field"><label>Nombre completo / Razón social</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="field"><label>RUC</label><input value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} required /></div>
          </div>
          <div className="field"><label>Dirección</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
          <div className="row">
            <div className="field"><label>Distrito / Ciudad</label><input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required /></div>
            <div className="field"><label>Teléfono principal</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          </div>
          <div className="row">
            <div className="field"><label>Email principal</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="field"><label>Persona de contacto</label><input value={form.contactPerson} disabled={form.type !== "Empresa"} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
          </div>

          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-primary">Guardar Cliente</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

