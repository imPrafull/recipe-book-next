'use client';

import { useState } from 'react';
import { Recipe } from './RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStepProps {
  id: string;
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled: boolean;
}

function SortableStep({ id, index, value, onChange, onRemove, disabled }: SortableStepProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 pt-2.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-shrink-0 pt-2.5 font-medium text-muted-foreground w-6 text-right text-sm">
        {index + 1}.
      </div>
      <div className="flex-1">
        <Textarea
          required={index === 0}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Describe step ${index + 1}...`}
          className="resize-none"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={disabled}
        className="text-muted-foreground hover:text-destructive self-start mt-0.5"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

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
  const [stepIds, setStepIds] = useState<string[]>(() =>
    (initialData?.steps?.length ? initialData.steps : ['']).map((_, i) => `step-${Date.now()}-${i}`)
  );

  const sensors = useSensors(useSensor(PointerSensor));

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
    else {
      setSteps([...steps, '']);
      setStepIds([...stepIds, `step-${Date.now()}`]);
    }
  };

  const removeDynamicField = (index: number, type: 'ingredients' | 'steps') => {
    if (type === 'ingredients') {
      if (ingredients.length > 1) {
        setIngredients(ingredients.filter((_, i) => i !== index));
      }
    } else {
      if (steps.length > 1) {
        setSteps(steps.filter((_, i) => i !== index));
        setStepIds(stepIds.filter((_, i) => i !== index));
      }
    }
  };

  const handleStepDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = stepIds.indexOf(active.id as string);
      const newIndex = stepIds.indexOf(over.id as string);
      setSteps(arrayMove(steps, oldIndex, newIndex));
      setStepIds(arrayMove(stepIds, oldIndex, newIndex));
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
          <Label htmlFor="title">Recipe Title</Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Creamy Garlic Pasta..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Short Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this delightful dish..."
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cookingTime">Cooking Time (minutes)</Label>
          <div className="relative">
            <Input
              type="number"
              id="cookingTime"
              min="0"
              required
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
              placeholder="30"
              className="pr-12"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground text-sm">
              min
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            type="url"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-semibold">Ingredients</Label>
          <Button 
            type="button" 
            variant="secondary"
            size="sm"
            onClick={() => addDynamicField('ingredients')}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  required={index === 0}
                  value={ingredient}
                  onChange={(e) => handleDynamicChange(index, e.target.value, 'ingredients')}
                  placeholder={`Ingredient ${index + 1}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDynamicField(index, 'ingredients')}
                disabled={ingredients.length <= 1}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-semibold">Cooking Steps</Label>
          <Button 
            type="button" 
            variant="secondary"
            size="sm"
            onClick={() => addDynamicField('steps')}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </div>
        <div className="space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
            <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
              {steps.map((step, index) => (
                <SortableStep
                  key={stepIds[index]}
                  id={stepIds[index]}
                  index={index}
                  value={step}
                  onChange={(val) => handleDynamicChange(index, val, 'steps')}
                  onRemove={() => removeDynamicField(index, 'steps')}
                  disabled={steps.length <= 1}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 h-11"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : submitLabel}
        </Button>
      </div>
    </form>
  );
}
