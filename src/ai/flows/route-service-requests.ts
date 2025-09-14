'use server';

/**
 * @fileOverview Automatically routes service requests to available workers based on skills, availability, and location using AI.
 *
 * - routeServiceRequest - A function that handles the service request routing process.
 * - RouteServiceRequestInput - The input type for the routeServiceRequest function.
 * - RouteServiceRequestOutput - The return type for the routeServiceRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RouteServiceRequestInputSchema = z.object({
  serviceType: z.string().describe('The type of service requested (e.g., maid, bathroom cleaning, gardening).'),
  customerLocation: z.string().describe('The location of the customer requesting the service.'),
  requestedTime: z.string().describe('The preferred time for the service.'),
  workerSkills: z.array(z.string()).describe('A list of skills required for the service.'),
});
export type RouteServiceRequestInput = z.infer<typeof RouteServiceRequestInputSchema>;

const RouteServiceRequestOutputSchema = z.object({
  workerId: z.string().describe('The ID of the worker assigned to the service request.'),
  estimatedArrivalTime: z.string().describe('The estimated time of arrival for the worker.'),
});
export type RouteServiceRequestOutput = z.infer<typeof RouteServiceRequestOutputSchema>;

export async function routeServiceRequest(input: RouteServiceRequestInput): Promise<RouteServiceRequestOutput> {
  return routeServiceRequestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'routeServiceRequestPrompt',
  input: {schema: RouteServiceRequestInputSchema},
  output: {schema: RouteServiceRequestOutputSchema},
  prompt: `You are an AI assistant that efficiently routes service requests to available workers, considering skills, availability and location.\n
  Given the following service request details, determine the most suitable worker and estimate their arrival time:\n
  Service Type: {{{serviceType}}}\n  Customer Location: {{{customerLocation}}}\n  Requested Time: {{{requestedTime}}}\n  Required Skills: {{#each workerSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\n
  Consider worker availability, skills, and proximity to the customer.\n
  Output the worker's ID and estimated arrival time.\n  Make sure to only respond with the information requested. If the estimated arrival time is unknown, respond with \"unknown\"`, 
});

const routeServiceRequestFlow = ai.defineFlow(
  {
    name: 'routeServiceRequestFlow',
    inputSchema: RouteServiceRequestInputSchema,
    outputSchema: RouteServiceRequestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
