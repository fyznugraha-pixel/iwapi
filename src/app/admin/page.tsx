"use client";

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, ExternalLink, RefreshCw, Mail, ShieldAlert } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';

interface Participant {
  ticketId: string;
  timestamp: string;
  fullName: string;
  email: string;
  whatsapp: string;
  buktiUrl: string;
  statusPembayaran: string;
  statusKehadiran: string;
}

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isBlasting, setIsBlasting] = useState(false);
  const [blastProgress, setBlastProgress] = useState('');
  
  // Ganti URL ini dengan URL Web App Anda
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZ9Ok4VZvBjKGooJcIsYcnFFU8E22L40jcbkWsSeciQ2xcw6w4VCYpzZFn0XpqI5g/exec";

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "getAdminData" }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setParticipants(result.participants || []);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const pendingParticipantsCount = participants.filter(p => p.statusPembayaran !== 'Lunas').length;

  const toggleParticipantSelection = (ticketId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const toggleAllPending = () => {
    const pendingIds = participants
      .filter(p => p.statusPembayaran !== 'Lunas')
      .map(p => p.ticketId);
      
    if (selectedParticipants.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(pendingIds);
    }
  };

  const handleBlastEmail = async () => {
    if (selectedParticipants.length === 0) return;
    
    if (!confirm(`Verifikasi pembayaran dan kirim E-Ticket ke ${selectedParticipants.length} peserta terpilih?`)) return;
    
    setIsBlasting(true);
    let successCount = 0;
    
    try {
      for (let i = 0; i < selectedParticipants.length; i++) {
        const ticketId = selectedParticipants[i];
        const participant = participants.find(p => p.ticketId === ticketId);
        
        if (!participant) continue;
        
        setBlastProgress(`Memproses ${i + 1}/${selectedParticipants.length} (${participant.fullName})...`);
        setProcessingId(ticketId);
        
        try {
          // 1. Send Email via Next.js API
          const emailRes = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: participant.email,
              fullName: participant.fullName,
              ticketId: participant.ticketId,
            }),
          });
          
          if (!emailRes.ok) {
            console.error(`Gagal mengirim email untuk ${participant.fullName}`);
            continue; 
          }

          // 2. Update Status Pembayaran in Google Sheets
          const gasRes = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: "updatePaymentStatus",
              ticketId: participant.ticketId
            }),
          });
          
          const gasResult = await gasRes.json();
          
          if (gasResult.status === 'success') {
            successCount++;
            setParticipants(prev => prev.map(p => 
              p.ticketId === participant.ticketId 
                ? { ...p, statusPembayaran: 'Lunas' } 
                : p
            ));
          }
        } catch (err) {
          console.error(`Error processing ${participant.fullName}:`, err);
        }
      }
      
      alert(`Blast Email selesai! Berhasil memverifikasi dan mengirim ${successCount} dari ${selectedParticipants.length} tiket.`);
      setSelectedParticipants([]);
      
    } catch (error: any) {
      console.error("Blast email failed:", error);
      alert(`Terjadi kesalahan saat blast email: ${error.message}`);
    } finally {
      setIsBlasting(false);
      setBlastProgress('');
      setProcessingId(null);
    }
  };

  const handleVerifyAndSend = async (participant: Participant) => {
    if (!confirm(`Verifikasi pembayaran dan kirim E-Ticket ke ${participant.fullName} (${participant.email})?`)) return;
    
    setProcessingId(participant.ticketId);
    try {
      // 1. Send Email via Next.js API
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: participant.email,
          fullName: participant.fullName,
          ticketId: participant.ticketId,
        }),
      });
      
      const emailResult = await emailRes.json();
      
      if (!emailRes.ok) {
        throw new Error(emailResult.error || "Gagal mengirim email");
      }

      // 2. Update Status Pembayaran in Google Sheets
      const gasRes = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: "updatePaymentStatus",
          ticketId: participant.ticketId
        }),
      });
      
      const gasResult = await gasRes.json();
      
      if (gasResult.status === 'success') {
        // Update local state to reflect changes
        setParticipants(prev => prev.map(p => 
          p.ticketId === participant.ticketId 
            ? { ...p, statusPembayaran: 'Lunas' } 
            : p
        ));
        alert('Berhasil! E-Ticket telah dikirim dan status diperbarui.');
      } else {
        throw new Error("Gagal update status di Spreadsheet");
      }
      
    } catch (error: any) {
      console.error("Verification failed:", error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="w-full max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 py-12 relative z-10">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2">Verifikasi pembayaran dan kelola E-Ticket peserta secara individu maupun massal.</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-end">
            <button 
              onClick={fetchParticipants}
              disabled={isBlasting}
              className="bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              Refresh Data
            </button>
            {selectedParticipants.length > 0 && (
              <button
                onClick={handleBlastEmail}
                disabled={isBlasting}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBlasting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Blast {selectedParticipants.length} Tiket
              </button>
            )}
          </div>
          
          {isBlasting && (
            <div className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg flex items-center justify-center gap-3 text-sm font-medium animate-pulse mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              {blastProgress}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0C0C14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={pendingParticipantsCount > 0 && selectedParticipants.length === pendingParticipantsCount}
                      onChange={toggleAllPending}
                      disabled={pendingParticipantsCount === 0 || isBlasting}
                      title="Pilih semua peserta pending"
                    />
                  </th>
                  <th className="p-4 whitespace-nowrap">Tanggal & Waktu</th>
                  <th className="p-4 whitespace-nowrap">Nama Peserta</th>
                  <th className="p-4 whitespace-nowrap">Kontak</th>
                  <th className="p-4 whitespace-nowrap">Bukti TF</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="py-4 pl-4 pr-8 sm:pr-10 whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500 dark:text-zinc-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                      Memuat data peserta...
                    </td>
                  </tr>
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500 dark:text-zinc-400">
                      Belum ada data pendaftar.
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.ticketId} className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors ${selectedParticipants.includes(p.ticketId) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={selectedParticipants.includes(p.ticketId)}
                          onChange={() => toggleParticipantSelection(p.ticketId)}
                          disabled={p.statusPembayaran === 'Lunas' || isBlasting}
                        />
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {p.timestamp ? new Date(p.timestamp).toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{p.fullName}</p>
                        <p className="text-xs font-mono text-slate-500 dark:text-zinc-500 mt-1">{p.ticketId}</p>
                      </td>
                      <td className="p-4 text-sm">
                        <p className="text-slate-700 dark:text-zinc-300">{p.email}</p>
                        <p className="text-slate-500 dark:text-zinc-500 text-xs mt-1">{p.whatsapp}</p>
                      </td>
                      <td className="p-4">
                        {p.buktiUrl ? (
                          <a 
                            href={p.buktiUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Lihat Bukti
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Tidak ada</span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.statusPembayaran === 'Lunas' ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5" /> Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-500/30">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 pl-4 pr-8 sm:pr-10 text-right">
                        {p.statusPembayaran !== 'Lunas' ? (
                          <button
                            onClick={() => handleVerifyAndSend(p)}
                            disabled={processingId === p.ticketId || isBlasting}
                            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-bold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                          >
                            {processingId === p.ticketId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                            Kirim Tiket
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 px-3">
                            Terkirim
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </AuroraBackground>
  );
}
