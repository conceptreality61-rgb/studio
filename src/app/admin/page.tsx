import { DollarSign, Users, Briefcase, Activity } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const recentBookings = [
  { id: 'BK001', customer: 'John Doe', service: 'Maid Service', status: 'Completed', amount: '$50.00' },
  { id: 'BK002', customer: 'Jane Smith', service: 'Gardening', status: 'In Progress', amount: '$90.00' },
  { id: 'BK003', customer: 'Bob Johnson', service: 'Tank Cleaning', status: 'Pending', amount: '$70.00' },
  { id: 'BK004', customer: 'Alice Williams', service: 'Bathroom Cleaning', status: 'Completed', amount: '$35.00' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="$45,231.89" description="+20.1% from last month" icon={DollarSign} />
        <StatCard title="Total Customers" value="+2350" description="+180.1% from last month" icon={Users} />
        <StatCard title="Active Bookings" value="+573" description="+201 since last hour" icon={Briefcase} />
        <StatCard title="Platform Activity" value="+12,234" description="Real-time user actions" icon={Activity} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>An overview of the latest service bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.customer}</TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell className="text-right">{booking.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
