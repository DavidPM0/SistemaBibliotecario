import { z } from "zod";
import { makeId, readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const createWorkSchema = z.object({
  name: z.string().min(5),
  clientId: z.string().min(3),
  type: z.string().min(3),
  status: z.enum(["Presupuestando", "En Progreso", "Finalizado"]).default("Presupuestando"),
  progress: z.number().min(0).max(100).default(0),
  totalValue: z.number().min(0).default(0),
  startDate: z.string().min(10),
  dueDate: z.string().min(10),
  description: z.string().min(5),
  location: z.string().min(3)
});

function isPastDate(dateIso: string): boolean {
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const input = new Date(dateIso + "T00:00:00");
  return input < current;
}

export async function GET() {
  const store = await readStore();
  return jsonOk(store.works);
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = createWorkSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Datos de obra inválidos", 422);
  }

  if (isPastDate(parsed.data.startDate)) {
    return jsonError("La fecha de inicio no puede ser anterior a hoy", 409);
  }

  const store = await readStore();
  const client = store.clients.find((item) => item.id === parsed.data.clientId);

  if (!client) {
    return jsonError("Cliente no existe", 404);
  }

  const newWork = {
    id: makeId("wrk"),
    ...parsed.data,
    clientName: client.name,
    delayDays: 0,
    budget: []
  };

  store.works.unshift(newWork);
  client.activeWorks += 1;
  await writeStore(store);

  return jsonOk(newWork, { status: 201 });
}

