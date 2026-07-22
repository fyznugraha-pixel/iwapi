const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const smtpConfig = {
  host: 'mail.tactlink.com',
  port: 587, // Menggunakan port 587
  secure: false, // port 587 wajib secure: false
  auth: {
    user: 'fayiz.nugraha@tactlink.com',
    pass: 'fayiz.nugraha123',
  },
};

// 2. MEMBACA DAFTAR PENERIMA DARI CSV
// Format CSV yang diharapkan: NamaLengkap;Email;TicketID
// Contoh: Fayiz Nugraha;fyznugraha@gmail.com;TKT-123456
const csvFilePath = path.join(__dirname, 'email.csv');
let recipients = [];

try {
  const csvData = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvData.split(/\r?\n/);
  
  // Lewati baris pertama jika itu adalah header (opsional)
  let startIndex = 0;
  if (lines[0] && lines[0].toLowerCase().includes('email')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Asumsi format: NamaLengkap;Email;TicketID
    const [fullName, email, ticketId] = line.split(';');
    
    if (email && fullName && ticketId) {
      recipients.push({ 
        email: email.trim(), 
        fullName: fullName.trim(),
        ticketId: ticketId.trim()
      });
    } else if (email && fullName) {
      console.warn(`⚠️ Peringatan: Baris ke-${i+1} tidak memiliki Ticket ID. Pastikan formatnya NamaLengkap;Email;TicketID`);
    }
  }
} catch (error) {
  console.error('❌ Gagal membaca file email.csv. Pastikan filenya ada di folder yang sama.');
  process.exit(1);
}

async function sendBlastEmails() {
  const transporter = nodemailer.createTransport(smtpConfig);

  console.log(`🚀 Memulai pengiriman email E-Ticket ke ${recipients.length} alamat...`);
  console.log(`⏱️  Estimasi waktu: Script ini menggunakan jeda 13 detik per email agar aman dari blokir Spam server Anda.`);
  console.log(`Silakan biarkan terminal ini terbuka sampai selesai.\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const participant = recipients[i];
    const email = participant.email;
    
    try {
      if (i > 0) {
        // Jeda 13 detik antar email
        await new Promise(resolve => setTimeout(resolve, 13000));
      }

      // Generate QR Code menjadi buffer gambar (tanpa internet)
      const qrBuffer = await QRCode.toBuffer(participant.ticketId, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      const htmlFilePath = path.join(__dirname, 'tactlink-reminder.html');
      const baseHtml = fs.readFileSync(htmlFilePath, 'utf-8');

      const personalizedHtml = baseHtml
        .replace(/{{FULL_NAME}}/g, participant.fullName)
        .replace(/{{TICKET_ID}}/g, participant.ticketId);

      const info = await transporter.sendMail({
        from: '"Event Tiktok Social Commerce" <fayiz.nugraha@tactlink.com>',
        replyTo: 'fayiz.nugraha@tactlink.com',
        to: email,
        subject: `E-Ticket Registrasi: ${participant.ticketId} - TikTok Social Commerce`,
        html: personalizedHtml,
        attachments: [
          {
            filename: 'qrcode.png',
            content: qrBuffer,
            cid: 'qrcode_ticket' 
          }
        ]
      });

      console.log(`[${i + 1}/${recipients.length}] ✅ Terkirim ke: ${email} (Tiket: ${participant.ticketId})`);
      successCount++;
    } catch (error) {
      console.error(`[${i + 1}/${recipients.length}] ❌ Gagal ke: ${email}. Error:`, error.message);
      failCount++;
    }
  }

  console.log('\n==========================================');
  console.log(`✨ BLAST EMAIL SELESAI!`);
  console.log(`Berhasil: ${successCount} | Gagal: ${failCount}`);
  console.log('==========================================\n');
}

sendBlastEmails();
