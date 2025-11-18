"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  ReactNode,
} from "react";

export type CartItem = {
  id: number;
  nome: string;        // título
  preco: string;       // preço formatado (R$19,90)
  imagem: string;      // URL da imagem
  size: string | null; // tamanho selecionado
  quantity: number;    // quantidade
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: number, size: string | null, quantity: number) => void;
  removeFromCart: (id: number, size: string | null) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 🔹 Carrega do localStorage quando a app sobe no client
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("cart-items");
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(parsed);
      }
    } catch (e) {
      console.error("Erro ao carregar carrinho do localStorage:", e);
    }
  }, []);

  // 🔹 Salva no localStorage sempre que o carrinho mudar
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem("cart-items", JSON.stringify(items));
    } catch (e) {
      console.error("Erro ao salvar carrinho no localStorage:", e);
    }
  }, [items]);

  // adicionar item (ou somar quantidade se já existir mesma peça+size)
  const addToCart: CartContextType["addToCart"] = (item, quantity = 1) => {
    setItems((prev) => {
      const index = prev.findIndex(
        (p) => p.id === item.id && p.size === item.size
      );

      if (index >= 0) {
        const clone = [...prev];
        clone[index] = {
          ...clone[index],
          quantity: clone[index].quantity + quantity,
        };
        return clone;
      }

      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity: CartContextType["updateQuantity"] = (
    id,
    size,
    quantity
  ) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => !(item.id === id && item.size === size));
      }

      return prev.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      );
    });
  };

  const removeFromCart: CartContextType["removeFromCart"] = (id, size) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, totalItems, addToCart, updateQuantity, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return ctx;
}
