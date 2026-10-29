// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [bukuList, setBukuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesanError, setPesanError] = useState('');

  const [queryPencarian, setQueryPencarian] = useState('');
  const [hasilPencarian, setHasilPencarian] = useState([]);
  const [loadingCari, setLoadingCari] = useState(false);
  
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

  // fungsi mencari buku ke open library
  const handleCariBuku = async (e) => {
    e.preventDefault();
    if (!queryPencarian) return;

    setLoadingCari(true);
    setHasilPencarian([]);
    try {
      const response = await axios.get(`https://openlibrary.org/search.json?title=${queryPencarian}&limit=5`);
      setHasilPencarian(response.data.docs); // Open Library menaruh datanya di dalam properti 'docs'
    } catch (error) {
      console.error("Gagal mencari dari Open Library:", error);
      alert("Terjadi kesalahan saat mencari buku ke server luar.");
    } finally {
      setLoadingCari(false);
    }
  };

  // fungsi menambah buku ke database
  const handleTambahBuku = async (bukuPilihan) => {
    const token = localStorage.getItem('token');
    
    const dataBukuBaru = {
      title: bukuPilihan.title,
      author: bukuPilihan.author_name ? bukuPilihan.author_name[0] : 'Penulis Tidak Diketahui', 
      totalPages: bukuPilihan.number_of_pages_median || 0, 
      status: 'Belum Dibaca'
    };

    try {
      const response = await axios.post('http://localhost:3000/books', dataBukuBaru, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBukuList([...bukuList, response.data]);
      
      setHasilPencarian([]);
      setQueryPencarian('');
      alert("Buku berhasil ditambahkan ke rak Anda!");
      
    } catch (error) {
      console.error("Gagal menambah ke database:", error);
      alert("Gagal menambahkan buku ke koleksi Anda.");
    }
  };

  // fungsi logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <p>Memuat data buku...</p>;

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard Reading Tracker</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {pesanError && <p style={{ color: 'red' }}>{pesanError}</p>}

      {/* --- Area pencarian buku --- */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Cari Buku Baru</h3>
        <form onSubmit={handleCariBuku} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Ketik judul buku..." 
            value={queryPencarian}
            onChange={(e) => setQueryPencarian(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loadingCari}>
            {loadingCari ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        {/* Tampilkan hasil dari Open Library jika ada */}
        {hasilPencarian.length > 0 && (
          <ul style={{ background: '#f9f9f9', padding: '10px', marginTop: '15px' }}>
            {hasilPencarian.map((buku) => (
              <li key={buku.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>
                  <strong>{buku.title}</strong> - {buku.author_name ? buku.author_name[0] : 'Unknown'}
                </span>
                <button onClick={() => handleTambahBuku(buku)}>Tambah</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Area koleksi buku user --- */}
      <h3>Daftar Bacaan Saya</h3>
      {bukuList.length === 0 ? (
        <p>Belum ada buku di dalam koleksi Anda. Silakan cari dan tambah buku di atas!</p>
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