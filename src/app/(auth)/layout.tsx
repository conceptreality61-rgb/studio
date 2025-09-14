import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-secondary p-4">
       <div className="absolute top-8 left-8">
         <Link href="/">
           <Logo className="text-primary"/>
         </Link>
       </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
