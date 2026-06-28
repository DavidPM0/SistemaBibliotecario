"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("lvillanueva");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setAttempts((current) => current + 1);
        const payload = await response.json().catch(() => ({ message: "Credenciales invalidas" }));
        setError(payload.message ?? "Credenciales invalidas");
        return;
      }

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <section className="auth-hero">
        <h1>Taller Villanueva</h1>
        <p>Sistema de gestion de obras y proyectos para usuarios, clientes, inventario y reportes.</p>
        <div className="auth-points">
          <div className="auth-point">Control de obras en progreso y presupuestadas</div>
          <div className="auth-point">Seguimiento de stock y costos promedio</div>
          <div className="auth-point">Alertas de pagos vencidos y retrasos</div>
        </div>
      </section>

      <div className="login-zone">
        <form className="login-card" onSubmit={onSubmit}>
          <div className="logo-chip">TV</div>
          <h2>Taller Villanueva</h2>
          <p>Sistema de Gestion de Obras y Proyectos</p>

          <div className="field">
            <label>Usuario</label>
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>

          <div className="field">
            <label>Contrasena</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>

          {error && (
            <div className="error-box">
              {error}
              <div style={{ marginTop: 6, fontSize: 14 }}>Intento {attempts} de 3.2 intentos restantes.</div>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Validando..." : "Iniciar Sesion"}
          </button>
        </form>
      </div>
    </div>
  );
}