import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

const CART_STORAGE_KEY = "poppik:cart:v1";
const CART_EVENT_NAME = "cart:update";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT_NAME));
}

function keyOf(item: CartItem) {
  return `${item.product.id}:${item.selectedVariant ?? ""}`;
}

function toNumber(v: string | number | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  useEffect(() => {
    const sync = () => setItems(readCart());
    window.addEventListener(CART_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const count = useMemo(() => items.reduce((acc, it) => acc + (it.quantity ?? 0), 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + toNumber(it.product.price) * (it.quantity ?? 0), 0),
    [items]
  );

  const add = useCallback(
    (product: Product, quantity = 1, selectedVariant?: string) => {
      if (product && product.inStock === false) return;
      const nextQuantity = Math.max(1, quantity);
      const incoming: CartItem = { product, quantity: nextQuantity, selectedVariant };
      const k = keyOf(incoming);

      const idx = items.findIndex((it) => keyOf(it) === k);
      if (idx === -1) {
        const next = [incoming, ...items];
        setItems(next);
        writeCart(next);
        return;
      }

      const next = items.map((it, i) =>
        i === idx ? { ...it, quantity: (it.quantity ?? 0) + nextQuantity } : it
      );
      setItems(next);
      writeCart(next);
    },
    [items]
  );

  const remove = useCallback(
    (productId: number, selectedVariant?: string) => {
      const next = items.filter(
        (it) => !(it.product.id === productId && (it.selectedVariant ?? "") === (selectedVariant ?? ""))
      );
      setItems(next);
      writeCart(next);
    },
    [items]
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number, selectedVariant?: string) => {
      const q = Math.max(0, Math.floor(quantity));
      if (q === 0) {
        remove(productId, selectedVariant);
        return;
      }

      const next = items.map((it) => {
        if (it.product.id !== productId) return it;
        if ((it.selectedVariant ?? "") !== (selectedVariant ?? "")) return it;
        return { ...it, quantity: q };
      });
      setItems(next);
      writeCart(next);
    },
    [items, remove]
  );

  const clear = useCallback(() => {
    setItems([]);
    writeCart([]);
  }, []);

  return {
    items,
    count,
    subtotal,
    add,
    remove,
    setQuantity,
    clear,
  };
}
