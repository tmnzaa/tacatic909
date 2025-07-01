const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const pino = require("pino");
const path = require("path");
const qrcode = require("qrcode-terminal"); // 🟢 Tambahkan untuk tampilkan QR

const logGroupEvent = require("./logGroup"); // opsional jika digunakan
const groupHandler = require("./group");
const privateHandler = require("./private");

const OWNER = ["6282333014459"]; // Ganti dengan nomor owner

const fiturPath = "./fitur.json";
const fitur = fs.existsSync(fiturPath) ? JSON.parse(fs.readFileSync(fiturPath)) : {};
const simpanFitur = () => fs.writeFileSync(fiturPath, JSON.stringify(fitur, null, 2));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "info" }), // ⬅️ Ganti dari 'silent' agar QR muncul
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  // ✅ Welcome / Leave
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    if (!fitur[id]?.welcome) return;
    const user = participants[0];
    const name = user.split("@")[0];
    if (action === "add") {
      await sock.sendMessage(id, { text: `👋 Selamat datang @${name}!`, mentions: [user] });
    } else if (action === "remove") {
      await sock.sendMessage(id, { text: `👋 Selamat tinggal @${name}!`, mentions: [user] });
    }
  });

  // ✅ Update nama grup otomatis
  sock.ev.on("groups.update", async updates => {
    for (const update of updates) {
      const id = update.id;
      if (!fitur[id]) continue;
      if (update.subject) {
        fitur[id].nama_grup = update.subject;
        simpanFitur();
      }
    }
  });

  // ✅ Handle pesan masuk
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const command = body.split(" ")[0].toLowerCase();
    const arg = body.split(" ")[1]?.toLowerCase() || "";
    const isOwner = OWNER.includes(sender.split("@")[0]);

    if (isGroup) {
      const metadata = await sock.groupMetadata(from);
      const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const admins = metadata.participants.filter(p => p.admin);
      const isAdmin = admins.some(p => p.id === sender);
      const isBotAdmin = admins.some(p => p.id === botNumber);

      await groupHandler({
        sock, msg, from, sender, body, command, arg,
        isOwner, isAdmin, isBotAdmin, fitur, simpanFitur
      });
    } else {
      await privateHandler({ sock, msg, from, sender, body, command });
    }
  });

  // ✅ Koneksi dan QR
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrcode.generate(qr, { small: true }); // 🟢 Tampilkan QR ke Termux
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔁 Reconnecting...");
        startBot();
      } else {
        console.log("❌ BOT logged out");
      }
    }

    if (connection === "open") {
      console.log("✅ Bot Udah Aktif Sayang....");
    }
  });
}

startBot();
