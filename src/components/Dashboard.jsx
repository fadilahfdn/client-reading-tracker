// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Sun, Moon, LogOut, CheckCircle, BookOpen, Star, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const [bukuList, setBukuList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [queryPencarian, setQueryPencarian] = useState('');
  const [hasilPencarian, setHasilPencarian] = useState([]);
  const [loadingCari, setLoadingCari] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, bukuPilihan: null, inputHal: 300 });
  const [filterStatus, setFilterStatus] = useState('all'); // Pilihan: 'all', 'unread', 'reading', 'completed'

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/books`, {
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/books/search?title=${queryPencarian}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHasilPencarian(response.data.results || []);
    } catch (error) {
      showToast("Terjadi kesalahan saat mencari buku.", "error");
    } finally {
      setLoadingCari(false);
    }
  };

  // fungsi menambah buku ke database
  const handleKlikTambah = (bukuPilihan) => {
    let totalHal = bukuPilihan.totalPages || 0;
    
    if (totalHal === 0) {
      setModalConfig({ isOpen: true, bukuPilihan: bukuPilihan, inputHal: 300 });
    } else {
      // Langsung eksekusi jika halaman sudah ada
      eksekusiSimpanBuku(bukuPilihan, totalHal);
    }
  };

  // Fungsi riil penembak Axios
  const eksekusiSimpanBuku = async (bukuPilihan, totalHal) => {
    const token = localStorage.getItem('token');
    const dataBukuBaru = {
      title: bukuPilihan.title,
      author: bukuPilihan.author, 
      startPage: 0,
      endPage: totalHal,
      coverUrl: bukuPilihan.coverUrl || null
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/books`, dataBukuBaru, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBukuList([...bukuList, response.data]); 
      setHasilPencarian([]);
      setQueryPencarian('');
      setModalConfig({ isOpen: false, bukuPilihan: null, inputHal: 300 }); // Tutup modal
      
      // Jika tab saat ini bukan "Semua" atau "Belum Dibaca", pindahkan otomatis
      if (filterStatus !== 'all' && filterStatus !== 'unread') {
        setFilterStatus('unread');
      }

      showToast(`Buku "${bukuPilihan.title}" berhasil ditambahkan!`, "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal menambahkan buku.", "error");
    }
  };

  // Membuka modal dan menyimpan ID buku yang akan dihapus
  const handleHapusBuku = (id) => {
    setBookToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Mengeksekusi penghapusan
  const executeHapusBuku = async () => {
    if (!bookToDelete) return;
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/books/${bookToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBukuList(bukuList.filter((b) => b.id !== bookToDelete));
      showToast("Buku berhasil dihapus", "success");
    } catch (error) {
      showToast("Gagal menghapus buku", "error");
    } finally {
      // Tutup modal dan bersihkan state setelah selesai
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  // Menutup modal jika batal
  const cancelHapusBuku = () => {
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
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
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/books/${buku.id}/progress`, 
        { currentPage: pageNumber }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Ambil data buku yang sudah di-update dari respons JSON controller
      const updatedBook = response.data.book;
      
      setBukuList(bukuList.map((item) => 
        item.id === buku.id ? updatedBook : item
      ));

      if (updatedBook.status === 'completed' && buku.status !== 'completed') {
         showToast(response.data.message, "success");
      }

    } catch (error) {
      showToast(error.response?.data?.message || "Gagal memperbarui progres.", "error");
    }
  };

  const handleUpdateReview = async (id, newRating, newReview) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/books/${id}/review`, 
        { rating: newRating, review: newReview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Perbarui state lokal agar UI langsung berubah tanpa perlu refresh
      setBukuList(bukuList.map((item) => 
        item.id === id ? { ...item, rating: newRating, review: newReview } : item
      ));
      
      showToast("Ulasan berhasil disimpan!", "success");
    } catch (error) {
      showToast("Gagal menyimpan ulasan.", "error");
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

  // Kalkulasi statistik
  const totalBukuTersimpan = bukuList.length;
  const totalBukuTamat = bukuList.filter((buku) => buku.status === 'completed').length;
  const totalHalamanDibaca = bukuList.reduce((akumulator, buku) => akumulator + (buku.currentPage || 0), 0);

  // Mengambil bukuList, lalu menyaringnya berdasarkan Tab yang sedang diklik
  const bukuTampil = bukuList.filter((buku) => {
    if (filterStatus === 'all') return true;
    return buku.status === filterStatus;
  });

  // === UI SAAT LOADING (SKELETON ANIMATION) ===
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="header">
          <h2>My Reading Tracker</h2>
          <div className="skeleton-box" style={{ width: '80px', height: '35px', borderRadius: '6px' }}></div>
        </div>
        
        {/* Skeleton Kotak Pencarian */}
        <div className="skeleton-box" style={{ width: '100%', height: '120px', borderRadius: '12px', marginBottom: '40px' }}></div>
        
        <h3>Koleksi Buku Saya</h3>
        <ul className="book-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <li key={n} className="skeleton-card">
              <div>
                <div className="skeleton-box" style={{ width: '70%', height: '24px', marginBottom: '8px' }}></div>
                <div className="skeleton-box" style={{ width: '50%', height: '16px', marginBottom: '20px' }}></div>
                <div className="skeleton-box" style={{ width: '90px', height: '22px', borderRadius: '12px', marginBottom: '15px' }}></div>
                <div className="skeleton-box" style={{ width: '100%', height: '10px', borderRadius: '8px', marginBottom: '15px' }}></div>
              </div>
              <div className="skeleton-box" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // === UI UTAMA (SETELAH LOADING SELESAI) ===
  return (
    <div className="dashboard-container">
      
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} 
            {toast.message}
          </div>
        </div>
      )}

      {modalConfig.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Masukkan Halaman Manual</h3>
            <p>
              Data total halaman untuk buku <strong>"{modalConfig.bukuPilihan?.title}"</strong> tidak ditemukan di server publik. 
              Silakan masukkan perkiraan halamannya:
            </p>
            <input 
              type="number" 
              className="modal-input"
              value={modalConfig.inputHal}
              min="1"
              onChange={(e) => setModalConfig({ ...modalConfig, inputHal: parseInt(e.target.value) || 0 })}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModalConfig({ isOpen: false, bukuPilihan: null, inputHal: 300 })}>
                Batal
              </button>
              <button className="btn-confirm" onClick={() => eksekusiSimpanBuku(modalConfig.bukuPilihan, modalConfig.inputHal)}>
                Simpan Buku
              </button>
            </div>
          </div>
        </div>
      )}

      { /* Modal konfirmasi hapus */ }
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="delete-modal-header">
              <div className="warning-icon-bg">
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <h3>Hapus Buku?</h3>
            </div>
            <p className="delete-modal-text">
              Apakah Anda yakin ingin menghapus buku ini dari koleksi? Tindakan ini tidak dapat dibatalkan dan data ulasan akan hilang.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={cancelHapusBuku}>
                Batal
              </button>
              <button className="btn-confirm-delete" onClick={executeHapusBuku}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header">
        <h2>My Reading Tracker</h2>
        <div className="header-actions">
          <button 
            className="btn-theme" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Ganti Mode Tampilan"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            {isDarkMode ? 'Terang' : 'Gelap'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
            </button>
        </div>
      </div>

      {/* === KERANGKA WIDGET STATISTIK === */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-value">{totalBukuTersimpan}</span>
          <span className="stat-label">Total Buku</span>
        </div>
        <div className="stat-card success">
          <span className="stat-value">{totalBukuTamat}</span>
          <span className="stat-label">Buku Tamat</span>
        </div>
        <div className="stat-card purple">
          <span className="stat-value">{totalHalamanDibaca}</span>
          <span className="stat-label">Halaman Dibaca</span>
        </div>
      </div>

      {/* === KERANGKA Kolom Pencarian === */}
      <div className="search-section">
        <h3 style={{ marginTop: 0 }}>Cari Buku</h3>
        <form className="search-form" onSubmit={handleCariBuku}>
          <input 
            type="text" 
            className="search-input"
            placeholder="Ketik judul buku (contoh: Atomic Habits)" 
            value={queryPencarian}
            onChange={(e) => setQueryPencarian(e.target.value)}
          />
          <button type="submit" className="btn-search" disabled={loadingCari}>
            {loadingCari ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        {hasilPencarian.length > 0 && (
          <ul className="search-results">
            {hasilPencarian.map((buku) => (
              <li key={buku.externalId} className="search-result-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {buku.coverUrl ? (
                    <img src={buku.coverUrl} alt="cover" className="book-cover-img" style={{ width: '40px', height: '60px' }} />
                  ) : (
                    <div className="book-cover-placeholder" style={{ width: '40px', height: '60px', fontSize: '1em' }}>
                    <BookOpen size={24} color="var(--text-muted)" />
                    </div>
                  )}
                  <span>
                    <strong style={{ display: 'block', fontSize: '1.1em' }}>{buku.title}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{buku.author} • {buku.totalPages || '?'} Halaman</span>
                  </span>
                </span>
                <button className="btn-add" onClick={() => handleKlikTambah(buku)}>+ Tambah</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-heading)' }}>Koleksi Buku Saya</h3>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9em', fontWeight: 'bold' }}>
          Total: {bukuTampil.length} Buku
        </span>
      </div>

      <div className="filter-container">
        <button className={`tab-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
          Semua
        </button>
        <button className={`tab-btn ${filterStatus === 'unread' ? 'active' : ''}`} onClick={() => setFilterStatus('unread')}>
          Belum Dibaca
        </button>
        <button className={`tab-btn ${filterStatus === 'reading' ? 'active' : ''}`} onClick={() => setFilterStatus('reading')}>
          Sedang Dibaca
        </button>
        <button className={`tab-btn ${filterStatus === 'completed' ? 'active' : ''}`} onClick={() => setFilterStatus('completed')}>
          Selesai
        </button>
      </div>

      {bukuTampil.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', background: 'var(--bg-section)', borderRadius: '12px' }}>
          {filterStatus === 'all' 
            ? "Belum ada buku di rak Anda. Mulai cari dan tambahkan buku pertama Anda!"
            : `Tidak ada buku dengan status "${terjemahkanStatus(filterStatus)}" saat ini.`}
        </p>
      ) : (
        <ul className="book-grid">
          {bukuTampil.map((buku, index) => {
            const persentase = buku.endPage > 0 ? Math.round(((buku.currentPage || 0) / buku.endPage) * 100) : 0;
            return (
              <li key={buku.id} className="book-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div>
                  <div className="book-card-body">
                    {buku.coverUrl ? (
                      <img src={buku.coverUrl} alt={buku.title} className="book-cover-img" />
                    ) : (
                      <div className="book-cover-placeholder">📖</div>
                    )}
                    
                    <div className="book-info">
                      <div className="book-header" style={{ marginBottom: 0 }}>
                        <div>
                          <h4 className="book-title">{buku.title}</h4>
                          <p className="book-author">{buku.author}</p>
                        </div>
                        <button className="btn-delete" title="Hapus Buku" onClick={() => handleHapusBuku(buku.id)}>
                        <Trash2 size={18} />
                        </button>
                      </div>
                      <span className={`badge ${buku.status}`}>
                        {terjemahkanStatus(buku.status)}
                      </span>
                    </div>
                  </div>

                  <div className="progress-container">
                    <div className={`progress-fill ${buku.status === 'completed' ? 'done' : ''}`} style={{ width: `${persentase}%` }}></div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8em', color: 'var(--text-muted)', marginBottom: '15px' }}>
                    {persentase}% Selesai
                  </div>
                </div>
                
                <div className="book-controls">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number" 
                      className="page-input"
                      min="0"
                      max={buku.endPage || 9999}
                      value={buku.currentPage || 0}
                      onChange={(e) => handleUpdateProgres(buku, e.target.value)}
                    />
                    <span style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>/ {buku.endPage || '?'} hal</span>
                  </div>

                  {buku.status !== 'completed' && buku.endPage > 0 && (
                    <button className="btn-done" onClick={() => handleUpdateProgres(buku, buku.endPage)}>
                      <CheckCircle size={16} /> Selesai
                    </button>
                  )}
                </div>

                {/* === Fitur Rating dan Ulasan (Hanya muncul jika buku tamat) === */}
                {buku.status === 'completed' && (
                  <div className="review-container">
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          fill={buku.rating >= star ? "#fbbf24" : "none"}
                          color={buku.rating >= star ? "#fbbf24" : "var(--border-color)"}
                          onClick={() => handleUpdateReview(buku.id, star, buku.review)}
                          className="star-icon"
                        />
                      ))}
                    </div>
                    <textarea 
                      className="review-input"
                      placeholder="Bagaimana pendapat Anda tentang buku ini?..."
                      defaultValue={buku.review || ''}
                      onBlur={(e) => handleUpdateReview(buku.id, buku.rating, e.target.value)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;