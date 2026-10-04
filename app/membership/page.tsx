import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Membership from '@/components/sections/membership';

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-brand-charcoal text-white">
      <Navbar />
      <div className="pt-20">
        <Membership />
      </div>
      <Footer />
    </main>
  );
}
