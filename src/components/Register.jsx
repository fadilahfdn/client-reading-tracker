// src/components/Register.jsx
import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL || "https://reading-tracker-api-8jpa.onrender.com";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Menambahkan Link untuk tautan internal
import './Auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pesan, setPesan] = useState({ error: '', sukses: '' }); // Menggabungkan state pesan
  const [loading, setLoading] = useState(false); // State untuk efek memproses
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setPesan({ error: '', sukses: '' });
    setLoading(true); 
    
    try {
      // Mengirim data ke endpoint register backend
      await axios.post(`${API_URL}/auth/register`, {
        email: email,
        username: username,
        password: password
      });

      setPesan({ error: '', sukses: 'Pendaftaran berhasil! Mengarahkan ke halaman login...' });
      
      // Memberi jeda 1,5 detik
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      if (error.response) {
        setPesan({ error: error.response.data.message, sukses: '' });
      } else {
        setPesan({ error: "Gagal terhubung ke server.", sukses: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Daftar Akun Baru</h2>
          <p>Mulai lacak perjalanan membaca Anda</p>
        </div>
        
        {/* Modifikasi warna auth-error menjadi hijau khusus untuk pesan sukses */}
        {pesan.sukses && (
          <div className="auth-error" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: '#10b981' }}>
            {pesan.sukses}
          </div>
        )}
        {pesan.error && <div className="auth-error">{pesan.error}</div>}
        
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="auth-input"
              placeholder="Masukkan email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Username Baru</label>
            <input 
              type="text" 
              className="auth-input"
              placeholder="Buat username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password Baru</label>
             <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '60px' }} // Beri ruang ekstra agar teks tidak tertutup tombol
              />
              <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6c757d', // Warna abu-abu yang netral
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0'
              }}
              title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                // Ikon Mata Tercoret (Hide)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                // Ikon Mata Terbuka (Show)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            </div>
          </div>
          <button type="submit" className="btn-auth" disabled={loading || pesan.sukses !== ''}>
            {loading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
        
        <div className="auth-footer">
          Sudah punya akun? <Link to="/login" className="auth-link">Masuk di sini.</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;