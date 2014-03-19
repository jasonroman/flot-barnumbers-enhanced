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
                yOffset: 0,
                xOffset: 0
            }
        }
    };

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
            var xAlign, yAlign, horizontalShift, i, minThreshold = 0;

            if (series.bars.horizontal)
            {
                xAlign = series.bars.numbers.xAlign || function(x) { return x / 2; };
                yAlign = series.bars.numbers.yAlign || function(y) { return y + (series.bars.barWidth / 2); };
                horizontalShift = 0;
            }
            else
            {
                xAlign = series.bars.numbers.xAlign || function(x) { return x + (series.bars.barWidth / 2); };
                yAlign = series.bars.numbers.yAlign || function(y) { return y / 2; };
                horizontalShift = 1;
            }

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
                minThreshold = Math.max.apply(Math, points) * series.bars.numbers.threshold;
            }

            // determine how to shift the number values on the axes - not very useful
            var shiftX  = typeof xAlign === 'number' ? function(x) { return x; } : xAlign;
            var shiftY  = typeof yAlign === 'number' ? function(y) { return y; } : yAlign;

            // axes and hs are used for shifting x/y values in case this is a horizontal bar chart
            var axes = {
                0 : 'x',
                1 : 'y'
            };

            // draw each bar value, either above or below the chart
            for (i = 0; i < points.length; i += series.datapoints.pointsize)
            {
                var text;
                var xOffset = series.bars.numbers.xOffset;
                var yOffset = series.bars.numbers.yOffset;
                var barNumber = i + horizontalShift;

                // decide whether the numbers should be above/below the bar when thresholding
                // the hard-set 5 and 3 below are extra padding to even out the above/below shifts
                if (series.bars.numbers.threshold)
                {
                    // for horizontal, move numbers to the left if greater than the threshold
                    if (series.bars.horizontal && points[barNumber] >= minThreshold) {
                        xOffset = (xOffset * -1) - 5;
                    }
                    // for vertical, move numbers above the chart if less than the threshold
                    else if (!series.bars.horizontal && points[barNumber] < minThreshold)
                    {
                        yOffset = (yOffset * -1) + 3;
                        ctx.textBaseline = 'bottom';
                    }
                    else if (!series.bars.horizontal) {
                        ctx.textBaseline = 'top';
                    }
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
                    point[axes[horizontalShift]] = (points[barNumber] - series.data[i/3][horizontalShift] / 2);
                    text = series.data[i/3][horizontalShift];
                }

                // display the value, and add the bar offset if specified
                var c = plot.p2c(point);

                // format the number if defined
                if ($.isFunction(series.bars.numbers.formatter)) {
                    text = series.bars.numbers.formatter(text);
                }

                ctx.fillText(text.toString(10), c.left + offset.left + xOffset, c.top + offset.top + yOffset);
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
