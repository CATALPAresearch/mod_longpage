/**
 * See also https://github.com/zack24q/vue-navigation/
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      LADTopics
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
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
    function ($, jqueryui, Longtext, Utils, Log) {


        require.config({
            enforceDefine: false,
            baseUrl: M.cfg.wwwroot + "/mod/page/lib/",
            paths: {
                "vue259": ["https://cdn.jsdelivr.net/npm/vue@2.5.9/dist/vue", "vue"],
                //"mathjax": ["http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured"],//["https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js", "tex-mml-chtml"],
                //"MathJax": ["https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.0.0/MathJax.js?config=default"],
                "d3": ["d3.v4.min"]
            },
            shim: {
                'vue259': {
                    exports: 'Vue'
                }/*,
                MathJax: {
                    exports: "MathJax",
                    init: function () {
                        MathJax.Hub.Config({});
                        MathJax.Hub.Startup.onload();
                        return MathJax;
                    }
                }*/
            }
        });


        function start(courseid) {
            
            // add style sheets        
            const css = [
                //"/moodle/mod/page/css/bootstrap3.min.css", // moodle runs with bootstrap 2.3
                //M.cfg.wwwroot + "/mod/page/css/page.css",
                //M.cfg.wwwroot + "/mod/page/css/dc.css",
                // M.cfg.wwwroot + "/mod/page/css/vue-treeselect.min.css"
            ];
            let link = '';
            for (let i = 0; i < css.length; i++) {
                link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = css[i];
                document.getElementsByTagName("head")[0].appendChild(link);
            }

            require([
                'vue259',
                'd3'
            ], function (vue, d3) {
                    const utils = new Utils(d3); 
                const log = new Log(utils, courseid, {
                    context: 'mod_page',
                    outputType: 1
                });
                new Longtext(vue, d3, utils, log);
            });
        }

        return {
            init: function (courseid) {
                try {
                    start(courseid);
                } catch (e) {
                    console.error(e);
                }

            }
        };
    }); 