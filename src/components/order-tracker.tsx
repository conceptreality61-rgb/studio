
'use client';

import { cn } from "@/lib/utils"
import { CheckCircle, Loader, Clock, UserCheck, Check, FileCheck, CircleHelp, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

type Step = {
  name: string;
  status: 'complete' | 'current' | 'upcoming';
  icon: React.ReactNode;
};

type OrderTrackerProps = {
    status?: string;
}

export default function OrderTracker({ status }: OrderTrackerProps) {

  const steps: Step[] = useMemo(() => [
    { name: 'Pending Approval', status: 'upcoming', icon: <FileCheck /> },
    { name: 'Pending Customer Approval', status: 'upcoming', icon: <CircleHelp />},
    { name: 'Pending Worker Assignment', status: 'upcoming', icon: <UserCheck />},
    { name: 'In Progress', status: 'upcoming', icon: <Loader className="animate-spin" /> },
    { name: 'Service Completed', status: 'upcoming', icon: <Check /> },
  ], []);

  const currentStepIndex = useMemo(() => {
    switch (status) {
        case 'Pending Manager Approval': return 0;
        case 'Pending Customer Approval': return 1;
        case 'Pending Worker Assignment': return 2;
        case 'Worker Assigned': return 2;
        case 'In Progress': return 3;
        case 'Completed': return 4;
        case 'Canceled': return -2; // Special case for canceled
        default: return -1;
    }
  }, [status]);
  
  if (currentStepIndex === -2) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border-l-4 border-destructive p-4 rounded-md">
        <AlertTriangle className="text-destructive" />
        <div>
          <p className="font-semibold">Booking Canceled</p>
          <p className="text-sm text-muted-foreground">This booking has been canceled and will not proceed.</p>
        </div>
      </div>
    );
  }

  const processedSteps = useMemo(() => {
    return steps.map((step, index) => {
        if (index < currentStepIndex) {
            return { ...step, status: 'complete', icon: <CheckCircle /> };
        }
        if (index === currentStepIndex) {
            return { ...step, status: 'current' };
        }
        return { ...step, status: 'upcoming', icon: <Clock /> };
    })
  }, [steps, currentStepIndex]);


  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {processedSteps.map((step, stepIdx) => (
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
                  <div className="h-5 w-5 text-primary-foreground flex items-center justify-center">
                    {step.icon}
                  </div>
                </span>
              </span>
              <span className="ml-4 flex min-w-0 flex-col">
                <span className={cn(
                  'text-sm font-semibold',
                  step.status === 'current' ? 'text-primary' : ''
                )}>{step.name}</span>
                <span className="text-sm text-muted-foreground capitalize">
                   {step.status}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
