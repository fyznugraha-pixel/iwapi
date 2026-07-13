"use client";

import Image from "next/image";
import { ExternalLink, Globe2 } from "lucide-react";
import { motion } from "framer-motion";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function assetPath(path: string) {
  return `${basePath}${path}`;
}

const tactlinkLinks = {
  website: "https://tactlink.com",
  appStore: "https://apps.apple.com/id/app/tactlink/id1469516661",
  playStore: "https://play.google.com/store/apps/details?id=com.tactlink.app",
};

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-full w-full shrink-0"
      fill="currentColor"
    >
      <path d="M16.365 1.43c0 1.14-.466 2.22-1.22 3.04-.79.86-2.08 1.52-3.16 1.43-.14-1.09.4-2.25 1.13-3.04.8-.86 2.2-1.5 3.25-1.43ZM20.74 17.36c-.55 1.25-.82 1.8-1.53 2.9-.99 1.52-2.38 3.41-4.1 3.43-1.53.02-1.93-.99-4.01-.98-2.08.01-2.52 1-4.05.98-1.72-.02-3.03-1.72-4.02-3.24-2.76-4.25-3.05-9.24-1.35-11.9 1.21-1.9 3.13-3.01 4.93-3.01 1.83 0 2.98 1.01 4.5 1.01 1.47 0 2.37-1.01 4.5-1.01 1.61 0 3.32.88 4.52 2.4-3.97 2.18-3.33 7.85.61 9.42Z" />
    </svg>
  );
}

function PlayStoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-full w-full shrink-0"
    >
      <path
        fill="#34A853"
        d="M3.3 1.7c-.24.25-.38.64-.38 1.14v18.32c0 .5.14.89.38 1.14l.06.06 10.28-10.28v-.16L3.36 1.64l-.06.06Z"
      />
      <path
        fill="#4285F4"
        d="m17.06 15.52-3.42-3.44v-.16l3.42-3.44.08.05 4.05 2.3c1.16.66 1.16 1.74 0 2.4l-4.05 2.3-.08.04Z"
      />
      <path
        fill="#FBBC04"
        d="m17.14 15.47-3.5-3.5L3.3 22.3c.38.4 1 .45 1.7.05l12.14-6.88Z"
      />
      <path
        fill="#EA4335"
        d="M17.14 8.53 5 1.65c-.7-.4-1.32-.35-1.7.05l10.34 10.34 3.5-3.51Z"
      />
    </svg>
  );
}

function AppStoreBadge({ compact }: { compact?: boolean }) {
  return (
    <div className={`grid w-full items-center ${compact ? 'grid-cols-[28px_1fr] gap-3' : 'grid-cols-[54px_1fr] gap-4'}`}>
      <div className={`flex items-center justify-center ${compact ? 'h-7 w-7' : 'h-12 w-12'}`}>
        <AppleIcon />
      </div>

      <div className="text-left leading-none">
        <p className={`font-black uppercase tracking-[0.08em] text-[#070713]/65 ${compact ? 'text-[9px]' : 'text-[12px]'}`}>
          Download on the
        </p>

        <p className={`font-black leading-none text-[#070713] ${compact ? 'mt-0.5 text-[1.1rem]' : 'mt-1 text-[1.65rem]'}`}>
          App Store
        </p>
      </div>
    </div>
  );
}

function PlayStoreBadge({ compact }: { compact?: boolean }) {
  return (
    <div className={`grid w-full items-center ${compact ? 'grid-cols-[28px_1fr] gap-3' : 'grid-cols-[54px_1fr] gap-4'}`}>
      <div className={`flex items-center justify-center ${compact ? 'h-7 w-7' : 'h-12 w-12'}`}>
        <PlayStoreIcon />
      </div>

      <div className="text-left leading-none">
        <p className={`font-black uppercase tracking-[0.08em] text-[#070713]/65 ${compact ? 'text-[9px]' : 'text-[12px]'}`}>
          Get it on
        </p>

        <p className={`font-black leading-none text-[#070713] ${compact ? 'mt-0.5 text-[1.1rem]' : 'mt-1 text-[1.65rem]'}`}>
          Google Play
        </p>
      </div>
    </div>
  );
}

