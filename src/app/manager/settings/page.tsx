
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function ManagerSettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    
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
            if (!user.email) {
                throw new Error("User email is not available.");
            }
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
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
