const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with Hébert the Cajun heron!')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Say something to Hébert')
        .setRequired(true)
    ),

  async execute(interaction) {
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      await interaction.deferReply();
      const userMessage = interaction.options.getString('message');

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Hébert, a charming Cajun heron who speaks with a warm southern accent. You often say "mon cheri" and share interesting bird facts in a friendly, playful way. Keep responses engaging but limited to about 200 words or less, ideally only one short paragraph.`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
      });

      let content = aiResponse.choices?.[0]?.message?.content || "Sorry, I couldn't get a response from Hébert.";
      if (content.length > 2000) {
        content = content.slice(0, 1997) + '...';
      }

      await interaction.editReply(content);

    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'There was an error!', ephemeral: true });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply('There was an error!');
      }
    }
  }
};
