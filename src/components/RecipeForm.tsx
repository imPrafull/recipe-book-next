'use client';

import { useState, useRef, useCallback } from 'react';
import type { Recipe, Ingredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, GripVertical, ImagePlus, X, StickyNote } from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Common units shown as suggestions in the unit combobox
// ---------------------------------------------------------------------------
const COMMON_UNITS = ['cup', 'tbsp', 'tsp', 'g', 'kg', 'ml', 'l', 'oz', 'lb', 'pcs', 'cloves', 'pinch', 'dash'];

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Unit Combobox — a text input that shows matching suggestions while typing
// ---------------------------------------------------------------------------
interface UnitComboboxProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function UnitCombobox({ value, onChange, disabled }: UnitComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? COMMON_UNITS.filter(u => u.toLowerCase().startsWith(value.toLowerCase()))
    : COMMON_UNITS;

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    // Close only if focus moves outside the container
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="unit"
        className="w-24"
        disabled={disabled}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 top-full mt-1 w-36 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg py-1"
        >
          {filtered.map(unit => (
            <li
              key={unit}
              role="option"
              aria-selected={unit === value}
              onMouseDown={e => {
                e.preventDefault(); // prevent blur before click registers
                onChange(unit);
                setOpen(false);
              }}
              className={`px-3 py-1.5 text-sm cursor-pointer select-none transition-colors ${
                unit === value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent text-foreground'
              }`}
            >
              {unit}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable Step row (unchanged from original)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Ingredient row (structured)
// ---------------------------------------------------------------------------
interface IngredientRowState extends Ingredient {
  showNotes: boolean;
}

interface IngredientRowProps {
  row: IngredientRowState;
  index: number;
  isOnly: boolean;
  onChange: (updated: IngredientRowState) => void;
  onRemove: () => void;
}

function IngredientRow({ row, index, isOnly, onChange, onRemove }: IngredientRowProps) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-border/70 bg-card/50">
      {/* Main row: Qty | Unit | Name | Remove */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Quantity */}
        <Input
          type="number"
          min="0"
          step="any"
          value={row.quantity ?? ''}
          onChange={e => {
            const raw = e.target.value;
            onChange({ ...row, quantity: raw === '' ? null : parseFloat(raw) });
          }}
          placeholder="qty"
          className="w-20 flex-shrink-0"
          aria-label={`Ingredient ${index + 1} quantity`}
        />

        {/* Unit combobox */}
        <UnitCombobox
          value={row.unit ?? ''}
          onChange={val => onChange({ ...row, unit: val.trim() === '' ? null : val })}
        />

        {/* Name */}
        <Input
          required={index === 0}
          value={row.name}
          onChange={e => onChange({ ...row, name: e.target.value })}
          placeholder={`Ingredient name${index === 0 ? ' *' : ''}`}
          className="flex-1 min-w-32"
          aria-label={`Ingredient ${index + 1} name`}
        />

        {/* Remove */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={isOnly}
          className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
          aria-label={`Remove ingredient ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes toggle / Notes input */}
      {row.showNotes ? (
        <Input
          value={row.notes ?? ''}
          onChange={e => onChange({ ...row, notes: e.target.value || undefined })}
          placeholder="e.g. sifted, at room temperature..."
          className="text-sm h-8"
          aria-label={`Ingredient ${index + 1} notes`}
        />
      ) : (
        <button
          type="button"
          onClick={() => onChange({ ...row, showNotes: true })}
          className="self-start flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5 ml-0.5"
        >
          <StickyNote className="h-3 w-3" />
          + add note
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecipeForm
// ---------------------------------------------------------------------------
interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

function makeIngredientRow(ingredient: Ingredient): IngredientRowState {
  return {
    ...ingredient,
    showNotes: Boolean(ingredient.notes),
  };
}

function makeEmptyIngredientRow(): IngredientRowState {
  return {
    id: generateId(),
    name: '',
    quantity: null,
    unit: null,
    notes: undefined,
    showNotes: false,
  };
}

export default function RecipeForm({ initialData, onSubmit, isLoading, submitLabel }: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [cookingTime, setCookingTime] = useState(initialData?.cookingTime?.toString() || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');

  const [ingredientRows, setIngredientRows] = useState<IngredientRowState[]>(() => {
    if (initialData?.ingredients?.length) {
      return initialData.ingredients.map(makeIngredientRow);
    }
    return [makeEmptyIngredientRow()];
  });

  const [steps, setSteps] = useState<string[]>(initialData?.steps?.length ? initialData.steps : ['']);
  const [stepIds, setStepIds] = useState<string[]>(() =>
    (initialData?.steps?.length ? initialData.steps : ['']).map((_, i) => `step-${Date.now()}-${i}`)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Image handlers ----
  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    if (imageFile && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ---- Step drag-and-drop ----
  const sensors = useSensors(useSensor(PointerSensor));

  const handleStepChange = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    setSteps(next);
  };

  const addStep = () => {
    setSteps([...steps, '']);
    setStepIds([...stepIds, `step-${Date.now()}`]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
      setStepIds(stepIds.filter((_, i) => i !== index));
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

  // ---- Ingredient handlers ----
  const updateIngredientRow = (index: number, updated: IngredientRowState) => {
    const next = [...ingredientRows];
    next[index] = updated;
    setIngredientRows(next);
  };

  const addIngredientRow = () => {
    setIngredientRows([...ingredientRows, makeEmptyIngredientRow()]);
  };

  const removeIngredientRow = (index: number) => {
    if (ingredientRows.length > 1) {
      setIngredientRows(ingredientRows.filter((_, i) => i !== index));
    }
  };

  // ---- Form submit ----
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('cookingTime', String(parseInt(cookingTime) || 0));

    // Serialize ingredients — strip the UI-only showNotes field
    const ingredientsPayload: Ingredient[] = ingredientRows
      .filter(r => r.name.trim() !== '')
      .map(({ showNotes: _s, ...rest }) => rest);
    formData.append('ingredients', JSON.stringify(ingredientsPayload));

    formData.append('steps', JSON.stringify(steps.filter(s => s.trim() !== '')));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    onSubmit(formData);
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

      </div>

      {/* Recipe Image */}
      <div className="space-y-2">
        <Label>Recipe Image</Label>
        {imagePreview ? (
          <div className="relative group rounded-xl overflow-hidden border border-border h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Recipe preview" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleImageRemove}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-44 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">Click to upload an image</span>
            <span className="text-xs">JPG, PNG, WebP up to 5MB</span>
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSelect(file);
          }}
        />
      </div>

      {/* Ingredients */}
      <div className="border-t border-border pt-8">
        <div className="flex justify-between items-center mb-1">
          <Label className="text-lg font-semibold">Ingredients</Label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addIngredientRow}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
        {/* Column hints */}
        <div className="flex gap-2 mb-3 ml-0.5">
          <span className="w-20 text-xs text-muted-foreground">Qty</span>
          <span className="w-24 text-xs text-muted-foreground">Unit</span>
          <span className="flex-1 text-xs text-muted-foreground">Ingredient name</span>
        </div>
        <div className="space-y-2">
          {ingredientRows.map((row, index) => (
            <IngredientRow
              key={row.id}
              row={row}
              index={index}
              isOnly={ingredientRows.length <= 1}
              onChange={(updated) => updateIngredientRow(index, updated)}
              onRemove={() => removeIngredientRow(index)}
            />
          ))}
        </div>
      </div>

      {/* Cooking Steps */}
      <div className="border-t border-border pt-8">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-semibold">Cooking Steps</Label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addStep}
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
                  onChange={(val) => handleStepChange(index, val)}
                  onRemove={() => removeStep(index)}
                  disabled={steps.length <= 1}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Submit */}
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
