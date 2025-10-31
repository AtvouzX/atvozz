const { spawn } = require('child_process');

const cmd = process.env.RUN_CMD || process.argv[2] || 'dev';

const mapping = {
	dev: ['npm', ['run', 'dev']],
	start: ['npm', ['run', 'start']],
	'deploy-prod': ['npm', ['run', 'deploy-prod']],
	'deploy-dev': ['npm', ['run', 'deploy-dev']],
};

const selected = mapping[cmd];
if (!selected) {
	console.error(`Unknown command: ${cmd}`);
	process.exit(1);
}

const [bin, args] = selected;
spawn(bin, args, { stdio: 'inherit', shell: true });
