import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, X, Info, Plus, Minus } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { cartItems, addToCart, decreaseFromCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [added, setAdded] = useState(false);
    const [addedQty, setAddedQty] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [showDetails, setShowDetails] = useState(false);
    const [loginPrompt, setLoginPrompt] = useState(false);

    // Find if product is already in cart
    const cartItem = cartItems?.find(x => x.product === product._id);
    const inCartQty = cartItem ? cartItem.qty : 0;
    
    // Displayed count: if in cart, show inCartQty; otherwise local quantity selection
    const displayedQty = inCartQty > 0 ? inCartQty : quantity;

    const handleDecrement = (e) => {
        if (e) e.stopPropagation();

        // When item is already in cart, decrease it from cart directly!
        if (inCartQty > 0) {
            decreaseFromCart(product._id);
            if (inCartQty <= 1) {
                setQuantity(1);
            }
        } else {
            // Not in cart yet, decrease local counter (min 1)
            setQuantity(prev => (prev > 1 ? prev - 1 : 1));
        }
    };

    const handleIncrement = (e) => {
        if (e) e.stopPropagation();
        const maxStock = product.countInStock !== undefined && product.countInStock !== null && product.countInStock > 0 
            ? product.countInStock 
            : 99;

        // If item is already in cart, add 1 more to cart!
        if (inCartQty > 0) {
            if (inCartQty < maxStock) {
                addToCart({
                    product: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    qty: 1
                });
            }
        } else {
            // Not in cart, increase local counter
            setQuantity(prev => (prev < maxStock ? prev + 1 : prev));
        }
    };

    const handleAdd = (e) => {
        if (e) e.stopPropagation();

        // Require login before adding to cart
        if (!user) {
            setLoginPrompt(true);
            setTimeout(() => setLoginPrompt(false), 3000);
            return;
        }

        const qtyToAdd = inCartQty > 0 ? 1 : quantity;

        addToCart({
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            qty: qtyToAdd
        });
        setAddedQty(qtyToAdd);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const goToLogin = (e) => {
        if (e) e.stopPropagation();
        setShowDetails(false);
        navigate('/login');
    };

    return (
        <>
            <div className="glass-card overflow-hidden group cursor-pointer flex flex-col h-full relative">
                <div className="relative h-64 overflow-hidden bg-white">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    {/* Show Details Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowDetails(true); }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gold-DEFAULT hover:bg-gold-DEFAULT hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                    >
                        <Info className="w-3.5 h-3.5" /> Details
                    </button>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <p className="text-xs text-gold-DEFAULT tracking-widest uppercase mb-1">{product.brand}</p>
                            <h3 className="text-lg font-serif font-semibold text-text-main truncate max-w-[200px]">{product.name}</h3>
                        </div>
                        <span className="text-lg font-medium text-text-main font-serif">${product.price}</span>
                    </div>
                    
                    <p className="text-gray-600 text-xs mt-1.5 line-clamp-2 flex-grow font-light leading-relaxed">
                        {product.description}
                    </p>
                    
                    {/* Quantity Selector + Smaller Add to Cart Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                        {/* Plus and Sub (Minus) Counting Buttons */}
                        <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="flex items-center border border-gray-200/90 rounded-lg bg-gray-50/90 p-0.5 shadow-2xs shrink-0"
                        >
                            <button 
                                type="button"
                                onClick={handleDecrement}
                                disabled={inCartQty === 0 && quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:text-gold-DEFAULT hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                                title={inCartQty > 0 ? "Decrease quantity from cart" : "Decrease quantity"}
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-7 text-center text-xs font-semibold text-gray-800 font-mono select-none">
                                {displayedQty}
                            </span>

                            <button 
                                type="button"
                                onClick={handleIncrement}
                                disabled={product.countInStock !== undefined && product.countInStock !== null && displayedQty >= product.countInStock}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:text-gold-DEFAULT hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                                title="Increase quantity"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Chota Add to Cart Button */}
                        <button 
                            type="button"
                            onClick={handleAdd}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all duration-300 shadow-2xs cursor-pointer ${
                                added
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : loginPrompt
                                    ? 'bg-red-50 border-red-300 text-red-600 text-[11px]'
                                    : inCartQty > 0
                                    ? 'border-gold-DEFAULT bg-gold-DEFAULT text-white hover:bg-opacity-90'
                                    : 'border-gold-DEFAULT bg-white text-gold-DEFAULT hover:bg-gold-DEFAULT hover:text-white'
                            }`}
                        >
                            {added ? (
                                <><Check className="w-3.5 h-3.5" /> Added ({addedQty})</>
                            ) : loginPrompt ? (
                                <span onClick={goToLogin} className="flex items-center gap-1">
                                    Login Required
                                </span>
                            ) : inCartQty > 0 ? (
                                <><ShoppingBag className="w-3.5 h-3.5" /> In Cart ({inCartQty})</>
                            ) : (
                                <><ShoppingBag className="w-3.5 h-3.5" /> Add to Cart</>
                            )}
                        </button>
                    </div>

                    {/* Login toast */}
                    {loginPrompt && (
                        <div className="mt-2 text-center">
                            <button
                                onClick={goToLogin}
                                className="text-xs text-gold-DEFAULT underline underline-offset-2 hover:opacity-80 transition"
                            >
                                Click here to Login →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            {showDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setShowDetails(false)}>
                    <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
                    <div 
                        className="bg-light-bg w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowDetails(false)}
                            className="absolute top-4 right-4 z-20 bg-white/50 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-md transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="md:w-1/2 h-64 md:h-auto relative bg-white">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                            <p className="text-sm text-gold-DEFAULT tracking-[0.2em] uppercase font-bold mb-2">{product.brand}</p>
                            <h2 className="text-3xl md:text-4xl font-serif text-text-main mb-4">{product.name}</h2>
                            <p className="text-2xl text-text-main font-medium mb-6 font-serif">${product.price}</p>
                            
                            <div className="w-12 h-1 bg-gold-DEFAULT mb-6"></div>
                            
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-2">Perfume Details</h4>
                            <p className="text-gray-600 leading-relaxed font-light mb-8 text-sm">
                                {product.description}
                            </p>
                            
                            {/* Quantity + Add to Cart in Modal */}
                            <div className="flex items-center gap-3">
                                <div 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="flex items-center border border-gray-300 rounded-xl bg-gray-50 p-1 shadow-2xs shrink-0"
                                >
                                    <button 
                                        type="button"
                                        onClick={handleDecrement}
                                        disabled={inCartQty === 0 && quantity <= 1}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:text-gold-DEFAULT hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                                        title={inCartQty > 0 ? "Decrease quantity from cart" : "Decrease quantity"}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <span className="w-10 text-center text-sm font-bold text-gray-800 font-mono select-none">
                                        {displayedQty}
                                    </span>

                                    <button 
                                        type="button"
                                        onClick={handleIncrement}
                                        disabled={product.countInStock !== undefined && product.countInStock !== null && displayedQty >= product.countInStock}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:text-gold-DEFAULT hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                                        title="Increase quantity"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <button 
                                    onClick={(e) => { handleAdd(e); if (user) setTimeout(() => setShowDetails(false), 900); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                                        added
                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                            : loginPrompt
                                            ? 'bg-red-50 border-red-400 text-red-600 text-xs'
                                            : inCartQty > 0
                                            ? 'bg-gold-DEFAULT border-gold-DEFAULT text-white hover:bg-opacity-90'
                                            : 'bg-gold-DEFAULT border-gold-DEFAULT text-white hover:bg-opacity-90'
                                    }`}
                                >
                                    {added ? (
                                        <><Check className="w-4 h-4" /> Added {addedQty} to Cart!</>
                                    ) : loginPrompt ? (
                                        <span onClick={goToLogin} className="flex items-center gap-2">
                                            Login Required — Tap to Login
                                        </span>
                                    ) : inCartQty > 0 ? (
                                        <><ShoppingBag className="w-4 h-4" /> In Cart ({inCartQty})</>
                                    ) : (
                                        <><ShoppingBag className="w-4 h-4" /> Add to Cart ({quantity})</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;
