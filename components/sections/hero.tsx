'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-brand-charcoal">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/background.jpg" 
          alt="Gym Background"
          fill
          className="object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl p-12 bg-brand-dark/50 border border-white/5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="h-[2px] w-12 bg-brand-green" />
            <span className="text-brand-green text-xs font-semibold uppercase tracking-[0.4em] font-jakarta">
              Est. 2016 · Bhawanipatna
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl md:text-[120px] font-syne font-bold italic uppercase tracking-tighter leading-[0.85] mb-12 text-balance"
          >
            Best Gym <span className="text-brand-green">In Town</span>.<br />
            Come and <span className="text-white/20 text-stroke">Train Hard</span>.
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/50 text-lg md:text-xl font-jakarta leading-relaxed border-l-2 border-white/10 pl-8"
            >
              The best gym in your city. Come train with us and reach your fitness goals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-6"
            >
              <Link
                href="/contact"
                className="group relative px-10 py-5 bg-brand-green text-brand-charcoal font-syne font-bold uppercase tracking-widest text-xs hover:bg-white transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Join The Elite
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/about"
                className="px-10 py-5 border border-white/10 text-white font-syne font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-brand-charcoal transition-all duration-300"
              >
                The Philosophy
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
