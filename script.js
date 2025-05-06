// Task switching logic
document.addEventListener("DOMContentLoaded", () => {
  const charts = {
    line: drawLineChart,
    bar: drawBarChart,
    scatter: drawScatterPlot
  };

  d3.csv("data/a1-film.csv").then(data => {
    data.forEach(d => {
      d.Year = +d.Year;
      d.Length = +d.Length;
      d.Popularity = +d.Popularity;
    });

    document.querySelectorAll("#task-list button").forEach(btn => {
      btn.addEventListener("click", () => {
        const task = btn.dataset.task;
        document.querySelectorAll(".chart").forEach(div => div.classList.add("hidden"));
        document.getElementById(`${task}-chart`).classList.remove("hidden");

        // Prevent re-rendering
        if (!document.getElementById(`${task}-chart`).hasChildNodes()) {
          charts[task](data);
        }
      });
    });
  });
});

// Tooltip helper
const tooltip = d3.select(".tooltip");

function drawLineChart(data) {
  const yearMap = d3.rollup(data, v => d3.mean(v, d => d.Popularity), d => d.Year);
  const lineData = Array.from(yearMap, ([year, popularity]) => ({ year, popularity }))
    .sort((a, b) => a.year - b.year);

  const margin = { top: 40, right: 30, bottom: 40, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#line-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain(d3.extent(lineData, d => d.year)).range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(lineData, d => d.popularity)]).range([height, 0]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g").call(d3.axisLeft(y));

  const line = d3.line().x(d => x(d.year)).y(d => y(d.popularity));

  svg.append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  svg.selectAll("dot")
    .data(lineData)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.popularity))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip.html(`Year: ${d.year}<br>Popularity: ${d.popularity.toFixed(2)}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Average Film Popularity Over Years");
}

function drawBarChart(data) {
  const subjectCounts = d3.rollup(data, v => v.length, d => d.Subject);
  const barData = Array.from(subjectCounts, ([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);

  const margin = { top: 40, right: 30, bottom: 100, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#bar-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(barData.map(d => d.subject)).range([0, width]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(barData, d => d.count)]).range([height, 0]);

  svg.append("g").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)).selectAll("text")
    .attr("transform", "rotate(-40)").style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(barData)
    .enter()
    .append("rect")
    .attr("x", d => x(d.subject))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.count))
    .attr("fill", "darkorange")
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip.html(`Genre: ${d.subject}<br>Count: ${d.count}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Number of Films per Genre");
}

function drawScatterPlot(data) {
  const margin = { top: 40, right: 30, bottom: 50, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#scatter-plot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, d3.max(data, d => d.Length)]).range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.Popularity)]).range([height, 0]);
  const color = d3.scaleOrdinal().domain(["Yes", "No"]).range(["green", "red"]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y));

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Length))
    .attr("cy", d => y(d.Popularity))
    .attr("r", 5)
    .attr("fill", d => color(d.Awards))
    .attr("opacity", 0.7)
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip.html(`Length: ${d.Length}<br>Popularity: ${d.Popularity}<br>Awards: ${d.Awards}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => tooltip.transition().style("opacity", 0));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Film Length vs Popularity (Green = Awards)");
}
