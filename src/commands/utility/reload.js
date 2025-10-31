const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

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

		// Find the command file path
		const commandsPath = path.join(__dirname, '..');
		const commandFolders = fs.readdirSync(commandsPath).filter(folder => {
			const folderPath = path.join(commandsPath, folder);
			return fs.statSync(folderPath).isDirectory();
		});

		let commandPath = null;
		for (const folder of commandFolders) {
			const filePath = path.join(commandsPath, folder, `${commandName}.js`);
			if (fs.existsSync(filePath)) {
				commandPath = filePath;
				break;
			}
		}

		if (!commandPath) {
			return interaction.reply(`Could not find the file for command \`${commandName}\`.`);
		}

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