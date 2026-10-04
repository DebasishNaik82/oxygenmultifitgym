import Link from 'next/link';
import { Dumbbell, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Dumbbell className="w-8 h-8 text-brand-green" />
              <span className="text-xl font-bold tracking-tighter uppercase italic">
                Oxygen <span className="text-brand-green">Multifit</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Transform your body and mind at Bhawanipatna&apos;s premium fitness destination. 
              Build strength, discipline, and the best version of yourself.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green hover:text-brand-charcoal transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green hover:text-brand-charcoal transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-white/50 hover:text-brand-green text-sm transition-colors">About Us</Link></li>
              <li><Link href="/facilities" className="text-white/50 hover:text-brand-green text-sm transition-colors">Facilities</Link></li>
              <li><Link href="/membership" className="text-white/50 hover:text-brand-green text-sm transition-colors">Membership</Link></li>
              <li><Link href="/gallery" className="text-white/50 hover:text-brand-green text-sm transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="text-white/50 hover:text-brand-green text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-white/50">
                <MapPin className="w-5 h-5 text-brand-green shrink-0" />
                <span>Dandapani Complex, Balaji Mandir Road, Naktiguda, Bhawanipatna, Odisha 766001, India</span>
              </li>
              <li className="flex gap-3 text-sm text-white/50">
                <Phone className="w-5 h-5 text-brand-green shrink-0" />
                <span>+91 83277 99535</span>
              </li>
              <li className="flex gap-3 text-sm text-white/50">
                <Mail className="w-5 h-5 text-brand-green shrink-0" />
                <span>info@oxygenmultifit.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Opening Hours</h4>
            <ul className="space-y-4">
              <li className="flex justify-between text-sm">
                <span className="text-white/50">Mon - Sat</span>
                <span className="text-brand-green">5:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/50">Sunday</span>
                <span className="text-red-500">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © {currentYear} Oxygen Multifit Gym. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/admin/login" className="text-white/30 hover:text-brand-green text-xs transition-colors">
              Admin Login
            </Link>
            <Link href="#" className="text-white/30 hover:text-brand-green text-xs transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
