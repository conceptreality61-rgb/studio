import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const workers = [
    { id: 'W001', name: 'Jackson Lee', email: 'jackson@provider.com', skills: ['Maid Service', 'Bathroom Cleaning'], status: 'Approved', rating: 4.8 },
    { id: 'W002', name: 'Sophia Martinez', email: 'sophia@provider.com', skills: ['Gardening'], status: 'Approved', rating: 4.9 },
    { id: 'W003', name: 'Aiden Garcia', email: 'aiden@provider.com', skills: ['Tank Cleaning'], status: 'Pending', rating: 0 },
    { id: 'W004', name: 'Isabella Rodriguez', email: 'isabella@provider.com', skills: ['Maid Service'], status: 'Rejected', rating: 0 },
    { id: 'W005', name: 'Lucas Hernandez', email: 'lucas@provider.com', skills: ['Gardening', 'Maid Service'], status: 'Approved', rating: 4.7 },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Approved: "default",
  Pending: "secondary",
  Rejected: "destructive",
};

export default function WorkersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Workers</CardTitle>
        <CardDescription>Approve, reject, and manage all service provider accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://i.pravatar.cc/40?u=${worker.id}`} />
                      <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{worker.name}</div>
                      <div className="text-sm text-muted-foreground">{worker.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {worker.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                    </div>
                </TableCell>
                <TableCell>{worker.rating > 0 ? worker.rating.toFixed(1) : 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[worker.status] || 'default'}>{worker.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    {worker.status === 'Pending' ? (
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/workers/verify/${worker.id}`}>Verify</Link>
                        </Button>
                    ) : (
                        <Button asChild variant="ghost" size="icon">
                           <Link href={`/admin/workers/verify/${worker.id}`}><ArrowRight className="h-4 w-4" /></Link>
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
