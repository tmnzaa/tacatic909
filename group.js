async function aturJadwalSholat(sock, from) {
  try {
    const res = await fetch("https://api.myquran.com/v1/sholat/jadwal/semua/jakarta/today");
    const data = await res.json();

    if (!data?.data?.jadwal) return console.log("❌ Gagal ambil jadwal sholat");

    const jadwal = data.data.jadwal;
    const waktuSholat = {
      Subuh: jadwal.subuh,
      Dzuhur: jadwal.dzuhur,
      Ashar: jadwal.ashar,
      Maghrib: jadwal.maghrib,
      Isya: jadwal.isya
    };

    for (const [nama, waktu] of Object.entries(waktuSholat)) {
      const [jam, menit] = waktu.split(":").map(Number);
      const id = `sholat-${from}-${nama}`;

      if (schedule.scheduledJobs[id]) schedule.cancelJob(id);

      schedule.scheduleJob(id, { hour: jam, minute: menit, tz: "Asia/Jakarta" }, async () => {
        const target = global.sholatNotified[from];
        if (!target) return;

        await sock.sendMessage(from, {
          text: `🕌 *Waktu Sholat ${nama} telah tiba!*\n\n@${target.split("@")[0]}, yuk tunaikan kewajiban kita 🤲\n\nSemoga harimu diberkahi oleh Allah SWT.`,
          mentions: [target]
        });

        delete global.sholatNotified[from];
      });
    }

    console.log(`✅ Jadwal sholat untuk ${from} berhasil disetel.`);
  } catch (err) {
    console.error("❌ Gagal set jadwal sholat:", err.message);
  }
}

module.exports = async ({
  sock, msg, from, sender, body, command, arg,
  isOwner, isAdmin, isBotAdmin, fitur, simpanFitur
}) => {
  const mtype = Object.keys(msg.message)[0];
  const teks = body.toLowerCase();
  const onlyAdmin = isOwner || isAdmin;
  const schedule = require("node-schedule");

  if (!global.adminPerintah) global.adminPerintah = {};
const fetch = require("node-fetch");
if (!global.sholatNotified) global.sholatNotified = {};

  if (!fitur[from]) fitur[from] = { aktif: false };

  // ✅ Aktifkan Bot
  if ([".on3k", ".on5k", ".on7k"].includes(command)) {
  if (!isOwner) return sock.sendMessage(from, { text: "❌ Hanya Owner yang bisa mengaktifkan bot." });
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot belum jadi admin di grup ini!" });

  // Cek apakah sudah aktif dan belum expired
  if (fitur[from].aktif && fitur[from].expired && fitur[from].expired > Date.now()) {
    const kadaluarsa = new Date(fitur[from].expired).toLocaleString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    return sock.sendMessage(from, {
      text: `⚠️ Bot sudah aktif di grup ini.\n⏳ Masa aktif masih sampai: *${kadaluarsa}*.\n\nJika ingin mengubah masa aktif, tunggu hingga masa aktif habis.`
    });
  }

  fitur[from].aktif = true;

const now = new Date();
const expiredDate = new Date(now);
if (command === ".on3k") expiredDate.setDate(now.getDate() + 7);
if (command === ".on5k") expiredDate.setDate(now.getDate() + 30);
if (command === ".on7k") expiredDate.setDate(now.getDate() + 60);

fitur[from].expired = expiredDate.getTime();

// Ambil nama grup
const metadata = await sock.groupMetadata(from);
fitur[from].nama_grup = metadata.subject;

// Format tanggal kadaluarsa yang mudah dibaca
const tanggalKadaluarsa = expiredDate.toLocaleString("id-ID", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
  hour: "2-digit", minute: "2-digit"
});
fitur[from].kadaluarsa = tanggalKadaluarsa;

simpanFitur();

  await aturJadwalSholat(sock, from); // <== taruh DI SINI sebelum return sock.sendMessage

  sock.sendMessage(from, {
  text: `✅ *TACATIC* aktif!\n\n📌 Grup ID: ${from}\n⏳ Masa Aktif sampai: *${tanggalKadaluarsa}*`
});

    function toggleFitur(nama, arg) {
  const aktif = fitur[from][nama] === true;
  const nonaktif = fitur[from][nama] === false;

  if (arg === "on" && aktif) {
    return `⚠️ Fitur *${nama}* sudah *aktif*.`;
  }
  if (arg === "off" && nonaktif) {
    return `⚠️ Fitur *${nama}* sudah *nonaktif*.`;
  }

  fitur[from][nama] = arg === "on";
  simpanFitur();
  return `✅ Fitur *${nama}* berhasil di-*${arg === "on" ? "aktifkan" : "nonaktifkan"}*.`;
}

    switch (command) {
      case ".antilink1":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });

  if (arg === "on" && fitur[from].antilink1 === true)
    return sock.sendMessage(from, { text: "⚠️ *antilink1* sudah aktif." });
  if (arg === "off" && fitur[from].antilink1 === false)
    return sock.sendMessage(from, { text: "⚠️ *antilink1* sudah nonaktif." });

  fitur[from].antilink1 = arg === "on";
  if (arg === "on") fitur[from].antilink2 = false;
  simpanFitur();

  return sock.sendMessage(from, {
    text: `✅ *antilink1* di-*${arg}*kan.${arg === "on" ? "\n❌ *antilink2* dimatikan otomatis." : ""}`
  });

