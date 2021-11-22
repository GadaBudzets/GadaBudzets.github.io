var nb_sliders = 11; // nb of range sliders
var moving_id = null; // id of the moved slider
var oldValue = []; // previous values of the sliders
var names = ["Sociālā aizsardzība(SA)", "Dotācijas pašvaldībām(DP)", "Veselība(V)", "Izglītība,zinātne,sports un kultūra(IZSK)", "Aizsardzība(A)", "Sabiedriskā kārtība un drošība(SKD)", "Valsts parāda apkalpošana un iemaksas ES budžetā(VPA)", "Ekonomiskā darbība(ED)", "Pārējie izdevumi(PI)", "Valsts Prezidenta kanceleja(VPK)", "Vides aizsardzība(VA)"];
var shortnames = ["SA", "DP", "V", "IZSK", "A", "SKD", "VPA", "ED", "PI", "VPK", "VA"];
var defaultValues = [38, 16, 12, 9, 6, 5, 5, 5, 2, 1, 1];
var twitterValues = [];//recieves input values from twitter links if they exist
// pie chart radius
var radius = 180;
var total = 100;
let budget_total = 7200000000
// setup the margins so we don't clip the outter labels
var margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 175
};
var canvasWidth = radius * 2 + margin.left + margin.right,
    canvasHeight = radius * 2 + margin.top + margin.bottom;

function populateUrl() {
    var url = "https://gadabudzets.lv?";//todo pievienot 'url.com?'
    var tweetButton = document.querySelector('.twitter-hashtag-button');
    for (let i = 0; i <= 10; i++) {
        url = url + "&t" + i + "=" + oldValue[i];
    }
    //document.getElementById("#twitterBlock").style.display = "block";
    document.getElementById("twitterBlock").style.width = "auto";
    // document.getElementById("twitterBlock").classList.add('full');
    // $('#showTwitter').click(function () {
    //document.getElementById("#b").setAttribute('href', url);
    // });
    //twitterblock.style.display = "block";
    //tweetButton.setAttribute('href', url);
    console.log(url);
    if (!document.getElementById("twitterBlock").classList.contains('full')) {

        twttr.widgets.createShareButton(
            url,
            document.getElementById("twitterBlock"),
            {
                size: "large",
                text: "Check out my example of the budget of 2022",
                hashtags: "budžets2022",
                //url: url,
                //related: "twitterapi,twitter"
            }
        );
        document.getElementById("twitterBlock").classList.add('full');
    }
    document.getElementById("facebookBlock").classList.remove('css--display-none');
    $("#facebookBlock").data( "href",url);
}

$(document).ready(function () {

    $(window).resize(function () {
        var cw = $('#canvas').width();
        $("#pie svg").width(cw);
        $("#mainG").attr({"transform": 'translate(' + cw / 2 + ',' + canvasHeight / 2 + ')'});
        if ($("#pie svg").width() <= 470) {
            $('.slices').css('transform', 'scale(' + 0.6 + ')');
            $(".labels").css('transform', 'scale(' + 0.6 + ')');
            $(".lines").css('transform', 'scale(' + 0.6 + ')');
        } else {
            $('.slices').css('transform', 'scale(' + 1 + ')');
            $(".labels").css('transform', 'scale(' + 1 + ')');
            $(".lines").css('transform', 'scale(' + 1 + ')');
        }
    });
});

//var color = d3.scale.category10();
var color = d3.scale.category10();
var colors = ["#00545A", "#00757B", "#14263E", "#028C92", "#21ABB1", "#4F6179", "#16ACCA", "#2FC5E3", "#889AB2", "#8FD1DE", "#BDE1E8"];

// center legend
// var legendData = [{
//   label: "Sample",
//   value: 300,
//   content: "img/euro-gold.svg"
// }, {
//   label: "Total People",
//   value: 7200000
// }]

var pi = Math.PI; // 3.14

// pie chart config
var pie = d3.layout.pie()
    .value(function (d) {
        return d.value;
    })
    .sort(null);

// arc object
var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius / 3);

// My slider
var range = $('.input-range'),
    value = $('.range-value');
value.html(range.attr('value'));

range.on('input', function () {
    value.html(this.value);
    showHelp();
});

$(document).ready(function () {
    init();
    var cw = $('#canvas').width();
    $("#pie svg").width(cw);
    $("#mainG").attr({"transform": 'translate(' + cw / 2 + ',' + canvasHeight / 2 + ')'});

    if ($("#pie svg").width() < 470) {
        $('.slices').css('transform', 'scale(' + 0.6 + ')');
        $(".labels").css('transform', 'scale(' + 0.6 + ')');
        $(".lines").css('transform', 'scale(' + 0.6 + ')');
    } else {
        $('.slices').css('transform', 'scale(' + 1 + ')');
        $(".labels").css('transform', 'scale(' + 1 + ')');
        $(".lines").css('transform', 'scale(' + 1 + ')');
    }
    setTimeout(() => {
        changeValuesReal()
    }, 500);
});

