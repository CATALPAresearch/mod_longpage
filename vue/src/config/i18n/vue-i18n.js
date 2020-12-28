import de from './locale-messages/de.json';
import {LANGUAGE} from '@/config/constants';
import {createI18n} from 'vue-i18n';

export const i18n = createI18n({
    locale: LANGUAGE,
    fallbackLocale: LANGUAGE,
    messages: {de},
    silentTranslationWarn: true,
});
