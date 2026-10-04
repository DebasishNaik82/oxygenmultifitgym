'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Inquiry, AdminStats } from '@/types';
import { 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Loader2,
  Database
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    new: 0,
    contacted: 0,
    followUp: 0,
    converted: 0,
    closed: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const toast = useToast();

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();

      // Seed local storage reviews & inquiries as well so dashboard updates immediately
      const sampleReviews = [
        {
          id: 'seed-rev-1',
          customerName: 'Baidyanath Narayan Sinha',
          review: 'The equipment quality is unmatched in the region. Best for serious students of fitness.',
          rating: 5,
          date: 'Member for 7 years',
          published: true,
        },
        {
          id: 'seed-rev-2',
          customerName: 'Ranjit Mahananad',
          review: 'Elite trainer and a professional staff. The environment is focused and disciplined.',
          rating: 5,
          date: 'Member for 1 year',
          published: true,
        },
        {
          id: 'seed-rev-3',
          customerName: 'Preeti Kola',
          review: 'Complete facility with flexible timings. The most premium gym experience in Bhawanipatna.',
          rating: 5,
          date: 'Member for 2 years',
          published: true,
        },
      ];
      localStorage.setItem('local_reviews', JSON.stringify(sampleReviews));

      const sampleInquiries = [
        {
          id: 'seed-inq-1',
          name: 'Amit Patel',
          phone: '+91 98765 43210',
          email: 'amit.patel@gmail.com',
          interestedIn: 'Membership',
          message: 'Interested in 1-year annual fitness membership. Please share pricing and timings.',
          status: 'new',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        },
        {
          id: 'seed-inq-2',
          name: 'Pooja Mohanty',
          phone: '+91 91234 56789',
          email: 'pooja.m@gmail.com',
          interestedIn: 'Personal Training',
          message: 'Looking for a dedicated personal trainer for strength conditioning.',
          status: 'contacted',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        },
        {
          id: 'seed-inq-3',
          name: 'Debashish Sahoo',
          phone: '+91 94370 11223',
          email: 'debashish.s@yahoo.com',
          interestedIn: 'Fitness Training',
          message: 'Want to book a trial gym session for this weekend.',
          status: 'converted',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        },
      ];
      localStorage.setItem('local_inquiries', JSON.stringify(sampleInquiries));

      setRecentInquiries(sampleInquiries as any);
      setStats({
        total: sampleInquiries.length,
        new: 1,
        contacted: 1,
        followUp: 0,
        converted: 1,
        closed: 0,
      });

      if (data.credentials || data.reviewsCount > 0) {
        toast.success(`Database populated with admin credentials, ${data.reviewsCount} reviews, and ${data.inquiriesCount} inquiries!`);
      } else {
        toast.info('Seed data loaded successfully! (Note: In Firebase Console > Rules, set allow read/write for live cloud sync).');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to seed data.');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const inquiriesRef = collection(db, 'inquiries');
        const q = query(inquiriesRef, orderBy('createdAt', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
        setRecentInquiries(inquiries);

        // Fetch all inquiries to compute stats (in a real app, use a counter or cloud function)
        const allSnapshot = await getDocs(inquiriesRef);
        let all = allSnapshot.docs.map(doc => doc.data() as Inquiry);
        if (all.length === 0) {
          try {
            all = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
            setRecentInquiries(all.slice(0, 5));
          } catch (e) {
            // ignore
          }
        }
        
        setStats({
          total: all.length,
          new: all.filter(i => i.status === 'new').length,
          contacted: all.filter(i => i.status === 'contacted').length,
          followUp: all.filter(i => i.status === 'follow_up').length,
          converted: all.filter(i => i.status === 'converted').length,
          closed: all.filter(i => i.status === 'closed').length,
        });
      } catch (error) {
        console.warn("Firestore dashboard note (loading local):", error);
        try {
          const local = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
          setRecentInquiries(local.slice(0, 5));
          setStats({
            total: local.length,
            new: local.filter((i: any) => i.status === 'new').length,
            contacted: local.filter((i: any) => i.status === 'contacted').length,
            followUp: local.filter((i: any) => i.status === 'follow_up').length,
            converted: local.filter((i: any) => i.status === 'converted').length,
            closed: local.filter((i: any) => i.status === 'closed').length,
          });
        } catch (e) {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  const statCards = [
    { name: 'Total Inquiries', value: stats.total, icon: MessageSquare, color: 'text-white' },
    { name: 'New', value: stats.new, icon: Clock, color: 'text-brand-green' },
    { name: 'Converted', value: stats.converted, icon: CheckCircle2, color: 'text-blue-500' },
    { name: 'Follow-up', value: stats.followUp, icon: Users, color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Dashboard</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Overview & Statistics</p>
        </div>

        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="px-5 py-2.5 bg-brand-green hover:bg-white text-brand-charcoal text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10 disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          {seeding ? 'Populating Database...' : 'Seed / Sync Database'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-brand-dark p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
            <div>
              <div className="text-3xl font-black italic">{stat.value}</div>
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold uppercase italic">Recent Inquiries</h3>
            <Link href="/admin/inquiries" className="text-brand-green text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-brand-dark border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-white/30 text-xs italic">No inquiries found</td>
                  </tr>
                ) : (
                  recentInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold">{inquiry.name}</div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{inquiry.interestedIn}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded",
                          inquiry.status === 'new' ? "bg-brand-green text-brand-charcoal" : "bg-white/10 text-white/70"
                        )}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-white/40">
                        {inquiry.createdAt ? format(inquiry.createdAt.toDate(), 'MMM dd, HH:mm') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/inquiries?id=${inquiry.id}`} className="text-white/40 hover:text-brand-green transition-colors">
                          <ArrowUpRight className="w-4 h-4 ml-auto" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase italic">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: 'Update Facility', href: '/admin/facilities' },
              { name: 'Add Service', href: '/admin/services' },
              { name: 'Edit Memberships', href: '/admin/membership' },
              { name: 'Manage Gallery', href: '/admin/gallery' },
            ].map((action) => (
              <Link 
                key={action.name}
                href={action.href}
                className="bg-brand-charcoal p-6 border border-white/5 hover:border-brand-green/30 transition-all group flex items-center justify-between"
              >
                <span className="text-xs font-bold uppercase tracking-widest">{action.name}</span>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-brand-green transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to make cn work in this file if I missed it
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
