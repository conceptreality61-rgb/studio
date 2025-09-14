import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const customers = [
    { id: 'C001', name: 'Liam Johnson', email: 'liam@example.com', joinDate: '2023-01-15', bookings: 5 },
    { id: 'C002', name: 'Olivia Smith', email: 'olivia@example.com', joinDate: '2023-02-20', bookings: 2 },
    { id: 'C003', name: 'Noah Williams', email: 'noah@example.com', joinDate: '2023-03-10', bookings: 8 },
    { id: 'C004', name: 'Emma Brown', email: 'emma@example.com', joinDate: '2023-04-05', bookings: 1 },
    { id: 'C005', name: 'Ava Jones', email: 'ava@example.com', joinDate: '2023-05-21', bookings: 12 },
];


export default function CustomersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Customers</CardTitle>
        <CardDescription>View and manage all customer accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Total Bookings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${customer.id}`} />
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.joinDate}</TableCell>
                <TableCell>{customer.bookings}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
