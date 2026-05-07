const XLSX = require('xlsx');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// 📥 Leer Excel
const workbook = XLSX.readFile('participantes.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// 📂 Crear carpeta output
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

let numero = 1;
const resultado = [];

async function generar() {
  for (const row of data) {
    const id = Math.random().toString(36).substring(2, 10);

    const checkinURL = `https://tuapp.com/checkin/${id}`;

    // 📸 Generar QR
    const qrImage = await QRCode.toDataURL(checkinURL);

    const fileName = `${row.nombre.replace(/ /g, "_")}.png`;

    fs.writeFileSync(
      path.join(outputDir, fileName),
      qrImage.replace(/^data:image\/png;base64,/, ""),
      'base64'
    );

    // 📲 MENSAJE PERSONALIZADO
    const mensaje = `Hola ${row.nombre}, este es tu QR para el evento ESDEC:\n${checkinURL}`;

    // 🔗 USAR TU LINK YA EXISTENTE
    const whatsappLink = `${row.link_whatsapp}?text=${encodeURIComponent(mensaje)}`;

    resultado.push({
      id,
      nombre: row.nombre,
      telefono: row.telefono,
      numeroSorteo: numero,
      qrFile: fileName,
      checkinURL,
      whatsappLink
    });

    numero++;
  }

  fs.writeFileSync(
    path.join(outputDir, 'participantes.json'),
    JSON.stringify(resultado, null, 2)
  );

  console.log("✅ Todo generado correctamente");
}

generar();