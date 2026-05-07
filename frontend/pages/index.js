import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BACKEND = "https://project-y86k.onrender.com";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);

  // 🔹 traer usuarios
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.log("Backend dormido...");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 scanner QR
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const id = decodedText.split("/").pop();

          const res = await fetch(`${BACKEND}/checkin/${id}`);
          const data = await res.json();

          setResult(data);
          fetchUsers();

          setTimeout(() => {
            setResult(null);
          }, 2000);
        } catch (err) {
          console.error(err);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🎟 Check-in Evento</h1>

      {/* 🔹 Scanner */}
      <div id="reader" style={{ width: "300px", marginBottom: 20 }} />

      {/* 🔹 Resultado */}
      {result && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            background:
              result.status === "success"
                ? "#d4edda"
                : result.status === "warning"
                ? "#fff3cd"
                : "#f8d7da",
            color: "#000",
            borderRadius: 8,
          }}
        >
          <h2>
            {result.status === "success"
              ? "✅ Participante presente"
              : result.status === "warning"
              ? "⚠️ Ya escaneado"
              : "❌ No válido"}
          </h2>

          <p>{result.user?.nombre}</p>
          <p>N° {result.user?.numeroSorteo}</p>
        </div>
      )}

      {/* 🔹 Lista */}
      <h2>Lista</h2>

      <div>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 12px",
              marginBottom: 5,
              background: "#f4f4f4",
              borderRadius: 6,
            }}
          >
            <span>{u.nombre}</span>

            <span
              style={{
                color: u.checkedIn ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {u.checkedIn ? "✔" : "❌"} {u.numeroSorteo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}