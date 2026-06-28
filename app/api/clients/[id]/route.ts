import { z } from "zod";
import { readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const updateClientSchema = z.object({
  type: z.enum(["Persona Natural", "Empresa"]).optional(),
  name: z.string().min(3).optional(),
  ruc: z.string().min(8).optional(),
  address: z.string().min(5).optional(),
  district: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  email: z.string().email().optional(),
  status: z.enum(["Activo", "Inactivo"]).optional(),
  contactPerson: z.string().optional()
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await req.json().catch(() => null);
  const parsed = updateClientSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Actualización inválida", 422);
  }

  const store = await readStore();
  const index = store.clients.findIndex((client) => client.id === id);

  if (index === -1) {
    return jsonError("Cliente no encontrado", 404);
  }

  store.clients[index] = { ...store.clients[index], ...parsed.data };
  await writeStore(store);

  return jsonOk(store.clients[index]);
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const store = await readStore();
  const index = store.clients.findIndex((client) => client.id === id);

  if (index === -1) {
    return jsonError("Cliente no encontrado", 404);
  }

  const hasWorks = store.works.some((work) => work.clientId === id && work.status !== "Finalizado");
  if (hasWorks) {
    return jsonError("No se puede eliminar: tiene obras activas", 409);
  }

  store.clients.splice(index, 1);
  await writeStore(store);

  return jsonOk({ message: "Cliente eliminado" });
}

