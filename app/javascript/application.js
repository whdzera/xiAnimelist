import { Application } from "@hotwired/stimulus";

window.Stimulus = Application.start();

import MessageController from "./controllers/message_controller.js";
Stimulus.register("message", MessageController);

class AnimeApp {
  constructor() {
    this.currentPage = 1;
    this.currentQuery = "";
    this.currentFilter = "airing";
    this.isLoading = false;
    this.animeCache = new Map();

    this.initializeApp();
  }

  async initializeApp() {
    this.setupEventListeners();
    await this.loadAnime("airing");
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    searchBtn.addEventListener("click", () => this.handleSearch());
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setActiveFilter(e.target);
        this.currentFilter = e.target.dataset.type;
        this.currentPage = 1;
        this.loadAnime(this.currentFilter);
      });
    });

    // Load more button
    document.getElementById("loadMoreBtn").addEventListener("click", () => {
      this.currentPage++;
      this.loadAnime(this.currentFilter, true);
    });

    // Modal close
    document.getElementById("animeModal").addEventListener("click", (e) => {
      if (e.target.id === "animeModal") {
        this.closeModal();
      }
    });
  }

  setActiveFilter(activeBtn) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("bg-white", "text-purple-600");
    });
    activeBtn.classList.add("bg-white", "text-purple-600");
  }

  async handleSearch() {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;

    this.currentQuery = query;
    this.currentPage = 1;
    await this.searchAnime(query);
  }

  showLoading() {
    document.getElementById("loadingSpinner").classList.remove("hidden");
  }

  hideLoading() {
    document.getElementById("loadingSpinner").classList.add("hidden");
  }

  async searchAnime(query) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          query
        )}&limit=20&page=${this.currentPage}`
      );
      const data = await response.json();

      if (this.currentPage === 1) {
        this.clearGrid();
      }

      this.displayAnime(data.data);
      this.toggleLoadMoreButton(data.pagination.has_next_page);
    } catch (error) {
      console.error("Error searching anime:", error);
      this.showError("Gagal mencari anime. Silakan coba lagi.");
    } finally {
      this.hideLoading();
      this.isLoading = false;
    }
  }

  async loadAnime(type, append = false) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      let url;
      switch (type) {
        case "airing":
          url = `https://api.jikan.moe/v4/seasons/now?limit=20&page=${this.currentPage}`;
          break;
        case "upcoming":
          url = `https://api.jikan.moe/v4/seasons/upcoming?limit=20&page=${this.currentPage}`;
          break;
        case "bypopularity":
          url = `https://api.jikan.moe/v4/top/anime?type=tv&limit=20&page=${this.currentPage}`;
          break;
        case "favorite":
          url = `https://api.jikan.moe/v4/top/anime?type=tv&filter=favorite&limit=20&page=${this.currentPage}`;
          break;
        default:
          url = `https://api.jikan.moe/v4/seasons/now?limit=20&page=${this.currentPage}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!append) {
        this.clearGrid();
      }

      this.displayAnime(data.data);
      this.toggleLoadMoreButton(data.pagination.has_next_page);
    } catch (error) {
      console.error("Error loading anime:", error);
      this.showError("Gagal memuat anime. Silakan coba lagi.");
    } finally {
      this.hideLoading();
      this.isLoading = false;
    }
  }

  displayAnime(animeList) {
    const grid = document.getElementById("animeGrid");

    animeList.forEach((anime) => {
      const animeCard = this.createAnimeCard(anime);
      grid.appendChild(animeCard);
    });
  }

  createAnimeCard(anime) {
    const card = document.createElement("div");
    card.className =
      "anime-card rounded-xl overflow-hidden card-hover cursor-pointer fade-in";

    const score = anime.score || "N/A";
    const year = anime.year || "TBA";
    const episodes = anime.episodes || "?";
    const status = anime.status || "Unknown";

    card.innerHTML = `
                    <div class="relative">
                        <img 
                            src="${anime.images.jpg.large_image_url}" 
                            alt="${anime.title}"
                            class="w-full h-64 object-cover"
                            loading="lazy"
                        >
                        <div class="absolute top-3 right-3 bg-black bg-opacity-75 rounded-full px-2 py-1 text-xs star-rating">
                            ⭐ ${score}
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                            <h3 class="font-bold text-sm mb-1 text-shadow">${anime.title}</h3>
                            <div class="text-xs opacity-90">
                                ${year} • ${episodes} Episodes • ${status}
                            </div>
                        </div>
                    </div>
                `;

    card.addEventListener("click", () => this.showAnimeDetails(anime));

    return card;
  }

  async showAnimeDetails(anime) {
    const modal = document.getElementById("animeModal");
    const modalContent = document.getElementById("modalContent");

    // Show loading in modal
    modalContent.innerHTML = `
                    <div class="flex justify-center items-center h-64">
                        <div class="loading-spinner w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                    </div>
                `;

    modal.classList.remove("hidden");

    try {
      // Get detailed anime info
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${anime.mal_id}/full`
      );
      const detailData = await response.json();
      const animeDetail = detailData.data;

      const genres =
        animeDetail.genres.map((g) => g.name).join(", ") || "Unknown";
      const studios =
        animeDetail.studios.map((s) => s.name).join(", ") || "Unknown";
      const score = animeDetail.score || "N/A";
      const members = animeDetail.members || 0;
      const synopsis = animeDetail.synopsis || "No synopsis available.";

      modalContent.innerHTML = `
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="md:w-1/3">
                                <img 
                                    src="${
                                      animeDetail.images.jpg.large_image_url
                                    }" 
                                    alt="${animeDetail.title}"
                                    class="w-full rounded-lg shadow-lg"
                                >
                            </div>
                            <div class="md:w-2/3">
                                <div class="flex justify-between items-start mb-4">
                                    <h2 class="text-2xl font-bold text-purple-300">${
                                      animeDetail.title
                                    }</h2>
                                    <button onclick="app.closeModal()" class="text-gray-400 hover:text-white text-2xl">×</button>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span class="text-gray-400">Score:</span>
                                        <span class="ml-2 star-rating">⭐ ${score}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Episodes:</span>
                                        <span class="ml-2">${
                                          animeDetail.episodes || "?"
                                        }</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Status:</span>
                                        <span class="ml-2">${
                                          animeDetail.status
                                        }</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Year:</span>
                                        <span class="ml-2">${
                                          animeDetail.year || "TBA"
                                        }</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Studio:</span>
                                        <span class="ml-2">${studios}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Members:</span>
                                        <span class="ml-2">${members.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <h4 class="font-semibold text-purple-300 mb-2">Genres:</h4>
                                    <div class="flex flex-wrap gap-2">
                                        ${animeDetail.genres
                                          .map(
                                            (genre) =>
                                              `<span class="genre-tag px-2 py-1 rounded-full text-xs">${genre.name}</span>`
                                          )
                                          .join("")}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 class="font-semibold text-purple-300 mb-2">Synopsis:</h4>
                                    <p class="text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto">${synopsis}</p>
                                </div>
                                
                                <div class="mt-6 flex gap-3">
                                    <a href="${
                                      animeDetail.url
                                    }" target="_blank" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-all duration-300">
                                        View on MyAnimeList
                                    </a>
                                    ${
                                      animeDetail.trailer.url
                                        ? `<a href="${animeDetail.trailer.url}" target="_blank" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all duration-300">
                                            Watch Trailer
                                        </a>`
                                        : ""
                                    }
                                </div>
                            </div>
                        </div>
                    `;
    } catch (error) {
      console.error("Error loading anime details:", error);
      modalContent.innerHTML = `
                        <div class="text-center py-8">
                            <div class="text-red-500 mb-4">❌ Gagal memuat detail anime</div>
                            <button onclick="app.closeModal()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">
                                Tutup
                            </button>
                        </div>
                    `;
    }
  }

  closeModal() {
    document.getElementById("animeModal").classList.add("hidden");
  }

  clearGrid() {
    document.getElementById("animeGrid").innerHTML = "";
  }

  toggleLoadMoreButton(hasMore) {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (hasMore) {
      loadMoreBtn.classList.remove("hidden");
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  }

  showError(message) {
    const grid = document.getElementById("animeGrid");
    grid.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="text-red-500 text-lg mb-4">❌ ${message}</div>
                        <button onclick="location.reload()" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-all duration-300">
                            Refresh Page
                        </button>
                    </div>
                `;
  }
}

// Initialize the app
const app = new AnimeApp();
