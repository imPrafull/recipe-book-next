interface StepBlockProps {
  steps: string[];
}

export default function StepBlock({ steps }: StepBlockProps) {
  if (!steps || steps.length === 0) {
    return <p className="text-muted-foreground italic">No steps listed.</p>;
  }

  return (
    <div className="space-y-8">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-6 sm:gap-8 group">
          <div className="flex-shrink-0">
            <div className="text-5xl md:text-6xl font-black text-muted/40 group-hover:text-primary transition-colors duration-500 font-sans tracking-tighter">
              {(index + 1).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="flex-grow pt-2 sm:pt-4">
            <p className="text-lg leading-relaxed text-foreground/90 font-medium whitespace-pre-line border-t border-border/50 pt-4 sm:border-none sm:pt-0">
              {step}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
