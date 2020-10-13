
define([
    'core/ajax',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/page/lib/build/vuex.min.js'
], function (ajax, Vue, Vuex) {

    function Store(context) {

        Vue.use(Vuex);

        this.store = new Vuex.Store({
            state: {
                courseid: context.courseid,
                pageid: context.pageid,
                pagename: context.pagename,
                bookmarks: []
            },
            getters: {
                getBookmarks: (state, getters) => {
                    return state.bookmarks;
                },

            },
            mutations: {
                loadBookmarks(state, bookmark) {
                    state.bookmarks.push(bookmark);
                },
                addBookmarks(state, bookmark) {
                    console.log(bookmark)
                    state.bookmarks.push(bookmark);
                    ajax.call([{
                        methodname: 'mod_page_addbookmark',
                        args: { 
                            data: { 
                                title: bookmark.selection,
                                selection: bookmark.selection,
                                target: bookmark.target,
                                section: 'h3',
                                courseid: context.courseid, 
                                pageid: context.pageid,
                                creationdate: (new Date()).getTime(),
                                position: 0,
                                visible: 1
                            } 
                        },
                        done: function (res) {
                            console.log(res)
                        },
                        fail: function (e) { console.error('fail_add', e); }
                    }]);
                },
                removeBookmark(state, id) {
                    state.bookmarks = state.bookmarks.filter(function (b) {
                        return b.id === id ? false : true;
                    });
                    ajax.call([{
                        methodname: 'mod_page_removebookmark',
                        args: {
                            data: {
                                id: id
                            }
                        },
                        done: function (res) {
                            console.log(res)
                        },
                        fail: function (e) { console.error('fail_add', e); }
                    }]);
                }
            },
            actions: {
                loadBookmarks(state) {
                    ajax.call([{
                        methodname: 'mod_page_getbookmark',
                        args: { data: { courseid: context.courseid, pageid: context.pageid } },
                        done: function (bookmarks) {
                            try {
                                let json = JSON.parse(bookmarks.response);
                                for (let i in json) {
                                    state.commit('loadBookmarks', json[i]);
                                }
                            } catch (e) { console.log(e) }
                        },
                        fail: function (e) { console.error('fail', e); }
                    }]);

                },
            }
        });


    }

    return Store;
});