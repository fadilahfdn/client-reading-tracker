// src/components/Login.jsx
import { useState } from "react";
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pesanError, setPesanError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setPesanError('');

  try {
      // Mengirim request POST ke Backend
      const response = await axios.post('http://localhost:3000/auth/login', {
        username: username,
        password: password
      });

     // Ambil token dari balasan server
      const tokenJWT = response.data.token; 
      
      // Simpan token ke dalam local storage browser
      localStorage.setItem('token', tokenJWT);

      console.log("Login Berhasil! Token diamankan di Local Storage.");
      alert("Login Sukses!");

    } catch (error) {
      // Menangkap balasan error dari Backend
      if (error.response) {
        setPesanError(error.response.data.message);
      } else {
        setPesanError("Gagal terhubung ke server.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Masuk ke Akun</h2>

      {pesanError && <p style={{ color: 'red' }}>{pesanError}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Memperbarui memori tiap ada ketikan
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Belum punya akun? Daftar di sini.</p>
    </div>
  );
}

export default Login;
