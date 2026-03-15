import Link from 'next/link';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: number;
  image: string;
  ingredients?: string[];
  steps?: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  // Use a fallback image if none provided
  const imgUrl = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

  return (
    <Link href={`/recipes/${recipe.id}`} className="block group h-full">
      <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 transform group-hover:-translate-y-1">
        {/* Image Container with aspect ratio */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          {/* Error handling for Next Image can be tricky without domains config, using standard img for flexibility */}
          <img 
            src={imgUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Cooking Time Badge */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-slate-100 dark:border-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.cookingTime} min
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 flex-grow">
            {recipe.description}
          </p>
          
          <div className="mt-4 flex items-center text-primary-500 text-sm font-medium">
            View Recipe
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
