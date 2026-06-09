module.exports = {
	apps: [
		{
			name: "cozynet",
			cwd: __dirname,
			script: "pnpm",
			args: "run server:start",
			exec_mode: "fork",
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: "500M",
			time: true,
			env: {
				NODE_ENV: "production"
			}
		}
	]
}
