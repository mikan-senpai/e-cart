import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import Wishlist from './components/Wishlist';
import ChatBot from './components/ChatBot';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage searchQuery={searchQuery} />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<DashboardPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </main>
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;