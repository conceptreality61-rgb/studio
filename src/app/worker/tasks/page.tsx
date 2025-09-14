
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const allTasks = [
    { id: 'TSK001', service: 'Gardening', customer: 'Olivia Smith', date: '2023-06-24', status: 'In Progress' },
    { id: 'TSK002', service: 'Maid Service', customer: 'John Doe', date: '2023-06-25', status: 'Upcoming' },
    { id: 'TSK003', service: 'Bathroom Cleaning', customer: 'Emma Brown', date: '2023-06-22', status: 'Completed' },
    { id: 'TSK004', service: 'Tank Cleaning', customer: 'Noah Williams', date: '2023-06-20', status: 'Completed' },
    { id: 'TSK005', service: 'Maid Service', customer: 'Ava Jones', date: '2023-06-28', status: 'Upcoming' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "In Progress": "secondary",
  Upcoming: "outline",
};

export default function AllTasksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All My Tasks</CardTitle>
        <CardDescription>A complete list of all your assigned jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.id}</TableCell>
                <TableCell>{task.service}</TableCell>
                <TableCell>{task.customer}</TableCell>
                <TableCell>{task.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[task.status] || 'default'}>{task.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                       <Link href={`/worker/tasks/${task.id}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
