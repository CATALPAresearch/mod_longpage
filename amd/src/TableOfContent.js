
define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min'
], function ($, Vue) {

    Vue.component('TableOfContent',
        {
            props: ['hideTabContent', 'log'],
            
            data: function () {
                return {
                }
            },

            mounted: function () {
                this.generateTableOfContent();
                let _this = this;
                $('.nav-link-h4').click(function () {
                    _this.$emit('log', 'toc_entry_open', { level: 'h4', target: $(this).attr('href') });
                });
                $('.nav-link-h3').click(function () {
                    _this.$emit('log', 'toc_entry_open', { level: 'h3', target: $(this).attr('href') });
                });
            },

            methods: {
                generateTableOfContent: function () {
                    // Generates a table of content from a HTML DOM
                    var prevH2Item = {};
                    var prevH2List = {};
                    var li = {};
                    var indexH3 = 0;
                    var indexH4 = 0;
                    $(".longpage-container h3, .longpage-container h4").each(function () {
                        if ($(this).is("h3")) { // .tagName === 'H3'
                            $(this).attr('id', "xh3item-" + indexH3);
                            li = "<li class='nav-item'><a class='nav-link nav-link-h3' data-parent='#toclist' data-toggle='collapse' data-target='#h3item-" + indexH3 + "' href='#xh3item-" + indexH3 + "'>" + $(this).text() + "</a></li>";
                            prevH2List = $('<ul></ul>').addClass('nav flex-column ml-3');
                            prevH2Item = $(li); // var doc = new DOMParser().parseFromString(xmlString, "text/html");
                            $('.nav-link-h3').click(function (e) {
                                var target = $(this).attr('href');
                                window.location.href = window.location.href.split('#')[0] + target;
                                var scrollPos = window.scrollY || window.scrollTop || document.getElementsByTagName('html')[0].scrollTop || window.pageYOffset;
                                //var elPos = document.getElementById(target.replace('#', '')).scrollTop; // not working
                                window.scroll({
                                    top: scrollPos - 30,
                                    left: 0,
                                    behavior: 'smooth'
                                });
                                console.log(scrollPos, target, window.scrollY)

                            });
                            var wrap = $('<div></div>')
                                .attr('id', 'h3item-' + indexH3)
                                .addClass('collapse')
                                .append(prevH2List)
                                ;
                            prevH2Item.append(wrap);
                            if (window["toclist"]) {
                                prevH2Item.appendTo("#toclist");
                            } else {
                                console.log('Could not find toclist');
                            }
                            indexH3++;
                        } else if ($(this).is("h4")) {
                            $(this).attr('id', "h4item-" + indexH4);
                            li = "<li class='nav-item'><a class='nav-link nav-link-h4' href='#h4item-" + indexH4 + "'>" + $(this).text() + "</a></li>";
                            prevH2List.append(li);
                            indexH4++;
                        }
                    });
                },
            },
            template: `
                <div class="m-auto" style="max-height:80vh; overflow:auto">
                    <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="$emit('hideTabContent')">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <br>
                    <ul id="toclist" class="nav-pills"></ul>
                </div>
            `
        });
});

