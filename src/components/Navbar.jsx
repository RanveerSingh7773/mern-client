import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, User as UserIcon, LogOut, Settings, Menu, X } from 'lucide-react';
import aboutImg from '../assets/ph/lakshay.jpeg';
import logoImg from '../assets/ph/logo.jpeg';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <>
            <nav className="glass sticky top-0 z-50 border-b border-gray-200 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
                                <img src={logoImg} alt="Lakshaura Logo" className="h-10 w-auto rounded-md object-contain" />
                                <span className="text-3xl font-serif text-gold-DEFAULT tracking-wider font-bold">
                                    Lakshaura.
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-600 hover:text-gold-DEFAULT transition duration-300 font-medium">
                                Collection
                            </Link>
                            <button 
                                onClick={() => setIsAboutOpen(!isAboutOpen)} 
                                className="text-gray-600 hover:text-gold-DEFAULT transition duration-300 font-medium cursor-pointer focus:outline-none"
                            >
                                About
                            </button>
                            
                            {/* Cart Icon */}
                            <Link to="/cart" className="relative text-gray-600 hover:text-gold-DEFAULT transition duration-300">
                                <ShoppingBag className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gold-DEFAULT text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="flex items-center space-x-6">
                                    {user.isAdmin && (
                                        <Link to="/admin" className="text-gray-600 hover:text-gold-DEFAULT transition flex items-center space-x-1 font-medium">
                                            <Settings className="w-5 h-5" />
                                            <span>Admin</span>
                                        </Link>
                                    )}
                                    <div className="flex items-center space-x-2 text-gold-light bg-gold-DEFAULT bg-opacity-10 px-3 py-1 rounded-full border border-gold-DEFAULT border-opacity-20">
                                        <UserIcon className="w-5 h-5" />
                                        <span className="text-sm font-semibold">{user.name}</span>
                                    </div>
                                    <button onClick={logout} className="text-gray-500 hover:text-red-500 transition flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100" title="Logout">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="btn-outline flex items-center space-x-2 py-2 px-5 text-sm">
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Navigation Controls */}
                        <div className="md:hidden flex items-center space-x-5">
                            <Link to="/cart" className="relative text-gray-600 hover:text-gold-DEFAULT transition duration-300">
                                <ShoppingBag className="w-7 h-7" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gold-DEFAULT text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            <button onClick={() => setIsOpen(true)} className="text-gold-DEFAULT hover:text-gray-800 transition focus:outline-none bg-gray-100 p-2 rounded-lg relative z-50">
                                <Menu className="w-7 h-7" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Slideshow Drawer (Main Menu) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 z-[60] backdrop-blur-sm transition-opacity md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <div 
                className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-200 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-[100%]'}`}
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200">
                    <span className="text-2xl font-serif text-gold-DEFAULT font-bold">Menu</span>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 transition">
                        <X className="w-8 h-8" />
                    </button>
                </div>
                
                <div className="flex flex-col py-6 px-6 space-y-6 overflow-y-auto">
                    <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-gold-DEFAULT transition">Collection</Link>
                    <button 
                        onClick={() => { setIsAboutOpen(!isAboutOpen); setIsOpen(false); }} 
                        className="text-left text-lg font-medium text-gray-700 hover:text-gold-DEFAULT transition"
                    >
                        About Us
                    </button>
                    
                    <div className="border-t border-gray-200 pt-6 mt-4">
                        {user ? (
                            <div className="space-y-6">
                                {user.isAdmin && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gold-DEFAULT flex items-center gap-2">
                                        <Settings className="w-5 h-5" /> Admin Dashboard
                                    </Link>
                                )}
                                <div className="text-gray-800 font-medium flex items-center space-x-3 bg-gray-100 p-3 rounded-xl border border-gray-200">
                                    <UserIcon className="w-5 h-5 text-gold-DEFAULT" /> <span>{user.name}</span>
                                </div>
                                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left text-red-400 font-medium hover:text-red-300 transition flex items-center gap-2">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary text-center block py-3 w-full">Sign In</Link>
                        )}
                    </div>
                </div>
            </div>

            {/* About Us Half-Screen Drawer */}
            {isAboutOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 z-[80] backdrop-blur-sm transition-opacity"
                    onClick={() => setIsAboutOpen(false)}
                />
            )}
            <div 
                className={`fixed top-0 right-0 h-full w-full md:w-1/2 bg-white border-l border-gray-200 shadow-2xl z-[90] transform transition-transform duration-500 ease-in-out ${isAboutOpen ? 'translate-x-0' : 'translate-x-[100%]'}`}
            >
                <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200 bg-white bg-opacity-90 backdrop-blur-lg">
                    <span className="text-3xl font-serif text-gray-800 tracking-widest uppercase">About</span>
                    <button onClick={() => setIsAboutOpen(false)} className="text-gray-500 hover:text-gray-800 transition focus:outline-none">
                        <X className="w-8 h-8" />
                    </button>
                </div>
                
                <div className="p-8 md:p-12 overflow-y-auto h-[calc(100vh-5rem)]">
                    <div className="flex flex-col items-center text-center gap-8">
                        <img 
                            src={aboutImg} 
                            alt="Lakshay, Founder of Lakshaura" 
                            className="rounded-3xl w-full h-[300px] object-cover border border-gray-200 shadow-xl"
                        />
                        <div>
                            <h2 className="text-3xl font-serif text-gold-DEFAULT mb-6">The Heritage of Fine Fragrance</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed font-light text-lg">
                                Welcome to Lakshaura, where the ancient art of perfumery meets modern luxury. Every drop of our carefully crafted fragrances tells a story of passion, elegance, and extreme attention to detail. 
                            </p>
                            <p className="text-gray-600 mb-6 leading-relaxed font-light text-lg">
                                Our master perfumers source the rarest ingredients from around the globe—from the deep oud forests to blooming floral valleys—blending them into captivating masterpieces designed to leave an unforgettable impression on your soul.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
