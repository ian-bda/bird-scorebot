const { SlashCommandBuilder } = require('discord.js');
const { getAllUserPoints } = require('../utils/userPointsHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scoreboard')
    .setDescription('View the current scoreboard'),

  async execute(interaction) {
    console.log('Scoreboard command executed');
    const userPoints = getAllUserPoints();
    console.log('User points received:', userPoints);

    let scores = [];
    for (const [userId, data] of Object.entries(userPoints)) {
      scores.push({ userId, total: data.total });
    }

    scores.sort((a, b) => b.total - a.total);

    if (scores.length === 0) {
      return interaction.reply('No scores yet!');
    }

    let reply = '**📊 Scoreboard:**\n';
    for (const s of scores) {
      try {
        const user = await interaction.client.users.fetch(s.userId);
        reply += `${user.username}: ${s.total} points\n`;
      } catch (error) {
        reply += `Unknown User (${s.userId}): ${s.total} points\n`;
      }
    }

    await interaction.reply(reply);
  }
};
