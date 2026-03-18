// ============================================================
// FIREBASE CONFIGURATION - TIF-B CyberSquad Website
// ============================================================
// Cara setup:
// 1. Buka https://console.firebase.google.com/
// 2. Buat project baru atau gunakan yang ada
// 3. Tambahkan Web App di project settings
// 4. Copy firebaseConfig dari sana dan paste di bawah
// 5. Aktifkan Realtime Database di Firebase console
// 6. Set rules database ke:
//    { "rules": { ".read": true, ".write": "auth != null" } }
// ============================================================

 const firebaseConfig = {
    apiKey: "AIzaSyDNm91ChaCsO3RtlOU2TZuUu2VyrL1eG40",
    authDomain: "tifb-unias24.firebaseapp.com",
    databaseURL: "https://tifb-unias24-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tifb-unias24",
    storageBucket: "tifb-unias24.firebasestorage.app",
    messagingSenderId: "72778848493",
    appId: "1:72778848493:web:a7177cfff3dd1a656b94e4",
    measurementId: "G-QXHZEYZ15Z"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Database reference
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();


// Default website content (digunakan jika database kosong)
const DEFAULT_CONTENT = {
  hero: {
    title: "Selamat Datang di <br>Kelas TIF-B CyberSquad",
    subtitle: "Bersama menuju masa depan yang cerah dengan teknologi dan kreativitas.",
    btn1Text: "Jelajahi Kelas",
    btn1Link: "#about",
    btn2Text: "Kenali Anggota",
    btn2Link: "#members",
    slides: ["aktivitas 1.jpg", "renang.jpg", "aktivitas 2.jpg"]
  },
  about: {
    historyTitle: "Sejarah Kelas",
    historyText1: "Kelas TIF-B CyberSquad dibentuk pada tahun 2024 sebagai bagian dari Program Studi Teknologi Informasi. Kami adalah kelompok mahasiswa yang bersemangat dalam mempelajari dan mengembangkan teknologi terkini.",
    historyText2: "Dengan 31 anggota yang berasal dari berbagai daerah, kami membentuk tim yang solid dan saling mendukung dalam mencapai kesuksesan akademik.<br>Center Of Excllence...!",
    visi: "Menjadi kelas unggulan yang berprestasi akademik dan non-akademik dengan menerapkan prinsip-prinsip teknologi informasi secara bertanggung jawab.",
    misi: "1. Membangun budaya belajar Yang kolaboratif<br>2. Mengembangkan keterampilan teknologi Yang Handal<br>3. Berkontribusi positif untuk masyarakat Umum",
    motto: "\"Berinovasi, Berkolaborasi,Kreatif,dan Menciptakan Masa Depan yang keren.\"",
    photo: "Boy.jpg"
  },
  contact: {
    email: "tifbfamily@gmail.com",
    whatsapp: "+62 822-6108-1469",
    waLink: "https://wa.me/6282261081469",
    address: "Universitas Nias, Kota Gunungsitoli, Sumatera Utara",
    workHours: "Senin - Jumat: 08:00 - 16:00",
    instagramUrl: "https://www.instagram.com/universitasnias?igsh=MWYxazhxcWU0M25wcg==",
    youtubeUrl: "https://youtube.com/@universitasnias8072?si=NCCvptPyReF72LRH",
    facebookUrl: "https://www.facebook.com/share/1AuFqssQnt/"
  },
  footer: {
    copyright: "© 2024 Kelas TIF-B CyberSquad. Hak Cipta Dilindungi.",
    developerName: "Jefrin Telaumbanua",
    developerRole: "Programmer TIF-B CyberSquad",
    developerPhoto: "programmer.jpg"
  },
  nav: {
    logoText: "TIF-B CyberSquad"
  },
  music: [
    { title: "A mortal music", artist: "Unknown", src: "A mortal music.mp3" },
    { title: "Oh Simple Thing", artist: "Unknown", src: "oh simple thing.mp3" },
    { title: "Play For Me", artist: "Unknown", src: "play for me.mp3" },
    { title: "Song", artist: "Unknown", src: "song.mp3" }
  ]
};

// Load content from Firebase, fallback to defaults
async function loadSiteContent() {
  try {
    const snapshot = await db.ref('siteContent').once('value');
    const data = snapshot.val();
    if (data) {
      return mergeDeep(DEFAULT_CONTENT, data);
    }
    return DEFAULT_CONTENT;
  } catch (e) {
    console.warn('Could not load from Firebase, using defaults:', e);
    return DEFAULT_CONTENT;
  }
}

// Deep merge helper
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
