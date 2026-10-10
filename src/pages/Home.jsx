import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import ProductCard from '../components/ProductCard';

// Importing local images from ph folder
import img1 from '../assets/ph/1.jpeg';
import img2 from '../assets/ph/2..jpeg';
import img3 from '../assets/ph/3..jpeg';
import img4 from '../assets/ph/4..jpeg';
import img5 from '../assets/ph/5..jpeg';
import img6 from '../assets/ph/6..jpeg';
import img7 from '../assets/ph/7..jpeg';
import img8 from '../assets/ph/8.jpeg';
import img9 from '../assets/ph/9.jpeg';
import img10 from '../assets/ph/10.jpeg';
import img11 from '../assets/ph/11.jpeg';
import img12 from '../assets/ph/12.jpeg';

// Local perfumes — always available instantly (no API wait)
const localPerfumes = [
    { _id: 'ph1', name: 'Royal Gold', brand: 'Lakshaura', description: 'A majestic blend of fine spices and rich elements.', price: 120, image: img1 },
    { _id: 'ph2', name: 'Royal Gold', brand: 'Lakshaura', description: 'Deep, woody, and long-lasting aroma.', price: 150, image: img2 },
    { _id: 'ph3', name: 'ER7', brand: 'Lakshaura', description: 'Soft and luxurious rose notes for an elegant touch.', price: 110, image: img3 },
    { _id: 'ph4', name: 'ER7', brand: 'Lakshaura', description: 'Fresh, aquatic, and deeply invigorating.', price: 95, image: img4 },
    { _id: 'ph5', name: 'Noir', brand: 'Lakshaura', description: 'Warm amber layered with a subtle touch of vanilla.', price: 140, image: img5 },
    { _id: 'ph6', name: 'Noir', brand: 'Lakshaura', description: 'Intensely captivating and mysterious musk.', price: 135, image: img6 },
    { _id: 'ph7', name: 'White Oud', brand: 'Lakshaura', description: 'Bright and energetic burst of fresh citrus.', price: 85, image: img7 },
    { _id: 'ph8', name: 'White Oud', brand: 'Lakshaura', description: 'Earthy, grounding, and exceptionally smooth.', price: 160, image: img8 },
    { _id: 'ph9', name: 'Dep Sea', brand: 'Lakshaura', description: 'A beautiful bouquet of rare, exotic flowers.', price: 125, image: img9 },
    { _id: 'ph10', name: 'Choco Musk', brand: 'Lakshaura', description: 'A bold, confident, and unforgettable scent.', price: 170, image: img10 },
    { _id: 'ph11', name: 'Choco Musk', brand: 'Lakshaura', description: 'Sweet, comforting, and irresistibly warm.', price: 105, image: img11 },
    { _id: 'ph12', name: 'POLO SPORTS', brand: 'Lakshaura', description: 'EAU DE PAFUM.', price: 180, image: img12 },
];

// Skeleton card shown while API products are loading
const SkeletonCard = () => (
    <div className="rounded-2xl overflow-hidden shadow-md bg-white animate-pulse">
        <div className="h-64 bg-gray-200" />
        <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-1/3 mt-2" />
        </div>
    </div>
);

const Home = () => {
    // Start with local products immediately — no waiting
    const [apiProducts, setApiProducts] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        // Give Render backend max 8 seconds — then just show local products cleanly
        const timeout = setTimeout(() => controller.abort(), 8000);

        const fetchProducts = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/products?t=${Date.now()}`, {
                    signal: controller.signal,
                });
                setApiProducts(data);
            } catch (error) {
                if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
                    console.error('API fetch error:', error);
                }
                // On timeout or error — silently show local products only
            } finally {
                clearTimeout(timeout);
                setApiLoading(false);
            }
        };
        fetchProducts();

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, []);


    // Local products always show immediately; API products appear when ready
    const displayProducts = [...apiProducts, ...localPerfumes];

    return (
        <div className="w-full">

            <div className="relative h-[60vh] rounded-2xl overflow-hidden mb-16 shadow-lg bg-light-bg">
                <img
                    src={img1}
                    alt="Hero Perfume"
                    className="w-full h-full object-contain object-right"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-light-bg via-light-bg/80 to-transparent flex items-center">
                    <div className="p-12 max-w-2xl">
                        <span className="text-gold-DEFAULT tracking-[0.3em] font-semibold uppercase text-sm mb-2 block">Lakshaura</span>
                        <h2 className="text-5xl md:text-7xl font-serif text-text-main mb-4">Essence of <br /><span className="text-gold-DEFAULT italic">Luxury</span></h2>
                        <p className="text-gray-600 text-lg md:text-xl mb-8 font-light">
                            Discover our curated collection of the world's most exquisite fragrances. Handpicked for the connoisseur.
                        </p>
                        <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="btn-primary text-lg px-8 py-3">Explore Collection</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-16">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-serif text-text-main border-l-4 border-gold-DEFAULT pl-4">Our Unique Collection</h2>
                    {apiLoading && (
                        <span className="text-xs text-gold-DEFAULT animate-pulse tracking-widest uppercase">Loading more...</span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* API skeleton cards shown at top while loading */}
                    {apiLoading && (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    )}
                    {/* All products — local ones always visible instantly */}
                    {displayProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
