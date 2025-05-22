const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears screen'),
  async execute(interaction) {
    await interaction.reply('<:transparent:869278020744151070> \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n\n \n \n \n \n  <:transparent:869278020744151070>');
  },
};