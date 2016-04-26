var hoverWidth = 10;

function generateCountryGraph(countryName) {
  var graphSVG = d3.select("#graphSVG");
  graphSVG.selectAll("*").remove();
  var desiredCountry = countryGDPs[countryName];
  if (desiredCountry ==  null) {
    graphSVG.append("text")
    .text("Data N/A")
    .attr("x", "50%")
    .attr("y", "50%")
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 20);
    return;
  }

  var nextKey = "1989 [YR1989]";
  var key;
  var gdpval = [];

  for (var i = 1989; i < 2015; i++) {
    var nextDateString = (i + 1).toString();
    key = nextKey;
    nextKey = nextDateString + " [YR" + nextDateString + "]";

    if(desiredCountry[key] != ".."){
      gdpval.push(desiredCountry[key]);
    }
  }
  var maxValue = Math.max.apply(Math, gdpval);

  var xPadding = 100;
  var yPadding = 100;
  var xScale = d3.scale.linear().domain([1989, 2014]).range([xPadding, width / 2 - xPadding]);
  var yScale = d3.scale.linear().domain([0, maxValue]).range([height - yPadding, yPadding]);
  var xAxis = d3.svg.axis().scale(xScale)
    .orient("bottom")
    .tickFormat(d3.format("d"));
  var yAxis = d3.svg.axis().scale(yScale)
    .orient("left");
  graphSVG.append("g").attr("class", "axis")
    .attr("transform", "translate(0," + (height - yPadding) + ")")
    .call(xAxis);
  graphSVG.append("g").attr("class", "axis")
    .attr("transform", "translate(" + xPadding + ", 0)")
    .call(yAxis);

  for (var i = 1989; i < 2015; i++) {
    var nextDateString = (i + 1).toString();
    key = nextKey;
    nextKey = nextDateString + " [YR" + nextDateString + "]";
    if (desiredCountry[key] != "..") {
      //console.log(desiredCountry[key]);
      graphSVG.append("circle")
        .attr("cx", xScale(i))
        .attr("cy", yScale(desiredCountry[key]))
        .attr("r", 3)
        .style("fill", "black");
      if (i != 2014 && desiredCountry[nextKey] != "..") {
        graphSVG.append("line")
          .attr("x1", xScale(i))
          .attr("y1", yScale(desiredCountry[key]))
          .attr("x2", xScale(i + 1))
          .attr("y2", yScale(desiredCountry[nextKey]))
          .style("stroke", "black");
      }
    }
  }

  if (countryToCableID[countryName] != null) {
    var yearToNumberOfCables = {};
    var yearToCableNames = {};
    var seenCableIDs = {};
    countryToCableID[countryName].forEach(function(cableID) {
      //console.log(cableIDtoCable[cableID].name);
      var year = cableIDtoCable[cableID].year;
      var name = cableIDtoCable[cableID].name;
      if (year != 0 && year <= 2014) {
        if (yearToNumberOfCables[year] == null) {
          yearToNumberOfCables[year] = 1;
          yearToCableNames[year] = [name];
          seenCableIDs[cableID] = 1;
        } else if (seenCableIDs[cableID] == null) {
          yearToNumberOfCables[year] += 1;
          yearToCableNames[year].push(name);
          seenCableIDs[cableID] = 1;
        }
      }
    });
    console.log(yearToCableNames);
    Object.keys(yearToNumberOfCables).forEach(function(key) {
      console.log(key);
      graphSVG.append("line")
        .attr("x1", xScale(key))
        .attr("x2", xScale(key))
        .attr("y1", yScale(0))
        .attr("y2", yScale(maxValue))
        .style("stroke", "purple")
        .style("stroke-width", yearToNumberOfCables[key] * 2)
        .style("stroke-opacity", 0.5)
        .on("mouseover", function() {
          var thisLine = d3.select(this);
          console.log(parseInt(thisLine.style("stroke-width")) + hoverWidth);
          thisLine.style("stroke-width", parseInt(thisLine.style("stroke-width")) + hoverWidth);
          var popup = d3.select("#popup");
          popup.style("display", "block")
          console.log(key);
          yearToCableNames[key].forEach(function(d) {
            popup.append("p").text(d).attr("class", "cable-name");
          })
        })
        .on("mousemove", function() {
          trackMouseMovements();
        })
        .on("mouseout", function() {
          clearInterval(toolTip);
          d3.select(this).style("stroke-width", yearToNumberOfCables[key] * 2);
          var popup = d3.select("#popup");
          popup.selectAll("*").remove();
          d3.select("#popup").style("display", "none");
        });
    });
  }

  graphSVG.append("text")
    .text(countryName)
    .attr("x", "50%")
    .attr("y", "7%")
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 30)
    .style("font-weight", 100);
  graphSVG.append("text")
    .text("GDP per capita (thousands of $)")
    .attr("x", "-50%")
    .attr("y", xScale(1989) - 80)
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 18)
    .style("font-weight", 100)
    .attr("transform", "rotate(270)");
  graphSVG.append("text")
    .text("Year")
    .attr("x", "50%")
    .attr("y", yScale(0) + 45)
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 18);
}

