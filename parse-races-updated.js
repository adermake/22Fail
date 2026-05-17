const fs = require('fs');
const path = require('path');

// Read the Rassen.txt file
const racesText = fs.readFileSync('c:\\Users\\adermake\\Downloads\\Rassen.txt', 'utf8');

// Split races by looking for pattern: RaceName: followed by stats
const lines = racesText.split('\n');
const races = [];
let currentRace = null;
let currentSection = 'header'; // header, stats, skills, lore
let currentSkillLevel = null;
let currentSkills = [];
let loreLines = [];

function createEmptyRace() {
  return {
    id: '',
    name: '',
    baseImage: '',
    ageRange: '',
    size: '',
    weight: '',
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
}

function finalizeRace(race) {
  if (race && race.name) {
    race.lore = loreLines.join(' ').trim();
    races.push(race);
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Check if this is a new race header (RaceName: followed by stats on same line)
  if (line.match(/^[A-ZÄÖÜ][a-zäöü]+:\s+Str:/)) {
    // Finalize previous race
    finalizeRace(currentRace);
    
    // Start new race
    currentRace = createEmptyRace();
    currentSection = 'stats';
    loreLines = [];
    
    const parts = line.split(':');
    currentRace.name = parts[0].trim();
    currentRace.id = `race_${currentRace.name.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')}`;
    
    // Parse first stat line
    const statLine = parts.slice(1).join(':');
    const strMatch = statLine.match(/Str:(\d+)\s+Str\+:([\d.]+)/);
    if (strMatch) {
      currentRace.baseStrength = parseInt(strMatch[1]);
      currentRace.strengthPerLevel = parseFloat(strMatch[2]);
    }
    continue;
  }
  
  // Parse age, size, weight lines
  if (line.startsWith('Alter:')) {
    const ageMatch = line.match(/Alter:([\d~+-]+)/);
    if (ageMatch) currentRace.ageRange = ageMatch[1];
    
    // Parse stats on same line
    const intMatch = line.match(/Int:(\d+)\s+Int\+:([\d.]+)/);
    if (intMatch) {
      currentRace.baseIntelligence = parseInt(intMatch[1]);
      currentRace.intelligencePerLevel = parseFloat(intMatch[2]);
    }
    continue;
  }
  
  // Check for size line (contains Größe or Gr)
  if (line.includes('Größe:') || line.includes(':1.') || /Gr.+e:/.test(line)) {
    // Extract size - look for pattern like "1.70m" or "2m"
    const sizeMatch = line.match(/:\s*([\d.]+m)/);
    if (sizeMatch) {
      currentRace.size = sizeMatch[1];
    }
    
    const gskMatch = line.match(/Gsk:(\d+)\s+Gsk\+:([\d.]+)/);
    if (gskMatch) {
      currentRace.baseDexterity = parseInt(gskMatch[1]);
      currentRace.dexterityPerLevel = parseFloat(gskMatch[2]);
    }
    continue;
  }
  
  if (line.startsWith('Gewicht:')) {
    const weightMatch = line.match(/Gewicht:\s*(\w+)/);
    if (weightMatch) currentRace.weight = weightMatch[1];
    
    const gswMatch = line.match(/Gsw:(\d+)\s+Gsw\+:([\d.]+)/);
    if (gswMatch) {
      currentRace.baseSpeed = parseInt(gswMatch[1]);
      currentRace.speedPerLevel = parseFloat(gswMatch[2]);
    }
    continue;
  }
  
  // Parse remaining stats lines
  if (line.match(/Kon:\d+/) && currentSection === 'stats') {
    const konMatch = line.match(/Kon:(\d+)\s+Kon\+:([\d.]+)/);
    if (konMatch) {
      currentRace.baseConstitution = parseInt(konMatch[1]);
      currentRace.constitutionPerLevel = parseFloat(konMatch[2]);
    }
    continue;
  }
  
  if (line.match(/Chm:\d+/) && currentSection === 'stats') {
    const chmMatch = line.match(/Chm:(\d+)\s+Chm\+:([\d.]+)/);
    if (chmMatch) {
      currentRace.baseChill = parseInt(chmMatch[1]);
      currentRace.chillPerLevel = parseFloat(chmMatch[2]);
    }
    continue;
  }
  
  if (line.match(/HP:\d+/) && currentSection === 'stats') {
    const hpMatch = line.match(/HP:\s*(\d+)/);
    const mpMatch = line.match(/MP:\s*(\d+)/);
    const asdMatch = line.match(/Asd:\s*(\d+)/);
    if (hpMatch) currentRace.baseHealth = parseInt(hpMatch[1]);
    if (mpMatch) currentRace.baseMana = parseInt(mpMatch[1]);
    if (asdMatch) currentRace.baseEnergy = parseInt(asdMatch[1]);
    currentSection = 'skills';
    continue;
  }
  
  // Parse skills section
  if (currentSection === 'skills') {
    // Check for skill level marker (0:, 5:, 10:, etc.)
    const levelMatch = line.match(/^(\d+):/);
    if (levelMatch) {
      // Save previous level's skills
      if (currentSkillLevel !== null && currentSkills.length > 0) {
        currentRace.skills.push({
          levelRequired: currentSkillLevel,
          skills: currentSkills,
          isChoice: currentSkills.length > 1
        });
      }
      
      currentSkillLevel = parseInt(levelMatch[1]);
      currentSkills = [];
      
      // Parse skill on same line
      const restOfLine = line.substring(levelMatch[0].length).trim();
      if (restOfLine) {
        const skill = parseSkill(restOfLine, currentRace.name);
        if (skill) currentSkills.push(skill);
      }
      continue;
    }
    
    // Check for additional skills at same level (indented)
    if (currentSkillLevel !== null && line && !line.startsWith('Schw') && !line.startsWith('Wäh')) {
      const skill = parseSkill(line, currentRace.name);
      if (skill) {
        currentSkills.push(skill);
      }
      continue;
    }
    
    // Check for weakness line
    if (line.startsWith('Schwäch') || line.startsWith('Schw')) {
      // Add weakness as a skill at level 0
      const weaknessText = line.substring(line.indexOf(':') + 1).trim();
      if (weaknessText && currentRace) {
        // Find or create level 0 skills
        let level0 = currentRace.skills.find(s => s.levelRequired === 0);
        if (!level0) {
          level0 = { levelRequired: 0, skills: [], isChoice: false };
          currentRace.skills.unshift(level0);
        }
        level0.skills.push({
          name: 'Schwäche',
          class: currentRace.name,
          description: weaknessText,
          type: 'passive',
          enlightened: false
        });
      }
      continue;
    }
    
    // Check for special instruction lines
    if (line.startsWith('Wähl') || line.startsWith('W')) {
      // Find level 0 and add this as a note
      let level0 = currentRace.skills.find(s => s.levelRequired === 0);
      if (!level0) {
        level0 = { levelRequired: 0, skills: [], isChoice: false };
        currentRace.skills.unshift(level0);
      }
      level0.skills.push({
        name: 'Hinweis',
        class: currentRace.name,
        description: line,
        type: 'passive',
        enlightened: false
      });
      continue;
    }
    
    // Check if we've hit the lore section (long paragraph)
    if (line.length > 100) {
      // Save current skill level
      if (currentSkillLevel !== null && currentSkills.length > 0) {
        currentRace.skills.push({
          levelRequired: currentSkillLevel,
          skills: currentSkills,
          isChoice: currentSkills.length > 1
        });
        currentSkillLevel = null;
        currentSkills = [];
      }
      currentSection = 'lore';
      loreLines.push(line);
      continue;
    }
  }
  
  // Collect lore lines
  if (currentSection === 'lore' && line) {
    loreLines.push(line);
  }
}

// Finalize last race
finalizeRace(currentRace);

function parseSkill(text, raceName) {
  if (!text || text.length < 3) return null;
  
  let skillName = '';
  let skillType = 'passive';
  let skillDescription = '';
  
  // Check for (p) or (a) marker
  const typeMatch = text.match(/^([^(]+)\(([pa])\):\s*(.+)/);
  if (typeMatch) {
    skillName = typeMatch[1].trim();
    skillType = typeMatch[2] === 'a' ? 'active' : 'passive';
    skillDescription = typeMatch[3].trim();
  } else {
    // Try to split by first colon
    const colonIndex = text.indexOf(':');
    if (colonIndex > 0) {
      skillName = text.substring(0, colonIndex).trim();
      skillDescription = text.substring(colonIndex + 1).trim();
    } else {
      // No clear structure, use whole text as name
      skillName = text.trim();
      skillDescription = text.trim();
    }
  }
  
  if (!skillName) return null;
  
  return {
    name: skillName,
    class: raceName,
    description: skillDescription,
    type: skillType,
    enlightened: false
  };
}

console.log(`Parsed ${races.length} races`);

// Create temp-races directory
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
