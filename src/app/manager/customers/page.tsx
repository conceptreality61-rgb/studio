
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const customers = [
    { id: 'C001', name: 'Liam Johnson', email: 'liam@example.com', joinDate: '2023-01-15', totalSpent: '$550.00', status: 'Active' },
    { id: 'C002', name: 'Olivia Smith', email: 'olivia@example.com', joinDate: '2023-02-20', totalSpent: '$230.00', status: 'Active' },
    { id: 'C003', name: 'Noah Williams', email: 'noah@example.com', joinDate: '2023-03-10', totalSpent: '$70.00', status: 'Active' },
    { id: 'C004', name: 'Emma Brown', email: 'emma@example.com', joinDate: '2023-04-05', totalSpent: '$120.00', status: 'Inactive' },
    { id: 'C005', name: 'Ava Jones', email: 'ava@example.com', joinDate: '2023-05-21', totalSpent: '$800.00', status: 'Active' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Active: "default",
  Inactive: "secondary",
};


export default function ManagerCustomersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>View and manage all registered customers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.joinDate}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[customer.status] || 'default'}>{customer.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{customer.totalSpent}</TableCell>
                 <TableCell>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Disable Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
