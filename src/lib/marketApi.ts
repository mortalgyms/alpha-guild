import { supabase } from "@/integrations/supabase/client";

export type LiveQuote = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  t: number;
  error?: string;
};

export type Candles = {
  c: number[]; h: number[]; l: number[]; o: number[]; t: number[]; v: number[]; s: string;
};

async function call<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const { data, error } = await supabase.functions.invoke(`market-data?${qs}`, { method: "GET" });
  if (error) throw error;
  return data as T;
}

export async function fetchQuotes(symbols: string[]): Promise<LiveQuote[]> {
  const data = await call<{ quotes: LiveQuote[] }>({ action: "quote", symbols: symbols.join(",") });
  return data.quotes ?? [];
}

export async function fetchCandles(symbol: string, resolution = "60", days = 30): Promise<Candles> {
  return call<Candles>({ action: "candles", symbol, resolution, days: String(days) });
}

export async function fetchMarketNews(category = "general") {
  return call<any[]>({ action: "news", category });
}

export async function searchSymbols(q: string) {
  return call<{ count: number; result: { symbol: string; description: string; type: string }[] }>({
    action: "search",
    q,
  });
}
