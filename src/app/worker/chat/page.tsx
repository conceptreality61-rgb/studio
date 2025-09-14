'use client';

import ChatInterface from '@/components/chat-interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ChatPage() {
  return (
    <div className="grid grid-cols-1">
       <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>
            Chat with admins or customers regarding your tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="customer">Customer (Active Task)</TabsTrigger>
            </TabsList>
            <TabsContent value="admin" className="mt-4">
               <div className="max-w-2xl mx-auto">
                 <ChatInterface chatWith="admin" />
               </div>
            </TabsContent>
            <TabsContent value="customer" className="mt-4">
              <div className="max-w-2xl mx-auto">
                <p className="text-center text-muted-foreground mb-4">You can only chat with customers on an active task. Go to the task detail page.</p>
                <ChatInterface chatWith="customer" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
       </Card>
    </div>
  );
}
