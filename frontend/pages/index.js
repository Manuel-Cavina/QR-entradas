import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const QrReader = dynamic(
  () => import("react-qr-reader").then((mod) => mod.QrReader),
  { ssr: false }
);
const BACKEND = "https://project-y86k.onrender.com";

export default function Home() {
  const [result, setResult] = useState(null);
  const [users, setUsers] = useState([]);
  const [scanning, setScanning] = useState(true);

  // cargar lista inicial
  const fetchUsers = async () => {
  try {
    const res = await fetch(`${BACKEND}/users`);
    const data = await res.json();
    setUsers(data);
  } catch (e) {
    console.log("backend dormido...");
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleScan = async (text) => {
    if (!text) return;

    setScanning(false);

    try {
      // extraer ID del QR
      const id = text.split("/").pop();

      const res = await fetch(`${BACKEND}/checkin/${id}`);
      const data = await res.json();

      setResult(data);

      // actualizar lista
      fetchUsers();

      // volver a escanear después de 2 seg
      setTimeout(() => {
        setResult(null);
        setScanning(true);
      }, 2000);

    } catch (err) {
      console.error(err);
      setResult({ status: "error" });
      setScanning(true);
    }
  };

  return (
    <div className="container">
      <h1>Check-in Evento</h1>

      {scanning && (
        <div style={{ width: "300px" }}>
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result) => {
              if (result) handleScan(result?.text);
            }}
          />
        </div>
      )}

      {result && (
        <div className={`result ${result.status === "success" ? "success" : "error"}`}>
          <h2>
            {result.status === "success"
              ? "Participante presente"
              : result.status === "warning"
              ? "Ya escaneado"
              : "No válido"}
          </h2>

          <p>{result.user?.nombre}</p>
          <p>N° {result.user?.numeroSorteo}</p>
        </div>
      )}

      <div className="list">
        <h2>Lista</h2>

        {users.map((u) => (
          <div key={u.id} className="item">
            <span>{u.nombre}</span>
            <span className={u.checkedIn ? "green" : "red"}>
              {u.checkedIn ? "✔" : "❌"} {u.numeroSorteo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}