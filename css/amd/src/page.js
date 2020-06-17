/**
 * See also https://github.com/zack24q/vue-navigation/
 *
 * @module     mod/longpage
 * @package    mod_longpage
 * @class      LADTopics
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */
define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/amd/src/Longtext.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Utils.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Logging.js'
],
    function ($, Longtext, Utils, Log) { console.log(2)
        // enable footnotes
        //$("[data-toggle=popover]").popover({
        $('.longpage-footnote button').popover({
            html: true,
            trigger: 'focus',
            content: function () {
                console.log($(this).attr('id'))
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


        var start = function (courseid) {
            console.log(44)
            // Add style sheets
            var css = [
                //"/moodle/mod/page/css/bootstrap3.min.css", // moodle runs with bootstrap 2.3
                //M.cfg.wwwroot + "/mod/page/css/page.css",
                //M.cfg.wwwroot + "/mod/page/css/dc.css",
                // M.cfg.wwwroot + "/mod/page/css/vue-treeselect.min.css"
            ];
            var link = '';
            for (var i = 0; i < css.length; i++) {
                link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = css[i];
                document.getElementsByTagName("head")[0].appendChild(link);
            }

            require([
                'vue259',
                'd3'
            ], function(vue, d3) {
                var utils = new Utils(d3);
                var log = new Log(utils, courseid, {
                    context: 'mod_page',
                    outputType: 1
                });
                new Longtext(vue, d3, utils, log);
            });
        };

        return {
            init: function (courseid) {
                console.log(33)
                try {
                    start(courseid);
                } catch (e) {
                    console.error(e);
                }

            }
        };
    }); 