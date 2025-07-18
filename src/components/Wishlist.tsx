import React, { useState, useEffect } from 'react';
import { Heart, X, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock_quantity: number;
  };
}

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading wishlist items
    setTimeout(() => {
      setWishlistItems([
        {
          id: '1',
          product: {
            id: 'prod-1',
            name: 'Premium Office Chair',
            price: 299.99,
            image_url: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg',
            stock_quantity: 15
          }
        },
        {
          id: '2',
          product: {
            id: 'prod-2',
            name: 'Wireless Keyboard',
            price: 89.99,
            image_url: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg',
            stock_quantity: 25
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [user]);

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddToCart = async (productId: string) => {
    if (user) {
      await addToCart(productId);
      // Optionally remove from wishlist after adding to cart
      // removeFromWishlist(itemId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-500 mb-6">Save your favorite products for later</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 slide-up">
          <div className="flex items-center mb-8">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <span className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {wishlistItems.length} items
            </span>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Start adding products you love to your wishlist</p>
              <Link
                to="/products"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item, index) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-12 bg-gray-100 flex items-center justify-center">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 transform hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <Link to={`/products/${item.product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        ${item.product.price.toFixed(2)}
                      </span>
                      <span className={`text-sm font-medium ${
                        item.product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
                      disabled={item.product.stock_quantity === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 font-medium shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;