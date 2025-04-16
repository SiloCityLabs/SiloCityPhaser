import mitt from "mitt";
import Phaser from "phaser";

// Define an interface or type mapping event names to their payload types
type ApplicationEvents = {
  "current-scene-ready": Phaser.Scene;
  // 'player-died': void; // Example: Event with no payload
  // 'score-updated': number; // Example: Event with a number payload
};

// Create a typed emitter instance using the defined event map
const emitter = mitt<ApplicationEvents>();

export const EventBus = emitter;
