// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [bukuList, setBukuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesanError, setPesanError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Mengambil token dari Local Storage
    const token = localStorage.getItem('token');

    // Jika tidak ada token, tendang langsung ke /login
    if (!token) {
      navigate('/login');
      return;
    }

    // Fungsi untuk mengambil data buku pengguna dari backend
    const fetchBuku = async () => {
      try {
        const response = await axios.get('http://localhost:3000/books', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setBukuList(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setPesanError("Gagal mengambil daftar buku.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBuku();
  }, [navigate]);

  if (loading) return <p>Memuat data buku...</p>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard Reading Tracker</h2>

      {pesanError && <p style={{ color: 'red' }}>{pesanError}</p>}

      <h3>Daftar Bacaan Saya</h3>
      
      {bukuList.length === 0 ? (
        <p>Belum ada buku di dalam koleksi Anda.</p>
      ) : (
        <ul>
          {bukuList.map((buku) => (
            <li key={buku.id}>
              <strong>{buku.title}</strong> - {buku.author} ({buku.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;