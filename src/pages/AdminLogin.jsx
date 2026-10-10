import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User as UserIcon } from 'lucide-react';
import { EyeIcon, LoadingSpinner } from '../components/FormHelpers';
import API_BASE_URL from '../config/api';

const AdminLogin = () => {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading]       = useState(false);
    const [loginError, setLoginError]     = useState('');

    const { user, adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    // If already logged in as admin, redirect to /admin directly
    useEffect(() => {
        if (user && user.isAdmin) {
            navigate('/admin');
        }
    }, [user, navigate]);

    // Pre-warm backend
    useEffect(() => {
        fetch(`${API_BASE_URL}/api`, { method: 'GET' }).catch(() => {});
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!email.trim() || !password) {
            setLoginError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await adminLogin(email.trim().toLowerCase(), password);
            if (res.success) {
                navigate('/admin');
            } else {
                setLoginError(res.message || 'Invalid admin email or password.');
            }
        } catch {
            setLoginError('Unable to connect to server. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 glass-card hover:scale-100 p-8 sm:p-10">

                {/* Tabs Matching Login.jsx */}
                <div className="flex border-b border-gray-200">
                    <Link
                        to="/login"
                        className="flex-1 pb-3 text-center text-sm font-medium text-gray-400 hover:text-gold-DEFAULT transition flex items-center justify-center gap-1.5"
                    >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        Customer Login
                    </Link>
                    <div className="flex-1 pb-3 text-center text-sm font-semibold border-b-2 border-gold-DEFAULT text-gold-DEFAULT flex items-center justify-center gap-1.5 cursor-default">
                        <ShieldCheck className="w-4 h-4 text-gold-DEFAULT" />
                        Admin Portal
                    </div>
                </div>

                {/* Header */}
                <div className="text-center pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-DEFAULT/10 text-gold-DEFAULT border border-gold-DEFAULT/20 mb-3">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ADMIN ACCESS ONLY
                    </div>
                    <h2 className="text-3xl font-serif text-gray-800">Admin Sign In</h2>
                    <p className="mt-1 text-sm text-gray-600 font-light">
                        Authorized management portal for Lakshaura
                    </p>
                </div>

                {/* Error Banner matching website */}
                {loginError && (
                    <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 flex items-start gap-2 animate-pulse">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p>{loginError}</p>
                            {loginError.includes('Customer Login') && (
                                <Link to="/login" className="inline-block mt-1 font-semibold text-gold-dark hover:underline text-xs">
                                    Click here to open Customer Login &rarr;
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Form matching website input styling */}
                <form className="mt-6 space-y-5" onSubmit={submitHandler} noValidate>
                    <div>
                        <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Email Address
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            placeholder="admin@lakshaura.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            disabled={isLoading}
                            className="appearance-none rounded-md block w-full px-3 py-3 border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT sm:text-sm transition duration-200"
                        />
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                disabled={isLoading}
                                className="appearance-none rounded-md block w-full px-3 py-3 pr-11 border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT sm:text-sm transition duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gold-DEFAULT transition-colors duration-200 focus:outline-none z-20"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold tracking-wide"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Verifying Credentials...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Sign In to Dashboard</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Switcher */}
                <div className="text-center mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Not an administrator?{' '}
                        <Link to="/login" className="text-gold-DEFAULT hover:underline font-medium">
                            Customer Sign In
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminLogin;
