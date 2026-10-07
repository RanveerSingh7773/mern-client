import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, FieldError, LoadingSpinner, getInputClass } from '../components/FormHelpers';

const validate = (name, email, password) => {
    const errors = {};
    if (!name.trim()) {
        errors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters.';
    }
    if (!email.trim()) {
        errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email (e.g. user@example.com).';
    }
    if (!password) {
        errors.password = 'Password is required.';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
};

const Register = () => {
    const [name, setName]                 = useState('');
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading]       = useState(false);
    const [errors, setErrors]             = useState({});
    const [touched, setTouched]           = useState({});
    const [registerError, setRegisterError] = useState('');

    const { register } = useContext(AuthContext);
    const navigate     = useNavigate();

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(validate(name, email, password));
    };

    const handleChange = (field, value) => {
        if (field === 'name') setName(value);
        else if (field === 'email') setEmail(value);
        else setPassword(value);

        if (touched[field]) {
            const freshErrors = validate(
                field === 'name'     ? value : name,
                field === 'email'    ? value : email,
                field === 'password' ? value : password
            );
            setErrors(prev => ({ ...prev, [field]: freshErrors[field] }));
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setTouched({ name: true, email: true, password: true });
        const errs = validate(name, email, password);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setIsLoading(true);
        try {
            const success = await register(name, email, password);
            if (success) {
                navigate('/');
            } else {
                setRegisterError('Registration failed. This email might already be registered.');
            }
        } catch (err) {
            setRegisterError('Something went wrong. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 glass-card hover:scale-100 p-10">

                <div>
                    <h2 className="mt-6 text-center text-4xl font-serif text-gray-800">Create Account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 font-light">Join the Lakshaura Premium Club</p>
                </div>

                {registerError && (
                    <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 flex items-start gap-2 animate-pulse">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {registerError}
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={submitHandler} noValidate>
                    <div>
                        <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            id="register-name"
                            type="text"
                            className={getInputClass('name', touched, errors)}
                            placeholder="Your full name"
                            value={name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            autoComplete="name"
                            disabled={isLoading}
                        />
                        <FieldError msg={touched.name && errors.name} />
                    </div>

                    <div>
                        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <input
                            id="register-email"
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
                        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                className={`${getInputClass('password', touched, errors)} pr-11`}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                autoComplete="new-password"
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
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                'Register'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-gold-DEFAULT hover:underline font-medium">
                            Sign in here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;
