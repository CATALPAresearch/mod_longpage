
define([
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/page/lib/build/vuex.min.js'
], function (Vue, Vuex) {

    function Store() {

        Vue.use(Vuex)

        this.store = new Vuex.Store({
            state: {
                bookmarks: [],
                bam: 44
            },
            getters: {
                getBookmarks: (state, getters) => {
                    return state.bookmarks;
                },
                
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