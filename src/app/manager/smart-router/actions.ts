
'use server';

import { routeServiceRequest, RouteServiceRequestInput } from "@/ai/flows/route-service-requests";

export async function getSmartRoute(data: RouteServiceRequestInput) {
    const result = await routeServiceRequest(data);
    return result;
}
