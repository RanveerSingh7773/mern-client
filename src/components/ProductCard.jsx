import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, X, Info } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [added, setAdded] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [loginPrompt, setLoginPrompt] = useState(false);

    const handleAdd = (e) => {
        if (e) e.stopPropagation();

        // Require login before adding to cart
        if (!user) {
            setLoginPrompt(true);
            setTimeout(() => setLoginPrompt(false), 3000);
            return;
        }

        addToCart({
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            qty: 1
        });
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
                
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-xs text-gold-DEFAULT tracking-widest uppercase mb-1">{product.brand}</p>
                            <h3 className="text-xl font-serif font-semibold text-text-main truncate max-w-[200px]">{product.name}</h3>
                        </div>
                        <span className="text-lg font-medium text-text-main">${product.price}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-grow">{product.description}</p>
                    
                    <button 
                        onClick={handleAdd}
                        className={`w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-lg border font-medium transition-all duration-300 ${
                            added
                                ? 'bg-green-600 border-green-600 text-white'
                                : loginPrompt
                                ? 'bg-red-50 border-red-400 text-red-500'
                                : 'border-gold-DEFAULT text-gold-DEFAULT hover:bg-gold-DEFAULT hover:text-white'
                        }`}
                    >
                        {added ? (
                            <><Check className="w-5 h-5" /> Added to Cart!</>
                        ) : loginPrompt ? (
                            <span onClick={goToLogin} className="flex items-center gap-2 cursor-pointer">
                                🔒 Please login to add to cart
                            </span>
                        ) : (
                            <><ShoppingBag className="w-5 h-5" /> Add to Cart</>
                        )}
                    </button>

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
                            className="absolute top-4 right-4 z-20 bg-white/50 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-md transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="md:w-1/2 h-64 md:h-auto relative bg-white">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                            <p className="text-sm text-gold-DEFAULT tracking-[0.2em] uppercase font-bold mb-2">{product.brand}</p>
                            <h2 className="text-3xl md:text-4xl font-serif text-text-main mb-4">{product.name}</h2>
                            <p className="text-2xl text-text-main font-medium mb-6">${product.price}</p>
                            
                            <div className="w-12 h-1 bg-gold-DEFAULT mb-6"></div>
                            
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-2">Perfume Details</h4>
                            <p className="text-gray-600 leading-relaxed font-light mb-8">
                                {product.description}
                            </p>
                            
                            <button 
                                onClick={(e) => { handleAdd(e); if (user) setTimeout(() => setShowDetails(false), 800); }}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl border font-bold transition-all duration-300 ${
                                    added
                                        ? 'bg-green-600 border-green-600 text-white'
                                        : loginPrompt
                                        ? 'bg-red-50 border-red-400 text-red-600'
                                        : 'bg-gold-DEFAULT border-gold-DEFAULT text-white hover:bg-opacity-90'
                                }`}
                            >
                                {added ? (
                                    <><Check className="w-5 h-5" /> Added to Cart!</>
                                ) : loginPrompt ? (
                                    <span onClick={goToLogin} className="flex items-center gap-2">
                                        🔒 Login Required — Tap to Login
                                    </span>
                                ) : (
                                    <><ShoppingBag className="w-5 h-5" /> Add to Cart</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;
