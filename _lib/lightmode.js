/*****************************************************************************/
/* Kill firebug for non-FF                                                   */

if (!window.console || !console.firebug)
{
  var names = ["log", "debug", "info", "warn", "error", "assert", "dir", 
               "dirxml", "group", "groupEnd", "time", "timeEnd", "count", 
               "trace", "profile", "profileEnd"];
  window.console = {};
  for (var i = 0; i < names.length; ++i)
    window.console[names[i]] = function() {}
}


/****************************************************************************/
/* State change functions

   There are three states (possible next states listed):

    o ready -- the Ready indicator shows (overlay)
    o overlay -- this is the quasimode, showing available "manageables"
                 (ready, loading)
    o app -- manageable selected, iframe is up (ready)

  */

READY = Object();
OVERLAY = Object();
APP = Object();

STATE = null;


function to_ready() {
    STATE = READY;
    $('#lightmode-ready').show();
    $('#lightmode-mask').hide();
    $('#lightmode-panes').hide();
    $('#lightmode-iframe').hide();
    $('#lightmode-close-on').hide();
    $('#lightmode-close-off').hide();
    $('#lightmode-loading').hide();
}

function to_overlay() {
    STATE = OVERLAY;
    $('#lightmode-ready').hide();
    $('#lightmode-mask').show();
    $('#lightmode-panes').show();
    $('#lightmode-iframe').hide();
    $('#lightmode-close-on').hide();
    $('#lightmode-close-off').hide();
    $('#lightmode-loading').hide();
}

function to_app(url) {
    STATE = APP;
    $('#lightmode-ready').hide();
    $('#lightmode-mask').show();
    $('#lightmode-panes').hide();
    $('#lightmode-iframe').show(100, function() {
      window.frames['lightmode-iframe'].location.href = url; // cross-browser
    });
    $('#lightmode-close-on').hide();
    $('#lightmode-close-off').show();
}


/****************************************************************************/
/* Resize                                                                   */

function resize_iframe() {
    /* This is affected by scrolling, so we need to call it more often than 
       on resize.
      */

    winH = $(window).height();
    winW = $(window).width();
    docH = $(document).height();
    docW = $(document).width();
    sclT = $(window).scrollTop();
    sclL = $(window).scrollLeft();


    // iframe
    // ======

    FPAD = 100;
    $('#lightmode-iframe').css('width', (winW-FPAD)+'px');
    $('#lightmode-iframe').css('height', (winH-FPAD)+'px');
    $('#lightmode-iframe').css('top', sclT+(FPAD/2)+'px');
    $('#lightmode-iframe').css('left', sclL+(FPAD/2)+'px');


    // close
    // =====

    CTOP = (sclT+(FPAD/2)-25+2)+'px';
    CLEFT = (sclL+winW-(FPAD/2)-100-12)+'px';
    $('#lightmode-close-on').css('top', CTOP);
    $('#lightmode-close-on').css('left', CLEFT);
    $('#lightmode-close-off').css('top', CTOP);
    $('#lightmode-close-off').css('left', CLEFT);

}


function resize() {
    /* This gets called on load and on window resize. It resizes all lightmode 
       elements.
      */

    winH = $(window).height();
    winW = $(window).width();
    docH = $(document).height();
    docW = $(document).width();


    // Ready
    // =====

    $('#lightmode-ready').css('top', (winH-140-18-10)+'px');
    $('#lightmode-ready').css('left', '10px');
    $('#lightmode-ready').mouseover(function() {
        left = $('#lightmode-ready').css('left');
        width = $('#lightmode-ready').width();
        if (left == '10px') 
            end = {top: 10, left: winW-width-10};
        else
            end = {top: winH-140-18-10, left: 10};
        $('#lightmode-ready').animate(end, 'fast');
    });


    // mask
    // ====

    $('#lightmode-mask').css('width', docW+'px');
    $('#lightmode-mask').css('height', docH+'px');


    // panes
    // =====
   
    $('.lightmode-pane').each(function(i, o) {
        /* o is the original object, the .lightmode-pane that is actually in 
           the HTML; i is the index in the 0-indexed array we are looping over.
          */
     
        id = "lightmode-pane-overlay-" + (i+1);

        $("#"+id).height($(o).height());
        $("#"+id).width($(o).width());
        $("#"+id).css('top', $(o).position().top);
        $("#"+id).css('left', $(o).position().left);
        $("#"+id).fadeTo(0, 0.5);

        BORDER = 5;
        $("#"+id+' a').height($(o).height() - (BORDER*2));
        $("#"+id+' a').width($(o).width() - (BORDER*2));


        // Adapt font size to overlay size.
        // ================================
        // I didn't edge-test the font sizes; IE was throwing errors
        // here when the font didn't fit, so if you get a weird IE error
        // and track it down here, then check the edge cases. :^)

        MIN_FONT_SIZE = 8;
        MAX_FONT_SIZE = 120;

        oH = $(o).height();
        room_for_font = (oH - (BORDER*2)) / 2;
        if (room_for_font < MIN_FONT_SIZE) {
            $("#"+id+' a span').html('&nbsp;');
        } else {
            $("#"+id+' a span').html(i+1);

            font_size = Math.min(room_for_font, MAX_FONT_SIZE);
            $("#"+id+' a').css('font-size', font_size+'px');
            
            padtop = room_for_font - (font_size / 2);
            $("#"+id+' a span').css('padding-top', padtop+'px');
        }

    });

    resize_iframe();

}


