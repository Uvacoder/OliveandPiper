/*

Envy by WeTheme (http://www.wetheme.com)
Section JS

*/

// MatchHeight

function load_matchheight() {
    $('.homepage-collection-grid-inner .grid-image').matchHeight();
}

// Instagram section

var INSTAGRAM_SELECTOR = '.instagram-wrapper';
var INSTAGRAM_OPTIONS = {
    get: 'user',
    userId: 'self',
    resolution: 'standard_resolution'
};

var INSTAGRAM_TEMPLATE = '<div class="instagram-indiv instagram-grid-%grid%"><a href="\{\{link\}\}" target="_blank"><div style="background-image: url(\{\{image\}\})" class="instagram-image"></div></a></div>';

var instagrams = {};

function instagram_init(instagram_element) {
    var section = instagram_element.dataset.id;

    // Read the Instagram token
    var token_input = document.querySelector('#token-' + section);
    if (!token_input) {
        // We don't have a token, no data are available and placeholder is shown
        return;
    }
    var token = token_input.value;

    // Set up options for Instafeed
    var target = document.querySelector('#instafeed-' + section);
    var rows = parseInt(target.dataset.rows), grid = parseInt(target.dataset.grid), sortBy = target.dataset.sortBy;
    var options = $.extend({}, {
        limit: rows * grid,
        target: target,
        accessToken: token,
        sortBy: sortBy,
        template: INSTAGRAM_TEMPLATE.replace('%grid%', grid),
        error: function (message) {
            console.error("Unable to download Instagram data: " + message);
        }
    }, INSTAGRAM_OPTIONS);

    // Remove all previous images
    while (target.firstChild) {
        target.removeChild(target.firstChild);
    }

    // Fetch and show Instagram pictures
    var feed = new Instafeed(options);
    feed.run();
}

function load_instagram(target) {
    var instagram_elements = target.querySelectorAll(INSTAGRAM_SELECTOR);
    Array.prototype.forEach.call(instagram_elements, instagram_init);
}


// Slider section

var DEFAULT_OPTIONS = {
    directionNav: true,
    controlNav: true,
    startAt: 0
};

var SLIDER_SELECTOR = '.flexslider-homepage';
var SLIDER_REENABLE_INTERVAL = 6000;

/* Mapping from sectionId to Slider instance */
var sliders = {};

/* Initialize all the sliders */
function load_slider(section) {
    sliders = {};
    section = section || document;
    var slider_elements = section.querySelectorAll(SLIDER_SELECTOR);
    Array.prototype.forEach.call(slider_elements, function (slider_element) {
        // Prevent flickering in the flexslider by setting fixed width of the slides
        $(slider_element).find('.slides li').css('width', $(slider_element).width());

        sliders[slider_element.dataset.sliderId] = new Slider(slider_element);
    });
}

function Slider(element) {
    this.$element = $(element);
    this.restartTimer = null;

    this.get_speed = function () {
        return parseInt(this.$element.data('sliderSlideTime'));
    };

    this.get_id = function () {
        return this.$element.data('sliderId');
    };

    this.get_smooth_height_state = function(){
        return $(window).width() < 767;
    };

    this.get_animation = function () {
        return this.$element.data('sliderAnimation');
    };

    this.show_slide = function (index) {
        if (this.get_speed() > 0) {
            this.$element.flexslider("stop");
        }
        this.$element.flexslider(index);
    };

    this.start_animation = function () {
        // Don't start animation when autorotate is disabled
        if (this.get_speed() > 0) {
            this.$element.flexslider("play");
        }
    };

    this.on_slide_change = function(slider) {
        var speed = this.get_speed();
        if (!slider.playing && speed > 0) {
            // restart autoscroll after given interval since last interaction
            clearTimeout(this.restartTimer);
            this.restartTimer = setTimeout(function () {
                slider.play();
            }, Math.max(0, SLIDER_REENABLE_INTERVAL - speed));
        }
    };

    this.configure = function (options) {
        if ($(window).width() === 0) {
            // the app is not yet loaded in the admin, retry later
            setTimeout(this.configure.bind(this), 200);
            return;
        }
        var speed = this.get_speed();
        var id = this.get_id();

        var opts = $.extend({
                controlsContainer: this.$element,
                slideshowSpeed: speed,
                animation: this.get_animation(),
                controlsContainer: $('.slider-pagination-container.slider--'+id),
                customDirectionNav: $('.flex-direction-nav.slider--'+id+' a'),
                slideshow: speed > 0,
                useCSS: false, // Fix for background disappearing: http://stackoverflow.com/a/27298397
                pauseOnAction: true,
                smoothHeight: this.get_smooth_height_state(),
                after: this.on_slide_change.bind(this)
            }, DEFAULT_OPTIONS, options);
        this.$element.find('ul.slides').width('auto');
        this.$element.flexslider(opts);
    };
    this.configure({});

    // flexslider stops the animation when the page is not focused, this breaks when the section is
    // changed in theme admin because it triggers 'blur' event when another iframe is selected
    $(window).unbind('blur');
}



// Product template section

