import type { Lesson } from "@/types";

/**
 * Learning content. Each lesson follows the CekGuard structure:
 * Concept → Real Example → Why It Is Dangerous → How To Recognize → What To Do → Mini Quiz.
 * Concept text is written for three literacy levels (adaptive learning).
 */
export const LESSONS: Lesson[] = [
  /* ------------------------------------------------------------ JUDOL */
  {
    id: "l-judol-1",
    slug: "mengenali-promosi-judi-online",
    category: "judol",
    title: "Cara Mengenali Promosi Judi Online",
    level: "pemula",
    durationMin: 6,
    description: "Pelajari pola bahasa, tautan, dan trik yang dipakai promosi judi online di kolom komentar.",
    objectives: ["Ciri-ciri komentar promosi judi", "Trik penyamaran teks", "Tautan dan pengalihan ke profil", "Tindakan aman saat menemukannya"],
    quizId: "quiz-judol",
    steps: [
      {
        type: "concept",
        title: "Apa itu promosi judi online?",
        body: {
          pemula:
            "Promosi judi online adalah ajakan untuk bermain judi di internet. Biasanya muncul sebagai komentar yang menjanjikan bonus atau uang cepat, lalu menyuruh kamu membuka sebuah tautan.",
          menengah:
            "Promosi judi online memanfaatkan kolom komentar, akun palsu, dan pesan langsung untuk mengarahkan pengguna ke situs judi. Pelaku memakai bahasa persuasif, klaim bonus, dan testimoni palsu agar terlihat menguntungkan.",
          lanjutan:
            "Promosi judol merupakan kampanye spam terkoordinasi yang memakai jaringan akun (bot/akun curian), penyamaran leksikal (obfuscation) untuk menghindari moderasi otomatis, serta rotasi domain/mirror agar tetap dapat diakses setelah pemblokiran.",
        },
        keyPoints: ["Muncul di komentar, DM, dan bio akun", "Menjanjikan bonus atau uang cepat", "Selalu mengarahkan ke tautan atau profil"],
      },
      {
        type: "example",
        title: "Contoh nyata dari kolom komentar",
        intro: "Klik bagian yang ditandai untuk melihat tanda bahayanya.",
        source: "Komentar pada video edukasi (data demo CekJudol)",
        altText:
          "Komentar: Bonus new member 100% langsung cair! Daftar sekarang di demo-example.com. Bagian bonus, kata daftar sekarang, dan tautan ditandai sebagai tanda bahaya.",
        segments: [
          { text: "Bonus new member 100%", flag: "Klaim bonus: janji hadiah besar untuk memancing pendaftar baru." },
          { text: " " },
          { text: "langsung cair!", flag: "Janji uang cepat: seolah-olah uang pasti didapat tanpa risiko." },
          { text: " " },
          { text: "Daftar sekarang", flag: "Ajakan bermain dengan desakan waktu agar kamu tidak berpikir panjang." },
          { text: " di " },
          { text: "demo-example.com", flag: "Tautan mencurigakan menuju situs yang tidak jelas pemiliknya." },
          { text: " 🔥" },
        ],
      },
      {
        type: "danger",
        title: "Mengapa ini berbahaya?",
        points: [
          { title: "Kerugian uang", body: "Sistem judi dirancang agar pemain lebih sering kalah. 'Bonus' hanya umpan agar kamu menyetor uang." },
          { title: "Kecanduan", body: "Kemenangan kecil di awal memicu rasa ingin terus bermain dan sulit berhenti." },
          { title: "Pencurian data", body: "Situs judi ilegal sering meminta data pribadi dan rekening yang bisa disalahgunakan." },
          { title: "Melanggar hukum", body: "Perjudian online dilarang di Indonesia dan dapat menimbulkan konsekuensi hukum." },
        ],
      },
      {
        type: "recognize",
        title: "Cara mengenalinya",
        indicators: [
          { label: "Ajakan bermain", hint: "Kata seperti daftar, gabung, main, buruan." },
          { label: "Klaim bonus", hint: "Bonus member baru, cashback, freebet, saldo gratis." },
          { label: "Istilah judi", hint: "Slot, gacor, maxwin, JP, RTP, scatter, togel." },
          { label: "Janji uang cepat", hint: "Depo 10rb jadi jutaan, WD berapapun dibayar." },
          { label: "Tautan atau pengalihan", hint: "Domain asing, 'cek bio', 'link di profil', 'DM aku'." },
          { label: "Ejaan disamarkan", hint: "g4c0r, s.l.o.t — dibuat agar lolos filter otomatis." },
        ],
      },
      {
        type: "action",
        title: "Yang harus dilakukan",
        steps: [
          { title: "Jangan klik tautannya", body: "Membuka tautan dapat mengarahkan ke situs berbahaya atau berisi malware." },
          { title: "Laporkan komentar", body: "Gunakan fitur Laporkan → Spam/Penipuan di platform agar komentar ditinjau moderator." },
          { title: "Blokir akunnya", body: "Mencegah akun yang sama muncul lagi di linimasa kamu." },
          { title: "Ingatkan teman", body: "Bagikan pengetahuan ini, terutama kepada adik atau teman yang sering menonton konten di media sosial." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Komentar mana yang paling mungkin promosi judi online?",
            options: [
              { id: "a", text: "“Tipsnya membantu, terima kasih kak!”" },
              { id: "b", text: "“Mau tau pola gacor? cek bio aku ya”" },
              { id: "c", text: "“Kapan bahas cara membaca cepat?”" },
            ],
            correctId: "b",
            explanation: "Komentar B memakai istilah judi (gacor) dan mengalihkan ke bio — dua tanda khas promosi judol.",
          },
        ],
      },
    ],
  },
  {
    id: "l-judol-2",
    slug: "bahaya-judi-online",
    category: "judol",
    title: "Mengapa Judi Online Selalu Merugikan",
    level: "menengah",
    durationMin: 5,
    description: "Memahami mekanisme yang membuat pemain judi online hampir selalu rugi dan cara keluar dari jebakannya.",
    objectives: ["Konsep house edge", "Jebakan near-miss dan bonus", "Dampak finansial dan sosial", "Tempat mencari bantuan"],
    quizId: "quiz-judol",
    steps: [
      {
        type: "concept",
        title: "Sistem yang dirancang untuk menang",
        body: {
          pemula:
            "Permainan judi online sudah diatur agar bandar selalu untung. Kamu mungkin menang sesekali, tetapi jika terus bermain, uangmu akan habis.",
          menengah:
            "Setiap permainan judi memiliki 'house edge' — keuntungan matematis bagi bandar. Semakin lama bermain, semakin pasti hasilnya mendekati kerugian bagi pemain.",
          lanjutan:
            "Return-to-player (RTP) di bawah 100% berarti nilai harapan (expected value) negatif bagi pemain. Ditambah variabilitas tinggi dan reward terjadwal acak (variable-ratio reinforcement), pola ini mendorong perilaku kompulsif.",
        },
        keyPoints: ["Bandar selalu punya keunggulan", "Menang di awal adalah umpan", "Semakin lama bermain, semakin besar kerugian"],
      },
      {
        type: "example",
        title: "Contoh pola jebakan",
        intro: "Klik bagian yang ditandai pada pesan berikut.",
        source: "Pesan langsung (DM) — data demo",
        altText: "Pesan DM yang menawarkan saldo gratis, mengklaim pemain lain menang, lalu meminta deposit kedua.",
        segments: [
          { text: "Kak, saldo gratis 20rb sudah masuk ke akunmu.", flag: "Saldo gratis membuat korban merasa tidak rugi apa-apa di awal." },
          { text: " " },
          { text: "Member lain barusan WD 5 juta!", flag: "Testimoni palsu (social proof) agar kamu percaya situsnya membayar." },
          { text: " " },
          { text: "Depo 50rb lagi biar saldo bisa ditarik ya.", flag: "Syarat tersembunyi: uang 'gratis' baru bisa ditarik setelah setor uang sungguhan." },
        ],
      },
      {
        type: "danger",
        title: "Dampaknya",
        points: [
          { title: "Utang dan pinjol", body: "Banyak korban meminjam uang untuk menutup kekalahan, lalu terjerat utang." },
          { title: "Kesehatan mental", body: "Stres, cemas, dan rasa bersalah meningkat seiring kerugian." },
          { title: "Hubungan sosial", body: "Kebohongan untuk menutupi kebiasaan judi merusak kepercayaan keluarga dan teman." },
        ],
      },
      {
        type: "recognize",
        title: "Tanda seseorang mulai terjebak",
        indicators: [
          { label: "Mengejar kekalahan", hint: "Bermain lagi untuk 'balik modal'." },
          { label: "Menyembunyikan aktivitas", hint: "Berbohong soal uang atau waktu bermain." },
          { label: "Meminjam uang", hint: "Meminjam ke teman atau pinjol untuk bermain." },
          { label: "Sulit berhenti", hint: "Gagal berhenti meskipun sudah berniat." },
        ],
      },
      {
        type: "action",
        title: "Langkah aman",
        steps: [
          { title: "Berhenti dan putuskan akses", body: "Hapus aplikasi, blokir situs, dan keluar dari grup promosi." },
          { title: "Ceritakan pada orang tepercaya", body: "Orang tua, guru BK, atau konselor dapat membantu tanpa menghakimi." },
          { title: "Cari bantuan profesional", body: "Layanan konseling dan psikolog dapat membantu mengatasi kecanduan." },
          { title: "Laporkan situsnya", body: "Situs judi dapat dilaporkan melalui kanal aduan konten resmi pemerintah (aduankonten.id)." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Seseorang mendapat 'saldo gratis' lalu diminta deposit agar bisa menarik uang. Ini contoh…",
            options: [
              { id: "a", text: "Promo yang menguntungkan pemain" },
              { id: "b", text: "Jebakan agar korban menyetor uang sungguhan" },
              { id: "c", text: "Program resmi untuk pelajar" },
            ],
            correctId: "b",
            explanation: "Saldo gratis hanya umpan. Syarat deposit membuat korban mulai menyetor uang sungguhan.",
          },
        ],
      },
    ],
  },

  /* --------------------------------------------------------- PHISHING */
  {
    id: "l-phishing-1",
    slug: "cara-mengenali-phishing",
    category: "phishing",
    title: "Cara Mengenali Phishing",
    level: "pemula",
    durationMin: 5,
    description: "Kenali pesan dan situs palsu yang mencoba mencuri kata sandi, OTP, dan data pribadi.",
    objectives: ["Ciri-ciri phishing", "Teknik impersonation", "Tautan mencurigakan", "Tindakan aman"],
    quizId: "quiz-phishing",
    steps: [
      {
        type: "concept",
        title: "Apa itu phishing?",
        body: {
          pemula:
            "Phishing adalah penipuan yang mencoba membuat seseorang memberikan informasi pribadi melalui pesan atau situs palsu.",
          menengah:
            "Phishing memanfaatkan teknik social engineering untuk mengarahkan korban menuju situs atau komunikasi yang menyerupai layanan resmi.",
          lanjutan:
            "Phishing merupakan serangan social engineering yang memanfaatkan impersonation, urgency, credential harvesting, atau malicious redirection.",
        },
        keyPoints: ["Menyamar sebagai pihak resmi", "Membuat korban panik atau tergiur", "Meminta data rahasia atau klik tautan"],
      },
      {
        type: "example",
        title: "Contoh pesan phishing",
        intro: "Klik bagian yang ditandai untuk melihat tanda bahayanya.",
        source: "SMS/WhatsApp — data demo",
        altText:
          "Pesan yang mengaku dari Bank Nusantara, menyatakan akun akan diblokir dalam 10 menit, meminta klik tautan verifikasi dan mengirim kode OTP.",
        segments: [
          { text: "[Bank Nusantara]", flag: "Impersonation: mengaku sebagai bank agar terlihat resmi." },
          { text: " " },
          { text: "Akun Anda akan diblokir dalam 10 menit.", flag: "Urgency: desakan waktu agar kamu panik dan tidak sempat berpikir." },
          { text: " Segera verifikasi di " },
          { text: "bank-nusantara-login.demo-example.com", flag: "Domain palsu: nama bank ditempel pada domain lain." },
          { text: " " },
          { text: "dan kirimkan kode OTP Anda.", flag: "Bank tidak pernah meminta OTP. OTP adalah kunci akunmu." },
        ],
      },
      {
        type: "danger",
        title: "Mengapa berbahaya?",
        points: [
          { title: "Akun diambil alih", body: "Dengan kata sandi dan OTP, pelaku dapat masuk dan mengunci kamu dari akunmu sendiri." },
          { title: "Kerugian finansial", body: "Saldo rekening atau dompet digital dapat dikuras dalam hitungan menit." },
          { title: "Penyebaran lanjutan", body: "Akunmu dipakai untuk menipu teman dan keluarga." },
        ],
      },
      {
        type: "recognize",
        title: "Cara mengenali",
        indicators: [
          { label: "Pengirim tidak resmi", hint: "Nomor pribadi atau email dengan domain aneh." },
          { label: "Desakan waktu", hint: "“dalam 10 menit”, “hari ini juga”." },
          { label: "Meminta data rahasia", hint: "OTP, PIN, kata sandi, nomor kartu." },
          { label: "Tautan menyerupai resmi", hint: "Nama layanan ditempel pada domain lain." },
          { label: "Bahasa janggal", hint: "Salah ketik atau format tidak biasa." },
        ],
      },
      {
        type: "action",
        title: "Yang harus dilakukan",
        steps: [
          { title: "Jangan klik tautan", body: "Buka aplikasi atau situs resmi dengan mengetik alamatnya sendiri." },
          { title: "Jangan berikan OTP/PIN", body: "Tidak ada petugas resmi yang berhak meminta OTP." },
          { title: "Verifikasi melalui kanal resmi", body: "Hubungi nomor resmi yang tertera di kartu atau situs resmi layanan." },
          { title: "Laporkan dan blokir", body: "Laporkan nomor/akun pengirim dan simpan tangkapan layar sebagai bukti." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Pesan meminta OTP karena akun akan diblokir. Apa yang paling aman?",
            options: [
              { id: "a", text: "Kirim OTP agar akun tidak diblokir" },
              { id: "b", text: "Hubungi bank melalui kanal resmi" },
              { id: "c", text: "Klik tautan untuk mengecek akun" },
            ],
            correctId: "b",
            explanation: "Verifikasi selalu melalui kanal resmi. OTP tidak boleh dibagikan kepada siapa pun.",
          },
        ],
      },
    ],
  },
  {
    id: "l-phishing-2",
    slug: "memeriksa-tautan-mencurigakan",
    category: "phishing",
    title: "Memeriksa Tautan Sebelum Mengklik",
    level: "menengah",
    durationMin: 6,
    description: "Belajar membaca struktur URL untuk menemukan domain asli dan tanda peniruan.",
    objectives: ["Membaca struktur URL", "Menemukan domain asli", "Mengenali tautan pemendek", "Memeriksa dengan aman"],
    quizId: "quiz-phishing",
    steps: [
      {
        type: "concept",
        title: "Anatomi sebuah URL",
        body: {
          pemula:
            "Alamat situs punya bagian penting bernama domain. Domain asli adalah kata tepat sebelum .com/.co.id. Kata-kata di depannya bisa dibuat siapa saja.",
          menengah:
            "URL terdiri dari protokol, subdomain, domain utama, dan path. Pelaku sering menaruh nama merek di subdomain atau path agar URL terlihat resmi padahal domain utamanya milik pelaku.",
          lanjutan:
            "Yang menentukan pemilik situs adalah registrable domain (eTLD+1). Teknik umum: brand-in-subdomain, typosquatting, homoglyph/punycode (IDN), credential-in-URL (user@host), serta open redirect.",
        },
        keyPoints: ["Baca domain dari kanan ke kiri", "Nama merek di depan belum tentu resmi", "HTTPS bukan jaminan aman"],
      },
      {
        type: "example",
        title: "Membedah tautan palsu",
        intro: "Klik setiap bagian URL.",
        source: "Tautan dari pesan — data demo",
        altText:
          "URL http://bank-nusantara-login-security.demo-example.com/verifikasi?akun=blokir dipecah menjadi bagian-bagian yang menunjukkan tanda bahaya.",
        segments: [
          { text: "http://", flag: "Tanpa HTTPS: data tidak terenkripsi. (Namun HTTPS juga bisa dipakai situs palsu.)" },
          { text: "bank-nusantara-login-security.", flag: "Subdomain berisi nama bank dan kata 'login' agar terlihat resmi." },
          { text: "demo-example.com", flag: "Ini domain aslinya — bukan milik bank." },
          { text: "/verifikasi?akun=blokir", flag: "Kata desakan di path untuk menakut-nakuti." },
        ],
      },
      {
        type: "danger",
        title: "Risiko mengklik tautan palsu",
        points: [
          { title: "Halaman login palsu", body: "Data yang kamu ketik langsung dikirim ke pelaku." },
          { title: "Unduhan berbahaya", body: "Beberapa tautan memicu unduhan aplikasi/APK berisi malware." },
          { title: "Pengalihan berantai", body: "Tautan pemendek dapat mengarah ke situs yang berbeda dari yang terlihat." },
        ],
      },
      {
        type: "recognize",
        title: "Checklist memeriksa URL",
        indicators: [
          { label: "Temukan domain utama", hint: "Lihat dua bagian terakhir sebelum garis miring pertama." },
          { label: "Cek ejaan", hint: "bannk, g00gle, rn yang menyerupai m." },
          { label: "Waspadai pemendek", hint: "bit.ly, s.id menyembunyikan tujuan." },
          { label: "Waspadai karakter @", hint: "Bagian sebelum @ diabaikan browser." },
          { label: "Cek ekstensi tidak biasa", hint: ".xyz, .top, .click sering dipakai sementara." },
        ],
      },
      {
        type: "action",
        title: "Langkah aman",
        steps: [
          { title: "Tahan dulu", body: "Jangan langsung klik. Tekan lama untuk melihat URL lengkap." },
          { title: "Gunakan CekLink", body: "Periksa struktur URL dan pelajari indikatornya." },
          { title: "Ketik alamat resmi sendiri", body: "Akses layanan dari aplikasi resmi atau bookmark." },
          { title: "Laporkan", body: "Laporkan tautan phishing ke platform tempat kamu menerimanya." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Pada URL login.bank-resmi.demo-example.com, domain aslinya adalah…",
            options: [
              { id: "a", text: "login.bank-resmi" },
              { id: "b", text: "bank-resmi.demo-example.com" },
              { id: "c", text: "demo-example.com" },
            ],
            correctId: "c",
            explanation: "Domain asli dibaca dari kanan: demo-example.com. Bagian di depannya hanya subdomain.",
          },
        ],
      },
    ],
  },

  /* --------------------------------------------------------- DEEPFAKE */
  {
    id: "l-deepfake-1",
    slug: "verifikasi-media-digital",
    category: "deepfake",
    title: "Cara Verifikasi Media Digital",
    level: "menengah",
    durationMin: 7,
    description: "Langkah praktis memeriksa keaslian foto dan video sebelum mempercayai atau membagikannya.",
    objectives: ["Tanda visual manipulasi", "Pencarian gambar terbalik", "Memeriksa sumber dan konteks", "Batasan alat deteksi"],
    quizId: "quiz-deepfake",
    steps: [
      {
        type: "concept",
        title: "Verifikasi: sumber, konteks, konten",
        body: {
          pemula:
            "Sebelum percaya pada foto atau video, cek dulu: siapa yang pertama membagikan, kapan dan di mana kejadiannya, dan apakah ada bagian gambar yang terlihat aneh.",
          menengah:
            "Verifikasi media dilakukan dengan tiga lapis: sumber (siapa pengunggah pertama), konteks (waktu/lokasi/klaim), dan konten (artefak visual). Alat AI hanya memberi indikasi, bukan kepastian.",
          lanjutan:
            "Gunakan pendekatan OSINT: reverse image search, analisis metadata/provenance (EXIF, C2PA), geolokasi, serta analisis artefak (blending boundary, inkonsistensi pencahayaan, frekuensi spasial). Detektor memiliki false positive/negative sehingga perlu triangulasi.",
        },
        keyPoints: ["Cek sumber pertama", "Cek konteks waktu dan tempat", "Alat deteksi = indikasi, bukan bukti mutlak"],
      },
      {
        type: "example",
        title: "Contoh unggahan yang perlu diverifikasi",
        intro: "Klik bagian yang ditandai.",
        source: "Unggahan media sosial — data demo",
        altText: "Unggahan berisi foto tokoh publik dengan klaim mengejutkan, sumber anonim, dan ajakan menyebarkan.",
        segments: [
          { text: "BREAKING!! Foto tokoh X sedang menerima suap", flag: "Klaim sensasional tanpa rujukan media tepercaya." },
          { text: " — " },
          { text: "dikirim dari akun anonim", flag: "Sumber tidak jelas sehingga keasliannya tidak dapat ditelusuri." },
          { text: ". " },
          { text: "Sebarkan sebelum dihapus!", flag: "Desakan menyebarkan sebelum sempat diverifikasi." },
        ],
      },
      {
        type: "danger",
        title: "Mengapa manipulasi media berbahaya?",
        points: [
          { title: "Merusak reputasi", body: "Foto/video palsu dapat mencemarkan nama seseorang yang tidak bersalah." },
          { title: "Penipuan", body: "Suara/wajah tiruan dipakai untuk menipu keluarga atau meminta uang." },
          { title: "Kebingungan publik", body: "Masyarakat sulit membedakan fakta sehingga kepercayaan menurun." },
        ],
      },
      {
        type: "recognize",
        title: "Tanda yang perlu diperiksa",
        indicators: [
          { label: "Tepi wajah/rambut janggal", hint: "Batas wajah tampak blur atau berbayang." },
          { label: "Pencahayaan tidak konsisten", hint: "Arah bayangan berbeda antar objek." },
          { label: "Tekstur terlalu halus", hint: "Kulit tampak seperti plastik." },
          { label: "Detail kecil aneh", hint: "Jari, telinga, gigi, atau tulisan latar yang rusak." },
          { label: "Tidak ada sumber asli", hint: "Tidak ditemukan unggahan awal yang kredibel." },
        ],
      },
      {
        type: "action",
        title: "Langkah verifikasi",
        steps: [
          { title: "Reverse image search", body: "Cari gambar yang sama di mesin pencari untuk menemukan sumber awal." },
          { title: "Cek media tepercaya", body: "Bandingkan dengan pemberitaan media kredibel dan situs cek fakta." },
          { title: "Periksa dengan CekDeepfake", body: "Gunakan sebagai indikasi awal — bukan putusan akhir." },
          { title: "Jangan sebarkan dulu", body: "Jika ragu, jangan bagikan. Laporkan bila jelas menyesatkan." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Alat deteksi menunjukkan 'potensi manipulasi 78%'. Artinya…",
            options: [
              { id: "a", text: "Gambar pasti palsu" },
              { id: "b", text: "Ada indikasi manipulasi, perlu verifikasi lanjutan" },
              { id: "c", text: "Gambar pasti asli" },
            ],
            correctId: "b",
            explanation: "Skor keyakinan adalah indikasi. Tetap verifikasi sumber dan konteks sebelum menyimpulkan.",
          },
        ],
      },
    ],
  },
  {
    id: "l-deepfake-2",
    slug: "mengenal-deepfake",
    category: "deepfake",
    title: "Mengenal Deepfake dan Manipulasi Media",
    level: "pemula",
    durationMin: 5,
    description: "Pengenalan deepfake, cara dibuat, dan mengapa kita perlu lebih kritis terhadap media.",
    objectives: ["Pengertian deepfake", "Jenis manipulasi media", "Contoh penyalahgunaan", "Sikap kritis"],
    quizId: "quiz-deepfake",
    steps: [
      {
        type: "concept",
        title: "Apa itu deepfake?",
        body: {
          pemula: "Deepfake adalah foto, video, atau suara palsu yang dibuat dengan AI sehingga terlihat seperti asli.",
          menengah:
            "Deepfake dibuat dengan model AI yang mempelajari wajah atau suara seseorang, lalu menempelkannya ke media lain. Hasilnya bisa sangat meyakinkan.",
          lanjutan:
            "Deepfake dihasilkan model generatif (GAN, diffusion, voice cloning) untuk face-swap, lip-sync, atau sintesis penuh. Kualitas yang terus meningkat membuat deteksi visual manual makin sulit.",
        },
        keyPoints: ["Bisa berupa foto, video, atau suara", "Semakin sulit dikenali", "Butuh verifikasi, bukan sekadar 'kelihatan asli'"],
      },
      {
        type: "example",
        title: "Contoh penyalahgunaan suara tiruan",
        intro: "Klik bagian yang ditandai.",
        source: "Pesan suara (transkrip) — data demo",
        altText: "Transkrip pesan suara yang meniru suara anggota keluarga meminta transfer uang darurat.",
        segments: [
          { text: "“Ma, ini aku. HP-ku rusak, pakai nomor teman.", flag: "Alasan nomor baru agar korban tidak curiga." },
          { text: " " },
          { text: "Tolong transfer sekarang, darurat!", flag: "Desakan darurat agar korban tidak sempat memverifikasi." },
          { text: " " },
          { text: "Jangan bilang siapa-siapa ya.”", flag: "Meminta merahasiakan agar korban tidak bertanya ke orang lain." },
        ],
      },
      {
        type: "danger",
        title: "Risiko deepfake",
        points: [
          { title: "Penipuan keluarga", body: "Suara tiruan dipakai untuk meminta uang darurat." },
          { title: "Pelecehan", body: "Wajah seseorang ditempel ke konten tidak pantas tanpa izin." },
          { title: "Hoaks politik", body: "Video palsu tokoh publik menyebarkan informasi menyesatkan." },
        ],
      },
      {
        type: "recognize",
        title: "Tanda-tanda umum",
        indicators: [
          { label: "Gerak bibir tidak sinkron", hint: "Suara dan bibir tidak cocok." },
          { label: "Kedipan tidak wajar", hint: "Terlalu jarang atau aneh." },
          { label: "Suara datar/robotik", hint: "Intonasi kurang alami." },
          { label: "Permintaan mendesak", hint: "Konten mendorong tindakan cepat." },
        ],
      },
      {
        type: "action",
        title: "Yang harus dilakukan",
        steps: [
          { title: "Verifikasi langsung", body: "Telepon balik ke nomor yang sudah kamu kenal." },
          { title: "Buat kata sandi keluarga", body: "Sepakati kata rahasia untuk situasi darurat." },
          { title: "Laporkan konten", body: "Laporkan deepfake yang merugikan ke platform." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Kamu menerima pesan suara mirip kakakmu yang meminta transfer darurat dari nomor baru. Langkah pertama?",
            options: [
              { id: "a", text: "Langsung transfer" },
              { id: "b", text: "Telepon kakak melalui nomor lama yang dikenal" },
              { id: "c", text: "Membalas dengan data rekening" },
            ],
            correctId: "b",
            explanation: "Verifikasi melalui kanal yang sudah kamu kenal sebelum melakukan apa pun.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- SCAM */
  {
    id: "l-scam-1",
    slug: "modus-penipuan-online",
    category: "scam",
    title: "Mengenali Modus Penipuan Online",
    level: "pemula",
    durationMin: 6,
    description: "Kenali modus hadiah palsu, file APK, investasi bodong, dan cara menghindarinya.",
    objectives: ["Modus hadiah dan undian", "Bahaya file APK", "Investasi bodong", "Melapor penipuan"],
    quizId: "quiz-scam",
    steps: [
      {
        type: "concept",
        title: "Apa itu scam?",
        body: {
          pemula: "Scam adalah penipuan yang membuat korban menyerahkan uang atau data dengan janji palsu.",
          menengah:
            "Scam memanfaatkan emosi—senang karena hadiah, takut karena ancaman, atau serakah karena keuntungan—agar korban mengikuti instruksi pelaku.",
          lanjutan:
            "Scam adalah bentuk social engineering yang mengeksploitasi bias kognitif (scarcity, authority, reciprocity) melalui pretexting, advance-fee fraud, dan distribusi malware (APK sideloading).",
        },
        keyPoints: ["Bermain dengan emosi", "Janji terlalu bagus untuk jadi kenyataan", "Meminta uang atau data di muka"],
      },
      {
        type: "example",
        title: "Contoh pesan penipuan",
        intro: "Klik bagian yang ditandai.",
        source: "WhatsApp — data demo",
        altText: "Pesan yang mengumumkan pemenang undian, meminta biaya admin, dan mengirim file APK.",
        segments: [
          { text: "Selamat! Nomor Anda terpilih memenangkan undian Rp10.000.000.", flag: "Hadiah dari undian yang tidak pernah kamu ikuti." },
          { text: " " },
          { text: "Transfer biaya admin Rp250.000", flag: "Biaya di muka adalah ciri utama penipuan hadiah." },
          { text: " lalu " },
          { text: "instal Formulir_Hadiah.apk", flag: "File APK dapat mencuri SMS/OTP dan data perbankan." },
          { text: "." },
        ],
      },
      {
        type: "danger",
        title: "Risiko",
        points: [
          { title: "Kehilangan uang", body: "Biaya admin terus diminta dengan berbagai alasan." },
          { title: "Malware", body: "APK berbahaya dapat membaca SMS, termasuk kode OTP." },
          { title: "Data dijual", body: "Data pribadi dipakai untuk penipuan lain." },
        ],
      },
      {
        type: "recognize",
        title: "Ciri penipuan",
        indicators: [
          { label: "Hadiah tak terduga", hint: "Menang lomba yang tidak pernah diikuti." },
          { label: "Biaya di muka", hint: "Admin, pajak, ongkir untuk mencairkan hadiah." },
          { label: "File APK", hint: "Undangan, resi, atau foto paket berformat .apk." },
          { label: "Untung pasti", hint: "Investasi tanpa risiko dengan profit tetap." },
        ],
      },
      {
        type: "action",
        title: "Yang harus dilakukan",
        steps: [
          { title: "Jangan transfer", body: "Hadiah sungguhan tidak meminta biaya di muka." },
          { title: "Jangan instal APK dari pesan", body: "Unduh aplikasi hanya dari toko aplikasi resmi." },
          { title: "Cek rekening pelaku", body: "Periksa nomor rekening di layanan cek rekening resmi (cekrekening.id)." },
          { title: "Laporkan dan simpan bukti", body: "Simpan tangkapan layar dan laporkan ke platform serta pihak berwenang." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Kamu menerima file 'Resi_Paket.apk' dari kurir yang tidak dikenal. Apa yang sebaiknya dilakukan?",
            options: [
              { id: "a", text: "Membuka file untuk melihat resi" },
              { id: "b", text: "Tidak membuka, hapus, dan cek resi di aplikasi resmi kurir" },
              { id: "c", text: "Meneruskan ke teman untuk dicek" },
            ],
            correctId: "b",
            explanation: "Resi tidak pernah berbentuk APK. File tersebut kemungkinan malware.",
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------- CYBERBULLYING */
  {
    id: "l-cyberbullying-1",
    slug: "merespons-cyberbullying",
    category: "cyberbullying",
    title: "Merespons Cyberbullying dengan Aman",
    level: "pemula",
    durationMin: 5,
    description: "Mengenali bentuk perundungan digital dan langkah aman untuk korban maupun saksi.",
    objectives: ["Bentuk cyberbullying", "Dampak bagi korban", "Peran saksi (bystander)", "Melapor dan mencari dukungan"],
    quizId: "quiz-cyberbullying",
    steps: [
      {
        type: "concept",
        title: "Apa itu cyberbullying?",
        body: {
          pemula: "Cyberbullying adalah perundungan lewat internet, seperti menghina, mengancam, atau mengucilkan seseorang secara online.",
          menengah:
            "Cyberbullying adalah perilaku agresif yang berulang di ruang digital—komentar menghina, penyebaran foto tanpa izin, akun palsu, atau pengucilan dari grup.",
          lanjutan:
            "Cyberbullying mencakup harassment, denigration, impersonation, outing, exclusion, dan cyberstalking. Sifat digital (permanen, viral, anonim) memperbesar dampaknya dibanding perundungan luring.",
        },
        keyPoints: ["Bisa terjadi di chat, komentar, atau grup", "Dampaknya nyata bagi kesehatan mental", "Saksi punya peran penting"],
      },
      {
        type: "example",
        title: "Contoh di grup kelas",
        intro: "Klik bagian yang ditandai.",
        source: "Grup chat — data demo",
        altText: "Pesan grup yang menghina seorang siswa, mengajak mengeluarkan dari grup, dan mengancam menyebar foto.",
        segments: [
          { text: "Dia mah culun, nggak guna.", flag: "Hinaan yang merendahkan seseorang." },
          { text: " " },
          { text: "Keluarin aja dari grup!", flag: "Ajakan mengucilkan (exclusion)." },
          { text: " " },
          { text: "Kalau protes, aku sebar fotonya.", flag: "Ancaman menyebarkan foto tanpa izin." },
        ],
      },
      {
        type: "danger",
        title: "Dampaknya",
        points: [
          { title: "Kesehatan mental", body: "Cemas, sedih, menarik diri, hingga sulit belajar." },
          { title: "Jejak permanen", body: "Konten dapat tersebar dan sulit dihapus." },
          { title: "Lingkungan tidak aman", body: "Saksi yang diam membuat perundungan terus berlanjut." },
        ],
      },
      {
        type: "recognize",
        title: "Bentuk-bentuknya",
        indicators: [
          { label: "Hinaan berulang", hint: "Komentar merendahkan yang terus menerus." },
          { label: "Pengucilan", hint: "Sengaja dikeluarkan atau diabaikan di grup." },
          { label: "Ancaman", hint: "Mengancam menyebar foto atau data." },
          { label: "Akun palsu", hint: "Menyamar menjadi korban untuk mempermalukan." },
        ],
      },
      {
        type: "action",
        title: "Langkah aman",
        steps: [
          { title: "Jangan membalas dengan emosi", body: "Membalas dapat memperburuk situasi." },
          { title: "Simpan bukti", body: "Tangkapan layar lengkap dengan tanggal dan nama akun." },
          { title: "Blokir dan laporkan", body: "Gunakan fitur blokir dan laporkan di platform." },
          { title: "Ceritakan ke orang dewasa tepercaya", body: "Guru BK, wali kelas, atau orang tua dapat membantu." },
          { title: "Dukung korban", body: "Sebagai saksi, kirim pesan dukungan secara pribadi." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Temanmu dihina di grup kelas. Sebagai saksi, tindakan terbaik adalah…",
            options: [
              { id: "a", text: "Ikut tertawa agar tidak jadi sasaran" },
              { id: "b", text: "Mendukung korban, simpan bukti, dan laporkan ke guru" },
              { id: "c", text: "Diam saja karena bukan urusanmu" },
            ],
            correctId: "b",
            explanation: "Saksi yang bertindak dapat menghentikan perundungan dan membantu korban merasa tidak sendirian.",
          },
        ],
      },
    ],
  },

  /* --------------------------------------------------- MISINFORMATION */
  {
    id: "l-misinformation-1",
    slug: "cek-fakta-sebelum-berbagi",
    category: "misinformation",
    title: "Cek Fakta Sebelum Berbagi",
    level: "pemula",
    durationMin: 5,
    description: "Langkah sederhana memeriksa kebenaran informasi sebelum menyebarkannya.",
    objectives: ["Jenis informasi keliru", "Ciri pesan hoaks", "Teknik cek fakta", "Berbagi secara bertanggung jawab"],
    quizId: "quiz-misinformation",
    steps: [
      {
        type: "concept",
        title: "Misinformasi dan disinformasi",
        body: {
          pemula: "Misinformasi adalah informasi yang salah. Kadang orang membagikannya tanpa sadar karena belum mengecek kebenarannya.",
          menengah:
            "Misinformasi adalah informasi keliru yang disebarkan tanpa niat jahat, sedangkan disinformasi sengaja dibuat untuk menyesatkan.",
          lanjutan:
            "Gangguan informasi meliputi misinformasi, disinformasi, dan malinformasi. Penyebarannya diperkuat algoritme engagement, echo chamber, dan bias konfirmasi.",
        },
        keyPoints: ["Tidak semua yang viral itu benar", "Cek sumber sebelum berbagi", "Judul sensasional perlu diwaspadai"],
      },
      {
        type: "example",
        title: "Contoh pesan berantai",
        intro: "Klik bagian yang ditandai.",
        source: "Pesan berantai — data demo",
        altText: "Pesan berantai yang mengklaim obat ampuh 100%, mengutip sumber tidak jelas, dan meminta disebarkan.",
        segments: [
          { text: "Air rebusan daun X dijamin 100% menyembuhkan flu dalam 1 jam!", flag: "Klaim mutlak tanpa bukti ilmiah." },
          { text: " " },
          { text: "Info dari grup sebelah.", flag: "Sumber tidak jelas dan tidak dapat diverifikasi." },
          { text: " " },
          { text: "Sebarkan ke 10 grup!", flag: "Desakan menyebarkan adalah ciri pesan berantai." },
        ],
      },
      {
        type: "danger",
        title: "Mengapa berbahaya?",
        points: [
          { title: "Membahayakan kesehatan", body: "Saran kesehatan palsu dapat membuat orang menunda pengobatan." },
          { title: "Memicu kepanikan", body: "Informasi keliru tentang bencana atau keamanan menimbulkan kepanikan." },
          { title: "Merusak kepercayaan", body: "Orang menjadi sulit membedakan informasi benar dan salah." },
        ],
      },
      {
        type: "recognize",
        title: "Ciri informasi yang perlu dicek",
        indicators: [
          { label: "Judul sensasional", hint: "Huruf kapital, tanda seru berlebihan." },
          { label: "Klaim mutlak", hint: "“dijamin 100%”, “pasti”." },
          { label: "Sumber kabur", hint: "“katanya”, “info dari grup sebelah”." },
          { label: "Desakan menyebar", hint: "“sebarkan sebelum dihapus”." },
        ],
      },
      {
        type: "action",
        title: "Langkah cek fakta",
        steps: [
          { title: "Baca lebih dari judul", body: "Isi berita sering berbeda dari judulnya." },
          { title: "Cek sumber asli", body: "Cari di media kredibel atau situs resmi lembaga terkait." },
          { title: "Gunakan situs cek fakta", body: "Periksa apakah klaim sudah pernah dibantah." },
          { title: "Tidak yakin? Jangan sebar", body: "Berhenti di kamu adalah tindakan bertanggung jawab." },
        ],
      },
      {
        type: "quiz",
        title: "Mini Quiz",
        questions: [
          {
            prompt: "Pesan berantai mengklaim obat 'dijamin 100%' dan meminta disebar. Sikap terbaik?",
            options: [
              { id: "a", text: "Langsung sebar agar orang lain tahu" },
              { id: "b", text: "Cek di sumber kredibel, jangan sebar jika belum terverifikasi" },
              { id: "c", text: "Percaya karena banyak yang membagikan" },
            ],
            correctId: "b",
            explanation: "Banyaknya yang membagikan bukan bukti kebenaran. Verifikasi dulu sebelum berbagi.",
          },
        ],
      },
    ],
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
