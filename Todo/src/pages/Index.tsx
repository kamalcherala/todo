import React, { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import TodoApp from '@/components/TodoApp';

const Index = () => {
  const [showTodoApp, setShowTodoApp] = useState(false);

  const handleGetStarted = () => {
    setShowTodoApp(true);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {showTodoApp ? (
        <div className="animate-fade-in">
          <TodoApp />
        </div>
      ) : (
        <HeroSection onGetStarted={handleGetStarted} />
      )}
    </div>
  );
};

export default Index;
