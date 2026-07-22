'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, AlertCircle, RefreshCw, ScanLine, Users, Keyboard } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';

type ScanStatus = 'idle' | 'loading' | 'success' | 'already_scanned' | 'invalid' | 'error';
type Participant = { id: string, nama: string, email: string, status: string };

export default function ScannerPage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scannedName, setScannedName] = useState<string | null>(null);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showParticipantInfo, setShowParticipantInfo] = useState(false);
  const [manualId, setManualId] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const fetchParticipants = async () => {
    setIsLoadingParticipants(true);
    try {
      const scriptUrl = "https://script.google.com/macros/s/AKfycbzZ9Ok4VZvBjKGooJcIsYcnFFU8E22L40jcbkWsSeciQ2xcw6w4VCYpzZFn0XpqI5g/exec";
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'getParticipants' })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setParticipants(result.participants || []);
      } else {
        console.error(result.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  useEffect(() => {
    if (showParticipantInfo) {
      fetchParticipants();
    }
  }, [showParticipantInfo]);

  const processTicket = async (ticketId: string) => {
    if (ticketId === lastScannedId && scanStatus !== 'idle') return;
    
    setLastScannedId(ticketId);
    setScanStatus('loading');
    setScannedName(null);
    setShowManualInput(false);
    setManualId('');

    if (scannerRef.current?.isScanning) {
      await scannerRef.current.pause();
    }

    try {
      const scriptUrl = "https://script.google.com/macros/s/AKfycbzZ9Ok4VZvBjKGooJcIsYcnFFU8E22L40jcbkWsSeciQ2xcw6w4VCYpzZFn0XpqI5g/exec";
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'validate',
          ticketId: ticketId
        })
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
  };

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
          await processTicket(decodedText);
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
        <div className="bg-white/90 dark:bg-[#0C0C14]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden w-full max-w-sm">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <ScanLine className="w-6 h-6 text-primary" />
                Scanner Area
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Scan QR Code e-Ticket peserta</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl flex flex-col items-center shadow-sm">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 mb-0.5">Hadir</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{scannedCount}</span>
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
                  className="bg-white dark:bg-slate-900 text-black dark:text-white font-bold px-8 py-4 rounded-xl hover:bg-zinc-200 dark:hover:bg-slate-800 transition-all shadow-lg active:scale-95 w-full"
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
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 backdrop-blur-md bg-white/60"
                >
                  {scanStatus === 'loading' && (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-2xl">
                      <RefreshCw className="w-16 h-16 text-primary animate-spin mb-4" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Memvalidasi...</h3>
                    </div>
                  )}
                  
                  {scanStatus === 'success' && (
                    <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] dark:shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-20 h-20 text-emerald-500 dark:text-emerald-400 mb-4 drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                      <h3 className="text-2xl font-bold text-emerald-800 dark:text-white mb-2">Akses Diterima</h3>
                      <p className="text-emerald-600 dark:text-emerald-200 text-lg font-medium">{scannedName}</p>
                    </div>
                  )}

                  {scanStatus === 'already_scanned' && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] dark:shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                      <AlertCircle className="w-20 h-20 text-amber-500 dark:text-amber-400 mb-4 drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      <h3 className="text-2xl font-bold text-amber-800 dark:text-white mb-2">Sudah Digunakan</h3>
                      <p className="text-amber-700 dark:text-amber-200 text-lg mb-1 font-medium">{scannedName}</p>
                      <p className="text-amber-600/70 dark:text-zinc-400 text-sm">Tiket ini sudah di-scan sebelumnya.</p>
                    </div>
                  )}

                  {scanStatus === 'invalid' && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-500/50 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] dark:shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                      <XCircle className="w-20 h-20 text-red-500 dark:text-red-400 mb-4 drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                      <h3 className="text-2xl font-bold text-red-800 dark:text-white mb-2">Tiket Palsu</h3>
                      <p className="text-red-600 dark:text-red-200 text-sm font-medium">QR Code tidak terdaftar dalam database.</p>
                    </div>
                  )}

                  {scanStatus === 'error' && (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-8 rounded-3xl flex flex-col items-center text-center w-full shadow-2xl">
                      <XCircle className="w-16 h-16 text-slate-400 dark:text-zinc-400 mb-4" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Koneksi Gagal</h3>
                      <p className="text-slate-500 dark:text-zinc-400 text-sm">Periksa koneksi internet Anda.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowParticipantInfo(true)}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-medium py-3.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm dark:shadow-lg"
          >
            <Users className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            Daftar Peserta
          </button>
          <button 
            onClick={() => setShowManualInput(true)}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-medium py-3.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm dark:shadow-lg"
          >
            <Keyboard className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            Input Manual
          </button>
        </div>
        
        {/* Participant List Modal */}
        <AnimatePresence>
          {showParticipantInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 dark:bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#0C0C14] border border-slate-200 dark:border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
              >
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary dark:text-yellow-500" />
                    Daftar Peserta
                  </h3>
                  <button onClick={() => setShowParticipantInfo(false)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-white/5 p-2 rounded-full border border-slate-200 dark:border-transparent">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {isLoadingParticipants ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <RefreshCw className="w-8 h-8 text-primary dark:text-yellow-500 animate-spin mb-3" />
                      <p className="text-slate-500 dark:text-zinc-400 text-sm">Mengambil data...</p>
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 dark:text-zinc-500 text-sm">Belum ada peserta terdaftar.</div>
                  ) : (
                    participants.map((p, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex justify-between items-center shadow-sm">
                        <div className="overflow-hidden">
                          <p className="text-slate-900 dark:text-white font-medium truncate text-sm">{p.nama}</p>
                          <p className="text-slate-500 dark:text-zinc-500 text-xs truncate">{p.email}</p>
                        </div>
                        <div className="ml-3 shrink-0">
                          {p.status === 'Hadir' ? (
                            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border border-emerald-200 dark:border-emerald-500/30">
                              Hadir
                            </span>
                          ) : (
                            <span className="bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-zinc-400 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-medium border border-slate-300 dark:border-white/10">
                              Antri
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Input Modal */}
        <AnimatePresence>
          {showManualInput && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 dark:bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-[#0C0C14] border border-slate-200 dark:border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Input ID Tiket Manual</h3>
                <input 
                  type="text" 
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                  placeholder="Masukkan ID Tiket..."
                  className="w-full glass-input dark:bg-transparent bg-slate-50 border-slate-200 dark:border-white/20 px-4 py-3 rounded-xl mb-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowManualInput(false)}
                    className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-700 dark:text-white py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      if (manualId.trim()) processTicket(manualId.trim());
                    }}
                    className="flex-1 bg-slate-900 dark:bg-yellow-500 text-white dark:text-black py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-yellow-400 transition-colors font-bold shadow-md dark:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                  >
                    Validasi
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-slate-400 dark:text-zinc-600 text-xs mt-8 font-medium tracking-wide">
          Secured by Tactlink Technology
        </p>

      </div>
    </AuroraBackground>
  );
}
