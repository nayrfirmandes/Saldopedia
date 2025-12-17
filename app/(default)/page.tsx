import { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/hero-home";
import StructuredData from "@/components/structured-data";
import BusinessCategories from "@/components/business-categories";

const Cta = dynamic(() => import("@/components/cta"), { ssr: true });
const LargeTestimonial = dynamic(() => import("@/components/large-testimonial"), { ssr: true });
const TestimonialsCarousel = dynamic(() => import("@/components/testimonials-carousel"), { ssr: true });
const TransactionFeedSection = dynamic(() => import("@/components/transaction-feed-section"), { ssr: true });
export const revalidate = 180;

export const metadata = {
  title: "Saldopedia - Jual Beli Cryptocurrency, PayPal & Skrill Mulai 25 Ribu",
  description: "Jual beli cryptocurrency eceran, PayPal, dan Skrill mulai Rp 25.000. Beli Bitcoin, USDT, Ethereum tanpa minimal besar. Convert PayPal & Skrill ke Rupiah rate terbaik. Proses 5-15 menit, aman, terpercaya sejak 2020.",
  keywords: [
    "jual beli bitcoin eceran",
    "beli crypto murah",
    "jual saldo paypal",
    "tukar skrill ke rupiah",
    "cryptocurrency indonesia",
    "beli usdt murah",
    "exchanger crypto terpercaya",
    "jual beli crypto tanpa minimal",
    "convert paypal ke bank",
    "bitcoin 25 ribu",
    "crypto eceran indonesia",
    "paypal exchanger indonesia",
    "skrill exchanger indonesia"
  ],
  alternates: {
    canonical: "https://saldopedia.com",
  },
  openGraph: {
    title: "Saldopedia - Jual Beli Cryptocurrency, PayPal & Skrill Mulai 25 Ribu",
    description: "Beli Bitcoin, USDT, Ethereum mulai Rp 25.000. Convert PayPal & Skrill ke Rupiah dengan rate terbaik. Proses 5-15 menit.",
    url: "https://saldopedia.com",
    type: "website",
  },
};

function TestimonialSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-8"></div>
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-8"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <StructuredData />
      <Hero />
      <BusinessCategories />
      <Suspense fallback={<TestimonialSkeleton />}>
        <LargeTestimonial />
      </Suspense>
      <Suspense fallback={<CarouselSkeleton />}>
        <TestimonialsCarousel />
      </Suspense>
      <Suspense fallback={<TransactionSkeleton />}>
        <TransactionFeedSection />
      </Suspense>
      <Cta />
    </>
  );
}
