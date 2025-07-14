import { Application } from "@hotwired/stimulus";

window.Stimulus = Application.start();

import MessageController from "./controllers/message_controller.js";
Stimulus.register("message", MessageController);
import AnimeController from "./controllers/anime_controller.js"
Stimulus.register("anime", AnimeController);
