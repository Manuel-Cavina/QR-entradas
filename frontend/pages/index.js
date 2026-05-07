import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BACKEND = "https://project-y86k.onrender.com";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.log("backend dormido");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(async (text) => {
      const id = text.split("/").pop();

      const res = await fetch(`${BACKEND}/checkin/${id}`);
      const data = await res.json();

      setResult(data);
      fetchUsers();

      setTimeout(() => setResult(null), 2000);
    });

    return () => scanner.clear().catch(() => {});
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filter === "present") return u.checkedIn;
    if (filter === "pending") return !u.checkedIn;
    return true;
  });

  const presentCount = users.filter((u) => u.checkedIn).length;

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1>🎟 Check-in</h1>
        <p>{presentCount} / {users.length} presentes</p>
      </div>

      {/* RESULTADO */}
      {result && (
        <div
          style={{
            ...styles.result,
            background:
              result.status === "success"
                ? "#1f8f4f"
                : result.status === "warning"
                ? "#b38b00"
                : "#b00020",
          }}
        >
          <h2>
            {result.status === "success"
              ? "✔ Registrado"
              : result.status === "warning"
              ? "⚠ Ya ingresó"
              : "❌ No válido"}
          </h2>
          <p>{result.user?.nombre}</p>
        </div>
      )}

      {/* SCANNER */}
      <div id="reader" style={styles.scanner}></div>

      {/* FILTROS */}
      <div style={styles.filters}>
        <button onClick={() => setFilter("all")}>Todos</button>
        <button onClick={() => setFilter("present")}>Presentes</button>
        <button onClick={() => setFilter("pending")}>Faltan</button>
      </div>

      {/* LISTA */}
      <div style={styles.list}>
        {filteredUsers.map((u) => (
          <div key={u.id} style={styles.item}>
            <span>{u.nombre}</span>
            <span
              style={{
                color: u.checkedIn ? "#00ff9c" : "#ff4d4d",
                fontWeight: "bold",
              }}
            >
              {u.checkedIn ? "✔" : "✘"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "Arial",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  scanner: {
    margin: "20px auto",
    maxWidth: 300,
  },
  result: {
    padding: 15,
    borderRadius: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  filters: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginBottom: 20,
  },
  list: {
    maxHeight: 300,
    overflowY: "scroll",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #1e293b",
  },
};