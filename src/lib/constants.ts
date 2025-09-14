
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Briefcase, Users, BarChart, Settings, Wallet, Star, Route, User, Home, Wrench, Calendar, MessageSquare, UserCheck, Bath, Droplets } from 'lucide-react';

export type ServiceSubCategoryOption = {
  id: string;
  name: string;
  // Price modifier can be added later, e.g., priceModifier: 10
};

export type ServiceSubCategory = {
  id: string;
  name:string;
  type: 'single' | 'multiple';
  options: ServiceSubCategoryOption[];
};

export type Service = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  imageId: string;
  price: number;
  subCategories?: ServiceSubCategory[];
};

export const services: Service[] = [
  {
    id: 'maid-service',
    name: 'Maid Service',
    description: 'Professional home cleaning for a spotless living space.',
    longDescription: 'Our professional maid services provide a thorough cleaning of your home, ensuring a spotless and healthy living environment. We cover all rooms, including dusting, vacuuming, mopping, and surface sanitization.',
    icon: Home,
    imageId: 'maid-service',
    price: 25, // Base price per hour
    subCategories: [
      {
        id: 'tasks',
        name: 'Select Tasks',
        type: 'multiple',
        options: [
          { id: 'dish-cleaning', name: 'Dish Cleaning' },
          { id: 'mopping', name: 'Mopping' },
          { id: 'kitchen-cleaning', name: 'Kitchen Cleaning' },
          { id: 'full-cooking', name: 'Full Cooking' },
          { id: 'cooking-help', name: 'Cooking Help' },
          { id: 'baby-care', name: 'Baby Care' },
        ],
      },
      {
        id: 'duration',
        name: 'Select Duration',
        type: 'single',
        options: [
          { id: '1-hour', name: '1 Hour' },
          { id: '2-hours', name: '2 Hours' },
          { id: '3-hours', name: '3 Hours' },
          { id: '4-hours', name: '4 Hours' },
          { id: '5-hours', name: '5 Hours' },
          { id: '6-hours', name: '6 Hours' },
          { id: '7-hours', name: '7 Hours' },
          { id: '8-hours', name: '8 Hours (Full Day)' },
        ],
      },
    ],
  },
  {
    id: 'bathroom-cleaning',
    name: 'Bathroom Cleaning',
    description: 'Deep cleaning for sparkling, hygienic bathrooms.',
    longDescription: 'We offer intensive bathroom cleaning services that tackle grime, soap scum, and bacteria. Our team will leave your toilets, showers, sinks, and floors sparkling clean and sanitized.',
    icon: Bath,
    imageId: 'bathroom-cleaning',
    price: 35,
    subCategories: [
      {
        id: 'tasks',
        name: 'Select Tasks',
        type: 'multiple',
        options: [
          { id: 'tile-grout-cleaning', name: 'Tile and Grout Cleaning' },
          { id: 'toilet-sanitization', name: 'Toilet Sanitization' },
          { id: 'shower-tub-cleaning', name: 'Shower and Tub Deep Clean' },
          { id: 'sink-mirror-polishing', name: 'Sink and Mirror Polishing' },
        ],
      },
      {
        id: 'num-bathrooms',
        name: 'Number of Bathrooms',
        type: 'single',
        options: [
          { id: '1-bathroom', name: '1 Bathroom' },
          { id: '2-bathrooms', name: '2 Bathrooms' },
          { id: '3-bathrooms', name: '3 Bathrooms' },
          { id: '4-plus-bathrooms', name: '4+ Bathrooms' },
        ],
      },
      {
        id: 'duration',
        name: 'Select Duration',
        type: 'single',
        options: [
          { id: '1-hour', name: '1 Hour' },
          { id: '2-hours', name: '2 Hours' },
          { id: '3-hours', name: '3 Hours' },
        ],
      },
    ],
  },
  {
    id: 'tank-cleaning',
    name: 'Tank Cleaning',
    description: 'Hygienic and safe water tank cleaning services.',
    longDescription: 'Ensure the quality of your water with our professional tank cleaning services. We use safe and effective methods to remove sediment, algae, and other contaminants from your water tank.',
    icon: Droplets,
    imageId: 'tank-cleaning',
    price: 70, // Base price
    subCategories: [
      {
        id: 'tank-type',
        name: 'Select Tank Type',
        type: 'single',
        options: [
          { id: 'type-overhead', name: 'Overhead Plastic/Syntax' },
          { id: 'type-underground', name: 'Underground Concrete' },
        ],
      },
       {
        id: 'tank-size',
        name: 'Select Tank Size',
        type: 'single',
        options: [
          { id: 'size-small', name: 'Up to 500L' },
          { id: 'size-medium', name: '500L - 1000L' },
          { id: 'size-large', name: 'Over 1000L' },
        ],
      },
    ]
  },
  {
    id: 'gardening',
    name: 'Gardening',
    description: 'Expert care and maintenance for your garden.',
    longDescription: 'Our gardening services include lawn mowing, pruning, weeding, and general garden maintenance to keep your outdoor space beautiful and healthy. We cater to gardens of all sizes.',
    icon: Wrench,
    imageId: 'gardening',
    price: 45,
    subCategories: [
       {
        id: 'tasks',
        name: 'Select Tasks',
        type: 'multiple',
        options: [
          { id: 'lawn-mowing', name: 'Lawn Mowing' },
          { id: 'pruning', name: 'Pruning' },
          { id: 'weeding', name: 'Weeding' },
          { id: 'planting', name: 'Planting Flowers' },
        ],
      },
       {
        id: 'duration',
        name: 'Select Duration',
        type: 'single',
        options: [
          { id: '1-hour', name: '1 Hour' },
          { id: '2-hours', name: '2 Hours' },
          { id: '3-hours', name: '3 Hours' },
          { id: '4-hours', name: '4 Hours' },
        ],
      },
    ]
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
  { title: 'My Reviews', href: '/customer/reviews', icon: Star },
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
