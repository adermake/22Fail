const fs = require('fs');
const path = require('path');

const backendDir = './backend';
const raceFiles = fs.readdirSync(backendDir).filter(f => 
  f.endsWith('.json') && f !== 'races.json' && f !== 'data.json' && f !== 'worlds.json'
);

const races = [];
for (const file of raceFiles) {
  const content = fs.readFileSync(path.join(backendDir, file), 'utf8');
  const race = JSON.parse(content);
  races.push(race);
}

fs.writeFileSync(path.join(backendDir, 'races.json'), JSON.stringify(races, null, 2));

console.log(`Combined ${races.length} races into backend/races.json`);
