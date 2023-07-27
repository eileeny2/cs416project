// Scene 1: Overview of Movie Ratings by Genre and Release Year
// Initialize parameters
let currentYear = 2010;
let data;

// Data loading and preprocessing
d3.csv("movies.csv").then((data) => {
  // Convert numerical columns to numbers
  data.forEach((d) => {
    d.year = +d.year;
    d.rating = +d.rating;
  });

  // Store data in the global variable for access across functions
  this.data = data;

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
      genreMovies.reduce((sum, d) => sum + d.rating, 0) / genreMovies.length;
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
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

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

  // Add y axis to the chart
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis);

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
    })
    .on("mouseout", function (event, d) {
      // Remove annotation here
    });

  // Add annotations using d3-annotation library
  // ...

  // Function to update the chart when a new year is selected
  yearSelect.on("change", () => {
    const selectedYear = +yearSelect.property("value");
    updateScene1(selectedYear);
  });
}
