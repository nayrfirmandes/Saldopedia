import { Metadata } from "next";
import SkrillContent from "./skrill-content";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo";

const skrillFaqs = [
  {
    question: "Berapa min dan maks transaksi Skrill?",
    answer: "Min $20, maks $5.000 per transaksi untuk jual maupun beli Skrill."
  },
  {
    question: "Bagaimana rate tier bekerja?",
    answer: "Makin besar transaksi, makin bagus rate. Jual: $20-$49 = Rp 12.000/USD sampai $2.000-$5.000 = Rp 15.299/USD. Beli juga tier, rate makin murah di volume besar."
  },
  {
    question: "Apakah aman jual beli Skrill di sini?",
    answer: "Sangat aman! Keamanan berlapis dan sudah melayani ribuan transaksi. Proses transparan melalui customer service."
  },
  {
    question: "Berapa lama proses transaksi?",
    answer: "Setelah pembayaran dikonfirmasi, saldo Skrill dikirim dalam 5-15 menit. Aktif 24/7."
  },
  {
    question: "Bagaimana sistem pembayaran order?",
    answer: "Order dibayar menggunakan saldo Saldopedia. Top up saldo di menu Deposit, lalu gunakan untuk order. Hasil penjualan masuk ke saldo dan bisa di-withdraw."
  }
];

export const metadata: Metadata = {
  title: "Jual Beli Saldo Skrill Indonesia - Rate Terbaik 2024 | Saldopedia",
  description: "Jual beli saldo Skrill dengan rate terbaik mulai Rp 12.000/USD. Proses 5-15 menit, transfer ke semua bank & e-wallet Indonesia. Exchanger Skrill terpercaya sejak 2020.",
  keywords: [
    "jual saldo skrill",
    "beli skrill indonesia",
    "tukar skrill ke rupiah",
    "convert skrill ke bank",
    "jual beli skrill murah",
    "skrill exchanger indonesia",
    "tukar skrill cepat",
    "jual skrill rate tinggi",
    "beli saldo skrill legal",
    "skrill to rupiah",
    "withdraw skrill indonesia",
    "top up skrill murah",
    "jasa convert skrill",
    "exchanger skrill terpercaya"
  ],
  alternates: {
    canonical: "https://saldopedia.com/skrill",
  },
  openGraph: {
    title: "Jual Beli Saldo Skrill - Rate Terbaik Indonesia | Saldopedia",
    description: "Convert Skrill ke Rupiah dengan rate tinggi. Proses 5-15 menit ke semua bank & e-wallet.",
    url: "https://saldopedia.com/skrill",
    type: "website",
  },
};

export default function SkrillPage() {
  return (
    <>
      <ServiceSchema
        name="Jual Beli Saldo Skrill Indonesia"
        description="Layanan jual beli dan convert saldo Skrill ke Rupiah dengan rate terbaik. Proses 5-15 menit, transfer ke semua bank dan e-wallet Indonesia."
        url="https://saldopedia.com/skrill"
        serviceType="CurrencyExchange"
      />
      <BreadcrumbSchema
        items={[
          { name: "Beranda", url: "https://saldopedia.com" },
          { name: "Skrill", url: "https://saldopedia.com/skrill" }
        ]}
      />
      <FAQSchema faqs={skrillFaqs} />
      <SkrillContent />
    </>
  );
}
