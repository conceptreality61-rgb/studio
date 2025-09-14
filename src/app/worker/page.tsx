import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import { DollarSign, Briefcase, Star, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tasks = [
    { id: 'TSK001', service: 'Gardening', customer: 'Olivia Smith', date: '2023-06-24', status: 'In Progress' },
    { id: 'TSK002', service: 'Maid Service', customer: 'John Doe', date: '2023-06-25', status: 'Upcoming' },
];

export default function WorkerDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="This Month's Earnings" value="$1,250.00" description="+15% from last month" icon={DollarSign} />
                <StatCard title="Completed Tasks" value="32" description="This month" icon={Briefcase} />
                <StatCard title="Your Rating" value="4.9" description="Based on 56 reviews" icon={Star} />
                <StatCard title="Next Task" value="in 2 hours" description="Gardening for O. Smith" icon={Clock} />
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>My Tasks</CardTitle>
                    <CardDescription>Your assigned and upcoming jobs.</CardDescription>
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
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.id}</TableCell>
                                <TableCell>{task.service}</TableCell>
                                <TableCell>{task.customer}</TableCell>
                                <TableCell>{task.date}</TableCell>
                                <TableCell>
                                    <Badge variant={task.status === 'In Progress' ? 'secondary' : 'outline'}>{task.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/worker/tasks/${task.id}`}><ArrowRight className="h-4 w-4" /></Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
