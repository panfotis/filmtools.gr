/**
 * @file
 * Global utilities.
 *
 */
(function($, Drupal) {

  'use strict';

  Drupal.behaviors.bootstrap_sass = {
    attach: function(context, settings) {

      once('onRelatedCarousel', '.view-related-products', context).forEach(function (section) {

        var swiper = new Swiper(".swiper-outer", {
          slidesPerView: 4,
          spaceBetween: 30,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          scrollbar: {
            el: ".swiper-scrollbar",
            hide: false,
          },
          breakpoints: {
            // up to 440px
            0: {
              slidesPerView: 1,
            },
            769: {
              slidesPerView: 2,
            },
            // 992px and above
            992: {
              slidesPerView: 3
            },
            1100:{
              slidesPerView: 4
            },
          },
        });


      });



      once('checkExposedFilters', '#views-exposed-form-products-by-term-block-1', context).forEach(function (section) {
        const productTerms = new Set();
        document.querySelectorAll('[class*="term--"]').forEach(el => {
          el.classList.forEach(cls => {
            if (cls.startsWith("term--")) {
              productTerms.add(cls.replace("term--", ""));
            }
          });
        });

        document.querySelectorAll('input[name="field_offer_type_target_id"]').forEach(input => {
          const wrapper = input.closest("li");
          if (input.value === "All") return;
          if (!productTerms.has(input.value)) {
            if (wrapper) wrapper.remove();
          }
        });
      });


    }
  };

})(jQuery, Drupal);
