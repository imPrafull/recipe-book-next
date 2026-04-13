'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  return (
    <nav className="sticky top-0 z-50 w-full glass shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo container */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-primary/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary group-hover:from-primary/80 group-hover:to-secondary/80 transition-all duration-300 drop-shadow-sm">
                Recipe Book
              </span>
            </Link>
          </div>

          {/* SearchBar */}
          <div className="hidden sm:flex flex-1 justify-center px-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isLoading && isAuthenticated ? (
              <>
                <Button asChild className="hidden sm:flex shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5">
                  <Link href="/recipes/new">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Recipe
                  </Link>
                </Button>
                <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : !isLoading && !isAuthenticated ? (
              <>
                <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                </Button>
                <Button asChild className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5">
                  <Link href="/signup">
                    <UserPlus className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Sign up</span>
                  </Link>
                </Button>
              </>
            ) : (
                <div className="w-20 h-10 animate-pulse bg-muted rounded-md" />
            )}
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-4">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}
