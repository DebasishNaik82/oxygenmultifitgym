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

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-4xl p-6 sm:p-8 md:p-12 bg-brand-dark/50 border border-white/5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8"
          >
            <span className="h-[2px] w-8 sm:w-12 bg-brand-green" />
            <span className="text-brand-green text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] font-jakarta">
              Est. 2016 · Bhawanipatna
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-[90px] xl:text-[105px] font-syne font-bold italic uppercase tracking-tighter leading-[0.9] sm:leading-[0.85] mb-6 sm:mb-8 md:mb-12 text-balance"
          >
            Best Gym <span className="text-brand-green">In Town</span>.<br />
            Come and <span className="text-white/20 text-stroke">Train Hard</span>.
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/60 text-sm sm:text-base md:text-lg font-jakarta leading-relaxed border-l-2 border-white/10 pl-4 sm:pl-6 md:pl-8"
            >
              The best gym in your city. Come train with us and reach your fitness goals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 sm:gap-4 md:gap-6"
            >
              <Link
                href="/contact"
                className="group relative px-6 py-3.5 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-brand-green text-brand-charcoal font-syne font-bold uppercase tracking-widest text-[11px] sm:text-xs hover:bg-white transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                  Join The Elite
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/about"
                className="px-6 py-3.5 sm:px-8 sm:py-4 md:px-10 md:py-5 border border-white/10 text-white font-syne font-bold uppercase tracking-widest text-[11px] sm:text-xs hover:bg-white hover:text-brand-charcoal transition-all duration-300"
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