case ".antilink2":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });

  if (arg === "on" && fitur[from].antilink2 === true)
    return sock.sendMessage(from, { text: "⚠️ *antilink2* sudah aktif." });
  if (arg === "off" && fitur[from].antilink2 === false)
    return sock.sendMessage(from, { text: "⚠️ *antilink2* sudah nonaktif." });

  fitur[from].antilink2 = arg === "on";
  if (arg === "on") fitur[from].antilink1 = false;
  simpanFitur();

  return sock.sendMessage(from, {
    text: `✅ *antilink2* di-*${arg}*kan.${arg === "on" ? "\n❌ *antilink1* dimatikan otomatis." : ""}`
  });

      case ".antipromosi":
case ".antibokep":
case ".welcome":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });
  const fiturNama = command.slice(1);
  const hasil = toggleFitur(fiturNama, arg);
  return sock.sendMessage(from, { text: hasil });

      case ".open":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });

 if (arg && /^(\d{1,2}[:.]\d{2})$/.test(arg)) {
   const [jam, menit] = arg.replace(".", ":").split(":").map(Number);
    const jobId = `open-${from}`;

    if (fitur[from].jadwalOpen) schedule.cancelJob(fitur[from].jadwalOpen);

    fitur[from].jadwalOpen = jobId;
    schedule.scheduleJob(jobId, { hour: jam, minute: menit, tz: "Asia/Jakarta" }, async () => {
      await sock.groupSettingUpdate(from, "not_announcement");
      await sock.sendMessage(from, { text: "✅ Grup dibuka otomatis sesuai jadwal." });
    });

    simpanFitur();
    return sock.sendMessage(from, {
      text: `🕒 Grup akan otomatis *dibuka* jam *${arg} WIB*.`
    });
  }

  await sock.groupSettingUpdate(from, "not_announcement");
  return sock.sendMessage(from, { text: "✅ Grup dibuka sekarang." });

      case ".close":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });

if (arg && /^(\d{1,2}[:.]\d{2})$/.test(arg)) {
   const [jam, menit] = arg.replace(".", ":").split(":").map(Number);
    const jobId = `close-${from}`;

    if (fitur[from].jadwalClose) schedule.cancelJob(fitur[from].jadwalClose);

    fitur[from].jadwalClose = jobId;
    schedule.scheduleJob(jobId, { hour: jam, minute: menit, tz: "Asia/Jakarta" }, async () => {
      await sock.groupSettingUpdate(from, "announcement");
      await sock.sendMessage(from, { text: "🔒 Grup ditutup otomatis sesuai jadwal." });
    });

    simpanFitur();
    return sock.sendMessage(from, {
      text: `🕒 Grup akan otomatis *ditutup* jam *${arg} WIB*.`
    });
  }

  await sock.groupSettingUpdate(from, "announcement");
  return sock.sendMessage(from, { text: "✅ Grup ditutup sekarang." });

      case ".tagall":
        if (!isBotAdmin) return;
        const teksTag = body.slice(7).trim();
        return sock.sendMessage(from, { text: teksTag.length > 0 ? teksTag : "" });

      case ".kick":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });

  let kickTarget = null;

  // Ambil ID dari pesan yang direply
  if (msg.quoted?.participant) {
    kickTarget = msg.quoted.participant;
  } else if (msg.quoted?.key?.participant) {
    kickTarget = msg.quoted.key.participant;
  } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    kickTarget = msg.message.extendedTextMessage.contextInfo.participant;
  }

  // Kalau tidak reply, ambil dari tag
  if (!kickTarget && msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    kickTarget = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }

  // Kalau tetap tidak ketemu
  if (!kickTarget) {
    return sock.sendMessage(from, {
      text: "❌ Tag atau reply pesan member yang ingin dikick."
    });
  }

  // Cegah kick owner grup
  if (kickTarget === from.split("-")[0] + "@s.whatsapp.net") {
    return sock.sendMessage(from, { text: "❌ Tidak bisa kick owner grup." });
  }

  try {
    // ✅ Simpan admin penyuruh untuk log
    global.adminPerintah[`${from}_${kickTarget}`] = sender;

    await sock.groupParticipantsUpdate(from, [kickTarget], "remove");
    return sock.sendMessage(from, {
      text: `👢 @${kickTarget.split("@")[0]} telah dikeluarkan.`,
      mentions: [kickTarget]
    });
  } catch (err) {
    return sock.sendMessage(from, { text: "❌ Gagal kick member. Pastikan bot admin & user bukan admin." });
  }

