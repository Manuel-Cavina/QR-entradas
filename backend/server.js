const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS (CLAVE para que Vercel funcione)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 📁 archivo donde guardamos estado (simple)
const DATA_PATH = path.join(__dirname, "data.json");

// 🔹 función para leer usuarios
const readUsers = () => {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH);
  return JSON.parse(data);
};

// 🔹 función para guardar usuarios
const saveUsers = (users) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2));
};

// 🔹 endpoint para cargar usuarios iniciales (solo 1 vez)
app.post("/load", (req, res) => {
  const users = req.body;

  const initialUsers = users.map((u) => ({
    ...u,
    checkedIn: false
  }));

  saveUsers(initialUsers);

  res.json({ message: "Usuarios cargados" });
});

// 🔹 obtener todos los usuarios
app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

// 🔹 check-in por QR
app.get("/checkin/:id", (req, res) => {
  const { id } = req.params;

  const users = readUsers();
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.json({ status: "error" });
  }

  if (user.checkedIn) {
    return res.json({
      status: "warning",
      user
    });
  }

  user.checkedIn = true;
  saveUsers(users);

  return res.json({
    status: "success",
    user
  });
});

// 🔹 endpoint simple para test
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// 🚀 levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});