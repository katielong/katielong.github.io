d3.json("vislist.json", (err, data) => {
    let box = d3.select("#main")
        .selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "box");
    let link = box.append("a").attr("href", d => d.link);

    link.append("p").html(d => d.name);
    link.append("img").attr("src", d => d.image);
    link.append("p").html(d => d.time);

    box.on("mouseover", d => {
        let b = d3.selectAll(".box")
            .filter(e => e.index == d.index);
        b.transition().style("background", "rgba(0,0,0,0.6)");
        b.selectAll("p").transition().style("opacity", 1);
    }).on("mouseout", d => {
        let b = d3.selectAll(".box").filter(e => e.index == d.index);
        b.transition().style("background", "rgba(256,256,256,1)");
        b.selectAll("p").transition().style("opacity", "0");
    });
});


d3.json("past.json", (err, data) => {

});