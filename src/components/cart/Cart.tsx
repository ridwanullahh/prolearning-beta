import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';

export interface CartItem {
    courseId: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartContextProps {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (courseId: string) => void;
    updateItemQuantity: (courseId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    loading: boolean;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartId, setCartId] = useState<string | null>(null);
    const user = authService.getCurrentUser();

    const fetchCart = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const userCart = await db.queryBuilder('cart').where(c => c.userId === user.id).first();
            if (userCart) {
                setItems(userCart.items);
                setCartId(userCart.id);
            } else {
                const newCart = await db.insert('cart', { userId: user.id, items: [] });
                setCartId(newCart.id);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateDbCart = async (newItems: CartItem[]) => {
        if (cartId) {
            try {
                await db.update('cart', cartId, { items: newItems });
            } catch (error) {
                console.error("Error updating cart in DB:", error);
            }
        }
    };

    const addItem = (item: Omit<CartItem, 'quantity'>) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.courseId === item.courseId);
            let newItems;
            if (existingItem) {
                newItems = prevItems.map(i => i.courseId === item.courseId ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                newItems = [...prevItems, { ...item, quantity: 1 }];
            }
            updateDbCart(newItems);
            return newItems;
        });
    };

    const removeItem = (courseId: string) => {
        setItems(prevItems => {
            const newItems = prevItems.filter(item => item.courseId !== courseId);
            updateDbCart(newItems);
            return newItems;
        });
    };

    const updateItemQuantity = (courseId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(courseId);
            return;
        }
        setItems(prevItems => {
            const newItems = prevItems.map(i => i.courseId === courseId ? { ...i, quantity } : i);
            updateDbCart(newItems);
            return newItems;
        });
    };

    const clearCart = () => {
        setItems([]);
        updateDbCart([]);
    };

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateItemQuantity, clearCart, totalItems, totalPrice, loading }}>
            {children}
        </CartContext.Provider>
    );
};