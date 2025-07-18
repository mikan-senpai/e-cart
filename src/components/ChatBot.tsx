import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Package, Search, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  products?: Product[];
  suggestions?: string[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock_quantity: number;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your B2B shopping assistant. I can help you find products, check inventory, or answer questions about your orders. What can I help you with today?",
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        "Show me office supplies",
        "Find electronics under $500",
        "What's in my cart?",
        "Track my orders"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchProducts = async (query: string, priceLimit?: number): Promise<Product[]> => {
    let queryBuilder = supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (priceLimit) {
      queryBuilder = queryBuilder.lte('price', priceLimit);
    }

    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error searching products:', error);
      return [];
    }
    
    return data || [];
  };

  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', `%${category}%`)
      .single();

    if (!categoryData) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryData.id)
      .limit(5);

    return data || [];
  };

  const processUserMessage = async (text: string) => {
    const lowerText = text.toLowerCase();
    let botResponse = '';
    let products: Product[] = [];
    let suggestions: string[] = [];

    // Product search patterns
    if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('show')) {
      if (lowerText.includes('office') || lowerText.includes('supplies')) {
        products = await getProductsByCategory('office');
        botResponse = "Here are some office supplies I found for you:";
      } else if (lowerText.includes('electronics') || lowerText.includes('tech')) {
        products = await getProductsByCategory('electronics');
        botResponse = "Here are some electronics products:";
      } else if (lowerText.includes('under') && lowerText.includes('$')) {
        const priceMatch = lowerText.match(/\$(\d+)/);
        const price = priceMatch ? parseInt(priceMatch[1]) : 1000;
        products = await searchProducts('', price);
        botResponse = `Here are products under $${price}:`;
      } else {
        // General search
        const searchTerms = text.replace(/find|search|show|me/gi, '').trim();
        if (searchTerms) {
          products = await searchProducts(searchTerms);
          botResponse = `I found these products matching "${searchTerms}":`;
        }
      }
    }
    // Cart inquiries
    else if (lowerText.includes('cart') || lowerText.includes('basket')) {
      if (user) {
        botResponse = "You can view your cart by clicking the cart icon in the header. Would you like me to help you find more products to add?";
        suggestions = ["Show me trending products", "Find office supplies", "Electronics under $200"];
      } else {
        botResponse = "Please sign in to view your cart. I can help you find products in the meantime!";
        suggestions = ["Show me popular products", "Find electronics", "Office supplies"];
      }
    }
    // Order tracking
    else if (lowerText.includes('order') || lowerText.includes('track')) {
      if (user) {
        botResponse = "You can track your orders in the Dashboard section. Click on your profile menu and select 'Orders' to see all your order history.";
      } else {
        botResponse = "Please sign in to track your orders. Once logged in, you can view all your order history in the Dashboard.";
      }
    }
    // Pricing inquiries
    else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('cheap')) {
      products = await searchProducts('', 100); // Products under $100
      botResponse = "Here are some budget-friendly options:";
      suggestions = ["Show expensive items", "Find mid-range products", "Best sellers"];
    }
    // Help and general
    else if (lowerText.includes('help') || lowerText.includes('what can you do')) {
      botResponse = "I can help you with:\n• Finding products by name or category\n• Checking prices and availability\n• Adding items to your cart\n• Tracking orders\n• Answering questions about our B2B services\n\nWhat would you like to explore?";
      suggestions = ["Find office supplies", "Show electronics", "Check my orders", "Popular products"];
    }
    // Default response
    else {
      botResponse = "I'd be happy to help you find products! Try asking me to:\n• 'Find office supplies'\n• 'Show electronics under $300'\n• 'What's trending?'\n• 'Help with my order'";
      suggestions = ["Show me office supplies", "Find electronics", "Popular products", "Help with orders"];
    }

    return { botResponse, products, suggestions };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const { botResponse, products, suggestions } = await processUserMessage(inputText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
        products,
        suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    handleSendMessage();
  };

  const handleAddToCart = async (productId: string) => {
    if (user) {
      await addToCart(productId);
      const successMessage: Message = {
        id: Date.now().toString(),
        text: "Great! I've added that item to your cart. Would you like to continue shopping or view your cart?",
        isBot: true,
        timestamp: new Date(),
        suggestions: ["View my cart", "Find similar products", "Continue shopping"]
      };
      setMessages(prev => [...prev, successMessage]);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          <Bot className="h-3 w-3" />
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">B2B Assistant</h3>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.isBot
                        ? 'bg-white/80 backdrop-blur-sm text-gray-800 shadow-md border border-gray-100'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                  
                  {/* Product Cards */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.map((product) => (
                        <div key={product.id} className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                              <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                            </div>
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              disabled={!user || product.stock_quantity === 0}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200 transform hover:scale-105"
                            >
                              <ShoppingCart className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.isBot ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                  {message.isBot ? (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about products..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200 transform hover:scale-105 disabled:scale-100"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;