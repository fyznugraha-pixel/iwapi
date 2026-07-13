'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ScanLine, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';

type ScanStatus = 'idle' | 'loading' | 'success' | 'already_scanned' | 'invalid' | 'error';

export default function ScannerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scannedName, setScannedName] = useState<string | null>(null);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  // Authenticate PIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '8899') { // PIN Panitia
      setIsAuthenticated(true);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    let scanner: Html5QrcodeScanner | null = null;

    const onScanSuccess = async (decodedText: string) => {
      // Mencegah scan berulang untuk ID yang sama dalam waktu berdekatan
      if (decodedText === lastScannedId && scanStatus !== 'idle') return;
      
      setLastScannedId(decodedText);
      setScanStatus('loading');
      setScannedName(null);

      // Jeda scanner sementara saat memproses (optional)
      if (scanner) scanner.pause(true);

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

      // Lanjutkan scanner setelah 3 detik
      setTimeout(() => {
        setScanStatus('idle');
        setLastScannedId(null);
        if (scanner) scanner.resume();
      }, 4000);
    };

    scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(onScanSuccess, () => {});

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isAuthenticated, lastScannedId, scanStatus]);

  // --- UI RENDERERS ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen relative flex items-center justify-center p-4">
        <AuroraBackground />
        <div className="relative z-10 w-full max-w-sm">
          <div className="glass-card rounded-[2rem] p-8 text-center shadow-[0_0_50px_rgba(0,242,254,0.15)] border border-white/10">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,242,254,0.3)]">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Akses Panitia</h1>
            <p className="text-zinc-400 text-sm mb-8">Masukkan PIN Keamanan</p>
            
            <form onSubmit={handleLogin}>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-[1em] text-2xl glass-input py-4 font-mono font-bold text-white mb-4 placeholder:tracking-normal placeholder:text-zinc-600"
                placeholder="••••"
                required
              />
              {pinError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mb-4">
                  PIN Salah!
                </motion.p>
              )}
              <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Buka Scanner
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-zinc-950 flex flex-col items-center p-4 sm:p-8">
      <AuroraBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-white flex items-center justify-center gap-2">
            <ScanLine className="w-6 h-6 text-primary" />
            E-Ticket Scanner
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Arahkan kamera ke QR Code peserta</p>
        </div>

        {/* Scanner Viewport */}
        <div className="glass-card rounded-[2rem] p-4 sm:p-6 shadow-[0_0_50px_rgba(0,242,254,0.1)] relative overflow-hidden mb-6">
          <div id="reader" className="rounded-xl overflow-hidden [&_video]:rounded-xl [&_video]:object-cover" style={{ width: '100%', border: 'none' }}></div>
          
          {/* Overlay Status */}
          <AnimatePresence>
            {scanStatus !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 backdrop-blur-md"
              >
                {scanStatus === 'loading' && (
                  <div className="bg-zinc-900/90 border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-2xl">
                    <RefreshCw className="w-16 h-16 text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white">Memvalidasi...</h3>
                  </div>
                )}
                
                {scanStatus === 'success' && (
                  <div className="bg-emerald-950/90 border border-emerald-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-2xl font-bold text-white mb-2">Akses Diterima</h3>
                    <p className="text-emerald-200 text-lg">{scannedName}</p>
                  </div>
                )}

                {scanStatus === 'already_scanned' && (
                  <div className="bg-amber-950/90 border border-amber-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                    <AlertCircle className="w-20 h-20 text-amber-400 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    <h3 className="text-2xl font-bold text-white mb-2">Sudah Digunakan</h3>
                    <p className="text-amber-200 text-lg mb-1">{scannedName}</p>
                    <p className="text-zinc-400 text-sm">Tiket ini sudah di-scan sebelumnya.</p>
                  </div>
                )}

                {scanStatus === 'invalid' && (
                  <div className="bg-red-950/90 border border-red-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                    <XCircle className="w-20 h-20 text-red-400 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    <h3 className="text-2xl font-bold text-white mb-2">Tiket Palsu</h3>
                    <p className="text-red-200 text-sm">QR Code tidak terdaftar dalam database.</p>
                  </div>
                )}

                {scanStatus === 'error' && (
                  <div className="bg-zinc-900/90 border border-zinc-700 p-8 rounded-3xl flex flex-col items-center text-center w-full">
                    <XCircle className="w-16 h-16 text-zinc-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Koneksi Gagal</h3>
                    <p className="text-zinc-400 text-sm">Periksa koneksi internet Anda.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-auto">
           <button onClick={() => setIsAuthenticated(false)} className="text-zinc-500 text-sm hover:text-white transition-colors">
             Kunci Layar (Logout)
           </button>
        </div>
      </div>

      {/* Inject custom styles for html5-qrcode UI */}
      <style dangerouslySetInnerHTML={{__html: `
        #reader { border: none !important; }
        #reader__dashboard_section_csr span { color: white !important; font-family: inherit !important; }
        #reader__dashboard_section_swaplink { color: #0ea5e9 !important; text-decoration: none !important; }
        #html5-qrcode-button-camera-permission, #html5-qrcode-button-camera-start, #html5-qrcode-button-camera-stop {
          background-color: white !important;
          color: black !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin-top: 10px !important;
          font-family: inherit !important;
        }
      `}} />
    </main>
  );
}
