'use client';

import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const services = [
  {
    id: '01',
    name: 'Tactical Strength',
    description: 'Precision weight training focused on functional power and structural integrity.',
    tag: 'Strength'
  },
  {
    id: '02',
    name: 'Metabolic Reset',
    description: 'High-intensity conditioning designed to shift your body composition rapidly.',
    tag: 'Fat Loss'
  },
  {
    id: '03',
    name: 'Hypertrophy Axis',
    description: 'Scientific muscle building protocols for specific physique optimization.',
    tag: 'Bodybuilding'
  },
  {
    id: '04',
    name: 'Elite Coaching',
    description: 'Direct access to expert methodology and personalized performance strategy.',
    tag: 'Personal'
  },
];

export default function Services() {
  return (
    <section id="services" className="py-32 bg-brand-charcoal overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="text-brand-green text-[10px] font-semibold uppercase tracking-[0.5em] mb-6 block">
              What We Offer
            </span>
            <h2 className="text-5xl md:text-8xl font-syne font-bold italic uppercase tracking-tighter leading-none mb-8">
              Training <span className="text-brand-green">Programs</span>
            </h2>
            <p className="text-white/40 text-lg md:text-xl font-jakarta leading-relaxed max-w-xl">
              We teach you the right way to train so you can reach your goals quickly.
            </p>
          </motion.div>
          
          <div className="hidden lg:block pt-12">
            <div className="font-syne font-bold text-9xl text-stroke opacity-10 italic">
              WORK
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/10">
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-12 md:p-20 border-b border-white/10 md:even:border-l relative overflow-hidden transition-colors hover:bg-brand-muted"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-12">
                  <span className="font-syne font-bold text-4xl text-white/10 group-hover:text-brand-green transition-colors duration-500">
                    {service.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green/40 border border-brand-green/20 px-3 py-1">
                    {service.tag}
                  </span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-syne font-bold italic uppercase mb-6 group-hover:translate-x-2 transition-transform duration-500">
                  {service.name}
                </h3>
                <p className="text-white/40 group-hover:text-white/70 transition-colors duration-500 font-jakarta leading-relaxed max-w-sm mb-12">
                  {service.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-brand-green font-syne font-semibold uppercase tracking-widest text-[10px]">
                  Explore Protocol <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
              
              {/* Background glyph for texture */}
              <div className="absolute -bottom-10 -right-10 font-syne font-bold text-[150px] text-white/[0.02] italic pointer-events-none select-none">
                {service.id}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
