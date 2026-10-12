import { Booking, Item, User } from '../types';
import { addDays, todayISO } from '../utils/date';

/**
 * Seed data for local development. This is the single place fake data lives;
 * once the Firestore-backed API is wired up, only `localStore.ts` changes.
 */

export const CURRENT_USER: User = {
  id: 'u_devan',
  name: 'Devan D',
  campusEmail: 'devan.d@student.university.edu',
  studentId: '22CS1042',
  verificationStatus: 'verified',
  role: 'student',
  rating: 4.9,
  reviewCount: 12,
};

const users: User[] = [
  CURRENT_USER,
  {
    id: 'u_avisar', name: 'Avisar Anand', campusEmail: 'avisar.a@student.university.edu',
    verificationStatus: 'verified', role: 'student', rating: 4.8, reviewCount: 9,
  },
  {
    id: 'u_anmol', name: 'Anmol Kumar', campusEmail: 'anmol.k@student.university.edu',
    verificationStatus: 'verified', role: 'student', rating: 4.7, reviewCount: 6,
  },
  {
    id: 'u_sarah', name: 'Sarah M.', campusEmail: 'sarah.m@student.university.edu',
    verificationStatus: 'verified', role: 'student', rating: 4.9, reviewCount: 21,
  },
  {
    id: 'u_mike', name: 'Mike R.', campusEmail: 'mike.r@student.university.edu',
    verificationStatus: 'verified', role: 'student', rating: 4.6, reviewCount: 14,
  },
  {
    id: 'u_lisa', name: 'Lisa K.', campusEmail: 'lisa.k@student.university.edu',
    verificationStatus: 'verified', role: 'student', rating: 4.5, reviewCount: 8,
  },
  {
    id: 'u_priya', name: 'Priya S.', campusEmail: 'priya.s@student.university.edu',
    verificationStatus: 'verified', role: 'student', rating: 4.8, reviewCount: 11,
  },
  // Pending verifications surface in the admin verification queue (PROJECT_PLAN §12.1).
  {
    id: 'u_nikhil', name: 'Nikhil Verma', campusEmail: 'nikhil.v@student.university.edu',
    studentId: '23EC1187', verificationStatus: 'pending', role: 'student', rating: 0, reviewCount: 0,
  },
  {
    id: 'u_meera', name: 'Meera Iyer', campusEmail: 'meera.i@student.university.edu',
    studentId: '24ME2043', verificationStatus: 'pending', role: 'student', rating: 0, reviewCount: 0,
  },
  // Campus administrator persona (PROJECT_PLAN §5.3).
  {
    id: 'u_admin', name: 'Dr. Chen', campusEmail: 'chen@university.edu',
    verificationStatus: 'verified', role: 'admin', rating: 0, reviewCount: 0,
  },
];

export const USERS: User[] = users;

export const USER_BY_ID: Record<string, User> = Object.fromEntries(
  users.map((u) => [u.id, u])
);

interface SeedItem {
  id: string;
  ownerId: string;
  title: string;
  category: Item['category'];
  description: string;
  pricePerDay: number;
  deposit: number;
  location: string;
  status: Item['status'];
  conditionNote?: string;
}

