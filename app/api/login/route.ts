import { z } from "zod";
import { readStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Datos de inicio de sesión inválidos", 422);
  }

  const { username, password } = parsed.data;
  const store = await readStore();
  const user = store.users.find((item) => item.username === username && item.password === password);

  if (!user || user.status !== "Activo") {
    return jsonError("Usuario o contraseña incorrectos", 401);
  }

  return jsonOk({
    message: "Autenticación correcta",
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role
    }
  });
}

