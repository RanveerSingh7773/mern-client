import { Link } from 'react-router-dom';
import img2 from '../assets/ph/2..jpeg';

const About = () => {
    return (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 mt-10 mb-20 min-h-[70vh]">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-14 shadow-2xl flex flex-col items-center gap-12 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-DEFAULT to-transparent shadow-[0_0_20px_rgba(255,215,0,0.5)]"></div>
                <h1 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-widest">About <span className="italic text-gold-DEFAULT lowercase">Lakshaura</span></h1>
                
                <div className="max-w-4xl w-full">
                    <img 
                        src={img2} 
                        alt="About Lakshaura" 
                        className="rounded-3xl w-full h-[400px] object-cover border border-gray-800 shadow-2xl mb-12"
                    />
                </div>

                <div className="max-w-3xl">
                    <h2 className="text-2xl font-serif text-white mb-6">The Heritage of Fine Fragrance</h2>
                    <p className="text-gray-400 mb-6 leading-relaxed font-light text-lg">
                        Welcome to Lakshaura, where the ancient art of perfumery meets modern luxury. Every drop of our carefully crafted fragrances tells a story of passion, elegance, and extreme attention to detail. 
                    </p>
                    <p className="text-gray-400 mb-10 leading-relaxed font-light text-lg">
                        Our master perfumers source the rarest ingredients from around the globe—from the deep oud forests to blooming floral valleys—blending them into captivating masterpieces designed to leave an unforgettable impression on your soul.
                    </p>
                    <Link to="/" className="bg-gold-DEFAULT hover:bg-yellow-500 text-black font-semibold text-lg px-8 py-3 rounded-xl transition">
                        Explore Collection
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;
