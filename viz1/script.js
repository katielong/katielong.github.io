function pie(file, label, n) {

  var w = 450;
  var h = 300;
  var r = 100;
  var ir = 45;
  var textOffset = 14;
  var tweenDuration = 100;

  //OBJECTS TO BE POPULATED WITH DATA LATER
  var lines, valueLabels, nameLabels;
  var pieData = [];
  var oldPieData = [];
  var filteredPieData = [];

  //D3 helper function to populate pie slice parameters from array data
  var donut = d3.layout.pie().value(function(d) {
    return d.octetTotalCount;
  });

  //D3 helper function to create colors from an ordinal scale
  var color = d3.scale.category20();

  //D3 helper function to draw arcs, populates parameter "d" in path object
  var arc = d3.svg.arc()
    .startAngle(function(d) {
      return d.startAngle;
    })
    .endAngle(function(d) {
      return d.endAngle;
    })
    .innerRadius(ir)
    .outerRadius(r);

  var vis = d3.select("body").select("#pie").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

  //GROUP FOR ARCS/PATHS
  var arc_group = vis.append("svg:g")
    .attr("class", "arc")
    .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

  //GROUP FOR LABELS
  var label_group = vis.append("svg:g")
    .attr("class", "label_group")
    .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

  //GROUP FOR CENTER TEXT  
  var center_group = vis.append("svg:g")
    .attr("class", "center_group")
    .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

  //PLACEHOLDER GRAY CIRCLE
  var paths = arc_group.append("svg:circle")
    .attr("fill", "#EFEFEF")
    .attr("r", r);


  //WHITE CIRCLE BEHIND LABELS
  var whiteCircle = center_group.append("svg:circle")
    .attr("fill", "white")
    .attr("r", ir);

  // "TOTAL" LABEL
  var totalLabel = center_group.append("svg:text")
    .attr("class", "label")
    .attr("dy", -15)
    .attr("text-anchor", "middle") // text-align: right
  .text(label);

  //TOTAL CONSUMPTION
  var totalValue = center_group.append("svg:text")
    .attr("class", "total")
    .attr("dy", 7)
    .attr("text-anchor", "middle") // text-align: right
  .text("Waiting...");



  var updateInterval = window.setInterval(update, 800);
  var a = new Array(96);
  d3.text(file, function(error, csv) {
    var rows = d3.csv.parse(csv);
    console.log(rows);
    for (i = 0; i < rows.length - 1; i++) {
      a[i] = new Array(10);
      a[i] = rows[i];
    }
  });

  var j = 0;

  function update() {

    var arr = Object.keys(a[j]).map(function(k) {
      return a[j][k]
    });
    
    var Central = {
      port: Object.keys(a[j])[2],
      octetTotalCount: +arr[2]
    };
    var East = {
      port: Object.keys(a[j])[3],
      octetTotalCount: +arr[3]
    };
    var NewD = {
      port: Object.keys(a[j])[4],
      octetTotalCount: +arr[4]
    };
    var North = {
      port: Object.keys(a[j])[5],
      octetTotalCount: +arr[5]
    };
    var NorthE = {
      port: Object.keys(a[j])[6],
      octetTotalCount: +arr[6]
    };
    var NorthW = {
      port: Object.keys(a[j])[7],
      octetTotalCount: +arr[7]
    };
    var South = {
      port: Object.keys(a[j])[8],
      octetTotalCount: +arr[8]
    };
    var SouthW = {
      port: Object.keys(a[j])[9],
      octetTotalCount: +arr[9]
    };
    var West = {
      port: Object.keys(a[j])[10],
      octetTotalCount: +arr[10]
    };
    

    var streakerDataAdded = new Array(Central, East, NewD, North, NorthE, NorthW, South, SouthW, West);

    oldPieData = filteredPieData;
    pieData = donut(streakerDataAdded);

    var totalOctets = 0;
    var Time = arr[1].substring(8, 13);

    filteredPieData = pieData.filter(filterData);

    function filterData(element, index, array) {
      element.name = streakerDataAdded[index].port;
      element.value = streakerDataAdded[index].octetTotalCount;
      totalOctets += element.value;
      return (element.value > 0);
    }

    if (j <= 95) {

      //REMOVE PLACEHOLDER CIRCLE
      arc_group.selectAll("circle").remove();

      totalValue.text(function() {
        return  "Time: " + Time;
      });


      //DRAW ARC PATHS
      paths = arc_group.selectAll("path").data(filteredPieData);
      paths.enter().append("svg:path")
        .style("stroke", function(d, i) {
          return color(i);
        })
        .style("fill", function(d, i) {
          return color(i);
        })
        .transition()
        .duration(tweenDuration)
        .attrTween("d", pieTween);
      paths
        .transition()
        .duration(tweenDuration)
        .attrTween("d", pieTween);
      paths.exit()
        .transition()
        .duration(tweenDuration)
        .attrTween("d", removePieTween)
        .remove();

      //DRAW TICK MARK LINES FOR LABELS
      lines = label_group.selectAll("line").data(filteredPieData);
      lines.enter().append("svg:line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", -r - 3)
        .attr("y2", -r - 8)
        .attr("stroke", "gray")
        .attr("transform", function(d) {
          return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
        });
      lines.transition()
        .duration(tweenDuration)
        .attr("transform", function(d) {
          return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
        });
      lines.exit().remove();

      //DRAW LABELS WITH PERCENTAGE VALUES
      valueLabels = label_group.selectAll("text.value").data(filteredPieData)
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 5;
          } else {
            return -7;
          }
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          } else {
            return "end";
          }
        })
        .text(function(d) {
          var percentage = (d.value / totalOctets) * 100;
          return (percentage.toFixed(2) * totalOctets).toFixed(2) + "kWh";
        });

      valueLabels.enter().append("svg:text")
        .attr("class", "value")
        .attr("transform", function(d) {
          return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ")";
        })
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 5;
          } else {
            return -7;
          }
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          } else {
            return "end";
          }
        }).text(function(d) {
          var percentage = (d.value / totalOctets) * 100;
          return (percentage.toFixed(2) * totalOctets).toFixed(2) + "kWh";
        });

      valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

      valueLabels.exit().remove();


      //DRAW LABELS WITH ENTITY NAMES
      nameLabels = label_group.selectAll("text.units").data(filteredPieData)
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 17;
          } else {
            return 5;
          }
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          } else {
            return "end";
          }
        }).text(function(d) {
          return d.name;
        });

      nameLabels.enter().append("svg:text")
        .attr("class", "units")
        .attr("transform", function(d) {
          return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ")";
        })
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 17;
          } else {
            return 5;
          }
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          } else {
            return "end";
          }
        }).text(function(d) {
          return d.name;
        });

      nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

      nameLabels.exit().remove();
    }
    j = j + 1;
  }

  // Interpolate the arcs in data space.
  function pieTween(d, i) {
    var s0;
    var e0;
    if (oldPieData[i]) {
      s0 = oldPieData[i].startAngle;
      e0 = oldPieData[i].endAngle;
    } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
      s0 = oldPieData[i - 1].endAngle;
      e0 = oldPieData[i - 1].endAngle;
    } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
      s0 = oldPieData[oldPieData.length - 1].endAngle;
      e0 = oldPieData[oldPieData.length - 1].endAngle;
    } else {
      s0 = 0;
      e0 = 0;
    }
    var i = d3.interpolate({
      startAngle: s0,
      endAngle: e0
    }, {
      startAngle: d.startAngle,
      endAngle: d.endAngle
    });
    return function(t) {
      var b = i(t);
      return arc(b);
    };
  }

  function removePieTween(d, i) {
    s0 = 2 * Math.PI;
    e0 = 2 * Math.PI;
    var i = d3.interpolate({
      startAngle: d.startAngle,
      endAngle: d.endAngle
    }, {
      startAngle: s0,
      endAngle: e0
    });
    return function(t) {
      var b = i(t);
      return arc(b);
    };
  }

  function textTween(d, i) {
    var a;
    if (oldPieData[i]) {
      a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI) / 2;
    } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
      a = (oldPieData[i - 1].startAngle + oldPieData[i - 1].endAngle - Math.PI) / 2;
    } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
      a = (oldPieData[oldPieData.length - 1].startAngle + oldPieData[oldPieData.length - 1].endAngle - Math.PI) / 2;
    } else {
      a = 0;
    }
    var b = (d.startAngle + d.endAngle - Math.PI) / 2;

    var fn = d3.interpolateNumber(a, b);
    return function(t) {
      var val = fn(t);
      return "translate(" + Math.cos(val) * (r + textOffset) + "," + Math.sin(val) * (r + textOffset) + ")";
    };
  }
}


pie("hs_fall", "Fall", 1);
pie("hs_winter", "Winter", 2);
pie("hs_monsoon", "Monsoon", 3);
pie("hs_summer", "Summer", 4);