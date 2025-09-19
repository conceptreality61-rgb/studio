
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
        id: 'num-rooms',
        name: 'room cleaning',
        type: 'single',
        options: [
          { id: '1-room', name: '1' },
          { id: '2-rooms', name: '2' },
          { id: '3-rooms', name: '3' },
          { id: '4-rooms', name: '4' },
          { id: '5-plus-rooms', name: '5+' },
        ],
      },
      {
        id: 'num-kitchens',
        name: 'Kitchen cleaning',
        type: 'single',
        options: [
          { id: '1-kitchen', name: '1' },
          { id: '2-kitchens', name: '2' },
        ],
      },
       {
        id: 'num-wash-basins',
        name: 'Number of Wash Basins',
        type: 'single',
        options: [
          { id: '1-basin', name: '1' },
          { id: '2-basins', name: '2' },
          { id: '3-basins', name: '3' },
          { id: '4-basins', name: '4' },
          { id: '5-plus-basins', name: '5+' },
        ],
      },
      {
        id: 'num-fridges',
        name: 'Number of Fridges',
        type: 'single',
        options: [
          { id: '1-fridge', name: '1' },
          { id: '2-fridges', name: '2' },
          { id: '3-plus-fridges', name: '3+' },
        ],
      },
      {
        id: 'num-halls',
        name: 'Number of Halls',
        type: 'single',
        options: [
          { id: '1-hall', name: '1' },
          { id: '2-halls', name: '2' },
          { id: '3-plus-halls', name: '3+' },
        ],
      },
      {
        id: 'num-balconies',
        name: 'Number of Balconies',
        type: 'single',
        options: [
          { id: '1-balcony', name: '1' },
          { id: '2-balconies', name: '2' },
          { id: '3-plus-balconies', name: '3+' },
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
        id: 'num-bathrooms',
        name: 'Number of Bathrooms',
        type: 'single',
        options: [
          { id: '1-bathroom', name: '1' },
          { id: '2-bathrooms', name: '2' },
          { id: '3-bathrooms', name: '3' },
          { id: '4-plus-bathrooms', name: '4+' },
        ],
      },
      {
        id: 'num-toilets',
        name: 'Number of Toilets',
        type: 'single',
        options: [
          { id: '1-toilet', name: '1' },
          { id: '2-toilets', name: '2' },
          { id: '3-toilets', name: '3' },
          { id: '4-plus-toilets', name: '4+' },
        ],
      },
      {
        id: 'tasks',
        name: 'Specific tasks',
        type: 'multiple',
        options: [
          { id: 'showers-tubs', name: 'Showers and Tubs' },
          { id: 'tile-grout', name: 'Tile and Grout' },
          { id: 'mirrors-fixtures', name: 'Mirrors and Fixtures' },
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
        name: 'Specific tasks',
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
