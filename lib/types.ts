export type Role = "Administrador" | "Empleado";
export type Status = "Activo" | "Inactivo";

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: Role;
  status: Status;
  lastAccess: string;
  password: string;
}

export interface Client {
  id: string;
  type: "Persona Natural" | "Empresa";
  name: string;
  ruc: string;
  address: string;
  district: string;
  phone: string;
  email: string;
  status: Status;
  activeWorks: number;
  contactPerson?: string;
}

export type WorkStatus = "Presupuestando" | "En Progreso" | "Finalizado";

export interface BudgetItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitCost: number;
}

export interface Work {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  type: string;
  status: WorkStatus;
  progress: number;
  totalValue: number;
  startDate: string;
  dueDate: string;
  delayDays: number;
  description: string;
  location: string;
  budget: BudgetItem[];
}

export interface Material {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  averageCost: number;
  stock: number;
  stockMin: number;
  stockMax: number;
  location: string;
}

export interface Payment {
  id: string;
  workId: string;
  clientId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Pagado" | "Pendiente" | "Vencido";
}

export interface Store {
  users: User[];
  clients: Client[];
  works: Work[];
  materials: Material[];
  payments: Payment[];
}

