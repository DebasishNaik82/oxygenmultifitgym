import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Gallery from '@/components/sections/gallery';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-brand-charcoal text-white">
      <Navbar />
      <div className="pt-20">
        <Gallery />
      </div>
      <Footer />
    </main>
  );
}
