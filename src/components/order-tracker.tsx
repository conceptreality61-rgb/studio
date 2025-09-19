
'use client';

import { cn } from "@/lib/utils"
import { CheckCircle, Loader, Clock, UserCheck, Check, FileCheck, CircleHelp, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { Timestamp } from "firebase/firestore";

type StatusHistoryItem = {
  status: string;
  timestamp: Timestamp;
};

type Step = {
  name: string;
  status: 'complete' | 'current' | 'upcoming';
  icon: React.ReactNode;
  timestamp?: string | null;
};

type OrderTrackerProps = {
    status?: string;
    statusHistory?: StatusHistoryItem[];
}

const formatTimestamp = (timestamp?: Timestamp) => {
    if (!timestamp) return null;
    return timestamp.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

export default function OrderTracker({ status, statusHistory = [] }: OrderTrackerProps) {

  const baseSteps: Omit<Step, 'status' | 'timestamp'>[] = useMemo(() => [
    { name: 'Pending Approval', icon: <FileCheck /> },
    { name: 'Pending Customer Approval', icon: <CircleHelp />},
    { name: 'Pending Worker Assignment', icon: <UserCheck />},
    { name: 'In Progress', icon: <Loader className="animate-spin" /> },
    { name: 'Service Completed', icon: <Check /> },
  ], []);

  const currentStepIndex = useMemo(() => {
    switch (status) {
        case 'Pending Manager Approval': return 0;
        case 'Pending Customer Approval': return 1;
        case 'Pending Worker Assignment': return 2;
        case 'Worker Assigned': return 2; // Still in assignment phase
        case 'In Progress': return 3;
        case 'Completed': return 4;
        case 'Canceled': return -2; // Special case for canceled
        default: return -1;
    }
  }, [status]);
  
  if (currentStepIndex === -2) {
    const canceledEntry = statusHistory.find(h => h.status === 'Canceled');
    return (
      <div className="flex items-center gap-3 bg-red-50 border-l-4 border-destructive p-4 rounded-md">
        <AlertTriangle className="text-destructive" />
        <div>
          <p className="font-semibold">Booking Canceled</p>
          <p className="text-sm text-muted-foreground">
            {canceledEntry ? `On ${formatTimestamp(canceledEntry.timestamp)}` : 'This booking has been canceled.'}
          </p>
        </div>
      </div>
    );
  }

  const processedSteps = useMemo(() => {
    return baseSteps.map((step, index) => {
        let stepStatus: 'complete' | 'current' | 'upcoming' = 'upcoming';
        let icon = <Clock />;
        
        const historyEntry = statusHistory.find(h => {
             // Special mapping for Worker Assigned to the same step as Pending Worker Assignment
             if (step.name === 'Pending Worker Assignment') {
                 return h.status === 'Pending Worker Assignment' || h.status === 'Worker Assigned';
             }
            return h.status === step.name;
        });

        if (index < currentStepIndex) {
            stepStatus = 'complete';
            icon = <CheckCircle />;
        } else if (index === currentStepIndex) {
            stepStatus = 'current';
            icon = step.icon; // The original icon (e.g., animated loader)
        }

        return {
            ...step,
            status: stepStatus,
            icon: icon,
            timestamp: historyEntry ? formatTimestamp(historyEntry.timestamp) : null,
        };
    });
  }, [baseSteps, currentStepIndex, statusHistory]);


  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {processedSteps.map((step, stepIdx) => (
          <li key={step.name} className={cn(stepIdx !== baseSteps.length - 1 ? 'pb-10' : '', 'relative')}>
            {stepIdx !== baseSteps.length - 1 ? (
              <div className={cn("absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5", step.status === 'complete' ? 'bg-primary' : 'bg-border')} />
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
                   {step.timestamp ? step.timestamp : step.status}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
