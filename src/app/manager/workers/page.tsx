
import Link from "next/link";
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

const workers = [
    { id: 'W001', name: 'Jane Smith', joinDate: '2023-01-10', rating: '4.9', status: 'Verified', tasks: 32 },
    { id: 'W002', name: 'John Doe', joinDate: '2023-02-15', rating: '4.8', status: 'Verified', tasks: 28 },
    { id: 'W003', name: 'Lucas Hernandez', joinDate: '2023-06-01', rating: 'N/A', status: 'Pending', tasks: 0 },
    { id: 'W004', name: 'Maria Garcia', joinDate: '2023-05-20', rating: '4.7', status: 'Verified', tasks: 15 },
    { id: 'W005', name: 'Chen Wei', joinDate: '2023-04-12', rating: 'N/A', status: 'Rejected', tasks: 0 },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Verified: "default",
  Pending: "secondary",
  Rejected: "destructive",
};

export default function ManagerWorkersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workers</CardTitle>
        <CardDescription>Manage your team of service providers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Completed Tasks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">{worker.id}</TableCell>
                <TableCell>{worker.name}</TableCell>
                <TableCell>{worker.joinDate}</TableCell>
                <TableCell>{worker.rating}</TableCell>
                <TableCell>{worker.tasks}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[worker.status] || 'default'}>{worker.status}</Badge>
                </TableCell>
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
                         {worker.status === 'Pending' && (
                            <DropdownMenuItem asChild>
                               <Link href={`/manager/workers/verify/${worker.id}`}>Verify Application</Link>
                            </DropdownMenuItem>
                         )}
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Message</DropdownMenuItem>
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
