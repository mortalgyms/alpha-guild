// Mock data for the trading platform shell
export type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume?: string;
  market: "Forex" | "Crypto" | "Stocks" | "Indices" | "Commodities" | "Futures";
};

export const watchlist: Ticker[] = [
  { symbol: "BTC/USD", name: "Bitcoin", price: 67842.21, change: 1521.34, changePct: 2.29, volume: "42.1B", market: "Crypto" },
  { symbol: "ETH/USD", name: "Ethereum", price: 3421.88, change: -42.11, changePct: -1.21, volume: "18.4B", market: "Crypto" },
  { symbol: "EUR/USD", name: "Euro / Dollar", price: 1.0842, change: 0.0024, changePct: 0.22, volume: "—", market: "Forex" },
  { symbol: "GBP/JPY", name: "Pound / Yen", price: 198.31, change: 0.84, changePct: 0.42, volume: "—", market: "Forex" },
  { symbol: "XAU/USD", name: "Gold Spot", price: 2641.5, change: -8.4, changePct: -0.32, volume: "—", market: "Commodities" },
  { symbol: "NVDA", name: "NVIDIA", price: 142.31, change: 3.84, changePct: 2.77, volume: "311M", market: "Stocks" },
  { symbol: "AAPL", name: "Apple", price: 232.18, change: 1.04, changePct: 0.45, volume: "48M", market: "Stocks" },
  { symbol: "SPX", name: "S&P 500", price: 5847.21, change: 71.4, changePct: 1.24, volume: "—", market: "Indices" },
];

export const indices: Ticker[] = [
  { symbol: "SPX", name: "S&P 500", price: 5847.21, change: 71.4, changePct: 1.24, market: "Indices" },
  { symbol: "NDX", name: "Nasdaq 100", price: 20431.88, change: 176.4, changePct: 0.87, market: "Indices" },
  { symbol: "DJI", name: "Dow Jones", price: 43221.4, change: -84.2, changePct: -0.19, market: "Indices" },
  { symbol: "DXY", name: "Dollar Index", price: 104.23, change: -0.32, changePct: -0.31, market: "Indices" },
  { symbol: "VIX", name: "Volatility", price: 14.82, change: -0.32, changePct: -2.14, market: "Indices" },
  { symbol: "US10Y", name: "10Y Yield", price: 4.21, change: 0.04, changePct: 0.95, market: "Indices" },
];

export type AISignal = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  confidence: number;
  timeframe: string;
  entry: number;
  target: number;
  stop: number;
  setup: string;
  age: string;
};

export const aiSignals: AISignal[] = [
  { id: "1", symbol: "EUR/USD", direction: "LONG", confidence: 87, timeframe: "4H", entry: 1.0842, target: 1.0925, stop: 1.0795, setup: "Smart money accumulation at demand zone", age: "12m" },
  { id: "2", symbol: "GOLD", direction: "SHORT", confidence: 72, timeframe: "1H", entry: 2641.5, target: 2615.0, stop: 2658.0, setup: "Liquidity sweep at session high", age: "34m" },
  { id: "3", symbol: "NVDA", direction: "LONG", confidence: 91, timeframe: "1D", entry: 142.31, target: 158.0, stop: 134.5, setup: "Order block + bullish FVG fill", age: "2h" },
  { id: "4", symbol: "BTC/USD", direction: "LONG", confidence: 78, timeframe: "4H", entry: 67800, target: 71200, stop: 65900, setup: "Inverse H&S breakout retest", age: "5h" },
  { id: "5", symbol: "GBP/JPY", direction: "SHORT", confidence: 65, timeframe: "15M", entry: 198.31, target: 197.6, stop: 198.7, setup: "Bearish divergence at supply", age: "8m" },
];

export type Trader = {
  rank: number;
  username: string;
  country: string;
  guild: string;
  pnl: number;
  winRate: number;
  sharpe: number;
  roi: number;
  xp: number;
  risk: "Low" | "Med" | "High";
};

