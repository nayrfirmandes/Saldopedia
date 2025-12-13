import { Metadata } from "next";
import CryptoContent from "./crypto-content";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo";

const cryptoFaqs = [
  {
    question: "Cryptocurrency apa saja yang bisa ditransaksikan?",
    answer: "Bitcoin (BTC), Ethereum (ETH), USDT, BNB, Solana (SOL), MATIC, dan cryptocurrency populer lainnya. Rate mengikuti harga pasar real-time."
  },
  {
    question: "Berapa minimal transaksi?",
    answer: "Minimal Rp 25.000 untuk semua cryptocurrency. Cocok untuk pemula yang ingin mulai investasi dengan modal kecil."
  },
  {
    question: "Bagaimana cara mendapatkan rate terbaik?",
    answer: "Rate kami mengikuti harga pasar global. Beli crypto +5%, jual crypto -5% dari harga pasar. Tanpa biaya tersembunyi."
  },
  {
    question: "Berapa lama proses transaksi?",
    answer: "Setelah pembayaran dikonfirmasi, crypto dikirim ke wallet Anda dalam 5-15 menit. Aktif 24/7."
  }
];

export const metadata: Metadata = {
  title: "Jual Beli Cryptocurrency Eceran - Bitcoin, USDT, Ethereum Mulai 25 Ribu | Saldopedia",
  description: "Jual beli Bitcoin, USDT, Ethereum eceran mulai Rp 25.000. Rate real-time dari CoinGecko, proses otomatis 5-15 menit, 19+ cryptocurrency tersedia. Lebih murah dari Indodax & Tokocrypto untuk pembelian kecil.",
  keywords: [
    "jual beli bitcoin eceran",
    "beli usdt murah",
    "jual ethereum indonesia",
    "crypto eceran indonesia",
    "beli bitcoin 25 ribu",
    "jual beli crypto murah",
    "buy sell cryptocurrency indonesia",
    "tukar bitcoin ke rupiah",
    "beli crypto tanpa minimal",
    "jual crypto cepat",
    "exchanger crypto indonesia",
    "beli usdt eceran",
    "jual bitcoin tanpa kyc",
    "crypto terpercaya indonesia"
  ],
  alternates: {
    canonical: "https://saldopedia.com/crypto",
  },
  openGraph: {
    title: "Jual Beli Cryptocurrency Eceran Mulai 25 Ribu | Saldopedia",
    description: "Beli Bitcoin, USDT, Ethereum mulai Rp 25.000. Rate real-time, proses 5-15 menit. Lebih mudah dari exchange besar.",
    url: "https://saldopedia.com/crypto",
    type: "website",
  },
};

export default function CryptoPage() {
  return (
    <>
      <ServiceSchema
        name="Jual Beli Cryptocurrency Eceran Indonesia"
        description="Layanan jual beli Bitcoin, USDT, Ethereum, dan 19+ cryptocurrency lainnya mulai Rp 25.000. Proses otomatis 5-15 menit dengan rate real-time."
        url="https://saldopedia.com/crypto"
        serviceType="CryptocurrencyExchange"
      />
      <BreadcrumbSchema
        items={[
          { name: "Beranda", url: "https://saldopedia.com" },
          { name: "Cryptocurrency", url: "https://saldopedia.com/crypto" }
        ]}
      />
      <FAQSchema faqs={cryptoFaqs} />
      <CryptoContent />
    </>
  );
}
