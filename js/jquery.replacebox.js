/*
 * jQuery replacebox (jQuery Plugin)
 *
 * Copyright (c) 2010 Tom Shimada
 *
 * Depends Script:
 *	js/jquery.js (1.3.2~)
 */

(function($) {
  $.fn.replacebox = function(configs) {
    var defaults = {
      appendTo: null,
      zIndex: 999,
      handleUp: '.up',
      handleDown: '.down',
      handleOff: true,
      speed: 500,
      easing: 'swing',
      checkFunc: function(){
        return true;
      },
      beforeFunc: null,
      afterFunc: null
    };

    var $replacebox = this;
    if (typeof($replacebox) !== 'object' || $replacebox.length !== 1) return this;

    var $replacechild,
        $replaceboxes = [];

    if (configs) {
      if (typeof(configs) === 'string') {
        if (configs.match(/^_/)) return this;
        try{
          eval(configs)();
        } catch(e) {
          alert(e);
        }
        return this;
      }
      configs = $.extend(defaults, configs);
    } else {
      configs = defaults;
    }

    $.data($replacebox.get(0), 'replacebox-position', false);
    if (!$replacebox.css('position') || $replacebox.css('position') == 'static') {
      $.data($replacebox.get(0), 'replacebox-position', (!$replacebox.css('position')?false:$replacebox.css('position')));
      $replacebox.css('position', 'relative');
    }
    $.data($replacebox.get(0), 'replacebox-configs', configs);
    disable();

    _set();

    function _set() {
      if (configs.appendTo && typeof(configs.appendTo) === 'object' && configs.appendTo.length > 0) {
        $replacechild = configs.appendTo;
      } else {
        $replacechild = $replacebox.children(configs.appendTo);
      }

      $replacechild.each(function(_i){
        var $box = $(this),
            $up = $(configs.handleUp, $box),
            $down = $(configs.handleDown, $box);

        if (_i === 0 && configs.handleOff) {
          $up.css('visibility', 'hidden');
        } else {
          $up.css('visibility', '');
        }
        $up.unbind('click').click(function(){
          _move('up', _i);
          return false;
        });
        if (_i >= $replacechild.length - 1 && configs.handleOff) {
          $down.css('visibility', 'hidden');
        } else {
          $down.css('visibility', '');
        }
        $down.unbind('click').click(function(){
          _move('down', _i);
          return false;
        });

        $replaceboxes.push($box);
      });

      enable();
    }

    function _move(action, _i) {
      if (_getStatus() !== true) return;
      var $from = $replaceboxes[_i],
          $to,
          index = $replacechild.index($from);
      if ($from.length === 0) return;
      switch (action) {
        case 'up':
          if (index === 0) return;
          $to = $($replacechild.get(index - 1));
          break;
        case 'down':
          if (index >= $replaceboxes.length - 1) return;
          $to = $($replacechild.get(index + 1));
          break;
        default:
          return;
      }

      disable();

      if (configs.checkFunc($from, $to, $replacechild, action) !== true) {
        enable();
        return;
      }

      if ($.isFunction(configs.beforeFunc)) configs.beforeFunc($from, $to, $replacechild, action);

      var position_before_from = $from.position(),
          position_before_to = $to.position();
      var $clone_from = $from.clone(true).appendTo($replacebox),
          $clone_to = $to.clone(true).appendTo($replacebox);
      var $move_from = $clone_from.clone(true).replaceAll($to).css('visibility', 'hidden'),
          $move_to = $clone_to.clone(true).replaceAll($from).css('visibility', 'hidden');
      var position_after_from = $move_from.position(),
          position_after_to = $move_to.position();

      $clone_from.css({
        position: 'absolute',
        top: position_before_from.top,
        left: position_before_from.left,
        zIndex: configs.zIndex + 1
      });
      $clone_to.css({
        position: 'absolute',
        top: position_before_to.top,
        left: position_before_to.left,
        zIndex: configs.zIndex
      });

      var moved_from_flg = false,
          moved_to_flg = false;
      $clone_from.animate(
        {
          top: position_after_from.top,
          left: position_after_from.left
        },
        configs.speed,
        configs.easing,
        function() {
          moved_from_flg = true;
          if (moved_to_flg === true) {
            moved_from_flg = false;
            _show($clone_from, $clone_to, $move_from, $move_to, action)
          }
        }
      );
      $clone_to.animate(
        {
          top: position_after_to.top,
          left: position_after_to.left
        },
        configs.speed,
        configs.easing,
        function() {
          moved_to_flg = true;
          if (moved_from_flg === true) {
            moved_to_flg = false;
            _show($clone_from, $clone_to, $move_from, $move_to, action)
          }
        }
      );
    }

    function _show($clone_from, $clone_to, $move_from, $move_to, action) {
      $clone_from.remove();
      $clone_to.remove();
      $move_from.css('visibility', '');
      $move_to.css('visibility', '');
      refresh();
      if ($.isFunction(configs.afterFunc)) configs.afterFunc($move_from, $move_to, $replacechild, action);
    }

    function _getStatus() {
      return $.data($replacebox.get(0), 'replacebox-enabled');
    }

    function _getConfigs() {
      return $.data($replacebox.get(0), 'replacebox-configs');
    }

    function enable() {
      $.data($replacebox.get(0), 'replacebox-enabled', true);
    }

    function disable() {
      $.data($replacebox.get(0), 'replacebox-enabled', false);
    }

    function refresh() {
      if (typeof(configs) === 'string') configs = _getConfigs();
      if (configs === null) return;
      $replacebox = $($replacebox.selector);
      $replaceboxes = [];
      _set();
    }

    function destroy() {
      var configs = _getConfigs(),
          org_position = $.data($replacebox.get(0), 'replacebox-position');
      if (configs === null) return;
      $replacebox.removeData('replacebox-configs').removeData('replacebox-enabled').removeData('replacebox-position');
      if (org_position !== false) {
        $replacebox.css('position', org_position);
      }
      $replacebox.each(function(_i){
        var $box = $(this),
            $up = $(configs.handleUp, $box),
            $down = $(configs.handleDown, $box);
        $up.unbind('click');
        $down.unbind('click');
      });
    }

    return this;
  }
})(jQuery);
