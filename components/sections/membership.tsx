'use client';

import { Check, Info, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

const plans = [
  {
    name: 'Foundation',
    duration: '1 Month Access',
    price: '₹1,499',
    originalPrice: '₹1,999',
    period: '/ month',
    badge: 'Flexible',
    description: 'Ideal for beginners kickstarting their fitness journey with no long-term lock-in.',
    features: [
      'Full gym floor & heavy iron zone access',
      'Advanced cardio theater systems',
      'Locker room & changing facilities',
      'Free general trainer floor guidance',
      'Initial fitness baseline assessment',
    ],
    highlight: false,
    ctaText: 'Select Monthly Plan',
  },
  {
    name: 'Performance',
    duration: '12 Months Access',
    price: '₹11,999',
    originalPrice: '₹18,000',
    period: '/ year (₹999/mo)',
    badge: 'MOST POPULAR • SAVE 35%',
    description: 'Our flagship transformation package for serious fitness and athletic progression.',
    features: [
      'Everything in Foundation included',
      'Personalized workout & nutritional blueprint',
      'Monthly InBody biometric & BMI analysis',
      'Steam bath & recovery amenities',
      '2 Complimentary 1-on-1 Personal Training sessions',
      'Priority access to special gym workshops',
      'Guest passes (2 per quarter)',
    ],
    highlight: true,
    ctaText: 'Join Annual Membership',
  },
  {
    name: 'Tactical',
    duration: '3 Months Cycle',
    price: '₹3,999',
    originalPrice: '₹4,999',
    period: '/ quarter (₹1,333/mo)',
    badge: 'Transformation',
    description: 'The focused 90-day transformation block to build sustainable strength and muscle.',
    features: [
      'Everything in Foundation included',
      'Body composition goal roadmap',
      'Strength & conditioning protocol',
      'Custom macro & diet suggestion sheet',
      'Weekly progress check-ins',
    ],
    highlight: false,
    ctaText: 'Select 90-Day Plan',
  },
];

export default function Membership() {
  return (
    <section id="membership" className="py-14 sm:py-20 md:py-24 bg-brand-dark overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6 sm:gap-8">
          <div className="max-w-2xl">
            <span className="text-brand-green text-[10px] font-semibold uppercase tracking-[0.4em] sm:tracking-[0.5em] mb-3 sm:mb-4 block">
              Pricing & Memberships
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-syne font-bold italic uppercase tracking-tighter leading-tight sm:leading-none mb-3 sm:mb-4">
              Invest In Your <span className="text-brand-green">Strength</span>
            </h2>
            <p className="text-white/60 text-xs sm:text-sm font-jakarta max-w-xl">
              Transparent, premium fitness plans with no hidden charges. All memberships include full facility access and certified trainer supervision.
            </p>
          </div>
          <div className="border-l border-brand-green pl-4 sm:pl-6 py-1 sm:py-2">
            <p className="text-brand-green font-bold text-base sm:text-lg font-syne uppercase tracking-wider">Demo Rates</p>
            <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest font-semibold font-jakarta">
              Limited Period Offer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 sm:p-7 md:p-10 flex flex-col h-full bg-brand-charcoal transition-all duration-300 relative border ${
                plan.highlight 
                  ? 'border-brand-green shadow-xl shadow-brand-green/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-1 ${
                  plan.highlight 
                    ? 'bg-brand-green text-brand-charcoal font-black' 
                    : 'bg-white/10 text-white/70'
                }`}>
                  {plan.badge}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/40 font-jakarta">
                  {plan.duration}
                </span>
              </div>
              
              {/* Title & Price */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-syne font-bold italic uppercase mb-2 sm:mb-3 flex items-center gap-2">
                  {plan.name}
                  {plan.highlight && <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green fill-brand-green" />}
                </h3>
                <p className="text-white/50 text-xs font-jakarta leading-relaxed mb-4 sm:mb-6">
                  {plan.description}
                </p>
                
                <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black font-syne tracking-tight text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/40 line-through text-xs sm:text-sm font-semibold">
                    {plan.originalPrice}
                  </span>
                  <span className="text-white/50 text-[11px] sm:text-xs font-semibold">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8 pt-6 border-t border-white/5 flex-grow">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-green mb-3">
                  What&apos;s Included:
                </p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-brand-green stroke-[3]" />
                    </div>
                    <span className="text-xs font-jakarta text-white/70 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-white/5">
                <Link
                  href="/contact#inquiry"
                  className={`block w-full py-4 text-center text-xs font-black uppercase tracking-widest transition-all ${
                    plan.highlight 
                      ? 'bg-brand-green text-brand-charcoal hover:bg-white hover:text-brand-charcoal' 
                      : 'bg-white/5 text-white border border-white/10 hover:bg-brand-green hover:text-brand-charcoal hover:border-brand-green'
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trial Session Footnote */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-6 bg-brand-charcoal border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 bg-brand-green/10 flex items-center justify-center shrink-0 text-brand-green font-black">
              1D
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase italic text-white">Want to try before you commit?</h4>
              <p className="text-white/50 text-xs font-jakarta">
                Single-day visitor pass available at <span className="text-brand-green font-bold">₹199</span> (Refundable / adjustable against any monthly or annual membership).
              </p>
            </div>
          </div>
          <Link
            href="/contact#inquiry"
            className="px-6 py-3 border border-brand-green text-brand-green text-xs font-black uppercase tracking-widest hover:bg-brand-green hover:text-brand-charcoal transition-all whitespace-nowrap"
          >
            Claim 1-Day Trial
          </Link>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-white/30 text-[11px] font-semibold uppercase tracking-widest">
          <Info className="w-3.5 h-3.5 text-brand-green" />
          <span>Demo pricing displayed for evaluation. Taxes and registration terms apply at reception.</span>
        </div>
      </div>
    </section>
  );
}
