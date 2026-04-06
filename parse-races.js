const fs = require('fs');
const path = require('path');

// Read the Races.txt file
const racesText = fs.readFileSync('c:\\Users\\adermake\\Desktop\\Races.txt', 'utf8');

// Split by sections - each race is separated by a line of dashes
const allLines = racesText.split('\n');
const sections = [];
let currentSection = [];

for (const line of allLines) {
  if (line.trim().match(/^-{100,}$/)) {
    // This is a separator line
    if (currentSection.length > 0) {
      sections.push(currentSection.join('\n'));
      currentSection = [];
    }
  } else {
    currentSection.push(line);
  }
}
// Don't forget the last section
if (currentSection.length > 0) {
  sections.push(currentSection.join('\n'));
}

console.log(`Found ${sections.length} sections`);

const races = [];

sections.forEach((sectionText, index) => {
  sectionText = sectionText.trim();
  console.log(`Section ${index}: length=${sectionText.length}, first 50 chars: ${sectionText.substring(0, 50)}`);
  if (!sectionText || sectionText.length < 100) return;

  const allLines = sectionText.split('\n');
  
  // Find where the lore starts (after the skills section)
  let loreStartIndex = -1;
  for (let i = allLines.length - 1; i >= 0; i--) {
    // Work backwards - lore is continuous prose without structural markers
    const line = allLines[i].trim();
    if (line.length > 50 && 
        !line.includes('Alter:') && 
        !line.includes('Stats:') &&
        !line.includes('Skills:') &&
        !line.includes('HP:') &&
        !line.includes('Str:') &&
        !line.match(/^Lv\.\d+/) &&
        !line.startsWith('Basis') &&
        !line.startsWith('Schwäche:')) {
      loreStartIndex = i;
    } else if (loreStartIndex > 0) {
      // We've found where skills end and lore begins
      break;
    }
  }
  
  // Find first lore line by going forward
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i].trim();
    if (line.length > 50 && 
        !line.includes('Alter:') && 
        !line.includes('Stats:') &&
        !line.includes('Skills:') &&
        !line.includes('HP:') &&
        !line.includes('Str:') &&
        !line.match(/^Lv\.\d+/) &&
        !line.startsWith('Basis') &&
        !line.startsWith('Schwäche:')) {
      loreStartIndex = i;
      break;
    }
  }
  
  const lines = allLines.slice(0, loreStartIndex >= 0 ? loreStartIndex : allLines.length).map(l => l.trim()).filter(l => l);
  const loreLines = loreStartIndex >= 0 ? allLines.slice(loreStartIndex).map(l => l.trim()).filter(l => l) : [];
  
  if (lines.length === 0) return;

  const race = {
    id: '',
    name: '',
    baseImage: '',
    ageRange: '',
    size: '',
    lore: '',
    baseHealth: 0,
    baseEnergy: 0,
    baseMana: 0,
    baseStrength: 0,
    baseDexterity: 0,
    baseSpeed: 0,
    baseIntelligence: 0,
    baseConstitution: 0,
    baseChill: 0,
    healthPerLevel: 0,
    energyPerLevel: 0,
    manaPerLevel: 0,
    strengthPerLevel: 0,
    dexterityPerLevel: 0,
    speedPerLevel: 0,
    intelligencePerLevel: 0,
    constitutionPerLevel: 0,
    chillPerLevel: 0,
    skills: []
  };

  // Parse race name (first line)
  race.name = lines[0];
  race.id = `race_${race.name.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '_')}`;

  let currentLine = 1;

  // Parse age and size (second line)
  const ageSize = lines[currentLine];
  const ageMatch = ageSize.match(/Alter:\s*([^\s]+)/);
  const sizeMatch = ageSize.match(/Größe:\s*([^\s]+)/);
  if (ageMatch) race.ageRange = ageMatch[1];
  if (sizeMatch) race.size = sizeMatch[1];
  currentLine++;

  // Skip "Stats:" line
  if (lines[currentLine] === 'Stats:') currentLine++;

  // Parse base stats (HP, Asd, MP)
  const resourcesLine = lines[currentLine];
  const hpMatch = resourcesLine.match(/HP:\s*(\d+)/);
  const asdMatch = resourcesLine.match(/Asd:\s*(\d+)/);
  const mpMatch = resourcesLine.match(/MP:\s*(\d+)/);
  if (hpMatch) race.baseHealth = parseInt(hpMatch[1]);
  if (asdMatch) race.baseEnergy = parseInt(asdMatch[1]);
  if (mpMatch) race.baseMana = parseInt(mpMatch[1]);
  currentLine++;

  // Parse attributes and growth
  // Format: "Str:10 Str+:4" means base 10, gain 1 every 4 levels (= 0.25 per level)
  const statMap = {
    'Str': { base: 'baseStrength', growth: 'strengthPerLevel' },
    'Int': { base: 'baseIntelligence', growth: 'intelligencePerLevel' },
    'Gsk': { base: 'baseDexterity', growth: 'dexterityPerLevel' },
    'Gsw': { base: 'baseSpeed', growth: 'speedPerLevel' },
    'Kon': { base: 'baseConstitution', growth: 'constitutionPerLevel' },
    'Chm': { base: 'baseChill', growth: 'chillPerLevel' }
  };

  while (currentLine < lines.length && lines[currentLine].includes(':')) {
    const line = lines[currentLine];
    
    // Check if this is a stat line (contains numbers)
    if (!line.match(/\d+/)) break;
    
    for (const [statName, fields] of Object.entries(statMap)) {
      const baseRegex = new RegExp(`${statName}:(\\d+)`);
      const growthRegex = new RegExp(`${statName}\\+:(\\d+)`);
      
      const baseMatch = line.match(baseRegex);
      const growthMatch = line.match(growthRegex);
      
      if (baseMatch) {
        race[fields.base] = parseInt(baseMatch[1]);
      }
      if (growthMatch) {
        const levelsPerPoint = parseInt(growthMatch[1]);
        // Convert from "gain 1 every X levels" to "gain Y per level"
        race[fields.growth] = parseFloat((1 / levelsPerPoint).toFixed(4));
      }
    }
    
    currentLine++;
    if (lines[currentLine] === 'Skills:') break;
  }

  // Skip "Skills:" line
  if (lines[currentLine] === 'Skills:') currentLine++;

  // Parse skills
  while (currentLine < lines.length) {
    const line = lines[currentLine];
    
    // Check if this is a skill line
    if (line.startsWith('Basis:') || line.match(/^Lv\.\d+:/)) {
      let levelRequired = 0;
      let skillText = '';
      
      if (line.startsWith('Basis:')) {
        levelRequired = 0;
        skillText = line.substring(6).trim();
      } else {
        const lvMatch = line.match(/^Lv\.(\d+):\s*(.+)/);
        if (lvMatch) {
          levelRequired = parseInt(lvMatch[1]);
          skillText = lvMatch[2].trim();
        }
      }
      
      // Parse skill name and type
      let skillName = '';
      let skillType = 'passive';
      let skillDescription = '';
      
      // Check for (p), (a), etc.
      const typeMatch = skillText.match(/^([^(]+)\(([^)]+)\):\s*(.+)/);
      if (typeMatch) {
        skillName = typeMatch[1].trim();
        const type = typeMatch[2].trim().toLowerCase();
        skillDescription = typeMatch[3].trim();
        
        if (type === 'a') skillType = 'active';
        else if (type === 'p') skillType = 'passive';
      } else {
        // No type specified, just name and description
        const parts = skillText.split(':');
        if (parts.length >= 2) {
          skillName = parts[0].trim();
          skillDescription = parts.slice(1).join(':').trim();
        } else {
          skillName = skillText;
        }
      }
      
      // Check if description continues on next line
      let nextLine = currentLine + 1;
      while (nextLine < lines.length && 
             !lines[nextLine].startsWith('Basis:') && 
             !lines[nextLine].match(/^Lv\.\d+:/) &&
             !lines[nextLine].startsWith('Schwäche:') &&
             lines[nextLine].length > 0 &&
             !lines[nextLine].startsWith('-')) {
        skillDescription += ' ' + lines[nextLine].trim();
        nextLine++;
      }
      
      if (skillName) {
        race.skills.push({
          levelRequired: levelRequired,
          skill: {
            name: skillName,
            class: race.name,
            description: skillDescription,
            type: skillType,
            enlightened: false
          }
        });
      }
      
      currentLine = nextLine;
      continue;
    }
    
    // Check for weakness line
    if (line.startsWith('Schwäche:')) {
      const weaknessText = line.substring(9).trim();
      race.skills.push({
        levelRequired: 0,
        skill: {
          name: 'Schwäche',
          class: race.name,
          description: weaknessText,
          type: 'passive',
          enlightened: false
        }
      });
      currentLine++;
      continue;
    }
    
    currentLine++;
  }
  
  // Add lore
  race.lore = loreLines.join(' ');

  races.push(race);
});

// Create temp-races directory if it doesn't exist
const tempRacesDir = path.join(__dirname, 'temp-races');
if (!fs.existsSync(tempRacesDir)) {
  fs.mkdirSync(tempRacesDir, { recursive: true });
}

// Write each race to its own JSON file
races.forEach(race => {
  const fileName = race.name.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '_') + '.json';
  
  const filePath = path.join(tempRacesDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(race, null, 2), 'utf8');
  console.log(`Created: ${fileName}`);
});

console.log(`\nTotal races processed: ${races.length}`);
