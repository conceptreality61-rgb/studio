
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Briefcase, Users, BarChart, Settings, Wallet, Star, Route, User, Home, Wrench, Calendar, MessageSquare, UserCheck, Bath, Droplets, Sparkles, DoorOpen, Car, Bug } from 'lucide-react';

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
  subCategories?: ServiceSubCategory[];
};

export const services: Service[] = [
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    description: 'Professional home cleaning for a spotless living space.',
    longDescription: 'Our professional house cleaning services provide a thorough cleaning of your home, ensuring a spotless and healthy living environment. We cover all rooms, including dusting, vacuuming, mopping, and surface sanitization.',
    icon: Sparkles,
    imageId: 'house-cleaning',
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
        id: 'num-tanks',
        name: 'Number of Tanks',
        type: 'single',
        options: [
            { id: '1-tank', name: '1 Tank' },
            { id: '2-tanks', name: '2 Tanks' },
            { id: '3-tanks', name: '3 Tanks' },
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
  {
    id: 'vehicle-cleaning',
    name: 'Vehicle Cleaning',
    description: 'Professional car washing and detailing services.',
    longDescription: 'Get your vehicle looking brand new with our comprehensive cleaning services. From a simple wash to full interior and exterior detailing, we make your car shine.',
    icon: Car,
    imageId: 'vehicle-cleaning',
    subCategories: [
      {
        id: 'vehicle-type',
        name: 'Vehicle Type',
        type: 'single',
        options: [
          { id: 'hatchback', name: 'Hatchback' },
          { id: 'sedan', name: 'Sedan' },
          { id: 'suv', name: 'SUV' },
          { id: 'luxury', name: 'Luxury Car' },
        ],
      },
      {
        id: 'cleaning-package',
        name: 'Cleaning Package',
        type: 'single',
        options: [
          { id: 'exterior-wash', name: 'Exterior Wash' },
          { id: 'interior-vacuum', name: 'Interior Vacuum' },
          { id: 'full-detail', name: 'Full Detailing (Interior + Exterior)' },
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
  action?: 'logout';
};

export const managerNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/manager', icon: LayoutDashboard },
  { title: 'Bookings', href: '/manager/bookings', icon: Briefcase },
  { title: 'Customers', href: '/manager/customers', icon: Users },
  { title: 'Workers', href: '/manager/workers', icon: UserCheck },
  { title: 'Analytics', href: '/manager/analytics', icon: BarChart },
  { title: 'Settings', href: '/manager/settings', icon: Settings },
  { title: 'Log Out', href: '#', icon: DoorOpen, action: 'logout' },
];

export const customerNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/customer', icon: LayoutDashboard },
  { title: 'My Bookings', href: '/customer/bookings', icon: Briefcase },
  { title: 'My Reviews', href: '/customer/reviews', icon: Star },
  { title: 'Profile', href: '/customer/profile', icon: User },
  { title: 'Log Out', href: '#', icon: DoorOpen, action: 'logout' },
];
