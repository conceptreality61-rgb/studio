
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Briefcase, Users, BarChart, Settings, Wallet, Star, Route, User, Home, Wrench, Calendar, MessageSquare, UserCheck } from 'lucide-react';

export type Service = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  imageId: string;
  price: number;
};

export const services: Service[] = [
  {
    id: 'maid-service',
    name: 'Maid Service',
    description: 'Professional home cleaning for a spotless living space.',
    longDescription: 'Our professional maid services provide a thorough cleaning of your home, ensuring a spotless and healthy living environment. We cover all rooms, including dusting, vacuuming, mopping, and surface sanitization.',
    icon: Home,
    imageId: 'maid-service',
    price: 50,
  },
  {
    id: 'bathroom-cleaning',
    name: 'Bathroom Cleaning',
    description: 'Deep cleaning for sparkling, hygienic bathrooms.',
    longDescription: 'We offer intensive bathroom cleaning services that tackle grime, soap scum, and bacteria. Our team will leave your toilets, showers, sinks, and floors sparkling clean and sanitized.',
    icon: Wrench,
    imageId: 'bathroom-cleaning',
    price: 35,
  },
  {
    id: 'tank-cleaning',
    name: 'Tank Cleaning',
    description: 'Hygienic and safe water tank cleaning services.',
    longDescription: 'Ensure the quality of your water with our professional tank cleaning services. We use safe and effective methods to remove sediment, algae, and other contaminants from your water tank.',
    icon: Wrench,
    imageId: 'tank-cleaning',
    price: 70,
  },
  {
    id: 'gardening',
    name: 'Gardening',
    description: 'Expert care and maintenance for your garden.',
    longDescription: 'Our gardening services include lawn mowing, pruning, weeding, and general garden maintenance to keep your outdoor space beautiful and healthy. We cater to gardens of all sizes.',
    icon: Wrench,
    imageId: 'gardening',
    price: 45,
  },
];

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
};

export const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Bookings', href: '/admin/bookings', icon: Briefcase },
  { title: 'Customers', href: '/admin/customers', icon: Users },
  { title: 'Workers', href: '/admin/workers', icon: UserCheck },
  { title: 'Smart Router', href: '/admin/smart-router', icon: Route },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

export const customerNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/customer', icon: LayoutDashboard },
  { title: 'My Bookings', href: '/customer/bookings', icon: Briefcase },
  { title: 'Profile', href: '/customer/profile', icon: User },
];

export const workerNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/worker', icon: LayoutDashboard },
  { title: 'My Tasks', href: '/worker/tasks', icon: Briefcase },
  { title: 'Schedule', href: '/worker/schedule', icon: Calendar },
  { title: 'Earnings', href: '/worker/earnings', icon: Wallet },
  { title: 'Chat', href: '/worker/chat', icon: MessageSquare },
  { title: 'Profile', href: '/worker/profile', icon: User },
];
