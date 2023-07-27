// script2.js - Scene 2: Relationship between Movie Budget and Gross Revenue

// Data loading and preprocessing
d3.csv("movies.csv").then((movieData) => {
  // Convert numerical columns to numbers
  movieData.forEach((d) => {
    d.budget = +d.budget;
    d.gross = +d.gross;
  });

  // Store data in a separate variable for Scene 2
  const data = movieData;

  // Get unique production companies for the filter
  const productionCompanies = Array.from(new Set(data.map((d) => d.company)));

  // Create the searchable multi-select list for production companies
  const filterContainer = d3.select("#filter-container");

  // Text-input search
  const searchInput = filterContainer
    .append("input")
    .attr("type", "text")
    .attr("id", "search-filter")
    .attr("placeholder", "Search for one or more production companies...");

  // Multi-select list with checkboxes
  const filterSelect = filterContainer
    .append("select")
    .attr("id", "company-filter")
    .attr("multiple", "multiple");

  // Add the options to the select list with checkboxes
  const options = filterSelect
    .selectAll("option")
    .data(productionCompanies)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d)
    .attr("selected", (d) => d === "Lucasfilm" ? "selected" : null);

  // Add checkboxes to the options
  options.each(function (d) {
    const option = d3.select(this);
    option.html(
      `<input type="checkbox" value="${d}" /> ${d}`
    );
  });

  // Set up chart dimensions
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Function to format tick labels as millions
  const formatMillions = d3.format(".3s");
  
  // Function to update the chart based on selected production companies
  function updateChart() {
    // Get the selected production companies
    const selectedCompanies = d3
      .selectAll("#company-filter option:checked")
      .nodes()
      .map((option) => option.value);

    // Filter the data based on the selected production companies and non-zero budget and revenue
    const filteredData = data.filter(
        (d) =>
        selectedCompanies.includes(d.company) &&
        d.budget > 0 &&
        d.gross > 0
    );

    // Calculate the budget to gross revenue ratio for each data point
    filteredData.forEach((d) => {
        d.budgetToGrossRatio = d.gross / d.budget;
    });

    // Find the data point with the highest budget to gross revenue ratio
    const maxBudgetToGross = d3.max(filteredData, (d) => d.budgetToGrossRatio);
    const bestDataPoints = filteredData.filter(
        (d) => d.budgetToGrossRatio === maxBudgetToGross
    );

    // Set up chart scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.budget)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.gross)])
      .range([height, 0]);

    // Remove previous chart content
    d3.select("#chart2").html("");

    // Create SVG container
    const svg = d3
      .select("#chart2")
      .append("svg")
      .attr("width", width + margin.left + margin.right + 200)
      .attr("height", height + margin.top + margin.bottom + 100)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top + 100})`);

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => formatMillions(d / 1e6));
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => formatMillions(d / 1e6));

    // Add x axis to the chart
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width)
      .attr("y", -10)
      .style("text-anchor", "end")
      .text("Budget (in millions)");

    // Append x axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width - 200)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "end")
        .text("Budget (in millions)");

    // Add y axis to the chart
    svg
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .append("text")
      .attr("class", "axis-label")
      .attr("x", 10)
      .attr("y", -10)
      .text("Gross Revenue (in millions)");

    // Append y axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", -margin.left - 200)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text("Gross Revenue (in millions)");

    // Create and append the circles to the chart
    svg
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.budget))
      .attr("cy", (d) => yScale(d.gross))
      .attr("r", 5)
      .attr("fill", "purple")
      .on("mouseover", function (event, d) {
        // Implement annotation behavior here
        const tooltip = d3.select("#tooltip");
        tooltip
          .style("display", "block")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .html(`<b>${d.name}</b><br>
          Production Company: ${d.company}</br>
          Budget: $${formatMillions(d.budget)}</br>
          Gross Revenue: $${formatMillions(d.gross)}`);
      })
      .on("mouseout", function (event, d) {
        // Remove annotation here
        d3.select("#tooltip").style("display", "none");
      });


    // Add annotations to highlight the best data point(s)
    const annotations = bestDataPoints.map((d) => ({
        note: {
            title: "Best Budget to Revenue Ratio",
            label: `Movie: ${d.name},
            Budget: $${formatMillions(d.budget)},
            Gross Revenue: $${formatMillions(d.gross)}`,
            wrap: 150,
        },
        subject: {
            radius: 5,
            radiusPadding: 5,
        },
        x: xScale(d.budget),
        y: yScale(d.gross),
        dx: 50,
        dy: -30,
    }));

    const makeAnnotations = d3.annotation().annotations(annotations);
    svg.append("g").call(makeAnnotations);
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

  // Function to handle text-input search
  function handleSearch() {
    const searchText = searchInput.property("value").toLowerCase();
    options.each(function (d) {
      const option = d3.select(this);
      const company = d.toLowerCase();
      if (company.includes(searchText)) {
        option.style("display", "block");
      } else {
        option.style("display", "none");
      }
    });

    // Update the chart based on the selected production companies
    updateChart();
  }

  // Event listener for the text-input search
  searchInput.on("input", handleSearch);

  // Add event listener for the company filters
  d3.select("#company-filter").on("change", updateChart);

  // Function to handle unselecting all production companies
  function unselectAllCompanies() {
    d3.selectAll("#company-filter option").property("selected", false);
    updateChart();
  }

  // Create and append the "Unselect All" button
  filterContainer
    .append("button")
    .attr("id", "unselectAll")
    .text("Unselect All")
    .on("click", unselectAllCompanies);
});
