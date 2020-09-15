
define([
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min',
    M.cfg.wwwroot + '/mod/page/lib/build/vuex.min'
], function (Vue, Vuex) {

    function Store() {

        Vue.use(Vuex)
        
        this.store = new Vuex.Store({
            state: {
                bookmarks: [],
                bam: 44
            },
            mutations: {
                addBookmarks(state, bookmark) {
                    state.bookmarks.push(bookmark);
                }
            }
        });

    }

    return Store;


});