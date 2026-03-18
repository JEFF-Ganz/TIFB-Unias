// ============================================================
// SEED-DATA.JS — Data awal untuk diinisialisasi ke Firebase
// Jalankan dari admin panel via tombol "Inisialisasi Database"
// ============================================================

// Seluruh data anggota kelas (dari script.js)
const SEED_MEMBERS = [];

// Data jadwal kuliah (sesuaikan dengan jadwal asli)
const SEED_SCHEDULE = [];

// Data galeri kegiatan
const SEED_GALLERY = [];

// ─── FUNGSI INISIALISASI ──────────────────────────────────

async function seedDatabase() {
  if (!confirm('⚠️ Ini akan mengisi database dengan data awal.\n\nJika sudah ada data di database, data tersebut TIDAK akan dihapus (hanya menambahkan).\n\nLanjutkan?')) return;

  const statusEl = document.getElementById('seedStatus');
  const btnEl    = document.getElementById('seedBtn');

  function setStatus(text, type = 'info') {
    const colors = { info: 'var(--purple-light)', success: '#6ee7b7', error: '#fca5a5' };
    statusEl.style.color = colors[type];
    statusEl.textContent = text;
  }

  btnEl.disabled = true;
  btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengisi data...';

  try {
    // 1. Check database dulu — jangan overwrite jika sudah ada data
    const memberSnap = await db.ref('members').once('value');
    const hasMembers = memberSnap.exists();
    const schedSnap  = await db.ref('schedule').once('value');
    const hasSched   = schedSnap.exists();

    // 2. Seed members
    if (!hasMembers) {
      setStatus('Mengisi data anggota...');
      const membersRef = db.ref('members');
      for (const m of SEED_MEMBERS) {
        await membersRef.push(m);
      }
      setStatus(`✓ ${SEED_MEMBERS.length} anggota ditambahkan`, 'success');
    } else {
      setStatus(`ℹ️ Anggota sudah ada (${memberSnap.numChildren()} data), tidak di-overwrite`);
    }

    // 3. Seed schedule
    if (!hasSched) {
      setStatus('Mengisi jadwal kuliah...');
      const schedRef = db.ref('schedule');
      for (const s of SEED_SCHEDULE) {
        await schedRef.push(s);
      }
    }

    // 4. Seed gallery (hanya jika kosong)
    const gallerySnap = await db.ref('gallery').once('value');
    if (!gallerySnap.exists()) {
      setStatus('Mengisi data galeri...');
      const gallRef = db.ref('gallery');
      for (const g of SEED_GALLERY) {
        await gallRef.push(g);
      }
    }

    // 5. Seed siteContent (hero, about, contact, dll)
    const siteSnap = await db.ref('siteContent').once('value');
    if (!siteSnap.exists() && typeof DEFAULT_CONTENT !== 'undefined') {
      setStatus('Mengisi konten website...');
      await db.ref('siteContent').set(DEFAULT_CONTENT);
    } else if (siteSnap.exists() && typeof DEFAULT_CONTENT !== 'undefined') {
      // Check for missing music field
      const data = siteSnap.val();
      if (!data.music) {
        setStatus('Mengisi data musik awal...');
        await db.ref('siteContent/music').set(DEFAULT_CONTENT.music);
      }
    }

    setStatus('✅ Database berhasil diinisialisasi! Silakan refresh halaman.', 'success');
    showToast('Database berhasil diisi! Data tampil di admin sekarang.', 'success');
    btnEl.innerHTML = '<i class="fas fa-check"></i> Selesai';

    // Auto reload panels
    setTimeout(() => {
      loadMembers();
      loadSchedule();
      loadGallery();
      loadAllData();
    }, 800);

  } catch(e) {
    setStatus('❌ Error: ' + e.message, 'error');
    showToast('Gagal: ' + e.message, 'error');
    btnEl.disabled = false;
    btnEl.innerHTML = '<i class="fas fa-database"></i> Inisialisasi Database';
  }
}
