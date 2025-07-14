import { Application } from "@hotwired/stimulus";

window.Stimulus = Application.start();

import ThemeController from "./controllers/theme_controller.js";
Stimulus.register("theme", ThemeController);
import AnimeController from "./controllers/anime_controller.js";
Stimulus.register("anime", AnimeController);
