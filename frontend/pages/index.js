import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BACKEND = "https://project-y86k.onrender.com";

export default function Home() {

  const [users, setUsers] = useState([]);
  const [scanning, setScanning] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const [combo, setCombo] = useState({
    bebidaCaliente: "",
    bebidaFria: "",
    comida: ""
  });

  // 🔹 traer usuarios
  const fetchUsers = async () => {
    const res = await fetch(`${BACKEND}/users`);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 SCANNER
  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        handleScan(decodedText);
        scanner.stop();
      },
      () => {}
    );

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [scanning]);

  // 🔹 CUANDO ESCANEÁS
  const handleScan = async (text) => {
    const id = text.split("/").pop();

    const res = await fetch(`${BACKEND}/checkin/${id}`);
    const data = await res.json();

    if (data.user) {
      setSelectedUser(data.user);

      setCombo({
        bebidaCaliente: data.user.combo?.bebidaCaliente || "",
        bebidaFria: data.user.combo?.bebidaFria || "",
        comida: data.user.combo?.comida || ""
      });

      setScanning(false);
    }

    fetchUsers();
  };

  const total = users.length;
  const registrados = users.filter(u => u.checkedIn).length;
  const pendientes = total - registrados;

  return (
    <div style={styles.container}>

      <h1>Check-in ESDEC</h1>

      {/* SCANNER */}
      {scanning && <div id="reader" style={styles.reader}></div>}

      {/* STATS */}
      <div style={styles.stats}>
        <div style={styles.box}>
          TOTAL<br /><strong>{total}</strong>
        </div>

        <div style={styles.box}>
          REGISTRADOS<br /><strong style={{ color: "green" }}>{registrados}</strong>
        </div>

        <div style={styles.box}>
          PENDIENTES<br /><strong style={{ color: "orange" }}>{pendientes}</strong>
        </div>
      </div>

      {/* LISTA */}
      <div>
        {users.map(u => (
          <div key={u.id} style={styles.card}>

            <div>
              <strong>{u.nombre}</strong>
              <div>#{u.numeroSorteo}</div>

              <div style={styles.comboText}>
                ☕ {u.combo?.bebidaCaliente || "Sin caliente"} |
                🧊 {u.combo?.bebidaFria || "Sin fría"} |
                🍽 {u.combo?.comida || "Sin comida"}
              </div>
            </div>

            <div style={{
              background: u.checkedIn ? "#22c55e" : "#64748b",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: 20
            }}>
              {u.checkedIn ? "Registrado" : "Pendiente"}
            </div>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedUser && (
        <div style={styles.modal}>

          <div style={styles.modalCard}>

            <h2>{selectedUser.nombre}</h2>
            <p>N° {selectedUser.numeroSorteo}</p>

            <h4>Combo</h4>

            <input
              placeholder="Café caliente"
              value={combo.bebidaCaliente}
              onChange={(e) =>
                setCombo({ ...combo, bebidaCaliente: e.target.value })
              }
            />

            <input
              placeholder="Café frío"
              value={combo.bebidaFria}
              onChange={(e) =>
                setCombo({ ...combo, bebidaFria: e.target.value })
              }
            />

            <input
              placeholder="Comida"
              value={combo.comida}
              onChange={(e) =>
                setCombo({ ...combo, comida: e.target.value })
              }
            />

            <button
              onClick={async () => {
                await fetch(`${BACKEND}/combo/${selectedUser.id}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(combo)
                });

                setSelectedUser(null);
                setScanning(true);
                fetchUsers();
              }}
            >
              Guardar
            </button>

            <button
              onClick={() => {
                setSelectedUser(null);
                setScanning(true);
              }}
            >
              Cancelar
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "sans-serif",
    color: "#000"
  },

  reader: {
    width: 300,
    margin: "20px auto"
  },

  stats: {
    display: "flex",
    gap: 10,
    marginTop: 20
  },

  box: {
    flex: 1,
    background: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
    textAlign: "center"
  },

  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  },

  comboText: {
    fontSize: 12,
    color: "#555"
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modalCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 15,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: 300
  }
};