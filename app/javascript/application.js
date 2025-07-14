import { Application } from "@hotwired/stimulus";

window.Stimulus = Application.start();

import AnimeController from "./controllers/anime_controller.js";
Stimulus.register("anime", AnimeController);
