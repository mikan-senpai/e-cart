import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sku: string;
  stock_quantity: number;
}

interface ProductRecommendationsProps {
  currentProductId?: string;
  categoryId?: string;
  title?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  currentProductId,
  categoryId,
  title = "You might also like"
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      let query = supabase.from('products').select('*').limit(4);

      if (currentProductId) {
        query = query.neq('id', currentProductId);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recommendations:', error);
      } else {
        setRecommendations(data || []);
      }
      setLoading(false);
    };

    fetchRecommendations();
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-48 bg-gray-300 rounded-xl mb-4 shimmer"></div>
              <div className="h-4 bg-gray-300 rounded-lg mb-2 shimmer"></div>
              <div className="h-4 bg-gray-300 rounded-lg mb-4 w-3/4 shimmer"></div>
              <div className="h-6 bg-gray-300 rounded-lg w-1/2 shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 slide-up">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product, index) => (
          <div key={product.id} className="slide-up" style={{animationDelay: `${index * 0.1}s`}}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;