case ".promote":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });
  const promoteMention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!promoteMention) return sock.sendMessage(from, { text: "❌ Tag member yang ingin dipromosikan." });

  // ✅ Simpan siapa yang menyuruh
  const promoteKey = `${from}_${promoteMention}`;
  if (!global.adminPerintah) global.adminPerintah = {};
  global.adminPerintah[promoteKey] = {
    penyuruh: sender,
    waktu: Date.now()
  };

  await sock.groupParticipantsUpdate(from, [promoteMention], "promote");
  return sock.sendMessage(from, {
    text: `✅ @${promoteMention.split("@")[0]} berhasil di-*promote*.`,
    mentions: [promoteMention]
  });

case ".demote":
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot bukan admin." });
  
  const demoteTarget = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!demoteTarget) return sock.sendMessage(from, { text: "❌ Gunakan tag untuk demote." });

  // ✅ Cek apakah target adalah pembuat grup
  const groupInfo = await sock.groupMetadata(from);
  const groupOwner = groupInfo.owner || groupInfo.participants.find(p => p.admin === "superadmin")?.id;

  if (demoteTarget === groupOwner) {
    return sock.sendMessage(from, { text: "❌ Tidak bisa *demote* pembuat grup." });
  }

  // ✅ Simpan siapa yang menyuruh
  const demoteKey = `${from}_${demoteTarget}`;
  if (!global.adminPerintah) global.adminPerintah = {};
  global.adminPerintah[demoteKey] = {
    penyuruh: sender,
    waktu: Date.now()
  };

  try {
    await sock.groupParticipantsUpdate(from, [demoteTarget], "demote");
    return sock.sendMessage(from, {
      text: `✅ @${demoteTarget.split("@")[0]} berhasil di-*demote*.`,
      mentions: [demoteTarget]
    });
  } catch (err) {
    return sock.sendMessage(from, {
      text: "❌ Gagal demote."
    });
  }

  case ".tanya":
  const pertanyaan = body.slice(7).trim();
  if (!pertanyaan) return sock.sendMessage(from, { text: "❓ Ketik pertanyaannya setelah .tanya" });

  try {
    const res = await fetch(`https://api.yomgpt.site/tanya?q=${encodeURIComponent(pertanyaan)}`);
    const data = await res.json();

    if (!data.jawaban) {
      return sock.sendMessage(from, { text: "⚠️ Maaf, tidak bisa menjawab saat ini." });
    }

    return sock.sendMessage(from, { text: `🤖 Jawaban:\n${data.jawaban}` });
  } catch (e) {
    return sock.sendMessage(from, { text: "❌ Gagal konek ke server AI." });
  }

      case ".infogrup":
        const info = await sock.groupMetadata(from);
        const owner = info.owner || info.participants.find(p => p.admin === "superadmin")?.id;
        const adminCount = info.participants.filter(p => p.admin).length;
        return sock.sendMessage(from, {
          text: `📣 *Info Grup*\n\n👥 Nama: ${info.subject}\n📝 Deskripsi: ${info.desc || "-"}\n👑 Owner: @${(owner || "").split("@")[0]}\n🧑‍💼 Admin: ${adminCount}\n👤 Member: ${info.participants.length}`,
          mentions: [owner]
        });

      case ".menu":
        return sock.sendMessage(from, {
          text: `📋 *Menu TACATIC*\n\n• .antilink1 on/off\n• .antilink2 on/off\n• .antipromosi on/off\n• .antibokep on/off\n• .welcome on/off\n• .tagall [teks]\n• .kick (reply/tag)\n• .promote (tag)\n• .demote (reply/tag)\n• .open / .close\n• .infogrup`
        });
    }
  }

 // 🛡️ Proteksi Otomatis
if (!fitur[from].aktif) return;

