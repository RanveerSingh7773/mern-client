import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { 
    LayoutDashboard,
    Package, 
    ShoppingBag, 
    TrendingUp, 
    RefreshCw, 
    Plus, 
    Edit3, 
    Trash2, 
    Upload, 
    CheckCircle, 
    XCircle, 
    ShieldCheck, 
    Clock, 
    MapPin, 
    Phone, 
    Mail,
    Tag,
    User as UserIcon,
    AlertTriangle,
    ArrowLeft,
    Search,
    MessageCircle,
    LogOut,
    Sparkles,
    Filter
} from 'lucide-react';

const STATUS_BADGES = {
    Pending:   'bg-amber-50 text-amber-700 border-amber-200',
    Shipped:   'bg-blue-50 text-blue-700 border-blue-200',
    Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const EMPTY_FORM = {
    name: '', price: '', brand: '',
    category: 'Perfume', description: '', image: '', countInStock: '',
};

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Active View: 'dashboard' | 'products' | 'orders' | 'sold'
    const [activeTab, setActiveTab] = useState('dashboard');

    // Search and filters state
    const [productSearch, setProductSearch] = useState('');
    const [orderSearch, setOrderSearch]     = useState('');
    const [orderFilter, setOrderFilter]     = useState('ALL'); // 'ALL' | 'Pending' | 'Shipped' | 'Delivered'
    const [soldSearch, setSoldSearch]       = useState('');

    // Toast notification state
    const [toastMessage, setToastMessage]   = useState('');
    const [toastType, setToastType]         = useState('success'); // 'success' | 'error'

    // Products state
    const [products, setProducts]           = useState([]);
    const [showModal, setShowModal]         = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData]           = useState(EMPTY_FORM);
    const [formLoading, setFormLoading]     = useState(false);
    const [formError, setFormError]         = useState('');
    const [formSuccess, setFormSuccess]     = useState('');
    const [uploading, setUploading]         = useState(false);

    // Orders state
    const [orders, setOrders]               = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const authConfig = useCallback(() => ({
        headers: { Authorization: user?.token ? `Bearer ${user.token}` : '' },
    }), [user?.token]);

    // Fetch Products with cache-buster
    const fetchProducts = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/products?t=${Date.now()}`);
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    // Fetch Orders
    const fetchOrders = useCallback(async () => {
        if (!user?.token) return;
        setOrdersLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/orders`, authConfig());
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setOrdersLoading(false);
        }
    }, [user?.token, authConfig]);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/admin-login');
        } else {
            fetchProducts();
            fetchOrders();
        }
    }, [user, navigate, fetchProducts, fetchOrders]);

    // Refresh both products and orders
    const handleRefreshAll = () => {
        fetchProducts();
        fetchOrders();
        showToast('All records synced with database');
    };

    const handleLogout = () => {
        if (window.confirm('Do you want to log out from the admin console?')) {
            logout();
            navigate('/admin-login');
        }
    };

    // Modal Handlers
    const openAddModal = () => {
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
        setFormError('');
        setFormSuccess('');
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            price: product.price || '',
            brand: product.brand || '',
            category: product.category || 'Perfume',
            description: product.description || '',
            image: product.image || '',
            countInStock: product.countInStock ?? '',
        });
        setFormError('');
        setFormSuccess('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
        setFormError('');
        setFormSuccess('');
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Upload handler
    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);
        setUploading(true);
        setFormError('');

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/upload`, uploadData, authConfig());
            setFormData(prev => ({ ...prev, image: `${API_BASE_URL}${data.image}` }));
            setFormSuccess('Image uploaded successfully!');
        } catch (err) {
            console.error(err);
            setFormError('Image upload failed. Ensure server is active.');
        } finally {
            setUploading(false);
        }
    };

    // Form Submit (Add or Edit)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');

        if (!formData.name || !formData.price || !formData.brand) {
            setFormError('Name, Price, and Brand are required fields.');
            setFormLoading(false);
            return;
        }
        if (!formData.image) {
            setFormError('Please upload a product image.');
            setFormLoading(false);
            return;
        }

        try {
            if (editingProduct) {
                await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, formData, authConfig());
                showToast(`"${formData.name}" updated successfully!`);
            } else {
                await axios.post(`${API_BASE_URL}/api/products`, formData, authConfig());
                showToast(`"${formData.name}" added to catalog!`);
            }
            await fetchProducts();
            closeModal();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Something went wrong.');
        } finally {
            setFormLoading(false);
        }
    };

    // Delete Product
    const deleteProduct = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name || 'this perfume'}"? It will be removed from everywhere.`)) {
            try {
                setProducts(prev => prev.filter(p => p._id !== id));
                await axios.delete(`${API_BASE_URL}/api/products/${id}`, authConfig());
                try {
                    const stored = localStorage.getItem('cartItems');
                    if (stored) {
                        const parsed = JSON.parse(stored).filter(item => item.product !== id);
                        localStorage.setItem('cartItems', JSON.stringify(parsed));
                    }
                } catch {}
                await fetchProducts();
                showToast(`Product deleted successfully`);
            } catch (err) {
                showToast(err?.response?.data?.message || 'Failed to delete product.', 'error');
                fetchProducts();
            }
        }
    };

    // Order status update
    const handleStatusUpdate = async (orderId, newStatus) => {
        setStatusUpdating(orderId);
        try {
            await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus }, authConfig());
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            showToast(`Order status updated to ${newStatus}`);
        } catch (err) {
            showToast('Failed to update order status.', 'error');
        } finally {
            setStatusUpdating(null);
        }
    };

    // Extract all sold items from customer orders
    const allSoldItems = useMemo(() => {
        return orders.flatMap(order => 
            (order.orderItems || []).map((item, idx) => ({
                id: `${order._id}-${idx}`,
                name: item.name,
                image: item.image,
                price: item.price,
                qty: item.qty || 1,
                totalSalePrice: (item.price || 0) * (item.qty || 1),
                orderId: order._id,
                buyerName: order.shippingAddress?.fullName || order.user?.name || 'Customer',
                buyerPhone: order.shippingAddress?.phone || '',
                orderDate: order.createdAt,
                orderStatus: order.status || 'Pending'
            }))
        );
    }, [orders]);

    // Statistics calculations
    const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0), [orders]);
    const pendingOrders = useMemo(() => orders.filter(o => o.status === 'Pending').length, [orders]);
    const totalUnitsSold = useMemo(() => allSoldItems.reduce((acc, item) => acc + (item.qty || 0), 0), [allSoldItems]);
    const lowStockProducts = useMemo(() => products.filter(p => p.countInStock <= 3), [products]);

    // Filtered Products for Catalog search
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const q = productSearch.toLowerCase();
        return products.filter(p => 
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        );
    }, [products, productSearch]);

    // Filtered Orders
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesStatus = orderFilter === 'ALL' || o.status === orderFilter;
            const q = orderSearch.toLowerCase().trim();
            const matchesSearch = !q || 
                (o._id && o._id.toLowerCase().includes(q)) ||
                (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(q)) ||
                (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
                (o.shippingAddress?.phone && o.shippingAddress.phone.includes(q));
            return matchesStatus && matchesSearch;
        });
    }, [orders, orderFilter, orderSearch]);

    // Filtered Sold Items
    const filteredSoldItems = useMemo(() => {
        if (!soldSearch.trim()) return allSoldItems;
        const q = soldSearch.toLowerCase();
        return allSoldItems.filter(item => 
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.buyerName && item.buyerName.toLowerCase().includes(q)) ||
            (item.buyerPhone && item.buyerPhone.includes(q))
        );
    }, [allSoldItems, soldSearch]);

    // Top selling fragrances
    const topSellingPerfumes = useMemo(() => {
        const counts = {};
        allSoldItems.forEach(item => {
            if (!counts[item.name]) {
                counts[item.name] = { name: item.name, image: item.image, qty: 0, revenue: 0 };
            }
            counts[item.name].qty += item.qty;
            counts[item.name].revenue += item.totalSalePrice;
        });
        return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);
    }, [allSoldItems]);

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            
            {/* Toast Feedback Notification */}
            {toastMessage && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium transition-all duration-300 animate-slide-up ${
                    toastType === 'success' 
                        ? 'bg-gray-900 text-white border border-gold-DEFAULT/40' 
                        : 'bg-red-900 text-white border border-red-500'
                }`}>
                    <CheckCircle className="w-4 h-4 text-gold-DEFAULT" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Navigation & Back Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200/80 gap-4">
                
                {/* Back to Website Button & Title */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gold-DEFAULT bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition shadow-2xs group cursor-pointer"
                            title="Return to Customer Storefront"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-gold-DEFAULT group-hover:-translate-x-0.5 transition-transform" />
                            <span>Back to Store</span>
                        </Link>

                        {activeTab !== 'dashboard' && (
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-DEFAULT hover:text-gold-dark bg-gold-DEFAULT/10 border border-gold-DEFAULT/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Dashboard</span>
                            </button>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-serif text-gray-800 pt-1">
                        Admin Management Console
                    </h1>
                </div>

                {/* Right utility buttons */}
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleRefreshAll}
                        className="btn-outline flex items-center space-x-1.5 py-1.5 px-3.5 text-xs font-medium cursor-pointer"
                        title="Sync latest database records"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1.5 py-1.5 px-3.5 text-xs font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-md bg-white transition cursor-pointer"
                        title="Sign out of Admin"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Layout with TALL LEFT NAVIGATION BAR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 🧭 EXTENDED LEFT NAVIGATION BAR (Taller, Full-Height & Navbar Styled) */}
                <div className="lg:col-span-3 lg:sticky lg:top-24">
                    <div className="glass-card hover:scale-100 p-5 border border-gray-200/90 rounded-2xl shadow-sm bg-white flex flex-col justify-between min-h-[720px]">
                        
                        {/* Top Controls Section */}
                        <div className="space-y-5">
                            
                            {/* Brand Header */}
                            <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-gold-DEFAULT text-white flex items-center justify-center font-serif font-bold text-base shadow-sm">
                                        L.
                                    </div>
                                    <div>
                                        <p className="font-serif font-bold text-gray-800 text-sm tracking-wide">Lakshaura</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Luxury Fragrances</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Online
                                </span>
                            </div>

                            {/* + Add New Product Button */}
                            <div>
                                <button
                                    onClick={openAddModal}
                                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl shadow-sm hover:shadow transition duration-300 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add New Product</span>
                                </button>
                            </div>

                            {/* Navbar-style Navigation Links */}
                            <div className="space-y-1.5">
                                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold px-2 py-1">
                                    Console Navigation
                                </p>

                                {/* 1. Admin Dashboard (Overview) */}
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm transition duration-300 cursor-pointer ${
                                        activeTab === 'dashboard'
                                            ? 'bg-gold-DEFAULT bg-opacity-10 text-gold-DEFAULT font-semibold border border-gold-DEFAULT border-opacity-30 shadow-2xs'
                                            : 'text-gray-600 hover:text-gold-DEFAULT hover:bg-gray-50 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </div>
                                    <Sparkles className="w-3.5 h-3.5 text-gold-DEFAULT opacity-60" />
                                </button>

                                {/* 2. Product Catalog */}
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm transition duration-300 cursor-pointer ${
                                        activeTab === 'products'
                                            ? 'bg-gold-DEFAULT bg-opacity-10 text-gold-DEFAULT font-semibold border border-gold-DEFAULT border-opacity-30 shadow-2xs'
                                            : 'text-gray-600 hover:text-gold-DEFAULT hover:bg-gray-50 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>Product Catalog</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                        activeTab === 'products'
                                            ? 'bg-gold-DEFAULT text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {products.length}
                                    </span>
                                </button>

                                {/* 3. Customer Orders */}
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm transition duration-300 cursor-pointer ${
                                        activeTab === 'orders'
                                            ? 'bg-gold-DEFAULT bg-opacity-10 text-gold-DEFAULT font-semibold border border-gold-DEFAULT border-opacity-30 shadow-2xs'
                                            : 'text-gray-600 hover:text-gold-DEFAULT hover:bg-gray-50 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <Package className="w-4 h-4" />
                                        <span>Customer Orders</span>
                                    </div>
                                    {pendingOrders > 0 ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">
                                            {pendingOrders} Pending
                                        </span>
                                    ) : (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                            activeTab === 'orders' ? 'bg-gold-DEFAULT text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {orders.length}
                                        </span>
                                    )}
                                </button>

                                {/* 4. Sold Items History */}
                                <button
                                    onClick={() => setActiveTab('sold')}
                                    className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm transition duration-300 cursor-pointer ${
                                        activeTab === 'sold'
                                            ? 'bg-gold-DEFAULT bg-opacity-10 text-gold-DEFAULT font-semibold border border-gold-DEFAULT border-opacity-30 shadow-2xs'
                                            : 'text-gray-600 hover:text-gold-DEFAULT hover:bg-gray-50 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <Tag className="w-4 h-4" />
                                        <span>Sold Items History</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                        activeTab === 'sold' ? 'bg-gold-DEFAULT text-white' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {totalUnitsSold} Sold
                                    </span>
                                </button>
                            </div>

                            {/* Low Stock Alert Widget */}
                            {lowStockProducts.length > 0 && (
                                <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-1">
                                    <p className="font-semibold text-amber-800 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span>Stock Alert ({lowStockProducts.length})</span>
                                    </p>
                                    <p className="text-amber-700 text-[11px] font-light leading-relaxed">
                                        Perfumes with low quantity remaining in catalog. Restock soon.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('products')}
                                        className="text-[11px] font-semibold text-gold-DEFAULT hover:underline pt-1 inline-block"
                                    >
                                        View Products &rarr;
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* Bottom Admin Status & Quick Back to Store */}
                        <div className="pt-6 border-t border-gray-100 space-y-3">
                            <div className="flex items-center space-x-2 text-gold-DEFAULT bg-gold-DEFAULT bg-opacity-10 px-3 py-1.5 rounded-full border border-gold-DEFAULT border-opacity-20">
                                <UserIcon className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-semibold truncate">{user?.name || 'Administrator'}</span>
                            </div>

                            <div className="text-[11px] text-gray-500 space-y-1 px-1">
                                <p className="truncate"><span className="text-gray-400">Account:</span> {user?.email}</p>
                                <p className="text-gray-400">Currency: <span className="font-semibold text-gray-700">INR (₹)</span></p>
                            </div>

                            <Link
                                to="/"
                                className="w-full text-xs text-gray-500 hover:text-gold-DEFAULT transition flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Exit to Customer Store</span>
                            </Link>
                        </div>

                    </div>
                </div>

                {/* 📄 MAIN CONTENT AREA (9 columns on large screens) */}
                <div className="lg:col-span-9">

                    {/* 1. ADMIN DASHBOARD OVERVIEW VIEW */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            
                            {/* KPI Metrics Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="glass-card hover:scale-100 p-5 border border-gray-100 rounded-2xl bg-white shadow-2xs">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Total Sales</p>
                                    <p className="text-2xl font-bold text-gold-DEFAULT">₹{totalRevenue.toFixed(2)}</p>
                                    <p className="text-[11px] text-emerald-600 font-medium mt-1">Lifetime Revenue</p>
                                </div>

                                <div className="glass-card hover:scale-100 p-5 border border-gray-100 rounded-2xl bg-white shadow-2xs">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                                    <p className="text-[11px] text-amber-600 font-medium mt-1">{pendingOrders} Pending Action</p>
                                </div>

                                <div className="glass-card hover:scale-100 p-5 border border-gray-100 rounded-2xl bg-white shadow-2xs">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Catalog Items</p>
                                    <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                                    <p className="text-[11px] text-gray-500 font-light mt-1">Active Perfumes</p>
                                </div>

                                <div className="glass-card hover:scale-100 p-5 border border-gray-100 rounded-2xl bg-white shadow-2xs">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Units Sold</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalUnitsSold}</p>
                                    <p className="text-[11px] text-emerald-600 font-medium mt-1">Bottles Purchased</p>
                                </div>
                            </div>

                            {/* Minimal Clean Console State */}
                            <div className="glass-card hover:scale-100 p-10 border border-gray-100 rounded-2xl bg-white shadow-2xs text-center space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-gold-DEFAULT/10 text-gold-DEFAULT flex items-center justify-center mx-auto shadow-2xs">
                                    <LayoutDashboard className="w-7 h-7" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="font-serif font-bold text-gray-800 text-xl">Lakshaura Admin Console</h3>
                                    <p className="text-xs text-gray-500 font-light max-w-lg mx-auto leading-relaxed">
                                        Please click on any option in the left navigation bar (<strong>Product Catalog</strong>, <strong>Customer Orders</strong>, or <strong>Sold Items History</strong>) to view and manage records.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Database Synced
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                                        <ShieldCheck className="w-3.5 h-3.5 text-gold-DEFAULT" />
                                        Secure Admin Session
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. PRODUCT CATALOG VIEW */}
                    {activeTab === 'products' && (
                        <div className="glass-card hover:scale-100 border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
                            
                            {/* Catalog Header with Back Button & Search */}
                            <div className="p-6 border-b border-gray-100 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setActiveTab('dashboard')}
                                                className="text-xs text-gray-500 hover:text-gold-DEFAULT font-medium flex items-center gap-1 cursor-pointer"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                                            </button>
                                            <span className="text-gray-300">/</span>
                                            <h2 className="text-xl font-serif text-gray-800">Product Catalog</h2>
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold-DEFAULT/10 text-gold-DEFAULT border border-gold-DEFAULT/20">
                                                {products.length} Items
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-light mt-1">
                                            Manage perfume inventory, edit pricing, or remove fragrances
                                        </p>
                                    </div>

                                    <button
                                        onClick={openAddModal}
                                        className="btn-primary flex items-center space-x-1.5 py-2 px-4 text-xs font-semibold rounded-xl cursor-pointer shadow-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Fragrance</span>
                                    </button>
                                </div>

                                {/* Search Bar for Catalog */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search by perfume name, brand, or category..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-DEFAULT focus:ring-1 focus:ring-gold-DEFAULT text-gray-800 transition"
                                    />
                                    {productSearch && (
                                        <button 
                                            onClick={() => setProductSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-700">
                                    <thead className="text-xs uppercase bg-gray-50/80 text-gray-500 border-b border-gray-200/70 font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Image</th>
                                            <th className="px-6 py-4">Fragrance</th>
                                            <th className="px-6 py-4">Brand</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-16 text-gray-400">
                                                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300 stroke-1" />
                                                    <p className="font-serif text-lg text-gray-600">
                                                        {productSearch ? 'No fragrances match your search' : 'No products in catalog yet'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {productSearch ? 'Try a different search term or clear the filter.' : 'Click "+ Add Fragrance" to upload your first perfume.'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map((product) => (
                                                <tr key={product._id} className="hover:bg-gold-DEFAULT/5 transition-colors duration-150">
                                                    <td className="px-6 py-4">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm bg-gray-50"
                                                            onError={(e) => { e.target.src = 'https://placehold.co/56x56/f9fafb/9ca3af?text=No+Img'; }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        <span className="font-semibold text-gray-800">{product.name}</span>
                                                        <p className="text-xs text-gray-400 font-light">{product.category || 'Perfume'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 font-light">{product.brand}</td>
                                                    <td className="px-6 py-4 text-gold-DEFAULT font-bold text-base">₹{product.price}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                                            product.countInStock > 0 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}>
                                                            {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out of Stock'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            <button
                                                                onClick={() => openEditModal(product)}
                                                                className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-gray-200 hover:border-gold-DEFAULT hover:text-gold-DEFAULT text-gray-700 transition flex items-center gap-1.5 bg-white shadow-2xs cursor-pointer"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProduct(product._id, product.name)}
                                                                className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition flex items-center gap-1.5 bg-white shadow-2xs cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. CUSTOMER ORDERS VIEW */}
                    {activeTab === 'orders' && (
                        <div className="glass-card hover:scale-100 border border-gray-200/80 rounded-2xl p-6 shadow-sm bg-white">
                            
                            {/* Orders Header with Back Button, Status Filters & Search */}
                            <div className="pb-6 mb-6 border-b border-gray-100 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setActiveTab('dashboard')}
                                                className="text-xs text-gray-500 hover:text-gold-DEFAULT font-medium flex items-center gap-1 cursor-pointer"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                                            </button>
                                            <span className="text-gray-300">/</span>
                                            <h2 className="text-xl font-serif text-gray-800">Customer Orders</h2>
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                {orders.length} Total
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-light mt-1">
                                            Filter customer purchases, track shipping, or message clients directly
                                        </p>
                                    </div>

                                    <button
                                        onClick={fetchOrders}
                                        className="btn-outline flex items-center space-x-1.5 py-1.5 px-4 text-xs font-medium cursor-pointer self-start"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Refresh Orders</span>
                                    </button>
                                </div>

                                {/* Filters + Search Bar Grid */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                    {/* Status Pills */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                        {['ALL', 'Pending', 'Shipped', 'Delivered'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setOrderFilter(status)}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                                                    orderFilter === status
                                                        ? 'bg-gold-DEFAULT text-white font-semibold shadow-2xs'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Order Search */}
                                    <div className="relative flex-1">
                                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search by customer name, phone, or order ID..."
                                            value={orderSearch}
                                            onChange={(e) => setOrderSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-DEFAULT text-gray-800 transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {ordersLoading ? (
                                <div className="text-center py-20 text-gold-DEFAULT font-medium animate-pulse">
                                    Loading customer orders...
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <Package className="w-14 h-14 mx-auto mb-3 text-gray-300 stroke-1" />
                                    <p className="font-serif text-xl text-gray-700">No orders match criteria</p>
                                    <p className="text-xs text-gray-400 mt-1">Try clearing filters or search to view other orders.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {filteredOrders.map((order) => (
                                        <div 
                                            key={order._id} 
                                            className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-gold-DEFAULT/40 transition-all duration-200 shadow-2xs"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-5 border-b border-gray-100">
                                                {/* Order Info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md font-medium">
                                                            #{order._id.slice(-8)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-light flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-serif font-bold text-gray-800">
                                                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                                                    </h3>

                                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                                                        {order.user?.email && (
                                                            <span className="flex items-center gap-1 text-gray-600">
                                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                                {order.user.email}
                                                            </span>
                                                        )}
                                                        {order.shippingAddress?.phone && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center gap-1 text-gray-600">
                                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                                    {order.shippingAddress.phone}
                                                                </span>
                                                                {/* WhatsApp direct customer link */}
                                                                <a
                                                                    href={`https://wa.me/91${order.shippingAddress.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.shippingAddress?.fullName || 'Customer')},%20regarding%20your%20Lakshaura%20Order%20%23${order._id.slice(-8)}:`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                                                                    title="Open WhatsApp chat with customer"
                                                                >
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    <span>WhatsApp</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Delivery Address */}
                                                    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-xs text-gray-600 mt-2 flex items-start gap-2 max-w-md">
                                                        <MapPin className="w-4 h-4 text-gold-DEFAULT mt-0.5 shrink-0" />
                                                        <div>
                                                            <span className="font-semibold text-gray-700">Shipping to: </span>
                                                            {order.shippingAddress?.address}, {order.shippingAddress?.city} — {order.shippingAddress?.postalCode}, {order.shippingAddress?.country || 'India'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price + Status Controller */}
                                                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                                                    <div>
                                                        <p className="text-xs text-gray-400 text-left sm:text-right">Order Value</p>
                                                        <p className="text-2xl font-serif font-bold text-gold-DEFAULT">
                                                            ₹{order.totalPrice?.toFixed(2)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_BADGES[order.status] || STATUS_BADGES.Pending}`}>
                                                            {order.status || 'Pending'}
                                                        </span>

                                                        <select
                                                            value={order.status || 'Pending'}
                                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                            disabled={statusUpdating === order._id}
                                                            className="bg-white border border-gray-300 text-gray-800 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-gold-DEFAULT focus:ring-1 focus:ring-gold-DEFAULT transition cursor-pointer shadow-2xs"
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                        </select>
                                                    </div>

                                                    {statusUpdating === order._id && (
                                                        <p className="text-xs text-gold-DEFAULT animate-pulse font-medium">Updating status...</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="pt-4">
                                                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Items Purchased</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {order.orderItems?.map((item, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="flex items-center gap-3 bg-gray-50 border border-gray-200/70 rounded-xl p-2.5 pr-4 text-xs"
                                                        >
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name} 
                                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-white" 
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                                <p className="text-gray-500 font-light">
                                                                    {item.qty} × <span className="text-gold-DEFAULT font-medium">₹{item.price}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. SOLD ITEMS VIEW (SELL ITEM LIST) */}
                    {activeTab === 'sold' && (
                        <div className="glass-card hover:scale-100 border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
                            
                            {/* Sold Items Header with Back Button & Search */}
                            <div className="p-6 border-b border-gray-100 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setActiveTab('dashboard')}
                                                className="text-xs text-gray-500 hover:text-gold-DEFAULT font-medium flex items-center gap-1 cursor-pointer"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                                            </button>
                                            <span className="text-gray-300">/</span>
                                            <h2 className="text-xl font-serif text-gray-800">Sold Items & Sales History</h2>
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {totalUnitsSold} Units Sold
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-light mt-1">
                                            Detailed sales logs of fragrances bought across all customer orders
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <span className="text-xs text-gray-400">Total Sales Earned: </span>
                                        <span className="text-lg font-bold text-gold-DEFAULT font-serif block sm:inline">
                                            ₹{totalRevenue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Search Bar for Sold Items */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search sold items by perfume name, customer, or phone..."
                                        value={soldSearch}
                                        onChange={(e) => setSoldSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold-DEFAULT text-gray-800 transition"
                                    />
                                    {soldSearch && (
                                        <button 
                                            onClick={() => setSoldSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-700">
                                    <thead className="text-xs uppercase bg-gray-50/80 text-gray-500 border-b border-gray-200/70 font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Item</th>
                                            <th className="px-6 py-4">Fragrance Name</th>
                                            <th className="px-6 py-4 text-center">Qty Sold</th>
                                            <th className="px-6 py-4">Unit Price</th>
                                            <th className="px-6 py-4">Total Amount</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredSoldItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-16 text-gray-400">
                                                    <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300 stroke-1" />
                                                    <p className="font-serif text-lg text-gray-600">
                                                        {soldSearch ? 'No sold items match search' : 'No items sold yet'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {soldSearch ? 'Try clearing your search query.' : 'When customers place orders, sold perfume entries appear here.'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSoldItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-gold-DEFAULT/5 transition-colors duration-150">
                                                    <td className="px-6 py-4">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm bg-gray-50"
                                                            onError={(e) => { e.target.src = 'https://placehold.co/48x48/f9fafb/9ca3af?text=Img'; }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold-DEFAULT/10 text-gold-DEFAULT font-bold text-xs">
                                                            {item.qty}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                                        ₹{item.price}
                                                    </td>
                                                    <td className="px-6 py-4 text-gold-DEFAULT font-bold">
                                                        ₹{item.totalSalePrice?.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        <div className="font-medium text-xs text-gray-900">{item.buyerName}</div>
                                                        <div className="text-[11px] text-gray-400">{item.buyerPhone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 font-light">
                                                        {new Date(item.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGES[item.orderStatus] || STATUS_BADGES.Pending}`}>
                                                            {item.orderStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* ADD / EDIT PRODUCT MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-2xl font-serif text-gray-800">
                                    {editingProduct ? 'Edit Fragrance' : 'Add New Fragrance'}
                                </h3>
                                <p className="text-xs text-gray-500 font-light mt-0.5">
                                    {editingProduct ? 'Update product details and stock' : 'Publish a new luxury perfume to your store'}
                                </p>
                            </div>
                            <button 
                                onClick={closeModal} 
                                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                                <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                                <span>{formError}</span>
                            </div>
                        )}
                        {formSuccess && (
                            <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                                <span>{formSuccess}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Perfume Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Velvet Oud Luxury"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Brand / House <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Lakshaura Private Reserve"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Count in Stock
                                    </label>
                                    <input
                                        type="number"
                                        name="countInStock"
                                        value={formData.countInStock}
                                        onChange={handleFormChange}
                                        placeholder="10"
                                        min="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Fragrance Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleFormChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT transition cursor-pointer"
                                >
                                    <option value="Perfume">Perfume (Parfum)</option>
                                    <option value="Eau de Parfum">Eau de Parfum</option>
                                    <option value="Eau de Toilette">Eau de Toilette</option>
                                    <option value="Cologne">Cologne</option>
                                    <option value="Body Mist">Body Mist</option>
                                </select>
                            </div>

                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Fragrance Image <span className="text-red-500">*</span>
                                </label>

                                {formData.image && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                                            onError={(e) => { e.target.src = 'https://placehold.co/64x64/f9fafb/9ca3af?text=Preview'; }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> Image attached
                                            </p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{formData.image}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpg,image/jpeg,image/png,image/webp"
                                        onChange={uploadFileHandler}
                                        className="w-full bg-gray-50 border border-dashed border-gray-300 hover:border-gold-DEFAULT rounded-xl px-4 py-3 text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold-DEFAULT file:text-white hover:file:bg-gold-dark transition cursor-pointer"
                                    />
                                </div>

                                {uploading && (
                                    <p className="text-xs text-gold-DEFAULT mt-2 font-medium animate-pulse flex items-center gap-1.5">
                                        <Upload className="w-3.5 h-3.5 animate-bounce" /> Uploading image to server...
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Description & Scent Notes
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Top notes of Bergamot, Heart of Turkish Rose, Base of Sandalwood & Oud..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-DEFAULT focus:border-gold-DEFAULT transition resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition text-sm font-medium cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading || uploading}
                                    className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                                >
                                    {formLoading ? 'Saving...' : editingProduct ? 'Update Fragrance' : 'Save Perfume'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
