import { useCMS } from '@/context/CMSContext';
import { FileText, Calendar } from 'lucide-react';

export default function TermsPage() {
  const { termsOfService } = useCMS();

  if (!termsOfService) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Kullanım koşulları yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">{termsOfService.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-emerald-100">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              Son Güncelleme: {new Date(termsOfService.lastUpdated).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div 
            className="prose prose-emerald max-w-none"
            dangerouslySetInnerHTML={{ __html: termsOfService.content }}
          />
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-emerald-50 rounded-2xl p-6 text-center">
          <p className="text-gray-700 mb-4">
            Kullanım koşullarımız hakkında sorularınız mı var?
          </p>
          <a 
            href="#/contact" 
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Bizimle İletişime Geçin
          </a>
        </div>
      </div>
    </div>
  );
}
