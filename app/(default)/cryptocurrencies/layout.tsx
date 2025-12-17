import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Cryptocurrency - Bitcoin, USDT, Ethereum & 100+ Crypto | Saldopedia",
  description: "Lihat daftar lengkap cryptocurrency yang tersedia di Saldopedia. Bitcoin, USDT, Ethereum, BNB, Solana, dan 100+ altcoin lainnya dengan harga real-time dari CoinGecko. Beli mulai Rp 25.000.",
  keywords: [
    "daftar cryptocurrency indonesia",
    "list crypto tersedia",
    "harga bitcoin hari ini",
    "harga usdt rupiah",
    "harga ethereum indonesia",
    "altcoin indonesia",
    "crypto populer 2024",
    "daftar coin bisa dibeli"
  ],
  alternates: {
    canonical: "https://saldopedia.com/cryptocurrencies",
  },
  openGraph: {
    title: "Daftar Cryptocurrency - 100+ Coin Tersedia | Saldopedia",
    description: "100+ cryptocurrency tersedia: Bitcoin, USDT, Ethereum, dan altcoin lainnya dengan harga real-time.",
    url: "https://saldopedia.com/cryptocurrencies",
    type: "website",
  },
};

export default function CryptocurrenciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
