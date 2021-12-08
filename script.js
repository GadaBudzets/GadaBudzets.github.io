var nb_sliders = 11, moving_id = null, oldValue = [],
    names = ["Sociālā aizsardzība(SA)", "Dotācijas pašvaldībām(DP)", "Veselība(V)", "Izglītība,zinātne,sports un kultūra(IZSK)", "Aizsardzība(A)", "Sabiedriskā kārtība un drošība(SKD)", "Valsts parāda apkalpošana un iemaksas ES budžetā(VPA)", "Ekonomiskā darbība(ED)", "Pārējie izdevumi(PI)", "Valsts Prezidenta kanceleja(VPK)", "Vides aizsardzība(VA)"],
    shortnames = ["SA", "DP", "V", "IZSK", "A", "SKD", "VPA", "ED", "PI", "VPK", "VA"], defaultValues = [38, 16, 12, 9, 6, 5, 5, 5, 2, 1, 1], twitterValues = [], radius = 180, total = 100;
let budget_total = 12439000000;
let margin = {top: 100, right: 100, bottom: 100, left: 175}, canvasWidth = 2 * radius + margin.left + margin.right, canvasHeight = 2 * radius + margin.top + margin.bottom;
let global_slider = null;

function populateUrl() {
    var t = "https://gadabudzets.lv?";
    document.querySelector(".twitter-hashtag-button");
    for (let e = 0; e <= 10; e++) t = t + "&t" + e + "=" + oldValue[e];
    document.getElementById("twitterBlock").style.width = "auto", document.getElementById("twitterBlock").classList.contains("full") || (twttr.widgets.createShareButton(t, document.getElementById("twitterBlock"), {
        size: "large",
        text: "Check out my example of the budget of 2022",
        hashtags: "budžets2022"
    }), document.getElementById("twitterBlock").classList.add("full")), document.getElementById("fb-share").classList.remove("css--display-none"), $("#fbsharelink").data("shareurl", t)
}

$(document).ready(function () {
    $(window).resize(function () {
        var t = $("#canvas").width();
        $("#pie svg").width(t), $("#mainG").attr({transform: "translate(" + t / 2 + "," + canvasHeight / 2 + ")"}), $("#pie svg").width() <= 470 ? ($(".slices").css("transform", "scale(0.6)"), $(".labels").css("transform", "scale(0.6)"), $(".lines").css("transform", "scale(0.6)")) : ($(".slices").css("transform", "scale(1)"), $(".labels").css("transform", "scale(1)"), $(".lines").css("transform", "scale(1)"))
    })
});
var color = d3.scale.category10(), colors = ["#00545A", "#00757B", "#14263E", "#028C92", "#21ABB1", "#4F6179", "#16ACCA", "#2FC5E3", "#889AB2", "#8FD1DE", "#BDE1E8"], pi = Math.PI, pie = d3.layout.pie().value(function (t) {
    return t.value
}).sort(null), arc = d3.svg.arc().outerRadius(radius).innerRadius(radius / 3), range = $(".input-range"), value = $(".range-value");

