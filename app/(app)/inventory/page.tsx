"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { apiJson, formatMoney } from "@/lib/client";
import { Material } from "@/lib/types";

type NewMaterial = Omit<Material, "id">;

const initialForm: NewMaterial = {
  code: "",
  name: "",
  description: "",
  category: "Perfiles",
  unit: "Metro",
  averageCost: 0,
  stock: 0,
  stockMin: 0,
  stockMax: 0,
  location: ""
};

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewMaterial>(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const payload = await apiJson<Material[]>("/api/materials");
    setMaterials(payload);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await apiJson("/api/materials", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar material");
    }
  }

  async function moveStock(item: Material, delta: number) {
    try {
      await apiJson(`/api/materials/${item.id}`, { method: "PUT", body: JSON.stringify({ stockDelta: delta }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar stock");
    }
  }

  async function remove(id: string) {
    await apiJson(`/api/materials/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = useMemo(() => {
    return materials.filter((material) => `${material.code} ${material.name}`.toLowerCase().includes(query.toLowerCase()));
  }, [materials, query]);

  const lowStockCount = materials.filter((material) => material.stock < material.stockMin).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Gestión de Inventario</h2>
          <p>Administrar materiales y stock</p>
        </div>
        <div className="actions" style={{ marginTop: 0 }}>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Registrar Material</button>
        </div>
      </div>

      <div className="grid-4">
        <article className="card metric"><h4>Total Materiales</h4><b>{materials.length}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#e53935" }}><h4>Stock Bajo</h4><b>{lowStockCount}</b></article>
        <article className="card metric" style={{ borderLeftColor: "#ff730f" }}><h4>Entradas/Semana</h4><b>3</b></article>
        <article className="card metric" style={{ borderLeftColor: "#9b3cf7" }}><h4>Valorización</h4><b>{formatMoney(materials.reduce((acc, item) => acc + item.stock * item.averageCost, 0))}</b></article>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="toolbar">
        <input className="search" placeholder="Buscar por código o nombre..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <section className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Material</th>
              <th>Categoría</th>
              <th>CUPP</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((material) => {
              const low = material.stock < material.stockMin;
              return (
                <tr key={material.id}>
                  <td>{material.code}</td>
                  <td>{material.name}<div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{material.description}</div></td>
                  <td>{material.category}</td>
                  <td>{formatMoney(material.averageCost)}</td>
                  <td>{material.stock}</td>
                  <td><span className={low ? "badge badge-red" : "badge badge-blue"}>{low ? "Bajo stock" : "Normal"}</span></td>
                  <td>
                    <div className="actions" style={{ marginTop: 0 }}>
                      <button className="btn btn-ghost" onClick={() => void moveStock(material, 1)}>Entrada +1</button>
                      <button className="btn btn-ghost" onClick={() => void moveStock(material, -1)}>Salida -1</button>
                      <button className="btn btn-ghost" onClick={() => void remove(material.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <Modal open={open} title="Registrar Nuevo Material" onClose={() => setOpen(false)}>
        <form onSubmit={create}>
          <div className="row">
            <div className="field"><label>Código</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
            <div className="field"><label>Nombre</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          </div>
          <div className="field"><label>Descripción</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div className="row">
            <div className="field"><label>Categoría</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
            <div className="field"><label>Unidad</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required /></div>
          </div>
          <div className="row">
            <div className="field"><label>Costo promedio</label><input type="number" min={0} step="0.01" value={form.averageCost} onChange={(e) => setForm({ ...form, averageCost: Number(e.target.value) })} required /></div>
            <div className="field"><label>Stock actual</label><input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required /></div>
          </div>
          <div className="row">
            <div className="field"><label>Stock mínimo</label><input type="number" min={0} value={form.stockMin} onChange={(e) => setForm({ ...form, stockMin: Number(e.target.value) })} required /></div>
            <div className="field"><label>Stock máximo</label><input type="number" min={1} value={form.stockMax} onChange={(e) => setForm({ ...form, stockMax: Number(e.target.value) })} required /></div>
          </div>
          <div className="field"><label>Ubicación</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
          {error ? <div className="error-box">{error}</div> : null}
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-primary">Guardar Material</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

