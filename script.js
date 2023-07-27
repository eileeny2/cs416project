// Scene 1: Overview of Movie Ratings by Genre and Release Year
// Initialize parameters
let currentYear = 2010;
let data;

// Data loading and preprocessing
d3.csv("movies.csv").then((movieData) => {
  // Convert numerical columns to numbers
  movieData.forEach((d) => {
    d.year = +d.year;
    d.score = +d.score;
  });

  // Store data in the global variable for access across functions
  data = movieData;

  // Create dropdown options
  const years = Array.from(new Set(data.map((d) => d.year)));
  const yearSelect = d3.select("#year-select");
  yearSelect
    .selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  // Create the initial chart
  updateScene1(currentYear);
});

// Function to update scene based on selected year
function updateScene1(year) {
  currentYear = year;
  const filteredData = data.filter((d) => d.year === year);

  // Calculate average ratings for each genre
  const genres = Array.from(new Set(filteredData.map((d) => d.genre)));
  const genreRatings = genres.map((genre) => {
    const genreMovies = filteredData.filter((d) => d.genre === genre);
    const averageRating =
      genreMovies.reduce((sum, d) => sum + d.score, 0) / genreMovies.length;
    return { genre, averageRating };
  });

  // Sort the genres by average rating in descending order
  genreRatings.sort((a, b) => b.averageRating - a.averageRating);

  // Set up chart dimensions
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Remove previous chart content
  d3.select("#chart1").html("");

  // Create SVG container
  const svg = d3
    .select("#chart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom + 100)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top + 50})`);

  // Add a group for the annotations
  const annotationGroup = svg.append("g").attr("class", "annotation-group");

  // Create x and y scales
  const xScale = d3
    .scaleBand()
    .domain(genreRatings.map((d) => d.genre))
    .range([0, width])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(genreRatings, (d) => d.averageRating)])
    .range([height, 0]);

  // Create x and y axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

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
      .attr("x", width - 250)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "end")
      .text("Genre");

  // Add y axis to the chart
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // Append y axis label
  svg
      .append("text")
      .attr("class", "axis-label")
      .attr("x", -margin.left - 200)
      .attr("y", -40)
      .attr("transform", "rotate(-90)")
      .text("Average IMDb Rating");

  // Create and append the bars to the chart
  svg
    .selectAll(".bar")
    .data(genreRatings)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.genre))
    .attr("y", (d) => yScale(d.averageRating))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.averageRating))
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      // Implement annotation behavior here
      const tooltip = d3.select("#tooltip");
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px")
        .html(`<b>${d.genre}</b><br>
        Average Rating: ${d.averageRating}</br>`);
    })
    .on("mouseout", function (event, d) {
      // Remove annotation here
      d3.select("#tooltip").style("display", "none");
    });

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

  // Function to update the chart when a new year is selected
  const yearSelect = d3.select("#year-select");
  yearSelect.on("change", () => {
    const selectedYear = +yearSelect.property("value");
    updateScene1(selectedYear);
  });

  const highestRatingGenre = genreRatings[0];
  const lowestRatingGenre = genreRatings[genreRatings.length - 1];

  // Create and append the annotations
  const annotations = [
    {
      note: {
        label: `${highestRatingGenre.averageRating}`,
        title: `Highest Rating: ${highestRatingGenre.genre}`,
      },
      x: xScale(highestRatingGenre.genre) + xScale.bandwidth() / 2,
      y: yScale(highestRatingGenre.averageRating),
      dy: -10,
      dx: 100,
      subject: {
        radius: 5,
      },
      type: d3.annotationCalloutCircle,
    },
    {
      note: {
        label: `${lowestRatingGenre.averageRating}`,
        title: `Lowest Rating: ${lowestRatingGenre.genre}`,
      },
      x: xScale(lowestRatingGenre.genre) + xScale.bandwidth() / 2,
      y: yScale(lowestRatingGenre.averageRating),
      dy: -30,
      dx: 0,
      subject: {
        radius: 5,
      },
      type: d3.annotationCalloutCircle,
    },
  ];

  // Add annotations to the chart
  const makeAnnotations = d3.annotation()
    .type(annotations.type)
    .annotations(annotations);

  annotationGroup.call(makeAnnotations);
}