function load_tabs() {
    $('ul.tabs').each(function() {
        var active, content, links = $(this).find('a');
        active = links.first().addClass('active');
        content = $(active.attr('href'));
        links.not(':first').each(function () {
            $($(this).attr('href')).hide();
        });
        $(this).find('a').click(function(e){
            active.removeClass('active');
            content.hide();
            active = $(this);
            content = $($(this).attr('href'));
            active.addClass('active');
            content.fadeIn();
            return false;
        });
    });
}

function set_image_with_loader(target, src) {
    var loader = document.querySelector('#featured-image-loader');
    var image = new Image();
    image.src = src;

    if (image.complete) {
        // Image is already loaded
        target.attr({src: src});
    } else {
        // Show spinner and load image
        loader.classList.remove('hidden');
        target.css('filter', 'opacity(0.4)');
        image.onload = function () {
            this.onload = this.onerror = this.onabort = null;
            loader.classList.add('hidden');
            target.attr({src: src}).css('filter', '');
        };
        image.onerror = image.onabort = function () {
            this.onload = this.onerror = this.onabort = null;
            loader.classList.add('hidden');
            target.css('filter', '');
        };
    }
}

function load_zoom() {
    $('*[data-zoom=true]').zoom({
        touch: false
    });
    $('a.image-swap').click(function() {
        var newImage = $(this).attr('href');
        set_image_with_loader($('.featured-image-div img'), newImage);
        return false;
    });
}


function formatMoney(cents, format) {
    var moneyFormat = theme.moneyFormat; // eslint-disable-line camelcase
    if (typeof cents === 'string') {
        cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
        if (precision === null || precision === undefined) {
            precision = 2;
        }
        thousands = thousands || ',';
        decimal = decimal || '.';

        if (isNaN(number) || number == null) {
            return 0;
        }

        number = (number / 100.0).toFixed(precision);

        var parts = number.split('.');
        var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
        var centsAmount = parts[1] ? (decimal + parts[1]) : '';

        return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
            value = formatWithDelimiters(cents, 2);
            break;
        case 'amount_no_decimals':
            value = formatWithDelimiters(cents, 0);
            break;
        case 'amount_with_comma_separator':
            value = formatWithDelimiters(cents, 2, '.', ',');
            break;
        case 'amount_no_decimals_with_comma_separator':
            value = formatWithDelimiters(cents, 0, '.', ',');
            break;
        case 'amount_no_decimals_with_space_separator':
            value = formatWithDelimiters(cents, 0, ' ');
            break;
    }

    return '<span class="money">' + formatString.replace(placeholderRegex, value) + '</span>';
}

function Product(element) {
    var product = this;
    // Settings
    this.config = {
        shopify_ajax_add_url: '/cart/add.js',
        shopify_ajax_url: '/cart.js'
    };

    this.element = element;
    this.$element = $(element);

    this.sectionId = this.element.dataset.sectionId;
    var product_script = document.querySelector('#ProductJson-' + this.sectionId);
    if (!product_script) {
        // Product is not loaded, there is either no product section or the product is not selected
        return;
    }
    this.product = JSON.parse(document.querySelector('#ProductJson-' + this.sectionId).innerText);
    this.$selects = this.$element.find('.selector-wrapper select, .materialize-select select');
    this.$selects.on('change', this.on_select_change.bind(this));
    this.$original_select = this.$element.find('.original-select');
    this.$old_price = this.$element.find('.compare-at-price .money');
    this.$price = this.$element.find('#price-field');
    this.$cart = this.$element.find('#purchase');
    this.$sale = this.$element.find('.sale-badge,.compare-at-price');
    this.$sale_price = this.$element.find('.compare-at-price');
    this.$featured_image = this.$element.find('.product-main-image');
    this.$add_to_cart_form = this.$element.find('#add-to-cart-form');
    this.$mobile_slider = this.$element.find('.mobile-product-slider');
    this.$cart_slider_wrapper = $('#cartSlideoutWrapper');
    this.$cart_item_count = $('.cart-item-count,.cart-item-count-header');
    this.$cart_money = $('.cart-item-price');
    this.$thumbnails = this.$element.find('a.image-swap');
    this.zoom_selector = '.zoomImg';
    this.thumbnail_changes_variant = this.$element.find('#thumbnail_changes_variant').val() === 'true';
    this.added_text_timeout = null;

    this.on_select_change();
    this.$cart.click(function(e) {
        e.preventDefault();
        this.disable_cart_button();
        this.add_to_cart();
    }.bind(this));

    // Change product (if enabled) when thumbnail is clicked
    this.$thumbnails.click(function (e) {
        this.on_thumbnail_click(e.currentTarget);
    }.bind(this));

    // Change product (if enabled) when slider changes (on mobile and in quick shop section)
    var slider = this.$mobile_slider.data('flexslider');
    if (!slider) {
        return;
    }
    var old_before = slider.vars.before;
    slider.vars.before = function () {
        old_before();

        // wait for active slide to change
        setTimeout(this.on_mobile_slider_change.bind(this), 200);
    }.bind(this);
}

