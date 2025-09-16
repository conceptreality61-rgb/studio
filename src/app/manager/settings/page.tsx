
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function hexToHsl(hex: string): { h: number, s: number, l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { 
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export default function ManagerSettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [primaryColor, setPrimaryColor] = useState(theme.primary);
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    useEffect(() => {
        setPrimaryColor(theme.primary);
    }, [theme.primary]);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setPrimaryColor(newColor);
        
        const hsl = hexToHsl(newColor);
        if (hsl) {
            setTheme({
                ...theme,
                primary: newColor,
                primaryHsl: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
            })
            toast({
                title: 'Color Updated',
                description: 'The primary color of the app has been changed.',
            });
        }
    };
    
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.'});
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.'});
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters long.'});
            return;
        }
        
        setIsSavingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error updating password', description: error.message });
        } finally {
            setIsSavingPassword(false);
        }
    }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the look and feel of your application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex items-center gap-4">
                            <Input 
                                id="primary-color" 
                                type="color" 
                                value={primaryColor}
                                onChange={handleColorChange}
                                className="w-16 h-10 p-1"
                            />
                            <span className="text-muted-foreground">Select a new primary color for your brand.</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

         <Card>
            <form onSubmit={handlePasswordChange}>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input 
                            id="current-password" 
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input 
                                id="new-password" 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                             />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input 
                                id="confirm-password" 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                     </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSavingPassword}>
                        {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSavingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
