import { z } from "zod";
import { makeId, readStore, writeStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

const createMaterialSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  description: z.string().min(3),
  category: z.string().min(2),
  unit: z.string().min(2),
  averageCost: z.number().min(0),
  stock: z.number().min(0),
  stockMin: z.number().min(0),
  stockMax: z.number().min(1),
  location: z.string().min(2)
});

export async function GET() {
  const store = await readStore();
  return jsonOk(store.materials);
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = createMaterialSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Datos de material inválidos", 422);
  }

  const store = await readStore();
  const exists = store.materials.some((material) => material.code === parsed.data.code);

  if (exists) {
    return jsonError("Código de material repetido", 409);
  }

  const newMaterial = {
    id: makeId("mat"),
    ...parsed.data
  };

  store.materials.unshift(newMaterial);
  await writeStore(store);

  return jsonOk(newMaterial, { status: 201 });
}