Product.prototype.on_select_change = function () {
    var values = this.$selects.map(function (index, select) {
        return $(select).val();
    });
    var matching_variants = this.product.variants.filter(function (variant) {
        for (var i = 0; i < values.length; i++) {
            if (values[i] !== variant.options[i]) {
                return false
            }
        }
        return true;
    });
    if (matching_variants.length === 0) {
        this.update_variant(null);
    } else {
        this.update_variant(matching_variants[0]);
    }
};

Product.prototype.on_thumbnail_click = function (thumbnail) {
    // select variant
    if (this.thumbnail_changes_variant) {
        var variant_id = $(thumbnail).data('variant');
        if (variant_id) {
            this.on_variant_selected(variant_id);
        }
    }
};

Product.prototype.on_mobile_slider_change = function () {
    var variant_id = this.$mobile_slider.find('.flex-active-slide img').data('variant');
    if (variant_id) {
        this.on_variant_selected(variant_id);
    }
};

Product.prototype.on_variant_selected = function (variant_id) {
    var matching_variants = this.product.variants.filter(function (variant) {
        return variant.id == variant_id;
    });
    if (matching_variants.length === 0) {
        this.update_variant(null);
    } else {
        var variant = matching_variants[0];
        this.update_variant(matching_variants[0]);
        for (var i = 0; i < variant.options.length; i++) {
            $('#SingleOptionSelector-' + i).val(variant.options[i]).material_select();
        }
    }
};

Product.prototype.update_variant = function (variant) {
    if (variant) {
        this.$original_select.val(variant.id);
        if (!variant.available) {
            this.$price.text(theme.strings.soldOut);
            this.$cart.prop('disabled', true);
            console.log('here we are');
            $.event.trigger({
                type: "variantUnavailable",
                time: new Date(),
                variant: variant
            });
        } else {
            this.$price.html(formatMoney(variant.price));
            this.$cart.prop('disabled', false);
            $.event.trigger({
                type: "variantAvailable",
                time: new Date()
            });
        }
        if (variant.featured_image) {
            this.$featured_image.prop('src', variant.featured_image.src);
            $(this.zoom_selector).prop('src', variant.featured_image.src);

            var slider = this.$element.find('.mobile-product-slider');
            if (slider.length === 0) {
                slider = this.$element.find('.homepage-sections--indiv-product-slider');
            }
            var li_to_activate = slider.find('li:not(.clone) [data-variant="' + variant.id + '"]').parent();
            var index = slider.data('flexslider').slides.index(li_to_activate);
            if (index > -1) {
                slider.flexslider(index);
            }
        }
        var is_sale = variant.compare_at_price && variant.compare_at_price > variant.price;
        this.$sale_price.html(is_sale ? formatMoney(variant.compare_at_price) : '');
        this.$sale.toggleClass('hide', !is_sale);

        var is_indiv_product = this.$element.closest('.shopify-section').hasClass('homepage-section--indiv-product-wrapper');
        var has_more_variants = this.product.variants.length > 1;
        if (window.history.replaceState && !is_indiv_product && has_more_variants) {
            // Change url to include variant if we're not on homepage
            var search = [];
            if (window.location.search.length > 1) {
                // select non-variant query params
                search = window.location.search.slice(1).split('&').filter(function (q) {
                    return q.indexOf('variant=') !== 0;
                });
            }
            // add current variant
            search.push('variant=' + variant.id);

            // set the url to include the variant
            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + search.join('&');
            window.history.replaceState({path: newurl}, '', newurl);
        }
    } else {
        this.$price.text(theme.strings.unavailable);
        this.$cart.prop('disabled', true);
        this.$sale.addClass('hide');
    }
    if (Currency.shopCurrency) {
        Currency.convertAll(Currency.shopCurrency, Currency.currentCurrency);
    }
};

var CART_LOADING = '<i class="fa fa-circle-o-notch fa-spin fa-fw"></i><span class="sr-only">Loading...</span>';

Product.prototype.add_to_cart = function () {
    this.clear_error();

    $.ajax({
        url: this.config.shopify_ajax_add_url,
        dataType: 'json',
        type: 'post',
        data: this.$add_to_cart_form.serialize(),
        success: this.added_to_cart.bind(this),
        error: this.add_to_cart_failed.bind(this)
    });
};

Product.prototype.disable_cart_button = function () {
    if (this.added_text_timeout) {
        clearTimeout(this.added_text_timeout);
        this.added_text_timeout = null;
    }
    this.$cart.addClass('disabled').prop('disabled', true).html(CART_LOADING);
};

Product.prototype.enable_cart_button = function () {
    if (this.added_text_timeout) {
        clearTimeout(this.added_text_timeout);
        this.added_text_timeout = null;
    }
    this.$cart.removeClass('disabled').prop('disabled', false).html(window.theme.strings.addToCart);
};

Product.prototype.added_to_cart = function (itemData) {
    this.update_cart();
};

Product.prototype.show_cart = function () {
    $('#cartSlideoutWrapper').trigger('cart:open');
};

Product.prototype.update_cart = function () {
    // Update cart count
    $.getJSON(this.config.shopify_ajax_url)
        .then(this.updated_cart.bind(this))
        .fail(this.update_cart_failed.bind(this));
};

