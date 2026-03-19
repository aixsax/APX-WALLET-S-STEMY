import { Button } from '@/components/ui/button';
import { ArrowRight, Gift } from 'lucide-react';

interface CTAProps {
  navigate: (page: string) => void;
}

export default function CTA({ navigate }: CTAProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Sınırlı süreli fırsat</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hemen Kayıt Ol, ₺10 Bonus Kazan!
            </h2>
            
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              İlk kayıt olan herkese ₺10 hoşgeldin bonusu. 
              Üstelik arkadaşlarını davet ederek daha fazla kazanabilirsin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('register')}
                className="bg-white text-violet-600 hover:bg-gray-100 font-semibold px-8"
              >
                Ücretsiz Kayıt Ol
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
