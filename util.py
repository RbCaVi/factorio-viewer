import sys,os
import json

itemtypes=[
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

equipmenttypes=[
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

entitytypes=[
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

root='/home/rvail/seauto/SEAutoUpdate/'

todofile='todo.txt'

fdir='/home/rvail/Desktop/factorios/SEtest/'

fexe=['wine',os.path.join(fdir,'bin/x64/factorio.exe')]

difficulty=['normal','expensive']

dodebug=False

def pj(x):
  if type(x) not in [int,float,dict,list,str] and x is not None:
    x=list(x)
  debug(json.dumps(x,indent=2))

def debug(*a):
  if dodebug:
    print(*a)

def trace(f):
    def g(*args,**kwargs):
        try:
            return f(*args,**kwargs)
        except Exception as e:
            print(args,kwargs)
            raise e
    return g
