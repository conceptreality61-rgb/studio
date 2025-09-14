'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'other';
    avatar: string;
}

const initialMessages: Message[] = [
    { id: 1, text: "Hi there! Just wanted to confirm, do you have a lawnmower, or should I bring mine?", sender: 'other', avatar: 'https://i.pravatar.cc/40?u=W002' },
    { id: 2, text: "Hey! Yes, we have one. It's in the shed.", sender: 'user', avatar: 'https://i.pravatar.cc/40?u=C002' },
    { id: 3, text: "Perfect, thanks! I'm about 15 minutes away.", sender: 'other', avatar: 'https://i.pravatar.cc/40?u=W002' },
];

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const newMsg: Message = {
            id: messages.length + 1,
            text: newMessage,
            sender: 'user',
            avatar: 'https://i.pravatar.cc/40?u=C002',
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
    };

    return (
        <Card className="flex flex-col h-full max-h-[70vh]">
            <CardHeader>
                <CardTitle>Chat with Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                                {message.sender === 'other' && <Avatar className="h-8 w-8"><AvatarImage src={message.avatar} /></Avatar>}
                                <div className={`max-w-xs lg:max-w-md rounded-lg px-3 py-2 ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                                {message.sender === 'user' && <Avatar className="h-8 w-8"><AvatarImage src={message.avatar} /></Avatar>}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
