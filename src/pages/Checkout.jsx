import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { CheckCircle, ChevronRight, ShoppingBag, Clock, AlertCircle, Loader2 } from 'lucide-react';

const STEPS = ['Cart Review', 'Shipping Info', 'Payment'];

const Checkout = () => {
    const { cartItems, clearCart, cartTotal } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = review, 2 = shipping, 3 = payment
    const [paymentDone, setPaymentDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState(null);
    const [placedOrderItems, setPlacedOrderItems] = useState([]);
    const [placedOrderTotal, setPlacedOrderTotal] = useState(0);

    // Payment Timer and Status State
    const [timeLeft, setTimeLeft] = useState(120);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, verifying, timeout

    useEffect(() => {
        if (step === 3 && timeLeft > 0 && paymentStatus === 'pending') {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (step === 3 && timeLeft === 0 && paymentStatus === 'pending') {
            setPaymentStatus('timeout');
        }
    }, [step, timeLeft, paymentStatus]);

    const [shipping, setShipping] = useState({
        fullName: user?.name || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
    });

    // ── Not logged in 
    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <ShoppingBag className="w-16 h-16 text-yellow-500 mb-6" />
                <h2 className="text-3xl font-serif text-gray-800 mb-3">Sign in to continue</h2>
                <p className="text-gray-600 mb-8">You need to be logged in to place an order.</p>
                <div className="flex gap-4">
                    <Link to="/login" className="btn-primary px-8 py-3">Sign In</Link>
                    <Link to="/register" className="btn-outline px-8 py-3">Create Account</Link>
                </div>
            </div>
        );
    }

    // ── Cart empty 
    if (cartItems.length === 0 && !paymentDone) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <ShoppingBag className="w-16 h-16 text-gray-400 mb-6" />
                <h2 className="text-3xl font-serif text-gray-800 mb-3">Your cart is empty</h2>
                <Link to="/" className="btn-primary mt-4 px-8 py-3">Explore Collection</Link>
            </div>
        );
    }

    const upiID = 'lakshaura@upi';
    const upiLink = `upi://pay?pa=${upiID}&pn=Lakshaura&am=${cartTotal.toFixed(2)}&cu=INR`;

    const handleShippingChange = (e) => {
        setShipping({ ...shipping, [e.target.name]: e.target.value });
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setError('');
        const { fullName, phone, address, city, postalCode } = shipping;
        if (!fullName || !phone || !address || !city || !postalCode) {
            setError('Please fill in all required fields.');
            return;
        }
        if (!/^\d{6}$/.test(postalCode)) {
            setError('Please enter a valid 6-digit pincode.');
            return;
        }
        if (!/^\d{10}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        setStep(3);
        setTimeLeft(120);
        setPaymentStatus('pending');
    };

    const handlePaymentConfirm = async () => {
        if (paymentStatus === 'timeout') return;
        setPaymentStatus('verifying');
        setError('');

        // Mock payment verification delay to feel like real site
        setTimeout(async () => {
            setLoading(true);
            try {
                const orderPayload = {
                    orderItems: cartItems.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        image: item.image,
                        price: item.price,
                        product: item.product,
                    })),
                    shippingAddress: shipping,
                    paymentMethod: 'UPIQR',
                    totalPrice: cartTotal,
                };

                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.post('http://localhost:5000/api/orders', orderPayload, config);
                setOrderId(data._id);
                setPaymentDone(true);
                setPlacedOrderItems(orderPayload.orderItems);
                setPlacedOrderTotal(orderPayload.totalPrice);
                clearCart();
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || 'Failed to place order. Please try again.');
                setPaymentStatus('pending');
            } finally {
                setLoading(false);
            }
        }, 2000); // 2 second verification delay
    };

    // ── SUCCESS SCREEN 
    if (paymentDone) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-10">
                <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-serif text-gray-800 mb-3">Order Placed!</h2>
                    <p className="text-gray-600 mb-2 font-light">Thank you for shopping with Lakshaura.</p>
                    {orderId && (
                        <p className="text-xs text-gray-500 mb-6">
                            Order ID: <span className="text-gray-800">{orderId}</span>
                        </p>
                    )}
                    
                    {/* Order Details Display */}
                    {placedOrderItems.length > 0 && (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                            <h3 className="font-serif text-gray-800 mb-4 border-b border-gray-200 pb-2">Order Summary</h3>
                            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                                {placedOrderItems.map((item, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-gray-800 font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-gray-500 text-xs">Qty: {item.qty}</p>
                                        </div>
                                        <p className="text-gray-800 font-semibold text-sm">₹{(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                                <span className="font-medium text-gray-600 text-sm">Total Amount Paid</span>
                                <span className="font-bold text-yellow-600 text-lg">₹{placedOrderTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 mb-8 px-4">
                        Your luxurious fragrances are being prepared for delivery to <br />
                        <span className="text-gray-800 font-medium">{shipping.address}, {shipping.city}</span>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 rounded-xl transition shadow-md"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-serif text-gray-800 mb-8 text-center">Checkout</h1>

            {/* ── Step Indicator */}
            <div className="flex items-center justify-center mb-10 gap-1">
                {STEPS.map((label, i) => {
                    const num = i + 1;
                    const isActive = step === num;
                    const isDone = step > num;
                    return (
                        <div key={label} className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                    isDone ? 'bg-green-500 text-white' :
                                    isActive ? 'bg-yellow-500 text-black' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                    {isDone ? '✓' : num}
                                </div>
                                <span className={`text-sm hidden sm:block transition-all ${
                                    isActive ? 'text-yellow-600 font-medium' :
                                    isDone ? 'text-green-600' : 'text-gray-600'
                                }`}>{label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
                            )}
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="mb-6 bg-red-900 bg-opacity-40 border border-red-600 text-red-300 px-4 py-3 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {/* ── STEP 1: Cart Review */}
            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h2 className="text-xl font-serif text-yellow-600 mb-5">Order Summary</h2>
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.product} className="flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-gray-800 font-medium truncate">{item.name}</p>
                                        <p className="text-gray-600 text-sm">Qty: {item.qty}</p>
                                    </div>
                                    <p className="text-gray-800 font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                                <span className="text-gray-800 font-serif">Total</span>
                                <span className="text-yellow-600">${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-6">
                        <div>
                            <h2 className="text-xl font-serif text-gray-800 mb-3">Ready to checkout?</h2>
                            <p className="text-gray-600 text-sm font-light mb-6">
                                You'll provide your shipping details in the next step followed by UPI payment.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-xl transition"
                            >
                                Enter Shipping Info <ChevronRight className="w-5 h-5" />
                            </button>
                            <Link to="/cart" className="block text-center text-gray-500 hover:text-gray-800 text-sm transition">
                                ← Back to Cart
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Shipping Form */}
            {step === 2 && (
                <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-serif text-gray-800 mb-6">Shipping Information</h2>
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="fullName"
                                value={shipping.fullName}
                                onChange={handleShippingChange}
                                placeholder="Ravi Kumar"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-600 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={shipping.phone}
                                onChange={handleShippingChange}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-600 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Full Address <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                value={shipping.address}
                                onChange={handleShippingChange}
                                placeholder="House no., Street, Area, Landmark"
                                rows={2}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-600 transition resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">City <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="city"
                                    value={shipping.city}
                                    onChange={handleShippingChange}
                                    placeholder="Mumbai"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-600 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Pincode <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={shipping.postalCode}
                                    onChange={handleShippingChange}
                                    placeholder="400001"
                                    maxLength={6}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-600 transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={shipping.country}
                                onChange={handleShippingChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-600 transition"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-black font-bold transition"
                            >
                                Continue to Payment →
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── STEP 3: Payment  */}
            {step === 3 && (
                <div className="max-w-xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                        <style>
                            {`
                                @keyframes scan {
                                    0% { top: 0; }
                                    50% { top: 100%; opacity: 0.8; }
                                    100% { top: 0; }
                                }
                            `}
                        </style>
                        <h2 className="text-2xl font-serif text-gray-800 mb-2">Scan & Pay</h2>
                        <p className="text-gray-600 text-sm mb-6 font-light">
                            Scan this UPI QR code with any payment app (GPay, PhonePe, Paytm)
                        </p>

                        {paymentStatus === 'timeout' ? (
                            <div className="py-10 animate-fade-in text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Session Expired</h3>
                                <p className="text-gray-600 mb-8 max-w-sm mx-auto">Because of inactivity, your payment session has ended. Please review your shipping details to try again.</p>
                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-xl transition"
                                >
                                    Retry Payment
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Timer Banner */}
                                <div className="flex justify-between items-center mb-8 bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-inner">
                                    <div className="flex items-center gap-2 text-amber-800 font-medium">
                                        <Clock className="w-5 h-5 animate-pulse" />
                                        <span>Time remaining to pay</span>
                                    </div>
                                    <span className={`text-2xl font-mono font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`}>
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>

                                {/* QR code */}
                                <div className="relative inline-block p-5 bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden group">
                                    {paymentStatus !== 'verifying' && (
                                        <div className="absolute left-0 w-full h-[2px] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] z-10" style={{ animation: 'scan 2.5s ease-in-out infinite' }} />
                                    )}
                                    <div className={paymentStatus === 'verifying' ? 'opacity-30 blur-[2px] transition-all' : 'transition-all'}>
                                        <QRCodeSVG value={upiLink} size={220} />
                                    </div>
                                    {paymentStatus === 'verifying' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-yellow-600 animate-spin mb-2" />
                                            <span className="font-medium text-gray-800">Verifying...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Payment details */}
                                <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-3 border border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Pay to</span>
                                        <span className="text-gray-800 font-medium">Lakshaura ({upiID})</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Deliver to</span>
                                        <span className="text-gray-800">{shipping.fullName}, {shipping.city}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="text-gray-800">{shipping.phone}</span>
                                    </div>
                                    <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-200">
                                        <span className="text-gray-800">Amount</span>
                                        <span className="text-yellow-600 text-xl tracking-tight">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePaymentConfirm}
                                    disabled={paymentStatus === 'verifying' || loading}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-lg disabled:opacity-75 disabled:cursor-not-allowed mb-4 shadow-md flex items-center justify-center gap-2"
                                >
                                    {paymentStatus === 'verifying' || loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying Payment with Bank...
                                        </>
                                    ) : (
                                        '✓ I have paid — Confirm Order'
                                    )}
                                </button>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={paymentStatus === 'verifying'}
                                    className="text-gray-500 hover:text-gray-800 text-sm transition disabled:opacity-50"
                                >
                                    ← Edit Shipping Info
                                </button>
                            </>
                        )}
                        <p className="text-xs text-gray-400 mt-6">
                            This is a demo store. Do not make real payments.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
