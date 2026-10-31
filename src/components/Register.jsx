// src/components/Register.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Menambahkan Link untuk tautan internal
import './Auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      await axios.post('http://localhost:3000/auth/register', {
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
            />
          </div>
          <div className="form-group">
            <label>Password Baru</label>
            <input 
              type="password" 
              className="auth-input"
              placeholder="Buat password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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