
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, XCircle } from "lucide-react";
import { differenceInHours } from 'date-fns';

const bookings = [
    { id: 'BK001', service: 'Maid Service', date: '2023-06-23T10:00:00', status: 'Completed', amount: '$50.00' },
    { id: 'BK002', service: 'Gardening', date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), status: 'Worker Assigned', amount: '$90.00' },
    { id: 'BK003', service: 'Tank Cleaning', date: '2023-05-12T14:00:00', status: 'Completed', amount: '$70.00' },
    { id: 'BK004', service: 'Bathroom Cleaning', date: '2023-04-18T09:00:00', status: 'Completed', amount: '$35.00' },
    { id: 'BK005', service: 'Maid Service', date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), status: 'Pending Admin Approval', amount: '$50.00' },
    { id: 'BK006', service: 'Gardening', date: '2023-06-29T16:00:00', status: 'Canceled', amount: '$45.00' },
    { id: 'BK007', service: 'Maid Service', date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), status: 'Worker Assigned', amount: '$75.00' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Admin Approval": "outline",
  "In Progress": "secondary",
  Canceled: "destructive"
};

const canCancel = (bookingDate: string) => {
    const now = new Date();
    const serviceDate = new Date(bookingDate);
    return differenceInHours(serviceDate, now) > 5;
}

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
                <TableCell>{new Date(booking.date).toLocaleString()}</TableCell>
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
                  ) : !['Completed', 'Canceled'].includes(booking.status) && canCancel(booking.date) ? (
                    <Button variant="destructive" size="sm">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
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
