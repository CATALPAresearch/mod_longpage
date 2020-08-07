/**
 * See also https://github.com/zack24q/vue-navigation/
 *
 * @module     mod/longpage
 * @package    mod_longpage
 * @class      longpage
 * @copyright  2020 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 */
define([
    'jquery',
    'jqueryui',
    M.cfg.wwwroot + '/mod/page/amd/src/Longtext.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Utils.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Logging.js'
],
    function ($, ui, Longtext, Utils, Log) {
        
        $('.longpage-footnote button').popover({
            html: true,
            trigger: 'focus',
            content: function () {
                var content = $(this).attr("data-popover-content");
                return $(content).children(".popover-body").html();
            }
        });

        require.config({
            enforceDefine: false,
            baseUrl: M.cfg.wwwroot + "/mod/page/lib/",
            paths: {
                "vue259": ["https://cdn.jsdelivr.net/npm/vue@2.5.9/dist/vue", "vue"],
                "d3": ["d3.v4.min"]
            },
            shim: {
                'vue259': {
                    exports: 'Vue'
                }
            }
        });


        var start = function (courseid, pagename) {
            require([
                'vue259',
                'd3'
            ], function (vue, d3) {
                var utils = new Utils(d3);
                var log = new Log(utils, courseid, {
                    context: 'mod_page',
                    outputType: 1
                });
                new Longtext(vue, d3, utils, log, pagename);
            });
        };

        return {
            init: function (courseid, pagename) {
                try {
                    start(courseid, pagename);
                } catch (e) {
                    console.error(e);
                }

            }
        };
    });