export const CRYPTO_ICON_MAP: Record<string, { src: string; ext: string }> = {
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

export function getCryptoIconSrc(symbol: string | null): string {
  if (!symbol) return "/images/crypto/btc.webp";
  const iconInfo = CRYPTO_ICON_MAP[symbol.toUpperCase()];
  if (iconInfo) {
    return `/images/crypto/${iconInfo.src}.${iconInfo.ext}`;
  }
  return "/images/crypto/btc.webp";
}

export function getServiceIconSrc(serviceType: string, cryptoSymbol: string | null): string {
  if (serviceType === "cryptocurrency") {
    return getCryptoIconSrc(cryptoSymbol);
  }
  if (serviceType === "paypal") {
    return "/images/paypal-logo.png";
  }
  return "/images/skrill-logo.png";
}
