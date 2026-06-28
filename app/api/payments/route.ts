import { readStore } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const store = await readStore();
  return jsonOk(store.payments);
}

