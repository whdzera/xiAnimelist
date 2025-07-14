import { Controller } from "@hotwired/stimulus";

export default class AnimeController extends Controller {
  static targets = [
    "animeGrid",
    "searchInput",
    "loadingOverlay",
    "modal",
    "modalContent",
  ];

  connect() {
    this.loadPopular();
    this.searchTimeout = null;
  }

  showLoading() {
    this.loadingOverlayTarget.classList.remove("hidden");
  }

  hideLoading() {
    this.loadingOverlayTarget.classList.add("hidden");
  }

  async loadPopular() {
    this.showLoading();
    try {
      const response = await fetch(
        "https://api.jikan.moe/v4/top/anime?type=tv&filter=bypopularity&limit=20"
      );
      const data = await response.json();
      this.renderAnimeGrid(data.data);
    } catch (error) {
      console.error("Error loading popular anime:", error);
      this.showError("Failed to load popular anime");
    } finally {
      this.hideLoading();
    }
  }

  async loadTopRated() {
    this.showLoading();
    try {
      const response = await fetch(
        "https://api.jikan.moe/v4/top/anime?type=tv&filter=favorite&limit=20"
      );
      const data = await response.json();
      this.renderAnimeGrid(data.data);
    } catch (error) {
      console.error("Error loading top rated anime:", error);
      this.showError("Failed to load top rated anime");
    } finally {
      this.hideLoading();
    }
  }

  async loadUpcoming() {
    this.showLoading();
    try {
      const response = await fetch(
        "https://api.jikan.moe/v4/seasons/upcoming?limit=20"
      );
      const data = await response.json();
      this.renderAnimeGrid(data.data);
    } catch (error) {
      console.error("Error loading upcoming anime:", error);
      this.showError("Failed to load upcoming anime");
    } finally {
      this.hideLoading();
    }
  }

  search() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const query = this.searchInputTarget.value.trim();
      if (query.length > 2) {
        this.performSearch(query);
      } else if (query.length === 0) {
        this.loadPopular();
      }
    }, 500);
  }

  async performSearch(query) {
    this.showLoading();
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();
      this.renderAnimeGrid(data.data);
    } catch (error) {
      console.error("Error searching anime:", error);
      this.showError("Failed to search anime");
    } finally {
      this.hideLoading();
    }
  }

  renderAnimeGrid(animeList) {
    const grid = this.animeGridTarget;
    grid.innerHTML = "";

    animeList.forEach((anime, index) => {
      const animeCard = this.createAnimeCard(anime);
      animeCard.style.animationDelay = `${index * 0.1}s`;
      grid.appendChild(animeCard);
    });
  }

  createAnimeCard(anime) {
    const card = document.createElement("div");
    card.className =
      "anime-card glass-morphism rounded-2xl overflow-hidden cursor-pointer fade-in";
    card.dataset.animeId = anime.mal_id;
    card.addEventListener("click", () => this.showAnimeDetails(anime.mal_id));

    const statusColor = this.getStatusColor(anime.status);
    const rating = anime.score ? anime.score.toFixed(1) : "N/A";
    const year = anime.year || "TBA";

    card.innerHTML = `
                    <div class="relative">
                        <img src="${anime.images.jpg.large_image_url}" alt="${
      anime.title
    }" class="w-full h-80 object-cover">
                        <div class="absolute top-4 left-4">
                            <span class="status-badge px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColor}">
                                ${anime.status}
                            </span>
                        </div>
                        <div class="absolute top-4 right-4">
                            <span class="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                                ⭐ ${rating}
                            </span>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-white font-bold text-lg mb-2 line-clamp-2">${
                          anime.title
                        }</h3>
                        <p class="text-white/70 text-sm mb-4 line-clamp-3">${
                          anime.synopsis || "No synopsis available"
                        }</p>
                        <div class="flex justify-between items-center">
                            <span class="text-white/60 text-sm">${year}</span>
                            <span class="text-white/60 text-sm">${
                              anime.episodes || "?"
                            } episodes</span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-4">
                            ${anime.genres
                              .slice(0, 2)
                              .map(
                                (genre) =>
                                  `<span class="genre-tag px-2 py-1 text-xs text-white rounded-full">${genre.name}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                `;

    return card;
  }

  getStatusColor(status) {
    const colors = {
      "Currently Airing": "bg-green-500",
      "Finished Airing": "bg-blue-500",
      "Not yet aired": "bg-orange-500",
      Cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  }

  async showAnimeDetails(animeId) {
    this.showLoading();
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
      const data = await response.json();
      this.renderAnimeModal(data.data);
      this.modalTarget.classList.remove("hidden");
    } catch (error) {
      console.error("Error loading anime details:", error);
      this.showError("Failed to load anime details");
    } finally {
      this.hideLoading();
    }
  }

  renderAnimeModal(anime) {
    const rating = anime.score ? anime.score.toFixed(1) : "N/A";
    const year = anime.year || "TBA";

    this.modalContentTarget.innerHTML = `
                    <div class="flex flex-col lg:flex-row gap-8">
                        <div class="lg:w-1/3">
                            <img src="${
                              anime.images.jpg.large_image_url
                            }" alt="${anime.title}" class="w-full rounded-2xl">
                        </div>
                        <div class="lg:w-2/3">
                            <h2 class="text-4xl font-bold text-white mb-4">${
                              anime.title
                            }</h2>
                            <div class="flex items-center gap-4 mb-6">
                                <span class="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold">
                                    ⭐ ${rating}
                                </span>
                                <span class="status-badge px-4 py-2 rounded-full text-white ${this.getStatusColor(
                                  anime.status
                                )}">
                                    ${anime.status}
                                </span>
                                <span class="text-white/70">${year}</span>
                                <span class="text-white/70">${
                                  anime.episodes || "?"
                                } episodes</span>
                            </div>
                            <p class="text-white/80 text-lg leading-relaxed mb-6">${
                              anime.synopsis || "No synopsis available"
                            }</p>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h4 class="text-white font-semibold mb-2">Studio</h4>
                                    <p class="text-white/70">${
                                      anime.studios
                                        .map((studio) => studio.name)
                                        .join(", ") || "Unknown"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="text-white font-semibold mb-2">Source</h4>
                                    <p class="text-white/70">${
                                      anime.source || "Unknown"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="text-white font-semibold mb-2">Duration</h4>
                                    <p class="text-white/70">${
                                      anime.duration || "Unknown"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="text-white font-semibold mb-2">Rating</h4>
                                    <p class="text-white/70">${
                                      anime.rating || "Unknown"
                                    }</p>
                                </div>
                            </div>
                            <div class="mb-6">
                                <h4 class="text-white font-semibold mb-3">Genres</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${anime.genres
                                      .map(
                                        (genre) =>
                                          `<span class="genre-tag px-3 py-1 text-sm text-white rounded-full">${genre.name}</span>`
                                      )
                                      .join("")}
                                </div>
                            </div>
                            <div class="flex gap-4">
                                <button class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                                    Add to Watchlist
                                </button>
                                <button class="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300" data-action="click->anime-app#closeModal">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                `;
  }

  closeModal() {
    this.modalTarget.classList.add("hidden");
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  showError(message) {
    this.animeGridTarget.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="glass-morphism rounded-2xl p-8 max-w-md mx-auto">
                            <div class="text-red-400 text-6xl mb-4">😢</div>
                            <h3 class="text-xl font-bold text-white mb-2">Oops!</h3>
                            <p class="text-white/70">${message}</p>
                        </div>
                    </div>
                `;
  }
}
