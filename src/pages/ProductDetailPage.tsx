import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Package, Star, Truck, Shield, Clock, Heart, Share2, GitCompare as Compare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import ProductRecommendations from '../components/ProductRecommendations';
import ProductReviews from '../components/ProductReviews';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sku: string;
  stock_quantity: number;
  category_id: string;
  created_at: string;
  category?: {
    name: string;
  };
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .eq('id', productId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
        } else {
          setProduct(data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user || !product) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      // Show success feedback (you could add a toast notification here)
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // In a real app, this would update the database
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out this product: ${product?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Product not found'}
          </h2>
          <p className="text-gray-500 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <span className="text-gray-700">{product.category.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 truncate">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-md overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>4.5 (24 reviews)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-lg text-gray-500">per unit</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Bulk pricing available for orders over 100 units
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                product.stock_quantity > 10 ? 'bg-green-500' :
                product.stock_quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                product.stock_quantity > 10 ? 'text-green-700' :
                product.stock_quantity > 0 ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {product.stock_quantity > 10 ? 'In Stock' :
                 product.stock_quantity > 0 ? `Only ${product.stock_quantity} left` : 'Out of Stock'}
              </span>
              <span className="text-gray-500">
                ({product.stock_quantity} available)
              </span>
            </div>

            {/* Quantity Selector and Add to Cart */}
            {user && product.stock_quantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => adjustQuantity(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[60px] border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => adjustQuantity(1)}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock_quantity === 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800 text-sm">
                  <Link to="/login" className="font-medium hover:underline">
                    Sign in
                  </Link>{' '}
                  to add items to your cart and place orders.
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Free shipping on orders over $500</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-green-600" />
                <span>1 year warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-5 w-5 text-purple-600" />
                <span>24/7 support</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleWishlist}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-300 transform hover:scale-105">
                <Compare className="h-4 w-4" />
                <span className="text-sm font-medium">Compare</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product Description
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Product Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">SKU:</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="font-medium">{product.category?.name || 'Uncategorized'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Stock:</dt>
                  <dd className="font-medium">{product.stock_quantity} units</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Added:</dt>
                  <dd className="font-medium">
                    {new Date(product.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping & Returns</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Free shipping on orders over $500</li>
                <li>• Standard delivery: 3-5 business days</li>
                <li>• Express delivery: 1-2 business days</li>
                <li>• 30-day return policy</li>
                <li>• Bulk order discounts available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="mt-12">
          <ProductReviews productId={product.id} />
        </div>

        {/* Product Recommendations */}
        <div className="mt-12">
          <ProductRecommendations 
            currentProductId={product.id} 
            categoryId={product.category_id}
            title="Related Products"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;