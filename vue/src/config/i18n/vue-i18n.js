import de from './locale-messages/de.json';
import {LANGUAGE} from '@/config/constants';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18n = new VueI18n({
    locale: LANGUAGE,
    fallbackLocale: LANGUAGE,
    messages: {de},
    silentTranslationWarn: true,
});
