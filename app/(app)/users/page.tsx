"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { apiJson, formatDate } from "@/lib/client";
import { User } from "@/lib/types";

type UserForm = {
  fullName: string;
  username: string;
  role: "Administrador" | "Empleado";
  status: "Activo" | "Inactivo";
  password: string;
};

const initialForm: UserForm = {
  fullName: "",
  username: "",
  role: "Empleado",
  status: "Activo",
  password: ""
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const payload = await apiJson<User[]>("/api/users");
    setUsers(payload);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await apiJson<User>("/api/users", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar usuario");
    }
  }

  async function remove(id: string) {
    await apiJson(`/api/users/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = users.filter((user) => {
    const value = `${user.fullName} ${user.username}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p>Administrar usuarios del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Registrar Usuario</button>
      </div>

      <div className="toolbar">
        <input className="search" placeholder="Buscar por nombre o usuario..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <section className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>@{user.username}</td>
                <td><span className={user.role === "Administrador" ? "badge badge-blue" : "badge badge-gray"}>{user.role}</span></td>
                <td><span className={user.status === "Activo" ? "badge badge-blue" : "badge badge-red"}>{user.status}</span></td>
                <td>{formatDate(user.lastAccess)}</td>
                <td><button className="btn btn-ghost" onClick={() => void remove(user.id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal open={open} title="Registrar Nuevo Usuario" onClose={() => setOpen(false)}>
        <form onSubmit={createUser}>
          <div className="row">
            <div className="field"><label>Nombre completo</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
            <div className="field"><label>Usuario</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          </div>
          <div className="row">
            <div className="field"><label>Rol</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "Administrador" | "Empleado" })}><option>Administrador</option><option>Empleado</option></select></div>
            <div className="field"><label>Estado</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Activo" | "Inactivo" })}><option>Activo</option><option>Inactivo</option></select></div>
          </div>
          <div className="field"><label>Contraseña</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          {error ? <div className="error-box">{error}</div> : null}
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-primary">Guardar Usuario</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

