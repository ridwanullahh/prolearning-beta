import React, { createContext, useState, useContext, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    // Add other relevant course properties
}

interface CartContextProps {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Load cart items from local storage on initial load
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    useEffect(() => {
        // Save cart items to local storage whenever the cart changes
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (item: CartItem) => {
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
            if (existingItemIndex !== -1) {
                // Item already exists, update quantity
                const newItems = [...prevItems];
                return newItems;
            } else {
                // Item doesn't exist, add it to the cart
                return [...prevItems, item];
            }
        });
    };

    const removeItem = (itemId: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((total, item) => total + 1, 0);
    const totalPrice = items.reduce((total, item) => total + item.price, 0);

    const value: CartContextProps = {
        items,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        totalPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};


const Cart = () => {
    const { items, removeItem, clearCart, totalItems, totalPrice } = useCart();

    if (items.length === 0) {
        return <p>Your cart is empty.</p>;
    }

    return (
        <div>
            <h2>Cart</h2>
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        {item.name} - {item.price}
                        <button onClick={() => removeItem(item.id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <p>Total Items: {totalItems}</p>
            <p>Total Price: {totalPrice}</p>
            <button onClick={clearCart}>Clear Cart</button>
            <button>Checkout</button>
        </div>
    );
};

export default Cart;