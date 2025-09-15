
'use client';

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const recentBookings: any[] = [
    // { id: 'BK001', service: 'Maid Service', date: '2023-06-23', status: 'Completed', amount: '$50.00' },
    // { id: 'BK002', service: 'Gardening', date: '2023-06-24', status: 'In Progress', amount: '$90.00' },
    // { id: 'BK006', service: 'Gardening', date: '2023-06-29', status: 'Canceled', amount: '$45.00' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "In Progress": "secondary",
  Pending: "outline",
  Canceled: "destructive"
};

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {user?.displayName ?? 'Customer'}!</CardTitle>
        <CardDescription>Here's an overview of your recent activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-4">Recent Bookings</h3>
        {recentBookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.service}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{booking.amount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/customer/orders/${booking.id}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No recent bookings to display.</p>
          </div>
        )}
      </CardContent>
       <CardFooter className="border-t pt-6">
          <Button asChild>
            <Link href="/#services">
                <PlusCircle className="mr-2 h-4 w-4" />
                Book New Service
            </Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
