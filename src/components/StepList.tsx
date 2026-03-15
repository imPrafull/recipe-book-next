interface StepListProps {
  steps: string[];
}

export default function StepList({ steps }: StepListProps) {
  if (!steps || steps.length === 0) {
    return <p className="text-slate-500 italic">No cooking steps generated.</p>;
  }

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="flex group">
          <div className="flex-shrink-0 mr-4 flex flex-col items-center">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary-100 dark:bg-secondary-500/20 text-secondary-600 dark:text-secondary-400 font-bold border border-secondary-200 dark:border-secondary-500/30 group-hover:bg-secondary-500 group-hover:text-white dark:group-hover:text-white transition-colors duration-300">
              {index + 1}
            </div>
            {index !== steps.length - 1 && (
              <div className="h-full w-px bg-slate-200 dark:bg-slate-700 mt-2 group-hover:bg-secondary-200 dark:group-hover:bg-secondary-500/50 transition-colors duration-300"></div>
            )}
          </div>
          <div className="pb-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{step}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
