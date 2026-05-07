const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());

let users = [];

// 🔥 CARGA DE ARCHIVO
try {
  const filePath = path.join(__dirname, 'participantes.json');
  const raw = fs.readFileSync(filePath, 'utf-8');

  users = JSON.parse(raw).map(u => ({
    ...u,
    checkedIn: u.checkedIn || false
  }));

  console.log("✅ Participantes cargados:", users.length);
} catch (err) {
  console.log("❌ Error cargando participantes.json:");
  console.log(err.message);
}

// 🔹 VER LISTA
app.get('/users', (req, res) => {
  res.json(users);
});

// 🔹 CHECK-IN
app.get('/checkin/:id', (req, res) => {
  const user = users.find(u => String(u.id) === String(req.params.id));

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

// 🔹 TEST
app.get('/', (req, res) => {
  res.send("Backend funcionando 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});