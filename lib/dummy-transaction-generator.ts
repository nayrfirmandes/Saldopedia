import { InsertTransaction } from "@/shared/schema";
import { PAYPAL_SKRILL_RATES, LIMITS, CryptoConfig, RateTier } from "./rates";
import { DEFAULT_NETWORK_FEES } from "./network-fees";

const INDONESIAN_NAMES = [
  "Ahmad", "Budi", "Siti", "Dewi", "Eka", "Fajar", "Gita", "Hendra",
  "Indah", "Joko", "Kartika", "Lina", "Made", "Nur", "Oki", "Putri",
  "Rini", "Sandi", "Tari", "Umar", "Vina", "Wawan", "Yuni", "Zainal",
  "Adi", "Agus", "Ayu", "Bayu", "Citra", "Dian", "Eko", "Fitri",
  "Hadi", "Iwan", "Jaya", "Kiki", "Lukman", "Maya", "Nina", "Oka",
  "Prima", "Rani", "Sari", "Tono", "Ulfa", "Vera", "Yoga", "Zaki",
  "Andi", "Bella", "Candra", "Deni", "Evi", "Feri", "Gina", "Hani",
  "Irfan", "Juni", "Kris", "Lisa", "Mira", "Nanda", "Oni", "Ratna",
  "Surya", "Tika", "Umi", "Wahyu", "Yusuf", "Arif", "Bagus", "Cahya",
  "Dimas", "Elsa", "Faisal", "Galih", "Hana", "Ilham", "Jasmine", "Kevin",
  "Rizky", "Anisa", "Fadli", "Mega", "Reza", "Wulan", "Dodi", "Rina",
  "Angga", "Sinta", "Taufik", "Melati", "Bambang", "Laras", "Prasetyo", "Tiara",
  "Hendro", "Shinta", "Gunawan", "Wati", "Nugroho", "Lia", "Santoso", "Dinda",
  "Setiawan", "Aulia", "Kurniawan", "Rahma", "Hidayat", "Cici", "Saputra", "Intan",
  "Febri", "Yolanda", "Alfian", "Novita", "Ridwan", "Tania", "Haris", "Sarah",
  "Andika", "Nabila", "Ferdi", "Karin", "Gilang", "Sherly", "Aditya", "Dwi",
  "Rendi", "Annisa", "Teguh", "Fitriani", "Bintang", "Kartini", "Danu", "Wulandari",
  "Sigit", "Puspa", "Danang", "Mutiara", "Heru", "Bunga", "Jefri", "Permata",
  "Rio", "Amanda", "Nico", "Sandra", "Yogi", "Puspita", "Ricky", "Lestari",
  "Hengky", "Widya", "Teddy", "Nurul", "Donny", "Hartini", "Aris", "Sulastri"
];

const LAST_NAME_INITIALS = [
  "R***", "S***", "W***", "P***", "A***", "M***", "K***", "H***",
  "D***", "L***", "F***", "N***", "T***", "C***", "B***", "G***",
  "Y***", "Z***", "E***", "I***", "O***", "U***", "J***", "V***",
  "R**i", "S**a", "W**o", "P**i", "A**u", "M**a", "K**n", "H**i",
  "D**a", "L**o", "N**i", "T**o", "B**u", "G**a", "Y**a", "Z**i",
  "R**n", "S**o", "W**i", "P**a", "A**i", "M**o", "K**a", "H**o",
  "Su***", "Pu***", "Wi***", "Ku***", "Ha***", "Sa***", "Nu***", "Bu***",
  "Pr***", "An***", "De***", "Fi***", "Ra***", "In***", "Yu***", "Se***",
  "Wa**n", "Ha**t", "Su**o", "Pu**i", "Wi**a", "Ra**a", "Sa**i", "Nu**l",
  "Ri**i", "Le**i", "Da**i", "Ma**a", "Fa**h", "Ja**a", "Ca**a", "Ta**a"
];

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

const WALLET_PREFIXES: { [key: string]: string[] } = {
  BTC: ["bc1q", "bc1p", "1", "3"],
  ETH: ["0x"],
  USDT: ["T", "0x", ""],
  USDC: ["", "0x"],
  BNB: ["0x", "bnb1"],
  SOL: [""],
  XRP: ["r"],
  TRX: ["T"],
  DOGE: ["D"],
  TON: ["UQ", "EQ"],
  MATIC: ["0x"],
  ADA: ["addr1"],
  SHIB: ["0x"],
  DOGS: ["UQ", "EQ"],
};

