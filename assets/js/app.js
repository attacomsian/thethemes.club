//default js
$(function () {

    // init feather icons
    feather.replace();

    //tooltip
    $('body').tooltip({
        selector: '[data-toggle="tooltip"]'
    });

    //page scroll
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 70
        }, 1500);
        event.preventDefault();
    });
});