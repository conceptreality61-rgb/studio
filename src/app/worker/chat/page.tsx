
'use client';

import ChatInterface from '@/components/chat-interface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WorkerChatPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Tabs defaultValue="customer" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">Chat with Customer</TabsTrigger>
                    <TabsTrigger value="admin">Chat with Admin</TabsTrigger>
                </TabsList>
                <TabsContent value="customer" className="flex-1 mt-4">
                    <ChatInterface chatWith="customer" />
                </TabsContent>
                <TabsContent value="admin" className="flex-1 mt-4">
                    <ChatInterface chatWith="admin" />
                </TabsContent>
            </Tabs>
        </div>
    )
}
