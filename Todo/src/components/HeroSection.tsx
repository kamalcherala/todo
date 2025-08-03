import React from 'react';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Welcome Header */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Welcome to{' '}
            <span className="text-primary">TodoWeb</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Organize your tasks efficiently and boost your productivity
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative flex flex-col gap-6 items-center max-w-4xl mx-auto">
          {/* Centered Get Started button with curved highlight */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full blur-2xl scale-125"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full blur-xl scale-110 animate-pulse"></div>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="relative h-20 px-16 text-xl font-bold rounded-full shadow-2xl hover:shadow-primary/60 transition-all duration-300 hover:scale-110 z-10"
            >
              <ArrowRight className="w-6 h-6 mr-4" />
              Get Started as Guest
            </Button>
          </div>
          
          {/* Login and Register below */}
          <div className="flex justify-center items-center gap-6">
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-2">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            
            <Link to="/register">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-2">
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
            </Link>
          </div>
        </div>

        {/* Simple Feature List */}
        <div className="pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl">📝</div>
              <h3 className="font-medium text-foreground">Simple Tasks</h3>
              <p className="text-sm text-muted-foreground">Create and manage your to-do items</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">⏰</div>
              <h3 className="font-medium text-foreground">Reminders</h3>
              <p className="text-sm text-muted-foreground">Set dates and times for your tasks</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎯</div>
              <h3 className="font-medium text-foreground">Priorities</h3>
              <p className="text-sm text-muted-foreground">Organize by importance levels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;