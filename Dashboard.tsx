import { useCMS } from '@/context/CMSContext';
import { Shield, Calendar } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { privacyPolicy } = useCMS();

  if (!privacyPolicy) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Gizlilik politikası yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">{privacyPolicy.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              Son Güncelleme: {new Date(privacyPolicy.lastUpdated).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div 
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: privacyPolicy.content }}
          />
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 text-center">
          <p className="text-gray-700 mb-4">
            Gizlilik politikamız hakkında sorularınız mı var?
          </p>
          <a 
            href="#/contact" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Bizimle İletişime Geçin
          </a>
        </div>
      </div>
    </div>
  );
}
