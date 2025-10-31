const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

// Load env file based on NODE_ENV (fallback to .env.development)
const envName = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, '..', `.env.${envName}`);
const defaultEnvPath = path.join(__dirname, '..', '.env');

// Try specific env file first, then fallback to root .env
if (fs.existsSync(envPath)) {
	require('dotenv').config({ path: envPath });
	console.log(`Loaded env file: ${path.basename(envPath)}`);
}
else if (fs.existsSync(defaultEnvPath)) {
	require('dotenv').config({ path: defaultEnvPath });
	console.log('Loaded env file: .env');
}
else {
	console.warn('No .env file found; expecting environment variables to be set externally.');
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
	console.error('DISCORD_TOKEN is not set. Aborting.');
	process.exit(1);
}
if (!clientId) {
	console.error('CLIENT_ID is not set. Aborting.');
	process.exit(1);
}
if (!guildId) {
	console.error('GUILD_ID is required for deleting guild commands but not set. Aborting.');
	process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log('Started deleting application (/) commands for guild.');

		const data = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

		const promises = [];
		for (const command of data) {
			const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`;
			promises.push(rest.delete(deleteUrl));
		}

		await Promise.all(promises);

		console.log(`Successfully deleted ${data.length} application (/) commands for guild.`);
	}
	catch (error) {
		console.error(error);
		process.exit(1);
	}
})();