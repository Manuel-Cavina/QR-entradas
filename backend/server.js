const express = require('express');
const cors = require('cors');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const cors = require("cors");

app.use(cors({
  origin: "*"
}));

// memoria (para el evento alcanza)
const fs = require('fs');
const path = require('path');

let users = [];

try {
  const filePath = path.join(__dirname, './participantes.json');
  users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log("Participantes cargados:", users.length);
} catch (err) {
  console.log("No se pudo cargar participantes.json");
}


// 🔹 CARGAR PARTICIPANTES
app.post('/load', (req, res) => {
  users = req.body;

  res.json({
    message: "Participantes cargados",
    total: users.length
  });
});

// 🔹 VER LISTA
app.get('/users', (req, res) => {
  res.json(users);
});

// 🔹 CHECK-IN
app.get('/checkin/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.json({ status: 'error', message: 'No encontrado' });
  }

  if (user.checkedIn) {
    return res.json({ status: 'warning', message: 'Ya registrado', user });
  }

  user.checkedIn = true;

  return res.json({
    status: 'success',
    message: 'Check-in OK',
    user
  });
});

// 🚀 levantar servidor
app.listen(4000, () => {
  console.log('Servidor corriendo en http://localhost:4000');
});