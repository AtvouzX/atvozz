const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload a command without restarting the bot')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The name of the command to reload')
				.setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command');
		const client = interaction.client;

		const command = client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`.`);
		}

		const commandPath = path.join(__dirname, `${commandName}.js`);

		delete require.cache[require.resolve(commandPath)];

		try {
			const newCommand = require(commandPath);
			client.commands.set(commandName, newCommand);
			await interaction.reply(`Command \`${commandName}\` was reloaded successfully.`);
		}
		catch (error) {
			console.error(error);
			await interaction.reply(`There was an error while reloading the command \`${commandName}\`:\n\`${error.message}\``);
		}
	},
};