function init() {
    var t = window.location.href, e = new URL(t);
    if (e.searchParams.get("t1")) for (let t = 0; t <= 10; t++) twitterValues[t] = e.searchParams.get("t" + t), defaultValues[t] = twitterValues[t];
    for (oldValue = [], moving_id = null, d3.select("#rangebox tbody").html(""), i = 0; i < nb_sliders; i++) {
        var a = d3.select("#rangebox tbody").append("tr").attr("class", "d-flex flex-column flex-md-row");
        a.append("td").attr("id", "row" + i).attr("class", "edit ").attr("bgcolor", colors[i]).attr("contenteditable", !1).append("div").text(names[i]).append("div").attr("class", "input-group").attr("id","form-control-"+i), a.append("td").attr("class", "slider").append("input").attr("type", "range").attr("data-id", i).attr("id", i + "input").attr("data-type", "single").attr("class", "range js-range-slider").attr("value", defaultValues[i]).attr("default", defaultValues[i]), $("#form-control-"+i).html("<input class='form-control' id='form-control-input"+i+"' value='"+defaultValues[i]+"'><div class='input-group-append'><span class='input-group-text'>%</span></div>")
    }
    $(function () {
        global_slider = $(".js-range-slider").ionRangeSlider({
            type: "single", step: 1, min: 0, max: total, skin: "round", grid: "true", grid_num: 2, prefix: "€", postfix: "Milj", onChange: function (t) {
                document.getElementById(t.input[0].id).value = t.from;
                console.log('123')
                var e = document.getElementById(t.input[0].id);
                e.value = parseInt(e.value), e.value < 0 ? e.value = 0 : e.value > total && (e.value = total);
                var a = d3.select(e).attr("data-id"), n = oldValue[moving_id = a], r = e.value, l = (r - n) / (nb_sliders - 1);
                d3.selectAll("#rangebox .range").each(function () {
                    var t = d3.select(this).attr("data-id"), e = this.value;
                    if (t != moving_id && e > l) {
                        var a = parseInt(e - l);
                        this.value = a, $("#" + t + "input").data("ionRangeSlider").update({from: a}), oldValue[t] = this.value
                    }
                }), oldValue[moving_id] = r, equalize(), updatePieChart(), changeValuesReal(), updateInput()
            }
        })
    }), d3.selectAll("#rangebox .range").each(function () {
        this.value = defaultValues[d3.select(this).attr("data-id")], oldValue[d3.select(this).attr("data-id")] = this.value
    }), equalize(), pieChart(), seteditboxcolor(), d3.selectAll(".edit").on("input", function () {
        updateLabels()
    })
}

function showHelp() {
    $(document).ready(function () {
        $("h5").css({opacity: ".4"}), $("#pieImage").css({display: "none"})
    })
}

