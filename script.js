const row = document.getElementById("row");
const cmbbox = document.getElementById("genres");
let movies = [];
const moviebtn = document.getElementById("movies");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const recentbtn = document.getElementById("recent");
const portfolioItem = document.getElementById("portfolio");
const topbtn = document.getElementById("top");
const latestbtn = document.getElementById("latest");

let currentPage = 1;
const itemsPerPage = 6;
const pagination = document.getElementById("pagination");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

document.addEventListener("DOMContentLoaded", async function () {
  await getMovies();
});
cmbbox.addEventListener("change", filterMoviesByGenre);
recentbtn.addEventListener("click", getRecentMovies);
topbtn.addEventListener("click", getTopMovies);
latestbtn.addEventListener("click", getLatestMovies);
searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    searchMovies();
  }
});

function renderPaginatedMovies(page = 1, data = movies) {
  const start = (page - 1) * itemsPerPage;
  const end = page * itemsPerPage;
  const paginatedItems = data.slice(start, end);

  let content = "";
  paginatedItems.forEach((movie) => {
    const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
    content += createLatestMovieCards(movie, lastPart);
  });
  portfolioItem.innerHTML = content;

  pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(data.length / itemsPerPage)}`;

  renderPageNumbers(page);

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
  firstBtn.disabled = currentPage === 1;
  lastBtn.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
}

function renderPageNumbers(page) {
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const pagination = document.getElementById("pagination");
  const pageNumberContainer = document.getElementById("pageNumbers");
  pageNumberContainer.innerHTML = '';

  const range = 3; 
  let startPage = page - Math.floor(range / 2);
  let endPage = page + Math.floor(range / 2);

  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(range, totalPages);
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - range + 1);
  }

  if (startPage > 1) {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    pageNumberContainer.appendChild(ellipsis);
    ellipsis.style.color="white";
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");

    if (i === page) {
      pageButton.classList.add("active");
    }

    pageButton.addEventListener("click", () => {
      currentPage = i;
      renderPaginatedMovies(currentPage);
    });
    pageNumberContainer.appendChild(pageButton);
  }

  if (endPage < totalPages) {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    pageNumberContainer.appendChild(ellipsis);
    ellipsis.style.color="white";
  }
};

  

// Event listener for prevBtn to go to the previous page
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPaginatedMovies(currentPage);
  }
});

// Event listener for nextBtn to go to the next page
nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPaginatedMovies(currentPage);
  }
});

// Event listener for firstBtn to go to the first page
firstBtn.addEventListener("click", () => {
  currentPage = 1;
  renderPaginatedMovies(currentPage);
});

// Event listener for lastBtn to go to the last page
lastBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  currentPage = totalPages;
  renderPaginatedMovies(currentPage);
});


function searchMovies() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (!searchTerm) {
    return;
  }

  const filteredMovies = movies.filter((movie) =>
    movie.name.toLowerCase().includes(searchTerm)
  );

  row.innerHTML = "";

  if (filteredMovies.length > 0) {
    filteredMovies.forEach((movie) => {
      row.innerHTML += createMovieCard(movie);
      portfolioItem.innerHTML += createLatestMovieCards(movie);
    });
  } else {
    row.innerHTML = "<p style='color:white;'>No results found.</p>";
    portfolioItem.innerHTML = "<p style='color:white;'>No results found.</p>";
  }
}
function filterMoviesByGenre() {
  const selectedGenre = cmbbox.value;
  let filteredMovies = [];

  if (selectedGenre === "All") {
    filteredMovies = movies;
  } else {
    filteredMovies = movies.filter((movie) =>
      movie.genres.includes(selectedGenre)
    );
  }
  const slider = $(".hero-area-slider");
  if (slider.hasClass("owl-loaded")) {
    slider.trigger("destroy.owl.carousel");
    slider.find(".owl-stage-outer").children().unwrap();
    slider.removeClass("owl-loaded owl-carousel");
  }

  row.innerHTML = "";

  let count = 0;
  let content = "";
  filteredMovies.forEach((movie) => {
    if (count < 10) {
      const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
      content += createMovieCard(movie, lastPart);
      count++;
    }
  });
  row.innerHTML = content;

  $(".hero-area-slider").addClass("owl-carousel").owlCarousel({
    items: 1,
    loop: true,
    nav: true,
    autoplay: true,
    autoplayTimeout: 5000,
    smartSpeed: 800,
  });
}

function getTopMovies() {
  let content = "";
  let count = 0;

  const topMovies = movies.filter((movie) => {
    return movie.rating.average > 8;
  });
  topMovies.forEach((movie) => {
    if (count < 6) {
      const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
      content += createLatestMovieCards(movie, lastPart);
      count++;
    }
  });

  portfolioItem.innerHTML = content;
}

function getRecentMovies() {
  let content = "";
  let count = 0;
  const latestMovies = movies.filter((movie) => {
    if (!movie.premiered) return false;
    const year = new Date(movie.premiered).getFullYear();
    return year === 2014;
  });
  latestMovies.forEach((movie) => {
    if (count < 6) {
      const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
      content += createLatestMovieCards(movie, lastPart);
      count++;
    }
  });
  portfolioItem.innerHTML = content;
}

function getLatestMovies() {
  let content = "";
  let count = 0;
  movies.forEach((movie) => {
    if (count < 6) {
      const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
      content += createLatestMovieCards(movie, lastPart);
      count++;
    }
  });
  portfolioItem.innerHTML = content;
}

function getAllMovies() {
  let content = "";
  movies.forEach((movie) => {
    const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
    content += createLatestMovieCards(movie, lastPart);
  });
  console.log(movies);
  portfolioItem.innerHTML = content;
}

async function getMovies() {
  let response = await fetch("https://api.tvmaze.com/shows");
  movies = await response.json();

  const slider = $(".hero-area-slider");
  if (slider.hasClass("owl-loaded")) {
    slider.trigger("destroy.owl.carousel");
    slider.find(".owl-stage-outer").children().unwrap();
    slider.removeClass("owl-loaded owl-carousel");
  }

  row.innerHTML = "";
  let content = "";
  let count = 0;

  movies.forEach((movie) => {
    if (count < 10) {
      const lastPart = movie.url.substring(movie.url.lastIndexOf("/") + 1);
      content += createMovieCard(movie, lastPart);
      count++;
    }
  });

  row.innerHTML = content;

  $(".hero-area-slider").addClass("owl-carousel").owlCarousel({
    items: 1,
    loop: true,
    nav: true,
    autoplay: true,
    autoplayTimeout: 5000,
    smartSpeed: 800,
  });
  renderPaginatedMovies();
  pagination.style.display = "block";

  const genres = [...new Set(movies.flatMap((movie) => movie.genres))];
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    cmbbox.appendChild(option);
  });
}

function createLatestMovieCards(movie, lastPart) {
  return `
  <div class="col-md-4 col-sm-6 released">
    <div class="single-portfolio">
      <div class="single-portfolio-img">
        <img src="${movie.image.medium}"  alt="${movie.name}" />
        <a
          href="https://www.justwatch.com/us/tv-show/${lastPart}"
          class="popup-youtube"
        >
          <i class="icofont icofont-ui-play"></i>
        </a>
      </div>
      <div class="portfolio-content">
        <h2>${movie.name}</h2>
        <div class="review">
          <div class="author-review">
          ${generateStars(movie.rating.average || 0)}
          </div>
          <h4>${Math.floor(Math.random() * 300 + 100)}k voters</h4>
        </div>
      </div>
    </div>
  </div>`;
}
function createMovieCard(movie, lastPart) {
  return `
    <div class="row hero-area-slide">
      <div class="col-lg-6 col-md-5">
        <a href="https://www.justwatch.com/us/tv-show/${lastPart}" target="_blank" style="text-decoration: none; color: inherit;">
          <div class="hero-area-content">
            <img src="${
              movie.image.medium
            }"  style="padding-left: 0px; padding-top: 70px; width:450px;" alt="${
    movie.name
  }" />
          </div>
        </a>
      </div>
      <div class="col-lg-6 col-md-7">
        <div class="hero-area-content pr-50">
          <h2>${movie.name}</h2>
          <div class="review">
            <div class="author-review">
              ${generateStars(movie.rating.average || 0)}
            </div>
            <h4>${Math.floor(Math.random() * 300 + 100)}k voters</h4>
          </div>
          <p>${movie.summary}</p>
          <div class="slide-trailor">
            <h3>Watch Trailer</h3>
            <a class="theme-btn theme-btn2" href="https://www.justwatch.com/us/tv-show/${lastPart}" target="_blank">
              <i class="icofont icofont-play"></i> Watch Now
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

$(document).ready(function () {
  $(".hero-area-slider").owlCarousel({
    items: 1,
    loop: true,
    nav: true,
    autoplay: true,
    autoplayTimeout: 5000,
    smartSpeed: 800,
  });
});

function generateStars(rating = 0) {
  const maxStars = 5;
  const scaledRating = rating / 2;
  const fullStars = Math.floor(scaledRating);
  const halfStar = scaledRating % 1 >= 0.1;
  const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

  let starsHTML = "";

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }

  return starsHTML;
}
