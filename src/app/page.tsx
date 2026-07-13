"use client";

import { useState } from 'react';
import { Upload, Calendar, MapPin, Users, Ticket, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { ShinyText } from '@/components/ShinyText';
import { SpotlightCard } from '@/components/SpotlightCard';
import TactlinkSupportSection from '@/components/TactlinkSupportSection';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileType, setFileType] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Kita paksa konversi ke JPEG agar lebih ringan
      setFileType('image/jpeg'); 

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Kompresi menggunakan Canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Batasi ukuran maksimal 800px (Sangat cukup terbaca untuk bukti TF)
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Export ke base64 JPEG dengan kualitas 60% (Sangat meringankan payload)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          const base64String = dataUrl.split(',')[1];
          setFileBase64(base64String);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      whatsapp: formData.get('whatsapp'),
      tiktokUsername: formData.get('tiktokUsername'),
      tiktokLink: formData.get('tiktokLink'),
      followers: formData.get('followers'),
      fileContent: fileBase64,
      fileName: fileName,
      mimeType: fileType
    };

    try {
      // Ganti URL ini dengan URL Web App Anda
      const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZ9Ok4VZvBjKGooJcIsYcnFFU8E22L40jcbkWsSeciQ2xcw6w4VCYpzZFn0XpqI5g/exec";
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        const ticketIdFromGas = result.ticketId;
        const userEmailFromForm = formData.get('email') as string;
        
        setTicketId(ticketIdFromGas);
        setUserEmail(userEmailFromForm);
        
        // Trigger pengiriman email via API Route Next.js
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userEmailFromForm,
              fullName: formData.get('fullName'),
              ticketId: ticketIdFromGas,
            }),
          });
        } catch (emailError) {
          console.error("Gagal memanggil API kirim email:", emailError);
          // Tetap tampilkan layar sukses meski email mungkin gagal
        }

        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuroraBackground className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Section: Event Info */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col justify-center pt-2 sm:pt-0"
          >
            {/* Sponsors Section on Pill */}
            <div className="relative w-full overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl p-4 sm:p-5 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,242,254,0.15)] mb-10 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 group-hover:via-white/10 transition-colors duration-700"></div>
              
              <div className="flex overflow-hidden w-full relative rounded-2xl">
                <motion.div 
                  className="flex gap-4 sm:gap-6 min-w-max items-center pr-4 sm:pr-6"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: 15, repeat: Infinity }}
                >
                  {[
                    { src: '/logo/beliemas.png', alt: 'Beli Emas' },
                    { src: '/logo/tactlink.png', alt: 'Tactlink' },
                    { src: '/logo/evermor.png', alt: 'Evermos' },
                    { src: '/logo/folago.jpeg', alt: 'Folago' },
                    { src: '/logo/iwapi.png', alt: 'IWAPI' },
                    // Duplicate for seamless infinite scrolling
                    { src: '/logo/beliemas.png', alt: 'Beli Emas' },
                    { src: '/logo/tactlink.png', alt: 'Tactlink' },
                    { src: '/logo/evermor.png', alt: 'Evermos' },
                    { src: '/logo/folago.jpeg', alt: 'Folago' },
                    { src: '/logo/iwapi.png', alt: 'IWAPI' }
                  ].map((logo, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shrink-0 flex items-center justify-center shadow-[0_8px_32px_rgba(0,242,254,0.1)] transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(0,242,254,0.2)] cursor-pointer h-16 w-28 sm:h-20 sm:w-36 md:h-24 md:w-44 border border-white/10 group-hover:border-white/20">
                      <img src={logo.src} alt={logo.alt} className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-300" />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            <div className="inline-flex">
              <span className="bg-secondary/10 text-secondary border border-secondary/20 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(254,9,121,0.4)]">
                <ShinyText text="EXCLUSIVE EVENT" theme="pink" />
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading leading-tight mb-8 font-bold">
              Bongkar Rahasia Cuan Lewat <br/>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <ShinyText text="TikTok Social" className="text-5xl lg:text-6xl" />
                <ShinyText text="Commerce" theme="pink" className="text-5xl lg:text-6xl" />
              </div>
            </h1>

            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 mb-10">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors border border-white/5">
                  <Calendar className="text-primary w-6 h-6 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Tanggal & Waktu</h3>
                  <p className="text-text-muted mt-1">Kamis, 23 Juli 2026 <br/> 09.00 WIB - Selesai</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-secondary/20 transition-colors border border-white/5">
                  <MapPin className="text-secondary w-6 h-6 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Lokasi</h3>
                  <p className="text-text-muted mt-1">Gedung Sate<br/>Jl. Diponegoro No.22, Bandung</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors border border-white/5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-primary w-6 h-6 flex-shrink-0">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Pembicara Utama</h3>
                  <p className="text-text-muted mt-1">Tim TikTok Official Indonesia</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-heading font-semibold mb-4 text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> Investasi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-5 border-white/10 hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1 text-text-muted text-sm uppercase tracking-wider">Perorangan</h4>
                <p className="font-heading font-bold text-3xl text-white">Rp 75.000</p>
              </div>
              <SpotlightCard className="p-5">
                <div className="relative z-10">
                  <h4 className="font-medium mb-1 text-primary text-sm uppercase tracking-wider">Kelompok (5 Org)</h4>
                  <p className="font-heading font-bold text-3xl text-white">Rp 250.000</p>
                  <p className="text-xs text-primary/80 mt-1 font-medium tracking-wide">HEMAT RP 125.000</p>
                </div>
              </SpotlightCard>
            </div>
          </motion.div>

          {/* Right Section: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="glass-card rounded-[2rem] p-6 sm:p-8 md:p-12 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 sm:py-16"
                  >
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-2 text-white">Pendaftaran Berhasil!</h2>
                    <p className="text-base sm:text-lg text-zinc-200 max-w-md mb-8 leading-relaxed">
                      E-Ticket telah dikirim ke <strong className="text-white">{userEmail}</strong>. Tunjukkan QR Code di bawah ini saat registrasi ulang di lokasi.
                    </p>
                    
                    {ticketId && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                        className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.3)] mb-6"
                      >
                        <QRCodeSVG value={ticketId} size={200} level="H" includeMargin={true} />
                        <p className="text-black font-bold mt-4 font-mono text-lg tracking-widest">{ticketId}</p>
                      </motion.div>
                    )}
                    
                    <p className="text-sm text-zinc-400 mt-2">
                      Screenshot QR Code ini sebagai cadangan tiket Anda.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                  >
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-3 text-white">Amankan Kursimu</h2>
                    <p className="text-text-muted mb-8 text-base">Isi detail di bawah untuk mengonfirmasi kehadiran Anda.</p>

                    {status === "error" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Terjadi kesalahan saat mengirim data. Silakan coba lagi.
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-300 ml-1">Nama Lengkap Sesuai KTP <span className="text-secondary">*</span></label>
                        <input type="text" name="fullName" required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: Fayiz Apriwansyah" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-300 ml-1">Alamat Email <span className="text-secondary">*</span></label>
                          <input type="email" name="email" required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: fyznugraha@email.com" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-300 ml-1">No. WhatsApp Aktif <span className="text-secondary">*</span></label>
                          <input type="tel" name="whatsapp" required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: 087794693241" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-300 ml-1">Username TikTok <span className="text-secondary">*</span></label>
                          <input type="text" name="tiktokUsername" required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: @faizngraha" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-300 ml-1">Jumlah Followers <span className="text-secondary">*</span></label>
                          <input type="number" name="followers" required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: 1500" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-300 ml-1">Link Akun TikTok <span className="text-secondary">*</span></label>
                        <input type="url" name="tiktokLink" required className="w-full glass-input px-4 py-3.5" placeholder="https://tiktok.com/@faizngraha" />
                      </div>

                      <div className="pt-4 mt-8 border-t border-white/10">
                        <h3 className="text-lg font-heading font-semibold mb-4 text-white">Verifikasi Pembayaran</h3>
                        
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="text-sm text-text-muted mb-1">Bank Mandiri</p>
                            <p className="font-heading text-xl font-bold text-white tracking-widest">130 00 295 04845</p>
                            <p className="text-sm font-medium text-primary mt-1">a.n NANI SUMARNI</p>
                          </div>
                          <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold border border-primary/20">
                            Transfer Resmi
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300 ml-1">Upload Bukti Screenshot <span className="text-secondary">*</span></label>
                          <div className="relative group">
                            <input 
                              type="file" 
                              id="paymentProof" 
                              accept="image/jpeg,image/png,image/jpg" 
                              required 
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <div className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center gap-3
                              ${fileName ? 'border-primary bg-primary/5' : 'border-white/20 bg-white/5 group-hover:border-primary/50 group-hover:bg-white/10'}`}>
                              
                              <div className={`p-3 rounded-full transition-colors ${fileName ? 'bg-primary/20 text-primary' : 'bg-white/10 text-zinc-400 group-hover:text-primary'}`}>
                                {fileName ? <CheckCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                              </div>
                              
                              <div>
                                <p className="font-medium text-white mb-1">
                                  {fileName ? fileName : 'Klik atau seret file ke sini'}
                                </p>
                                <p className="text-xs text-text-muted">
                                  Format: JPG, PNG (Maks. 2MB)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-8 bg-white text-black hover:bg-zinc-200 font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-black" />
                            Memproses Data...
                          </>
                        ) : (
                          'Daftar Sekarang'
                        )}
                      </button>

                      <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-white/10 pt-6">
                        <p className="text-zinc-400 text-sm">Butuh bantuan pendaftaran? Hubungi:</p>
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                          <a href="https://wa.me/6285603500816" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-300 hover:text-primary transition-colors flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(0,242,254,0.5)]"></span>
                            Avi: <span className="font-bold text-white">0856-0350-0816</span>
                          </a>
                          <a href="https://wa.me/6282126169071" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-300 hover:text-secondary transition-colors flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary/50 shadow-[0_0_10px_rgba(254,9,121,0.5)]"></span>
                            Fitri: <span className="font-bold text-white">0821-2616-9071</span>
                          </a>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
        </div>
      </div>
      
      {/* Tactlink Support Section at the bottom */}
      <div className="w-full mt-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <TactlinkSupportSection noBackground={true} />
      </div>
    </AuroraBackground>
  );
}
