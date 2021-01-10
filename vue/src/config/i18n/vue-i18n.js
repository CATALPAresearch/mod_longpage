import de from './locale-messages/de.json';
import {LANGUAGE} from '@/config/constants';
import {createI18n} from 'vue-i18n';
import datetimeFormats from './date-time-formats.json';

export const i18n = createI18n({
    datetimeFormats,
    locale: LANGUAGE,
    fallbackLocale: LANGUAGE,
    messages: {de},
    silentTranslationWarn: true,
});
