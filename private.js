module.exports = async ({ sock, msg, from, sender, body, command }) => {
  const teks = body.toLowerCase();
  const prefix = ".";
  const ownerNumber = "6282333014459@s.whatsapp.net"; // Ganti jika nomor owner beda

  // ======== 🙋 SAPAAN OTOMATIS ========
  if (/^(h(i|alo+)|assalamualaikum|p|bot|.menu|menu|#)$/i.test(teks)) {
    return await sock.sendMessage(from, {
      text: `Hai\nSaya *BOT TACATIC*\n\nKetik *.fitur* untuk lihat fitur bot.\n*.caraaktifkan* Khusus Owner!!`
    });
  }

  // ======== 👑 INFO OWNER ========
  if (command === `${prefix}owner`) {
    return await sock.sendMessage(from, {
      text: `👑 *Owner BOT TACATIC*\n\n📱 WhatsApp: wa.me/6282333014459\n📍 Lokasi: Indonesia\n🛠️ Status: Aktif`
    });
  }

  // ======== 💸 INFO SEWA BOT ========
  if (command === `${prefix}sewa`) {
    return await sock.sendMessage(from, {
      text: `💸 *Harga Sewa BOT TACATIC*\n\n✅ Fitur lengkap\n✅ Fast respon\n✅ Support penuh\n\n📆 *Harga:*\n• 1 Minggu : Rp3.000\n• 1 Bulan  : Rp5.000\n• 2 Bulan  : Rp7.000\n\n📞 Hubungi Owner: wa.me/6282333014459`
    });
  }

  // ======== 📖 FITUR LENGKAP ========
  if (command === `${prefix}fitur`) {
    return await sock.sendMessage(from, {
      text: `📖 *Daftar Fitur Lengkap BOT TACATIC:*\n
👥 *Fitur Grup:*
• .antilink1 - Hapus link WA
• .antilink2 - Hapus & kick jika kirim link WA
• .antipromosi - Deteksi jualan (akun, endorse, dll)
• .antibokep - Kick otomatis jika deteksi kata bokep/18+
• .welcome - Pesan selamat datang
• .tagall - Mention semua member
• .kick - Kick dengan reply atau tag
• .promote - Jadikan admin (tag)
• .demote - Turunkan admin (tag)
• .open - Buka grup (manual/jadwal)
• .close - Tutup grup (manual/jadwal)
• .infogrup - Info lengkap grup

*Tertarik sewa bot?*
Ketik *.sewa* untuk info harga lengkap.`
    });
  }

  // ======== 🔧 CARA AKTIFKAN BOT (KHUSUS OWNER) ========
  if (command === `${prefix}caraaktifkan`) {
    if (from.endsWith("@g.us")) return; // Jangan respon dari grup
    if (sender !== ownerNumber) {
      return await sock.sendMessage(from, {
        text: "❌ Perintah ini hanya bisa digunakan oleh *Owner Bot*."
      });
    }

    return await sock.sendMessage(from, {
      text: `🔧 *Cara Mengaktifkan Bot TACATIC di Grup:*\n\n1️⃣ Tambahkan bot ke grup kamu\n2️⃣ Jadikan bot sebagai *admin grup*\n3️⃣ Kirim salah satu perintah ini di grup:\n• .on3k → Aktif 7 hari\n• .on5k → Aktif 30 hari\n• .on7k → Aktif 60 hari\n\nSetelah aktif, ketik *.menu* untuk melihat fitur bot.`
    });
  }

  // ===== Tambahkan command tambahan di bawah sini jika perlu =====
};
