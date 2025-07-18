import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  description: string | null;
  product_count?: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        // Fetch product counts for each category
        const categoriesWithCounts = await Promise.all(
          (categoriesData || []).map(async (category) => {
            const { count } = await supabase
              .from('products')
              .select('id', { count: 'exact' })
              .eq('category_id', category.id);
            
            return {
              ...category,
              product_count: count || 0
            };
          })
        );
        
        setCategories(categoriesWithCounts);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of business products organized by category
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">Categories will appear here once they are added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.product_count} products
                    </span>
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                      View Products
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;