Product.prototype.updated_cart = function (data) {
    this.enable_cart_button();
    this.$cart_item_count.text(data.item_count);
    this.$cart_money.html(formatMoney(data.total_price));
    if (Currency.shopCurrency) {
        Currency.convertAll(Currency.shopCurrency, jQuery('[name=currencies]').val());
    }
    if (this.$cart_slider_wrapper.length > 0) {
        this.show_cart();
    } else {
        this.$cart.html(window.theme.strings.added);
        if (this.added_text_timeout) {
            clearTimeout(this.added_text_timeout);
            this.added_text_timeout = null;
        }
        this.added_text_timeout = setTimeout(function () {
            this.$cart.html(window.theme.strings.addToCart);
        }.bind(this), 2000);
    }
};

Product.prototype.update_cart_failed = function (response) {
    this.enable_cart_button();
    console.error("Updating the cart failed: ", response);
};

Product.prototype.add_to_cart_failed = function(response) {
    this.enable_cart_button();
    var errorText = 'Unknown error';
    if (response.status == 0) {
        // Unable to connect to server
    } else if (response.responseJSON) {
        // Process JSON error
        if (response.responseJSON.description) {
            errorText = response.responseJSON.description;
        } else {
            errorText = response.responseJSON.message;
        }
    } else if (response.responseText) {
        // Use plain text error
        errorText = response.responseText;
    }
    this.show_error(errorText);
};

Product.prototype.show_error = function (text) {
    $('<div id="cart-error"></div>')
        .addClass('alert alert-danger')
        .text(text)
        .insertAfter(this.$cart);
};

Product.prototype.clear_error = function () {
    $('#cart-error').remove();
};

function load_product(target) {
    if (target) {
        new Product(target.querySelector('#product-box'));
    } else {
        Array.prototype.forEach.call(document.querySelectorAll('#product-box'), function (box) {
            new Product(box);
        });
    }

    $(".selector-wrapper select:not(.materialize)").selectOrDie({
        customClass: "custom",
        customID:    "custom"
    });
}


// Flexslider Mobile Product Images

function load_mobile_product_slider() {
    $('.mobile-product-slider').flexslider({
        animation: 'slide',
        directionNav: false,
        controlNav: true,
        startAt: 0,
        slideshow: false
    });
}

// Flexslider in Indiv Product section

function load_indiv_product_slider() {
    $('.homepage-sections--indiv-product-slider').flexslider({
        directionNav: false,
        slideshow: false,
        animation: "slide"
    });
}

// Mobile menu hierarchy handling


function MobileMenu() {
    var self = this;
    this.menu_structure = JSON.parse(document.querySelector('#mobile-menu-data').innerText);
    var $menu = $('#mobile-menu');
    this.$menu = $menu;
    this.$submenu = $('#mobile-submenu');

    $('.mobile-menu-sub').off('click').on('click', function () { self.menu_click($(this), $menu); });
    $('.mobile-menu-back').off('click').on('click', function () { self.back_click($(this)); });
}

MobileMenu.prototype.menu_click = function ($link, $menu) {
    var self = this;
    this.clear_submenus($menu);
    var handle = $link.data('link');

    if (handle === 'mobile-menu-currency') {
        $('#mobile-menu-currency').removeClass('mobile-menu-hidden');
        return;
    }

    this.menu_structure[handle].links.forEach(function (link) {
        var menu = self.menu_structure[link];
        var $li = $('<li></li>');
        var $a = $('<a></a>')
            .attr('href', menu.url)
            .html(menu.title);
        $li.append($a);
        if (menu.links.length > 0) {
            var $btn = $('<a href="#" class="mobile-menu-sub mobile-menu-right mobile-menu-link"><i class="fa fa-chevron-right" aria-hidden="true"></i></a>')
                .data('link', link)
                .on('click', function () { self.menu_click($(this), self.$submenu); });
            $li.append($btn);
        }
        $menu.append($li);
    });
    $menu.removeClass('mobile-menu-hidden');
};

MobileMenu.prototype.clear_submenus = function ($menu) {
    $menu.find('> li:not(:first)').remove();
};

MobileMenu.prototype.back_click = function ($link) {
    $link.parents('.mobile-menu').addClass('mobile-menu-hidden');
};

function load_mobile_menu() {
    new MobileMenu();

    $('.mobile-menu-currency-link').on('click', function () {
        var $this = $(this);
        var code = $this.data('code');
        $(document).trigger("currency:change", code);
    });

    $(document).on("currency:change", function (event, currency) {
        // Select current currency in the mobile menu when global select changes
        $('.mobile-menu-currency-selected').removeClass('mobile-menu-currency-selected');
        $('.mobile-menu-currency-link[data-code=' + currency +']').addClass('mobile-menu-currency-selected');
    });
}

// Parallax effect for the Text over image section

