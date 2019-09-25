
define([], function () {
    requirejs.config({
        enforceDefine: false,
        paths: {
            //"moment": M.cfg.wwwroot + '/local/writingcentre/js/fullcalendar-3.9.0/lib/moment.min',
            "vuetreeselect": M.cfg.wwwroot + '/course/format/ladtopics/js/vue-treeselect.min.js',
        }/*,
        shim: {
            //'moment': { exports: 'moment' },
            'vuetreeselect': { exports: 'treeselect' },
        }*/
    });
});