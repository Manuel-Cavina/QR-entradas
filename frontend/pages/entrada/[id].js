import { useEffect, useState } from "react";

export default function Entrada({ id }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("https://project-y86k.onrender.com/users")
      .then(res => res.json())
      .then(data => {
        const encontrado = data.find(u => u.id === id);
        setUser(encontrado);
      });
  }, [id]);

  if (!user) return <p>Cargando...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>ESDEC</h2>

        <h3>{user.nombre}</h3>
        <p>N° {user.numeroSorteo}</p>

        <img
          src={`/qrs/${user.qrFile}`}
          alt="QR"
          style={styles.qr}
        />

        <p>Mostrá este QR en el ingreso</p>
      </div>
    </div>
  );
}

// 👇 Next obtiene el ID
export async function getServerSideProps(context) {
  return {
    props: {
      id: context.params.id
    }
  };
}

const styles = {
  container: {
    background: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
    color: "#000"
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 15,
    textAlign: "center"
  },

  qr: {
    width: 220,
    marginTop: 10
  }
};