function generateWalletAddress(symbol: string, network?: string): string {
  const prefixes = WALLET_PREFIXES[symbol] || ["0x"];
  let prefix = randomElement(prefixes);
  
  if (symbol === "USDT" || symbol === "USDC") {
    if (network?.includes("TRC") || network?.includes("Tron")) prefix = "T";
    else if (network?.includes("Solana")) prefix = "";
    else prefix = "0x";
  }
  
  const chars = "abcdef0123456789";
  const alphaChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789";
  
  let address = prefix;
  const useAlpha = ["SOL", "ADA", "TON", "DOGS"].includes(symbol) || prefix === "";
  const charSet = useAlpha ? alphaChars : chars;
  const length = useAlpha ? randomInt(32, 44) : randomInt(30, 40);
  
  for (let i = 0; i < length; i++) {
    address += charSet[randomInt(0, charSet.length - 1)];
  }
  
  return address;
}

function generateMaskedEmail(firstName: string): string {
  const domain = randomElement(EMAIL_DOMAINS);
  const firstChar = firstName.charAt(0).toLowerCase();
  const emailLength = randomInt(2, 4);
  return `${firstChar}${"*".repeat(emailLength)}@${domain}`;
}

const CRYPTOCURRENCIES = [
  { symbol: "BTC", networks: ["Bitcoin"], minAmount: 0.0001, maxAmount: 0.02, weight: 20 },
  { symbol: "ETH", networks: ["Ethereum (ERC-20)"], minAmount: 0.005, maxAmount: 0.3, weight: 18 },
  { symbol: "USDT", networks: ["TRC-20 (Tron)", "BSC (BEP-20)", "Solana"], minAmount: 10, maxAmount: 1000, weight: 28 },
  { symbol: "USDC", networks: ["Solana", "BSC (BEP-20)"], minAmount: 10, maxAmount: 600, weight: 8 },
  { symbol: "BNB", networks: ["BSC (BEP-20)"], minAmount: 0.02, maxAmount: 2, weight: 12 },
  { symbol: "SOL", networks: ["Solana"], minAmount: 0.15, maxAmount: 10, weight: 15 },
  { symbol: "XRP", networks: ["XRP Ledger"], minAmount: 20, maxAmount: 1000, weight: 8 },
  { symbol: "TRX", networks: ["Tron (TRC-20)"], minAmount: 100, maxAmount: 8000, weight: 6 },
  { symbol: "DOGE", networks: ["Dogecoin"], minAmount: 50, maxAmount: 5000, weight: 5 },
  { symbol: "TON", networks: ["TON Network"], minAmount: 2, maxAmount: 200, weight: 7 },
  { symbol: "MATIC", networks: ["Polygon"], minAmount: 10, maxAmount: 1000, weight: 4 },
  { symbol: "ADA", networks: ["Cardano"], minAmount: 30, maxAmount: 2000, weight: 3 },
  { symbol: "SHIB", networks: ["BSC (BEP-20)"], minAmount: 500000, maxAmount: 80000000, weight: 4 },
  { symbol: "DOGS", networks: ["TON Network"], minAmount: 500, maxAmount: 80000, weight: 3 },
];

const SYMBOL_TO_ID: { [key: string]: string } = {
  BTC: "bitcoin", ETH: "ethereum", USDT: "tether", USDC: "usd-coin",
  BNB: "binancecoin", SOL: "solana", XRP: "ripple", TRX: "tron",
  DOGE: "dogecoin", TON: "the-open-network", MATIC: "polygon-ecosystem-token", 
  ADA: "cardano", SHIB: "shiba-inu", DOGS: "dogs-2"
};


export interface DynamicRatesConfig {
  cryptoConfig: CryptoConfig;
  paypalRates: { convert: RateTier[]; topup: RateTier[] };
  skrillRates: { convert: RateTier[]; topup: RateTier[] };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function weightedRandomCrypto() {
  const totalWeight = CRYPTOCURRENCIES.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalWeight;
  for (const crypto of CRYPTOCURRENCIES) {
    random -= crypto.weight;
    if (random <= 0) return crypto;
  }
  return CRYPTOCURRENCIES[0];
}

function generateTransactionId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TRX-";
  for (let i = 0; i < 8; i++) {
    id += chars[randomInt(0, chars.length - 1)];
  }
  return id;
}

function maskUserName(): string {
  return `${randomElement(INDONESIAN_NAMES)} ${randomElement(LAST_NAME_INITIALS)}`;
}

function getRateForAmount(amount: number, tiers: RateTier[]): number {
  for (const tier of tiers) {
    if (amount >= tier.min && amount <= tier.max) return tier.rate;
  }
  return tiers[tiers.length - 1].rate;
}

function getRandomAmount(min: number, max: number): number {
  const range = max - min;
  const rand = Math.random();
  if (rand < 0.5) {
    return min + range * rand * 0.4;
  } else if (rand < 0.85) {
    return min + range * (0.2 + rand * 0.4);
  } else {
    return min + range * (0.5 + rand * 0.5);
  }
}

