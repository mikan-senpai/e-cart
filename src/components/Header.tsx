import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, Bell, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-lg transition-transform group-hover:scale-105">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">E-mart</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products">Products</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/categories">Categories</Link>
            </Button>
            
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/wishlist">
                    <Heart className="h-5 w-5" />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                      2
                    </Badge>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    3
                  </Badge>
                </Button>
                
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {totalItems}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <div className="relative group">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      Wishlist
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur">
          <div className="container-custom py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
              <Link to="/products">Products</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
              <Link to="/categories">Categories</Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/cart">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart ({totalItems})
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/wishlist">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/orders">Orders</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;