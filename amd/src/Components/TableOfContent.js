/**
 * TODO:
 * - click auf Items ohne Subitems
 * - liste verbessern 
 * ---
 * - remove jquery
 * - put toc into the store
 */

define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min.js'
], function ($, Vue) {

    Vue.component('TableOfContent',
        {
            props: ['hideTabContent', 'log'],

            data: function () {
                return {
                    h3: [],
                    h4: [],
                }
            },

            mounted: function () {
                this.generateTableOfContent();
            },

            methods: {

                generateTableOfContent: function () {
                    let _this = this;
                    // Generates a table of content from a HTML DOM
                    var indexH3 = 0;
                    var indexH4 = 0;
                    $(".longpage-container h3, .longpage-container h4").each(function () {
                        if ($(this).is("h3")) { // .tagName === 'H3'
                            _this.h3.push({ id: "xh3item-" + indexH3, parent: null, text: $(this).text() });
                            $(this).attr('id', "xh3item-" + indexH3);
                            indexH3++;
                        } else if ($(this).is("h4")) {
                            _this.h4.push({ id: "h4item-" + indexH4, parent: "xh3item-" + (indexH3-1), text: $(this).text() });
                            $(this).attr('id', "h4item-" + indexH4);
                            indexH4++;
                        }
                    });
                },
                getChildren: function (id) {
                    return this.h4.filter(function (d) {
                        return d.parent === id ? true : false;
                    });
                },
                followLink: function (target, level, event) {
                    let elem = document.getElementById(target);
                    if (!elem) { return; }
                    this.$emit('log', 'toc_entry_open', { level: level, target: target, title: elem.innerHTML });
                    // history.pushState(null, null, target)
                    // var scrollPos = window.scrollY || window.scrollTop || document.getElementsByTagName('html')[0].scrollTop || window.pageYOffset;
                    let elScrollOffset = elem.getBoundingClientRect().top
                    let scrollOffset = window.pageYOffset || document.documentElement.scrollTop
                    let padding = 50

                    window.scroll({
                        top: elScrollOffset + scrollOffset - padding,
                        behavior: 'smooth'
                    });
                    this.$emit('hideTabContent');
                    event.preventDefault();
                }
            },

            template: `
                <div class="longpage-toc-container">
                    <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="$emit('hideTabContent')">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div class="m-auto w-md-75 w-xs-100" style="max-height:80vh; overflow:auto">
                        <ul id="toc" class="nav-pills list-unstyled mt-0 pt-0">
                            <li v-for="heading in h3" class="mb-2">
                                <a v-on:click="followLink(heading.id, 'h3', $event)" class="bold">{{ heading.text }}</a>
                                <ul v-if="getChildren(heading.id).length > 0" class="ml-3">
                                    <li v-for="subhead in getChildren(heading.id)">
                                        <a v-on:click="followLink(subhead.id, 'h4', $event)">{{ subhead.text }}</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <ul hidden id="toclist" class="nav-pills list-unstyled"></ul>
                    </div>
                </div>
            `
        });
});