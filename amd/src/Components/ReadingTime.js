/**
 * TODO
 * - counting images does not work
 * - testing is necessary. I am not sure whether all nestes DOM-Elements are considered using .text()
 * - the estimation by certain types of headings should be abstracted
 * - language support
 */

define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min'
], function ($, Vue) {

    Vue.component('ReadingTime',
        {
            props: [],

            data: function () {
                return {
                    parantSelector: '.longpage-container',
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
                }
            },

            mounted: function () {
                this.calcH3();
                this.calcH2();

            },

            methods: {
                calcH2: function () {
                    let output = $('<span></span>')
                        .addClass('longpage-reading-time-estimation mx-0 my-1 p-0')
                        .text('Geschätzte Lesezeit ' + this.fastSum + ' - ' + this.slowSum + ' Minuten');
                    $(this.parantSelector + ' h2').after(output);

                    return;
                    let numerOfHeadings = $(this.parantSelector + ' h2').length;
                    // add a dummy heading at the end.
                    $(this.parantSelector).append('<h2 style="display:inline;" class="dummy-heading">dummy</h2>');
                    // iterate over all headings and determine the text length and number of images
                    for (var i = 0; i < numerOfHeadings; i++) {
                        let numberOfImages = 0;
                        var fromm = $('h2:nth(' + i + ')');
                        var to = $('h2:nth(' + (i + 1) + ')');
                        var a = $(fromm).nextUntil(to);
                        a.addClass('tmp-marked');
                        // concat text from DOM
                        var out = '';
                        $('.tmp-marked').each(function (d) {
                            out = out + $(this).text();
                            if ($(this).prop("tagName") === 'IMG') {
                                numberOfImages++;
                            }
                            $(this).removeClass('tmp-marked')
                        });
                        let output = $('<span></span>')
                            .addClass('longpage-reading-time-estimation mx-0 my-1 p-0')
                            .text(this.estimateTime(out, numberOfImages));
                        fromm.after(output);
                        console.log('h2', numerOfHeadings, out.length, numberOfImages)
                        $('.dummy-heading').remove();
                    }
                },

                calcH3: function () {
                    let numerOfHeadings = $(this.parantSelector + ' h3').length;
                    // add a dummy heading at the end.
                    $(this.parantSelector).append('<h3 style="display:inline;" class="dummy-heading-3">dummy</h3>');
                    // iterate over all headings and determine the text length and number of images
                    for (var i = 0; i < numerOfHeadings; i++) {
                        let numberOfImages = 0;
                        var fromm = $('h3:nth(' + i + ')');
                        var to = $('h3:nth(' + (i + 1) + ')');
                        var a = $(fromm).nextUntil(to);
                        a.addClass('tmp-marked-h3');
                        // concat text from DOM
                        var out = '';
                        $('.tmp-marked-h3').each(function (d) {
                            out = out + $(this).text();
                            if ($(this).prop("tagName") === 'IMG') {
                                numberOfImages++;
                            }
                            $(this).removeClass('tmp-marked-h3')
                        });
                        let output = $('<div></div>')
                            .addClass('longpage-reading-time-estimation mx-0 my-3 p-0')
                            .text(this.estimateTime(out, numberOfImages));
                        fromm.after(output);
                        //console.log('h3', numerOfHeadings, out.length, numberOfImages)
                        $('.dummy-heading-3').remove();
                    }
                },

                estimateTime: function (text, numImg) {
                    let textlength = text.match(/([\s]+)/g).length;
                    numImg = parseInt(numImg, 10) === 0 || typeof (numImg) !== 'number' ? 1 : numImg;
                    let readingSpeed = this.readingSpeedPerLanguage[this.language];
                    let readingTimeSlow = Math.ceil(textlength / (readingSpeed.cpm - readingSpeed.variance) + numImg * 0.3);
                    let readingTimeFast = Math.ceil(textlength / (readingSpeed.cpm + readingSpeed.variance) + numImg * 0.3);
                    this.slowSum += readingTimeSlow;
                    this.fastSum += readingTimeFast;
                    return 'Geschätzte Lesezeit ' + readingTimeFast + '-' + readingTimeSlow + ' Minuten';
                }
            },
            template: `<div></div>`
        });
});