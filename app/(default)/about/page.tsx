import type { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
  title: "Tentang Kami - Saldopedia | Exchanger Crypto, PayPal & Skrill Terpercaya",
  description: "Saldopedia adalah platform jual beli cryptocurrency, PayPal, dan Skrill terpercaya sejak 2020. Melayani ribuan transaksi dengan keamanan berlapis. Minimal transaksi Rp 25.000.",
  keywords: [
    "tentang saldopedia",
    "exchanger crypto terpercaya",
    "jual beli paypal aman",
    "skrill exchanger indonesia",
    "platform crypto indonesia"
  ],
  alternates: {
    canonical: "https://saldopedia.com/about",
  },
  openGraph: {
    title: "Tentang Kami | Saldopedia",
    description: "Platform jual beli cryptocurrency, PayPal, dan Skrill terpercaya sejak 2020. Keamanan berlapis, proses cepat.",
    url: "https://saldopedia.com/about",
    type: "website",
  },
};

export default function About() {
  return <AboutContent />;
}
