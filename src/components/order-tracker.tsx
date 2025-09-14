'use client';

import { cn } from "@/lib/utils"
import { CheckCircle, Loader, Clock } from "lucide-react";

type Step = {
  name: string;
  status: 'complete' | 'current' | 'upcoming';
};

const steps: Step[] = [
  { name: 'Booking Confirmed', status: 'complete' },
  { name: 'Worker Assigned', status: 'complete' },
  { name: 'On The Way', status: 'current' },
  { name: 'Service Completed', status: 'upcoming' },
];

export default function OrderTracker() {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
            {stepIdx !== steps.length - 1 ? (
              <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-border" />
            ) : null}
            <div className="group relative flex items-start">
              <span className="flex h-9 items-center">
                <span className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                  step.status === 'complete' ? 'bg-primary' : '',
                  step.status === 'current' ? 'bg-primary/80 border-2 border-primary' : '',
                  step.status === 'upcoming' ? 'bg-secondary border-2 border-border' : ''
                )}>
                  {step.status === 'complete' && <CheckCircle className="h-5 w-5 text-primary-foreground" />}
                  {step.status === 'current' && <Loader className="h-5 w-5 text-primary-foreground animate-spin" />}
                  {step.status === 'upcoming' && <Clock className="h-5 w-5 text-muted-foreground" />}
                </span>
              </span>
              <span className="ml-4 flex min-w-0 flex-col">
                <span className={cn(
                  'text-sm font-semibold',
                  step.status === 'current' ? 'text-primary' : ''
                )}>{step.name}</span>
                <span className="text-sm text-muted-foreground">
                    {step.status === 'complete' && 'Completed'}
                    {step.status === 'current' && 'In Progress'}
                    {step.status === 'upcoming' && 'Pending'}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
