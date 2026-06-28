"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, Factory, LayoutDashboard, LogOut, Users, Wallet } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/works", label: "Obras", icon: Factory },
  { href: "/inventory", label: "Inventario", icon: Boxes },
  { href: "/reports", label: "Reportes", icon: ClipboardList }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-chip" style={{ margin: 0, width: 44, height: 44, borderRadius: 10 }}>TV</div>
          <div>
            <strong>Taller Villanueva</strong>
            <small>Sistema de Gestión</small>
          </div>
        </div>

        <nav className="menu">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button className="btn btn-ghost" onClick={() => router.push("/login")}>
            <LogOut size={16} /> Cerrar
          </button>
        </nav>
      </aside>

      <section className="main">
        <header className="topbar">
          <strong>Sistema de Gestión de Obras y Proyectos</strong>
          <div className="user-area">
            <div style={{ textAlign: "right" }}>
              <div>Luis Orlando Villanueva Rosales</div>
              <small style={{ color: "var(--text-secondary)" }}>Administrador</small>
            </div>
            <div className="avatar">LV</div>
            <button className="btn btn-ghost" onClick={() => router.push("/login")}>
              <LogOut size={16} style={{ verticalAlign: "middle" }} /> Cerrar Sesión
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </section>
    </div>
  );
}

