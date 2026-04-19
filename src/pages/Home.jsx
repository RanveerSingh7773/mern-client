import { useState, useEffect } from 'react';
import axios from 'axios';
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

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Assuming backend runs on 5000
                const { data } = await axios.get('http://localhost:5000/api/products');
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Local data mapped from the ph folder
    const localPerfumes = [
        { _id: 'ph1', name: 'Royal Gold', brand: 'Lakshaura', description: 'A majestic blend of fine spices and rich elements.', price: 120, image: img1 },
        { _id: 'ph2', name: 'Mystic Oud', brand: 'Lakshaura', description: 'Deep, woody, and long-lasting aroma.', price: 150, image: img2 },
        { _id: 'ph3', name: 'Velvet Rose', brand: 'Lakshaura', description: 'Soft and luxurious rose notes for an elegant touch.', price: 110, image: img3 },
        { _id: 'ph4', name: 'Oceanic Breeze', brand: 'Lakshaura', description: 'Fresh, aquatic, and deeply invigorating.', price: 95, image: img4 },
        { _id: 'ph5', name: 'Amber Nights', brand: 'Lakshaura', description: 'Warm amber layered with a subtle touch of vanilla.', price: 140, image: img5 },
        { _id: 'ph6', name: 'Midnight Musk', brand: 'Lakshaura', description: 'Intensely captivating and mysterious musk.', price: 135, image: img6 },
        { _id: 'ph7', name: 'Citrus Bloom', brand: 'Lakshaura', description: 'Bright and energetic burst of fresh citrus.', price: 85, image: img7 },
        { _id: 'ph8', name: 'Sandalwood Touch', brand: 'Lakshaura', description: 'Earthy, grounding, and exceptionally smooth.', price: 160, image: img8 },
        { _id: 'ph9', name: 'Floral Fantasy', brand: 'Lakshaura', description: 'A beautiful bouquet of rare, exotic flowers.', price: 125, image: img9 },
        { _id: 'ph10', name: 'Spicy Leather', brand: 'Lakshaura', description: 'A bold, confident, and unforgettable scent.', price: 170, image: img10 },
        { _id: 'ph11', name: 'Vanilla Dream', brand: 'Lakshaura', description: 'Sweet, comforting, and irresistibly warm.', price: 105, image: img11 },
        { _id: 'ph12', name: 'Desert Mirage', brand: 'Lakshaura', description: 'Evocative, mysterious, and beautifully crafted.', price: 180, image: img12 },
    ];

   
    const displayProducts = [...products, ...localPerfumes];

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
                        <h2 className="text-5xl md:text-7xl font-serif text-text-main mb-4">Essence of <br/><span className="text-gold-DEFAULT italic">Luxury</span></h2>
                        <p className="text-gray-600 text-lg md:text-xl mb-8 font-light">
                            Discover our curated collection of the world's most exquisite fragrances. Handpicked for the connoisseur.
                        </p>
                        <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="btn-primary text-lg px-8 py-3">Explore Collection</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-16">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-serif text-text-main border-l-4 border-gold-DEFAULT pl-4">Our Unique Collection</h2>
                </div>
                
                {loading && products.length === 0 ? (
                    <div className="text-center text-gold-DEFAULT py-20 animate-pulse">Summoning the essence...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {displayProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
