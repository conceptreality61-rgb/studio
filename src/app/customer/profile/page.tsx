
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Landmark, Smartphone, Loader2, Camera, ShieldCheck, MailWarning } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, sendEmailVerification, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type UserProfile = {
  displayName?: string;
  mobile?: {
    countryCode: string;
    number: string;
    verified: boolean;
  };
  address?: string;
  paymentMethod?: {
    cardType: string;
    last4: string;
    expiry: string;
  };
  upiId?: string;
  netBankingBank?: string;
};

const banks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'pnb', name: 'Punjab National Bank' },
]

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile verification state
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
             if(data.mobile?.verified) {
                setShowOtpInput(false);
                setIsVerifyingMobile(false);
            }
          } else {
            const initialProfile = {
              displayName: user.displayName || '',
              email: user.email || '',
            };
            setProfile(initialProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({ variant: 'destructive', title: "Error", description: "Could not fetch your profile." });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const handleNestedInputChange = (parent: keyof UserProfile, field: string, value: string) => {
      setProfile(p => ({
          ...p,
          [parent]: {
              ...(p?.[parent] as object || {}),
              [field]: value
          }
      }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setSendingVerification(true);
    try {
        await sendEmailVerification(auth.currentUser);
        toast({
            title: 'Verification Email Sent',
            description: 'Please check your inbox to verify your email address.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
        });
    } finally {
        setSendingVerification(false);
    }
  };

    const handleSendOtp = async () => {
        if (!profile?.mobile?.number || !profile.mobile.countryCode) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid mobile number and country code.' });
            return;
        }
        setIsVerifyingMobile(true);
        try {
            const phoneNumber = `${profile.mobile.countryCode}${profile.mobile.number}`;
            
            // Render reCAPTCHA verifier
            if (!recaptchaContainerRef.current) throw new Error("reCAPTCHA container not found.");
            
            const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });

            const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
            setConfirmationResult(result);
            setShowOtpInput(true);
            toast({ title: 'OTP Sent', description: 'An OTP has been sent to your mobile number.' });

        } catch (error: any) {
            console.error("Mobile verification error:", error);
            if (error.code === 'auth/operation-not-allowed') {
                 toast({ 
                    variant: 'destructive', 
                    title: 'Verification Failed', 
                    description: 'Phone number sign-in is not enabled. Please enable it in your Firebase console under Authentication > Sign-in method.',
                    duration: 9000,
                });
            } else {
                toast({ variant: 'destructive', title: 'Error Sending OTP', description: error.message });
            }
            setIsVerifyingMobile(false);
        }
    };
    
    const handleVerifyOtp = async () => {
        if (!confirmationResult || !otp) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter the OTP.' });
            return;
        }
        setIsVerifyingMobile(true);
        try {
            await confirmationResult.confirm(otp);
            
            // Update Firestore to mark mobile as verified
            if (user && profile) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    'mobile.verified': true
                });
                handleNestedInputChange('mobile', 'verified', 'true');
            }

            toast({ title: 'Mobile Verified!', description: 'Your mobile number has been successfully verified.' });
            setShowOtpInput(false);
            refreshUser();

        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The OTP you entered is incorrect. Please try again.' });
        } finally {
            setIsVerifyingMobile(false);
        }
    };


  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      
      const { displayName, ...profileData } = profile;

      await setDoc(userRef, profileData, { merge: true });

      if (auth.currentUser && displayName && auth.currentUser.displayName !== displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
      refreshUser();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was a problem updating your profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <div className="flex items-center gap-4">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div>
                          <Skeleton className="h-8 w-48 mb-2" />
                          <Skeleton className="h-5 w-64" />
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
        <div ref={recaptchaContainerRef}></div>
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview ?? user?.photoURL ?? `https://i.pravatar.cc/128?u=${user?.uid}`} />
                <AvatarFallback>{profile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          <div>
            <CardTitle className="text-3xl">{profile?.displayName}</CardTitle>
            <CardDescription className="text-base">{user?.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveChanges} className="space-y-6">
          <Separator />
          <h3 className="text-lg font-medium">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profile?.displayName ?? ''} onChange={(e) => handleInputChange('displayName', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                    <Input id="email" type="email" value={user?.email ?? ''} readOnly className="flex-1" />
                    {user?.emailVerified ? (
                        <Badge variant="success" className="gap-1"><ShieldCheck className="h-4 w-4" />Verified</Badge>
                    ) : (
                        <Button type="button" variant="outline" size="sm" onClick={handleSendVerificationEmail} disabled={sendingVerification}>
                            {sendingVerification ? <Loader2 className="animate-spin" /> : <MailWarning />}
                            Verify Now
                        </Button>
                    )}
                </div>
            </div>
          </div>
           <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <Label htmlFor="mobile-number">Mobile Number</Label>
                <div className="flex items-center gap-2">
                    <Select value={profile?.mobile?.countryCode} onValueChange={(val) => handleNestedInputChange('mobile', 'countryCode', val)}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map(country => (
                                <SelectItem key={country.name} value={country.code}>{country.code}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input id="mobile-number" name="mobile-number" type="tel" value={profile?.mobile?.number ?? ''} onChange={(e) => handleNestedInputChange('mobile', 'number', e.target.value)} placeholder="10-digit number" maxLength={10} readOnly={showOtpInput || profile?.mobile?.verified} />
                    {profile?.mobile?.verified ? (
                         <Badge variant="success" className="gap-1"><ShieldCheck className="h-4 w-4" />Verified</Badge>
                    ) : (
                        !showOtpInput && (
                            <Button type="button" variant="outline" size="sm" onClick={handleSendOtp} disabled={isVerifyingMobile || !profile?.mobile?.number}>
                                {isVerifyingMobile ? <Loader2 className="animate-spin" /> : 'Verify'}
                            </Button>
                        )
                    )}
                </div>
                 {showOtpInput && (
                    <div className="flex items-end gap-2 mt-2">
                         <div className="flex-1 space-y-1">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} />
                         </div>
                        <Button type="button" onClick={handleVerifyOtp} disabled={isVerifyingMobile}>
                            {isVerifyingMobile ? <Loader2 className="animate-spin" /> : 'Submit OTP'}
                        </Button>
                    </div>
                )}
              </div>
           </div>
           <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={profile?.address ?? ''} onChange={(e) => handleInputChange('address', e.target.value)} />
            </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-medium">Payment Methods</h3>
            <p className="text-sm text-muted-foreground">Update your payment information.</p>
            <Tabs defaultValue="card" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="card"><CreditCard className="mr-2" />Card</TabsTrigger>
                <TabsTrigger value="netbanking"><Landmark className="mr-2" />Net Banking</TabsTrigger>
                <TabsTrigger value="upi"><Smartphone className="mr-2" />UPI</TabsTrigger>
              </TabsList>
              <TabsContent value="card">
                <Card className="mt-4">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-muted-foreground" />
                                {profile?.paymentMethod?.last4 ? (
                                    <span className="font-semibold">{profile.paymentMethod.cardType} ending in {profile.paymentMethod.last4}</span>
                                ) : <span className="font-semibold">No card added</span>}
                            </div>
                            {profile?.paymentMethod?.expiry && <span className="text-sm text-muted-foreground">Expires {profile.paymentMethod.expiry}</span>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                            <div className="space-y-2 md:col-span-12">
                                <Label htmlFor="card-number">Card Number</Label>
                                <Input id="card-number" placeholder="xxxx xxxx xxxx xxxx" />
                            </div>
                            <div className="space-y-2 md:col-span-6">
                                <Label htmlFor="expiry-date">Expiry Date</Label>
                                <Input id="expiry-date" placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2 md:col-span-6">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" type="password" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="netbanking">
                <Card className="mt-4">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank-select">Select Your Bank</Label>
                            <Select value={profile?.netBankingBank} onValueChange={(val) => handleInputChange('netBankingBank', val)}>
                                <SelectTrigger id="bank-select">
                                    <SelectValue placeholder="Choose a bank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks.map(bank => (
                                        <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">You will be redirected to your bank's website to complete the payment.</p>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="upi">
                <Card className="mt-4">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="upi-id">Your UPI ID</Label>
                            <Input id="upi-id" placeholder="yourname@bank" value={profile?.upiId ?? ''} onChange={(e) => handleInputChange('upiId', e.target.value)} />
                            <p className="text-xs text-muted-foreground">A payment request will be sent to this UPI ID.</p>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
