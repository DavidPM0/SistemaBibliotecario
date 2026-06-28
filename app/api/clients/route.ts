import { z } from "zod";
import { makeId, readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const createClientSchema = z.object({
  type: z.enum(["Persona Natural", "Empresa"]),
  name: z.string().min(3),
  ruc: z.string().min(8),
  address: z.string().min(5),
  district: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  status: z.enum(["Activo", "Inactivo"]).default("Activo"),
  contactPerson: z.string().optional()
});

export async function GET() {
  const store = await readStore();
  return jsonOk(store.clients);
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = createClientSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Datos de cliente inválidos", 422);
  }

  const store = await readStore();
  const exists = store.clients.some((client) => client.ruc === parsed.data.ruc);

  if (exists) {
    return jsonError("Ya existe un cliente con ese RUC", 409);
  }

  const newClient = {
    id: makeId("cli"),
    ...parsed.data,
    activeWorks: 0
  };

  store.clients.unshift(newClient);
  await writeStore(store);

  return jsonOk(newClient, { status: 201 });
}

