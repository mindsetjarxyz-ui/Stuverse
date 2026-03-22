import { useAppStore } from '../store/useAppStore';
import { translations } from '../utils/translations';

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { t, language };
};
