import React, { createContext, useContext, useState, useEffect } from 'react';

const RatingContext = createContext();

export const RatingProvider = ({ children }) => {
  const [ratings, setRatings] = useState(() => {
    const savedRatings = localStorage.getItem('productRatings');
    return savedRatings ? JSON.parse(savedRatings) : {};
  });

  useEffect(() => {
    localStorage.setItem('productRatings', JSON.stringify(ratings));
  }, [ratings]);

  const updateRating = (productId, newRating) => {
    setRatings(prev => ({
      ...prev,
      [productId]: parseFloat(newRating)
    }));
  };

  return (
    <RatingContext.Provider value={{ ratings, updateRating }}>
      {children}
    </RatingContext.Provider>
  );
};

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
}; 