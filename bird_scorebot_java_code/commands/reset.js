const { SlashCommandBuilder } = require('discord.js');
const { resetAllUserPoints } = require('../utils/userPointsHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset the scoreboard'),
  async execute(interaction) {
    resetAllUserPoints();
    await interaction.reply('All scores have been reset! 🧹');
  }
};
