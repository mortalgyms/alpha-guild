const FINNHUB = "https://finnhub.io/api/v1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("FINNHUB_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "FINNHUB_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "quote";

    const fetchJson = async (path: string) => {
      const sep = path.includes("?") ? "&" : "?";
      const r = await fetch(`${FINNHUB}${path}${sep}token=${apiKey}`);
      if (!r.ok) throw new Error(`Finnhub ${r.status}: ${await r.text()}`);
      return r.json();
    };

    if (action === "quote") {
      const symbols = (url.searchParams.get("symbols") ?? "").split(",").filter(Boolean);
      if (!symbols.length) {
        return new Response(JSON.stringify({ error: "symbols required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const results = await Promise.all(
        symbols.map(async (s) => {
          try {
            const q = await fetchJson(`/quote?symbol=${encodeURIComponent(s)}`);
            return {
              symbol: s,
              price: q.c,
              change: q.d,
              changePct: q.dp,
              high: q.h,
              low: q.l,
              open: q.o,
              prevClose: q.pc,
              t: q.t,
            };
          } catch (e) {
            return { symbol: s, error: (e as Error).message };
          }
        })
      );
      return new Response(JSON.stringify({ quotes: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "profile") {
      const symbol = url.searchParams.get("symbol");
      if (!symbol) {
        return new Response(JSON.stringify({ error: "symbol required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await fetchJson(`/stock/profile2?symbol=${encodeURIComponent(symbol)}`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "candles") {
      // Finnhub free plan: candles endpoint requires paid; use quote-based synthetic intraday via /stock/candle if available
      const symbol = url.searchParams.get("symbol");
      const resolution = url.searchParams.get("resolution") ?? "60";
      const days = parseInt(url.searchParams.get("days") ?? "30", 10);
      if (!symbol) {
        return new Response(JSON.stringify({ error: "symbol required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const to = Math.floor(Date.now() / 1000);
      const from = to - days * 86400;
      const data = await fetchJson(
        `/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}`
      );
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search") {
      const q = url.searchParams.get("q") ?? "";
      const data = await fetchJson(`/search?q=${encodeURIComponent(q)}`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "news") {
      const category = url.searchParams.get("category") ?? "general";
      const data = await fetchJson(`/news?category=${encodeURIComponent(category)}`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
