/*
* font showcase with zoom and pan
* copyright 2019 tanakazuhiko
* powered by d3.js
*/
var path = "../setting.json";
var api_url = "https://www.googleapis.com/webfonts/v1/webfonts?key=";
var css_url = "https://fonts.googleapis.com/css?display=swap&family=";
var string1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var string2 = "abcdefghijklmnopqrstuvwxyz";
var string3 = "1234567890";
var string4 = '!"#$%&' + "'()*+,-./:;<=>?@[\]^_`{|}~";
var string5 = "あいうえおかきくけこ";
var string6 = "アイウエオカキクケコ";
var string7 = "祇辻飴葛蛸鯖鰯噌庖箸";
var br = "<br>";
var quote = "'";
var double_quote = '"';
var space = " ";
var plus = "+";
var none = "";
var pre_c = "c_";
var style_start = '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=';
var style_end = '">';
var css_start = '.wf-';
var css_mid = ' { font-family: "';
var css_end = '"; }';
var div_start = "<div>";
var div_end = "</div>";
var div_head = "<div class='head'>";
var div_src = "<div class='src'>";
var span_start = "<span>";
var span_end = "</span>";
var pre_start = "<pre>";
var pre_end = "</pre>";
var span_head = "<span class='head'>";
var span_small = "<span class='small'>";
var span_normal = "<span class='normal'>";
var span_bold = "<span class='bold'>";
var span_italic = "<span class='italic'>";
var span_bold_italic = "<span class='bold italic'>";
var str_small = "[font-weight: small]"
var str_normal = "[font-weight: normal]"
var str_bold = "[font-weight: bold]"
var str_italic = "[font-style: italic]"
var str_bold_italic = "[font-weight: bold; font-style: italic]"
var str_html = "[html]";
var str_css = "[css]";
var offset = 50;
var offset_x = 20;
var start_x = 450;
var duration_sort = 1600;
var zoom_from = 0.01;
var zoom_to = 10000;
var weight_light = 100;
var weight_normal = 400;
var weight_bold = 900;
var key;
var width, height;
var svg, zoom;
var x, xAxis, gX, y, yAxis, gY;
var device, google;
var dataset = [];
var g_family, family, g_sample, sample, help_msg;
var e_tab, e_family, e_sample, e_fade, e_msg;
var count_array = [];

// api key
d3.json(path).then(
    function(data){
        // google font
        d3.json(api_url + data.key).then(
            function(google){
                // init
                init(google.items);
                // axis
                axis();
                // dataset
                dataset = filter(google.items, string2.slice(0,1));
                // css
                css(dataset);
                // draw
                draw(dataset);
                // zoom
                initZoom();
                // reset
                resetted();
                // family
                listenFamily(dataset);
                // tab
                e_tab.forEach(function(item, index) {
                    item.addEventListener("change", function() {
                        remove();
                        if(this.id == "help") {
                            help(dataset);
                            resetted();
                        } else {
                            dataset = filter(google.items, this.id);
                            css(dataset);
                            draw(dataset);
                            initZoom();
                            resetted();
                            listenFamily();
                        }
                    });
                });
                // fade
                e_fade.onclick = function() {
                    e_fade.style.visibility = "hidden";
                    e_msg.style.visibility = "hidden";
                }
            }
        )
    }
);

// init
function init(items) {
    // window
    width = window.innerWidth - offset_x;
    height = window.innerHeight;

    // element
    e_tab = document.querySelectorAll(".tab-switch");
    e_fade = document.getElementById("fade_layer");
    e_msg = document.getElementById("msg");

    // count
    items.forEach(function(v, i) {
        var family = v.family.slice(0, 1);
        if(!count_array[family]) {
            count_array[family] = 1;
        } else {
            count_array[family]++;
        }
    });

    var alphabet = string1.split("");
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
}

// initZoom
function initZoom() {
    zoom = d3
    .zoom()
    .scaleExtent([zoom_from, zoom_to])
    .on("zoom", zoomed);

    svg.call(zoom);

    var zoom2 = d3
    .zoomIdentity
    .translate(width / 2, height / 2)
    .scale(10)
    .translate(-7000, -1000);

    svg.call(zoom.transform, zoom2);
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
    .attr("id", function(d) { return d.family; })
    .style("font-family", function(d) { return quote + d.family + quote; })
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
    .attr("id", function(d) { return pre_c + d.family; })
    .style("font-family", function(d) { return quote + d.family + quote; })
    .attr("x", function(d) { return start_x + offset; })
    .attr("y", function(d, i) { return (i+1) * offset; })
    .text(function(d) { return string1 + space + string2 + space + string3; });
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
    .call(zoom.transform, d3.zoomIdentity);
}

// remove
function remove() {
    font_family.remove();
    font_sample.remove();
    if(help_msg) help_msg.remove();
    e_fade.style.visibility = "hidden";
    e_msg.style.visibility = "hidden";
}

// family
function listenFamily(dataset) {
    string = string1 + br + string2 + br + string3;
    // family
    e_family = document.querySelectorAll(".family");
    e_family.forEach(function(item, index) {
        item.addEventListener("click", function() {
            showVariations(dataset, this.id);
        });
    });
    // sample
    e_sample = document.querySelectorAll(".sample");
    e_sample.forEach(function(item, index) {
        item.addEventListener("click", function() {
            showVariations(dataset, this.id.replace(pre_c, none));
        });
    });
}

// showVariations (swiper)
function showVariations(dataset, family) {
    var swiper_wrapper = document.getElementById("swiper-wrapper");
    dataset.forEach(function(item, index) {
        showVariation(swiper_wrapper, item.family);
    });
    // swiper
    var swiper = new Swiper('.swiper-container', {
        effect: 'coverflow',
        // grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows : true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
    e_fade.style.visibility = "visible";
    e_msg.style.visibility = "visible";
}

// showVariation
function showVariation(swiper_wrapper, family) {
    var div, style, lower, str;

    style = style_start + family.replace(/ /g, plus) + style_end;
    style = style.replace(/</g,'&lt;').replace(/>/,'&gt;');
    lower = family.replace(/ /g, none).toLowerCase();
    str = div_head + family + div_end;
    str += span_head + str_normal + span_end + br;
    str += span_normal + string + span_end + br;
    str += span_head + str_bold + span_end + br;
    str += span_bold + string + span_end + br;
    str += span_head + str_italic + span_end + br;
    str += span_italic + string + span_end + br;
    str += span_head + str_bold_italic + span_end + br;
    str += span_bold_italic + string + span_end + br;
    str += div_src + style + br;
    str += css_start + lower + css_mid + family + css_end + div_end;

    div = document.createElement("div");
    div.setAttribute("class", "swiper-slide");
    div.style.fontFamily = quote + family + quote;
    div.innerHTML = str;
    swiper_wrapper.appendChild(div);
}

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

// help
function help(dataset) {
    var random = Math.floor(Math.random() * dataset.length);

    var textArray = [
        "[操作方法]",
        "ドラッグ：位置移動",
        "ダブルクリック：ズーム・イン",
        "シフト＋ダブルクリック：ズーム・アウト",
        "ホイール：ズーム・イン／アウト",
        "クリック：フォントバリエーション表示",
        "",
        "[usage]",
        "drag: move",
        "double click: zoom in",
        "shift + double click: zoom out",
        "scroll: zoom in/out",
        "click: show font variation",
        "",
        "[HOMAGE TO A TYPEFACE]",
        "designed and developed by tanakazuhiko, 2019",
        "powered by d3.js",
        "https://github.com/tanakazuhiko/font-family",
        "",
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