function seteditboxcolor() {
    d3.selectAll(".edit").data([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).attr("bgcolor", function (t) {
        return colors[t]
    })
}

function getData() {
    var t = [];
    return d3.selectAll("#rangebox .range").each(function () {
        t.push({label: d3.select(this.parentNode.parentNode).select("td:first-child").text(), value: this.value})
    }), t
}

function getTotal() {
    var t = 0;
    return d3.selectAll("#rangebox .range").each(function () {
        t += parseInt(this.value)
    }), t
}

function equalize() {
    var t = total - getTotal();
    if (0 != t) {
        var e = null, a = null, n = null, r = 9999, l = 0;
        d3.selectAll("#rangebox .range").each(function () {
            d3.select(this).attr("data-id") != moving_id && (parseInt(this.value) > parseInt(l) && (l = this.value, n = this), parseInt(this.value) < parseInt(r) && (r = this.value, a = this))
        }), (e = t > 0 ? a : n) && (t > 0 ? (e.value = parseInt(e.value) + 1, t -= 1) : (e.value = parseInt(e.value) - 1, t += 1), oldValue[d3.select(e).attr("data-id")] = e.value, 0 != t && equalize())
    }
}

function pieChart() {
    var t = getData();
    margin.left, margin.right, margin.top, margin.bottom;
    d3.select("#pie svg").remove();
    var e = d3.select("#pie").append("svg:svg").attr("width", canvasWidth).attr("height", canvasHeight).append("svg:g").attr("id", "mainG").attr("transform", "translate(" + canvasWidth / 2 + "," + canvasHeight / 2 + ")");
    d3.select("g").append("g").attr("class", "slices"), d3.select("g").append("g").attr("class", "labels"), d3.select("g").append("g").attr("class", "lines"), d3.select("g").append("g").attr("class", "legend").append("image").attr("xlink:href", "img/euro.svg").attr("width", 140).attr("x", 0).attr("height", 140), e.select(".slices").selectAll("path").data(pie(getData())).enter().append("svg:path").attr("class", "slice").attr("fill", function (t, e) {
        return colors[e]
    }).attr("d", arc).each(function (t) {
        this._current = t
    }).append("title").text(function (e, a) {
        return "€" + t[a].value + "M"
    }), e.select(".labels").selectAll("label").data(pie(getData())).enter().append("svg:text").attr("class", "label").attr("transform", function (t) {
        return "translate(" + arc.centroid(t) + ")"
    }).attr("text-anchor", "middle").text(function (e, a) {
        return t[a].value > 1 ? shortnames[a] : null
    })
}

function updatePieChart() {
    updateArcs(), updateLabels(), updateLabelLines()
}

function updateArcs() {
    var t = getData();
    d3.selectAll("#pie path title").text(function (e, a) {
        return t[a].value + "%"
    }), d3.selectAll("#pie path").data(pie(t)).transition().duration(100).attrTween("d", arcTween)
}

function updateLabels() {
    labelr = radius + 40, d3.selectAll("#pie text").data(pie(getData())).transition().duration(120).attr("transform", function (t) {
        var e = arc.centroid(t), a = e[0], n = e[1], r = Math.sqrt(a * a + n * n);
        return "translate(" + a / r * labelr + "," + n / r * labelr + ")"
    }).attr("dy", ".35em").attr("text-anchor", function (t) {
        return (t.endAngle + t.startAngle) / 2 > Math.PI ? "end" : "start"
    }).text(function (t, e) {
        return getData()[e].value > 0 ? shortnames[e] : null
    })
}

value.html(range.attr("value")), range.on("input", function () {
    value.html(this.value), showHelp()
}), $(document).ready(function () {
    init();
    var t = $("#canvas").width();
    $("#pie svg").width(t), $("#mainG").attr({transform: "translate(" + t / 2 + "," + canvasHeight / 2 + ")"}), $("#pie svg").width() < 470 ? ($(".slices").css("transform", "scale(0.6)"), $(".labels").css("transform", "scale(0.6)"), $(".lines").css("transform", "scale(0.6)")) : ($(".slices").css("transform", "scale(1)"), $(".labels").css("transform", "scale(1)"), $(".lines").css("transform", "scale(1)")), setTimeout(() => {
        changeValuesReal()
        for (let i = 0; i <= 10; i++) {
            let min = 0;
            let max = 100;
            $("#form-control-input"+i).on("input", function() {

                let $range = $("#"+i+"input");
                let instance = $range.data("ionRangeSlider");

                let val = $(this).prop("value");

                // validate
                if (val < min) {
                    val = min;
                } else if (val > max) {
                    val = max;
                }
                instance.update({
                    from: val
                });
                $(".js-range-slider").data("ionRangeSlider").callOnChange();
            });
        }

    }, 500)
});
var outerArc = d3.svg.arc().innerRadius(radius + 50).outerRadius(.95 * radius);

function midAngle(t) {
    return t.startAngle + (t.endAngle - t.startAngle) / 2
}

function updateLabelLines() {
    var t = d3.select(".lines").selectAll("polyline").data(pie(getData()));
    t.enter().append("polyline"), t.transition().duration(100).attrTween("points", function (t) {
        this._current = this._current || t;
        var e = d3.interpolate(this._current, t);
        return this._current = e(0), function (t) {
            var a = e(t);
            return [arc.centroid(a), outerArc.centroid(a)]
        }
    }), t.exit().remove()
}

function arcTween(t) {
    var e = d3.interpolate(this._current, t);
    return this._current = e(0), function (t) {
        return arc(e(t))
    }
}

function changetoEur() {
    $(".irs-single").map(function () {
        let t = this.innerText, e = t.length, a = t.substring(1, e - 4);
        a = parseInt(a);
        let n = "€" + (budget_total * a / 100 / 1e6).toLocaleString() + "Milj";
        this.innerHTML = n
    }).get()
}

function changeMax() {
    $(".irs-max").map(function () {
        this.innerHTML = "€" + (budget_total / 1e6).toLocaleString() + "Milj"
    }).get()
}

function changeValuesReal() {
    changetoEur(), changeMax()
}
function updateInput() {
    for (let i = 0; i <= 10; i++) {
        $("#form-control-input"+i).val($("#"+i+"input").val())
    }
}

function splitEven() {
    d3.selectAll("#rangebox .range").each(function () {
        var t = d3.select(this).attr("data-id"), e = this.value;
        if (t != moving_id && e > l) {
            var a = parseInt(e - l);
            this.value = a, $("#" + t + "input").data("ionRangeSlider").update({from: a}), oldValue[t] = this.value
        }
        console.log($(this))
    })
}

$("#fbsharelink").click(function () {
    var t = $(this).data("shareurl");
    return window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(t) + "&t=" + document.title, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600"), !1
});
