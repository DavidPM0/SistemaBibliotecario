import { readStore } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const store = await readStore();

  const worksActive = store.works.filter((work) => work.status === "En Progreso").length;
  const worksBudgeting = store.works.filter((work) => work.status === "Presupuestando").length;
  const workValue = store.works.reduce((acc, work) => acc + work.totalValue, 0);
  const inventoryValue = store.materials.reduce((acc, material) => acc + material.averageCost * material.stock, 0);
  const lowStock = store.materials.filter((material) => material.stock < material.stockMin);
  const overduePayments = store.payments.filter((payment) => payment.status === "Vencido").length;
  const upcomingPayments = store.payments.filter((payment) => payment.status === "Pendiente").length;

  return jsonOk({
    metrics: {
      worksActive,
      worksBudgeting,
      workValue,
      inventoryValue,
      alerts: {
        lowStock: lowStock.length,
        overduePayments,
        upcomingPayments
      }
    },
    lowStock,
    works: store.works
  });
}

