const cmbbox = document.getElementById("genres");
let movies = [];
const moviebtn = document.getElementById("movies");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const recentbtn = document.getElementById("recent");
const portfolioItem = document.getElementById("portfolio");
const topbtn = document.getElementById("top");
const allbtn = document.getElementById("all");
const loader = document.getElementById("scroll-loading");

document.addEventListener("DOMContentLoaded", async function () {
  await getMovies();
});

searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    searchMovies();
  }
});


cmbbox.addEventListener("change", filterMoviesByGenre);
recentbtn.addEventListener("click", getRecentMovies);
topbtn.addEventListener("click", getTopMovies);
allbtn.addEventListener("click", getAllMovies);

let isLoading = false;
let moviesPerPage = 100;
let currentIndex = 100;

function searchMovies() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
      return; 
    }
  
    const filteredMovies = movies.filter((movie) =>
      movie.name.toLowerCase().includes(searchTerm)
    );
  
    portfolioItem.innerHTML = "";
  
    if (filteredMovies.length > 0) {
      createLatestMovieCards(filteredMovies);
    } else {
      portfolioItem.innerHTML = "<p style='color:white;'>No results found.</p>";
    }
  }
async function getMovies() {
  portfolioItem.style.display = "none";

  let response = await fetch("https://api.tvmaze.com/shows");
  movies = await response.json();

  setTimeout(() => {
    createLatestMovieCards(movies.slice(0, 100));
    portfolioItem.style.display = "flex";

    const genres = [...new Set(movies.flatMap((movie) => movie.genres))];
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      cmbbox.appendChild(option);
    });
  }, 100);
}
let lastScrollTop = 0;

window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollPosition = scrollTop + window.innerHeight;
    const threshold = document.documentElement.scrollHeight - 100;
  
    if (scrollPosition >= threshold && scrollTop > lastScrollTop && !isLoading) {
      loadMoreMovies();
      document.getElementById("movie-details-area").style.display = "none";
      $("#portfolio").show();
    }
  
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
  

function loadMoreMovies() {
  if (isLoading) return;
  isLoading = true;
  loader.style.display = "block";

  setTimeout(() => {
    const nextBatch = movies.slice(currentIndex, currentIndex + moviesPerPage);
    if (nextBatch.length > 0) {
      createLatestMovieCards(nextBatch);
      currentIndex += moviesPerPage;
    }
    loader.style.display = "none";
    isLoading = false;
  }, 1000);
}

function createLatestMovieCards(moviesList) {
  let content = "";
  moviesList.forEach((movie) => {
    content += `
      <div class="col-lg-3 movie-card" data-id="${movie.id}">
        <div class="single-portfolio">
          <div class="single-portfolio-img">
            <img src="${movie.image?.medium || ""}" alt="${movie.name}">
          </div>
          <div class="portfolio-content">
            <h4>${movie.name}</h4>
            <p>${movie.genres.join(" | ")}</p>
            <div class="rating">${generateStars(
              movie.rating?.average || 0
            )}</div>
          </div>
        </div>
      </div>
    `;
  });

  portfolioItem.insertAdjacentHTML("beforeend", content);

  document.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", function () {
      const movieId = parseInt(this.getAttribute("data-id"));
      const selectedMovie = movies.find((m) => m.id === movieId);
      showMovieDetails(selectedMovie);
    });
  });
}

function showMovieDetails(movie) {
    document.getElementById("portfolio").style.display = "none";
    document.getElementById("movie-details-area").style.display="block";
    document.getElementById("moviebox").style.display = "block";
    document.getElementById("moviedetails").style.display = "block";
  
    const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
  
    document.getElementById("moviebox").innerHTML = `
      <a href="#" class="theme-btn" onclick="backToMovies()">← Back to Movies</a>
      <div class="row flexbox-center">
        <div class="col-lg-5 text-lg-left text-center">
          <div class="transformers-content">
            <img src="${movie.image?.original || ""}" alt="${movie.name}" />
          </div>
        </div>
        <div class="col-lg-7">
          <div class="transformers-content">
            <h2>${movie.name}</h2>
            <p>${movie.genres.join(" | ")}</p>
            <ul>
              <li><strong>Language:</strong> ${movie.language}</li>
              <li><strong>Premiered:</strong> ${movie.premiered}</li>
              <li><strong>Rating:</strong> ${movie.rating?.average || "N/A"}</li>
              <li><strong>Runtime:</strong> ${movie.runtime || "N/A"} minutes</li>
            </ul>
            <a href="https://www.justwatch.com/us/tv-show/${lastPart}" class="theme-btn" target="_blank">Watch Now</a>
          </div>
        </div>
      </div>
    `;
  
    document.getElementById("moviedetails").innerHTML = `
      <div class="col-lg-12">
        <div class="details-content">
          <div class="details-overview">
            <h2>Overview</h2>
            <p>${movie.summary || "No summary available."}</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById("moviebox").scrollIntoView({
      behavior: "smooth"
    });
  }
  

function backToMovies() {
  document.getElementById("portfolio").style.display = "flex";
  document.getElementById("movie-details-area").style.display = "none";
  document.getElementById("moviebox").style.display = "none";
  document.getElementById("moviedetails").style.display = "none";
}

function filterMoviesByGenre() {
  const selectedGenre = cmbbox.value;
  let filteredMovies =
    selectedGenre === "All"
      ? movies
      : movies.filter((movie) => movie.genres.includes(selectedGenre));

  portfolioItem.innerHTML = "";
  filteredMovies.forEach((movie) => createLatestMovieCards([movie]));
}

function getTopMovies() {
  const topMovies = movies
    .filter((movie) => movie.rating?.average > 8)
    .slice(0, 6);
  portfolioItem.innerHTML = "";
  topMovies.forEach((movie) => createLatestMovieCards([movie]));
}

function getRecentMovies() {
  const latestMovies = movies
    .filter((movie) => {
      if (!movie.premiered) return false;
      const year = new Date(movie.premiered).getFullYear();
      return year === 2014;
    })
    .slice(0, 6);

  portfolioItem.innerHTML = "";
  latestMovies.forEach((movie) => createLatestMovieCards([movie]));
}

function getAllMovies() {
  portfolioItem.innerHTML = "";
  createLatestMovieCards(movies);
}

function generateStars(rating = 0) {
  const maxStars = 5;
  const scaledRating = rating / 2;
  const fullStars = Math.floor(scaledRating);
  const halfStar = scaledRating % 1 >= 0.1;
  const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

  let starsHTML = "";
  for (let i = 0; i < fullStars; i++)
    starsHTML += '<i class="fas fa-star"></i>';
  if (halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
  for (let i = 0; i < emptyStars; i++)
    starsHTML += '<i class="far fa-star"></i>';

  return starsHTML;
}

document.addEventListener("mousemove", function (e) {
    const footer = document.getElementById("footer");
    const threshold = 60; 

    const mouseY = e.clientY;
    const windowHeight = window.innerHeight;

    if (windowHeight - mouseY <= threshold) {
      footer.classList.add("visible");
    } else {
      footer.classList.remove("visible");
    }
  });
