
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Landmark, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';

// Mock data, in a real app this would come from your backend
const customerProfile = {
  mobile: {
    countryCode: '+1',
    number: '5551234567'
  },
  landline: {
    countryCode: '+1',
    number: '5559876543'
  },
  address: '123 Maple Street, Anytown, USA',
  paymentMethod: {
    cardType: 'Visa',
    last4: '1234',
    expiry: '12/26',
  },
  upiId: 'user@bank',
  netBankingBank: 'sbi'
};

const banks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'pnb', name: 'Punjab National Bank' },
]

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const mobileInput = form.elements.namedItem('mobile-number') as HTMLInputElement;
    const mobileNumber = mobileInput.value;

    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Mobile Number',
        description: 'Mobile number must be exactly 10 digits and contain no letters.',
      });
      return;
    }

    // Logic to save changes would go here
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.photoURL ?? `https://i.pravatar.cc/128?u=${user?.uid}`} />
            <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{user?.displayName}</CardTitle>
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
              <Input id="name" defaultValue={user?.displayName ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user?.email ?? ''} readOnly />
            </div>
          </div>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mobile-number">Mobile Number</Label>
                <div className="flex gap-2">
                    <Select defaultValue={customerProfile.mobile.countryCode}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map(country => (
                                <SelectItem key={country.name} value={country.code}>{country.code}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input id="mobile-number" name="mobile-number" type="tel" defaultValue={customerProfile.mobile.number} placeholder="10-digit number" maxLength={10} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landline-number">Landline Number</Label>
                <div className="flex gap-2">
                    <Select defaultValue={customerProfile.landline.countryCode}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map(country => (
                                <SelectItem key={country.name} value={country.code}>{country.code}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input id="landline-number" type="tel" defaultValue={customerProfile.landline.number} placeholder="Landline number" />
                </div>
              </div>
           </div>
           <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue={customerProfile.address} />
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
                                <span className="font-semibold">{customerProfile.paymentMethod.cardType} ending in {customerProfile.paymentMethod.last4}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">Expires {customerProfile.paymentMethod.expiry}</span>
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
                            <Select defaultValue={customerProfile.netBankingBank}>
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
                            <Input id="upi-id" placeholder="yourname@bank" defaultValue={customerProfile.upiId} />
                            <p className="text-xs text-muted-foreground">A payment request will be sent to this UPI ID.</p>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
