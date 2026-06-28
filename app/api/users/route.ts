import { z } from "zod";
import { makeId, readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const createUserSchema = z.object({
  fullName: z.string().min(3),
  username: z.string().min(3),
  role: z.enum(["Administrador", "Empleado"]),
  status: z.enum(["Activo", "Inactivo"]),
  password: z.string().min(6)
});

export async function GET() {
  const store = await readStore();
  return jsonOk(store.users);
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Datos de usuario inválidos", 422);
  }

  const store = await readStore();
  const exists = store.users.some((user) => user.username === parsed.data.username);

  if (exists) {
    return jsonError("El usuario ya existe", 409);
  }

  const newUser = {
    id: makeId("usr"),
    ...parsed.data,
    lastAccess: new Date().toISOString()
  };

  store.users.unshift(newUser);
  await writeStore(store);

  return jsonOk(newUser, { status: 201 });
}

