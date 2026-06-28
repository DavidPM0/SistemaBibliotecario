import { z } from "zod";
import { readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const updateUserSchema = z.object({
  fullName: z.string().min(3).optional(),
  role: z.enum(["Administrador", "Empleado"]).optional(),
  status: z.enum(["Activo", "Inactivo"]).optional(),
  password: z.string().min(6).optional()
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Actualización inválida", 422);
  }

  const store = await readStore();
  const index = store.users.findIndex((user) => user.id === id);

  if (index === -1) {
    return jsonError("Usuario no encontrado", 404);
  }

  store.users[index] = { ...store.users[index], ...parsed.data };
  await writeStore(store);

  return jsonOk(store.users[index]);
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const store = await readStore();
  const index = store.users.findIndex((user) => user.id === id);

  if (index === -1) {
    return jsonError("Usuario no encontrado", 404);
  }

  store.users.splice(index, 1);
  await writeStore(store);

  return jsonOk({ message: "Usuario eliminado" });
}

