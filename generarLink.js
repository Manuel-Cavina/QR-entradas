const fs = require("fs");

const users = JSON.parse(fs.readFileSync("backend/participantes_final.json", "utf-8"));

const BACKEND = "https://project-y86k.onrender.com";

const updated = users.map(u => {
  const link = `${BACKEND}/checkin/${u.id}`;

  const mensaje = `Hola ${u.nombre} 👋

Soy Manu de ESDEC 💪

🎟️ Tu acceso al evento ya está listo

Tu número de participante: #${u.numeroSorteo}

👉 Este es tu acceso:
${link}

📲 Guardalo porque lo vas a necesitar en el ingreso

1. Vos no lo mostrás desde el chat
2. Nosotros lo escaneamos
3. Empezás a disfrutar la experiencia 🚀`;

  return {
    ...u,
    checkinURL: link,
    whatsappLink: `https://wa.me/${u.telefono}?text=${encodeURIComponent(mensaje)}`
  };
});

fs.writeFileSync("backend/participantes_final.json", JSON.stringify(updated, null, 2));

console.log("✅ Mensajes ESDEC listos");