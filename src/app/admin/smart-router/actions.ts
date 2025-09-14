'use server';

import { routeServiceRequest, RouteServiceRequestInput, RouteServiceRequestOutput } from '@/ai/flows/route-service-requests';

type ActionResult = {
  success: boolean;
  data?: RouteServiceRequestOutput;
  error?: string;
};

export async function handleRouteRequest(input: RouteServiceRequestInput): Promise<ActionResult> {
  try {
    const result = await routeServiceRequest(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error routing service request:', error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred.' };
  }
}
