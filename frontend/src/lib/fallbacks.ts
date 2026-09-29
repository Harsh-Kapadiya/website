// Shown only when Supabase isn't configured (or a table is empty), so the
// site never renders blank. Real content always comes from the admin panel.

export type NavLink = { id: string; label: string; path: string };
export type SocialLink = { id: string; platform: string; url: string };
export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  image_url: string;
  size: 'large' | 'small';
  link_url?: string | null;
  slug: string;
  overview?: string | null;
  challenge?: string | null;
  solution?: string | null;
  results?: string | null;
  gallery?: string[];
};

export const NAV_LINKS: NavLink[] = [
  { id: '1', label: 'Work', path: '/work' },
  { id: '2', label: 'Services', path: '/services' },
  { id: '3', label: 'About', path: '/about' },
  { id: '4', label: 'Resume', path: '/resume' },
  { id: '5', label: 'Contact', path: '/contact' },
];

export const SOCIALS: SocialLink[] = [
  { id: '1', platform: 'LinkedIn', url: 'https://www.linkedin.com/in/harsh-kapadiya-0a25b1325/' },
  { id: '2', platform: 'GitHub', url: 'https://github.com/Harsh-Kapadiya' },
  { id: '3', platform: 'X', url: 'https://x.com/Harsh2021800' },
  { id: '4', platform: 'LeetCode', url: 'https://leetcode.com/u/Harsh_kapadiya/' },
  { id: '5', platform: 'Instagram', url: 'https://www.instagram.com/harsh._kapadiya/' },
];

const img = (id: string) => `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`;

export const PROJECTS: Project[] = [
  {
    id: '1', title: 'Luminary', category: 'Brand Identity · Web Design', year: '2024', size: 'large', slug: 'luminary',
    image_url: img('photo-1614036634955-ae5e90f9b9eb'),
    overview: 'A full brand identity and web presence for a creative studio repositioning itself for larger clients.',
    challenge: 'The existing brand felt dated and did not reflect the caliber of work the studio was producing.',
    solution: 'Rebuilt the identity from the ground up — new mark, type system, and a component-driven website that scales with their content.',
  },
  { id: '2', title: 'Noir Studio', category: 'Product Design', year: '2024', size: 'small', slug: 'noir-studio', image_url: img('photo-1499951360447-b19be8fe80f5') },
  { id: '3', title: 'Velvet', category: 'E-commerce · Art Direction', year: '2024', size: 'small', slug: 'velvet', image_url: img('photo-1667266543254-505cf5b16ec4') },
  { id: '4', title: 'Forma', category: 'Web App · Design System', year: '2023', size: 'large', slug: 'forma', image_url: img('photo-1671159593357-ee577a598f71') },
];
