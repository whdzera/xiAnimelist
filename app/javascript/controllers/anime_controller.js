import { Controller } from "@hotwired/stimulus";

export default class AnimeController extends Controller {
  static targets = [
    "animeGrid",
    "searchInput",
    "loadingOverlay",
    "modal",
    "modalContent",
    "sectionTitle",
    "charactersGrid",
    "loadMoreChars",
    "trailerSection",
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
    this.sectionTitleTarget.textContent = "Popular Anime";
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
    this.sectionTitleTarget.textContent = "Top Rated Anime";
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
    this.sectionTitleTarget.textContent = "Upcoming Anime";
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
        <!-- Info Section -->
        <div class="glass-morphism rounded-xl p-4">
          <h3 class="text-white font-bold text-xl mb-4">Information</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-white/70">Status:</span>
              <span class="text-white">${anime.status}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/70">Source:</span>
              <span class="text-white">${anime.source || "Unknown"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/70">Episodes:</span>
              <span class="text-white">${anime.episodes || "?"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/70">Duration:</span>
              <span class="text-white">${anime.duration || "Unknown"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/70">Rating:</span>
              <span class="text-white">${anime.rating || "Unknown"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/70">Season:</span>
              <span class="text-white">${
                anime.season ? anime.season + " " + anime.year : "Unknown"
              }</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/70">Aired:</span>
              <span class="text-white">${anime.aired.string || "Unknown"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/70">Broadcast:</span>
              <span class="text-white">${
                anime.broadcast.string || "Unknown"
              }</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:w-2/3">
        <h2 class="text-4xl font-bold text-white mb-4">${anime.title}</h2>
        <div class="flex items-center gap-4 mb-6">
          <span class="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold">⭐ ${rating}</span>
          <span class="status-badge px-4 py-2 rounded-full text-white ${this.getStatusColor(
            anime.status
          )}">${anime.status}</span>
        </div>
        
        <p class="text-white/80 text-lg leading-relaxed mb-6">${
          anime.synopsis || "No synopsis available"
        }</p>

        <!-- Trailer Section -->
        ${
          anime.trailer.embed_url
            ? `
          <div class="mb-8" data-anime-target="trailerSection">
            <h3 class="text-white font-bold text-xl mb-4">Trailer</h3>
            <div class="relative pt-[56.25%]">
              <iframe src="${anime.trailer.embed_url}" 
                      class="absolute inset-0 w-full h-full rounded-xl"
                      frameborder="0" 
                      allow="encrypted-media" 
                      allowfullscreen>
              </iframe>
            </div>
          </div>
        `
            : ""
        }

        <!-- Characters & Voice Actors Section -->
        <div class="mb-8">
          <h3 class="text-white font-bold text-xl mb-4">Characters & Voice Actors</h3>
          <div class="space-y-4" data-anime-target="charactersGrid">
            <!-- Characters will be loaded dynamically -->
          </div>
          <button 
            class="mt-4 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 w-full"
            data-anime-target="loadMoreChars"
            data-action="click->anime#loadMoreCharacters">
            Load More
          </button>
        </div>

        <!-- Related Anime Section -->
        <div class="mb-8">
          <h3 class="text-white font-bold text-xl mb-4">Related Anime</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-anime-target="relatedAnimeGrid">
            <!-- Related anime will be loaded dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

    // Load data
    this.loadCharacters(anime.mal_id);
    this.loadRelatedAnime(anime.mal_id);
  }

  // Add these new methods to load characters and related anime
  async loadCharacters(animeId) {
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${animeId}/characters`
      );
      const data = await response.json();
      this.allCharacters = data.data; // Store all characters
      this.currentCharPage = 0;
      this.renderCharacters(this.allCharacters.slice(0, 9)); // Show first 9 characters
      this.updateLoadMoreButton();
    } catch (error) {
      console.error("Error loading characters:", error);
      this.charactersGridTarget.innerHTML =
        '<div class="text-center text-white/70">Failed to load characters</div>';
    }
  }

  renderCharacters(characters) {
    const grid = this.charactersGridTarget;
    grid.innerHTML = characters
      .map((char) => {
        // Filter for Japanese voice actor
        const japaneseVA = char.voice_actors.find(
          (va) => va.language === "Japanese"
        );

        return `
          <div class="glass-morphism rounded-lg p-4 flex items-center gap-4">
            <div class="flex gap-4 items-center flex-1">
              <img src="${char.character.images.jpg.image_url}" 
                   alt="${char.character.name}" 
                   class="w-16 h-16 rounded-full object-cover">
              <div>
                <p class="text-white font-medium">${char.character.name}</p>
                <p class="text-white/60 text-sm">${
                  char.role || "Unknown role"
                }</p>
              </div>
            </div>
            ${
              japaneseVA
                ? `
              <div class="flex gap-4 items-center flex-1">
                <img src="${japaneseVA.person.images.jpg.image_url}" 
                     alt="${japaneseVA.person.name}" 
                     class="w-16 h-16 rounded-full object-cover">
                <div>
                  <p class="text-white font-medium">${japaneseVA.person.name}</p>
                  <p class="text-white/60 text-sm">Japanese VA</p>
                </div>
              </div>
            `
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  async loadRelatedAnime(animeId) {
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${animeId}/relations`
      );
      const data = await response.json();
      this.renderRelatedAnime(data.data);
    } catch (error) {
      console.error("Error loading related anime:", error);
      document.querySelector(
        '[data-anime-target="relatedAnimeGrid"]'
      ).innerHTML =
        '<div class="text-center text-white/70">Failed to load related anime</div>';
    }
  }

  renderRelatedAnime(relations) {
    const grid = document.querySelector(
      '[data-anime-target="relatedAnimeGrid"]'
    );
    grid.innerHTML = relations
      .map(
        (relation) => `
    <div class="glass-morphism rounded-lg p-4">
      <div class="font-medium text-white/80 mb-1">${relation.relation}</div>
      <ul class="space-y-1">
        ${relation.entry
          .map(
            (entry) => `
          <li class="text-white hover:text-blue-400 cursor-pointer text-sm">
            ${entry.name}
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `
      )
      .join("");
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

  async filterByType(event) {
    const type = event.target.value;
    this.showLoading();
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?type=${type}`
      );
      const data = await response.json();
      this.renderAnimeGrid(data.data);
    } catch (error) {
      console.error("Error filtering anime:", error);
      this.showError("Failed to filter anime");
    } finally {
      this.hideLoading();
    }
  }

  async filterByGenre(event) {
    const genreId = event.target.value;
    if (genreId === "all") {
      this.loadPopular();
      return;
    }

    this.showLoading();
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?genres=${genreId}`
      );
      const data = await response.json();
      this.renderAnimeGrid(data.data);
    } catch (error) {
      console.error("Error filtering by genre:", error);
      this.showError("Failed to filter by genre");
    } finally {
      this.hideLoading();
    }
  }

  sortBy(event) {
    const sortType = event.currentTarget.dataset.sort;
    const animeList = [...this.animeGridTarget.children];

    animeList.sort((a, b) => {
      if (sortType === "score") {
        const scoreA = parseFloat(a.querySelector(".score").textContent);
        const scoreB = parseFloat(b.querySelector(".score").textContent);
        return scoreB - scoreA;
      } else if (sortType === "title") {
        const titleA = a.querySelector("h3").textContent;
        const titleB = b.querySelector("h3").textContent;
        return titleA.localeCompare(titleB);
      }
    });

    this.animeGridTarget.innerHTML = "";
    animeList.forEach((anime) => this.animeGridTarget.appendChild(anime));
  }

  loadMoreCharacters() {
    this.currentCharPage++;
    const start = this.currentCharPage * 9;
    const end = start + 9;
    const nextCharacters = this.allCharacters.slice(start, end);

    const newCards = nextCharacters
      .map((char) => {
        // Filter for Japanese voice actor
        const japaneseVA = char.voice_actors.find(
          (va) => va.language === "Japanese"
        );

        return `
          <div class="glass-morphism rounded-lg p-4 flex items-center gap-4 fade-in">
            <div class="flex gap-4 items-center flex-1">
              <img src="${char.character.images.jpg.image_url}" 
                   alt="${char.character.name}" 
                   class="w-16 h-16 rounded-full object-cover">
              <div>
                <p class="text-white font-medium">${char.character.name}</p>
                <p class="text-white/60 text-sm">${
                  char.role || "Unknown role"
                }</p>
              </div>
            </div>
            ${
              japaneseVA
                ? `
              <div class="flex gap-4 items-center flex-1">
                <img src="${japaneseVA.person.images.jpg.image_url}" 
                     alt="${japaneseVA.person.name}" 
                     class="w-16 h-16 rounded-full object-cover">
                <div>
                  <p class="text-white font-medium">${japaneseVA.person.name}</p>
                  <p class="text-white/60 text-sm">Japanese VA</p>
                </div>
              </div>
            `
                : ""
            }
          </div>
        `;
      })
      .join("");

    this.charactersGridTarget.insertAdjacentHTML("beforeend", newCards);
    this.updateLoadMoreButton();
  }

  updateLoadMoreButton() {
    const remainingChars =
      this.allCharacters.length - (this.currentCharPage + 1) * 9;
    if (remainingChars <= 0) {
      this.loadMoreCharsTarget.classList.add("hidden");
    } else {
      this.loadMoreCharsTarget.classList.remove("hidden");
      this.loadMoreCharsTarget.textContent = `Load More (${remainingChars} remaining)`;
    }
  }
}
