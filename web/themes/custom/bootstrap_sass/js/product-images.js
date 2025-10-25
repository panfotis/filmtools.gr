Fancybox.bind("[data-image-gallery-fancybox]", {
});


(function ($, Drupal, once) {
  Drupal.behaviors.carouselBig = {
    attach: function (context, settings) {
      once('onCarousel', '.image-gallery-carousel', context).forEach(function(section) {

        var swiper = new Swiper(".image-gallery-carousel", {
          slidesPerView: "auto",
          spaceBetween: 30,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          pagination: {
            el: '.swiper-pagiantion',
            type: 'bullets'
          }
        });


      });
    }
  };
})(jQuery, Drupal, once);
