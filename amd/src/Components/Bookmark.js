/**
 * See also: https://moodle.org/plugins/block_annotate
 * 
 * TODO:
 * - place tool-menu
 * - delete bookmarks
 * - indicate bookmarks in the text
 * - find proper label for a bookmark in the list
 * ----
 * prepare highlighting
 */

define([
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min.js'
], function (Vue) {

    Vue.component('Bookmark', {
        props: ['hideTabContent', 'log'],

        data() {
            return {
                container: {},
                x: 0,
                y: 0,
                showTools: false,
                selectedText: '',
                startNode: 0,
                endNode: 0,
                target: '',
                debug: true
            }
        },

        computed: {
            highlightableEl() {
                return this.$slots.default[0].elm;
            }
        },

        mounted() {
            this.container = document.querySelector(".longpage-container");
            this.container.addEventListener('mouseup', this.onMouseup)
        },

        beforeDestroy() {
            this.container = document.querySelector(".longpage-container"); // Why?
            this.container.removeEventListener('mouseup', this.onMouseup)
        },

        methods: {
            onMouseup(e) {

                let selection = window.getSelection ? window.getSelection() : document.selection.createRange();
                //console.log('selection', selection)
                //console.log('range', selection.getRangeAt(0))
                const startNode = selection.getRangeAt(0).startContainer.parentNode
                const endNode = selection.getRangeAt(0).endContainer.parentNode
                if (!startNode.isSameNode(endNode)) {
                    this.showTools = false;
                    return;
                }
                const { x, y, width, height, top } = selection.getRangeAt(0).getBoundingClientRect();

                if (!width) {
                    this.showTools = false
                    return
                }
                var r = window.getSelection().getRangeAt(0).getBoundingClientRect();
                var relative = document.body.parentNode.getBoundingClientRect();

                this.x = x + (width / 2);
                let off = this.container.getBoundingClientRect().top;
                //this.y = e.clientY - off + 20;//-1*relative.y - top + 10;//y+r.bottom;//y + window.scrollY - 10
                this.y = r.y - off + 70;
                if (this.debug) {
                    console.log('scrollY', window.scrollY)
                    console.log('sel', r.y, r.top)
                    console.log('rel', relative.y, relative.top)
                    console.log('top offset:', off)
                    console.log('pageY:', e.pageY, e.clientY)
                    console.log('current result', this.y)
                }
                this.showTools = true
                this.selectedText = selection.toString();
                this.selectionStart = selection.getRangeAt(0).startContainer;
                this.selectionEnd = endNode;
                this.target = this.createUniqid();
                console.log(this.selectionStart)
            },

            insertLabel: function (pos, label) {
                let t = '<span id="' + label + '" />';
                let content = 'sss';
                let query = 's';
                content.replace(new RegExp(query, "gi"), match => {
                    return '<span class="highlightText">' + match + '</span>';
                });
                //d1.insertAdjacentHTML('afterend', '<div id="two">two</div>');
            },

            prependBookmarkLabel: function () {
                let label = document.createElement("SPAN");
                //label.innerHTML = "LABEL";
                let att = document.createAttribute('id');
                att.value = this.target;
                label.setAttributeNode(att);
                this.selectionStart.parentElement.insertBefore(label, this.selectionStart.parentElement.children[0])
            },

            createUniqid: function () {
                var date = new Date().getTime();
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (date + Math.random() * 16) % 16 | 0;
                    date = Math.floor(date / 16);
                    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
            },

            handleAction: function(action) {
                console.log(this.selectedText);
                //this.$emit(action, this.selectedText)
            },

            handleBookmark: function() {
                console.log('added: ', this.selectedText);
                this.prependBookmarkLabel();
                let id = 'lp-' + Math.ceil(Math.random() * 200000);
                this.$store.commit('addBookmarks', {
                    id: id,
                    selection: this.selectedText + '(' + this.getPreviousHeading(id) +')',
                    target: this.target,
                    start: this.startNode,
                    end: this.endNode,
                    created: (new Date()).getTime(),
                    user: 'me'
                })
            },

            getPreviousHeading: function(selector) {
                return $(selector).prev('H4').text();

            }
        },

        template: `
            <div>
                <div v-show="showTools" class="tools" :style="{'left': x+'px', 'top': y+'px', 'z-index':4500}" @mousedown.prevent="">
                    <span class="item" @mousedown.prevent="handleBookmark()">
                        <i class="fa fa-bookmark mr-2"></i>Lesezeichen
                    </span>
                    <span hidden class="item" @mousedown.prevent="handleAction('highlight')">
                        highlight me
                    </span>
                </div>
                <slot/>
            </div>
            `
    });
});