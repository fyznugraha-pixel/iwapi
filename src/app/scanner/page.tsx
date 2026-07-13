'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, AlertCircle, RefreshCw, ScanLine, Users, Keypad } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';

type ScanStatus = 'idle' | 'loading' | 'success' | 'already_scanned' | 'invalid' | 'error';

export default function ScannerPage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scannedName, setScannedName] = useState<string | null>(null);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (decodedText === lastScannedId && scanStatus !== 'idle') return;
          
          setLastScannedId(decodedText);
          setScanStatus('loading');
          setScannedName(null);

          if (scannerRef.current?.isScanning) {
            await scannerRef.current.pause();
          }

          try {
            const response = await fetch('/api/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ticketId: decodedText })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
              setScanStatus('success');
              setScannedName(result.nama);
              setScannedCount(prev => prev + 1);
            } else if (result.status === 'already_scanned') {
              setScanStatus('already_scanned');
              setScannedName(result.nama);
            } else {
              setScanStatus('invalid');
            }
          } catch (err) {
            console.error(err);
            setScanStatus('error');
          }

          setTimeout(() => {
            setScanStatus('idle');
            setLastScannedId(null);
            if (scannerRef.current?.isScanning) {
              scannerRef.current.resume();
            }
          }, 4000);
        },
        (errorMessage) => {
          // parse errors are ignored
        }
      );
      setIsCameraActive(true);
    } catch (err) {
      console.error("Failed to start scanner", err);
      alert("Gagal mengakses kamera. Pastikan Anda telah memberikan izin kamera.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsCameraActive(false);
    }
  };

  return (
    <AuroraBackground className="bg-[#070713] flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen">
      <div className="relative z-10 w-full max-w-sm mx-auto">
        
        {/* Header Dashboard */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-yellow-500" />
              Scanner Area
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Sistem Validasi Tiket Cepat</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-0.5">Hadir</span>
            <span className="text-xl font-black text-yellow-500 leading-none">{scannedCount}</span>
          </div>
        </div>

        {/* Main Camera / Placeholder View */}
        <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-[#0C0C14] shadow-2xl relative">
          
          <div className="relative w-full aspect-[4/5] bg-[#0C0C14]">
            
            {/* The Video Reader Div */}
            <div id="reader" className={`w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover ${!isCameraActive ? 'hidden' : ''}`}></div>

            {/* Placeholder when camera is inactive */}
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0C0C14] z-10">
                <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                  <Camera className="w-10 h-10 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 font-heading">Kamera Siap</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Mulai kamera untuk memindai tiket pengunjung dari layar HP mereka.
                </p>
                <button
                  onClick={startScanner}
                  className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-zinc-200 transition-all shadow-lg active:scale-95 w-full"
                >
                  Buka Kamera
                </button>
              </div>
            )}
            
            {/* Overlay Frame when camera is active */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8 z-20">
                <div className="w-full flex justify-between h-1/3">
                  <div className="w-10 h-10 border-t-4 border-l-4 border-yellow-500 rounded-tl-2xl"></div>
                  <div className="w-10 h-10 border-t-4 border-r-4 border-yellow-500 rounded-tr-2xl"></div>
                </div>
                <div className="w-full flex justify-between items-end h-1/3">
                  <div className="w-10 h-10 border-b-4 border-l-4 border-yellow-500 rounded-bl-2xl"></div>
                  <div className="w-10 h-10 border-b-4 border-r-4 border-yellow-500 rounded-br-2xl"></div>
                </div>
                
                {/* Stop Button */}
                <button 
                  onClick={stopScanner}
                  className="absolute bottom-8 pointer-events-auto bg-black/50 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-black/70 transition-colors"
                >
                  Tutup Kamera
                </button>
              </div>
            )}

            {/* Overlay Status (Loading/Success/Error) */}
            <AnimatePresence>
              {scanStatus !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 backdrop-blur-md bg-black/60"
                >
                  {scanStatus === 'loading' && (
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-2xl">
                      <RefreshCw className="w-16 h-16 text-yellow-500 animate-spin mb-4" />
                      <h3 className="text-xl font-bold text-white">Memvalidasi...</h3>
                    </div>
                  )}
                  
                  {scanStatus === 'success' && (
                    <div className="bg-emerald-950 border border-emerald-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                      <h3 className="text-2xl font-bold text-white mb-2">Akses Diterima</h3>
                      <p className="text-emerald-200 text-lg">{scannedName}</p>
                    </div>
                  )}

                  {scanStatus === 'already_scanned' && (
                    <div className="bg-amber-950 border border-amber-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                      <AlertCircle className="w-20 h-20 text-amber-400 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      <h3 className="text-2xl font-bold text-white mb-2">Sudah Digunakan</h3>
                      <p className="text-amber-200 text-lg mb-1">{scannedName}</p>
                      <p className="text-zinc-400 text-sm">Tiket ini sudah di-scan sebelumnya.</p>
                    </div>
                  )}

                  {scanStatus === 'invalid' && (
                    <div className="bg-red-950 border border-red-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                      <XCircle className="w-20 h-20 text-red-400 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                      <h3 className="text-2xl font-bold text-white mb-2">Tiket Palsu</h3>
                      <p className="text-red-200 text-sm">QR Code tidak terdaftar dalam database.</p>
                    </div>
                  )}

                  {scanStatus === 'error' && (
                    <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl flex flex-col items-center text-center w-full">
                      <XCircle className="w-16 h-16 text-zinc-400 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Koneksi Gagal</h3>
                      <p className="text-zinc-400 text-sm">Periksa koneksi internet Anda.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
            <Users className="w-4 h-4 text-zinc-400" />
            Daftar Peserta
          </button>
          <button className="bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
            <Keypad className="w-4 h-4 text-zinc-400" />
            Input Manual
          </button>
        </div>
        
        <p className="text-center text-zinc-600 text-xs mt-8 font-medium tracking-wide">
          Secured by Tactlink Technology
        </p>

      </div>
    </AuroraBackground>
  );
}
