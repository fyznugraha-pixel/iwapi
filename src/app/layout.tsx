import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Registrasi - Bongkar Rahasia Cuan Lewat TikTok Social Commerce',
  description: 'Form pendaftaran acara Bongkar Rahasia Cuan Lewat TikTok Social Commerce bersama Tim TikTok Official Indonesia',
  icons: {
    icon: '/logo/iwapi.png',
    apple: '/logo/iwapi.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  )
}
