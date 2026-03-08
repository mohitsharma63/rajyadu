import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

const WISHLIST_STORAGE_KEY = "poppik:wishlist:v1";
const WISHLIST_EVENT_NAME = "wishlist:update";

function readWishlist(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Product[];
  } catch {
    return [];
  }
}

function writeWishlist(items: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_EVENT_NAME));
}

export function useWishlist() {
  const [items, setItems] = useState<Product[]>(() => readWishlist());

  useEffect(() => {
    const sync = () => setItems(readWishlist());
    window.addEventListener(WISHLIST_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WISHLIST_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const ids = useMemo(() => new Set(items.map((p) => p.id)), [items]);

  const has = useCallback((productId: number) => ids.has(productId), [ids]);

  const add = useCallback(
    (product: Product) => {
      if (ids.has(product.id)) return;
      const next = [product, ...items];
      setItems(next);
      writeWishlist(next);
    },
    [ids, items]
  );

  const remove = useCallback(
    (productId: number) => {
      if (!ids.has(productId)) return;
      const next = items.filter((p) => p.id !== productId);
      setItems(next);
      writeWishlist(next);
    },
    [ids, items]
  );

  const toggle = useCallback(
    (product: Product) => {
      if (ids.has(product.id)) {
        remove(product.id);
        return;
      }
      add(product);
    },
    [add, ids, remove]
  );

  const clear = useCallback(() => {
    setItems([]);
    writeWishlist([]);
  }, []);

  return {
    items,
    count: items.length,
    has,
    add,
    remove,
    toggle,
    clear,
  };
}
