"use client";

import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId, enUS as localeEn } from "date-fns/locale";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import Image from "next/image";

type Transaction = {
  id: number;
  transactionId: string;
  userName: string;
  serviceType: string;
  cryptoSymbol: string | null;
  cryptoNetwork: string | null;
  transactionType: string;
  amountIdr: string;
  amountForeign: string | null;
  status: string;
  createdAt: Date;
  walletAddress: string | null;
  maskedEmail: string | null;
};

const CRYPTO_ICON_MAP: Record<string, { src: string; ext: string }> = {
  BTC: { src: "btc", ext: "webp" },
  ETH: { src: "eth", ext: "png" },
  USDT: { src: "usdt", ext: "png" },
  USDC: { src: "usdc", ext: "png" },
  BNB: { src: "bnb", ext: "webp" },
  SOL: { src: "sol", ext: "webp" },
  XRP: { src: "xrp", ext: "webp" },
  TRX: { src: "trx", ext: "webp" },
  DOGE: { src: "doge", ext: "webp" },
  TON: { src: "ton", ext: "webp" },
  MATIC: { src: "matic", ext: "webp" },
  ADA: { src: "ada", ext: "png" },
  SHIB: { src: "shib", ext: "webp" },
  DOGS: { src: "dogs", ext: "webp" },
  FLOKI: { src: "floki", ext: "webp" },
  CAKE: { src: "cake", ext: "webp" },
  TKO: { src: "tko", ext: "webp" },
  NOTCOIN: { src: "notcoin", ext: "webp" },
  BABYDOGE: { src: "babydoge", ext: "webp" },
};

const getCryptoIconSrc = (symbol: string | null): string => {
  if (!symbol) return "/images/crypto/btc.webp";
  const iconInfo = CRYPTO_ICON_MAP[symbol.toUpperCase()];
  if (iconInfo) {
    return `/images/crypto/${iconInfo.src}.${iconInfo.ext}`;
  }
  return "/images/crypto/btc.webp";
};

const hydrateTransaction = (tx: any): Transaction => ({
  ...tx,
  createdAt: typeof tx.createdAt === 'string' ? new Date(tx.createdAt) : tx.createdAt,
});

