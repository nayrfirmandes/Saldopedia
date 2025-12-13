import dynamic from "next/dynamic";

const RateCalculator = dynamic(() => import("@/components/rate-calculator"), {
  ssr: true,
});

export const metadata = {
  title: "Kalkulator Rate Crypto, PayPal & Skrill | Hitung Estimasi Real-Time | Saldopedia",
  description: "Kalkulator rate otomatis untuk jual beli cryptocurrency, PayPal, dan Skrill mulai Rp 25.000. Rate real-time dari CoinGecko, transparan dan akurat. Lihat estimasi sebelum transaksi!",
  keywords: [
    "kalkulator crypto indonesia",
    "konversi bitcoin rupiah",
    "kalkulator paypal",
    "kalkulator skrill",
    "hitung rate crypto",
    "konversi usdt rupiah",
    "rate calculator cryptocurrency"
  ],
  alternates: {
    canonical: "https://saldopedia.com/calculator",
  },
  openGraph: {
    title: "Kalkulator Rate Crypto, PayPal & Skrill | Saldopedia",
    description: "Hitung estimasi transaksi crypto, PayPal, Skrill dengan rate real-time. Akurat dan transparan.",
    url: "https://saldopedia.com/calculator",
    type: "website",
  },
};

export default function CalculatorPage() {
  return (
    <>
      <RateCalculator />
    </>
  );
}
