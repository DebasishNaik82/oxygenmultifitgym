'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Programs', href: '/services' },
  { name: 'Facilities', href: '/facilities' },
  { name: 'Pricing', href: '/membership' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b',
        scrolled
          ? 'bg-brand-charcoal/95 backdrop-blur-md py-4 border-white/10'
          : 'bg-transparent py-8 border-transparent'
      )}
    >
      <motion.div 
        className="absolute bottom-0 left-0 h-[1px] bg-brand-green z-50"
        style={{ scaleX, transformOrigin: "0%" }}
      />
      <div className="container mx-auto px-6 flex items-center justify-between font-syne text-white">
        {/* Zone 1: Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tighter uppercase italic">
            OXYGEN<span className="text-brand-green">MULTIFIT</span>
          </span>
        </Link>

        {/* Zone 2: Nav Links */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-brand-green transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-6">
          <Link
            href="/contact"
            className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-brand-green hover:text-white transition-colors"
          >
            Access Club
          </Link>
          <button
            className="lg:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-brand-charcoal border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 font-syne">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold uppercase tracking-widest text-white/80 hover:text-brand-green"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-2 w-full py-4 text-center text-[10px] font-semibold uppercase tracking-widest bg-brand-green text-brand-charcoal"
                onClick={() => setIsOpen(false)}
              >
                Access Club
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
