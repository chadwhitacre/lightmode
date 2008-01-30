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

   There are four states (possible next states listed):

    o ready -- the Ready indicator shows (overlay)
    o overlay -- this is the quasimode, showing available "manageables"
                 (ready, loading)
    o loading -- manageable selected, iframe is loading (ready, loaded)
    o loaded -- iframe is done loading (ready)

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
    $('#lightmode-iframe').attr('src', url);
    $('#lightmode-iframe').show();
    $('#lightmode-close-on').hide();
    $('#lightmode-close-off').show();
}


/****************************************************************************/
/* Resize                                                                   */

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

    $('#lightmode-ready').css('top', (winH-158)+'px');
    $('#lightmode-ready').css('left', '10px');


    // mask
    // ====

    $('#lightmode-mask').css('width', docW+'px');
    $('#lightmode-mask').css('height', docH+'px');


    // panes
    // =====
   
    $('.lightmode-pane').each(function (i, o) {
        /* o is the original object, the .lightmode-pane that is actually in 
           the HTML; i is the index in the array we are looping over (0-indexed).
          */
     
        id = "lightmode-pane-overlay-" + (i+1);

        $("#"+id).height($(o).height());
        $("#"+id).width($(o).width());
        $("#"+id).css('top', $(o).position().top);
        $("#"+id).css('left', $(o).position().left);
        $("#"+id).fadeTo(0, 0.5);

        BORDER = 8;
        $("#"+id+' a').height($(o).height() - BORDER);
        $("#"+id+' a').width($(o).width() - BORDER);

        FONT_SIZE = 120;
        PADTOP = ($(o).height() - FONT_SIZE - BORDER) / 2;
        $("#"+id+' a span').css('padding-top', PADTOP+'px');

    });


    // iframe
    // ======

    FPAD = 100;
    $('#lightmode-iframe').css('width', (winW-FPAD)+'px');
    $('#lightmode-iframe').css('height', (winH-FPAD)+'px');
    $('#lightmode-iframe').css('top', (FPAD/2)+'px');
    $('#lightmode-iframe').css('left', (FPAD/2)+'px');

    // close
    // =====

    CTOP = ((FPAD/2)-25+2)+'px';
    CLEFT = (winW-(FPAD/2)-100-12)+'px';
    $('#lightmode-close-on').css('top', CTOP);
    $('#lightmode-close-on').css('left', CLEFT);
    $('#lightmode-close-off').css('top', CTOP);
    $('#lightmode-close-off').css('left', CLEFT);


    // loading
    // =======

    $('#lightmode-loading').css('top', ((winH/2)-8)+'px');
    $('#lightmode-loading').css('left', ((winW/2)-40)+'px');

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
    $('#lightmode-ready').fadeTo(2000, 0.25);


    // mask
    // ====

    $('<div id="lightmode-mask">&nbsp;</div>').appendTo($('#lightmode'));
    $('#lightmode-mask').fadeTo(0, 0.25);


    // panes
    // =====
 
    $('<div id="lightmode-panes">&nbsp;</div>').appendTo('#lightmode');
    $('.lightmode-pane').each(function (i, o) {
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

    $( '<a id="lightmode-close-on" class="lightmode-close" href="">'
     + '  <img src="/_lib/close-on.gif" /></a>').appendTo('#lightmode');
    $( '<a id="lightmode-close-off" class="lightmode-close" href="">'
     + '  <img src="/_lib/close-off.gif" /></a>').appendTo('#lightmode');

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
    $('#lightmode-close-on').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        to_ready();
        return false;
    });


    // loading
    // =======

    $( '<img src="/_lib/loading.gif" ' 
     + '     id="lightmode-loading" />').appendTo('#lightmode');


    // Get going
    // =========

    //$("lightmode-iframe").attr('src', 'http://www.zetadev.com/');
    resize();
    to_ready();

}


/****************************************************************************/
/* Some event handlers (others are in main)                                 */

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

$(document).keypress(function (e) {
    if (e.keyCode == 27) {
        e.stopPropagation();
        e.preventDefault();
       // if (STATE == LOADING || STATE == LOADED) {
       //     to_ready();
       // }
    }
});


$(window).resize(resize);

$(document).ready(main);
