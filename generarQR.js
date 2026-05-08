const XLSX = require('xlsx');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// 📥 Leer Excel
const workbook = XLSX.readFile('participantes.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// 🔍 función para evitar problemas con nombres de columnas
const getValue = (row, key) => {
  const foundKey = Object.keys(row).find(
    k => k.toLowerCase().trim() === key.toLowerCase()
  );
  return foundKey ? row[foundKey] : "";
};

// 📂 Carpeta QR (frontend)
const qrDir = path.join(__dirname, 'frontend/public/qrs');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// 📂 Carpeta backend (JSON final)
const backendDir = path.join(__dirname, 'backend');

let numero = 1;
const resultado = [];

async function generar() {
  for (const row of data) {

    const id = Math.random().toString(36).substring(2, 10);

    // 🚨 FIX IMPORTANTE (antes tenías {id} mal)
    const checkinURL = `https://project-y86k.onrender.com/checkin/${id}`;

    // 📸 Generar QR
    const qrImage = await QRCode.toDataURL(checkinURL);

    const fileName = `${row.nombre.replace(/ /g, "_")}.png`;

    fs.writeFileSync(
      path.join(qrDir, fileName),
      qrImage.replace(/^data:image\/png;base64,/, ""),
      'base64'
    );

    // 📲 MENSAJE
    const mensaje = `Hola ${row.nombre}! 👋

Soy Manu de ESDEC 🏁

🎟️ Este es tu acceso al evento:

${checkinURL}

👉 Guardalo porque lo vas a necesitar

📌 Importante:
1. Vos no lo mostrás desde el chat
2. Nosotros lo escaneamos
3. Empezás a disfrutar la experiencia 🚀`;

    const whatsappLink = `${row.link_whatsapp}?text=${encodeURIComponent(mensaje)}`;

    // 💥 ACÁ ESTÁ LA CLAVE (COMBO)
    resultado.push({
      id,
      nombre: row.nombre,
      telefono: String(row.telefono),
      numeroSorteo: numero,
      qrFile: fileName,
      checkinURL,
      whatsappLink,

      combo: {
        bebidaCaliente: getValue(row, "cafe caliente"),
        bebidaFria: getValue(row, "cafe frio"),
        comida: getValue(row, "comida")
      },

      checkedIn: false
    });

    numero++;
  }

  // 📄 Guardar JSON en backend
  fs.writeFileSync(
    path.join(backendDir, 'participantes_final.json'),
    JSON.stringify(resultado, null, 2)
  );

  console.log("✅ QR + JSON generados correctamente");
}

generar();