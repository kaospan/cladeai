if (!process.env.npm_execpath || !process.env.npm_execpath.includes('bun')) {
  console.error('\nERROR: Please use Bun to install dependencies for this project.\n');
  process.exit(1);
}