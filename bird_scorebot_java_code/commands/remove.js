const { SlashCommandBuilder } = require('discord.js');
const { getUserPoints, setUserPoints, removeUserPoints } = require('../utils/userPointsHelper');
const { getSpeciesScore } = require('../utils/csvHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove points for a bird from your scoreboard!')
    .addStringOption(option =>
      option.setName('species')
        .setDescription('Name of the bird (leave empty to see your counted birds)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('place')
        .setDescription('Continent code (NA, SA, Africa, Asia, Europe, Oceania)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('points')
        .setDescription('Number of points to remove')
        .setRequired(false)),

  async execute(interaction) {
    const species = interaction.options.getString('species')?.toLowerCase();
    const placeInput = interaction.options.getString('place')?.toLowerCase();
    const pointsToRemove = interaction.options.getInteger('points');

    const userId = interaction.user.id;
    let userData = getUserPoints(userId);

    // If no species provided, show list of counted birds
    if (!species) {
      if (userData.birds.length === 0) {
        return interaction.reply('You haven\'t counted any birds yet!');
      }
      
      const birdList = userData.birds.map(bird => `• ${bird}`).join('\n');
      return interaction.reply(`**Your counted birds:**\n${birdList}\n\nTotal points: ${userData.total}`);
    }

    // If species provided but missing other parameters, show error
    if (!placeInput || pointsToRemove === null) {
      return interaction.reply('Please provide both place and points when removing a specific bird.');
    }

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
      return interaction.reply(`Could not find "${species}" in bird list.`);
    }

    if (!userData.birds.includes(species)) {
      return interaction.reply(`You haven't added **${species}** yet.`);
    }

    if (pointsToRemove > userData.total) {
      return interaction.reply(`You can't remove more points than your current total (${userData.total}).`);
    }

    userData.total -= pointsToRemove;
    if (userData.total < 0) userData.total = 0;

    if (pointsToRemove >= score) {
      userData.birds = userData.birds.filter(b => b !== species);
    }

    if (userData.total === 0 && userData.birds.length === 0) {
      removeUserPoints(userId);
    } else {
      setUserPoints(userId, userData.total, userData.birds);
    }

    return interaction.reply(`Removed ${pointsToRemove} points for **${species}**. Total now: ${userData.total}`);
  }
};
