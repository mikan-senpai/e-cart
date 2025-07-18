import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Package, Users, Shield, Headphones } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import Marquee from '../components/Marquee';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sku: string;
  stock_quantity: number;
}

const HomePage: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(12);

      if (error) {
        console.error('Error fetching best sellers:', error);
      } else {
        setBestSellers(data || []);
      }
      setLoading(false);
    };

    fetchBestSellers();
  }, []);

  const features = [
    {
      icon: <Package className="h-6 w-6" />,
      title: "Bulk Orders",
      description: "Competitive pricing for business quantities"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "B2B Focus",
      description: "Tailored for business customers"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Enterprise-grade security"
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "24/7 Support",
      description: "Dedicated business support"
    }
  ];

  const brands = [
    "Samsung", "Apple", "Dell", "HP", "Lenovo", "Microsoft", "Canon", "Epson", "Sony", "LG"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center space-y-6 animate-slideUp">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="h-3 w-3 mr-1" />
              India's Leading B2B Marketplace
            </Badge>
            <h1 className="text-display">
              Your Business
              <span className="block text-primary">Marketplace</span>
            </h1>
            <p className="text-subheading text-muted-foreground max-w-2xl mx-auto">
              Discover thousands of products for your business needs with competitive pricing, 
              bulk ordering, and reliable service across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="py-8 border-y bg-white">
        <div className="container-custom">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Trusted by businesses across India
          </p>
          <Marquee className="py-4" pauseOnHover>
            <div className="flex items-center space-x-12 mr-12">
              {brands.map((brand, index) => (
                <div key={index} className="text-lg font-semibold text-muted-foreground whitespace-nowrap">
                  {brand}
                </div>
              ))}
            </div>
          </Marquee>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-heading mb-4">Why Choose E-mart?</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              We provide everything your business needs with our comprehensive B2B solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 card-hover animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8 animate-fadeIn">
            <div>
              <h2 className="text-heading mb-2">Best Sellers</h2>
              <p className="text-body text-muted-foreground">
                Most popular products among businesses
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid-responsive">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid-responsive">
              {bestSellers.map((product, index) => (
                <div key={product.id} className="animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Products" },
              { number: "500+", label: "Brands" },
              { number: "50K+", label: "Customers" },
              { number: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <div key={index} className="animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h2 className="text-heading">Ready to Start Your Business Journey?</h2>
            <p className="text-body opacity-90">
              Join thousands of businesses who trust E-mart for their procurement needs across India.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Account Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;