// initialize the sliders, events and pie chart
function init() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    if (url.searchParams.get("t1")) {
        for (let i = 0; i <= 10; i++) {
            twitterValues[i] = url.searchParams.get("t" + i);
            defaultValues[i] = twitterValues[i];
        }
    }

    oldValue = [];
    moving_id = null;


    d3.select('#rangebox tbody').html('');

    // append sliders to table
    for (i = 0; i < nb_sliders; i++) {
        var tr = d3.select('#rangebox tbody').append('tr').attr('class', 'd-flex flex-column flex-md-row');

        tr.append('td')
            .attr('id', 'row' + i)
            .attr('class', 'edit ')
            .attr('bgcolor', colors[i])
            .attr('contenteditable', false)
            .text(names[i]);


        tr.append('td')
            .attr('class', 'slider')

            .append('input')
            .attr('type', 'range')
            .attr('data-id', i)
            .attr('id', i + "input")
            .attr('data-type', 'single')
            .attr('class', 'range js-range-slider')
            .attr('value', defaultValues[i])
            .attr('default', defaultValues[i]);
    }

    $(function () {
        $('.js-range-slider').ionRangeSlider({
            type: "single",
            step: 1,
            min: 0,
            max: total,
            skin: "round",
            grid: "true",
            grid_num: 2,
            prefix: "€",
            postfix: "Milj",
            onChange: function (data) {
                document.getElementById(data.input[0].id).value = data.from;
                var inputField = document.getElementById(data.input[0].id);
                inputField.value = parseInt(inputField.value);
                if (inputField.value < 0) inputField.value = 0;
                else if (inputField.value > total) inputField.value = total;

                var id = d3.select(inputField).attr('data-id');
                moving_id = id;

                var old_value = oldValue[moving_id];
                console.log(oldValue[moving_id])
                var new_value = inputField.value;
                var delta = (new_value - old_value) / (nb_sliders - 1);
                d3.selectAll('#rangebox .range').each(function () {
                    var r_id = d3.select(this).attr('data-id');
                    var r_val = this.value;
                    if (r_id != moving_id && r_val > delta) {
                        var equalized = parseInt(r_val - delta);
                        this.value = equalized;
                        var instance = $("#" + r_id + "input").data("ionRangeSlider");
                        instance.update({
                            from: equalized
                        });
                        oldValue[r_id] = this.value;
                    }
                });
                oldValue[moving_id] = new_value;

                equalize();
                updatePieChart();
              changeValuesReal()
            },
            onStart: function () {
               

            },
        });
    })

    d3.selectAll('#rangebox .range').each(function () {
        this.value = defaultValues[d3.select(this).attr('data-id')];//sets default values
        oldValue[d3.select(this).attr('data-id')] = this.value;
    });

    equalize();
    pieChart();
    seteditboxcolor();

    d3.selectAll('.edit').on('input', function () {
        updateLabels();
    });
}

// set edit box color to match slice color
function showHelp() {
    // use jQuery to target h5 edit boxes)
    $(document).ready(function () {
        $('h5').css({"opacity": ".4"});
        $('#pieImage').css({"display": "none"});
    });
}

// set edit box color to match slice color
function seteditboxcolor() {
    var mycolors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    var editboxes = d3.selectAll('.edit')
        .data(mycolors)
        .attr('bgcolor', function (d) {
            return colors[d];
        })
}


// get JSON data from sliders
function getData() {
    var json = [];
    d3.selectAll('#rangebox .range').each(function () {

        json.push({
            label: d3.select(this.parentNode.parentNode)
                .select('td:first-child')
                .text(),
            value: this.value
        });
    });
    return json;
}

// compute total percentage from sliders
function getTotal() {
    var total = 0;
    d3.selectAll('#rangebox .range').each(function () {
        total = total + parseInt(this.value);
    });
    return total;
}

// equalize the sliders (decimal delta)
function equalize() {
    var remaining = total - getTotal();
    if (remaining != 0) {
        var to_eq = null;
        var min = null;
        var max = null;
        var min_value = 9999;
        var max_value = 0;


        d3.selectAll('#rangebox .range').each(function () {
            var id = d3.select(this).attr('data-id');

            if (id != moving_id) {
                if (parseInt(this.value) > parseInt(max_value)) {
                    max_value = this.value;
                    max = this;
                }
                if (parseInt(this.value) < parseInt(min_value)) {
                    min_value = this.value;
                    min = this;
                }
            }
        });

        if (remaining > 0) to_eq = min;
        else to_eq = max;

        if (to_eq) {
            if (remaining > 0) {
                to_eq.value = parseInt(to_eq.value) + 1;
                remaining = remaining - 1;
            } else {
                to_eq.value = parseInt(to_eq.value) - 1;
                remaining = remaining + 1;
            }
            oldValue[d3.select(to_eq).attr('data-id')] = to_eq.value;
            if (remaining != 0) equalize();
        }
    }
}

