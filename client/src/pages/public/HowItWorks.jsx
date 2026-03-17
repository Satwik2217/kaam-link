import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4" dangerouslySetInnerHTML={{ __html: t('hiw.title').replace('KaamLink', 'Kaam<span class="text-primary">Link</span>') }}>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('hiw.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-4">{t('hiw.empTitle')}</h2>
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li><span className="font-semibold">{t('hiw.emp1Label')}</span> {t('hiw.emp1Desc')}</li>
            <li><span className="font-semibold">{t('hiw.emp2Label')}</span> {t('hiw.emp2Desc')}</li>
            <li><span className="font-semibold">{t('hiw.emp3Label')}</span> {t('hiw.emp3Desc')}</li>
            <li><span className="font-semibold">{t('hiw.emp4Label')}</span> {t('hiw.emp4Desc')}</li>
            <li><span className="font-semibold">{t('hiw.emp5Label')}</span> {t('hiw.emp5Desc')}</li>
          </ol>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-4">{t('hiw.workTitle')}</h2>
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li><span className="font-semibold">{t('hiw.work1Label')}</span> {t('hiw.work1Desc')}</li>
            <li><span className="font-semibold">{t('hiw.work2Label')}</span> {t('hiw.work2Desc')}</li>
            <li><span className="font-semibold">{t('hiw.work3Label')}</span> {t('hiw.work3Desc')}</li>
            <li><span className="font-semibold">{t('hiw.work4Label')}</span> {t('hiw.work4Desc')}</li>
            <li><span className="font-semibold">{t('hiw.work5Label')}</span> {t('hiw.work5Desc')}</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
