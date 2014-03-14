/**
 * Flot plugin to draw bar chart values on each bar
 *
 * Specifying for all series:
 * 
 * series: {
 *     bars: {
 *         numbers : {
 *             show:       boolean
 *             formatter:  function - formats the value - leave out of options to display as is
 *             xAlign:     number or function (default) - x-value transform in pixels or as a function
 *             yAlign:     number or function (default) - y-value transform in pixels or as a function
 *             yOffset:    integer - number of pixels of additional vertical offset to apply to each number
 *             font:       font - font specification of the number
 *             fontColor:  colorspec - color of the number
 *             threshold:  float|false - percentage of maximum chart value with which to display numbers above the chart
 *         }
 *     }
 * }
 * 
 * The numbers can also be turned on or off for a specific series:
 * 
 *  $.plot($("#placeholder"), [{
 *      data: [ ... ],
 *      bars: { numbers: { ... } }
 *  }])
 * 
 * (c) Daniel Head <head.daniel47@gmail.com>
 * (c) Jason Roman <j@jayroman.com>
 * 
 * Original by Joe Tsoi, FreeBSD-License
 * @link https://github.com/joetsoi/flot-barnumbers
 */
(function($)
{
    "use strict";

    // default each series to have the bar numbers feature turned off
    var options = {
        bars: {
            numbers: {
                show: false,
                threshold: false,
                yOffset: 0
            }
        }
    };

    /**
     * Process the passed-in options and set other options based on chart orientation
     * 
     * @param {function} plot - the Flot plot function
     * @param {Object} options
     */
    function processOptions(plot, options)
    {
        var bw          = options.series.bars.barWidth;
        var numbers     = options.series.bars.numbers;
        var horizontal  = options.series.bars.horizontal;

        if (horizontal)
        {
            numbers.xAlign = numbers.xAlign || function(x) { return x / 2; };
            numbers.yAlign = numbers.yAlign || function(y) { return y + (bw / 2); };
            numbers.horizontalShift = 0;
        }
        else
        {
            numbers.xAlign = numbers.xAlign || function(x) { return x + (bw / 2); };
            numbers.yAlign = numbers.yAlign || function(y) { return y / 2; };
            numbers.horizontalShift = 1;
        }
    }

    /**
     * Draw the bar values on the bars
     * 
     * @param {function} plot - the Flot plot function
     * @param {Object} ctx - CanvasRenderingContext2D for the text rendering
     */
    function draw(plot, ctx)
    {
        // loop through each series
        $.each(plot.getData(), function(index, series)
        {
            var i, minShowBelow = 0;

            // make sure this series should show the bar numbers
            if (!series.bars.numbers.show) {
                return false;
            }

            // variable shortcuts
            var points      = series.datapoints.points;
            var ctx         = plot.getCanvas().getContext('2d');
            var offset      = plot.getPlotOffset();

            // set the text font and color and center it
            ctx.textAlign   = 'center';
            ctx.font        = series.bars.numbers.font;
            ctx.fillStyle   = series.bars.numbers.fontColor;

            // if a percentage threshold is defined, set the value that any plot points below that value
            // will display the value above the bar rather than within the bar
            if (series.bars.numbers.threshold) {
                minShowBelow = Math.max.apply(Math, points) * series.bars.numbers.threshold;
            }

            // determine how to shift the number values on the axes - not very useful
            var xAlign  = series.bars.numbers.xAlign;
            var yAlign  = series.bars.numbers.yAlign;

            var shiftX  = typeof xAlign === 'number' ? function(x) { return x + xAlign; } : xAlign;
            var shiftY  = typeof yAlign === 'number' ? function(y) { return y + yAlign; } : yAlign;

            // axes and hs are used for shifting x/y values in case this is a horizontal bar chart
            var axes = {
                0 : 'x',
                1 : 'y'
            };

            var hs = series.bars.numbers.horizontalShift;

            // draw each bar value, either above or below the chart
            for (i = 0; i < points.length; i += series.datapoints.pointsize)
            {
                var text;
                var barOffset = series.bars.numbers.yOffset;
                var barNumber = i + series.bars.numbers.horizontalShift;

                // decide whether the number should be above or below the chart
                if (series.bars.numbers.threshold && points[barNumber] < minShowBelow)
                {
                    // reverse the offset, but move an extra 3 pixels due to weird ctx 'bottom' padding
                    barOffset = (barOffset * -1) + 3;

                    ctx.textBaseline = 'bottom';
                }
                else {
                    ctx.textBaseline = 'top';
                }

                // get the point where to display the value
                var point = {
                    'x': shiftX(points[i]),
                    'y': shiftY(points[i+1])
                };

                // compatibility with the plugin to stack bars (not using === since plugin sets to null explicitly)
                if (series.stack == null || series.stack === false) {
                    text = points[barNumber];
                }
                // stacked bars
                else
                {
                    point[axes[hs]] = (points[barNumber] - series.data[i/3][hs] / 2);
                    text            = series.data[i/3][hs];
                }

                // display the value, and add the bar offset if specified
                var c = plot.p2c(point);

                // format the number if defined
                if ($.isFunction(series.bars.numbers.formatter)) {
                    text = series.bars.numbers.formatter(text);
                }

                ctx.fillText(text.toString(10), c.left + offset.left, c.top + offset.top + barOffset);
            }
        });
    }

    /**
     * Initialize the hooks on processing the options and drawing the chart
     * 
     * @param {function} plot - the Flot plot function
     */
    function init(plot)
    {
        plot.hooks.processOptions.push(processOptions);
        plot.hooks.draw.push(draw);
    }

    // push as an available plugin to Flot
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'barnumbers-enhanced',
        version: '1.0'
    });

})(jQuery);
