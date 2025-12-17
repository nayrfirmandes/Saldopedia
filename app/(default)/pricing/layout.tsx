import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harga & Biaya Transaksi - Rate Crypto, PayPal, Skrill Indonesia",
  description: "Cek rate dan biaya transaksi jual beli cryptocurrency, PayPal, dan Skrill di Saldopedia. Harga transparan, tanpa biaya tersembunyi, update real-time. Beli crypto +5%, jual crypto -5%.",
  keywords: [
    "harga crypto indonesia",
    "rate bitcoin hari ini",
    "biaya transaksi paypal",
    "fee skrill indonesia",
    "rate usdt rupiah",
    "harga ethereum indonesia",
    "rate jual beli crypto",
    "biaya exchanger crypto"
  ],
  alternates: {
    canonical: "https://saldopedia.com/pricing",
  },
  openGraph: {
    title: "Harga & Biaya Transaksi Crypto, PayPal, Skrill | Saldopedia",
    description: "Rate dan biaya transaksi jual beli crypto, PayPal, Skrill. Harga transparan dan update real-time.",
    url: "https://saldopedia.com/pricing",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
