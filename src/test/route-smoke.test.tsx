import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";

const authState = vi.hoisted(() => ({
  user: { id: "test-user", email: "alex@example.com" } as { id: string; email: string } | null,
  loading: false,
}));

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: authState.user,
    session: authState.user ? { user: authState.user } : null,
    loading: authState.loading,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/marketApi", () => ({
  fetchQuotes: vi.fn(async (symbols: string[]) =>
    symbols.map((symbol) => ({
      symbol,
      price: symbol.includes("USD") ? 1.08 : 100,
      change: 1,
      changePct: 1,
      high: 102,
      low: 98,
      open: 99,
      prevClose: 99,
      t: 1_700_000_000,
    }))
  ),
  fetchCandles: vi.fn(async () => ({
    s: "ok",
    c: [100, 102, 101, 104],
    h: [101, 103, 102, 105],
    l: [99, 101, 100, 103],
    o: [99, 101, 102, 101],
    t: [1, 2, 3, 4],
    v: [1000, 1100, 900, 1300],
  })),
  fetchMarketNews: vi.fn(async () => []),
  searchSymbols: vi.fn(async () => ({ count: 0, result: [] })),
}));

afterEach(() => {
  cleanup();
  authState.user = { id: "test-user", email: "alex@example.com" };
  authState.loading = false;
});

describe("application routes", () => {
  const protectedRoutes = [
    ["/", "Good morning, Alex"],
    ["/markets", "Charts & Markets"],
    ["/signals", "AI Trade Signals"],
    ["/portfolio", "Holdings & Performance"],
    ["/journal", "Trade Journal"],
    ["/guilds", "Trading Guilds"],
    ["/messages", "Messages"],
    ["/leaderboard", "Global Leaderboard"],
    ["/quests", "Quests & Boss Battles"],
    ["/learn", "AI Learning Hub"],
    ["/notifications", "Notifications"],
    ["/settings", "Settings"],
    ["/profile", "Alex Chen"],
  ] as const;

  it.each(protectedRoutes)("renders %s", async (path, expectedText) => {
    window.history.pushState({}, "", path);
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(expectedText).length).toBeGreaterThan(0);
    });
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });

  it("renders the auth page for signed-out users", async () => {
    authState.user = null;
    window.history.pushState({}, "", "/auth");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    });
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("redirects signed-out users away from protected pages", async () => {
    authState.user = null;
    window.history.pushState({}, "", "/markets");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    });
  });

  it("enables Crypto and Forex market filters", async () => {
    window.history.pushState({}, "", "/markets");
    render(<App />);

    const cryptoTab = await screen.findByRole("tab", { name: "Crypto" });
    const forexTab = screen.getByRole("tab", { name: "Forex" });
    expect(cryptoTab).toBeEnabled();
    expect(forexTab).toBeEnabled();

    fireEvent.click(cryptoTab);
    expect(await screen.findByText("BTCUSD")).toBeInTheDocument();

    fireEvent.click(forexTab);
    expect(await screen.findByText("EURUSD")).toBeInTheDocument();
  });
});
