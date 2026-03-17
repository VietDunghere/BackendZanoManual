const { execSync } = require('child_process');

function run(command) {
  console.log(`[db:reset] ${command}`);
  execSync(command, { stdio: 'inherit' });
}

run('npm run db:migrate');
run('npm run db:seed');
