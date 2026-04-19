import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light-bg text-text-main selection:bg-gold-DEFAULT selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        <WhatsAppButton />
        <footer className="border-t border-white border-opacity-10 py-8 mt-auto">
            <div className="text-center text-sm text-gray-500 font-light">
                &copy; {new Date().getFullYear()} Lakshaura. The Essence of Luxury. All rights reserved.
            </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
