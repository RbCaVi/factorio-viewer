function clone(data){
  return JSON.parse(JSON.stringify(data));
};

util={};

util.itemtypes=[
  'item',
  'ammo',
  'capsule',
  'gun',
  'item-with-entity-data',
  'item-with-label',
  'item-with-inventory',
  'blueprint-book',
  'item-with-tags',
  'selection-tool',
  'blueprint',
  'copy-paste-tool',
  'deconstruction-item',
  'upgrade-item',
  'module',
  'rail-planner',
  'spidertron-remote',
  'tool',
  'armor',
  'repair-tool'
]

util.equipmenttypes=[
  'active-defense-equipment',
  'battery-equipment',
  'belt-immunity-equipment',
  'energy-shield-equipment',
  'generator-equipment',
  'movement-bonus-equipment',
  'night-vision-equipment',
  'roboport-equipment',
  'solar-panel-equipment',
]

util.entitytypes=[
  "arrow",
  "artillery-flare",
  "artillery-projectile",
  "beam",
  "character-corpse",
  "cliff",
  "corpse",
  "rail-remnants",
  "deconstructible-tile-proxy",
  "entity-ghost",
  "accumulator",
  "artillery-turret",
  "beacon",
  "boiler",
  "burner-generator",
  "character",
  "arithmetic-combinator",
  "decider-combinator",
  "constant-combinator",
  "container",
  "logistic-container",
  "infinity-container",
  "assembling-machine",
  "rocket-silo",
  "furnace",
  "electric-energy-interface",
  "electric-pole",
  "unit-spawner",
  "combat-robot",
  "construction-robot",
  "logistic-robot",
  "gate",
  "generator",
  "heat-interface",
  "heat-pipe",
  "inserter",
  "lab",
  "lamp",
  "land-mine",
  "linked-container",
  "market",
  "mining-drill",
  "offshore-pump",
  "pipe",
  "infinity-pipe",
  "pipe-to-ground",
  "player-port",
  "power-switch",
  "programmable-speaker",
  "pump",
  "radar",
  "curved-rail",
  "straight-rail",
  "rail-chain-signal",
  "rail-signal",
  "reactor",
  "roboport",
  "simple-entity-with-owner",
  "simple-entity-with-force",
  "solar-panel",
  "storage-tank",
  "train-stop",
  "linked-belt",
  "loader-1x1",
  "loader",
  "splitter",
  "transport-belt",
  "underground-belt",
  "turret",
  "ammo-turret",
  "electric-turret",
  "fluid-turret",
  "unit",
  "car",
  "artillery-wagon",
  "cargo-wagon",
  "fluid-wagon",
  "locomotive",
  "spider-vehicle",
  "wall",
  "fish",
  "simple-entity",
  "spider-leg",
  "tree",
  "explosion",
  "flame-thrower-explosion",
  "fire",
  "stream",
  "flying-text",
  "highlight-box",
  "item-entity",
  "item-request-proxy",
  "particle-source",
  "projectile",
  "resource",
  "rocket-silo-rocket",
  "rocket-silo-rocket-shadow",
  "smoke-with-trigger",
  "speech-bubble",
  "sticker",
  "tile-ghost"
]

util.difficulty=['normal','expensive']

export {clone,util}