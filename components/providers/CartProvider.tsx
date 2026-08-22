"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { resolveCartLine } from "@/lib/cart-catalog";
import { useScrollLock } from "@/lib/scroll-lock";

const STORAGE_KEY = "hv.cart.v1";

export type CartLine = {
  variantId: string;
  qty: number;
};

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; variantId: string; qty: number }
  | { type: "setQty"; variantId: string; qty: number }
  | { type: "remove"; variantId: string }
  | { type: "clear" };

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const existing = state.find((l) => l.variantId === action.variantId);
      if (existing) {
        return state.map((l) =>
          l.variantId === action.variantId
            ? { ...l, qty: Math.min(l.qty + action.qty, 20) }
            : l,
        );
      }
      return [...state, { variantId: action.variantId, qty: action.qty }];
    }
    case "setQty":
      return action.qty <= 0
        ? state.filter((l) => l.variantId !== action.variantId)
        : state.map((l) =>
            l.variantId === action.variantId
              ? { ...l, qty: Math.min(action.qty, 20) }
              : l,
          );
    case "remove":
      return state.filter((l) => l.variantId !== action.variantId);
    case "clear":
      return [];
  }
}

/** A cart line joined to its catalogue entry, ready to render. */
export type ResolvedLine = CartLine & {
  name: string;
  image: string;
  unitPriceCents: number;
  lineTotalCents: number;
};

interface CartContextValue {
  lines: ResolvedLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, dispatch] = useReducer(reducer, [] as CartLine[]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Restore once on mount. Reading in an effect (not during render) keeps the
     server and first client paint identical, so there is no hydration flash. */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (l): l is CartLine =>
              typeof l === "object" &&
              l !== null &&
              typeof (l as CartLine).variantId === "string" &&
              Number.isFinite((l as CartLine).qty) &&
              resolveCartLine((l as CartLine).variantId) !== null,
          );
          dispatch({ type: "hydrate", lines: valid });
        }
      }
    } catch {
      // Corrupt or unavailable storage: start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch {
      // Private-mode quota errors must never break checkout.
    }
  }, [raw, hydrated]);

  /* Lock the page while the drawer is open. */
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const lines = useMemo<ResolvedLine[]>(
    () =>
      raw.flatMap((line) => {
        const entry = resolveCartLine(line.variantId);
        if (!entry) return [];
        return [
          {
            ...line,
            name: entry.name,
            image: entry.image,
            unitPriceCents: entry.unitPriceCents,
            lineTotalCents: entry.unitPriceCents * line.qty,
          },
        ];
      }),
    [raw],
  );

  const add = useCallback((variantId: string, qty = 1) => {
    dispatch({ type: "add", variantId, qty });
    setOpen(true);
  }, []);

  // Stable identity: consumers (e.g. the post-payment <ClearCart/>) must be
  // able to run this exactly once, so it cannot be recreated when `lines`
  // changes — an unstable reference would re-fire its effect in a loop.
  const clear = useCallback(() => {
    dispatch({ type: "clear" });
    // Also empty storage synchronously: checkout redirects immediately, so
    // React's persistence effect may not flush before the navigation.
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Quota/private-mode errors must never break checkout.
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotalCents: lines.reduce((n, l) => n + l.lineTotalCents, 0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty: (variantId, qty) => dispatch({ type: "setQty", variantId, qty }),
      remove: (variantId) => dispatch({ type: "remove", variantId }),
      clear,
    }),
    [lines, isOpen, add, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
