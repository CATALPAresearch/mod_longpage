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
    M.cfg.wwwroot + "/mod/page/lib/build/vue.min",
    M.cfg.wwwroot + "/mod/page/amd/src/Stores/PageStore",
    'theme_boost/popover',
    M.cfg.wwwroot + '/mod/page/amd/src/Longtext.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Utils.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Logging.js'
],
    function ($, Vue, Store, Popover, Longtext, Utils, Log) {


        $(function () {
            $('.longpage-footnote button').popover({
                html: true,
                trigger: 'focus',
                content: function () {
                    var content = $(this).attr("data-popover-content");
                    return $(content).children(".popover-body").html();
                }
            });
        });

        return {
            init: function (courseid, pagename) {

                try {
                    var utils = new Utils();
                    var log = new Log(utils, courseid, {
                        context: 'mod_page',
                        outputType: 1
                    });
                    new Longtext(Vue, Store, utils, log, pagename);
                } catch (e) {
                    console.error(e);
                }


            }

        };

    });