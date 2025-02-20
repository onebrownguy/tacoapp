import React, { createContext, useState, useContext } from 'react';

// Define the shape of a cart item
type CartItem = {
  id: string;
  name: string;
  quantity: number;
};

// Create a Cart Context
const CartContext = createContext({
    cart: [] as CartItem[],
    addToCart: (item: CartItem) => {},
    removeFromCart: (id: string) => {},
    clearCart: () => {},
});

// Cart Provider Component
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                return [...prevCart, { ...item, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children} {/* ✅ This should be the ONLY thing inside the provider */}
        </CartContext.Provider>
    );
}

// ✅ Fix: Export the useCart hook
export function useCart() {
    return useContext(CartContext);
}
