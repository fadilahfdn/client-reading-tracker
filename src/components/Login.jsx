// src/components/Login.jsx
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from 'axios';
import './Auth.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pesanError, setPesanError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setPesanError('');
    setLoading(true);

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

      navigate('/dashboard');

    } catch (error) {
      // Menangkap balasan error dari Backend
      if (error.response) {
        setPesanError(error.response.data.message);
      } else {
        setPesanError("Gagal terhubung ke server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Masuk ke akun Reading Tracker Anda</p>
        </div>

        {pesanError && <div className="auth-error">{pesanError}</div>}
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Memperbarui memori tiap ada ketikan
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          Belum punya akun? <Link to="/register" className="auth-link">Daftar di sini.</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
