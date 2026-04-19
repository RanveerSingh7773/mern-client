import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(x => x.product === product.product);
            if (existing) {
                return prev.map(x =>
                    x.product === product.product
                        ? { ...x, qty: x.qty + 1 }
                        : x
                );
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, qty) => {
        if (qty < 1) return;
        setCartItems(prev =>
            prev.map(x => x.product === id ? { ...x, qty } : x)
        );
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(x => x.product !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            updateQty,
            removeFromCart,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
