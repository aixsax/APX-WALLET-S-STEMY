import { useCMS } from '@/context/CMSContext';
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';

export default function ContactSection() {
  const { contactInfo } = useCMS();

  if (!contactInfo) return null;

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Mail className="w-4 h-4" />
              İletişim
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Sorularınız, önerileriniz veya destek talepleriniz için bize ulaşabilirsiniz. 
              En kısa sürede size dönüş yapacağız.
            </p>

            {/* Quick Contact Info */}
            <div className="space-y-4">
              {contactInfo.email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-gray-900 font-medium hover:text-blue-600">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <a href={`tel:${contactInfo.phone}`} className="text-gray-900 font-medium hover:text-green-600">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.address && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adres</p>
                    <p className="text-gray-900 font-medium">{contactInfo.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4">Bizi Takip Edin</p>
              <div className="flex gap-3">
                {contactInfo.instagram && (
                  <a 
                    href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {contactInfo.facebook && (
                  <a 
                    href={`https://facebook.com/${contactInfo.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {contactInfo.twitter && (
                  <a 
                    href={`https://twitter.com/${contactInfo.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {contactInfo.telegram && (
                  <a 
                    href={`https://t.me/${contactInfo.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - CTA Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Destek Alın
              </h3>
              <p className="text-gray-600">
                7/24 destek ekibimiz size yardımcı olmaya hazır.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.whatsapp && (
                <a 
                  href={`https://wa.me/${contactInfo.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp'tan Yazın
                </a>
              )}

              <a 
                href="#/contact"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                İletişim Formu
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {contactInfo.workingHours}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
