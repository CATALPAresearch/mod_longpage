import $ from 'jquery';

$(() => {
    $('.longpage-footnote button').popover({
        html: true,
        trigger: 'focus',
        content() {
            const content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
        },
    });
});
