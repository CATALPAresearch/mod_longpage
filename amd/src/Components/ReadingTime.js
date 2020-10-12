/**
 * TODO
 *
 * ---
 * - counting images does not work
 * - the estimation by certain types of headings should be abstracted
 * - language support / language detection
 */

define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min.js'
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
                            out = out + ' ' + $(this).text();
                            if ($(this).prop("tagName") === 'IMG') {
                                numberOfImages++;
                            }
                            $(this).removeClass('tmp-marked')
                        });
                        let output = $('<span></span>')
                            .addClass('mx-0 my-1 p-0')
                            .attr('style', ' font-size: 0.8em; color: #333333;')
                            .html(this.estimateTime(out, numberOfImages));
                        fromm.after(output);
                        console.log('h2', numerOfHeadings, out.length, numberOfImages)
                        $('.dummy-heading').remove();
                    }

/*
                    let output = $('<span></span>')
                        .addClass('mx-0 my-1 p-0')
                        .attr('style', ' font-size: 0.8em; color: #333333;')
                        .text('Geschätzte Lesezeit ' + this.convertToReadableTime(this.fastSum) + ' - ' + this.convertToReadableTime(this.slowSum) + ' Stunden');
                    $(this.parantSelector + ' h2').after(output);
                    */

                },

                calcH3: function () {
                    let numerOfHeadings = $(this.parantSelector + ' h3').length;
                    // add a dummy heading at the end.
                    $(this.parantSelector).append('<h3 style="display:inline;color:#fff;" class="dummy-heading-3">ENDE</h3>');
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
                            out = out + ' ' + $(this).text();
                            if ($(this).prop("tagName") === 'IMG') {
                                numberOfImages++;
                            }
                            $(this).removeClass('tmp-marked-h3')
                        });
                        let output = $('<div></div>')
                            .addClass('mx-0 my-3 p-0')
                            .attr('style', ' font-size: 0.8em; color: #333333;')
                            .html(this.estimateTime(out, numberOfImages));
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
                    return 'Geschätzte Lesezeit ' + this.convertToReadableTime(readingTimeFast, readingTimeSlow);// + ' (' + textlength+' Wörter)';
                },

                convertToReadableTime: function (fasttime, slowtime) { 
                    //return time;
                    let time = slowtime;
                    if (slowtime < 60) {
                        return fasttime+'-'+slowtime+' Minuten';// '0:' + (time < 10 ? '0' + time : time);
                    } else if (slowtime > 59 && fasttime < 3600) {
                        let slowhours = Math.ceil(slowtime / 60);
                        let slowminutes = slowtime % 60;
                        let fasthours = Math.ceil(fasttime / 60);
                        let fastminutes = fasttime % 60;

                        return fasthours + ':' + (fastminutes < 10 ? '0' + fastminutes : fastminutes) +' &ndash; '+ slowhours + ':' + (slowminutes < 10 ? '0' + slowminutes : slowminutes) +' Stunden';
                    }
                    return time; // should be a rar case, but needs to be treated in some way
                    
                }
            },
            template: `<div></div>`
        });
});