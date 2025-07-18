import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Star, Heart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sku: string;
  stock_quantity: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user) {
      setIsAdding(true);
      try {
        await addToCart(product.id);
        setTimeout(() => setIsAdding(false), 1000);
      } catch (error) {
        setIsAdding(false);
      }
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Card className="group overflow-hidden card-hover animate-fadeIn">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square bg-muted/30 relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          {/* Stock Badge */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge variant={product.stock_quantity > 10 ? "default" : product.stock_quantity > 0 ? "secondary" : "destructive"}>
              {product.stock_quantity > 10 ? 'In Stock' :
               product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                {product.sku}
              </Badge>
            </div>
            
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">(24)</span>
            </div>
            
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="text-xs text-muted-foreground">per unit</span>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0">
        {user && (
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isAdding}
            className="w-full"
            size="sm"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        )}
        {!user && (
          <Button variant="outline" className="w-full" size="sm" asChild>
            <Link to="/login">Sign in to purchase</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;