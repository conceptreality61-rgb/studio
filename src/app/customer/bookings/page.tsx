
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

const bookings = [
    { id: 'BK001', service: 'Maid Service', date: '2023-06-23', status: 'Completed', amount: '$50.00' },
    { id: 'BK002', service: 'Gardening', date: '2023-06-24', status: 'Worker Assigned', amount: '$90.00' },
    { id: 'BK003', service: 'Tank Cleaning', date: '2023-05-12', status: 'Completed', amount: '$70.00' },
    { id: 'BK004', service: 'Bathroom Cleaning', date: '2023-04-18', status: 'Completed', amount: '$35.00' },
    { id: 'BK005', service: 'Maid Service', date: '2023-06-28', status: 'Pending Admin Approval', amount: '$50.00' },
    { id: 'BK006', service: 'Gardening', date: '2023-06-29', status: 'Canceled', amount: '$45.00' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Admin Approval": "outline",
  "In Progress": "secondary",
  Canceled: "destructive"
};

export default function BookingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>View your booking history and leave reviews for completed services.</CardDescription>
      </CardHeader>
      <CardContent>
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
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.service}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{booking.amount}</TableCell>
                 <TableCell className="text-right">
                  {booking.status === 'Completed' ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/customer/review/${booking.id}`}>
                        <Star className="mr-2 h-4 w-4" />
                        Leave a Review
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/customer/orders/${booking.id}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
