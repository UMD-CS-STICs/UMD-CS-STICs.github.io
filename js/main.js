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

let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}