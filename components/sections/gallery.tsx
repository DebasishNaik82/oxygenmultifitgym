'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

const gymPhotos = [
  { id: 1, src: '/background.jpg', title: 'Training Zone', span: 'lg:col-span-2 lg:row-span-2' },
  { id: 2, src: '/background.jpg', title: 'Cardio Area', span: 'lg:col-span-1 lg:row-span-1' },
  { id: 3, src: '/background.jpg', title: 'Strength Area', span: 'lg:col-span-1 lg:row-span-1' },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-32 bg-brand-charcoal overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="max-w-xl">
            <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">
              Visuals
            </span>
            <h2 className="text-5xl md:text-7xl font-syne font-black italic uppercase tracking-tighter leading-none mb-8">
              The <span className="text-brand-green">Experience</span>
            </h2>
          </div>
          <p className="text-white/40 text-sm uppercase tracking-widest font-bold font-jakarta max-w-[200px] border-l border-brand-green pl-6 mb-6">
            A virtual tour of Bhawanipatna&apos;s elite facility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-2 gap-6 h-auto lg:h-[800px]">
          {gymPhotos.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`group relative bg-brand-dark border border-white/5 overflow-hidden ${img.span}`}
            >
              <Image 
                src={img.src} 
                alt={img.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-charcoal/40 group-hover:bg-brand-charcoal/0 transition-all duration-700" />
              
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-xs font-black italic">O2</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-brand-charcoal to-transparent opacity-0 group-hover:opacity-100">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mb-2 block">
                  Archive {img.id}
                </span>
                <h4 className="text-xl font-syne font-black italic uppercase tracking-widest">{img.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
