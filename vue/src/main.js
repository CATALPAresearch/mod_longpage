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
import $ from 'jquery';
import App from './App';
import Log from './lib/Logging';
import Utils from './util/utils';

$(function() {
    $('.longpage-footnote button').popover({
        html: true,
        trigger: 'focus',
        content: function() {
            var content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
        }
    });
});

export const init = (courseid, pageid, pagename, userId) => {
    // We need to overwrite the variable for lazy loading.
    __webpack_public_path__ = M.cfg.wwwroot + '/mod/page/amd/build/';
    try {
        var utils = new Utils();
        var log = new Log(utils, courseid, {
            context: 'mod_page',
            outputType: 1
        });
        new App(utils, log, {courseid, pageid, pagename, userId});
    } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
    }
};
