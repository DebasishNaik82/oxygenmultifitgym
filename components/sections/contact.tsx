'use client';

import { Phone, Mail, Instagram, Facebook, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import InquiryForm from '../inquiry-form';

export default function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24 md:py-32 bg-brand-charcoal overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-8 sm:space-y-12 md:space-y-16"
          >
            <div>
              <span className="text-brand-green text-[10px] font-semibold uppercase tracking-[0.4em] sm:tracking-[0.5em] mb-4 sm:mb-6 block">
                Contact
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-syne font-bold italic uppercase tracking-tighter leading-tight sm:leading-none mb-4 sm:mb-8">
                Get In <span className="text-brand-green">Touch</span>.
              </h2>
              <p className="text-white/40 text-sm sm:text-base md:text-lg font-jakarta leading-relaxed max-w-md border-l-2 border-brand-green pl-4 sm:pl-6">
                Have questions? Send us a message and we&apos;ll get back to you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-10 md:gap-12 pt-6 sm:pt-8 border-t border-white/5">
              <div className="space-y-2 sm:space-y-4">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Official Line</span>
                <div className="flex items-center gap-3 sm:gap-4 group">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 flex items-center justify-center group-hover:bg-brand-green transition-colors duration-500">
                    <Phone className="w-4 h-4 text-white group-hover:text-brand-charcoal transition-colors duration-500" />
                  </div>
                  <span className="text-base sm:text-lg md:text-xl font-syne font-bold italic">+91 83277 99535</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-4">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Digital Inbox</span>
                <div className="flex items-center gap-3 sm:gap-4 group">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 flex items-center justify-center group-hover:bg-brand-green transition-colors duration-500">
                    <Mail className="w-4 h-4 text-white group-hover:text-brand-charcoal transition-colors duration-500" />
                  </div>
                  <span className="text-base sm:text-lg md:text-xl font-syne font-bold italic">join@oxygenmultifit.com</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-4">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Active Hours</span>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col font-syne font-bold italic uppercase text-xs sm:text-sm tracking-widest pt-1">
                    <span className="text-white">Mon-Sat: 05:00 - 22:00</span>
                    <span className="text-white/40">Sun: Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-brand-dark p-12 md:p-20 border border-white/5 relative"
            id="inquiry"
          >
            <div className="mb-12">
              <h3 className="text-3xl font-syne font-bold italic uppercase mb-2">Secure Your <span className="text-brand-green">Access</span></h3>
              <p className="text-white/20 text-[10px] font-semibold uppercase tracking-[0.3em]">Direct Inquiry Portal</p>
            </div>
            <InquiryForm />
            
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-brand-green/20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
