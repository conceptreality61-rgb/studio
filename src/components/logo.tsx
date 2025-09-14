import { Brush } from 'lucide-react';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-2xl font-bold text-primary-foreground ${className}`}>
      <div className="bg-primary p-2 rounded-lg">
        <Brush className="text-primary-foreground h-6 w-6" />
      </div>
      <span className="font-headline text-inherit">CleanSweep</span>
    </div>
  );
}
