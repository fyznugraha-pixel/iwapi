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
  const [registrationType, setRegistrationType] = useState<'individual' | 'group'>('individual');
  const [tickets, setTickets] = useState<{ticketId: string, email: string, fullName: string}[]>([]);
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
    const count = registrationType === 'group' ? 5 : 1;
    const participantsData = [];
    
    for (let i = 0; i < count; i++) {
      participantsData.push({
        fullName: formData.get(`fullName_${i}`),
        email: formData.get(`email_${i}`),
        whatsapp: formData.get(`whatsapp_${i}`),
        tiktokUsername: formData.get(`tiktokUsername_${i}`),
        tiktokLink: formData.get(`tiktokLink_${i}`),
        followers: formData.get(`followers_${i}`),
      });
    }

    const payload = {
      participants: participantsData,
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
        const returnedTickets = result.tickets || [];
        setTickets(returnedTickets);
        
        // PENGIRIMAN EMAIL DIMATIKAN SAAT SUBMIT.
        // Bendahara akan mengirimkan email secara manual dari halaman Admin setelah verifikasi pembayaran.

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
            <div className="relative w-full overflow-hidden bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl py-5 sm:py-6 rounded-[3rem] shadow-[0_8px_40px_rgba(0,242,254,0.15)] mb-10 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 dark:via-white/5 to-white/0 group-hover:via-white/80 dark:group-hover:via-white/10 transition-colors duration-700"></div>
              
              <div className="flex flex-col w-full relative">
                {/* Marquee Row */}
                <motion.div 
                  className="flex gap-4 sm:gap-6 min-w-max items-center pr-4 sm:pr-6"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: 25, repeat: Infinity }}
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
                    <div key={`r1-${idx}`} className="bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shrink-0 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-[1.15] hover:z-10 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] cursor-pointer h-16 w-28 sm:h-20 sm:w-36 border border-slate-200/50 dark:border-white/20">
                      <img src={logo.src} alt={logo.alt} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal dark:brightness-[100] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
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

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading leading-tight mb-8 font-bold text-slate-900 dark:text-white">
              Bongkar Rahasia Cuan Lewat <br/>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-slate-900 dark:text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <ShinyText text="TikTok Social" className="text-5xl lg:text-6xl" />
                <ShinyText text="Commerce" theme="pink" className="text-5xl lg:text-6xl" />
              </div>
            </h1>

            <div className="bg-white/80 dark:bg-[#0C0C14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl rounded-3xl p-6 md:p-8 space-y-6 mb-10">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors border border-slate-100 dark:border-white/10 shadow-sm">
                  <Calendar className="text-primary w-6 h-6 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Tanggal & Waktu</h3>
                  <p className="text-slate-500 dark:text-zinc-400 mt-1">Kamis, 23 Juli 2026 <br/> 08.00 WIB - Selesai</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl group-hover:bg-secondary/10 transition-colors border border-slate-100 dark:border-white/10 shadow-sm">
                  <MapPin className="text-secondary w-6 h-6 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Lokasi</h3>
                  <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm leading-relaxed">
                    <a href="https://maps.app.goo.gl/GLC7gKbRhENe12tE6" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                      <strong>Evermos Center</strong><br/>
                      Jl. Dago No.95, Lb. Siliwangi,<br/>
                      Kecamatan Coblong, Kota Bandung,<br/>
                      Jawa Barat 40132
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors border border-slate-100 dark:border-white/10 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-primary w-6 h-6 flex-shrink-0">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Pembicara Utama</h3>
                  <p className="text-slate-500 dark:text-zinc-400 mt-1">Tim TikTok Official Indonesia</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-heading font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> Investasi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setRegistrationType('individual')}
                className={`text-left rounded-2xl p-5 border transition-all ${
                  registrationType === 'individual' 
                    ? 'bg-white/90 dark:bg-white/10 border-primary shadow-[0_0_20px_rgba(0,242,254,0.3)] dark:shadow-[0_0_20px_rgba(0,242,254,0.15)]' 
                    : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 opacity-70 hover:opacity-100'
                }`}
              >
                <h4 className={`font-medium mb-1 text-sm uppercase tracking-wider ${registrationType === 'individual' ? 'text-primary' : 'text-slate-500 dark:text-zinc-400'}`}>Perorangan</h4>
                <p className="font-heading font-bold text-3xl text-slate-900 dark:text-white">Rp 75.000</p>
              </button>
              
              <button 
                type="button"
                onClick={() => setRegistrationType('group')}
                className={`text-left rounded-2xl p-5 border transition-all relative overflow-hidden ${
                  registrationType === 'group' 
                    ? 'bg-slate-900 dark:bg-white/10 border-primary shadow-[0_0_20px_rgba(0,242,254,0.3)] dark:shadow-[0_0_20px_rgba(0,242,254,0.15)]' 
                    : 'bg-slate-800 dark:bg-white/5 border-slate-700 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="relative z-10">
                  <h4 className="font-medium mb-1 text-primary text-sm uppercase tracking-wider">Kelompok (5 Org)</h4>
                  <p className={`font-heading font-bold text-3xl ${registrationType === 'group' ? 'text-white' : 'text-slate-200 dark:text-white'}`}>Rp 250.000</p>
                  <p className="text-xs text-primary mt-1 font-bold tracking-wide">HEMAT RP 125.000</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Right Section: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="bg-white/90 dark:bg-[#0C0C14]/80 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-2xl rounded-[2rem] p-6 sm:p-8 md:p-12 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 sm:py-16"
                  >
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-2 text-slate-900 dark:text-white">Pendaftaran Berhasil!</h2>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
                      Pendaftaran berhasil! Bukti pembayaran Anda sedang <strong>diverifikasi oleh Bendahara</strong>. E-Ticket akan dikirimkan ke email yang didaftarkan setelah pembayaran dinyatakan Lunas.
                    </p>
                    
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 p-6 rounded-2xl flex items-center justify-center text-center shadow-inner mb-6 w-full">
                      <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
                        Proses verifikasi biasanya memakan waktu maksimal 1x24 jam hari kerja.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                  >
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-3 text-slate-900 dark:text-white">Amankan Kursimu</h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-8 text-base">Isi detail di bawah untuk mengonfirmasi kehadiran Anda.</p>

                    {status === "error" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Terjadi kesalahan saat mengirim data. Silakan coba lagi.
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {Array.from({ length: registrationType === 'group' ? 5 : 1 }).map((_, i) => (
                        <div key={i} className={`space-y-5 ${registrationType === 'group' && i > 0 ? 'pt-8 mt-8 border-t border-slate-200 dark:border-white/10' : ''}`}>
                          
                          {registrationType === 'group' && (
                            <h3 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark dark:text-primary">
                                {i + 1}
                              </span>
                              Data Peserta {i + 1}
                            </h3>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">Nama Lengkap Sesuai KTP <span className="text-secondary">*</span></label>
                            <input type="text" name={`fullName_${i}`} required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: Fayiz Apriwansyah" />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">Alamat Email <span className="text-secondary">*</span></label>
                              <input type="email" name={`email_${i}`} required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: fyznugraha@email.com" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">No. WhatsApp Aktif <span className="text-secondary">*</span></label>
                              <input type="tel" name={`whatsapp_${i}`} required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: 087794693241" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">Username TikTok <span className="text-secondary">*</span></label>
                              <input type="text" name={`tiktokUsername_${i}`} required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: @faizngraha" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">Jumlah Followers <span className="text-secondary">*</span></label>
                              <input type="number" name={`followers_${i}`} required className="w-full glass-input px-4 py-3.5" placeholder="Contoh: 1500" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">Link Akun TikTok <span className="text-secondary">*</span></label>
                            <input type="url" name={`tiktokLink_${i}`} required className="w-full glass-input px-4 py-3.5" placeholder="https://tiktok.com/@faizngraha" />
                          </div>
                        </div>
                      ))}

                      <div className="pt-4 mt-8 border-t border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-heading font-semibold mb-4 text-slate-900 dark:text-white">Verifikasi Pembayaran</h3>
                        
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Bank Mandiri</p>
                            <p className="font-heading text-xl font-bold text-slate-900 dark:text-white tracking-widest">130 00 295 04845</p>
                            <p className="text-sm font-medium text-primary mt-1">a.n NANI SUMARNI</p>
                          </div>
                          <div className="px-4 py-2 bg-primary/10 text-primary-dark dark:text-primary rounded-lg text-sm font-semibold border border-primary/20">
                            Transfer Resmi
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">Upload Bukti Screenshot <span className="text-secondary">*</span></label>
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
                              ${fileName ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 group-hover:border-primary/50 group-hover:bg-slate-100 dark:group-hover:bg-white/10'}`}>
                              
                              <div className={`p-3 rounded-full transition-colors ${fileName ? 'bg-primary/20 text-primary-dark dark:text-primary' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-zinc-400 group-hover:text-primary-dark dark:group-hover:text-primary'}`}>
                                {fileName ? <CheckCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                              </div>
                              
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white mb-1">
                                  {fileName ? fileName : 'Klik atau seret file ke sini'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-500">
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
                        className="w-full mt-8 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group relative overflow-hidden shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                            Memproses Data...
                          </>
                        ) : (
                          'Daftar Sekarang'
                        )}
                      </button>

                      <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-slate-200 dark:border-white/10 pt-6">
                        <p className="text-slate-500 dark:text-zinc-400 text-sm">Butuh bantuan pendaftaran? Hubungi:</p>
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                          <a href="https://wa.me/6282126169071" target="_blank" rel="noopener noreferrer" className="group text-sm text-slate-600 dark:text-zinc-300 hover:text-primary-dark dark:hover:text-primary transition-colors flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,242,254,0.5)]"></span>
                            Avi: <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary-dark dark:group-hover:text-primary transition-colors">0856-0350-0816</span>
                          </a>
                          <a href="https://wa.me/6282126169071" target="_blank" rel="noopener noreferrer" className="group text-sm text-slate-600 dark:text-zinc-300 hover:text-secondary transition-colors flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(254,9,121,0.5)]"></span>
                            Nisa: <span className="font-bold text-slate-900 dark:text-white group-hover:text-secondary transition-colors">0821-2616-9071</span>
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