const formatAmount = (amount: string | null, decimals: number = 0) => {
  if (!amount) return "0";
  return parseFloat(amount).toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatCryptoAmount = (amount: string | null) => {
  if (!amount) return "0";
  const num = parseFloat(amount);
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
  if (num >= 10000) return (num / 1000).toFixed(0) + "K";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "K";
  if (num >= 100) return num.toFixed(0);
  if (num >= 1) return num.toFixed(2).replace(/\.00$/, '');
  if (num >= 0.01) return num.toFixed(4).replace(/\.?0+$/, '');
  return num.toFixed(6).replace(/\.?0+$/, '');
};

const getServiceIconSrc = (serviceType: string, cryptoSymbol: string | null): string => {
  if (serviceType === "cryptocurrency") {
    return getCryptoIconSrc(cryptoSymbol);
  }
  if (serviceType === "paypal") {
    return "/images/paypal-logo.png";
  }
  return "/images/skrill-logo.png";
};

const getShortNetwork = (network: string | null) => {
  if (!network) return null;
  if (network.includes("TRC")) return "TRC20";
  if (network.includes("ERC")) return "ERC20";
  if (network.includes("BSC") || network.includes("BEP")) return "BEP20";
  if (network.includes("Solana")) return "SOL";
  if (network.includes("TON")) return "TON";
  if (network.includes("Polygon")) return "POL";
  if (network.includes("Tron")) return "TRC20";
  return network.split(" ")[0];
};

const truncateAddress = (address: string | null) => {
  if (!address) return null;
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasNewTransaction, setHasNewTransaction] = useState(false);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { language } = useLanguage();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let shouldReconnect = true;

    const connectSSE = () => {
      if (!shouldReconnect) return;
      const eventSource = new EventSource("/api/transactions/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => { setIsLoading(false); };

      eventSource.onmessage = (event) => {
        setIsLoading(false);
        const eventData = JSON.parse(event.data);
        
        if (eventData.type === "new") {
          const newTx = hydrateTransaction(eventData.transaction);
          if (!isInitialLoad) {
            setHasNewTransaction(true);
            setTimeout(() => setHasNewTransaction(false), 600);
          }
          setTransactions((prev) => {
            const updated = [newTx, ...prev].slice(0, 5);
            if (isInitialLoad && updated.length >= 3) setTimeout(() => setIsInitialLoad(false), 500);
            return updated;
          });
        } else if (eventData.type === "status_update") {
          const updatedTx = hydrateTransaction(eventData.transaction);
          setStatusChangeId(updatedTx.transactionId);
          setTimeout(() => setStatusChangeId(null), 600);
          setTransactions((prev) => prev.map((tx) => tx.transactionId === updatedTx.transactionId ? updatedTx : tx));
        }
      };

      eventSource.onerror = () => {
        setIsLoading(false);
        eventSource.close();
        if (shouldReconnect) reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    };

    const handleVisibility = () => {
      if (document.hidden) {
        eventSourceRef.current?.close();
      } else {
        connectSSE();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    connectSSE();

    return () => {
      shouldReconnect = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(reconnectTimeout);
      eventSourceRef.current?.close();
    };
  }, []);

  const getStatusConfig = useMemo(() => (status: string) => {
    const configs: Record<string, any> = {
      completed: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
      processing: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
      pending: { icon: AlertCircle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
    };
    return configs[status] || configs.pending;
  }, []);

  const formatRelativeTime = useCallback((date: Date | string) => {
    if (!mounted) return "";
    const locale = language === "id" ? localeId : localeEn;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  }, [language, mounted]);

  const visibleTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const itemHeight = 54;
  const gap = 8;

  return (
    <div className="relative" style={{ height: `${5 * itemHeight + 4 * gap}px` }}>
      {visibleTransactions.map((tx, index) => {
        const iconSrc = getServiceIconSrc(tx.serviceType, tx.cryptoSymbol);
        const isBuy = tx.transactionType === "buy";
        const statusConfig = getStatusConfig(tx.status);
        const StatusIcon = statusConfig.icon;
        const isAnimating = statusChangeId === tx.transactionId;
        const shortNetwork = getShortNetwork(tx.cryptoNetwork);

        const animation = isAnimating 
          ? "gentlePulse 0.8s ease" 
          : hasNewTransaction && index === 0 
            ? "fadeSlideIn 0.5s ease" 
            : isInitialLoad 
              ? `initialFadeIn 0.35s ease ${index * 60}ms both` 
              : undefined;

        const topPosition = index * (itemHeight + gap);

        return (
          <div
            key={`${tx.transactionId}-${tx.id}`}
            className="absolute left-0 right-0 group p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-700"
            style={{ 
              animation,
              top: `${topPosition}px`,
              transition: 'top 0.3s ease-out',
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full overflow-hidden border border-gray-100 dark:border-gray-800">
                <Image 
                  src={iconSrc} 
                  alt={tx.cryptoSymbol || tx.serviceType} 
                  width={24} 
                  height={24} 
                  className="object-contain"
                  loading="eager"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {isBuy ? (language === "id" ? "Beli" : "Buy") : (language === "id" ? "Jual" : "Sell")}{" "}
                    {tx.cryptoSymbol || (tx.serviceType === "paypal" ? "PayPal" : "Skrill")}
                  </h3>
                  {shortNetwork && (
                    <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {shortNetwork}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {tx.status === "pending" ? (language === "id" ? "Menunggu" : "Pending") : tx.status === "processing" ? (language === "id" ? "Diproses" : "Processing") : (language === "id" ? "Selesai" : "Done")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span className="truncate max-w-[80px] sm:max-w-none">{tx.userName}</span>
                  {tx.serviceType === "cryptocurrency" && tx.walletAddress ? (
                    <>
                      <span>•</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400 truncate max-w-[70px] sm:max-w-[100px]">
                        {truncateAddress(tx.walletAddress)}
                      </span>
                    </>
                  ) : tx.maskedEmail ? (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[80px] sm:max-w-none">{tx.maskedEmail}</span>
                    </>
                  ) : null}
                  <span>•</span>
                  <span>{formatRelativeTime(tx.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                {tx.amountForeign && (
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-xs sm:text-sm font-semibold ${isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {isBuy ? "+" : "-"}
                      {tx.serviceType === "cryptocurrency" ? formatCryptoAmount(tx.amountForeign) : formatAmount(tx.amountForeign, 0)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {tx.serviceType === "cryptocurrency" ? tx.cryptoSymbol : "USD"}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-xs sm:text-sm font-semibold ${!isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {!isBuy ? "+" : "-"}Rp {formatAmount(tx.amountIdr)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
