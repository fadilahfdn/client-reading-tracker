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
    const token = localStorage.getItem('token');

    try {
      // Menembak ke backend
      const response = await axios.get(`http://localhost:3000/books/search?title=${queryPencarian}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHasilPencarian(response.data.results || []);
    } catch (error) {
      console.error("Gagal mencari buku:", error);
      alert("Terjadi kesalahan saat mencari buku. Pastikan rute /search di backend sudah ada.");
    } finally {
      setLoadingCari(false);
    }
  };

  // fungsi menambah buku ke database
  const handleTambahBuku = async (bukuPilihan) => {
    const token = localStorage.getItem('token');
    const totalHal = bukuPilihan.totalPages || 0;

   // Jika backend mendapati halaman = 0 dari server publik
    if (totalHal === 0) {
      const inputManual = window.prompt(
        `Total halaman untuk "${bukuPilihan.title}" tidak diketahui. Masukkan total halamannya secara manual:`, 
        "300"
      );
      if (inputManual === null) return; 
      totalHal = parseInt(inputManual) || 1; 
    }

    const dataBukuBaru = {
      title: bukuPilihan.title,
      author: bukuPilihan.author,
      startPage: 0,
      endPage: totalHal 
    };

    try {
      const response = await axios.post('http://localhost:3000/books', dataBukuBaru, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBukuList([...bukuList, response.data]);
      setHasilPencarian([]);
      setQueryPencarian('');
    } catch (error) {
      console.error("Gagal menambah buku:", error);
      const errorData = error.response?.data;
      const pesanTolak = errorData?.message || errorData?.error || "Gagal menambahkan buku.";
      alert(pesanTolak);
    }
  };

  // fungsi untuk menghapus buku
  const handleHapusBuku = async (idBuku) => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus buku ini dari rak?");
    if (!konfirmasi) return;

    const token = localStorage.getItem('token');
    try {
      // Tembak endpoint DELETE ke backend berdasarkan ID buku
      await axios.delete(`http://localhost:3000/books/${idBuku}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update State: Buang buku yang ID-nya cocok dengan yang baru saja dihapus
      setBukuList(bukuList.filter((buku) => buku.id !== idBuku));
      
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
      alert("Terjadi kesalahan saat menghapus buku.");
    }
  };

  // fungsi untuk update status buku
  const handleUpdateProgres = async (buku, inputHalaman) => {
    const token = localStorage.getItem('token');
    let pageNumber = parseInt(inputHalaman) || 0;

    // Cegah pengiriman nilai negatif
    if (pageNumber < 0) pageNumber = 0;
    
    if (buku.endPage > 0 && pageNumber > buku.endPage) {
      pageNumber = buku.endPage;
    }

    try {
      const response = await axios.put(`http://localhost:3000/books/${buku.id}/progress`, 
        { currentPage: pageNumber }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Ambil data buku yang sudah di-update dari respons JSON controller
      const updatedBook = response.data.book;
      
      setBukuList(bukuList.map((item) => 
        item.id === buku.id ? updatedBook : item
      ));

      if (updatedBook.status === 'completed' && buku.status !== 'completed') {
         alert(response.data.message);
      }

    } catch (error) {
      console.error("Gagal mengubah progres:", error);
      // Tangkap pesan error spesifik dari backend (misal: "Halaman tidak boleh melebihi total...")
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Terjadi kesalahan saat memperbarui progres buku.");
      }
    }
  };

  // fungsi logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const terjemahkanStatus = (statusSistem) => {
    if (statusSistem === 'unread') return 'Belum Dibaca';
    if (statusSistem === 'reading') return 'Sedang Dibaca';
    if (statusSistem === 'completed') return 'Selesai';
    return statusSistem; // Fallback
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
              <li key={buku.externalId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {buku.coverUrl && (
                    <img src={buku.coverUrl} alt="cover" style={{ width: '30px', height: '45px', objectFit: 'cover' }} />
                  )}
                  <span>
                    <strong>{buku.title}</strong> - {buku.author}
                    <small> ({buku.totalPages || '?'} hal)</small>
                  </span>
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
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {bukuList.map((buku) => (
            <li key={buku.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{buku.title}</strong> <br/> 
                  <small>Penulis: {buku.author}</small> <br/>
                  <span style={{ fontSize: '0.9em', color: buku.status === 'completed' ? 'green' : 'black' }}>
                    Status: <strong>{terjemahkanStatus(buku.status)}</strong>
                  </span>
                </div>
                <button onClick={() => handleHapusBuku(buku.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Hapus
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                <label style={{ fontSize: '0.9em' }}>Progres Halaman:</label>
                
                {/* Input untuk mengupdate currentPage */}
                <input 
                  type="number" 
                  min="0"
                  max={buku.endPage || 9999}
                  value={buku.currentPage || 0}
                  onChange={(e) => handleUpdateProgres(buku, e.target.value)}
                  style={{ width: '80px', padding: '5px' }}
                />
                
                <span style={{ fontSize: '0.9em', marginRight: 'auto' }}>
                  / {buku.endPage || '?'} hal
                </span>

                {buku.status !== 'completed' && buku.endPage > 0 && (
                  <button 
                    onClick={() => handleUpdateProgres(buku, buku.endPage)}
                    style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ✔ Tandai Selesai
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;