(function ($) {

    $.fn.parallax = function () {
      var window_width = $(window).width();
      // Parallax Scripts
      return this.each(function(i) {
        var $this = $(this);
        $this.addClass('parallax');

        function updateParallax(initial) {
          var container_height;
          if (window_width < 601) {
            container_height = ($this.height() > 0) ? $this.height() : $this.children(".img").height();
          }
          else {
            container_height = ($this.height() > 0) ? $this.height() : 500;
          }
          var $img = $this.children(".img").first();
          var img_height = $img.height();
          var parallax_dist = img_height - container_height;
          var bottom = $this.offset().top + container_height;
          var top = $this.offset().top;
          var scrollTop = $(window).scrollTop();
          var windowHeight = window.innerHeight;
          var windowBottom = scrollTop + windowHeight;
          var percentScrolled = (windowBottom - top) / (container_height + windowHeight);
          var parallax = Math.round((parallax_dist * percentScrolled));

          if (initial) {
            $img.css('display', 'block');
          }
          if ((bottom > scrollTop) && (top < (scrollTop + windowHeight))) {
            $img.css('transform', "translate3D(-50%," + parallax + "px, 0)");
          }
        }

        // Wait for image load
        $this.children(".img").one("load", function() {
          updateParallax(true);
        }).each(function() {
          if(this.complete || !this.src) $(this).load();
        });

        $(window).scroll(function() {
          window_width = $(window).width();
          updateParallax(false);
        });

        $(window).resize(function() {
          window_width = $(window).width();
          updateParallax(false);
        });

      });

    };
}( jQuery ));

function load_parallax() {
    $('.parallax').parallax();
}

function load_currencies() {
    $("select.currency-picker").css('visibility', 'visible').selectOrDie({
        customClass: "custom",
        customID: "custom"
    });
}

function load_mobile_text_adverts() {
    $('.mobile-homepage-text-adverts').flexslider({
      controlNav: true,
      directionNav: false,
      animation: 'slide'
    });
}

function load_search() {
  $(document).ready(function(){

      $(".search-show").off('click').on('click', function(){
          $("#top-search-wrapper").toggleClass('expanded');
          $("#top-search-wrapper #search_text").focus();
      });

      if($(window).width() < 767){
          $('.mobile-menu-close').trigger('click');
      }
  });
}

var dropdown_timeout = null;

function dropdown_handle_hover() {
    // open menu/submenu on mousehover
    var $dropdown_toggle = $('.dropdown-envy-toggle,.dropdown-menu');
    $dropdown_toggle.off('mouseenter').on('mouseenter', function () {
        var $this = $(this);

        // wait for some time before opening the menu
        var $menu = $this.parent();
        if (dropdown_timeout) {
            clearTimeout(dropdown_timeout);
        }
        dropdown_timeout = setTimeout(function () {
            // close other open menus
            if ($this.is('.dropdown-envy-toggle')) {
                $('.dropdown.open,.dropdown-submenu.open').removeClass('open');
            }

            $menu.addClass('open');
            select_menu_direction($this.parent());
        }, 10);
    });

    // handle closing menu when hover ends
    $dropdown_toggle.off('mouseleave').on('mouseleave', function () {
        var $menu = $(this).parent();
        if (dropdown_timeout) {
            clearTimeout(dropdown_timeout);
        }
        dropdown_timeout = setTimeout(function () {
            $menu.removeClass('open');
        }, 50);
    });
}

function dropdown_handle_touch() {
    // open menu when touched on touch device
    $('.dropdown-envy-toggle').off('touchend').on('touchend', function (evt) {
        var $this = $(this);
        var $menu = $this.parent();
        if (!$menu.hasClass('open')) {
            evt.preventDefault();
            $menu.find('.dropdown-submenu.open').removeClass('open');
            $menu.addClass('open');
            select_menu_direction($menu);
        }
    });
    // open submenu when touched
    $('.dropdown-submenu').off('touchend').on('touchend', function (evt) {
        var $this = $(this);
        if (!$this.hasClass('open')) {
            evt.preventDefault();
            $('.dropdown-submenu.open').removeClass('open');
            $this.addClass('open');
        }
    });
    // hide menu when touched anywhere else then the menu
    $('body').on('touchstart', function (evt) {
        var $open_menu = $('.dropdown.open');
        if ($open_menu.length === 0) {
            return;
        }
        // don't hide menu if we clicked "inside" the menu
        if ($(evt.target).parents('.dropdown.open').length === 0) {
            $open_menu.removeClass('open');
        }
    });
}

function load_dropdown_hover() {
    dropdown_handle_hover();
    dropdown_handle_touch();
}

function select_menu_direction($menu) {
    // Fix submenu opening outside of viewport by showing it to the left of menu
    var children_widths = $menu.find('.dropdown-menu .dropdown-menu').map(function () {
        var $this = $(this);
        var width = $this.css({'display': 'block', 'visibility': 'hidden'}).outerWidth();
        $this.css({'display': '', 'visibility': ''});
        return width;
    });
    var max_width = Math.max.apply(null, children_widths);
    var $submenu = $menu.find('> .dropdown-menu');
    var left = $submenu.offset().left;
    var right = left + $submenu.outerWidth() + max_width;
    var switch_to_left = right > $('body').width() && left - max_width > 0;
    $submenu.toggleClass('dropdown-submenu-left', switch_to_left);
}

