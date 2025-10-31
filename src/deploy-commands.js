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
const deployScope = (process.env.DEPLOY_SCOPE || (envName === 'production' ? 'global' : 'guild')).toLowerCase();

if (!token) {
	console.error('DISCORD_TOKEN is not set. Aborting.');
	process.exit(1);
}
if (!clientId) {
	console.error('CLIENT_ID is not set. Aborting.');
	process.exit(1);
}
if (deployScope === 'guild' && !guildId) {
	console.error('GUILD_ID is required for guild deploys but not set. Aborting.');
	process.exit(1);
}

const commands = [];
// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
	const commandFolders = fs.readdirSync(foldersPath);
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		if (!fs.statSync(commandsPath).isDirectory()) continue;
		const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			}
			else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
}
else {
	console.log('No commands folder found; nothing to deploy.');
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands (${deployScope}).`);

		let route;
		if (deployScope === 'global') {
			route = Routes.applicationCommands(clientId);
		}
		else {
			route = Routes.applicationGuildCommands(clientId, guildId);
		}

		const data = await rest.put(route, { body: commands });

		console.log(`Successfully reloaded ${data.length} application (/) commands (${deployScope}).`);
	}
	catch (error) {
		console.error(error);
		process.exit(1);
	}
})();