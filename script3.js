// script3.js - Scene 3: Bubble Chart for Budget, Gross Revenue, and IMDb Score by Genre

// Data loading and preprocessing
d3.csv("movies.csv").then((movieData) => {
    // Convert numerical columns to numbers
    movieData.forEach((d) => {
      d.year = +d.year;
      d.score = +d.score;
      d.votes = +d.votes;
      d.budget = +d.budget;
      d.gross = +d.gross;
    });
  
    // Filter out movies with budget or gross revenue equal to 0
    const filteredData = movieData.filter((d) => d.budget > 0 && d.gross > 0);
  
    // Get unique genres for the filter
    const genres = Array.from(new Set(filteredData.map((d) => d.genre)));
  
    // Create the drop-down menu for genres
    const genreSelect = d3.select("#genre-select");
    genreSelect
      .selectAll("option")
      .data(genres)
      .enter()
      .append("option")
      .text((d) => d)
      .attr("value", (d) => d);
  
    // Function to update the chart based on the selected genre
    function updateChart() {
      const selectedGenre = genreSelect.property("value");
      
        const minIMDb = +d3.select("#imdb-min").property("value");
        const maxIMDb = +d3.select("#imdb-max").property("value");

        d3.select("#imdb-min-value").text(minIMDb.toFixed(1));
        d3.select("#imdb-max-value").text(maxIMDb.toFixed(1));

        // Filter genre data based on selected genre and IMDb rating range
        const genreData = filteredData.filter(
            (d) => d.genre === selectedGenre && d.score >= minIMDb && d.score <= maxIMDb
        );
        
      // Set up chart dimensions
      const margin = { top: 30, right: 30, bottom: 100, left: 60 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
  
      // Remove previous chart content
      d3.select("#chart3").html("");
  
      // Create SVG container
      const svg = d3
        .select("#chart3")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", height + margin.top + margin.bottom + 100)
        .append("g")
        .attr("transform", `translate(${margin.left + 10},${margin.top + 100})`);
  
      // Create x and y scales
      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(genreData, (d) => d.budget)])
        .range([0, width]);
  
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(genreData, (d) => d.gross)])
        .range([height, 0]);
  
      // Create radius scale for IMDb score (size of the bubbles)
      const scoreScale = d3
        .scaleLinear()
        .domain(d3.extent(filteredData, (d) => d.score))
        .range([2, 17]);

    // Create color scale for IMDb score (lighter shades for lower scores, darker shades for higher scores)
    const colorScale = d3
        .scaleLinear()
        .domain(d3.extent(filteredData, (d) => d.score))
        .range(["#f6ecf9", "#920085"]);
  
      // Create x and y axes
      const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".3s"));
      const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".3s"));
  
      // Add x axis to the chart
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
  
      // Append x axis label
      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .style("text-anchor", "middle")
        .text("Budget");
  
      // Add y axis to the chart
      svg
        .append("g")
        .attr("class", "y-axis")
        .call(yAxis);
  
      // Append y axis label
      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", -margin.left - 150)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .text("Gross Revenue");
  
      // Create and append the bubbles to the chart
      svg
        .selectAll("circle")
        .data(genreData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.budget))
        .attr("cy", (d) => yScale(d.gross))
        .attr("r", (d) => scoreScale(d.score))
        .attr("fill", (d) => colorScale(d.score))
        .on("mouseover", function (event, d) {
          // Implement annotation behavior here
          const tooltip = d3.select("#tooltip");
          tooltip
            .style("display", "block")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 10 + "px")
            .html(`<b>${d.name}</b><br>
            Genre: ${d.genre}</br>
            Budget: $${d.budget}</br>
            Gross Revenue: $${d.gross}</br>
            IMDb Score: ${d.score}`);
        })
        .on("mouseout", function (event, d) {
          // Remove annotation here
          d3.select("#tooltip").style("display", "none");
        });

        // Find the data point with the highest IMDb to revenue ratio
        const highestRatioData = genreData.reduce((max, d) => {
            const ratio = d.gross / d.score;
            return ratio > max.ratio ? { data: d, ratio: ratio } : max;
        }, { data: null, ratio: -Infinity });

        // Remove previous annotations
        svg.selectAll(".annotation-group").remove();

        // Create annotations
        if (highestRatioData.data) {
            const annotations = [{
            note: {
                title: `Highest Revenue to IMDb Rating Ratio`,
                label: `${highestRatioData.data.name}`,
            },
            x: xScale(highestRatioData.data.budget),
            y: yScale(highestRatioData.data.gross),
            dx: 30,
            dy: -30,
            color: "#333",
            subject: { radius: scoreScale(highestRatioData.data.score) },
            }];

            // Add annotations using the d3-annotation library
            const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations)
            .accessors({ x: d => xScale(d.x), y: d => yScale(d.y) });

            svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
        }

    }
  
    // Create and append the tooltip
    d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("display", "none")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.3)");
  
    // Initial chart rendering
    updateChart();
  
    // Add event listener for the genre selection
    genreSelect.on("change", updateChart);

    // Event listeners for the IMDb rating range inputs
    d3.select("#imdb-min").on("input", updateChart);
    d3.select("#imdb-max").on("input", updateChart);
  });
  