try {
  // ANTI LINK 1 - hapus link
  if (fitur[from]?.antilink1 && /chat\.whatsapp\.com/.test(teks)) {
    await sock.sendMessage(from, { delete: msg.key });
    await sock.sendMessage(from, { text: "🔗 Link grup WA dihapus!" });
  }

  // ANTI LINK 2 - kick link
  if (fitur[from]?.antilink2 && /chat\.whatsapp\.com/.test(teks)) {
    await sock.sendMessage(from, { delete: msg.key });
    await sock.sendMessage(from, { text: "🚫 Link grup WA terdeteksi. Pengguna dikeluarkan!" });
    await sock.groupParticipantsUpdate(from, [sender], "remove");
  }

  // ANTI PROMOSI - deteksi jualan, uncheck fitur, hapus pesan
 // ANTI PROMOSI - deteksi promosi
if (fitur[from]?.antipromosi && /(unchek|akun unchek)/i.test(teks)) {
  await sock.sendMessage(from, { delete: msg.key });
  await sock.sendMessage(from, {
    text: "📢 Promosi terdeteksi dan pesan dihapus!",
  });
}

  // ANTI BOKEP - deteksi konten vulgar dan jual akun bokep
  if (fitur[from]?.antibokep && /(bokep|18\+|sange)/i.test(teks)) {
    await sock.sendMessage(from, { delete: msg.key });
    await sock.sendMessage(from, {
      text: "🔞 Konten atau jualan tidak pantas terdeteksi! Pengguna dikeluarkan!",
    });
    await sock.groupParticipantsUpdate(from, [sender], "remove");
  }

} catch (err) {
  console.error("❗ Proteksi error:", err);
}

// ====== ANTI SPAM PESAN SAMA (5x) ======
if (!global.antiSpamPesan) global.antiSpamPesan = {};
if (!global.antiSpamPesan[from]) global.antiSpamPesan[from] = {};

const now = Date.now();
const userSpam = global.antiSpamPesan[from][sender] || {
  lastMsg: teks,
  count: 1,
  warn: 0,
  lastTime: now
};

if (userSpam.lastMsg === teks) {
  userSpam.count++;
} else {
  userSpam.lastMsg = teks;
  userSpam.count = 1;
  userSpam.warn = 0;
}
userSpam.lastTime = now;
global.antiSpamPesan[from][sender] = userSpam;

// Reset otomatis kalau sudah lebih dari 2 menit
if (now - userSpam.lastTime > 120000) {
  delete global.antiSpamPesan[from][sender];
}

// Kirim peringatan atau kick
if (userSpam.count === 5 && userSpam.warn === 0) {
  userSpam.warn = 1;
  await sock.sendMessage(from, {
    text: `⚠️ @${sender.split("@")[0]} jangan spam yang sama ya! Ini peringatan *pertama*.`,
    mentions: [sender]
  });
}
if (userSpam.count === 10 && userSpam.warn === 1) {
  userSpam.warn = 2;
  await sock.sendMessage(from, {
    text: `⚠️⚠️ @${sender.split("@")[0]} masih spam! Ini peringatan *kedua*!`,
    mentions: [sender]
  });
}
if (userSpam.count >= 15 && userSpam.warn === 2) {
  delete global.antiSpamPesan[from][sender];
  await sock.sendMessage(from, {
    text: `👢 @${sender.split("@")[0]} telah dikeluarkan karena spam *berulang*!`,
    mentions: [sender]
  });
  await sock.groupParticipantsUpdate(from, [sender], "remove");
}

if (!global.floodDetector) global.floodDetector = {};
if (!global.floodDetector[from]) global.floodDetector[from] = {};

const fNow = Date.now();
const floodUser = global.floodDetector[from][sender] || {
  lastTime: fNow,
  msgCount: 1
};

if (fNow - floodUser.lastTime < 3000) {
  floodUser.msgCount++;
  if (floodUser.msgCount >= 5) {
    await sock.sendMessage(from, {
      text: `🚫 @${sender.split("@")[0]} terlalu banyak kirim pesan!`,
      mentions: [sender]
    });
    await sock.groupParticipantsUpdate(from, [sender], "remove");
    delete global.floodDetector[from][sender];
    return;
  }
} else {
  floodUser.msgCount = 1;
}

floodUser.lastTime = fNow;
global.floodDetector[from][sender] = floodUser;

// ✅ Cek dan simpan siapa yang terakhir kirim pesan saat waktu sholat
const waktuSekarang = new Date();
const jamMenit = waktuSekarang.toTimeString().slice(0, 5);

// Misalnya waktu sholat default
const daftarJamSholat = ["04:30", "12:00", "15:30", "18:00", "19:00"];

if (daftarJamSholat.includes(jamMenit) && msg && msg.message && !msg.key.fromMe && from.endsWith("@g.us")) {
  if (!global.sholatNotified[from]) {
    global.sholatNotified[from] = sender;
    console.log(`🕌 Pengguna ${sender} dicatat untuk reminder sholat grup ${from}`);
  }
}


};
