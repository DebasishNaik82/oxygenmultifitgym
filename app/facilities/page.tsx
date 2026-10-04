import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Facilities from '@/components/sections/facilities';

export default function FacilitiesPage() {
  return (
    <main className="min-h-screen bg-brand-charcoal text-white">
      <Navbar />
      <div className="pt-20">
        <Facilities />
      </div>
      <Footer />
    </main>
  );
}
