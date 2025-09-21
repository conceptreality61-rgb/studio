
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SchedulePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This page will display the worker's schedule of assigned tasks.</p>
      </CardContent>
    </Card>
  );
}
