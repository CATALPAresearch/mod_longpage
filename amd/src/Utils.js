/**
 * Javascript utils for the Moodle videodatabase
 *
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Utils
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 */
define(['jquery', 'core/ajax'], function ($, ajax) {

    const Utils = function (d3) {
        this.d3 = d3;

        /**
         * Obtains data from a moodle webservice
         * @param {*} ws: Name of the web service 
         * @param {*} params: Parameter to transfer 
         * @param {*} cb: Callback function 
         */
        this.get_ws = function (ws, params, cb, external) {
            external = external === undefined ? false : external;
            ajax.call([{
                methodname: external ? ws : 'format_ladtopics_' + ws,
                args: { courseid: 3 },
                done: function (msg) {
                    if (msg.hasOwnProperty('exception')) {
                        $('#alert')
                            .html('Die Prozedur ' + ws + ' konnte nicht als Webservice geladen werden.<br>')
                            .append(JSON.stringify(msg));
                    } else {
                        cb(msg);
                    }
                },
                fail: function (e) {
                    console.log(params);
                    console.error(ws, e);
                }
            }]);
        };

        this.germanFormatters = d3.timeFormatDefaultLocale({
            "decimal": ",",
            "thousands": ".",
            "grouping": [3],
            "currency": ["€", ""],
            "dateTime": "%a %b %e %X %Y",
            "date": "%d.%m.%Y",
            "time": "%H:%M:%S",
            "periods": ["AM", "PM"],
            "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            "months": ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
            "shortMonths": ["Jän", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
        });

        this.customTimeFormat = function (date) {//this.germanFormatters.timeFormat.multi([
            if (date.getMinutes()) return d3.timeFormat("%I:%M")(date);
            if (date.getMilliseconds()) return d3.timeFormat(".%L")(date);
            if (date.getSeconds()) return d3.timeFormat(":%S")(date);
            if (date.getHours()) return d3.timeFormat("%Hh")(date);
            if (date.getDay()) return d3.timeFormat("%a %e.%m.")(date); // Mo 8.02.
            if (date.getMonth()) return d3.timeFormat("%B")(date); //7.12. 
            return d3.getDate("%Y");

            /*   , function (d) { return d.; }],
                [ function (d) { return d.getDay() && d.getDate() !== 1; }], 
                ["%e.%m.", function (d) { return d.getDate() != 1; }], // 
                [, function (d) { return d.; }],
                [, function () { return true; }]
                */
        };

        this.numberToWord = function (num, postfix) {
            postfix = postfix === undefined ? '' : postfix;
            switch (num) {
                case 0: return 'kein' + postfix;
                case 1: return 'ein' + postfix;
                case 2: return 'zwei' + postfix;
                case 3: return 'drei' + postfix;
                case 4: return 'vier' + postfix;
                case 5: return 'fünf' + postfix;
                case 6: return 'sechs' + postfix;
                case 7: return 'sieben' + postfix;
                case 8: return 'acht' + postfix;
                case 9: return 'neun' + postfix;
                case 10: return 'zehn' + postfix;
                case 11: return 'elf' + postfix;
                default: return num + ' ' + postfix;
            }
        };
    };
    return Utils;
});