export const leaderboard: Trader[] = [
  { rank: 1, username: "QuantKing", country: "🇺🇸", guild: "Citadel Wolves", pnl: 482310, winRate: 74.2, sharpe: 2.81, roi: 24.3, xp: 184201, risk: "Low" },
  { rank: 2, username: "BullRider", country: "🇬🇧", guild: "Mayfair Capital", pnl: 391284, winRate: 71.4, sharpe: 2.42, roi: 19.8, xp: 156210, risk: "Med" },
  { rank: 3, username: "AlphaWolf", country: "🇸🇬", guild: "Asia Quant", pnl: 348201, winRate: 68.1, sharpe: 2.31, roi: 17.2, xp: 142810, risk: "Med" },
  { rank: 4, username: "MacroJedi", country: "🇩🇪", guild: "Frankfurt Bears", pnl: 312840, winRate: 69.8, sharpe: 2.18, roi: 15.6, xp: 132410, risk: "Low" },
  { rank: 5, username: "VolatilityX", country: "🇯🇵", guild: "Tokyo Drift", pnl: 281240, winRate: 65.4, sharpe: 1.98, roi: 14.1, xp: 121200, risk: "High" },
  { rank: 6, username: "SmartMoney", country: "🇨🇭", guild: "Zurich Vault", pnl: 248391, winRate: 72.1, sharpe: 2.55, roi: 13.2, xp: 118420, risk: "Low" },
  { rank: 7, username: "OrderBlock", country: "🇦🇪", guild: "Dubai Whales", pnl: 224120, winRate: 64.8, sharpe: 1.84, roi: 12.4, xp: 109210, risk: "High" },
  { rank: 8, username: "FibQueen", country: "🇨🇦", guild: "Toronto Tide", pnl: 211400, winRate: 70.2, sharpe: 2.12, roi: 11.8, xp: 102841, risk: "Med" },
  { rank: 9, username: "You", country: "🌍", guild: "Apex Alpha", pnl: 198421, winRate: 68.4, sharpe: 2.04, roi: 11.2, xp: 98421, risk: "Med" },
  { rank: 10, username: "BreakoutBoss", country: "🇦🇺", guild: "Sydney Surge", pnl: 184201, winRate: 63.4, sharpe: 1.78, roi: 10.4, xp: 92810, risk: "High" },
];

export type Guild = {
  id: string;
  name: string;
  emblem: string;
  members: number;
  rank: number;
  pnl: number;
  description: string;
};

export const guilds: Guild[] = [
  { id: "g1", name: "Apex Alpha", emblem: "🐺", members: 124, rank: 3, pnl: 2841200, description: "Smart-money smart-asses. Macro + SMC focus." },
  { id: "g2", name: "Citadel Wolves", emblem: "🦅", members: 84, rank: 1, pnl: 4821000, description: "Quant-driven hedge mindset." },
  { id: "g3", name: "Tokyo Drift", emblem: "🐉", members: 142, rank: 5, pnl: 1842100, description: "Asia-session volatility specialists." },
  { id: "g4", name: "Mayfair Capital", emblem: "🏛️", members: 98, rank: 2, pnl: 3128400, description: "London FX & equity index desk." },
];

export type Quest = {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
  type: "daily" | "weekly" | "boss";
  icon: string;
};

export const quests: Quest[] = [
  { id: "q1", title: "Log 3 Trades", description: "Journal at least 3 trades today.", progress: 2, total: 3, reward: 250, type: "daily", icon: "📓" },
  { id: "q2", title: "Read AI Briefing", description: "Review today's AI macro briefing.", progress: 1, total: 1, reward: 100, type: "daily", icon: "🧠" },
  { id: "q3", title: "Risk Discipline", description: "Keep all trades under 1% risk today.", progress: 0, total: 1, reward: 300, type: "daily", icon: "🛡️" },
  { id: "q4", title: "Weekly Portfolio Review", description: "Run a full portfolio risk review.", progress: 0, total: 1, reward: 1500, type: "weekly", icon: "📊" },
  { id: "q5", title: "FOMC Boss Battle", description: "Trade the FOMC release with discipline. +Badge.", progress: 0, total: 1, reward: 5000, type: "boss", icon: "⚔️" },
  { id: "q6", title: "CPI Boss Battle", description: "Survive CPI volatility with positive PnL.", progress: 0, total: 1, reward: 5000, type: "boss", icon: "🔥" },
];

