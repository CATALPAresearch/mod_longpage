/**
 * See also: https://moodle.org/plugins/block_annotate
 */

define([
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min'
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
                debug: true
            }
        },

        computed: {
            highlightableEl() {
                return this.$slots.default[0].elm;
            }
        },

        mounted() {
            console.log('storeBookmarks', this.$store.state.bam);
            this.container = document.querySelector(".longpage-container");
            this.container.addEventListener('mouseup', this.onMouseup)
        },

        beforeDestroy() {
            var box = document.querySelector(".longpage-container");
            this.container.removeEventListener('mouseup', this.onMouseup)
        },

        methods: {
            onMouseup(e) {
                const selection = window.getSelection()
                const startNode = selection.getRangeAt(0).startContainer.parentNode
                const endNode = selection.getRangeAt(0).endContainer.parentNode
                if (!startNode.isSameNode(endNode)) {
                    this.showTools = false
                    return
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
                    console.log('scrollY',window.scrollY)
                    console.log('sel', r.y, r.top)
                    console.log('rel', relative.y, relative.top)
                    console.log('top offset:', off)
                    console.log('pageY:', e.pageY, e.clientY)
                    console.log('current result', this.y)
                }
                this.showTools = true
                this.selectedText = selection.toString()
            },

            handleAction(action) {
                console.log(this.selectedText);
                //this.$emit(action, this.selectedText)
            },

            handleBookmark(){
                console.log(this.selectedText);
            }
        },

        template: `
            <div>
                <div v-show="showTools" class="tools" :style="{'left': x+'px', 'top': y+'px', 'z-index':4500}" @mousedown.prevent="">
                    <span class="item" @mousedown.prevent="handleBookmark()">
                        Lesezeichen
                    </span>
                    <span class="item" @mousedown.prevent="handleAction('highlight')">
                        highlight me
                    </span>
                </div>
                <slot/>
            </div>
            `
    });
});