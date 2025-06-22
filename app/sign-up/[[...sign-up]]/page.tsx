'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, MessageSquare, Image, Video, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter()
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const response = await fetch('/api/auth/signup',{
        method:'POST',
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
    })
    if (response.ok) {
          toast.success('Sign in successful');
          router.push('/');
        } else {
          const errorData = await response.json(); 
          toast.error(errorData.message || 'Sign in failed. Please try again.');
        }
    setTimeout(() => {
      setIsLoading(false);
      console.log('Sign up:', formData);
    }, 2000);
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return { strength, label: labels[strength - 1] || '', color: colors[strength - 1] || 'bg-gray-300' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        

        {/* Right Panel - Sign Up Form */}
        <div className="w-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
              <p className="text-muted-foreground">Join thousands of businesses collecting testimonials</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-all duration-200 bg-background
                        ${errors.name 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-border focus:border-primary hover:border-muted-foreground'
                        } focus:outline-none focus:ring-0`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-all duration-200 bg-background
                        ${errors.email 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-border focus:border-primary hover:border-muted-foreground'
                        } focus:outline-none focus:ring-0`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl transition-all duration-200 bg-background
                        ${errors.password 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-border focus:border-primary hover:border-muted-foreground'
                        } focus:outline-none focus:ring-0`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      {passwordStrength.label && (
                        <p className="text-xs text-muted-foreground">
                          Password strength: <span className="font-medium">{passwordStrength.label}</span>
                        </p>
                      )}
                    </div>
                  )}
                  
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl transition-all duration-200 bg-background
                        ${errors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-border focus:border-primary hover:border-muted-foreground'
                        } focus:outline-none focus:ring-0`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <button
                    type="button"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`flex items-center justify-center w-5 h-5 border-2 rounded transition-all duration-200 mt-0.5
                      ${agreedToTerms 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-border hover:border-primary'
                      }`}
                  >
                    {agreedToTerms && <Check className="w-3 h-3" />}
                  </button>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{' '}
                    <button className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Privacy Policy
                    </button>
                  </div>
                </div>
                {errors.terms && <p className="text-red-500 text-sm ml-8">{errors.terms}</p>}
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl font-semibold 
                  hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

           


            {/* Sign In Link */}
            <p className="text-center text-muted-foreground">
              Already have an account?{' '}
              <button className="text-primary hover:text-primary/80 font-semibold transition-colors" onClick={()=>router.push('/sign-in')}>
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;