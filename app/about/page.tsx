import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import About from '@/components/sections/about';
import Reviews from '@/components/sections/reviews';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-charcoal text-white">
      <Navbar />
      <div className="pt-20">
        <About />
        <Reviews />
      </div>
      <Footer />
    </main>
  );
}
