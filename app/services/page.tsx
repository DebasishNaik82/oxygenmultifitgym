import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Services from '@/components/sections/services';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-brand-charcoal text-white">
      <Navbar />
      <div className="pt-20">
        <Services />
      </div>
      <Footer />
    </main>
  );
}