function generateCableGraph(cable) {
  var graphSVG = d3.select("#graphSVG");
  graphSVG.selectAll("*").remove();
  var desiredLandings = cableIDToLandings[cable.cable_id];
  var maxGDP = 0;
  if (desiredLandings.length == 0) {
    graphSVG.append("text")
    .text("Data N/A")
    .attr("x", "50%")
    .attr("y", "50%")
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 20);
    return;
  } else {
    //find maximum GDP value to generate scale

    desiredLandings.forEach(function(landing) {
      var desiredCountry = countryGDPs[landing.country];
      var nextKey = "1989 [YR1989]";
      var key;
       for (var i = 1989; i < 2015; i++) {
        var nextDateString = (i + 1).toString();
        key = nextKey;
        nextKey = nextDateString + " [YR" + nextDateString + "]";
        if (desiredCountry != null && desiredCountry[key] != ".." && desiredCountry[key] > maxGDP) {
          maxGDP = desiredCountry[key];
        }
      }
    });
  }

  var xPadding = 100;
  var yPadding = 100;
  var xScale = d3.scale.linear().domain([1989, 2014]).range([xPadding, width / 2 - xPadding]);
  var yScale = d3.scale.linear().domain([0, maxGDP]).range([height - yPadding, yPadding]);
  var xAxis = d3.svg.axis().scale(xScale)
    .orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale)
    .orient("left");
  graphSVG.append("g").attr("class", "axis")
    .attr("transform", "translate(0," + (height - yPadding) + ")")
    .call(xAxis);
  graphSVG.append("g").attr("class", "axis")
    .attr("transform", "translate(" + xPadding + ", 0)")
    .call(yAxis);

  var countries = {};
  desiredLandings.forEach(function(landing) {
    var desiredCountry = countryGDPs[landing.country];
    if (desiredCountry != null) {
      var nextKey = "1989 [YR1989]";
      var key;
      for (var i = 1989; i < 2015; i++) {
        var nextDateString = (i + 1).toString();
        key = nextKey;
        nextKey = nextDateString + " [YR" + nextDateString + "]";
        if (desiredCountry[key] != "..") {
          //console.log(desiredCountry[key]);
          graphSVG.append("circle")
            .attr("cx", xScale(i))
            .attr("cy", yScale(desiredCountry[key]))
            .attr("r", 3)
            .style("fill", "black");
          if (i != 2014 && desiredCountry[nextKey] != "..") {
            graphSVG.append("line")
              .attr("x1", xScale(i))
              .attr("y1", yScale(desiredCountry[key]))
              .attr("x2", xScale(i + 1))
              .attr("y2", yScale(desiredCountry[nextKey]))
              .style("stroke", "black")
              .style("stroke-width", 3)
              .attr("class", desiredCountry["Country Code"])
              .on("mouseover", function() {
                d3.selectAll("." + desiredCountry["Country Code"])
                  .style("stroke-width", 7);
                var popup = d3.select("#popup");
                popup.style("display", "block")
                  .append("p").text(desiredCountry["Country Name"]);
              })
              .on("mousemove", function() {
                trackMouseMovements();
              })
              .on("mouseout", function() {
                clearInterval(toolTip);
                d3.selectAll("." + desiredCountry["Country Code"])
                  .style("stroke", "black")
                  .style("stroke-width", 3);
                var popup = d3.select("#popup");
                popup.selectAll("*").remove();
                d3.select("#popup").style("display","none");
              });
          }
        }
      }
    }
  });

  var year = cable.year;
  if (year != 0 && year <= 2014) {
    graphSVG.append("line")
      .attr("x1", xScale(year))
      .attr("x2", xScale(year))
      .attr("y1", yScale(0))
      .attr("y2", yScale(100000))
      .style("stroke", "purple");
  }

  graphSVG.append("text")
    .text(cable.name)
    .attr("x", "50%")
    .attr("y", "7%")
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 30)
    .style("font-weight", 100);
  graphSVG.append("text")
    .text("GDP per capita (thousands of $)")
    .attr("x", "-50%")
    .attr("y", xScale(1989) - 80)
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 18)
    .style("font-weight", 100)
    .attr("transform", "rotate(270)");
  graphSVG.append("text")
    .text("Year")
    .attr("x", "50%")
    .attr("y", yScale(0) + 45)
    .style("fill", "black")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "center")
    .style("font-size", 18);
}