const BorderGlow = ({ children, className = "", animated = true }: { children: React.ReactNode, className?: string, animated?: boolean }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-[#0c0c1a] p-[1px] shadow-2xl ${className}`}
    >
      {animated && (
        <>
          {/* Aura Layer (Masked to outer 32px so it only bleeds slightly into the card) */}
          <div 
            className="pointer-events-none absolute inset-0 z-0 rounded-[2rem]"
            style={{
              border: "32px solid transparent",
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <div
              className="absolute -inset-[150%] opacity-100 animate-[spin_5s_linear_infinite]"
              style={{
                background: "conic-gradient(from 90deg, transparent 20%, rgba(250, 204, 21, 0.8) 45%, transparent 50%, transparent 70%, rgba(250, 204, 21, 0.8) 95%, transparent 100%)",
                filter: "blur(12px)",
              }}
            />
          </div>

          {/* Sharp Core Layer (Masked to outer 1px) */}
          <div 
            className="pointer-events-none absolute inset-0 z-0 rounded-[2rem]"
            style={{
              border: "1px solid transparent",
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <div
              className="absolute -inset-[150%] opacity-100 animate-[spin_5s_linear_infinite]"
              style={{
                background: "conic-gradient(from 90deg, transparent 20%, rgba(250, 204, 21, 1) 48%, rgba(255, 255, 255, 1) 50%, transparent 50%, transparent 70%, rgba(250, 204, 21, 1) 98%, rgba(255, 255, 255, 1) 100%)",
              }}
            />
          </div>
        </>
      )}

      <div 
        className="relative z-10 h-full w-full rounded-[2rem] bg-[#0c0c1a]/80 backdrop-blur-2xl"
      >
        {children}
      </div>
    </div>
  );
};

interface TactlinkSupportSectionProps {
  noBackground?: boolean;
  noDownloads?: boolean;
  scannerMode?: boolean;
  compactMode?: boolean;
}

export default function TactlinkSupportSection({ noBackground = false, noDownloads = false, scannerMode = false, compactMode = false }: TactlinkSupportSectionProps = {}) {
  const language: string = "id";

  const isCompact = scannerMode || compactMode;

  const compactLayout = (
    <BorderGlow animated={!scannerMode} className="w-full">
      <div className="w-full flex flex-col bg-[#070713] p-3 rounded-3xl relative overflow-hidden border border-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.05)]">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-xl p-1.5 flex shrink-0 shadow-lg items-center justify-center">
              <Image src={assetPath("/logo/tactlink.png")} alt="Tactlink" width={100} height={100} className="h-full w-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[7px] text-yellow-300 font-bold uppercase tracking-wider mb-0.5">
                {language === "en" ? "Website Supported By" : "Situs Web Didukung Oleh"}
              </p>
              <h2 className="text-[11px] sm:text-xs font-black leading-tight text-white">
                {language === "en" ? "Connect smarter with" : "Terhubung dengan"}{" "}
                <span className="text-yellow-400">Tactlink</span>
              </h2>
              <p className="text-[8px] sm:text-[9px] text-white/50 leading-[1.3] mt-1 max-w-[200px]">
                {language === "en" 
                  ? "This official website is supported by Tactlink. Download the app to experience smarter digital networking." 
                  : "Situs web ini didukung oleh Tactlink. Unduh aplikasi untuk merasakan jaringan digital cerdas."}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2.5">
                <a href={tactlinkLinks.appStore} target="_blank" rel="noopener noreferrer" className="flex items-center bg-white rounded-lg px-2 py-1 h-7 hover:bg-yellow-300 transition">
                  <div className="h-4 w-4 mr-1 text-black flex items-center justify-center"><AppleIcon /></div>
                  <div className="text-left leading-none"><p className="text-[5px] font-bold text-black/60 uppercase">Download on the</p><p className="text-[7px] font-black text-black">App Store</p></div>
                </a>
                <a href={tactlinkLinks.playStore} target="_blank" rel="noopener noreferrer" className="flex items-center bg-white rounded-lg px-2 py-1 h-7 hover:bg-yellow-300 transition">
                  <div className="h-4 w-4 mr-1 flex items-center justify-center"><PlayStoreIcon /></div>
                  <div className="text-left leading-none"><p className="text-[5px] font-bold text-black/60 uppercase">Get it on</p><p className="text-[7px] font-black text-black">Google Play</p></div>
                </a>
              </div>
            </div>
          </div>
          
          <a href={tactlinkLinks.website} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center justify-center h-6 px-2.5 rounded-full bg-white/10 border border-white/20 text-[8px] font-bold text-white hover:bg-white/20 transition ml-2 mt-1">
            Visit <ExternalLink size={8} className="ml-1" />
          </a>
        </div>
        
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10 text-[7.5px] text-white/50 font-bold">
            <p>{language === "en" ? "10,000+ Cards Shared" : "10.000+ Kartu Dibagikan"}</p>
            <div className="h-1 w-1 bg-white/20 rounded-full" />
            <p className="flex items-center gap-1"><Globe2 size={8} /> {language === "en" ? "Available in 8 Countries" : "Tersedia di 8 Negara"}</p>
        </div>
      </div>
    </BorderGlow>
  );

  if (isCompact) {
    return compactLayout;
  }

  const desktopLayout = (
    <BorderGlow className="w-full">
      <div className={`w-full overflow-hidden rounded-[2rem] ${noBackground ? 'p-5 md:p-6' : 'p-4 md:p-6 md:p-8 lg:p-4 md:p-6 md:p-10'}`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className={`inline-flex rounded-full border border-yellow-300/20 bg-yellow-400/10 font-black uppercase tracking-[0.22em] text-yellow-300 ${noBackground ? 'mb-3 px-2 py-1 text-[8px]' : 'mb-4 px-3 py-1.5 text-xs'}`}>
              {language === "en" ? "Website Supported By" : "Situs Web Didukung Oleh"}
            </p>

            <div className={`flex flex-col gap-4 sm:flex-row sm:items-center ${noBackground ? '' : 'gap-6'}`}>
              <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-xl ${noBackground ? 'h-16 w-16' : 'h-28 w-28 sm:h-32 sm:w-32'}`}>
                <Image
                  src={assetPath("/logo/tactlink.png")}
                  alt="Tactlink"
                  width={180}
                  height={180}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>

              <div className="min-w-0">
                <h2 className={`font-black leading-tight ${noBackground ? 'text-lg md:text-xl' : 'max-w-3xl text-3xl md:text-3xl md:text-3xl md:text-4xl lg:text-3xl md:text-5xl'}`}>
                  {language === "en" ? "Connect smarter with" : "Terhubung lebih cerdas dengan"}{" "}
                  <span className="text-yellow-400">Tactlink</span>
                </h2>

                <p className={`mt-2 max-w-2xl text-white/60 ${noBackground ? 'text-xs leading-5' : 'leading-8'}`}>
                  {language === "en"
                    ? "This official website is supported by Tactlink. Download the app to experience smarter digital networking and digital business cards."
                    : "Situs web resmi ini didukung oleh Tactlink. Unduh aplikasi untuk merasakan jaringan digital dan kartu nama bisnis digital yang lebih cerdas."}
                </p>
              </div>
            </div>
          </div>

          <a
            href={tactlinkLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 font-black text-white transition hover:bg-white/15 hover:text-yellow-300 ${noBackground ? 'px-4 py-2 text-xs' : 'px-6 py-4'}`}
          >
            {language === "en" ? "Visit Tactlink" : "Kunjungi Tactlink"}
            <ExternalLink size={noBackground ? 14 : 16} />
          </a>
        </div>

        {!noDownloads && (
          <div className={`${noBackground ? 'mt-6' : 'mt-9'}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center ${noBackground ? 'gap-3' : 'gap-4'}`}>
              <a
                href={tactlinkLinks.appStore}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Tactlink on the App Store"
                className={`flex w-full items-center justify-center rounded-[1.6rem] bg-white text-[#070713] shadow-lg ring-1 ring-black/10 transition hover:bg-yellow-300 ${noBackground ? 'h-14 px-5 sm:w-[180px]' : 'h-[76px] px-7 sm:w-[330px]'}`}
              >
                <AppStoreBadge compact={noBackground} />
              </a>

              <a
                href={tactlinkLinks.playStore}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Tactlink on Google Play"
                className={`flex w-full items-center justify-center rounded-[1.6rem] bg-white text-[#070713] shadow-lg ring-1 ring-black/10 transition hover:bg-yellow-300 ${noBackground ? 'h-14 px-5 sm:w-[180px]' : 'h-[76px] px-7 sm:w-[330px]'}`}
              >
                <PlayStoreBadge compact={noBackground} />
              </a>
            </div>

            <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 ${noBackground ? 'mt-5' : 'mt-7'}`}>
              <p className={`font-black text-white ${noBackground ? 'text-sm' : 'text-lg'}`}>
                {language === "en" ? "10,000+ Cards Shared" : "10.000+ Kartu Dibagikan"}
              </p>

              <div className="hidden h-1.5 w-1.5 rounded-full bg-white/25 sm:block" />

              <p className={`inline-flex items-center gap-2 font-bold text-white/45 ${noBackground ? 'text-sm' : 'text-lg'}`}>
                <Globe2 size={noBackground ? 16 : 22} />
                {language === "en" ? "Available in 8 Countries" : "Tersedia di 8 Negara"}
              </p>
            </div>
          </div>
        )}
      </div>
    </BorderGlow>
  );

  if (noBackground) {
    return desktopLayout;
  }

  return (
    <section className="relative overflow-hidden bg-[#070713] px-4 py-16 text-white md:py-20 rounded-[2rem] max-w-7xl mx-auto mb-10 border border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#facc151f,transparent_32%),radial-gradient(circle_at_bottom_right,#26c6da22,transparent_35%)]" />
      <div className="relative z-10">
        {desktopLayout}
      </div>
    </section>
  );
}
