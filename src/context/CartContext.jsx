import { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cartItems');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch {
            return [];
        }
    });

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        const addQty = Number(product.qty) > 0 ? Number(product.qty) : 1;
        setCartItems(prev => {
            const existing = prev.find(x => x.product === product.product);
            if (existing) {
                return prev.map(x =>
                    x.product === product.product
                        ? { ...x, qty: x.qty + addQty }
                        : x
                );
            }
            return [...prev, { ...product, qty: addQty }];
        });
    };

    const updateQty = (id, qty) => {
        if (qty < 1) {
            removeFromCart(id);
            return;
        }
        setCartItems(prev =>
            prev.map(x => x.product === id ? { ...x, qty } : x)
        );
    };

    const decreaseFromCart = (id) => {
        setCartItems(prev => {
            const existing = prev.find(x => x.product === id);
            if (!existing) return prev;
            if (existing.qty <= 1) {
                return prev.filter(x => x.product !== id);
            }
            return prev.map(x =>
                x.product === id ? { ...x, qty: x.qty - 1 } : x
            );
        });
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
            decreaseFromCart,
            removeFromCart,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
