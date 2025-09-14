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

const customerChat: Message[] = [
    { id: 1, text: "Hi there! Just wanted to confirm, do you have a lawnmower, or should I bring mine?", sender: 'other', avatar: 'https://i.pravatar.cc/40?u=W002' },
    { id: 2, text: "Hey! Yes, we have one. It's in the shed.", sender: 'user', avatar: 'https://i.pravatar.cc/40?u=C002' },
    { id: 3, text: "Perfect, thanks! I'm about 15 minutes away.", sender: 'other', avatar: 'https://i.pravatar.cc/40?u=W002' },
];

const adminChat: Message[] = [
    { id: 1, text: "Hi, I have a question about the task TSK001.", sender: 'user', avatar: 'https://i.pravatar.cc/40?u=W002' },
    { id: 2, text: "Sure, what's up?", sender: 'other', avatar: 'https://i.pravatar.cc/40?u=admin' },
];

interface ChatInterfaceProps {
    chatWith: 'customer' | 'admin';
}

export default function ChatInterface({ chatWith }: ChatInterfaceProps) {
    const initialMessages = chatWith === 'customer' ? customerChat : adminChat;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    
    const userAvatar = chatWith === 'customer' ? 'https://i.pravatar.cc/40?u=C002' : 'https://i.pravatar.cc/40?u=admin';
    const otherAvatar = 'https://i.pravatar.cc/40?u=W002';
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        // In a real app, the sender would be the current user
        const newMsg: Message = {
            id: messages.length + 1,
            text: newMessage,
            sender: 'other', 
            avatar: otherAvatar,
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
        
        // Simulate a reply
        setTimeout(() => {
            const reply: Message = {
                id: messages.length + 2,
                text: `This is an automated reply to your message: "${newMessage}"`,
                sender: 'user',
                avatar: userAvatar,
            }
            setMessages(prev => [...prev, reply]);
        }, 1000);
    };

    return (
        <Card className="flex flex-col h-full max-h-[70vh]">
            <CardHeader>
                <CardTitle>Chat with {chatWith === 'customer' ? 'Customer' : 'Admin'}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                                {message.sender === 'other' && <Avatar className="h-8 w-8"><AvatarImage src={message.avatar} /></Avatar>}
                                <div className={`max-w-xs lg:max-w-md rounded-lg px-3 py-2 ${message.sender === 'user' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
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