export type Notification = {
  id: string;
  type: "signal" | "alert" | "guild" | "dm" | "news" | "risk";
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  { id: "n1", type: "signal", title: "AI Signal: NVDA LONG (91%)", body: "Order block + bullish FVG fill on the daily.", time: "12m", unread: true },
  { id: "n2", type: "risk", title: "Risk warning", body: "Portfolio exposure to tech > 45%.", time: "32m", unread: true },
  { id: "n3", type: "guild", title: "Apex Alpha climbed to #3", body: "Your guild moved up 1 spot.", time: "1h", unread: true },
  { id: "n4", type: "news", title: "FOMC in 2h", body: "Expected volatility spike across DXY/Gold.", time: "1h", unread: false },
  { id: "n5", type: "dm", title: "QuantKing sent a chart", body: "“Check this BTC liquidity sweep…”", time: "3h", unread: false },
  { id: "n6", type: "alert", title: "Price alert: EUR/USD 1.0840", body: "Hit your alert level.", time: "5h", unread: false },
];

export type Channel = { id: string; name: string; unread?: number };
export const guildChannels: Channel[] = [
  { id: "c1", name: "general" },
  { id: "c2", name: "trade-setups", unread: 4 },
  { id: "c3", name: "macro-research" },
  { id: "c4", name: "psychology" },
  { id: "c5", name: "guild-vault" },
];

export type DM = { id: string; user: string; avatar: string; last: string; time: string; unread?: number; online?: boolean };
export const dms: DM[] = [
  { id: "d1", user: "QuantKing", avatar: "QK", last: "Check this BTC liquidity sweep…", time: "3h", unread: 2, online: true },
  { id: "d2", user: "AlphaWolf", avatar: "AW", last: "Long NVDA worked beautifully 🚀", time: "5h", online: true },
  { id: "d3", user: "MacroJedi", avatar: "MJ", last: "Sending FOMC playbook", time: "1d", online: false },
  { id: "d4", user: "FibQueen", avatar: "FQ", last: "What's your stop placement?", time: "2d", online: false },
];

export type ChatMessage = { id: string; user: string; avatar: string; text: string; time: string; me?: boolean; readReceipt?: "sent" | "delivered" | "read" };
export const sampleConversation: ChatMessage[] = [
  { id: "m1", user: "QuantKing", avatar: "QK", text: "Saw your trade in #trade-setups — clean entry on EU.", time: "10:14" },
  { id: "m2", user: "You", avatar: "Y", text: "Thanks! Waited for the OB retest before pulling the trigger.", time: "10:15", me: true, readReceipt: "read" },
  { id: "m3", user: "QuantKing", avatar: "QK", text: "Looking at BTC — there's a liquidity sweep building above 68k.", time: "10:17" },
  { id: "m4", user: "QuantKing", avatar: "QK", text: "If we tap and reject, I'm short to 65.9.", time: "10:17" },
  { id: "m5", user: "You", avatar: "Y", text: "Agreed. Watching the 1H FVG too.", time: "10:18", me: true, readReceipt: "read" },
];

// Generate a smooth-looking price series for charts
export function generateSeries(points = 64, base = 100, vol = 2): { i: number; v: number }[] {
  const arr: { i: number; v: number }[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v += (Math.random() - 0.48) * vol;
    arr.push({ i, v: Number(v.toFixed(2)) });
  }
  return arr;
}

export const economicEvents = [
  { time: "08:30", flag: "🇺🇸", event: "Initial Jobless Claims", impact: "Med", forecast: "215K", actual: "—" },
  { time: "10:00", flag: "🇺🇸", event: "Existing Home Sales", impact: "Low", forecast: "3.95M", actual: "—" },
  { time: "14:00", flag: "🇺🇸", event: "FOMC Statement", impact: "High", forecast: "—", actual: "—" },
  { time: "14:30", flag: "🇺🇸", event: "Fed Press Conference", impact: "High", forecast: "—", actual: "—" },
  { time: "23:50", flag: "🇯🇵", event: "BoJ Meeting Minutes", impact: "Med", forecast: "—", actual: "—" },
];

export const heatmapSectors = [
  { name: "Tech", change: 1.84, weight: 28 },
  { name: "Financials", change: 0.42, weight: 14 },
  { name: "Energy", change: -1.21, weight: 8 },
  { name: "Healthcare", change: 0.18, weight: 13 },
  { name: "Consumer", change: -0.34, weight: 11 },
  { name: "Industrials", change: 0.62, weight: 9 },
  { name: "Materials", change: -0.84, weight: 5 },
  { name: "Utilities", change: 0.21, weight: 4 },
  { name: "Real Estate", change: -0.42, weight: 4 },
  { name: "Comm.", change: 1.12, weight: 4 },
];
