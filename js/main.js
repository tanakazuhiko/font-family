/*
* font showcase with zoom and pan
* copyright 2019 tanakazuhiko
* powered by d3.js
*/
var path = "../data/fonts.json";
var api_url = "https://www.googleapis.com/webfonts/v1/webfonts?key=";
var css_url = "https://fonts.googleapis.com/css?display=swap&family=";
var key = "AIzaSyA6-eEkxuV9gyegYhvPjcok-p-fqchrg9c";
var string1 = "abcdefghijklmnopqrstuvwxyz";
var string2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var string3 = "1234567890";
var string4 = '!"#$%&' + "'()*+,-./:;<=>?@[\]^_`{|}~";
var string5 = "あいうえおかきくけこ";
var string6 = "アイウエオカキクケコ";
var string7 = "祇辻飴葛蛸鯖鰯噌庖箸";
var offset = 50;
var width = window.innerWidth;
var height = window.innerHeight;
var svg, zoom;
var x, xAxis, gX, y, yAxis, gY;
var device, google;
var dataset = [];
var g_family, family, g_sample, sample;
var e_tab;

// device font
d3.json(path).then(
    function(device){
        // google font
        d3.json(api_url + key).then(
            function(google){
                init();
                axis();
                // dataset = device.concat(google.items);
                dataset = filter(google.items, "A");
                css(dataset);
                draw(dataset);

                // tab
                e_tab.forEach(function(item, index) {
                    item.addEventListener("change", function() {
                        font_family.remove();
                        font_sample.remove();

                        dataset = filter(google.items, this.id);
                        css(dataset);
                        draw(dataset);
                    });
                });
            }
        )
    }
);

// filter
function filter(items, key) {
    var result = [];
    items.forEach(function(v, i){
        var str = v.family;
        if(str.toUpperCase().startsWith(key.toUpperCase())) {
            result.push(v);
        }
    });
    return result;
}

// css
function css(items) {
    var list = "";
    var link = document.createElement("link");
    var head = document.getElementsByTagName("head")[0];
    items.filter(function(item, index) {
        if(index > 0) list += "|";
        list += item.family.replace(/ /g, "+");
    })
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", css_url + list);
    head.appendChild(link);
}

// init
function init() {
    // window
    width = window.innerWidth - 20;
    height = window.innerHeight;

    // element
    e_tab = document.querySelectorAll(".tab-switch");

    // svg
    svg = d3
    .select("body")
    .append("svg")
    .attr("id", "svg")
    .attr("class", "svg grabbable")
    .attr("width", width)
    .attr("height", height);

    // zoom
    zoom = d3
    .zoom()
    .scaleExtent([0.01, 10000])
    .on("zoom", zoomed);

    svg.call(zoom);

    // reset
    reset = d3
    .select("#resetButton")
    .on("click", resetted);
}

// axis
function axis() {
    // x
    x = d3
    .scaleLinear()
    .domain([0, width])
    .range([0, width]);

    xAxis = d3.axisBottom(x)
    .ticks(width / height * 10)
    .tickSize(height)
    .tickPadding(8 - height);

    gX = svg.append("g").call(xAxis);

    // y
    y = d3
    .scaleLinear()
    .domain([0, height])
    .range([0, height]);

    yAxis = d3.axisRight(y)
    .ticks(10)
    .tickSize(width)
    .tickPadding(8 - width);

    gY = svg.append("g").call(yAxis);
}

// draw
function draw(dataset) {
    // group
    g_family = svg
    .append("g")
    .attr("class", "g_family");

    g_sample = svg
    .append("g")
    .attr("class", "g_sample");

    // family
    font_family = g_family
    .selectAll(".family")
    .data(dataset)
    .enter()
    .append("text")
    .attr("class", "family")
    .style("font-family", function(d) { return d.family; })
    .attr("x", function(d) { return 450; })
    .attr("y", function(d, i) { return (i+1) * offset; })
    .text(function(d) {
        var tmp = d.family;
        var result = "";
        if (tmp.indexOf(",") != -1) {
            var arr = tmp.split(",");
            result = arr[0];
        } else {
            result = d.family;
        }
        return result;
    });

    // sample
    font_sample = g_sample
    .selectAll(".sample")
    .data(dataset)
    .enter()
    .append("text")
    .attr("class", "sample")
    .style("font-family", function(d) { return d.family; })
    .attr("x", function(d) { return 500; })
    .attr("y", function(d, i) { return (i+1) * offset; })
    .text(function(d) { return string2 + " " + string1 + " " + string3; });
}

// zoom
function zoomed() {
    gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
    svg.selectAll(".type").attr("transform", d3.event.transform);
    svg.selectAll(".family").attr("transform", d3.event.transform);
    svg.selectAll(".sample").attr("transform", d3.event.transform);
}

// reset
function resetted() {
    svg
    .transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
}
