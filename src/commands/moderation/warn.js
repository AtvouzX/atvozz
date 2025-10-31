const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

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
		const reason = interaction.options.getString('reason') || 'No reason provided';
		const member = interaction.guild.members.cache.get(user.id);

		if (!member) {
			return interaction.reply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });
		}

		try {
			// Store user in database if not exists
			await interaction.client.db.query(
				`INSERT INTO users (id, username, discriminator, avatar) 
				 VALUES (?, ?, ?, ?) 
				 ON DUPLICATE KEY UPDATE 
				 username = VALUES(username), 
				 discriminator = VALUES(discriminator), 
				 avatar = VALUES(avatar)`,
				[user.id, user.username, user.discriminator, user.avatar],
			);

			// Store warning in database
			await interaction.client.db.query(
				'INSERT INTO warnings (user_id, guild_id, warned_by, reason) VALUES (?, ?, ?, ?)',
				[user.id, interaction.guild.id, interaction.user.id, reason],
			);

			// Get warning count for this user in this guild
			const [warnCountRow] = await interaction.client.db.query(
				'SELECT COUNT(*) as count FROM warnings WHERE user_id = ? AND guild_id = ?',
				[user.id, interaction.guild.id],
			);
			const warnCount = warnCountRow ? warnCountRow.count : 0;

			// Create embed for the warning
			const embed = new EmbedBuilder()
				.setColor(16753920)
				.setAuthor({
					name: 'Warning Issued',
					iconURL: interaction.client.user.displayAvatarURL(),
				})
				.setDescription(`You have been warned in ${interaction.guild.name}`)
				.addFields(
					{ name: 'Reason', value: reason, inline: false },
					{ name: 'Warned by', value: interaction.user.tag, inline: true },
					{ name: 'Date', value: new Date().toLocaleString(), inline: true },
					{ name: 'Warn count', value: warnCount.toString(), inline: true },
				)
				.setTimestamp()
				.setThumbnail(interaction.guild.iconURL());

			await interaction.reply({ content: `⚠️ ${user.tag} has been warned!` });

			try {
				// Try to DM the user
				await user.send({ embeds: [embed] });
			}
			catch (error) {
				console.error('Failed to DM user:', error);
				await interaction.followUp({ content: 'Could not send DM to the user.', flags: MessageFlags.Ephemeral });
			}
		}
		catch (error) {
			console.error('Database error:', error);
			await interaction.reply({ content: 'An error occurred while processing the warning.', flags: MessageFlags.Ephemeral });
		}
	},
};