define([
    'jquery',
    'core/ajax'
], function ($, ajax) {

    /**
     * Plot a timeline
     */
    let AdaptiveRecommondations = function (Vue, utils, html_content) {

        // adaptive course recomondations
        var getRelatedUnits = function (text, selector) {
            console.log('go')
            var blacklist = [1144, 2333, 2337, 2351, 2355, 2353, 2366, 1662, 1664, 1666, 1671, 1661, 1672, 1675, 1665, 1810];
            blacklist = blacklist.concat([1602, 1603, 1358]); // blacklist because of general topic

            $.ajax({
                url: 'http://localhost:8080/course-recommender',
                data: { text: text },
                dataType: 'json',
                crossDomain: true,
                success: function (data) {
                    var list = $(selector).append('<ul></ul>');

                    var course = '';
                    for (var i = 0; i < data.length; i++) {
                        course = data[i][0].replace('_t.pickle', '').split('/');
                        if (blacklist.indexOf(parseInt(course[2].substr(0, 4), 10)) === -1) {
                            list.append('<li>' + course[2] + ': ' + course[3] + ' (' + data[i][1].toFixed(2) + ')</li>')
                            console.log(course[2]);
                        } else {
                            console.log('blacklisted ' + course[2], course[2].substr(0, 4));
                        }
                    }
                },
                error: function (e) {
                    console.log(e);
                }
            });
        };
        // go through text passages
        $('h3').each(function () {
            var text = '';
            text = $(this).nextUntil('h3').text();
            /*$('p').each(function(){
                text += ' '+$(this).text();
            });*/
            //console.log(text);
            getRelatedUnits(text, $(this));
        });

    };

    return AdaptiveRecommondations;
});