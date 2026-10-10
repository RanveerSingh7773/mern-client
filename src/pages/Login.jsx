import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { EyeIcon, FieldError, LoadingSpinner } from '../components/FormHelpers';
import { getInputClass } from '../utils/formUtils';
import { ShieldCheck } from 'lucide-react';
import API_BASE_URL from '../config/api';

const validate = (email, password) => {
    const errors = {};
    if (!email.trim()) {
        errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Please enter a valid email (e.g. user@example.com).';
    }
    if (!password) {
        errors.password = 'Password is required.';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
};

const Login = () => {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading]       = useState(false);
    const [errors, setErrors]             = useState({});
    const [touched, setTouched]           = useState({});
    const [loginError, setLoginError]     = useState('');

    const { login }  = useContext(AuthContext);
    const navigate   = useNavigate();
    const location   = useLocation();
    const successMsg = location.state?.message || '';

    // Pre-warm backend so it's awake before user clicks submit
    useEffect(() => {
        fetch(`${API_BASE_URL}/api`, { method: 'GET' }).catch(() => {});
    }, []);

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(validate(email, password));
    };

    const handleChange = (field, value) => {
        if (field === 'email') setEmail(value);
        else setPassword(value);

        if (touched[field]) {
            const freshErrors = validate(
                field === 'email'    ? value : email,
                field === 'password' ? value : password
            );
            setErrors(prev => ({ ...prev, [field]: freshErrors[field] }));
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoginError('');
        setTouched({ email: true, password: true });
        const errs = validate(email, password);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setIsLoading(true);
        try {
            const res = await login(email.trim().toLowerCase(), password);
            if (res.success) {
                navigate('/');
            } else {
                setLoginError(res.message || 'Invalid email or password. Please try again.');
            }
        } catch {
            setLoginError('Something went wrong. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 glass-card hover:scale-100 p-8 sm:p-10">

                {/* Switcher Tab between Customer and Admin */}
                <div className="flex border-b border-gray-200">
                    <div className="flex-1 pb-3 text-center text-sm font-semibold border-b-2 border-gold-DEFAULT text-gold-DEFAULT cursor-default">
                        Customer Login
                    </div>
                    <Link
                        to="/admin-login"
                        className="flex-1 pb-3 text-center text-sm font-medium text-gray-400 hover:text-gold-DEFAULT transition flex items-center justify-center gap-1.5"
                    >
                        <ShieldCheck className="w-4 h-4 text-gray-400 hover:text-gold-DEFAULT" />
                        Admin Portal
                    </Link>
                </div>

                <div>
                    <h2 className="text-center text-3xl font-serif text-gray-800">Sign In</h2>
                    <p className="mt-1 text-center text-sm text-gray-600 font-light">Access your luxurious profile</p>
                </div>

                {successMsg && (
                    <div className="bg-green-50 border border-green-300 text-green-700 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMsg}
                    </div>
                )}

                {loginError && (
                    <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 flex items-start gap-2 animate-pulse">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p>{loginError}</p>
                            {loginError.includes('Admin Portal') && (
                                <Link to="/admin-login" className="inline-block mt-1 font-semibold text-gold-dark hover:underline text-xs">
                                    Click here to open Admin Portal &rarr;
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={submitHandler} noValidate>
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            className={getInputClass('email', touched, errors)}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        <FieldError msg={touched.email && errors.email} />
                    </div>

                    <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                className={`${getInputClass('password', touched, errors)} pr-11`}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-yellow-600 transition-colors duration-200 focus:outline-none z-20"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                        <FieldError msg={touched.password && errors.password} />
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        New here?{' '}
                        <Link to="/register" className="text-gold-DEFAULT hover:underline font-medium">
                            Create an account
                        </Link>
                    </p>
                </div>

                {/* Dedicated Admin Portal Access Button */}
                <div className="pt-4 border-t border-gray-100">
                    <Link
                        to="/admin-login"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-xs font-semibold uppercase tracking-wider text-gold-DEFAULT border border-gold-DEFAULT/40 hover:bg-gold-DEFAULT hover:text-white transition-colors duration-300 group shadow-sm"
                    >
                        <ShieldCheck className="w-4 h-4 text-gold-DEFAULT group-hover:text-white transition" />
                        <span>Admin Login Portal &rarr;</span>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Login;
