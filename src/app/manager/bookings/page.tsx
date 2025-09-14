
'use client';

import { useState } from 'react';
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
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type Booking = {
  id: string;
  service: string;
  customer: string;
  worker: string;
  date: string;
  status: 'Pending Manager Approval' | 'Worker Assigned' | 'Completed' | 'Canceled' | 'In Progress';
  amount: string;
};


const initialBookings: Booking[] = [
    { id: 'BK001', service: 'Maid Service', customer: 'Liam Johnson', worker: 'Jane Smith', date: '2023-06-23', status: 'Completed', amount: '$50.00' },
    { id: 'BK002', service: 'Gardening', customer: 'Olivia Smith', worker: 'John Doe', date: '2023-06-24', status: 'Worker Assigned', amount: '$90.00' },
    { id: 'BK003', service: 'Tank Cleaning', customer: 'Noah Williams', worker: 'Jane Smith', date: '2023-05-12', status: 'Completed', amount: '$70.00' },
    { id: 'BK004', service: 'Bathroom Cleaning', customer: 'Emma Brown', worker: 'John Doe', date: '2023-04-18', status: 'Completed', amount: '$35.00' },
    { id: 'BK005', service: 'Maid Service', customer: 'Liam Johnson', worker: 'Unassigned', date: '2023-09-01', status: 'Pending Manager Approval', amount: '$50.00' },
    { id: 'BK006', service: 'Gardening', customer: 'Olivia Smith', worker: 'N/A', date: '2023-06-29', status: 'Canceled', amount: '$45.00' },
    { id: 'TSK006', service: 'Bathroom Cleaning', customer: 'Emma Brown', date: '2023-06-26', status: 'Pending Manager Approval', worker: 'Lucas H.', amount: '$40.00' },
];

const availableWorkers = ['Jane Smith', 'John Doe', 'Lucas H.'];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Manager Approval": "outline",
  "In Progress": "secondary",
  Canceled: "destructive"
};


export default function ManagerBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);

    const handleWorkerChange = (bookingId: string, newWorker: string) => {
        setBookings(currentBookings =>
            currentBookings.map(b =>
                b.id === bookingId ? { ...b, worker: newWorker, status: 'Worker Assigned' } : b
            )
        );
    };


  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>Manage and assign all customer bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>
                 <Button variant="ghost">
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>{booking.customer}</TableCell>
                <TableCell>
                  {booking.status === 'Pending Manager Approval' ? (
                     <Select onValueChange={(newWorker) => handleWorkerChange(booking.id, newWorker)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Assign Worker" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableWorkers.map(worker => <SelectItem key={worker} value={worker}>{worker}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  ) : (
                    booking.worker
                  )}
                </TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{booking.amount}</TableCell>
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
                        <DropdownMenuItem>Cancel Booking</DropdownMenuItem>
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