// draw pie chart
function pieChart() {
    var json = getData();

    var canvaCenterX = (radius * 2 + margin.left + margin.right) / 2;
    var canvaCenterY = (radius * 2 + margin.top + margin.bottom) / 2;

    d3.select("#pie svg").remove();

    // svg canvas
    var svg = d3.select("#pie")

        .append("svg:svg")
        //.attr("id", "svgCanvas")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)

        .append("svg:g")
        .attr("id", "mainG")
        .attr("transform", "translate(" + canvasWidth / 2 + "," + canvasHeight / 2 + ")")

    // create the classes under the transform
    d3.select("g")
        .append("g")
        .attr("class", "slices");

    d3.select("g")
        .append("g")
        .attr("class", "labels");

    d3.select("g")
        .append("g")
        .attr("class", "lines");

    d3.select("g")
        .append("g")
        .attr("class", "legend")
        .append("image")
        .attr("xlink:href", "img/euro.svg")
        .attr("width", 140)
        .attr("x", 0)
        .attr("height", 140);


    // group all ther paths into the slices class
    var arcpaths = svg.select(".slices").selectAll("path").data(pie(getData()))

    // render the slices
    arcpaths.enter()

        .append('svg:path')
        .attr("class", "slice")
        .attr("fill", function (d, i) {
            return colors[i];
        })


        .attr("d", arc)
        .each(function (d) {
            this._current = d;
        })
        .append('title')
        .text(function (d, i) {
            return '€' + json[i].value + 'M';
        });

    // group all ther paths into the slices class
    var arclabels = svg.select(".labels").selectAll("label").data(pie(getData()))

    // render the labels
    arclabels.enter()

        .append("svg:text")
        .attr("class", "label")
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d, i) {
            if (json[i].value > 1) {
                return shortnames[i];
            } else return null;
        });
}

// update pie chart
function updatePieChart() {
    updateArcs();
    updateLabels();
    updateLabelLines();

}

// update the slices of the pie chart
function updateArcs() {
    var json = getData();

    d3.selectAll("#pie path title")
        .text(function (d, i) {
            return json[i].value + '%';
        });

    d3.selectAll("#pie path")
        .data(pie(json))
        .transition()
        .duration(100)
        .attrTween('d', arcTween);
}

/* ------- TEXT LABELS -------*/

// update the labels of the pie chart
function updateLabels() {
    labelr = radius + 40 // radius for label anchor
    d3.selectAll("#pie text")
        .data(pie(getData()))
        .transition()
        .duration(120)

        .attr("transform", function (d) {
            var c = arc.centroid(d),
                x = c[0],
                y = c[1],
                // pythagorean theorem for hypotenuse
                h = Math.sqrt(x * x + y * y);
            return "translate(" + (x / h * labelr) + ',' +
                (y / h * labelr) + ")";
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) {
            // are we past the center?
            return (d.endAngle + d.startAngle) / 2 > Math.PI ?
                "end" : "start";
        })

        //.text(function(d, i) { return d.value.toFixed(2); });
        .text(function (d, i) {
            if (getData()[i].value > 0) return shortnames[i];
            else return null;
        });
}

/* ------- SLICE TO TEXT POLYLINES -------*/

var outerArc = d3.svg.arc()
    .innerRadius(radius + 50)
    .outerRadius(radius * .95);

function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

function updateLabelLines() {
    var polyline = d3.select(".lines").selectAll("polyline")
        .data(pie(getData()));

    //alert("I am an alert box!");

    polyline.enter()
        .append("polyline")

    polyline.transition()
        .duration(100)
        .attrTween("points", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
                var d2 = interpolate(t);
                var pos = 0; // outerArc.centroid(d2);
                // pos[0] = radius * .95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2)];
            };
        });

    polyline.exit()
        .remove();
}

// transition for the arcs
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function (t) {
        return arc(i(t));
    };
}

function changetoEur() {
    var all = $(".irs-single").map(function () {
        let string = this.innerText;
        let lenght = string.length
        let substring = string.substring(1, lenght - 4);
        substring = parseInt(substring);
        let new_text = "€" + (((budget_total * substring) / 100) / 1000000).toLocaleString() + "Milj";
        this.innerHTML = new_text
    }).get();
}

function changeMax() {
    var all = $(".irs-max").map(function () {
        this.innerHTML = "€" + budget_total/1000000 + "Milj"
    }).get();
}

function changeValuesReal() {
  changetoEur();
  changeMax();
}
