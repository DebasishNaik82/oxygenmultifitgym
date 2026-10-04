import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST() {
  const results = {
    credentials: false,
    reviewsCount: 0,
    inquiriesCount: 0,
    errors: [] as string[],
  };

  // 1. Admin Credentials
  try {
    await setDoc(doc(db, 'admin', 'credentials'), {
      username: 'OxygenMultifit',
      password: 'OxygenMultifit88@#',
      updatedAt: serverTimestamp(),
    });
    results.credentials = true;
  } catch (err: any) {
    results.errors.push(`Admin credentials: ${err?.message}`);
  }

  // 2. Initial Reviews
  const reviews = [
    {
      customerName: 'Baidyanath Narayan Sinha',
      review: 'The equipment quality is unmatched in the region. Best for serious students of fitness.',
      rating: 5,
      date: 'Member for 7 years',
      published: true,
      createdAt: serverTimestamp(),
    },
    {
      customerName: 'Ranjit Mahananad',
      review: 'Elite trainer and a professional staff. The environment is focused and disciplined.',
      rating: 5,
      date: 'Member for 1 year',
      published: true,
      createdAt: serverTimestamp(),
    },
    {
      customerName: 'Preeti Kola',
      review: 'Complete facility with flexible timings. The most premium gym experience in Bhawanipatna.',
      rating: 5,
      date: 'Member for 2 years',
      published: true,
      createdAt: serverTimestamp(),
    },
    {
      customerName: 'Rahul Verma',
      review: 'State of the art cardio section and heavy weights. Great vibe and energetic community.',
      rating: 5,
      date: 'Member for 6 months',
      published: true,
      createdAt: serverTimestamp(),
    },
    {
      customerName: 'Sasmita Dash',
      review: 'Safe, clean and very hygienic workout environment. Female friendly and supportive coaches.',
      rating: 5,
      date: 'Member for 1.5 years',
      published: true,
      createdAt: serverTimestamp(),
    },
  ];

  for (const rev of reviews) {
    try {
      await addDoc(collection(db, 'reviews'), rev);
      results.reviewsCount++;
    } catch (err: any) {
      results.errors.push(`Review (${rev.customerName}): ${err?.message}`);
    }
  }

  // 3. Initial Inquiries
  const inquiries = [
    {
      name: 'Amit Patel',
      phone: '+91 98765 43210',
      email: 'amit.patel@gmail.com',
      interestedIn: 'Membership',
      message: 'Interested in 1-year annual fitness membership. Please share pricing and timings.',
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      name: 'Pooja Mohanty',
      phone: '+91 91234 56789',
      email: 'pooja.m@gmail.com',
      interestedIn: 'Personal Training',
      message: 'Looking for a dedicated personal trainer for strength conditioning and weight management.',
      status: 'contacted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      name: 'Debashish Sahoo',
      phone: '+91 94370 11223',
      email: 'debashish.s@yahoo.com',
      interestedIn: 'Fitness Training',
      message: 'Want to book a trial gym session for this weekend.',
      status: 'converted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  for (const inq of inquiries) {
    try {
      await addDoc(collection(db, 'inquiries'), inq);
      results.inquiriesCount++;
    } catch (err: any) {
      results.errors.push(`Inquiry (${inq.name}): ${err?.message}`);
    }
  }

  const hasErrors = results.errors.length > 0;
  return NextResponse.json({
    success: !hasErrors || results.reviewsCount > 0 || results.credentials,
    ...results,
  });
}
