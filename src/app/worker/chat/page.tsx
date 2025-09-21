
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is where the worker can chat with the manager or customer.</p>
      </CardContent>
    </Card>
  );
}
