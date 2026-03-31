import Link from 'next/link';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';

export default function Navbar() {
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

          {/* Add Recipe Action */}
          <div className="flex items-center">
            <Button asChild className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5">
              <Link href="/recipes/new">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Recipe
              </Link>
            </Button>
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
