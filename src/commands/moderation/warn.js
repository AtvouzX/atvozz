const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn a user for inappropriate behavior')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to warn')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The reason for the warning')
				.setRequired(false)),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		const member = interaction.guild.members.cache.get(user.id);

		if (!member) {
			return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
		}

		// Create embed for the warning
		const embed = new EmbedBuilder()
			.setColor(0xFFA500)
			.setTitle('⚠️ Warning Issued')
			.setDescription(`You have been warned in **${interaction.guild.name}**.`)
			.addFields(
				{ name: 'Reason', value: reason || 'No reason provided', inline: false },
				{ name: 'Warned by', value: interaction.user.tag, inline: true },
				{ name: 'Date', value: new Date().toLocaleString(), inline: true },
			)
			.setTimestamp();

		await interaction.reply({ content: `⚠️ ${user.tag} has been warned!`, ephemeral: false });

		try {
			// Try to DM the user
			await user.send({ embeds: [embed] });
		}
		catch (error) {
			console.error('Failed to DM user:', error);
			await interaction.followUp({ content: 'Could not send DM to the user.', ephemeral: true });
		}
	},
};