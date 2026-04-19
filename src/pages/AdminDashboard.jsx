import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ShoppingBag, TrendingUp, RefreshCw } from 'lucide-react';

//Helpers 
const STATUS_COLORS = {
    Pending:   'bg-yellow-900 text-yellow-300 border-yellow-700',
    Shipped:   'bg-blue-900 text-blue-300 border-blue-700',
    Delivered: 'bg-green-900 text-green-300 border-green-700',
};

const EMPTY_FORM = {
    name: '', price: '', brand: '',
    category: 'Perfume', description: '', image: '', countInStock: '',
};

//
const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

    // Products state
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [uploading, setUploading] = useState(false);

    // Orders state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(null); // order ID being updated

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
        } else {
            fetchProducts();
            fetchOrders();
        }
    }, [user, navigate]);

    const authConfig = () => ({
        headers: { Authorization: `Bearer ${user.token}` },
    });

    //Products CRUD 
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data);
        } catch (err) { console.error(err); }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
        setFormError(''); setFormSuccess('');
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name, price: product.price, brand: product.brand,
            category: product.category, description: product.description,
            image: product.image, countInStock: product.countInStock,
        });
        setFormError(''); setFormSuccess('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
        setFormError('');
    };

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('image', file);
        setUploading(true);
        setFormError('');

        try {
            // NOTE: Do NOT set Content-Type manually — axios sets it with correct boundary for FormData
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('http://localhost:5000/api/upload', uploadData, config);
            setFormData(prev => ({ ...prev, image: `http://localhost:5000${data.image}` }));
            setFormSuccess('Image uploaded successfully!');
        } catch (err) {
            console.error(err);
            setFormError('Image upload failed. Make sure the server is running.');
        } finally {
            setUploading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError(''); setFormSuccess('');

        if (!formData.name || !formData.price || !formData.brand) {
            setFormError('Name, Price, and Brand are required.');
            setFormLoading(false); return;
        }
        if (!formData.image) {
            setFormError('Please upload a product image before saving.');
            setFormLoading(false); return;
        }

        try {
            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, formData, authConfig());
                setFormSuccess('Product updated successfully!');
            } else {
                const { data: created } = await axios.post('http://localhost:5000/api/products', {}, authConfig());
                await axios.put(`http://localhost:5000/api/products/${created._id}`, formData, authConfig());
                setFormSuccess('Perfume added successfully!');
            }
            await fetchProducts();
            setTimeout(() => closeModal(), 1200);
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Something went wrong.');
        } finally {
            setFormLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`, authConfig());
                fetchProducts();
            } catch (err) {
                alert(err?.response?.data?.message || 'Delete failed.');
            }
        }
    };

    // ── Orders 
    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/orders', authConfig());
            setOrders(data);
        } catch (err) { console.error(err); }
        finally { setOrdersLoading(false); }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setStatusUpdating(orderId);
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, authConfig());
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert(err?.response?.data?.message || 'Status update failed.');
        } finally {
            setStatusUpdating(null);
        }
    };

    // ── Stats 
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-serif text-gray-800 mb-4 border-b border-gray-200 pb-4">Admin Dashboard</h1>

            {/* ── Stats Cards*/}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-yellow-900 bg-opacity-50 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Products</p>
                        <p className="text-2xl font-bold text-white">{products.length}</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-900 bg-opacity-50 rounded-xl">
                        <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{orders.length}</p>
                        {pendingOrders > 0 && <p className="text-xs text-yellow-400">{pendingOrders} pending</p>}
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-900 bg-opacity-50 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* ── Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 text-sm font-medium transition rounded-t-lg ${
                        activeTab === 'products'
                            ? 'bg-gray-900 text-yellow-400 border-b-2 border-yellow-500'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    🛍️ Products
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 text-sm font-medium transition rounded-t-lg flex items-center gap-2 ${
                        activeTab === 'orders'
                            ? 'bg-gray-900 text-yellow-400 border-b-2 border-yellow-500'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    📦 Orders
                    {pendingOrders > 0 && (
                        <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                            {pendingOrders}
                        </span>
                    )}
                </button>
            </div>

            {/* PRODUCTS TAB*/}
            {activeTab === 'products' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-serif text-yellow-500">Product Inventory</h2>
                        <button onClick={openAddModal} className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition">
                            + Add New Perfume
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs uppercase bg-black bg-opacity-30 text-yellow-500">
                                <tr>
                                    <th className="px-4 py-4">IMAGE</th>
                                    <th className="px-6 py-4">NAME</th>
                                    <th className="px-6 py-4">PRICE</th>
                                    <th className="px-6 py-4">BRAND</th>
                                    <th className="px-6 py-4">STOCK</th>
                                    <th className="px-6 py-4">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-gray-500">
                                            No products yet. Click "+ Add New Perfume" to start.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product._id} className="border-b border-gray-800 hover:bg-white hover:bg-opacity-5 transition">
                                            <td className="px-4 py-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded-lg border border-gray-700"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/48x48/1f2937/9ca3af?text=No+Img'; }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                                            <td className="px-6 py-4 text-yellow-400 font-semibold">₹{product.price}</td>
                                            <td className="px-6 py-4 text-gray-300">{product.brand}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    product.countInStock > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                                }`}>
                                                    {product.countInStock > 0 ? product.countInStock : 'Out'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 space-x-3">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="bg-blue-900 hover:bg-blue-800 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                >
                                                     Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(product._id)}
                                                    className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                >
                                                     Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ORDERS TAB*/}
            {activeTab === 'orders' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-serif text-yellow-500">All Orders</h2>
                        <button
                            onClick={fetchOrders}
                            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>

                    {ordersLoading ? (
                        <div className="text-center py-16 text-yellow-500 animate-pulse">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>No orders yet. Orders will appear here once customers check out.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                                    <div className="flex flex-wrap gap-4 justify-between items-start">
                                        {/* Order Info */}
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs text-gray-500">Order ID: <span className="text-gray-400">{order._id}</span></p>
                                            <p className="text-white font-medium text-lg">
                                                {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                                            </p>
                                            {order.user?.email && (
                                                <p className="text-blue-300 text-sm"> {order.user.email}</p>
                                            )}
                                            {order.shippingAddress?.phone && (
                                                <p className="text-green-300 text-sm"> {order.shippingAddress.phone}</p>
                                            )}
                                            <div className="text-gray-400 text-sm mt-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                                <span className="font-semibold text-gray-300">Shipping Address:</span><br/>
                                                {order.shippingAddress?.address}<br/>
                                                {order.shippingAddress?.city} — {order.shippingAddress?.postalCode}<br/>
                                                {order.shippingAddress?.country}
                                            </div>
                                            <p className="text-gray-500 text-xs mt-2">
                                                Ordered on: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>

                                        {/* Price + Status */}
                                        <div className="flex flex-col items-end gap-3">
                                            <p className="text-xl font-bold text-yellow-500">${order.totalPrice.toFixed(2)}</p>
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[order.status] || STATUS_COLORS.Pending}`}>
                                                {order.status || 'Pending'}
                                            </span>
                                            {/* Status Dropdown */}
                                            <select
                                                value={order.status || 'Pending'}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                disabled={statusUpdating === order._id}
                                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                            {statusUpdating === order._id && (
                                                <p className="text-xs text-yellow-400 animate-pulse">Updating...</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <p className="text-xs text-gray-500 mb-2">Items:</p>
                                        <div className="flex flex-wrap gap-3">
                                            {order.orderItems.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm">
                                                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                                                    <span className="text-gray-300">{item.name}</span>
                                                    <span className="text-gray-500">×{item.qty}</span>
                                                    <span className="text-yellow-400">${item.price}</span>
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

            {/*ADD / EDIT PRODUCT MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-serif text-white">
                                {editingProduct ? 'Edit Perfume' : 'Add New Perfume'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                        </div>

                        {formError && (
                            <div className="mb-4 bg-red-900 bg-opacity-50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">{formError}</div>
                        )}
                        {formSuccess && (
                            <div className="mb-4 bg-green-900 bg-opacity-50 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm">{formSuccess}</div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Perfume Name <span className="text-red-400">*</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleFormChange}
                                    placeholder="e.g. Oud Velvet"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Brand <span className="text-red-400">*</span></label>
                                <input type="text" name="brand" value={formData.brand} onChange={handleFormChange}
                                    placeholder="e.g. Chanel"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price ($) <span className="text-red-400">*</span></label>
                                    <input type="number" name="price" value={formData.price} onChange={handleFormChange}
                                        placeholder="0.00" min="0" step="0.01"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">In Stock</label>
                                    <input type="number" name="countInStock" value={formData.countInStock} onChange={handleFormChange}
                                        placeholder="0" min="0"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleFormChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition">
                                    <option value="Perfume">Perfume</option>
                                    <option value="Eau de Toilette">Eau de Toilette</option>
                                    <option value="Eau de Parfum">Eau de Parfum</option>
                                    <option value="Cologne">Cologne</option>
                                    <option value="Body Mist">Body Mist</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    📷 Product Image <span className="text-red-400">*</span>
                                </label>

                                {/* Current image preview when editing */}
                                {editingProduct && formData.image && (
                                    <div className="mb-3 p-3 bg-gray-800 rounded-xl border border-gray-700">
                                        <p className="text-xs text-gray-500 mb-2">Current Image:</p>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={formData.image}
                                                alt="Current"
                                                className="h-16 w-16 object-cover rounded-lg border border-yellow-700 shadow"
                                                onError={(e) => { e.target.src = 'https://placehold.co/64x64/1f2937/9ca3af?text=Img'; }}
                                            />
                                            <p className="text-xs text-gray-400 break-all">{formData.image}</p>
                                        </div>
                                        <p className="text-xs text-yellow-500 mt-2">⬇ Upload a new image below to replace it</p>
                                    </div>
                                )}

                                {/* File picker */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpg,image/jpeg,image/png,image/webp"
                                        onChange={uploadFileHandler}
                                        className="w-full bg-gray-800 border border-dashed border-gray-600 rounded-xl px-4 py-3 text-gray-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-black hover:file:bg-yellow-500 transition cursor-pointer"
                                    />
                                </div>

                                {/* Upload status */}
                                {uploading && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs text-yellow-400">Uploading image...</p>
                                    </div>
                                )}

                                {/* Preview after new upload */}
                                {!uploading && formData.image && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="h-16 w-16 object-cover rounded-lg border border-green-700 shadow-md"
                                            onError={(e) => { e.target.src = 'https://placehold.co/64x64/1f2937/9ca3af?text=Error'; }}
                                        />
                                        <p className="text-xs text-green-400">✔ Image ready</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleFormChange}
                                    placeholder="Describe the fragrance notes, occasion, etc."
                                    rows={3}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={formLoading}
                                    className="flex-1 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-black font-semibold transition text-sm disabled:opacity-60">
                                    {formLoading ? 'Saving...' : editingProduct ? 'Update Perfume' : 'Add Perfume'}
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
