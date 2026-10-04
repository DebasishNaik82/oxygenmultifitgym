import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import MapSection from './map-section';

export default function Location() {
  const googleMapsUrl = 'https://maps.app.goo.gl/Lbenp19DhsE9w94t9?g_st=ac';

  return (
    <section id="location" className="py-24 bg-brand-charcoal text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-brand-green text-xs font-black uppercase tracking-[0.3em]">Our Location</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Visit Our <span className="text-brand-green">Facility</span></h2>
            </div>

            <div className="p-8 bg-brand-dark border border-white/5 space-y-6">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-brand-green shrink-0" />
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Verified Address</h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Dandapani Complex, Balaji Mandir Road, <br />
                    Naktiguda, Bhawanipatna, Odisha 766001, India
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-brand-green text-brand-charcoal font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all"
                >
                  <Navigation className="w-3 h-3" />
                  Get Directions
                </a>
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-brand-charcoal transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="aspect-square lg:aspect-[16/10] bg-brand-dark border border-white/5 relative overflow-hidden group">
            <MapSection />
          </div>
        </div>
      </div>
    </section>
  );
}
