'use client';

import { Dumbbell, Heart, Zap, Shield, Waves, Layout } from 'lucide-react';
import { motion } from 'motion/react';

const facilities = [
  {
    id: 'f1',
    name: 'Strength Axis',
    description: 'Precision-engineered machines for maximum mechanical tension and growth.',
    icon: Dumbbell,
    span: 'md:col-span-2'
  },
  {
    id: 'f2',
    name: 'Cardio Lab',
    description: 'Elite biometric tracking on industry-leading endurance systems.',
    icon: Heart,
    span: 'md:col-span-1'
  },
  {
    id: 'f3',
    name: 'Free Range',
    description: 'Heavy-duty steel and massive floor space for unrestricted movement.',
    icon: Zap,
    span: 'md:col-span-1'
  },
  {
    id: 'f4',
    name: 'Tactical Floor',
    description: 'Spacious performance area for dynamic athletic conditioning.',
    icon: Layout,
    span: 'md:col-span-2'
  },
  {
    id: 'f5',
    name: 'Secure Vault',
    description: 'Ultra-hygienic, biometric-access storage for your personal assets.',
    icon: Shield,
    span: 'md:col-span-1'
  },
  {
    id: 'f6',
    name: 'Purity Zone',
    description: 'Hospital-grade sanitation and advanced air filtration systems.',
    icon: Waves,
    span: 'md:col-span-1'
  },
];

export default function Facilities() {
  return (
    <section id="facilities" className="py-32 bg-brand-charcoal overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="max-w-xl">
            <span className="text-brand-green text-[10px] font-semibold uppercase tracking-[0.5em] mb-6 block">
              The Facility
            </span>
            <h2 className="text-5xl md:text-7xl font-syne font-bold italic uppercase tracking-tighter leading-none mb-8">
              Elite <span className="text-brand-green">Amenities</span>
            </h2>
          </div>
          <div className="h-[1px] flex-grow bg-white/10 hidden md:block mb-6" />
          <p className="text-white/40 text-sm uppercase tracking-widest font-bold font-jakarta max-w-[200px] border-l border-brand-green pl-6 mb-6">
            Engineered for physical performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facilities.map((item, index) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group bg-brand-dark p-12 border border-white/5 hover:border-brand-green/30 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[350px] ${item.span}`}
            >
              <div className="relative z-10">
                <item.icon className="w-12 h-12 text-brand-green mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-3xl font-syne font-bold italic uppercase mb-4">{item.name}</h3>
                <p className="text-white/40 group-hover:text-white/60 transition-colors font-jakarta leading-relaxed max-w-xs">{item.description}</p>
              </div>
              
              <div className="mt-auto pt-8 flex justify-between items-center relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/10 group-hover:text-brand-green/30 transition-colors">
                  Protocol {index + 1}
                </span>
              </div>

              {/* Grid pattern background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" 
                   style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