function load_reviews() {
    if (window.hasOwnProperty('SPR') && document.querySelector('#shopify-product-reviews')) {
        SPR.registerCallbacks();
        SPR.initRatingHandler();
        SPR.initDomEls();
        SPR.loadProducts();
        SPR.loadBadges();
    }
}

function load_collection_tag_filter() {
    /* Product Tag Filters - Good for any number of filters on any type of collection pages */
    var collFilters = jQuery('.coll-filter');
    collFilters.change(function () {
        var newTags = [];
        collFilters.each(function () {
            var val = jQuery(this).val();
            if (val) {
                newTags.push(val);
            }
        });
        if (newTags.length) {
            var query = newTags.join('+');
            window.location.href = $('#link-to-tag-generic a').attr('href').replace(/\/tag($|\?)/, '/' + query + '$1');
        } else {
            window.location.href = $('#link-to-collection').val();
        }
    });

    $(".coll-filter").selectOrDie({
        customClass: "custom",
        customID:    "custom",
        size: 10
    });
}

function load_collection_sort() {
    Shopify.queryParams = {};
    if (location.search.length) {
        for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
            aKeyValue = aCouples[i].split('=');
            if (aKeyValue.length > 1) {
                Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
            }
        }
    }

    var sort_by = $('#collection-sort-by').val();
    jQuery('#sort-by')
        .val(sort_by)
        .bind('change', function() {
            Shopify.queryParams.sort_by = jQuery(this).val();
            location.search = jQuery.param(Shopify.queryParams).replace(/\+/g, '%20');
        });

    $("#sort-by").selectOrDie({
        customClass: "custom",
        customID:    "custom"
    });
}

function load_collection_mobile_sidebar() {
    $('.collection-sidebar--section h2').on('click', function () {
        var $this = $(this);
        var parent = $this.parent();
        parent.toggleClass('expanded');
    });
}

// Video section

var VIDEO_PLAYING = 1, VIDEO_PAUSED = 2, VIDEO_STOPPED = 3;

function is_scrolled_into_view($element) {
    var $w = $(window);
    var docViewTop = $w.scrollTop();
    var docViewBottom = docViewTop + $w.height();

    var elemCenter = $element.offset().top + $element.outerHeight() / 2.0;

    return ((elemCenter >= docViewTop && elemCenter <= docViewBottom));
}

var insideViewCheckTimeout = null, wasInsideView = false;

function visibility_tracker($element, scrolled_into_view_cb, scrolled_out_of_view_cb) {
    wasInsideView = is_scrolled_into_view($element);
    if (wasInsideView) {
        scrolled_into_view_cb();
    }

    $(window).scroll(function() {
        check_inside_view($element, scrolled_into_view_cb, scrolled_out_of_view_cb);
    });

    $(window).resize(function() {
        check_inside_view($element, scrolled_into_view_cb, scrolled_out_of_view_cb);
    });
    check_inside_view($element, scrolled_into_view_cb, scrolled_out_of_view_cb);
}


function check_inside_view($element, scrolled_into_view_cb, scrolled_out_of_view_cb) {
    if (insideViewCheckTimeout) {
        clearTimeout(insideViewCheckTimeout);
    }
    insideViewCheckTimeout = setTimeout(function () {
        insideViewCheckTimeout = null;

        var isInsideView = is_scrolled_into_view($element);

        if (wasInsideView && !isInsideView) {
            scrolled_out_of_view_cb();
        }

        if (!wasInsideView && isInsideView) {
            scrolled_into_view_cb();
        }
        wasInsideView = isInsideView;
    }, 100);
}

function load_youtube(element) {
    var autoplay = element.dataset.videoAutoplay === "true",
        mute = element.dataset.videoMute === "true",
        loop = element.dataset.videoLoop === "true",
        $element = $(element),
        $parent = $(element).parent(),
        $overlay = $element.closest('.video-section').find('.video-overlay');

    player = new YT.Player(element.id, {
        width: 746,
        videoId: element.dataset.videoLink,
        playerVars: {
            showinfo: 0,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onReady: function (event) {
                var video = event.target;
                if (autoplay) {
                    $parent.data('pausedAutomatically', true);
                }
                if (mute) {
                    video.mute();
                }

                visibility_tracker(
                    $parent,
                    function scrolled_into_view() {
                        if ($parent.data('pausedAutomatically')) {
                            video.playVideo();
                        }
                    },
                    function scrolled_out_of_view() {
                        $overlay.removeClass('active');
                        if (video.getPlayerState() === YT.PlayerState.PLAYING) {
                            $parent.data('pausedAutomatically', true);
                            video.pauseVideo();
                        }
                    }
                )
            },
            onStateChange: function (event) {
                if (event.data === YT.PlayerState.PLAYING) {
                    if (!autoplay) {
                        $overlay.addClass('active');
                    }
                    $parent.data('pausedAutomatically', false);
                }

                if (event.data === YT.PlayerState.ENDED && loop) {
                    event.target.playVideo();
                }
            }
        }
    });
}

function load_youtube_all() {
    $('.youtube-video').each(function (index, el) {
        load_youtube(el);
    });
}

