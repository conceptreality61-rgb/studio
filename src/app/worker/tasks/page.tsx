
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function WorkerTasksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This page will list all tasks assigned to the worker.</p>
      </CardContent>
    </Card>
  );
}
