import Link from 'next/link';
import { Twitter, Facebook, Instagram } from 'lucide-react';
import Logo from '@/components/logo';

export default function MainFooter() {
  return (
    <footer className="bg-secondary">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Link href="/">
              <Logo className="text-primary justify-center md:justify-start"/>
            </Link>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              Your Home, Spotlessly Clean.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Facebook />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Instagram />
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CleanSweep Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
