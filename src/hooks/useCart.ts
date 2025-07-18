import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string | null;
    sku: string;
  };
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products (
          name,
          price,
          image_url,
          sku
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart items:', error);
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      console.warn('User must be logged in to add items to cart');
      return;
    }

    // First, check current stock
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Error checking product stock:', productError);
      return;
    }

    if (productData.stock_quantity < quantity) {
      console.warn('Not enough stock available');
      return;
    }

    const existingItem = cartItems.find(item => item.product_id === productId);

    if (existingItem) {
      // Check if we have enough stock for the new quantity
      const newQuantity = existingItem.quantity + quantity;
      if (productData.stock_quantity < newQuantity) {
        console.warn('Not enough stock available for requested quantity');
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (error) {
        console.error('Error updating cart item:', error);
      } else {
        // Reduce stock quantity
        await supabase
          .from('products')
          .update({ stock_quantity: productData.stock_quantity - quantity })
          .eq('id', productId);
        
        fetchCartItems();
      }
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

      if (error) {
        console.error('Error adding item to cart:', error);
      } else {
        // Reduce stock quantity
        await supabase
          .from('products')
          .update({ stock_quantity: productData.stock_quantity - quantity })
          .eq('id', productId);
        
        fetchCartItems();
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const cartItem = cartItems.find(item => item.id === itemId);
    if (!cartItem) return;

    // Get current product stock
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', cartItem.product_id)
      .single();

    if (productError) {
      console.error('Error checking product stock:', productError);
      return;
    }

    const quantityDifference = quantity - cartItem.quantity;
    
    // If increasing quantity, check if we have enough stock
    if (quantityDifference > 0 && productData.stock_quantity < quantityDifference) {
      console.warn('Not enough stock available');
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating cart item:', error);
    } else {
      // Update product stock
      await supabase
        .from('products')
        .update({ stock_quantity: productData.stock_quantity - quantityDifference })
        .eq('id', cartItem.product_id);
      
      fetchCartItems();
    }
  };

  const removeFromCart = async (itemId: string) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    if (!cartItem) return;

    // Return stock to product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', cartItem.product_id)
      .single();

    if (!productError) {
      await supabase
        .from('products')
        .update({ stock_quantity: productData.stock_quantity + cartItem.quantity })
        .eq('id', cartItem.product_id);
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing cart item:', error);
    } else {
      fetchCartItems();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    // Return all stock to products
    for (const item of cartItems) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!productError) {
        await supabase
          .from('products')
          .update({ stock_quantity: productData.stock_quantity + item.quantity })
          .eq('id', item.product_id);
      }
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
    } else {
      setCartItems([]);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
};