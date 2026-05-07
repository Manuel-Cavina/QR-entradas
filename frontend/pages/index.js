import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BACKEND = "https://project-y86k.onrender.com";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND}/users`);
      const data = await res.json();
      setUsers(data);
    } catch {
      console.log("backend dormido");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 220,
    });

    scanner.render(async (text) => {
      const id = text.split("/").pop();

      const res = await fetch(`${BACKEND}/checkin/${id}`);
      const data = await res.json();

      setResult(data);
      fetchUsers();

      setTimeout(() => setResult(null), 1500);
    });

    return () => scanner.clear().catch(() => {});
  }, []);

  const total = users.length;
  const registrados = users.filter(u => u.checkedIn).length;
  const pendientes = total - registrados;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>Check-in</h2>
      </div>

      {/* SCANNER */}
      <div style={styles.scannerCard}>
        <div id="reader"></div>
      </div>

      {/* RESULT */}
      {result && (
        <div style={{
          ...styles.result,
          background:
            result.status === "success"
              ? "#16a34a"
              : result.status === "warning"
              ? "#ca8a04"
              : "#dc2626",
        }}>
          {result.user?.nombre}
        </div>
      )}

      {/* STATS */}
      <div style={styles.stats}>
        <Stat label="TOTAL" value={total} />
        <Stat label="REGISTRADOS" value={registrados} color="#16a34a" />
        <Stat label="PENDIENTES" value={pendientes} color="#f59e0b" />
      </div>

      {/* LISTA */}
      <div style={styles.list}>
        {users.map((u) => (
          <div key={u.id} style={styles.card}>
            
            {/* iniciales */}
            <div style={styles.avatar}>
              {u.nombre
                .split(" ")
                .map(n => n[0])
                .join("")
                .slice(0,2)}
            </div>

            {/* info */}
            <div style={{ flex: 1 }}>
              <div style={styles.name}>{u.nombre}</div>
              <div style={styles.sub}>#{u.numeroSorteo}</div>
            </div>

            {/* estado */}
            <div
              style={{
                ...styles.badge,
                background: u.checkedIn ? "#16a34a" : "#64748b",
              }}
            >
              {u.checkedIn ? "Registrado" : "Pendiente"}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <div style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: "bold", color }}>
        {value}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f8fafc",
    minHeight: "100vh",
    padding: 15,
    fontFamily: "sans-serif",
    color: "#000", // 🔥 TODO el texto negro
  },

  header: {
    textAlign: "center",
    marginBottom: 15,
    color: "#000",
  },

  scannerCard: {
    background: "#fff",
    padding: 10,
    borderRadius: 15,
    marginBottom: 15,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  result: {
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    marginBottom: 15,
    color: "#fff", // acá sí blanco porque es estado
    fontWeight: "bold",
  },

  stats: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },

  stat: {
    flex: 1,
    background: "#fff",
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
    color: "#000",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  card: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    padding: 12,
    borderRadius: 12,
    color: "#000",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#e2e8f0", // 🔥 gris elegante en vez de azul fuerte
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    fontWeight: "bold",
  },

  name: {
    fontWeight: "600",
    color: "#000",
  },

  sub: {
    fontSize: 12,
    color: "#64748b",
  },

  badge: {
    padding: "6px 10px",
    borderRadius: 10,
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
};