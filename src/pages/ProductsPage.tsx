import React, { useEffect, useState } from 'react';
import { Filter, Grid, List, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sku: string;
  stock_quantity: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductsPageProps {
  searchQuery: string;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

  useEffect(() => {
    const fetchData = async () => {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*')
      ]);

      if (productsResult.error) {
        console.error('Error fetching products:', productsResult.error);
      } else {
        setProducts(productsResult.data || []);
      }

      if (categoriesResult.error) {
        console.error('Error fetching categories:', categoriesResult.error);
      } else {
        setCategories(categoriesResult.data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory = selectedCategory === '' || product.category_id === selectedCategory;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100 slide-up">
              <div className="flex items-center mb-6">
                <Filter className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange({ min: 0, max: 10000 });
                }}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 font-medium shadow-md hover:shadow-lg"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Products</h1>
                  <p className="text-gray-600 mt-1">
                    {sortedProducts.length} products found
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="h-48 bg-gray-300 rounded-xl mb-4 shimmer"></div>
                    <div className="h-4 bg-gray-300 rounded-lg mb-2 shimmer"></div>
                    <div className="h-4 bg-gray-300 rounded-lg mb-4 w-3/4 shimmer"></div>
                    <div className="h-6 bg-gray-300 rounded-lg w-1/2 shimmer"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-16 text-center border border-gray-100 slide-up">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-lg">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedProducts.map((product, index) => (
                  <div key={product.id} className="slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;