function load_youtube_api() {
    if (!document.querySelector('.youtube-video')) {
        // No youtube elements, do not load youtube API
        return;
    }

    if (!document.querySelector('#youtube_api')) {
        // Youtube API is not yet loaded, create script that loads it
        create_script("youtube_api", "https://www.youtube.com/player_api");

        // Call 'youtube_load_all' as soon as the API is loaded
        window.onYouTubePlayerAPIReady = load_youtube_all;
    } else if (!window.YT) {
        // Script for loading youtube API is there, but youtube is not yet loaded,
        // load_youtube_all will be called when script finishes loading
    } else {
        // We already have youtube API loaded, call 'load_youtube_all'
        load_youtube_all();
    }
}

function load_vimeo(element) {
    var player = new Vimeo.Player(element.id);
    player.ready().catch(function (e) {
        document.getElementById(element.id).innerText = e;
    });
    if (document.querySelector('#' + element.id).dataset.videoMute === "true") {
        player.setVolume(0);
    }
    var autoplay = element.dataset.videoAutoplay === 'true';
    if (autoplay) {
        $(element.parentNode).data('pausedAutomatically', true);
    }

    var $element = $(element),
        $parent = $element.parent(),
        $overlay = $element.closest('.video-section').find('.video-overlay');

    visibility_tracker(
        $parent,
        function scrolled_into_view() {
            if ($parent.data('pausedAutomatically')) {
                player.play();
            }
        },
        function scrolled_out_of_view() {
            $overlay.removeClass('active');
            player.getPaused().then(function (paused) {
                if (!paused) {
                    player.getEnded().then(function (ended) {
                        if (!ended) {
                            $parent.data('pausedAutomatically', true);
                            player.pause();
                        }
                    });
                }
            });
        }
    );
    player.on('play', function(data) {
        if (!autoplay) {
            $overlay.addClass('active');
        }
        $parent.data('pausedAutomatically', false);
    });

}

function load_vimeo_all() {
    $('.vimeo-video').each(function (index, el) {
        load_vimeo(el);
    });
}

function load_vimeo_api() {
    if (!document.querySelector('.vimeo-video')) {
        // No vimeo elements, do not load vimeo API
        return;
    }

    if (!document.querySelector('#vimeo_api')) {
        // Vimeo API is not yet loaded, create script that loads it
        var script = create_script("vimeo_api", "https://player.vimeo.com/api/player.js");

        if (script.readyState) {
            // IE
            script.onreadystatechange = function() {
                if (element.readyState == "loaded" || element.readyState == "complete") {
                    element.onreadystatechange = null;
                    load_vimeo_all();
                }
            };
        } else {
            // Other browsers
            script.onload = function() {
                load_vimeo_all();
            };
        }
    } else if (!window.Vimeo) {
        // Script for loading vimeo API is there, but vimeo is not yet loaded,
        // load_vimeo_all will be called when script finishes loading
    } else {
        // We already have vimeo API loaded, call 'load_vimeo_all'
        load_vimeo_all();
    }
}

function create_script(id, src) {
    var tag = document.createElement('script');
    tag.id = id;
    tag.src = src;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    return tag;
}

function load_password_recover() {
    var $recover = $('.recover-form');
    if ($recover.length === 0) {
        return;
    }
    $recover.removeClass('no-js');
    if (window.location.hash !== '#recover') {
        $recover.addClass('hide');
    }
    $('.show-password-form').on('click', function (e) {
        $recover.toggleClass('hide');
    });
}

function load_newsletter_form() {
    // Use AJAX for submitting the contact form
    $('.contact-form').off('submit').on('submit', function (event) {
        event.preventDefault();
        var $form = $(this);
        $form.find('.newsletter-spinner').removeClass('hide');
        $form.find('#newsletter-wrapper').addClass('hide');

        $.post('/contact', $form.serialize())
            .done(function () {
                $form.find('.form-success').removeClass('hide');
                $form.find('.newsletter-spinner').addClass('hide');
            })
            .fail(function () {
                $form.off('submit');
                $form.submit();
            })
    });
}

// Initialization

function block_select(event) {
    // Stop animation and show block when selected in the Slideshow section
    var slider = sliders[event.detail.sectionId];
    if (slider) {
        var index = parseInt(event.target.dataset.slideIndex);
        slider.show_slide(index);
    }

    // Stop animation and show block when select in Text Adverts section on mobile
    var mobile_text_advert = $(event.target).parents('.homepage-sections-wrapper').find('.mobile-homepage-text-adverts');
    if (mobile_text_advert.length > 0) {
        var index = Array.prototype.indexOf.call(event.target.parentElement.children, event.target);
        mobile_text_advert.flexslider("stop");
        mobile_text_advert.flexslider(index);
    }

}

function block_deselect(event) {
    // Resume animation when block is deselected in the Slideshow section
    var slider = sliders[event.detail.sectionId];
    if (slider) {
        slider.start_animation();
    }

    // Resume animation when block is deselected in Text Adverts section on mobile
    var mobile_text_advert = $(event.target).parents('.homepage-sections-wrapper').find('.mobile-homepage-text-adverts');
    if (mobile_text_advert.length > 0) {
        mobile_text_advert.flexslider("play");
    }
}