/****************************************************************************/
/* Main                                                                     */

function main() {
    /* This gets called when the page loads. It creates all the lightmode DOM 
       elements, setting them to their initial display state, and then calls 
       resize.
      */


    // Lightmode 
    // =========
    // All of our DOM elements go in here.

    $('<div id="lightmode"></div>').appendTo($('body'));


    // Ready
    // =====

    $('<div id="lightmode-ready">Ready</div>').appendTo($('#lightmode'));
    $('#lightmode-ready').fadeTo(1000, 0.25);


    // mask
    // ====

    $('<div id="lightmode-mask">&nbsp;</div>').appendTo($('#lightmode'));
    $('#lightmode-mask').fadeTo(0, 0.25);


    // panes
    // =====
 
    $('<div id="lightmode-panes">&nbsp;</div>').appendTo('#lightmode');
    $('.lightmode-pane').each(function(i, o) {
        /* o is the original object, the .lightmode-pane that is actually in 
           the HTML; i is the index in the array we are looping over (0-indexed).
          */
        idx = i + 1; 
        id = "lightmode-pane-overlay-" + idx;
        $( '<div id="' + id + '" '
         + '     class="lightmode-pane-overlay">'
         + '  <a href="' + $(o).attr('run') + '" '
         + '     onclick="return false;"> '
         + '    <span>' + idx + '</span>'
         + '  </a>'
         + '</div>').appendTo($('#lightmode-panes'));

        // event handler
        $('#'+id).click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            to_app($(o).attr('run'));
            return false;
        });
    });


    // iframe
    // ======

    $( '<iframe id="lightmode-iframe" '
     + 'name="lightmode-iframe" '
     + 'frameborder="0"></iframe>').appendTo($('#lightmode'));


    // close
    // =====
    // This is a rollover.

    $( '<a id="lightmode-close-on" class="lightmode-close" '
     + 'href="' + window.location.href + '">'
     + '  <img src="_lib/close-on.gif" /></a>').appendTo('#lightmode');
    $( '<a id="lightmode-close-off" class="lightmode-close" href="">'
     + '  <img src="_lib/close-off.gif" /></a>').appendTo('#lightmode');

    $('#lightmode-close-off').mouseover(function() {
        if (STATE == READY) return; // account for the moment after clicking
        $('#lightmode-close-off').hide();
        $('#lightmode-close-on').show();
    });
    $('#lightmode-close-on').mouseout(function() {
        if (STATE == READY) return; // account for the moment after clicking
        $('#lightmode-close-on').hide();
        $('#lightmode-close-off').show();
    });
    $('#lightmode-close-on').click(function() {
        window.location.reload(); // doing this here because #frag breaks link
    });


    // Get going
    // =========

    $(window).resize(resize);
    $(window).scroll(resize_iframe);
    resize();
    to_ready();

}


/****************************************************************************/
/* Keyboard event handlers (mouse events are in main)                       */

SUPPRESS_OVERLAY = false;
SUPPRESS_READY = false;

$(document).keydown(function (e) {
    if (e.keyCode == 27) {
        e.stopPropagation();
        e.preventDefault();
        if (STATE == READY) {
            to_overlay();
        }
    }
});

$(document).keyup(function (e) {
    if (e.keyCode == 27) {
        e.stopPropagation();
        e.preventDefault();
        if (STATE == OVERLAY) {
            to_ready();
        }
    } 
});



/****************************************************************************/
/* Book 'em, Danno!                                                         */

$(document).ready(main);