export async function generateDummyTransaction(
  priceSnapshot?: { [key: string]: { idr: number } },
  dynamicRates?: DynamicRatesConfig
): Promise<InsertTransaction & { cryptoNetwork?: string; walletAddress?: string | null; maskedEmail?: string | null }> {
  const rand = Math.random();
  const serviceType = rand < 0.7 ? "cryptocurrency" : (rand < 0.85 ? "paypal" : "skrill");
  
  const buyWeight = serviceType === "cryptocurrency" ? 0.6 : 0.5;
  const transactionType = Math.random() < buyWeight ? "buy" : "sell";
  
  const userName = maskUserName();

  let amountIdr: string;
  let amountForeign: string | null = null;
  let cryptoSymbol: string | null = null;
  let cryptoNetwork: string | undefined;
  
  const statusRand = Math.random();
  const status: "completed" | "pending" | "processing" = 
    statusRand < 0.7 ? "completed" : (statusRand < 0.9 ? "pending" : "processing");

  const cryptoConfig = dynamicRates?.cryptoConfig;
  const paypalRates = dynamicRates?.paypalRates || PAYPAL_SKRILL_RATES;
  const skrillRates = dynamicRates?.skrillRates || PAYPAL_SKRILL_RATES;

  if (serviceType === "cryptocurrency") {
    const crypto = weightedRandomCrypto();
    cryptoSymbol = crypto.symbol;
    cryptoNetwork = randomElement(crypto.networks);
    
    const coinId = SYMBOL_TO_ID[crypto.symbol];
    const marketPrice = priceSnapshot?.[coinId]?.idr || 0;
    if (!marketPrice) throw new Error(`No price for ${crypto.symbol}`);
    
    const isStablecoin = crypto.symbol === "USDT" || crypto.symbol === "USDC";
    let effectivePrice: number;
    
    if (isStablecoin) {
      const stablecoinRates = cryptoConfig?.stablecoins?.[crypto.symbol];
      effectivePrice = transactionType === "sell" 
        ? (stablecoinRates?.convert || 14000)
        : (stablecoinRates?.topup || 16999);
    } else {
      const marginSell = cryptoConfig?.margin_convert || 0.95;
      const marginBuy = cryptoConfig?.margin_topup || 1.05;
      const margin = transactionType === "sell" ? marginSell : marginBuy;
      effectivePrice = marketPrice * margin;
    }
    
    const networkFee = transactionType === "buy" 
      ? (DEFAULT_NETWORK_FEES[crypto.symbol]?.[cryptoNetwork] || 5000) 
      : 0;
    
    const minIdr = transactionType === "buy" ? LIMITS.crypto.min_idr_buy : LIMITS.crypto.min_idr_sell;
    let attempts = 0;
    
    do {
      const rawAmount = getRandomAmount(crypto.minAmount, crypto.maxAmount);
      amountForeign = rawAmount.toFixed(8);
      const baseIdr = parseFloat(amountForeign) * effectivePrice;
      amountIdr = Math.round(baseIdr + networkFee).toString();
      attempts++;
      if (attempts > 20) {
        const minTokens = (minIdr - networkFee) / effectivePrice;
        amountForeign = Math.max(minTokens, crypto.minAmount).toFixed(8);
        amountIdr = Math.round(parseFloat(amountForeign) * effectivePrice + networkFee).toString();
        break;
      }
    } while (parseFloat(amountIdr) < minIdr);
    
  } else {
    const rates = serviceType === "paypal" ? paypalRates : skrillRates;
    const tiers = transactionType === "sell" ? rates.convert : rates.topup;
    
    const minUsd = LIMITS.paypal.min_usd;
    const maxUsd = Math.min(LIMITS.paypal.max_usd, 1500);
    const usdAmount = Math.round(getRandomAmount(minUsd, maxUsd));
    amountForeign = usdAmount.toString();
    const rate = getRateForAmount(usdAmount, tiers);
    amountIdr = Math.round(usdAmount * rate).toString();
  }

  const ageRand = Math.random();
  let ageMs: number;
  if (status === "pending") {
    ageMs = randomInt(0, 30000);
  } else if (status === "processing") {
    ageMs = randomInt(30000, 120000);
  } else {
    if (ageRand < 0.3) ageMs = randomInt(60000, 300000);
    else if (ageRand < 0.6) ageMs = randomInt(300000, 900000);
    else if (ageRand < 0.85) ageMs = randomInt(900000, 1800000);
    else ageMs = randomInt(1800000, 3600000);
  }
  
  const createdAt = new Date(Date.now() - ageMs);

  const firstName = userName.split(" ")[0];
  const walletAddress = serviceType === "cryptocurrency" && cryptoSymbol
    ? generateWalletAddress(cryptoSymbol, cryptoNetwork)
    : null;
  const maskedEmail = serviceType !== "cryptocurrency"
    ? generateMaskedEmail(firstName)
    : null;

  return {
    transactionId: generateTransactionId(),
    userName,
    serviceType,
    cryptoSymbol,
    cryptoNetwork,
    transactionType,
    amountIdr,
    amountForeign,
    status,
    paymentMethod: "Saldo",
    createdAt,
    walletAddress,
    maskedEmail,
  };
}
