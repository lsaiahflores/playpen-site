/* Franchise, character and console names that must never appear anywhere on the site (copy, alt text, file names, demo).
   The site mentions the real tools it is built on (Claude, Ollama, GitHub, Supabase); those are not in this list. */
'use strict';
const words = [
  'mario', 'luigi', 'zelda', 'nintendo', 'pokemon', 'pokémon', 'pikachu', 'metroid', 'kirby', 'donkey\\s*kong', 'smash\\s*bros', 'animal\\s*crossing',
  'sonic', 'sega', 'mega\\s*drive', 'genesis\\s*console', 'playstation', 'ps[1-5]', 'xbox', 'game\\s*boy', 'gameboy', 'snes', 'n64', 'gamecube',
  'minecraft', 'fortnite', 'roblox', 'among\\s*us', 'tetris', 'pac-?man', 'pacman', 'space\\s*invaders', 'street\\s*fighter', 'mortal\\s*kombat',
  'grand\\s*theft', 'gta\\s*v?', 'call\\s*of\\s*duty', 'halo', 'doom', 'counter-?strike', 'overwatch', 'valorant', 'apex\\s*legends', 'league\\s*of\\s*legends',
  'skyrim', 'fallout', 'elden\\s*ring', 'dark\\s*souls', 'god\\s*of\\s*war', 'assassin.s\\s*creed', 'resident\\s*evil', 'final\\s*fantasy', 'zelda',
  'disney', 'pixar', 'marvel', 'star\\s*wars', 'harry\\s*potter', 'hogwarts', 'batman', 'spider-?man', 'transformers', 'hello\\s*kitty', 'peppa'
];
module.exports = words.map((w) => new RegExp('(^|[^a-z0-9])(' + w + ')([^a-z0-9]|$)', 'i'));
