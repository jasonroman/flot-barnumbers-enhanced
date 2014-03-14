flot-barnumbers-enhanced
========================

Enhanced version of the [flot-barnumbers plugin](https://github.com/joetsoi/flot-barnumbers) by Joe Tsoi for [Flot](http://www.flotcharts.org) with additional options.  The base plugin draws bar chart values on each bar (centered horizontally and vertically by default).  This plugin offers additional options for formatting the numbers, changing the font/color, using a threshold to determine whether to display the numbers above or below the bar, and a pixel-based vertical offset.

This project stemmed from needing a few features that the original plugin did not provide:

* **Issue:** Since the numbers were drawn directly on the graph image, the font could not be altered
* **Solution:** Use the *font* and *fontColor* options to modify the font

* **Issue:** Another issue with the numbers being drawn on the image was that there was no way to format the numbers
* **Solution:** You may define a function and set the *formatter* option to that function, which will pass it the value of the number, which can then be formatted however is needed

* **Issue:** If the bar itself was very small, the label would overlap the bar.
* **Solution:** The *threshold* feature allows values at a certain percentage to display above the bar rather than trying to display inside of it.  This should be a percentage value (such as 0.25) combined with a *yAlign* value of 0 and a *yOffset* value (in pixels) if you want some spacing so that the number is not directly on the bar line.

View the <a href="http://jasonroman.github.io/flot-barnumbers-enhanced/example.html">example page</a> to see these new features of the plugin in action.

---

Specifying for all series:

    series: {
        bars: {
            numbers : {
                show:       boolean - enable or disable the numbers on the bars
                formatter:  function - formats the value - leave out of options to display as is
                font:       font - font specification of the number
                fontColor:  colorspec - color of the number
                xAlign:     number or function (default) - x-value transform in pixels or as a function
                yAlign:     number or function (default) - y-value transform in pixels or as a function
                threshold:  float|false - percentage of maximum chart value with which to display numbers above the chart
                yOffset:    integer - number of pixels of additional vertical offset to apply to each number
            }
        }
    }

Specifying for a single series:

    $.plot($("#placeholder"), [{
        data: [ ... ],
        bars: { numbers: { ... }, ... }
    }])


The specifications and description of each option are listed above.  Here are some specific examples of usage:

**Using the number formatter to add a '$' sign in front of each value:**

    var barnumberFormatter = function(value) {
        return '$' + value;
    }

    $.plot('#plot', [{
        data: [ ... ],
        bars: { 
            numbers: {
                show: true,
                formatter: barnumberFormatter
            }
        }
    ]);

**Using the font feature to alter the font, size, and color of the numbers:**

    $.plot('#plot', [{
        data: [ ... ],
        bars: { 
            numbers: {
                show: true,
                font: '14pt Arial',
                fontColor: '#FF0000'
            }
        }
    ]);

**Using the threshold feature to display values above the bar at a specific percentage threshold:**

    $.plot('#plot', [{
        data: [ ... ],
        bars: { 
            numbers: {
                show: true,
                // all 3 of the following values should be set when using threshold
                yAlign: 0, // shows numbers at the top of the bar, set to 0
                threshold: 0.50, // any value lower than 50% of the maximum data point will display above the bar
                yOffset: 5 // pixel offset so numbers are not right up on the edge of the top of the bar
            }
        }
    ]);
