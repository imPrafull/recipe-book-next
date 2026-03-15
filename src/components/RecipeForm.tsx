'use client';

import { useState } from 'react';
import { Recipe } from './RecipeCard';

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSubmit: (data: Partial<Recipe>) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

export default function RecipeForm({ initialData, onSubmit, isLoading, submitLabel }: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [cookingTime, setCookingTime] = useState(initialData?.cookingTime?.toString() || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients?.length ? initialData.ingredients : ['']);
  const [steps, setSteps] = useState<string[]>(initialData?.steps?.length ? initialData.steps : ['']);

  const handleDynamicChange = (index: number, value: string, type: 'ingredients' | 'steps') => {
    if (type === 'ingredients') {
      const newIngredients = [...ingredients];
      newIngredients[index] = value;
      setIngredients(newIngredients);
    } else {
      const newSteps = [...steps];
      newSteps[index] = value;
      setSteps(newSteps);
    }
  };

  const addDynamicField = (type: 'ingredients' | 'steps') => {
    if (type === 'ingredients') setIngredients([...ingredients, '']);
    else setSteps([...steps, '']);
  };

  const removeDynamicField = (index: number, type: 'ingredients' | 'steps') => {
    if (type === 'ingredients') {
      if (ingredients.length > 1) {
        setIngredients(ingredients.filter((_, i) => i !== index));
      }
    } else {
      if (steps.length > 1) {
        setSteps(steps.filter((_, i) => i !== index));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      cookingTime: parseInt(cookingTime) || 0,
      image,
      ingredients: ingredients.filter(i => i.trim() !== ''),
      steps: steps.filter(s => s.trim() !== '')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Recipe Title</label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 border px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500 shadow-sm transition-colors outline-none placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="E.g., Creamy Garlic Pasta..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Short Description</label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 border px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500 shadow-sm transition-colors outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Describe this delightful dish..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cookingTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Cooking Time (minutes)</label>
          <div className="relative">
            <input
              type="number"
              id="cookingTime"
              min="0"
              required
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
              className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 border pl-4 pr-12 py-2.5 focus:border-primary-500 focus:ring-primary-500 shadow-sm transition-colors outline-none placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="30"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 dark:text-slate-500">
              min
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Image URL</label>
          <input
            type="url"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 border px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500 shadow-sm transition-colors outline-none placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <label className="block text-lg font-semibold text-slate-800 dark:text-slate-100 text-left mb-4 flex justify-between items-center">
          Ingredients
          <button 
            type="button" 
            onClick={() => addDynamicField('ingredients')}
            className="text-sm text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Item
          </button>
        </label>
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  required={index === 0}
                  value={ingredient}
                  onChange={(e) => handleDynamicChange(index, e.target.value, 'ingredients')}
                  className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 border px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500 shadow-sm transition-colors outline-none placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder={`Ingredient ${index + 1}`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDynamicField(index, 'ingredients')}
                disabled={ingredients.length <= 1}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <label className="block text-lg font-semibold text-slate-800 dark:text-slate-100 text-left mb-4 flex justify-between items-center">
          Cooking Steps
          <button 
            type="button" 
            onClick={() => addDynamicField('steps')}
            className="text-sm text-secondary-600 hover:text-secondary-700 bg-secondary-50 hover:bg-secondary-100 px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Step
          </button>
        </label>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 pt-2 font-medium text-slate-400 dark:text-slate-500 w-6 text-right">
                {index + 1}.
              </div>
              <div className="flex-1">
                <textarea
                  required={index === 0}
                  rows={2}
                  value={step}
                  onChange={(e) => handleDynamicChange(index, e.target.value, 'steps')}
                  className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 border px-4 py-2.5 focus:border-secondary-500 focus:ring-secondary-500 shadow-sm transition-colors outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder={`Describe step ${index + 1}...`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDynamicField(index, 'steps')}
                disabled={steps.length <= 1}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors self-start mt-0.5 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-full py-3 px-8 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto text-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}
