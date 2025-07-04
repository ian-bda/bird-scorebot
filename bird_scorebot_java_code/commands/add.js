const { SlashCommandBuilder } = require('discord.js');
const { getSpeciesScore, getAllSpecies } = require('../utils/csvHelper');
const { getUserPoints, setUserPoints } = require('../utils/userPointsHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a bird to your scoreboard!')
    .addStringOption(option =>
      option.setName('species')
        .setDescription('Name of the bird')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('place')
        .setDescription('Continent code (NA, SA, Africa, Asia, Europe, Oceania)')
        .setRequired(true)),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const allSpecies = getAllSpecies();

    const filtered = allSpecies.filter(name =>
      name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    await interaction.respond(
      filtered.slice(0, 25).map(name => ({ name, value: name }))
    );
  },

  async execute(interaction) {
    const rawSpecies = interaction.options.getString('species');
    const species = rawSpecies.toLowerCase();
    const placeInput = interaction.options.getString('place').toLowerCase();

    const placeMap = {
      na: 'na', sa: 'sa', africa: 'africa',
      asia: 'asia', europe: 'europe', oceania: 'oceania'
    };
    const place = placeMap[placeInput];
    if (!place) {
      return interaction.reply('Unknown place. Use: NA, SA, Africa, Asia, Europe, Oceania');
    }

    const score = getSpeciesScore(species, place);
    if (score === null) {
      return interaction.reply(`Could not find "${rawSpecies}" in bird list.`);
    }

    const userId = interaction.user.id;
    let userData = getUserPoints(userId);

    if (userData.birds.includes(species)) {
      return interaction.reply(`Mon chéri, you already found **${rawSpecies}**! 🪶`);
    }

    userData.total += score;
    userData.birds.push(species);

    setUserPoints(userId, userData.total, userData.birds);

    return interaction.reply(`Added **${rawSpecies}** for ${score} points! Total now: ${userData.total}`);
  }
};
