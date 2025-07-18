import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  helpful_count: number;
  verified_purchase: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      user_name: 'John D.',
      rating: 5,
      comment: 'Excellent product quality! Fast delivery and great customer service. Perfect for our office needs.',
      date: '2024-01-15',
      helpful_count: 12,
      verified_purchase: true
    },
    {
      id: '2',
      user_name: 'Sarah M.',
      rating: 4,
      comment: 'Good value for money. The product works as described. Would recommend for business use.',
      date: '2024-01-10',
      helpful_count: 8,
      verified_purchase: true
    },
    {
      id: '3',
      user_name: 'Mike R.',
      rating: 5,
      comment: 'Outstanding quality and reliability. We\'ve ordered multiple units and they all perform excellently.',
      date: '2024-01-05',
      helpful_count: 15,
      verified_purchase: true
    }
  ]);

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmitReview = () => {
    if (!user || !newReview.comment.trim()) return;
    
    // In a real app, this would submit to the database
    console.log('Submitting review:', newReview);
    setNewReview({ rating: 5, comment: '' });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {renderStars(averageRating)}
              <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Rating Distribution</div>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviews.filter(r => r.rating === rating).length;
            const percentage = (count / reviews.length) * 100;
            return (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-3">{rating}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              {renderStars(newReview.rating, true, (rating) => setNewReview(prev => ({ ...prev, rating })))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 focus:shadow-lg"
                placeholder="Share your experience with this product..."
              />
            </div>
            <button
              onClick={handleSubmitReview}
              disabled={!newReview.comment.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-300 transform hover:scale-105 disabled:scale-100 font-medium shadow-lg hover:shadow-xl"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 slide-up" style={{animationDelay: `${index * 0.1}s`}}>
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
                    {review.verified_purchase && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm">Helpful ({review.helpful_count})</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;