import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ✅ Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL;

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

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.username.trim(),
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
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

      const res = await fetch(`${API_URL}/auth/google`, {  // ✅ Fixed quote
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
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
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
      return;
    }

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
            { theme: "outline", size: "large", width: "100%" }
          );
        } else {
          console.warn("Google Client ID not configured");
        }
      }
    };

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
          {/* (keeping your SVG icons unchanged) */}
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Sign in</h2>
            <p className="text-muted-foreground">Welcome back to TodoWeb</p>
          </div>

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

            {/* Remember Me & Forgot Password */}
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

            {/* Google Sign In */}
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

            {/* Terms & Privacy */}
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
