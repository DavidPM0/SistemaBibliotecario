import { z } from "zod";
import { readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const updateMaterialSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  category: z.string().min(2).optional(),
  unit: z.string().min(2).optional(),
  averageCost: z.number().min(0).optional(),
  stockMin: z.number().min(0).optional(),
  stockMax: z.number().min(1).optional(),
  location: z.string().min(2).optional(),
  stockDelta: z.number().optional()
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await req.json().catch(() => null);
  const parsed = updateMaterialSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Actualización inválida", 422);
  }

  const store = await readStore();
  const index = store.materials.findIndex((material) => material.id === id);

  if (index === -1) {
    return jsonError("Material no encontrado", 404);
  }

  const current = store.materials[index];
  const delta = parsed.data.stockDelta ?? 0;
  const nextStock = current.stock + delta;

  if (nextStock < 0) {
    return jsonError("No hay stock suficiente", 409);
  }

  const next = {
    ...current,
    ...parsed.data,
    stock: nextStock
  };
  delete (next as { stockDelta?: number }).stockDelta;

  store.materials[index] = next;
  await writeStore(store);

  return jsonOk(next);
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const store = await readStore();
  const index = store.materials.findIndex((material) => material.id === id);

  if (index === -1) {
    return jsonError("Material no encontrado", 404);
  }

  store.materials.splice(index, 1);
  await writeStore(store);

  return jsonOk({ message: "Material eliminado" });
}

