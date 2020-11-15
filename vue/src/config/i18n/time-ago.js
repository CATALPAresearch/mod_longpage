// TODO: Enable the use of other locales besides 'de'
import de from 'javascript-time-ago/locale/de';
import {LANGUAGE} from '@/config/constants';
import TimeAgo from 'javascript-time-ago';

TimeAgo.addDefaultLocale(de);

export const DateTimeFormatter = new TimeAgo(LANGUAGE);
