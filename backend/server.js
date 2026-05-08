const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

try {
  const filePath = path.join(__dirname, "participantes_final.json");
  users = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Inicializar campos si no existen
  users = users.map(u => ({
    ...u,
    checkedIn: u.checkedIn || false,
    combo: u.combo || {
      bebidaCaliente: "",
      bebidaFria: "",
      comida: ""
    }
  }));

  console.log("Participantes cargados:", users.length);
} catch (err) {
  console.log("Error cargando participantes:", err.message);
}

// 🔹 LISTA
app.get("/users", (req, res) => {
  res.json(users);
});

// 🔹 CHECK-IN
app.get("/checkin/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.json({ status: "error", message: "No encontrado" });
  }

  if (user.checkedIn) {
    return res.json({ status: "warning", message: "Ya registrado", user });
  }

  user.checkedIn = true;

  return res.json({
    status: "success",
    message: "Check-in OK",
    user
  });
});

// 🔹 GUARDAR COMBO
app.post("/combo/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "No encontrado" });
  }

  user.combo = req.body;

  return res.json({
    status: "success",
    user
  });
});

// 🔹 RESET
app.post("/reset", (req, res) => {
  users.forEach(u => {
    u.checkedIn = false;
    u.combo = {
      bebidaCaliente: "",
      bebidaFria: "",
      comida: ""
    };
  });

  res.json({ message: "Evento reiniciado" });
});

app.listen(4000, () => {
  console.log("Servidor corriendo en http://localhost:4000");
});