function get_section_name(event) {
    var section = null;
    if (event && event.detail) {
        var data = {};
        var dataset = event.target.dataset;
        for (var key in dataset) {
            if (dataset.hasOwnProperty(key) && key.indexOf('themeEditorSection-') === 0) {
                data = JSON.parse(dataset[key]);
            }
        }
        if (data.hasOwnProperty('type')) {
            section = data['type'];
        }
    }
    return section;
}


function onload(event) {
    document.addEventListener('shopify:block:select', block_select);
    document.addEventListener('shopify:block:deselect', block_deselect);

    var section = get_section_name(event);
    if (!section || section === 'slideshow') {
        // Do not reload slider when header or footer is changed
        load_slider(event && event.target);
    }

    if (!section || section === 'instagram') {
        load_instagram(event.target);
    }

    if (!section || section === 'product-template' || section === 'indiv-product') {
        load_zoom();
        load_tabs();
        load_mobile_product_slider();
        load_indiv_product_slider();
        load_quantity_controls();
        load_product(section && event && event.target);
        load_materialize_select();
        if (event) {
            // The Shopify Product Review app will load itself on document load,
            // we need to apply it manually when product section change
            load_reviews();
        }
        load_out_of_stock_email_form();
    }

    if (!section || section === 'header') {
        load_mobile_menu();
        load_currencies();
        load_search();
        load_dropdown_hover();
    }

    if (!section || section === 'text-adverts') {
        load_mobile_text_adverts();
    }

    if (!section || section === 'text-over-image') {
        load_parallax();
    }

    if (!section || section === 'collection-list') {
        load_matchheight();
    }

    if (!section || section === 'collection-template') {
        load_collection_tag_filter();
        load_collection_sort();
        load_collection_mobile_sidebar();
    }
    if (!section || section === 'cart-template') {
        load_quantity_controls();
    }
    if (!section || section === 'video') {
        load_youtube_api();
        load_vimeo_api();
    }
    if (!section) {
        load_password_recover();
    }
    load_newsletter_form();
}

function onunload() {
    document.removeEventListener('shopify:block:select', block_select);
    document.removeEventListener('shopify:block:deselect', block_deselect);
    sliders = {};
}

document.addEventListener('shopify:section:load', onload);
document.addEventListener('shopify:section:unload', onunload);
document.addEventListener("DOMContentLoaded", onload);


function makeVideoEmbedsResponsive(){

    $('.template-page iframe, .template-blog iframe, .template-article iframe').each(function(index, iframe){

        var source = $(iframe).attr("src");

        if (source.indexOf("youtube.com") >= 0 || source.indexOf("vimeo.com") >= 0 || source.indexOf("dailymotion.com") >= 0){

            //create container
            var embedContainer = document.createElement('div');
            $(embedContainer).addClass('embed-container');

            //clone iframe
            var iframeClone = $(iframe).clone();

            //put clone in container
            $(embedContainer).append(iframeClone);

            //embed clone with responsive container
            $(iframe).replaceWith(embedContainer);

        }

    });

}

function load_out_of_stock_email_form(){

    $('#notify-me a').click(function() {
        if ($("customer_notify").val() == '0'){
            $('#sold-out form').submit();
        }
        else {
            $('#notify-me-wrapper').fadeIn();
        }
        return false;
    });

    $(document).on("variantUnavailable", function(evt){

        if($('.product-page--submit-action').data('stock-email-enabled')){

            var productTitle = $('.product-description-header').text();
            var $outOfStockEmailBody = $('#notify-me-wrapper input[name="contact[body]"]');
            var $emailString = "Please notify me when "+productTitle+", variant: "+evt.variant.title+" becomes available."
            $outOfStockEmailBody.val($emailString);
            $(".variant-out-of-stock").fadeIn();
            $(".product-page--submit-action").addClass("hidden");
        }
    });

    $(document).on("variantAvailable", function(){
        if($('.product-page--submit-action').data('stock-email-enabled')) {
            $(".variant-out-of-stock").hide();
            $(".product-page--submit-action").removeClass("hidden");
        }
    });

}

function load_materialize_select(){
    $('select.materialize').material_select();
}

function load_quantity_controls(){

    $('.quantity-controls button.qty-plus').off().click(function(e){
        e.preventDefault();
        var qtyInput = $(this).closest('.quantity-controls').find('input.quantity-selector');
        qtyInput.val(parseInt(qtyInput.val()) + 1);
    });

    $('.quantity-controls button.qty-minus').off().click(function(e){
        e.preventDefault();
        var qtyInput = $(this).closest('.quantity-controls').find('input.quantity-selector');
        var newQty = (parseInt(qtyInput.val()) - 1 < 1) ? 1 : qtyInput.val() - 1;
        qtyInput.val(newQty);
    });

}

$(document).ready(function() {

    makeVideoEmbedsResponsive();

    load_materialize_select();

    load_out_of_stock_email_form();

    load_quantity_controls();

});
