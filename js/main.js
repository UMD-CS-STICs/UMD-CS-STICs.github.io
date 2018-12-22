$("#contact-link").click(function() {
    $('html, body').animate({
        scrollTop: $("#contact").offset().top
    }, 400);
    $('#hamburger-menu').removeClass('show');
});

$("#mobile-contact-link").click(function() {
    $('html, body').animate({
        scrollTop: $("#contact").offset().top
    }, 600);
    $('#hamburger-menu').removeClass('show');
});

$('#hamburger').click(function() {
  $('#hamburger-menu').toggleClass('show');
})
