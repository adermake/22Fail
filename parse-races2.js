const fs = require('fs');
const path = require('path');

// Read the Races.txt file
const racesText = fs.readFileSync('c:\\Users\\adermake\\Desktop\\Races.txt', 'utf8');

// Split by the separator line
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

// Now we need to parse these sections properly
// Section 0: Race1 header/stats/skills (no lore)
// Section 1+: RaceN lore + RaceN+1 header/stats/skills

const raceData = [];

// Parse section 0 separately (first race header without lore)
if (sections.length > 0) {
  const firstRaceLines = sections[0].trim().split('\n').filter(l => l.trim());
  raceData.push({
    headerLines: firstRaceLines,
    loreLines: sections.length > 1 ? [] : [] // Lore will come from section 1
  });
}

// Parse remaining sections (each has lore + next race header)
for (let i = 1; i < sections.length; i++) {
  const sectionLines = sections[i].trim().split('\n');
  
  // Find where the next race header starts (line with just a race name, followed by "Alter:")
  let nextRaceStartIndex = -1;
  for (let j = 0; j < sectionLines.length - 1; j++) {
    const line = sectionLines[j].trim();
    const nextLine = sectionLines[j + 1].trim();
    
    // A race header is a single capitalized word/name followed by "Alter:"
    if (line.length > 0 && line.length < 30 && !line.includes(':') && 
        nextLine.startsWith('Alter:')) {
      nextRaceStartIndex = j;
      break;
    }
  }
  
  if (nextRaceStartIndex > 0) {
    // This section has lore + next race header
    const loreLines = sectionLines.slice(0, nextRaceStartIndex).filter(l => l.trim());
    const headerLines = sectionLines.slice(nextRaceStartIndex).filter(l => l.trim());
    
    // Add lore to previous race
    if (raceData.length > 0) {
      raceData[raceData.length - 1].loreLines = loreLines;
    }
    
    // Add next race header
    if (headerLines.length > 0) {
      raceData.push({
        headerLines: headerLines,
        loreLines: []
      });
    }
  } else {
    // Last section - just lore
    const loreLines = sectionLines.filter(l => l.trim());
    if (raceData.length > 0) {
      raceData[raceData.length - 1].loreLines = loreLines;
    }
  }
}

console.log(`Parsed ${raceData.length} races`);

// Now parse each race's data
const races = [];

function parseGrowthStat(plusValue) {
  // plusValue like "4" means "gain 1 every 4 levels" = 0.25 per level
  const levelsPerPoint = parseInt(plusValue);
  return parseFloat((1 / levelsPerPoint).toFixed(4));
}

raceData.forEach((data, index) => {
  const lines = data.headerLines;
  const loreLines = data.loreLines;
  
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
  race.name = lines[0].trim();
  race.id = `race_${race.name.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '_')}`;

  let currentLine = 1;

  // Parse age and size (second line)
  if (currentLine < lines.length) {
    const ageSize = lines[currentLine];
    const ageMatch = ageSize.match(/Alter:\s*([^\s]+)/);
    const sizeMatch = ageSize.match(/Größe:\s*([^\s]+)/);
    if (ageMatch) race.ageRange = ageMatch[1];
    if (sizeMatch) race.size = sizeMatch[1];
    currentLine++;
  }

  // Skip "Stats:" line
  if (currentLine < lines.length && lines[currentLine].trim() === 'Stats:') currentLine++;

  // Parse base stats (HP, Asd, MP)
  if (currentLine < lines.length) {
    const resourcesLine = lines[currentLine];
    const hpMatch = resourcesLine.match(/HP:\s*(\d+)/);
    const asdMatch = resourcesLine.match(/Asd:\s*(\d+)/);
    const mpMatch = resourcesLine.match(/MP:\s*(\d+)/);
    if (hpMatch) race.baseHealth = parseInt(hpMatch[1]);
    if (asdMatch) race.baseEnergy = parseInt(asdMatch[1]);
    if (mpMatch) race.baseMana = parseInt(mpMatch[1]);
    currentLine++;
  }

  // Parse attributes and growth
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
    if (!line.match(/\d+/) || line.trim() === 'Skills:') break;
    
    for (const [statName, fields] of Object.entries(statMap)) {
      const baseRegex = new RegExp(`${statName}:(\\d+)`);
      const growthRegex = new RegExp(`${statName}\\+:(\\d+)`);
      
      const baseMatch = line.match(baseRegex);
      const growthMatch = line.match(growthRegex);
      
      if (baseMatch) {
        race[fields.base] = parseInt(baseMatch[1]);
      }
      if (growthMatch) {
        race[fields.growth] = parseGrowthStat(growthMatch[1]);
      }
    }
    
    currentLine++;
    if (currentLine < lines.length && lines[currentLine].trim() === 'Skills:') break;
  }

  // Skip "Skills:" line
  if (currentLine < lines.length && lines[currentLine].trim() === 'Skills:') currentLine++;

  // Parse skills
  while (currentLine < lines.length) {
    const line = lines[currentLine].trim();
    if (!line) {
      currentLine++;
      continue;
    }
    
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
        // No type specified, just name: description or just description
        const parts = skillText.split(':');
        if (parts.length >= 2) {
          // Has a name before the colon
          skillName = parts[0].trim();
          skillDescription = parts.slice(1).join(':').trim();
        } else {
          // Just description, no clear name
          skillName = skillText.split(' ')[0];
          skillDescription = skillText;
        }
      }
      
      // Check if description continues on next line
      let nextLine = currentLine + 1;
      while (nextLine < lines.length) {
        const nl = lines[nextLine].trim();
        if (!nl || nl.startsWith('Basis:') || nl.match(/^Lv\.\d+:/) || nl.startsWith('Schwäche:')) {
          break;
        }
        skillDescription += ' ' + nl;
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
  race.lore = loreLines.join(' ').trim();

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
