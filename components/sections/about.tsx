'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

export default function About() {
  const stats = [
    { label: 'Founded', value: '2016' },
    { label: 'Surface', value: 'Premium' },
    { label: 'Mentors', value: 'Expert' },
    { label: 'Vibe', value: 'Elite' },
  ];

  return (
    <section id="about" className="py-32 bg-brand-charcoal overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-[4/5] bg-brand-dark border border-white/10 relative group overflow-hidden">
              <Image 
                src="/background.jpg" 
                alt="Gym Interior"
                fill
                className="object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-green/5 group-hover:bg-brand-green/10 transition-colors duration-700" />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <span className="font-syne font-black text-[12vw] italic text-stroke opacity-10 select-none">
                  PURE
                </span>
              </div>
              <div className="absolute bottom-12 left-12 right-12">
                <div className="font-syne font-black text-4xl italic uppercase leading-none mb-2">
                  Hard <span className="text-brand-green">Work</span>.
                </div>
                <div className="font-syne font-black text-2xl italic uppercase text-white/40">
                  No Excuses.
                </div>
              </div>
            </div>
            
            {/* Overlapping element */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-brand-green p-8 hidden md:flex flex-col justify-between font-syne italic">
              <span className="font-black text-brand-charcoal text-4xl leading-none">O2</span>
              <span className="font-black text-brand-charcoal text-[10px] uppercase tracking-widest leading-tight">
                Oxygen<br />Multifit
              </span>
            </div>
          </motion.div>

            <div className="lg:col-span-7 lg:pl-12 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-brand-green text-[10px] font-semibold uppercase tracking-[0.5em] mb-6 block">
                About Us
              </span>
              <h2 className="text-5xl md:text-7xl font-syne font-bold italic uppercase tracking-tighter leading-none mb-8 text-balance">
                Your <span className="text-brand-green">Fitness</span> Journey.
              </h2>
              <div className="space-y-6 text-white/50 text-lg md:text-xl font-jakarta leading-relaxed max-w-2xl">
                <p>
                  Join Oxygen Multifit and train hard. We focus on discipline and consistent effort to help you reach your goals.
                </p>
                <p>
                  Our gym is built for focus. No distractions, just the right tools for your health and fitness.
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="font-syne font-bold italic text-3xl mb-1">{stat.value}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-green/40">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 h-full w-1/3 bg-white/[0.01] pointer-events-none" />
    </section>
  );
}
