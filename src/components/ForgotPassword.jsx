import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || "https://reading-tracker-api-8jpa.onrender.com";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [pesan, setPesan] = useState({ error: '', sukses: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPesan({ error: '', sukses: '' });
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.trim()
      });

      setPesan({ error: '', sukses: response.data.message });
      setEmail('');
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
          <h2>Lupa Password</h2>
          <p>Masukkan email akun Anda untuk menerima tautan reset password</p>
        </div>

        {pesan.sukses && (
          <div
            className="auth-error"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              borderColor: '#10b981'
            }}
          >
            {pesan.sukses}
          </div>
        )}
        {pesan.error && <div className="auth-error">{pesan.error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Terdaftar</label>
            <input
              type="email"
              className="auth-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Mengirim Tautan...' : 'Kirim Tautan Reset'}
          </button>
        </form>

        <div className="auth-footer">
          Ingat password Anda? <Link to="/login" className="auth-link">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;