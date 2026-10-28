// src/components/Register.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Menambahkan Link untuk tautan internal

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pesan, setPesan] = useState({ error: '', sukses: '' }); // Menggabungkan state pesan
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setPesan({ error: '', sukses: '' }); 
    
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
    }
  };

  return (
    <div className="login-container">
      <h2>Daftar Akun Baru</h2>
      
      {pesan.sukses && <p style={{ color: 'green' }}>{pesan.sukses}</p>}
      {pesan.error && <p style={{ color: 'red' }}>{pesan.error}</p>}
      
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            placeholder="Masukkan email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Username Baru:</label>
          <input 
            type="text" 
            placeholder="Buat username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password Baru:</label>
          <input 
            type="password" 
            placeholder="Buat password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Daftar</button>
      </form>
      
      <p>
        Sudah punya akun? <Link to="/login">Masuk di sini.</Link>
      </p>
    </div>
  );
}

export default Register;