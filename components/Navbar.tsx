'use client'
import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, User, Building2, FileText, Code, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter()

  const {user, signIn, signOut, isLoading, isSignedIn} = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const navItems = [
    { name: 'Organizations', href: '/organization', icon: Building2 },
    { name: 'Forms', href: '/forms', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        <button className='cursor-pointer' onClick={()=>router.push('/')}>
          <div className="flex-shrink-0">
            <div className="flex items-center">
              
              <div className="bg-primary rounded-lg p-2">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">
                TrueWords
              </span>
              
            </div>
          </div>
          </button>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {isSignedIn && navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {isSignedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-sm rounded-full hover:bg-accent hover:text-accent-foreground px-3 py-2 transition-colors duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground font-medium">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                
                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Profile
                    </a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Settings
                    </a>
                    <div className="border-t">
                      <button 
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/sign-in')}
                className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {/* Mobile Sign In/User Info */}
              {isSignedIn ? (
                <div className="px-3 py-2 border-b mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/sign-in')}
                  className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 mb-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
              )}
              
              {/* Mobile Nav Items */}
              {isSignedIn && navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
              
              {/* Mobile Sign Out */}
              {isSignedIn && (
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full text-left text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 border-t mt-2 pt-4"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;