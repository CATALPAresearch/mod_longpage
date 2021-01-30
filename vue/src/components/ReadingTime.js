/* eslint-disable max-len, no-console, no-loop-func, no-undef, no-unused-vars, no-bitwise */
/**
 * TODO
 *
 * ---
 * - counting images does not work
 * - the estimation by certain types of headings should be abstracted
 * - language support / language detection
 */
import $ from 'jquery';
import {LONGPAGE_TEXT_CONTAINER_ID} from '@/config/constants';
import {toIdSelector} from '@/util/style';

export default {
    name: 'ReadingTime',
    props: [],

    data() {
        return {
            parentSelector: toIdSelector(LONGPAGE_TEXT_CONTAINER_ID),
            language: 'de',
            readingSpeedPerLanguage: {
                // 200 word per Minute https://de.wikipedia.org/wiki/Lesegeschwindigkeit
                // add 12 seconds for each inline image. Boom, read time.
                de: {
                    cpm: 250, variance: 50
                }
            },
            slowSum: 0,
            fastSum: 0,
        };
    },

    mounted() {
        this.calcH3();
        this.calcH2();

    },

    methods: {
        calcH2() {
            let numberOfHeadings = $(this.parentSelector + ' h2').length;
            // Add a dummy heading at the end.
            $(this.parentSelector).append('<h2 style="display:inline;" class="dummy-heading">dummy</h2>');
            // Iterate over all headings and determine the text length and number of images
            for (var i = 0; i < numberOfHeadings; i++) {
                let numberOfImages = 0;
                var from = $(this.parentSelector + ' h2:nth(' + i + ')');
                var to = $(this.parentSelector + ' h2:nth(' + (i + 1) + ')');
                var a = $(from).nextUntil(to);
                a.addClass('tmp-marked');
                // Concat text from DOM
                var out = '';
                $('.tmp-marked').each(() => {
                    out = out + ' ' + $(this).text();
                    if ($(this).prop('tagName') === 'IMG') {
                        numberOfImages++;
                    }
                    $(this).removeClass('tmp-marked');
                });
                let output = $('<span></span>')
                    .addClass('mx-0 my-1 p-0')
                    .attr('style', ' font-size: 0.8em; color: #333333;')
                    .html(this.estimateTime(out, numberOfImages));
                from.after(output);
                // Console.log('h2', numerOfHeadings, out.length, numberOfImages)
                $('.dummy-heading').remove();
            }

/*
            Let output = $('<span></span>')
                .addClass('mx-0 my-1 p-0')
                .attr('style', ' font-size: 0.8em; color: #333333;')
                .text('Geschätzte Lesezeit ' + this.convertToReadableTime(this.fastSum) + ' - ' + this.convertToReadableTime(this.slowSum) + ' Stunden');
            $(this.parentSelector + ' h2').after(output);
            */

        },

        calcH3() {
            let numberOfHeadings = $(this.parentSelector + ' h3').length;
            // Add a dummy heading at the end.
            $(this.parentSelector).append('<h3 style="display:inline;color:#fff;" class="dummy-heading-3">ENDE</h3>');
            // Iterate over all headings and determine the text length and number of images
            for (var i = 0; i < numberOfHeadings; i++) {
                let numberOfImages = 0;
                var fromm = $(this.parentSelector + ' h3:nth(' + i + ')');
                var to = $(this.parentSelector + ' h3:nth(' + (i + 1) + ')');
                var a = $(fromm).nextUntil(to);
                a.addClass('tmp-marked-h3');
                // Concat text from DOM
                var out = '';
                $('.tmp-marked-h3').each(function(d) {
                    out = out + ' ' + $(this).text();
                    if ($(this).prop('tagName') === 'IMG') {
                        numberOfImages++;
                    }
                    $(this).removeClass('tmp-marked-h3');
                });
                let output = $('<div></div>')
                    .addClass('mx-0 my-3 p-0')
                    .attr('style', ' font-size: 0.8em; color: #333333;')
                    .html(this.estimateTime(out, numberOfImages));
                fromm.after(output);
                // Console.log('h3', numerOfHeadings, out.length, numberOfImages)
                $('.dummy-heading-3').remove();
            }
        },

        estimateTime(text, numImg) {
            let textlength = text.match(/([\s]+)/g).length;
            numImg = parseInt(numImg, 10) === 0 || typeof (numImg) !== 'number' ? 1 : numImg;
            let readingSpeed = this.readingSpeedPerLanguage[this.language];
            let readingTimeSlow = Math.ceil(textlength / (readingSpeed.cpm - readingSpeed.variance) + numImg * 0.3);
            let readingTimeFast = Math.ceil(textlength / (readingSpeed.cpm + readingSpeed.variance) + numImg * 0.3);
            this.slowSum += readingTimeSlow;
            this.fastSum += readingTimeFast;
            return 'Geschätzte Lesezeit ' + this.convertToReadableTime(readingTimeFast, readingTimeSlow);// + ' (' + textlength+' Wörter)';
        },

        convertToReadableTime(fasttime, slowtime) {
            // Return time;
            let time = slowtime;
            if (slowtime < 60) {
                return fasttime + '-' + slowtime + ' Minuten';// '0:' + (time < 10 ? '0' + time : time);
            } else if (slowtime > 59 && fasttime < 3600) {
                let slowhours = Math.ceil(slowtime / 60);
                let slowminutes = slowtime % 60;
                let fasthours = Math.ceil(fasttime / 60);
                let fastminutes = fasttime % 60;

                return fasthours + ':' + (fastminutes < 10 ? '0' + fastminutes : fastminutes) + ' &ndash; ' + slowhours + ':' + (slowminutes < 10 ? '0' + slowminutes : slowminutes) + ' Stunden';
            }
            return time; // Should be a rar case, but needs to be treated in some way

        }
    },
    template: '<div></div>'
};
