const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Shows information about the bot'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(2326507)
			.setTitle('Basic Facts')
			.setDescription('Play bass. Eat Grass.')
			.addFields(
				{ name: 'Creator', value: 'AtvouzX', inline: true },
				{ name: 'Version', value: '1.0.0', inline: true },
				{ name: 'Library', value: 'Discord.js', inline: true },
			)
			.setImage('https://cdn.discordapp.com/banners/1130189712133455943/d66190375597e3cb90a5c6bb974e1247?size=1024')
			.setFooter({ text: 'Ryo Yamada ☘️ Powered by Grass', iconURL: 'https://cdn.discordapp.com/app-icons/1130189712133455943/424b116a8bd619312c271dc671df7077.png?size=512' });

		await interaction.reply({ embeds: [embed] });
	},
};