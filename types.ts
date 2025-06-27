
// GameState represents the current state of the player in the game.
export interface GameState {
  locationId: string;
  locationName: string;
  imageUrl: string;
  sceneId: string;
  narrative: string;
  actions: string[]; // This is kept as a simple array of strings for the UI.
  inventory: string[];
  flags: Record<string, boolean>;
}

// --- Story Data Structure ---
// The following types define the shape of the story data in the /data/locations files.

export interface Transition {
  locationId?: string; // If not provided, transition stays in the current location.
  sceneId: string;
}

export interface Action {
  text: string;
  transition: Transition;
  showIf?: {
    allSet?: string[];
    noneSet?: string[];
  };
}

export interface ItemUse {
  transition: Transition;
  consumed: boolean;
}

export interface Scene {
  narrative: string;
  actions: Action[];
  itemUse?: Record<string, ItemUse>;
  onEnter?: {
    addsItem?: string;
    setsFlag?: string;
  };
}

export interface LocationData {
  id: string;
  name: string;
  image: string;
  scenes: Record<string, Scene>;
}
