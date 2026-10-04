import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Contact from '@/components/sections/contact';
import Location from '@/components/sections/location';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-charcoal text-white">
      <Navbar />
      <div className="pt-20">
        <Contact />
        <Location />
      </div>
      <Footer />
    </main>
  );
}
