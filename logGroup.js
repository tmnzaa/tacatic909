const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "logs", "group-log.txt");

if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

function appendLog(text) {
  const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  fs.appendFileSync(logFile, `[${timestamp}] ${text}\n${"-".repeat(60)}\n`);
}

const penting = new Map(); // Simpan log penting berdasarkan msgKey

module.exports = function logGroupEvent(sock) {
 sock.ev.on("group-participants.update", async data => {
  const { id: groupJid, participants, action, author } = data;

  try {
    const semuaGrup = await sock.groupFetchAllParticipating();
    if (!semuaGrup[groupJid]) {
      console.log(`🚫 Bot bukan anggota grup ${groupJid}, lewati logging`);
      return;
    }

    const meta = semuaGrup[groupJid];
    const groupName = meta.subject;
    const botNumber = sock.user.id;
    const adminName = getDisplayName(meta, botNumber);
    const penyuruh = global.adminPerintah?.[`${groupJid}_${participants[0]}`];

    for (const target of participants) {
      const targetName = getDisplayName(meta, target);

      let aksi = "";
      if (action === "add") aksi = `➕ Menambahkan`;
      if (action === "remove") aksi = `➖ Mengeluarkan`;
      if (action === "promote") aksi = `🆙 Mempromosikan`;
      if (action === "demote") aksi = `🔽 Mendemosi`;

      const penyuruhText = penyuruh && typeof penyuruh === "string"
        ? penyuruh.split("@")[0]
        : (penyuruh?.penyuruh || penyuruh)?.split?.("@")[0] || "Tidak diketahui";

      const logText =
        `👥 Grup: *${groupName}*\n` +
        `👑 Bot: ${adminName}\n` +
        `🧠 Disuruh oleh: ${penyuruhText}\n` +
        `🎯 Target: ${targetName}\n` +
        `⚙️ Aksi: ${aksi}`;

      appendLog(logText);

      const msgKey = `${groupJid}_${target}`;
      penting.set(msgKey, {
        groupJid,
        groupName,
        adminName,
        penyuruhText,
        targetName,
        aksi,
        waktu: Date.now()
      });
    }
  } catch (e) {
    console.error("❌ Gagal log event grup:", e);
  }
  });

  // Log penghapusan pesan penting
  sock.ev.on("messages.update", async updates => {
    for (const update of updates) {
      if (update.message !== null) continue;

      const jid = update.key?.remoteJid;
      const penghapus = update.key?.participant;
      const id = update.key?.id;

      if (!jid?.endsWith("@g.us") || !penghapus || !id) continue;

      const meta = await sock.groupMetadata(jid).catch(() => null);
      if (!meta) continue;

      const penghapusNama = getDisplayName(meta, penghapus);

      // Cek data log penting
      for (const [msgKey, val] of penting.entries()) {
        if (msgKey.startsWith(jid)) {
          const logText =
            `🗑️ [${val.groupName}]\n` +
            `⚙️ Aksi: ${val.aksi}\n` +
            `👑 Bot: ${val.adminName}\n` +
            `🧠 Disuruh oleh: ${val.penyuruhText}\n` +
            `🎯 Target: ${val.targetName}\n` +
            `❌ Pesan DIHAPUS oleh: ${penghapusNama}`;
          appendLog(logText);
        }
      }
    }
  });
};

// Ambil nama dari metadata
function getDisplayName(meta, jid) {
  const user = meta.participants.find(p => p.id === jid);
  return user?.name || user?.notify || jid.split("@")[0];
}
