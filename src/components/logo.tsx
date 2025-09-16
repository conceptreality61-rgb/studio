import { Brush } from 'lucide-react';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-2xl font-bold ${className}`}>
      <div className="bg-primary p-2 rounded-lg">
        <Brush className="text-primary-foreground h-6 w-6" />
      </div>
      <span className="font-headline bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">CleanSweep</span>
    </div>
  );
}
