/*
* font showcase with zoom and pan
* copyright 2019 tanakazuhiko
* powered by d3.js
*/
var path = "../setting.json";
var api_url = "https://www.googleapis.com/webfonts/v1/webfonts?key=";
var css_url = "https://fonts.googleapis.com/css?display=swap&family=";
var string1 = "abcdefghijklmnopqrstuvwxyz";
var string2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var string3 = "1234567890";
var string4 = '!"#$%&' + "'()*+,-./:;<=>?@[\]^_`{|}~";
var string5 = "あいうえおかきくけこ";
var string6 = "アイウエオカキクケコ";
var string7 = "祇辻飴葛蛸鯖鰯噌庖箸";
var offset = 50;
var offset_x = 20;
var start_x = 450;
var duration_sort = 1000;
var zoom_from = 0.01;
var zoom_to = 10000;
var key;
var width, height;
var svg, zoom;
var x, xAxis, gX, y, yAxis, gY;
var device, google;
var dataset = [];
var g_family, family, g_sample, sample, help_msg;
var e_tab;
var count_array = [];

// api key
d3.json(path).then(
    function(data){
        // google font
        d3.json(api_url + data.key).then(
            function(google){
                init(google.items);
                axis();
                // dataset = device.concat(google.items);
                dataset = filter(google.items, "A");
                css(dataset);
                draw(dataset);

                // tab
                e_tab.forEach(function(item, index) {
                    item.addEventListener("change", function() {
                        resetted();
                        if(this.id == "help") {
                            help(dataset);
                        } else {
                            dataset = filter(google.items, this.id);
                            css(dataset);
                            draw(dataset);
                        }
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

// init
function init(items) {
    // window
    width = window.innerWidth - offset_x;
    height = window.innerHeight;

    // element
    e_tab = document.querySelectorAll(".tab-switch");

    // count
    items.forEach(function(v, i) {
        var family = v.family.slice(0, 1);
        if(!count_array[family]) {
            count_array[family] = 1;
        } else {
            count_array[family]++;
        }
    });

    var alphabet = string2.split("");
    for(var i = 0; i < alphabet.length; i++) {
        var elm = document.getElementById(alphabet[i]);
        var count = !count_array[alphabet[i]] ? 0 : count_array[alphabet[i]];
        elm.nextElementSibling.innerHTML = alphabet[i] + "<span>(" + count + ")</span>";
    }

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
    .scaleExtent([zoom_from, zoom_to])
    .on("zoom", zoomed);

    svg.call(zoom);
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
    .attr("x", function(d) { return start_x; })
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
    .attr("x", function(d) { return start_x + offset; })
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
    svg.selectAll(".help").attr("transform", d3.event.transform);
}

// reset
function resetted() {
    svg
    .transition()
    .duration(duration_sort)
    .call(
        zoom.transform,
        d3.zoomIdentity
    );
    // remove
    font_family.remove();
    font_sample.remove();
    if(help_msg) help_msg.remove();
}

// help
function help(dataset) {
    var random = Math.floor(Math.random() * dataset.length);

    var textArray = [
        "[操作方法]",
        "ドラッグ：位置移動",
        "ダブルクリック：ズーム・イン",
        "シフト＋ダブルクリック：ズーム・アウト",
        "ホイール：ズーム・イン／アウト",
        "",
        "[usage]",
        "drag: move",
        "double click: zoom in",
        "shift + double click: zoom out",
        "scroll: zoom in/out",
        "",
        "[HOMAGE TO A TYPEFACE]",
        "designed and developed by tanakazuhiko, 2019",
        "powered by d3.js",
        "",
        "[github: https://github.com/tanakazuhiko/font-family]",
        "[font-family: " + dataset[random].family + "]"
    ];

    help_msg = svg
    .append("text")
    .attr("class","help")
    .attr("text-anchor","start")
    .attr("transform", "translate(100, 100)")
    .selectAll("tspan")
    .data(textArray)
    .enter()
    .append("tspan")
    .style("font-family", dataset[random].family)
    .attr("x", 100)
    .attr("y", (d, i) => `${i + (i+3) * 0.5}em`)
    .text(d => d );
}
