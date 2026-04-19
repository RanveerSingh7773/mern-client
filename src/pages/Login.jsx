import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 glass-card p-10">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-serif text-gray-800">Sign In</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 font-light">Access your luxurios profile</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-yellow-600 focus:border-yellow-600 focus:z-10 sm:text-sm transition duration-300"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-yellow-600 focus:border-yellow-600 focus:z-10 sm:text-sm transition duration-300"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="w-full flex justify-center btn-primary">
                            Sign In
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
            </div>
        </div>
    );
};

export default Login;
