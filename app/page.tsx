import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import Services from '@/components/sections/services';
import Reviews from '@/components/sections/reviews';
import Contact from '@/components/sections/contact';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-charcoal text-white selection:bg-brand-green selection:text-brand-charcoal">
      <Navbar />
      
      <Hero />
      
      <div className="relative">
        <About />
        <div className="container mx-auto px-6 pb-24 -mt-12">
          <Link 
            href="/about" 
            className="inline-flex items-center gap-2 text-brand-green font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
          >
            Learn More About Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="relative bg-brand-dark">
        <Services />
        <div className="container mx-auto px-6 pb-24 -mt-12 text-center">
          <Link 
            href="/services" 
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-charcoal transition-all"
          >
            Explore All Programs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <section className="py-24 bg-brand-charcoal">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/facilities" className="group p-10 bg-brand-dark border border-white/5 hover:border-brand-green/30 transition-all">
              <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-4">The Facility</span>
              <h3 className="text-2xl font-black uppercase italic mb-4 group-hover:text-brand-green transition-colors">Elite Amenities</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">Explore our state-of-the-art equipment and training areas.</p>
              <div className="flex items-center gap-2 text-brand-green font-black uppercase tracking-widest text-[10px]">
                View Facilities <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link href="/membership" className="group p-10 bg-brand-dark border border-white/5 hover:border-brand-green/30 transition-all">
              <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-4">Join Us</span>
              <h3 className="text-2xl font-black uppercase italic mb-4 group-hover:text-brand-green transition-colors">Membership Plans</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">Flexible plans designed to fit your fitness journey and goals.</p>
              <div className="flex items-center gap-2 text-brand-green font-black uppercase tracking-widest text-[10px]">
                See Pricing <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link href="/gallery" className="group p-10 bg-brand-dark border border-white/5 hover:border-brand-green/30 transition-all">
              <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-4">Visuals</span>
              <h3 className="text-2xl font-black uppercase italic mb-4 group-hover:text-brand-green transition-colors">Gym Gallery</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">Take a virtual tour of our premium training environment.</p>
              <div className="flex items-center gap-2 text-brand-green font-black uppercase tracking-widest text-[10px]">
                Open Gallery <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Reviews />
      <Contact />
      
      <Footer />
    </main>
  );
}