const seedItems: SeedItem[] = [
  {
    id: 'it_labcoat', ownerId: 'u_sarah', title: 'Chemistry Lab Coat (Size M)',
    category: 'academic', description: 'Standard cotton lab coat in good condition. Washed after every use. Fits size M comfortably.',
    pricePerDay: 30, deposit: 300, location: 'North Campus', status: 'published',
    conditionNote: 'Minor ink mark on left sleeve, otherwise clean.',
  },
  {
    id: 'it_ti84', ownerId: 'u_avisar', title: 'TI-84 Graphing Calculator',
    category: 'electronics', description: 'TI-84 Plus with all functions working. Batteries included. Great for exams and stats labs.',
    pricePerDay: 80, deposit: 1200, location: 'Central Library', status: 'published',
    conditionNote: 'Light scuffs on the sliding cover.',
  },
  {
    id: 'it_blazer', ownerId: 'u_mike', title: 'Interview Blazer (Navy, 38R)',
    category: 'clothing', description: 'Formal navy blazer, dry-cleaned. Perfect for interviews, presentations and convocation.',
    pricePerDay: 150, deposit: 1500, location: 'South Dorms', status: 'published',
  },
  {
    id: 'it_dumbbells', ownerId: 'u_lisa', title: '20lb Dumbbell Set',
    category: 'fitness', description: 'Pair of 20lb dumbbells. Great for a short strength block. Pickup at the sports complex.',
    pricePerDay: 60, deposit: 600, location: 'Sports Complex', status: 'published',
    conditionNote: 'Some surface wear from normal gym use.',
  },
  {
    id: 'it_drafting', ownerId: 'u_anmol', title: 'Drafting Toolkit (Compass + Scales)',
    category: 'academic', description: 'Full geometry and drafting set: compass, set squares, protractor and scale rulers.',
    pricePerDay: 45, deposit: 400, location: 'Engineering Block', status: 'published',
  },
  {
    id: 'it_calc991', ownerId: 'u_sarah', title: 'Scientific Calculator FX-991',
    category: 'electronics', description: 'Casio FX-991EX. Approved for most engineering exams. Comes with a hard case.',
    pricePerDay: 40, deposit: 800, location: 'Central Library', status: 'published',
  },
  {
    id: 'it_gown', ownerId: 'u_priya', title: 'Graduation Gown (Size L)',
    category: 'clothing', description: 'Full graduation set — gown, cap and hood. Fits size L. Ideal for convocation photos.',
    pricePerDay: 200, deposit: 2000, location: 'South Dorms', status: 'published',
  },
  {
    id: 'it_yoga', ownerId: 'u_lisa', title: 'Yoga Mat + Blocks',
    category: 'fitness', description: '6mm anti-slip yoga mat with two foam blocks and a carry strap.',
    pricePerDay: 35, deposit: 350, location: 'Sports Complex', status: 'published',
  },
  {
    id: 'it_lamp', ownerId: 'u_anmol', title: 'LED Clamp Study Lamp',
    category: 'electronics', description: 'Adjustable LED desk lamp with clamp mount and USB power. Three brightness levels.',
    pricePerDay: 30, deposit: 300, location: 'North Campus', status: 'published',
  },
  {
    id: 'it_shoes', ownerId: 'u_mike', title: 'Formal Shoes (UK 9)',
    category: 'clothing', description: 'Black leather formal shoes, UK size 9. Polished and ready for interviews.',
    pricePerDay: 120, deposit: 1200, location: 'West Campus', status: 'published',
  },
  // Owned by the current user, so "My Listings" has content.
  {
    id: 'it_casio', ownerId: 'u_devan', title: 'Casio FX-991EX Calculator',
    category: 'electronics', description: 'My spare scientific calculator. Kept in a case, works perfectly.',
    pricePerDay: 40, deposit: 800, location: 'Engineering Block', status: 'published',
  },
  {
    id: 'it_fieldkit', ownerId: 'u_devan', title: 'Survey Field Kit',
    category: 'other', description: 'Measuring tape, levelling staff and pegs for surveying labs.',
    pricePerDay: 250, deposit: 2500, location: 'Engineering Block', status: 'draft',
  },
];

export const seedItemsResolved = (): Item[] => {
  const now = new Date().toISOString();
  return seedItems.map((s) => {
    const owner = USER_BY_ID[s.ownerId];
    return {
      ...s,
      ownerName: owner?.name ?? 'Unknown',
      ownerVerified: owner?.verificationStatus === 'verified',
      ownerRating: owner?.rating ?? 0,
      photos: [],
      createdAt: now,
      updatedAt: now,
    };
  });
};

/** A couple of bookings so the Bookings tab is not empty on first run. */
export const seedBookings = (): Booking[] => {
  const today = todayISO();
  const items = seedItemsResolved();
  const labcoat = items.find((i) => i.id === 'it_labcoat')!;
  const ti84 = items.find((i) => i.id === 'it_ti84')!;
  const now = new Date().toISOString();

  return [
    {
      id: 'bk_1001',
      itemId: labcoat.id,
      itemTitle: labcoat.title,
      lenderId: labcoat.ownerId,
      lenderName: labcoat.ownerName,
      borrowerId: 'u_devan',
      borrowerName: 'Devan D',
      startDate: addDays(today, 2),
      endDate: addDays(today, 4),
      rentalFee: labcoat.pricePerDay * 3,
      deposit: labcoat.deposit,
      total: labcoat.pricePerDay * 3 + labcoat.deposit,
      status: 'requested',
      createdAt: now,
    },
    {
      id: 'bk_1002',
      itemId: ti84.id,
      itemTitle: ti84.title,
      lenderId: ti84.ownerId,
      lenderName: ti84.ownerName,
      borrowerId: 'u_devan',
      borrowerName: 'Devan D',
      startDate: addDays(today, -1),
      endDate: addDays(today, 1),
      rentalFee: ti84.pricePerDay * 3,
      deposit: ti84.deposit,
      total: ti84.pricePerDay * 3 + ti84.deposit,
      status: 'active',
      createdAt: now,
      pickupConfirmedAt: now,
    },
  ];
};
