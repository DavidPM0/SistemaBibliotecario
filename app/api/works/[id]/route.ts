import { z } from "zod";
import { readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const updateWorkSchema = z.object({
  name: z.string().min(5).optional(),
  type: z.string().min(3).optional(),
  status: z.enum(["Presupuestando", "En Progreso", "Finalizado"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  totalValue: z.number().min(0).optional(),
  dueDate: z.string().min(10).optional(),
  description: z.string().min(5).optional(),
  location: z.string().min(3).optional(),
  delayDays: z.number().min(0).optional()
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await req.json().catch(() => null);
  const parsed = updateWorkSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Actualización inválida", 422);
  }

  const store = await readStore();
  const index = store.works.findIndex((work) => work.id === id);

  if (index === -1) {
    return jsonError("Obra no encontrada", 404);
  }

  const current = store.works[index];
  if (current.status === "En Progreso" && parsed.data.type) {
    return jsonError("No se puede modificar tipo de obra en progreso", 409);
  }

  const next = { ...current, ...parsed.data };
  if ((parsed.data.progress ?? current.progress) === 100) {
    next.status = "Finalizado";
    next.delayDays = 0;
  }

  store.works[index] = next;
  await writeStore(store);

  return jsonOk(next);
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const store = await readStore();
  const index = store.works.findIndex((work) => work.id === id);

  if (index === -1) {
    return jsonError("Obra no encontrada", 404);
  }

  const [deleted] = store.works.splice(index, 1);
  const client = store.clients.find((item) => item.id === deleted.clientId);
  if (client && client.activeWorks > 0) {
    client.activeWorks -= 1;
  }

  await writeStore(store);
  return jsonOk({ message: "Obra eliminada" });
}

