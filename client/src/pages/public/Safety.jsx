import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const Safety = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8" dangerouslySetInnerHTML={{ __html: t('safety.title').replace('KaamLink', 'Kaam<span class="text-primary">Link</span>') }}>
      </h1>
      
      <div className="space-y-8 text-gray-700">
        <section className="card p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900">{t('safety.verifiedTitle')}</h2>
          <p>
            {t('safety.verifiedDesc')}
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900">{t('safety.secureTitle')}</h2>
          <p>
            {t('safety.secureDesc')}
          </p>
        </section>

        <section className="card p-6 border-l-4 border-destructive">
          <h2 className="text-xl font-bold mb-3 text-destructive">{t('safety.sosTitle')}</h2>
          <p className="mb-4">
            {t('safety.sosDesc1')}
          </p>
          <p>
            {t('safety.sosDesc2')}
          </p>
        </section>
        
        <section className="card p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900">{t('safety.reviewsTitle')}</h2>
          <p>
            {t('safety.reviewsDesc')}
          </p>
        </section>
      </div>
    </div>
  );
};

export default Safety;
