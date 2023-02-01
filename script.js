const URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const WIDTH = 960;
const HEIGHT = 570;

const body = d3.select("body");
const tooltip = body
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);
const svg = d3.select("#tree-map");

const fader = (color) => d3.interpolateRgb(color, "#FFF")(0.2);

//Personalized using https://convertingcolors.com/
const color = d3.scaleOrdinal().range(
    [
      "#00850D",
      "#93ACCC",
      "#A8827A",
      "#E17D7C",
      "#DA9BB6",
      "#005E99",
      "#AA95B9",
      "#83BEC9",
      "#713E34",
      "#794EA2",
      "#DF6500",
      "#F6493F",
      "#4ADAEB",
      "#ABDFA0",
      "#C65CA7",
      "#C7C7C7",
      "#BFBF73",
      "#9FA200",
      "#FFB65C",
      "#999999"
  ].map(fader)
);

const treemap = d3
  .treemap()
  .size([WIDTH, HEIGHT])
  .paddingInner(1);

d3.json(URL)
  .then(data => {
    const root = d3
      .hierarchy(data)
      .eachBefore((d) =>
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + data.name)
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");
  
    cell
      .append("rect")
      .attr("class", "cell")
      .attr("id", (d) => d.data.id)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("fill", (d) => color(d.data.category))
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 0.9);
        tooltip.html(
          "Game: " +
          d.data.name +
          "<br>Console: " +
          d.data.category +
          "<br>Million units sold: " +
          d.data.value
        )
        .attr("data-value", d.data.value)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 25 + "px");
      })
      .on("mouseout", () =>{
        tooltip.style("opacity", 0);
      });
  
    cell
      .append("text")
      .attr("class", "cell-text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 12 + i * 10)
      .text((d) => d)
  
    let consoles = root.leaves().map((nodes) => nodes.data.category);
    consoles = consoles.filter((category, index, self) => {
      return self.indexOf(category) === index;
    });
    const legend = d3.select("#legend");
    const LEGEND_WIDTH = 500;
    const LEGEND_OFFSET = 10;
    const LEGEND_RECT_SIZE = 14;
    const LEGEND_H_SPACING = 140;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_H_OFFSET = 3;
    const LEGEND_TEXT_V_OFFSET = -2;
    const LEGEND_ELEMS_PER_ROW = Math.floor(LEGEND_WIDTH / LEGEND_H_SPACING);
  
    const legendElem = legend
      .append("g")
      .attr("transform", "translate(60," + LEGEND_OFFSET +")")
      .selectAll("g")
      .data(consoles)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        return (
          "translate(" +
          (i % LEGEND_ELEMS_PER_ROW) * LEGEND_H_SPACING +
          "," +
          (Math.floor(i / LEGEND_ELEMS_PER_ROW) * LEGEND_RECT_SIZE +
            LEGEND_V_SPACING * Math.floor(i / LEGEND_ELEMS_PER_ROW)) +
          ")"
        );
      });
  
    legendElem
      .append("rect")
      .attr("width", LEGEND_RECT_SIZE)
      .attr("height", LEGEND_RECT_SIZE)
      .attr("class", "legend-item")
      .attr("fill", (d) => color(d));
  
    legendElem
      .append("text")
      .attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_H_OFFSET)
      .attr("y", LEGEND_RECT_SIZE + LEGEND_TEXT_V_OFFSET)
      .text((d) => d);
  })
  .catch(err => console.log(err));
