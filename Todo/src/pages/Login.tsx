import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.username.trim(),
          password: formData.password
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        // Store token
        localStorage.setItem("token", data.token);
        
        // Store user info if available
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google SSO handler
  const handleCredentialResponse = useCallback(async (response: any) => {
    const credential = response.credential;
    setError('');
    
    try {
      setLoading(true);
      
      const res = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        // Store token
        localStorage.setItem("token", data.token);
        
        // Store user info if available
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(data.error || "Google login failed. Please try again.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
      return;
    }

    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      // @ts-ignore
      if (window.google && window.google.accounts) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (clientId) {
          // @ts-ignore
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });
          
          // @ts-ignore
          window.google.accounts.id.renderButton(
            document.getElementById("googleSignInDiv"),
            { 
              theme: "outline", 
              size: "large",
              width: "100%"
            }
          );
        } else {
          console.warn("Google Client ID not configured");
        }
      }
    };

    // Wait a bit for Google script to load
    const timer = setTimeout(initializeGoogleSignIn, 500);
    
    return () => clearTimeout(timer);
  }, [handleCredentialResponse, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Welcome section */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="text-center z-10 px-8">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome
            <br />
            Back
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Your productivity companion is ready for another great session.
            Let's get things done together.
          </p>
          
          {/* Social icons */}
          <div className="flex justify-center space-x-4 mt-8">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.31-.624-.31-1.548c0-1.45.84-2.53 1.888-2.53.89 0 1.32.668 1.32 1.469 0 .896-.57 2.237-.864 3.481-.246 1.041.522 1.889 1.55 1.889 1.862 0 3.293-1.965 3.293-4.801 0-2.511-1.804-4.266-4.38-4.266-2.984 0-4.737 2.237-4.737 4.552 0 .901.347 1.869.78 2.393.086.099.098.186.072.287-.08.331-.256 1.011-.292 1.152-.047.18-.154.219-.355.132-1.249-.581-2.03-2.407-2.03-3.874 0-3.162 2.292-6.061 6.606-6.061 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017.001z"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Sign in</h2>
            <p className="text-muted-foreground">Welcome back to TodoWeb</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="username"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-card border-border focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 bg-card border-border focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                  disabled={loading}
                />
                <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                  Remember Me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Lost your password?
              </Link>
            </div>

            {/* Sign in button */}
            <Button 
              type="submit" 
              className="w-full h-12 gradient-primary text-white font-semibold hover-glow transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in now'
              )}
            </Button>

            {/* Google sign in */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <div id="googleSignInDiv" className="w-full flex justify-center" />
              
              {/* Fallback Google button if the widget doesn't load */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 border-border hover:bg-accent/50 transition-all"
                disabled={loading}
                onClick={() => {
                  // @ts-ignore
                  if (window.google && window.google.accounts) {
                    // @ts-ignore
                    window.google.accounts.id.prompt();
                  } else {
                    setError('Google Sign-In is not available. Please use email/password.');
                  }
                }}
              >
                <Chrome className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>
            </div>

            {/* Register link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register Now
                </Link>
              </p>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center text-xs text-muted-foreground">
              By clicking on "Sign in now" you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' | '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;