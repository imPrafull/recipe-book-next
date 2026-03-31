interface StepListProps {
  steps: string[];
}

export default function StepList({ steps }: StepListProps) {
  if (!steps || steps.length === 0) {
    return <p className="text-muted-foreground italic">No cooking steps generated.</p>;
  }

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="flex group">
          <div className="flex-shrink-0 mr-4 flex flex-col items-center">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/10 text-secondary font-bold border border-secondary/20 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors duration-300">
              {index + 1}
            </div>
            {index !== steps.length - 1 && (
              <div className="h-full w-px bg-border mt-2 group-hover:bg-secondary/30 transition-colors duration-300"></div>
            )}
          </div>
          <div className="pb-6">
            <p className="text-foreground leading-relaxed pt-1">{step}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
