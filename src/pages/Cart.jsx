import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
    const { cartItems, updateQty, removeFromCart, cartTotal } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <ShoppingBag className="w-20 h-20 text-gray-700 mb-6" />
                <h2 className="text-3xl font-serif text-gray-800 mb-3">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 font-light">Discover our luxurious fragrance collection</p>
                <Link to="/" className="btn-primary px-8 py-3">
                    Explore Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-serif text-gray-800 mb-10 border-b border-gray-200 pb-4">
                Your Cart
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* ── Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <div
                            key={item.product}
                            className="flex items-center gap-5 bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-all shadow-sm"
                        >
                            {/* Image */}
                            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                                <h3 className="text-gray-800 font-serif text-lg truncate">{item.name}</h3>
                                <p className="text-yellow-500 font-semibold mt-1">${item.price}</p>
                            </div>

                            {/* Qty Controls */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                                <button
                                    onClick={() => updateQty(item.product, item.qty - 1)}
                                    disabled={item.qty <= 1}
                                    className="text-gray-500 hover:text-gray-800 disabled:opacity-30 transition"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-gray-800 w-6 text-center font-medium">{item.qty}</span>
                                <button
                                    onClick={() => updateQty(item.product, item.qty + 1)}
                                    className="text-gray-500 hover:text-gray-800 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right min-w-[70px]">
                                <p className="text-gray-800 font-bold">${(item.price * item.qty).toFixed(2)}</p>
                            </div>

                            {/* Remove */}
                            <button
                                onClick={() => removeFromCart(item.product)}
                                className="text-gray-600 hover:text-red-500 transition ml-1 flex-shrink-0"
                                title="Remove"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* ── Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 sticky top-28">
                        <h2 className="text-2xl font-serif text-gray-800 mb-6 pb-4 border-b border-gray-200">
                            Order Summary
                        </h2>

                        <div className="space-y-3 mb-6">
                            {cartItems.map(item => (
                                <div key={item.product} className="flex justify-between text-sm text-gray-600">
                                    <span className="truncate max-w-[160px]">{item.name} × {item.qty}</span>
                                    <span className="text-gray-800">${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Shipping</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold mt-4">
                                <span className="text-gray-800 font-serif">Total</span>
                                <span className="text-yellow-500">${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-xl transition-all text-base"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <Link
                            to="/"
                            className="block text-center text-gray-500 hover:text-gray-800 text-sm mt-4 transition"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
