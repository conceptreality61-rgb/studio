
'use client';

import { useState, useEffect } from 'react';
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
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Customer = {
    id: string;
    displayName: string;
    email: string;
    createdAt: Timestamp; // Assuming you store join date
    totalSpent: number; // This might need calculation
    status: 'Active' | 'Inactive';
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Active: "default",
  Inactive: "secondary",
};


export default function ManagerCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'customer'));
                const querySnapshot = await getDocs(q);
                const customersData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        displayName: data.displayName || 'N/A',
                        email: data.email || 'N/A',
                        createdAt: data.createdAt,
                        totalSpent: data.totalSpent || 0, // You'd calculate or store this
                        status: data.status || 'Active',
                    } as Customer;
                });
                setCustomers(customersData);
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const formatDate = (timestamp?: Timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString();
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>View and manage all registered customers.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Customer Name</TableHead>
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
                    <TableCell className="font-medium">{customer.displayName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                    <Badge variant={statusVariant[customer.status] || 'default'}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">Rs.{customer.totalSpent.toFixed(2)}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}
