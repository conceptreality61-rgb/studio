import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const bookings = [
    { id: 'BK001', customer: 'Liam Johnson', email: 'liam@example.com', service: 'Maid Service', date: '2023-06-23', status: 'Completed', amount: '$50.00' },
    { id: 'BK002', customer: 'Olivia Smith', email: 'olivia@example.com', service: 'Gardening', date: '2023-06-24', status: 'In Progress', amount: '$90.00' },
    { id: 'BK003', customer: 'Noah Williams', email: 'noah@example.com', service: 'Tank Cleaning', date: '2023-06-25', status: 'Pending', amount: '$70.00' },
    { id: 'BK004', customer: 'Emma Brown', email: 'emma@example.com', service: 'Bathroom Cleaning', date: '2023-06-26', status: 'Canceled', amount: '$35.00' },
    { id: 'BK005', customer: 'Ava Jones', email: 'ava@example.com', service: 'Maid Service', date: '2023-06-27', status: 'Completed', amount: '$55.00' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "In Progress": "secondary",
  Pending: "outline",
  Canceled: "destructive"
};

export default function BookingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Bookings</CardTitle>
        <CardDescription>View and manage all service bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>
                    <div className="font-medium">{booking.customer}</div>
                    <div className="text-sm text-muted-foreground">{booking.email}</div>
                </TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{booking.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
