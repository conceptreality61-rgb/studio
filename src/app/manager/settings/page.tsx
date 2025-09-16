
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';

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
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [primaryColor, setPrimaryColor] = useState(theme.primary);

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
            <CardHeader>
                <CardTitle>App Information</CardTitle>
                <CardDescription>General application settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">More settings will be available here in the future.</p>
            </CardContent>
        </Card>
    </div>
  );
}
