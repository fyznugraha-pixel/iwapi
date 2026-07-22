import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, fullName, ticketId } = await request.json();

    if (!email || !fullName || !ticketId) {
      return NextResponse.json(
        { error: 'Missing required fields (email, fullName, ticketId)' },
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter with Tactlink SMTP
    const transporter = nodemailer.createTransport({
      host: 'mail.tactlink.com',
      port: 465,
      secure: true,
      auth: {
        user: 'fayiz.nugraha@tactlink.com',
        pass: 'fayiz.nugraha123',
      },
    });

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${ticketId}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0ea5e9;">Pendaftaran Berhasil</h2>
        <p>Halo <b>${fullName}</b>,</p>
        <p>Terima kasih telah mendaftar di acara <strong>TikTok Social Commerce</strong>.</p>
        <p>Pembayaran Anda telah diverifikasi. Berikut adalah detail E-Ticket Anda:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><b>Ticket ID</b></td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 16px;"><strong>${ticketId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><b>Tanggal</b></td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Kamis, 23 Juli 2026</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><b>Waktu</b></td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">09.00 WIB - Selesai</td>
          </tr>
          <tr>
            <td style="padding: 12px;"><b>Lokasi</b></td>
            <td style="padding: 12px;">Gedung Sate, Bandung</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 15px;"><b>Tunjukkan QR Code ini kepada panitia saat registrasi ulang di lokasi:</b></p>
          <img src="cid:qrcode_ticket" alt="QR Code E-Ticket" style="border: 2px solid #0ea5e9; padding: 15px; border-radius: 16px; width: 250px; height: 250px; background: white;" />
        </div>

        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-top: 30px;">
          <h3 style="color: #0369a1; margin-top: 0;">📱 Download Aplikasi TactLink</h3>
          <p style="margin-bottom: 15px; color: #0c4a6e;">Untuk pengalaman event yang lebih maksimal dan kemudahan networking, pastikan Anda telah mengunduh aplikasi TactLink sebelum acara dimulai.</p>
          
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <a href="https://play.google.com/store/apps/details?id=com.tactlink.app" style="display: inline-block; background-color: #0ea5e9; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">Download di Android</a>
            <a href="https://apps.apple.com/id/app/tactlink" style="display: inline-block; background-color: #0f172a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">Download di iOS</a>
          </div>
          
          <p style="font-size: 13px; color: #475569; margin-bottom: 0;">Setelah download, silakan login atau daftar menggunakan email yang Anda gunakan untuk registrasi acara ini.</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          Sampai jumpa di acara!<br/>
          <strong>Event Tiktok Social Commerce</strong>
        </p>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: '"Event Tiktok Social Commerce" <fayiz.nugraha@tactlink.com>',
      replyTo: 'fayiz.nugraha@tactlink.com',
      to: email,
      subject: `E-Ticket Registrasi: ${ticketId} - TikTok Social Commerce`,
      text: `Pendaftaran Berhasil!\n\nHalo ${fullName},\nTerima kasih telah mendaftar di acara TikTok Social Commerce.\n\nDetail E-Ticket Anda:\nTicket ID: ${ticketId}\nTanggal: Kamis, 23 Juli 2026\nWaktu: 09.00 WIB - Selesai\nLokasi: Gedung Sate, Bandung\n\nTunjukkan lampiran QR Code saat registrasi ulang di lokasi.\n\nSampai jumpa di acara!\nEvent Tiktok Social Commerce`,
      html: emailHtml,
      attachments: [
        {
          filename: 'e-ticket-qr.png',
          path: qrApiUrl,
          cid: 'qrcode_ticket' // same cid value as in the html img src
        }
      ]
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
