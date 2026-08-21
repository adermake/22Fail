import "./chunk-WK44VEJK.js";
import {
  TALENT_DEFINITIONS
} from "./chunk-P2J6DNXL.js";
import {
  ActivatedRoute
} from "./chunk-V6FR55FP.js";
import {
  DomSanitizer
} from "./chunk-YJYDFJW3.js";
import {
  HttpClient
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Injectable,
  Injector,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  computed,
  firstValueFrom,
  inject,
  isDevMode,
  setClassMetadata,
  signal,
  viewChild,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵqueryAdvance,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵresolveDocument,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵviewQuerySignal
} from "./chunk-XJL25EXC.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/rulebook/markdown/attrs.ts
var ATTR_RE = /([A-Za-z_][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s}]+)))?/g;
function parseAttrs(raw) {
  const out = {};
  if (!raw)
    return out;
  const body = raw.trim().replace(/^\{/, "").replace(/\}$/, "");
  for (const m of body.matchAll(ATTR_RE)) {
    out[m[1]] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
}
function oneOf(value, allowed, fallback) {
  return allowed.includes(value ?? "") ? value : fallback;
}
var ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function esc(value) {
  return value.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);
}
function splitTarget(target) {
  const [page = "", anchor = ""] = target.replace(/\.md$/, "").split("#");
  return { page, anchor };
}

// src/app/rulebook/markdown/inline-directives.ts
var NAMED_COLORS = {
  rot: "#ef4444",
  red: "#ef4444",
  gruen: "#22c55e",
  "gr\xFCn": "#22c55e",
  green: "#22c55e",
  blau: "#3b82f6",
  blue: "#3b82f6",
  gelb: "#eab308",
  yellow: "#eab308",
  orange: "#f59e0b",
  lila: "#a78bfa",
  violett: "#a78bfa",
  purple: "#a78bfa",
  tuerkis: "#06b6d4",
  "t\xFCrkis": "#06b6d4",
  cyan: "#06b6d4",
  pink: "#ec4899",
  magenta: "#ec4899",
  grau: "#9ca3af",
  gray: "#9ca3af",
  grey: "#9ca3af",
  weiss: "#ffffff",
  "wei\xDF": "#ffffff",
  white: "#ffffff",
  schwarz: "#111827",
  black: "#111827",
  // semantic aliases that follow the app theme
  leben: "var(--health-color, #ef4444)",
  ausdauer: "var(--energy-color, #22c55e)",
  mana: "var(--mana-color, #3b82f6)",
  akzent: "var(--accent, #8b5cf6)",
  accent: "var(--accent, #8b5cf6)"
};
function safeColor(value) {
  if (!value)
    return null;
  const key = value.trim().toLowerCase();
  if (NAMED_COLORS[key])
    return NAMED_COLORS[key];
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(key))
    return key;
  return null;
}
var COLOR_NAMES = Object.keys(NAMED_COLORS);
var KNOWN_ICONS = /* @__PURE__ */ new Set([
  "token-drag",
  "visibility-on",
  "visibility-off",
  "lobby",
  "equipment",
  "mana",
  "map",
  "draw",
  "wall",
  "lasso",
  "effektivity",
  "dice",
  "restore-trash",
  "stat",
  "status-effect",
  "ability",
  "brewing",
  "image",
  "ruler",
  "character",
  "fog",
  "active",
  "texture",
  "life",
  "spell",
  "folder",
  "energy",
  "layers",
  "passive",
  "appearance",
  "item",
  "tokenlink",
  "stability",
  "grundbonus",
  "movement",
  "reaction",
  "attack",
  "focus",
  "soul",
  "turnspeed"
]);
var INLINE_DIRECTIVES = [
  {
    name: "icon",
    render: (label, attrs, env) => {
      const name = (attrs["name"] ?? label).trim();
      if (name && !KNOWN_ICONS.has(name))
        env.warnings.push(`Unbekanntes Icon ":icon[${name}]"`);
      return `<span class="app-icon i-${esc(name)}" aria-hidden="true"></span>`;
    }
  },
  {
    // :hl[Text]              → amber highlight (unchanged)
    // :hl[Text]{color=rot}   → coloured + bold
    name: "hl",
    render: (label, attrs, env) => {
      const raw = attrs["color"];
      const colour = safeColor(raw);
      if (raw && !colour)
        env.warnings.push(`Unbekannte Farbe ":hl{color=${raw}}"`);
      const style = colour ? ` style="color:${colour}"` : "";
      return `<span class="rb-hl"${style}>${esc(label)}</span>`;
    }
  },
  {
    // :c[Text]{color=#ff8800} → coloured text WITHOUT the bold highlight styling
    name: "c",
    render: (label, attrs, env) => {
      const raw = attrs["color"];
      const colour = safeColor(raw);
      if (raw && !colour)
        env.warnings.push(`Unbekannte Farbe ":c{color=${raw}}"`);
      const style = colour ? ` style="color:${colour}"` : "";
      return `<span class="rb-c"${style}>${esc(label)}</span>`;
    }
  },
  { name: "kbd", render: (label) => `<kbd class="rb-kbd">${esc(label)}</kbd>` },
  {
    name: "jump",
    render: (label, attrs) => {
      const { page, anchor } = splitTarget(attrs["to"] ?? "");
      return `<button type="button" class="rb-jump" data-rb-page="${esc(page)}"${anchor ? ` data-rb-anchor="${esc(anchor)}"` : ""}>${esc(label || "Weiter")}</button>`;
    }
  }
];
var DIRECTIVE_RE = /^:([a-z][\w-]*)(?:\[([^\]\n]*)\])?(\{[^}\n]*\})?/;
function registerInlineDirectives(md, defs) {
  const byName = new Map(defs.map((d) => [d.name, d]));
  md.inline.ruler.before("link", "rb_directive", (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 58)
      return false;
    if (state.src.charCodeAt(state.pos + 1) === 58)
      return false;
    const m = DIRECTIVE_RE.exec(state.src.slice(state.pos));
    if (!m)
      return false;
    const def = byName.get(m[1]);
    if (!def)
      return false;
    if (!silent) {
      const token = state.push("rb_directive", "", 0);
      token.meta = { name: m[1], label: m[2] ?? "", attrs: parseAttrs(m[3]) };
    }
    state.pos += m[0].length;
    return true;
  });
  md.renderer.rules["rb_directive"] = (tokens, idx, _o, env) => {
    const meta = tokens[idx].meta;
    const def = byName.get(meta.name);
    return def ? def.render(meta.label, meta.attrs, env) : "";
  };
}

// src/app/rulebook/markdown/slug.ts
var UMLAUTS = { "\xE4": "ae", "\xF6": "oe", "\xFC": "ue", "\xDF": "ss" };
function slugify(text) {
  return text.toLowerCase().replace(/[äöüß]/g, (c) => UMLAUTS[c] ?? c).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "abschnitt";
}
function uniqueSlug(base, seen) {
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}

// src/app/model/weapon.model.ts
var WeaponType;
(function(WeaponType2) {
  WeaponType2["LEICHT"] = "Leicht";
  WeaponType2["SCHWER"] = "Schwer";
  WeaponType2["FERNKAMPF"] = "Fernkampf";
})(WeaponType || (WeaponType = {}));
var DamageType;
(function(DamageType2) {
  DamageType2["SCHNITT"] = "Schnitt";
  DamageType2["STICH"] = "Stich";
  DamageType2["WUCHT"] = "Wucht";
})(DamageType || (DamageType = {}));

// src/app/data/weapons.data.ts
var BASE_WEAPON_TYPES = [
  // Leicht
  { name: "Messer", damageType: DamageType.SCHNITT, range: 0.5, type: WeaponType.LEICHT },
  { name: "Sichel", damageType: DamageType.SCHNITT, range: 0.5, type: WeaponType.LEICHT },
  { name: "Kurzschwert", damageType: DamageType.SCHNITT, range: 1, type: WeaponType.LEICHT },
  { name: "Peitsche", damageType: DamageType.SCHNITT, range: 3, type: WeaponType.LEICHT },
  { name: "Dolch", damageType: DamageType.STICH, range: 0.5, type: WeaponType.LEICHT },
  { name: "Rapier", damageType: DamageType.STICH, range: 1.5, type: WeaponType.LEICHT },
  { name: "Handschuhe", damageType: DamageType.WUCHT, range: 0.5, type: WeaponType.LEICHT },
  { name: "Nunchaku", damageType: DamageType.WUCHT, range: 0.5, type: WeaponType.LEICHT },
  { name: "Stab", damageType: DamageType.WUCHT, range: 1, type: WeaponType.LEICHT },
  // Fernkampf
  { name: "Wurfbeil", damageType: DamageType.SCHNITT, range: 10, type: WeaponType.FERNKAMPF },
  { name: "Wurfmesser", damageType: DamageType.SCHNITT, range: 20, type: WeaponType.FERNKAMPF },
  { name: "Wurfspeer", damageType: DamageType.STICH, range: 50, type: WeaponType.FERNKAMPF },
  { name: "Kurzbogen", damageType: DamageType.STICH, range: 50, type: WeaponType.FERNKAMPF },
  { name: "Armbrust", damageType: DamageType.STICH, range: 100, type: WeaponType.FERNKAMPF },
  { name: "Langbogen", damageType: DamageType.STICH, range: 100, type: WeaponType.FERNKAMPF },
  { name: "Bola", damageType: DamageType.WUCHT, range: 20, type: WeaponType.FERNKAMPF },
  { name: "Bumerang", damageType: DamageType.WUCHT, range: 30, type: WeaponType.FERNKAMPF },
  { name: "Schleuder", damageType: DamageType.WUCHT, range: 50, type: WeaponType.FERNKAMPF },
  // Schwer
  { name: "Axt", damageType: DamageType.SCHNITT, range: 1.5, type: WeaponType.SCHWER },
  { name: "S\xE4bel", damageType: DamageType.SCHNITT, range: 1.5, type: WeaponType.SCHWER },
  { name: "Sense", damageType: DamageType.SCHNITT, range: 1.5, type: WeaponType.SCHWER },
  { name: "Kriegsaxt", damageType: DamageType.SCHNITT, range: 2, type: WeaponType.SCHWER },
  { name: "Langschwert", damageType: DamageType.SCHNITT, range: 2, type: WeaponType.SCHWER },
  { name: "Gleve", damageType: DamageType.SCHNITT, range: 2.5, type: WeaponType.SCHWER },
  { name: "Gro\xDFschwert", damageType: DamageType.SCHNITT, range: 2.5, type: WeaponType.SCHWER },
  { name: "Hellebarde", damageType: DamageType.SCHNITT, range: 3, type: WeaponType.SCHWER },
  { name: "Hacke", damageType: DamageType.STICH, range: 1, type: WeaponType.SCHWER },
  { name: "Dreizack", damageType: DamageType.STICH, range: 2, type: WeaponType.SCHWER },
  { name: "Langspeer", damageType: DamageType.STICH, range: 3, type: WeaponType.SCHWER },
  { name: "Lanze", damageType: DamageType.STICH, range: 3, type: WeaponType.SCHWER },
  { name: "Schild", damageType: DamageType.WUCHT, range: 0.5, type: WeaponType.SCHWER },
  { name: "Hammer", damageType: DamageType.WUCHT, range: 1, type: WeaponType.SCHWER },
  { name: "Keule", damageType: DamageType.WUCHT, range: 2, type: WeaponType.SCHWER },
  { name: "Kriegshammer", damageType: DamageType.WUCHT, range: 2, type: WeaponType.SCHWER },
  { name: "Morgenstern", damageType: DamageType.WUCHT, range: 2.5, type: WeaponType.SCHWER }
];

// src/app/data/materials.data.ts
var WEAPON_MATERIALS = [
  // Waffenmaterialien 1
  {
    name: "Eisen",
    type: "schwer",
    rarity: "h\xE4ufig",
    locations: ["\xFCberall"],
    durability: 80,
    efficiency: 7,
    durabilityModifier: 3,
    efficiencyModifier: 3,
    specialEffect: "Mit jeder Reparatur wird die Haltbarkeit der Waffe dauerhaft um 10 erh\xF6ht."
  },
  {
    name: "Holz",
    type: "leicht",
    rarity: "sehr h\xE4ufig",
    locations: ["\xFCberall"],
    durability: 50,
    efficiency: 4,
    durabilityModifier: 5,
    efficiencyModifier: 3,
    specialEffect: "Vorraussetzung-1(\u221E) reduziert Vorraussetzung um 2 statt 1."
  },
  {
    name: "Ahnenholz",
    type: "sehr leicht",
    rarity: "selten",
    locations: ["in magischen W\xE4ldern"],
    durability: 70,
    efficiency: 5,
    durabilityModifier: 4,
    efficiencyModifier: 3,
    specialEffect: "+2 beim W\xFCrfeln f\xFCr Zaubercasts"
  },
  {
    name: "Stein",
    type: "sehr schwer",
    rarity: "sehr h\xE4ufig",
    locations: ["\xFCberall"],
    durability: 60,
    efficiency: 5,
    durabilityModifier: 3,
    efficiencyModifier: 4
  },
  {
    name: "Silber",
    type: "mittel",
    rarity: "selten",
    locations: ["\xFCberall"],
    durability: 70,
    efficiency: 10,
    durabilityModifier: 3,
    efficiencyModifier: 2,
    specialEffect: "+2 im Kampf gegen Monster/Untote"
  },
  {
    name: "Gold",
    type: "schwer",
    rarity: "selten",
    locations: ["\xFCberall"],
    durability: 50,
    efficiency: 6,
    durabilityModifier: 5,
    efficiencyModifier: 3,
    specialEffect: "+1 Charismamodifikator"
  },
  {
    name: "Platin",
    type: "sehr schwer",
    rarity: "sehr selten",
    locations: ["\xFCberall"],
    durability: 100,
    efficiency: 12,
    durabilityModifier: 4,
    efficiencyModifier: 4
  },
  {
    name: "Adamantit",
    type: "sehr schwer",
    rarity: "selten",
    locations: ["tief unter der Erde"],
    durability: 150,
    efficiency: 9,
    durabilityModifier: 6,
    efficiencyModifier: 6,
    specialEffect: "+5 W\xFCrfelbonus, wenn die Waffe zerst\xF6rt wird"
  },
  {
    name: "Meteoritenerz",
    type: "?",
    rarity: "???",
    locations: ["???"],
    durability: 120,
    efficiency: 12,
    durabilityModifier: 2,
    efficiencyModifier: 2,
    specialEffect: "Effekt variiert"
  },
  // Waffenmaterialien 2
  {
    name: "Asremit",
    type: "sehr leicht",
    rarity: "h\xE4ufig",
    locations: ["in der \xDCberwelt"],
    durability: 40,
    efficiency: 15,
    durabilityModifier: 5,
    efficiencyModifier: 2,
    specialEffect: "Werfen+1, unabh\xE4ngig vom Waffenbonus"
  },
  {
    name: "Blutrubin",
    type: "leicht",
    rarity: "selten",
    locations: ["Vulkangebiet"],
    durability: 80,
    efficiency: 8,
    durabilityModifier: 4,
    efficiencyModifier: 2,
    specialEffect: "Kann bis zu 50 Leben speichern, die ihm freiwillig vom Tr\xE4ger oder vom Gegner durch Kontakt mit tiefen Wunden gegeben werden kann. Diese Leben k\xF6nnen dem Tr\xE4ger zur\xFCckgegeben werden, um ihn um diesen Betrag zu heilen."
  },
  {
    name: "\xC4thersaphir",
    type: "leicht",
    rarity: "selten",
    locations: ["im Meer"],
    durability: 80,
    efficiency: 8,
    durabilityModifier: 4,
    efficiencyModifier: 2,
    specialEffect: "Kann bis zu 50 Mana speichern, die ihm vom Tr\xE4ger gegeben wird. Diese Mana kann dem Tr\xE4ger zur\xFCckgegeben werden, um die Mana um diesen Betrag wiederherzustellen."
  },
  {
    name: "Natursmaragd",
    type: "leicht",
    rarity: "selten",
    locations: ["in Urw\xE4ldern"],
    durability: 80,
    efficiency: 8,
    durabilityModifier: 4,
    efficiencyModifier: 2,
    specialEffect: "Kann bis zu 50 Ausdauer speichern, die ihm vom Tr\xE4ger gegeben wird. Diese Ausdauer kann dem Tr\xE4ger zur\xFCckgegeben werden, um die Ausdauer um diesen Betrag wiederherzustellen."
  },
  {
    name: "Elementarkristall",
    type: "leicht",
    rarity: "sehr selten",
    locations: ["an Orten mit hoher Manakonzentration"],
    durability: 60,
    efficiency: 7,
    durabilityModifier: 3,
    efficiencyModifier: 3,
    specialEffect: "Kann Spells speichern und sp\xE4ter ausf\xFChren. Komplexit\xE4t der gespeicherten Spells kann nicht Eff./2 \xFCberschreiten."
  },
  {
    name: "Seraphit",
    type: "schwer",
    rarity: "selten",
    locations: ["in der \xDCberwelt"],
    durability: 80,
    efficiency: 6,
    durabilityModifier: 3,
    efficiencyModifier: 4,
    specialEffect: "Verst\xE4rkt Heilzauber um 50%"
  },
  {
    name: "Vulkanit",
    type: "leicht",
    rarity: "h\xE4ufig",
    locations: ["in Lava"],
    durability: 90,
    efficiency: 8,
    durabilityModifier: 4,
    efficiencyModifier: 5,
    specialEffect: "Leuchtet im Dunkeln"
  }
];

// src/app/data/armor-materials.data.ts
var ARMOR_MATERIALS = [
  // Rüstungsmaterialien 1
  {
    name: "Stoff",
    type: "sehr leicht",
    rarity: "sehr h\xE4ufig",
    locations: ["\xFCberall"],
    durability: 50,
    durabilityModifier: 5,
    efficiency: 0,
    // Not for armor
    efficiencyModifier: 0,
    // Not for armor
    stability: 5,
    stabilityModifier: 5
  },
  {
    name: "Mondseide",
    type: "sehr leicht",
    rarity: "sehr selten",
    locations: ["\xFCberall"],
    durability: 80,
    durabilityModifier: 3,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 5,
    stabilityModifier: 4,
    specialEffect: "10% des erlittenen Schadens werden zu Mana konvertiert"
  },
  {
    name: "Leder",
    type: "leicht",
    rarity: "sehr h\xE4ufig",
    locations: ["\xFCberall"],
    durability: 70,
    durabilityModifier: 3,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 6,
    stabilityModifier: 4
  },
  {
    name: "Eisen",
    type: "schwer",
    rarity: "h\xE4ufig",
    locations: ["\xFCberall"],
    durability: 80,
    durabilityModifier: 3,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 8,
    stabilityModifier: 2,
    specialEffect: "Mit jeder Reparatur wird die Haltbarkeit der R\xFCstung dauerhaft um 10 erh\xF6ht."
  },
  {
    name: "Silber",
    type: "schwer",
    rarity: "selten",
    locations: ["\xFCberall"],
    durability: 80,
    durabilityModifier: 2,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 11,
    stabilityModifier: 2
  },
  {
    name: "Gold",
    type: "schwer",
    rarity: "selten",
    locations: ["\xFCberall"],
    durability: 50,
    durabilityModifier: 5,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 9,
    stabilityModifier: 3,
    specialEffect: "+1 Charismamodifikator"
  },
  {
    name: "Platin",
    type: "schwer",
    rarity: "sehr selten",
    locations: ["\xFCberall"],
    durability: 100,
    durabilityModifier: 4,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 12,
    stabilityModifier: 4
  },
  {
    name: "Adamantit",
    type: "sehr schwer",
    rarity: "selten",
    locations: ["tief unter der Erde"],
    durability: 150,
    durabilityModifier: 6,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 12,
    stabilityModifier: 6,
    specialEffect: "+5 beim Wurf, wenn die R\xFCstung zerst\xF6rt wird"
  },
  {
    name: "Meteoritenerz",
    type: "?",
    rarity: "???",
    locations: ["???"],
    durability: 150,
    durabilityModifier: 2,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 10,
    stabilityModifier: 2,
    specialEffect: "Effekt variiert"
  },
  // Rüstungsmaterialien 2
  {
    name: "Asremit",
    type: "sehr leicht",
    rarity: "h\xE4ufig",
    locations: ["in der \xDCberwelt"],
    durability: 40,
    durabilityModifier: 5,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 7,
    stabilityModifier: 3,
    specialEffect: "-2 R\xFCstungsmalus, unabh\xE4ngig vom R\xFCstungsbonus"
  },
  {
    name: "Elementarkristall",
    type: "leicht",
    rarity: "sehr selten",
    locations: ["an der Oberfl\xE4che an Orten mit hoher Manakonzentration"],
    durability: 50,
    durabilityModifier: 4,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 6,
    stabilityModifier: 4,
    specialEffect: "Kann Spells speichern und sp\xE4ter ausf\xFChren. Komplexit\xE4t der gespeicherten Spells darf nicht Eff./4 \xFCberschreiten."
  },
  {
    name: "Seraphit",
    type: "schwer",
    rarity: "selten",
    locations: ["in der \xDCberwelt"],
    durability: 80,
    durabilityModifier: 3,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 12,
    stabilityModifier: 2,
    specialEffect: "Verst\xE4rkt Heilung auf Tr\xE4ger um 50%"
  },
  {
    name: "Vulkanit",
    type: "leicht",
    rarity: "h\xE4ufig",
    locations: ["in Lava"],
    durability: 70,
    durabilityModifier: 4,
    efficiency: 0,
    efficiencyModifier: 0,
    stability: 8,
    stabilityModifier: 3,
    specialEffect: "Leuchtet im Dunkeln"
  }
];

// src/app/rulebook/rulebook-data-sources.ts
var cell = (v) => esc(String(v ?? ""));
function renderTalents(attrs) {
  const wanted = (attrs["stat"] ?? "").trim().toUpperCase();
  const rows = TALENT_DEFINITIONS.filter((t) => !wanted || t.statLabel.toUpperCase() === wanted);
  if (!rows.length)
    return emptyNote("Keine Talente gefunden.");
  return `<div class="rb-grid" style="--rb-grid-min:260px">` + rows.map((t) => `<article class="rb-card rb-card--accent" id="talent-${esc(slugify(t.name))}"><h4 class="rb-card-title">${cell(t.name)}<span class="rb-tag">${cell(t.statLabel)}</span></h4><div class="rb-card-body"><p>${cell(t.description)}</p></div></article>`).join("") + `</div>`;
}
function renderWeapons(attrs) {
  const wanted = (attrs["category"] ?? attrs["type"] ?? "").trim().toLowerCase();
  const rows = BASE_WEAPON_TYPES.filter((w) => !wanted || String(w.type).toLowerCase() === wanted);
  if (!rows.length)
    return emptyNote(`Keine Waffen f\xFCr Kategorie "${esc(wanted)}".`);
  const groups = /* @__PURE__ */ new Map();
  for (const w of rows) {
    const list = groups.get(w.type) ?? [];
    list.push(w);
    groups.set(w.type, list);
  }
  return [...groups.entries()].map(([type, list]) => `<div class="rb-datagroup"><div class="rb-datagroup-title">${cell(type)}</div><div class="rb-chiplist">` + list.map((w) => `<span class="rb-chip"><b>${cell(w.name)}</b><small>${cell(w.damageType)} \xB7 ${cell(w.range)} m</small></span>`).join("") + `</div></div>`).join("");
}
function renderMaterials(attrs) {
  const kind = (attrs["kind"] ?? "weapon").trim().toLowerCase();
  const isArmor = kind === "armor" || kind === "ruestung" || kind === "r\xFCstung";
  const rows = isArmor ? ARMOR_MATERIALS : WEAPON_MATERIALS;
  if (!rows.length)
    return emptyNote("Keine Materialien gefunden.");
  const valueCol = isArmor ? "Stabilit\xE4t" : "Effektivit\xE4t";
  return `<div class="rb-tablewrap"><table class="rb-table"><thead><tr><th>Name</th><th>Seltenheit</th><th>Gewicht</th><th>Haltbarkeit</th><th>${valueCol}</th><th>Effekt</th></tr></thead><tbody>` + rows.map((m) => `<tr><td><b>${cell(m.name)}</b></td><td>${cell(m.rarity)}</td><td>${cell(m.type)}</td><td>${cell(m.durability)}${m.durabilityModifier ? ` (+${cell(m.durabilityModifier)})` : ""}</td><td>${cell(isArmor ? m.stability ?? 0 : m.efficiency)}</td><td>${cell(m.specialEffect ?? "\u2014")}</td></tr>`).join("") + `</tbody></table></div>`;
}
var emptyNote = (msg) => `<aside class="rb-note rb-note--warning"><div class="rb-note-title">${msg}</div></aside>`;
var DATA_SOURCES = {
  talents: renderTalents,
  talente: renderTalents,
  weapons: renderWeapons,
  waffen: renderWeapons,
  materials: renderMaterials,
  materialien: renderMaterials
};
function renderDataDirective(attrs, env) {
  const source = (attrs["source"] ?? "").trim().toLowerCase();
  const renderer = DATA_SOURCES[source];
  if (!renderer) {
    env.warnings?.push(`Unbekannte Datenquelle ":::data{source=${source}}"`);
    return emptyNote(`Unbekannte Datenquelle: <code>${esc(source)}</code>. Verf\xFCgbar: ` + Object.keys(DATA_SOURCES).join(", "));
  }
  return renderer(attrs);
}

// src/app/rulebook/markdown/containers.ts
var iconSpan = (name) => name ? `<span class="app-icon i-${esc(name)}" aria-hidden="true"></span>` : "";
var section = {
  name: "section",
  render: (attrs, env) => {
    const title = attrs["title"] ?? "";
    const id = attrs["id"] || (title ? slugify(title) : "");
    const collapsed = "collapsed" in attrs || attrs["open"] === "false";
    if (id && title)
      env.headings?.push({ id, level: 3, text: title, kind: "section" });
    const sectionColor = safeColor(attrs["color"]);
    if (attrs["color"] && !sectionColor)
      env.warnings.push(`Unbekannte Farbe "{color=${attrs["color"]}}"`);
    const sectionStyle = sectionColor ? ` style="--rb-section-color:${sectionColor}"` : "";
    return {
      open: `<details class="rb-section"${collapsed ? "" : " open"}${id ? ` id="${esc(id)}"` : ""}${sectionStyle}><summary class="rb-section-title">${iconSpan(attrs["icon"])}<span class="rb-section-titletext">${esc(title)}</span><span class="rb-section-chev" aria-hidden="true"></span></summary><div class="rb-section-body">`,
      close: `</div></details>`
    };
  }
};
var NOTE_TYPES = ["info", "formula", "warning", "tip"];
var note = {
  name: "note",
  render: (attrs, env) => {
    const rawColor = attrs["color"];
    const type = oneOf(attrs["type"] ?? rawColor, NOTE_TYPES, "info");
    const custom = attrs["type"] || !NOTE_TYPES.includes(rawColor) ? safeColor(rawColor) : null;
    if (rawColor && !custom && !NOTE_TYPES.includes(rawColor)) {
      env.warnings.push(`Unbekannte Farbe "{color=${rawColor}}"`);
    }
    const style = custom ? ` style="--rb-note-color:${custom}"` : "";
    const title = attrs["title"];
    return {
      open: `<aside class="rb-note rb-note--${type}"${style}>` + (title ? `<div class="rb-note-title">${iconSpan(attrs["icon"])}${esc(title)}</div>` : ""),
      close: `</aside>`
    };
  }
};
var noteAlias = (name, type) => ({
  name,
  render: (attrs, env) => note.render(__spreadProps(__spreadValues({}, attrs), { type }), env)
});
var grid = {
  name: "grid",
  render: (attrs) => {
    const explicitMin = Number(attrs["min"]);
    const cols = Number(attrs["cols"]);
    const min = Number.isFinite(explicitMin) && explicitMin > 0 ? Math.min(600, Math.max(120, explicitMin)) : Number.isFinite(cols) && cols > 0 ? Math.min(600, Math.max(120, Math.round(1100 / cols))) : 280;
    return { open: `<div class="rb-grid" style="--rb-grid-min:${min}px">`, close: `</div>` };
  }
};
var ACCENTS = ["accent", "health", "energy", "mana"];
var card = {
  name: "card",
  render: (attrs) => {
    const accent = oneOf(attrs["accent"], ACCENTS, "accent");
    const title = attrs["title"];
    const id = attrs["id"] || (title ? `card-${slugify(title)}` : "");
    return {
      open: `<article class="rb-card rb-card--${accent}"${id ? ` id="${esc(id)}"` : ""}>` + (title ? `<h4 class="rb-card-title">${iconSpan(attrs["icon"])}${esc(title)}</h4>` : "") + `<div class="rb-card-body">`,
      close: `</div></article>`
    };
  }
};
var actions = {
  name: "actions",
  render: () => ({ open: `<div class="rb-actions">`, close: `</div>` })
};
var data = {
  name: "data",
  render: (attrs, env) => ({ open: renderDataDirective(attrs, env), close: "" })
};
var CONTAINER_DIRECTIVES = [
  section,
  note,
  noteAlias("formula", "formula"),
  noteAlias("warning", "warning"),
  noteAlias("tip", "tip"),
  grid,
  card,
  actions,
  data
];
var COLON = 58;
function fenceLen(src, start, max) {
  let pos = start;
  while (pos < max && src.charCodeAt(pos) === COLON)
    pos++;
  const len = pos - start;
  return len >= 3 ? len : 0;
}
function registerContainers(md) {
  const byName = new Map(CONTAINER_DIRECTIVES.map((d) => [d.name, d]));
  md.block.ruler.before("fence", "rb_container", (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    if (state.src.charCodeAt(start) !== COLON)
      return false;
    const markerLen = fenceLen(state.src, start, max);
    if (!markerLen)
      return false;
    const params = state.src.slice(start + markerLen, max).trim();
    if (!params)
      return false;
    if (silent)
      return true;
    let depth = 1;
    let line = startLine;
    let closed = false;
    while (line + 1 < endLine) {
      line++;
      const s = state.bMarks[line] + state.tShift[line];
      const m = state.eMarks[line];
      if (state.src.charCodeAt(s) !== COLON)
        continue;
      const len = fenceLen(state.src, s, m);
      if (!len)
        continue;
      if (state.src.slice(s + len, m).trim())
        depth++;
      else if (--depth === 0) {
        closed = true;
        break;
      }
    }
    const contentEnd = closed ? line : endLine;
    const openToken = state.push("rb_container_open", "div", 1);
    openToken.info = params;
    openToken.markup = ":".repeat(markerLen);
    openToken.map = [startLine, contentEnd];
    openToken.block = true;
    const oldMax = state.lineMax;
    state.lineMax = contentEnd;
    state.md.block.tokenize(state, startLine + 1, contentEnd);
    state.lineMax = oldMax;
    const closeToken = state.push("rb_container_close", "div", -1);
    closeToken.block = true;
    state.line = closed ? contentEnd + 1 : contentEnd;
    return true;
  }, { alt: ["paragraph", "reference", "blockquote", "list"] });
  md.renderer.rules["rb_container_open"] = (tokens, idx, _o, e) => {
    const env = e;
    const info = String(tokens[idx].info);
    const name = info.split(/[\s{]/)[0];
    const def = byName.get(name);
    if (!def) {
      env.warnings.push(`Unbekannte Direktive ":::${name}"`);
      env.closeStack.push("</aside>");
      return `<aside class="rb-note rb-note--warning"><div class="rb-note-title">Unbekannte Direktive: <code>${esc(name)}</code></div>`;
    }
    const { open, close } = def.render(parseAttrs(info.slice(name.length)), env);
    env.closeStack.push(close);
    return open;
  };
  md.renderer.rules["rb_container_close"] = (_tokens, _idx, _o, e) => e.closeStack.pop() ?? "</div>";
}

// src/app/rulebook/markdown/renderers.ts
var EXPLICIT_ID_RE = /\s*\{#([\w-]+)\}\s*$/;
function registerRenderers(md) {
  md.renderer.rules["heading_open"] = (tokens, idx, options, e, self) => {
    const env = e;
    const inline = tokens[idx + 1];
    let id;
    const explicit = EXPLICIT_ID_RE.exec(inline.content);
    if (explicit) {
      id = explicit[1];
      inline.content = inline.content.replace(EXPLICIT_ID_RE, "");
      const kids = inline.children ?? [];
      for (let i = kids.length - 1; i >= 0; i--) {
        if (kids[i].type === "text") {
          kids[i].content = kids[i].content.replace(EXPLICIT_ID_RE, "");
          break;
        }
      }
    } else {
      id = slugify(inline.content);
    }
    id = uniqueSlug(id, env.seenSlugs);
    env.headings.push({ id, level: Number(tokens[idx].tag.slice(1)), text: inline.content });
    tokens[idx].attrSet("id", id);
    tokens[idx].attrJoin("class", "rb-heading");
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules["link_open"] = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    const href = String(token.attrGet("href") ?? "");
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
      token.attrJoin("class", "rb-link rb-link--external");
    } else {
      const { page, anchor } = splitTarget(href);
      if (page)
        token.attrSet("data-rb-page", page);
      if (anchor)
        token.attrSet("data-rb-anchor", anchor);
      token.attrSet("href", anchor && !page ? `#${anchor}` : "#");
      token.attrJoin("class", "rb-link");
    }
    return self.renderToken(tokens, idx, options);
  };
}

// src/app/rulebook/markdown/rulebook-markdown.ts
var mdPromise = null;
function getMarkdown() {
  mdPromise ??= buildMarkdown();
  return mdPromise;
}
function interop(mod) {
  const m = mod;
  return m?.default?.default ?? m?.default ?? m;
}
async function buildMarkdown() {
  const mdMod = await import("./chunk-MH5BT3HE.js");
  const MarkdownItCtor = interop(mdMod);
  const md = new MarkdownItCtor({
    html: false,
    // ← load-bearing: see SECURITY above
    linkify: false,
    // German prose has few bare URLs; avoids surprises
    typographer: false,
    // don't rewrite -- / "..." in rules text
    breaks: true
    // single newline = <br>; matches how the raw guide is written
  });
  registerContainers(md);
  registerInlineDirectives(md, INLINE_DIRECTIVES);
  registerRenderers(md);
  return md;
}
function stripFrontMatter(raw) {
  return raw.replace(/^﻿/, "").replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, "");
}
async function renderMarkdown(source, pageId) {
  const md = await getMarkdown();
  const env = {
    pageId,
    closeStack: [],
    seenSlugs: /* @__PURE__ */ new Map(),
    headings: [],
    warnings: []
  };
  const html = md.render(stripFrontMatter(source), env);
  return { html, headings: env.headings, warnings: env.warnings };
}

// src/app/rulebook/rulebook.service.ts
var RulebookService = class _RulebookService {
  http = inject(HttpClient);
  manifestPromise = null;
  pageCache = /* @__PURE__ */ new Map();
  pages = signal([], ...ngDevMode ? [{ debugName: "pages" }] : []);
  loadManifest() {
    this.manifestPromise ??= firstValueFrom(
      // The manifest carries the content hashes, so it must never be served stale.
      this.http.get("/rulebook/index.json", {
        headers: { "Cache-Control": "no-cache" }
      })
    ).then((m) => {
      this.pages.set(m.pages ?? []);
      return m;
    }).catch((err) => {
      this.manifestPromise = null;
      throw err;
    });
    return this.manifestPromise;
  }
  async loadPage(id) {
    const cached = this.pageCache.get(id);
    if (cached)
      return cached;
    const manifest = await this.loadManifest();
    const page = manifest.pages.find((p) => p.id === id);
    if (!page)
      throw new Error(`Unbekannte Regelwerk-Seite: "${id}"`);
    const url = isDevMode() ? `/rulebook/${page.file}` : `/rulebook/${page.file}?v=${page.hash}`;
    const source = await firstValueFrom(this.http.get(url, { responseType: "text" }));
    if (/^\s*(?:<!doctype html|<html)/i.test(source)) {
      throw new Error(`Regelwerk-Seite "${id}" existiert nicht mehr (${page.file}).`);
    }
    const result = await renderMarkdown(source, id);
    if (result.warnings.length && isDevMode()) {
      console.warn(`[rulebook] ${id}:`, result.warnings);
    }
    this.pageCache.set(id, result);
    this.refreshOutline(id, result);
    return result;
  }
  /**
   * Replace a page's manifest outline with the one derived from the content we just rendered.
   *
   * The manifest is generated at build time, so a heading added since the last
   * `npm run rulebook:manifest` would be missing from the tab dropdown even though it is visibly
   * on the page. Once a page has been rendered we know its real jump points — trust those.
   */
  refreshOutline(id, result) {
    if (!result.headings.length)
      return;
    const live = result.headings.map((h) => ({
      id: h.id,
      text: h.text,
      level: h.level,
      kind: h.kind ?? "heading"
    }));
    this.pages.update((pages) => pages.map((p) => p.id === id ? __spreadProps(__spreadValues({}, p), { outline: live }) : p));
  }
  // ── Search ────────────────────────────────────────────────────────────────────
  plainTextCache = null;
  /** Raw markdown of every page, stripped to plain text. Fetched once, on first search. */
  async loadAllText() {
    if (this.plainTextCache)
      return this.plainTextCache;
    const manifest = await this.loadManifest();
    const entries = await Promise.all(manifest.pages.map(async (p) => {
      try {
        const url = isDevMode() ? `/rulebook/${p.file}` : `/rulebook/${p.file}?v=${p.hash}`;
        const raw = await firstValueFrom(this.http.get(url, { responseType: "text" }));
        return [p.id, toPlainText(raw)];
      } catch {
        return [p.id, ""];
      }
    }));
    this.plainTextCache = new Map(entries);
    return this.plainTextCache;
  }
  /**
   * Searches jump points (headings + section titles) and body text across all pages.
   * Jump points always outrank body matches, so "where do I jump to?" wins over "where is
   * this word mentioned?".
   */
  async search(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2)
      return [];
    const manifest = await this.loadManifest();
    const hits = [];
    for (const page of manifest.pages) {
      for (const entry of page.outline ?? []) {
        const text = entry.text.toLowerCase();
        const at = text.indexOf(q);
        if (at < 0)
          continue;
        const score = 1e3 - entry.level * 10 + (text === q ? 500 : at === 0 ? 250 : 0) + (entry.kind === "section" ? 5 : 0);
        hits.push({
          pageId: page.id,
          pageTab: page.tab,
          anchor: entry.id,
          title: entry.text,
          kind: "jump",
          score
        });
      }
      const tab = page.tab.toLowerCase();
      if (tab.includes(q)) {
        hits.push({
          pageId: page.id,
          pageTab: page.tab,
          title: page.title,
          kind: "jump",
          score: 1200 + (tab === q ? 500 : 0)
        });
      }
    }
    const texts = await this.loadAllText();
    for (const page of manifest.pages) {
      const body = texts.get(page.id) ?? "";
      if (!body)
        continue;
      const lower = body.toLowerCase();
      let from = 0;
      let found = 0;
      while (found < 3) {
        const at = lower.indexOf(q, from);
        if (at < 0)
          break;
        from = at + q.length;
        found++;
        const anchor = nearestAnchor(page, body, at);
        if (hits.some((h) => h.kind === "jump" && h.pageId === page.id && h.anchor === anchor))
          continue;
        hits.push({
          pageId: page.id,
          pageTab: page.tab,
          anchor,
          title: anchor ? titleOf(page, anchor) : page.title,
          excerpt: excerptAround(body, at, q.length),
          kind: "text",
          score: 100 - found
        });
      }
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, 40);
  }
  static \u0275fac = function RulebookService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _RulebookService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _RulebookService, factory: _RulebookService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RulebookService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();
function toPlainText(raw) {
  return raw.replace(/^﻿/, "").replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, "").replace(/^:{3,}.*$/gm, "").replace(/`{1,3}[^`]*`{1,3}/g, " ").replace(/:(icon|hl|kbd|jump)\[([^\]]*)\](\{[^}]*\})?/g, "$2").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_>#]+/g, "").replace(/[ \t]+/g, " ");
}
function nearestAnchor(page, body, index) {
  let best;
  let bestPos = -1;
  for (const entry of page.outline ?? []) {
    const pos = body.indexOf(entry.text);
    if (pos >= 0 && pos <= index && pos > bestPos) {
      bestPos = pos;
      best = entry.id;
    }
  }
  return best;
}
function titleOf(page, anchor) {
  return (page.outline ?? []).find((e) => e.id === anchor)?.text ?? page.title;
}
function excerptAround(body, at, len) {
  const start = Math.max(0, at - 45);
  const end = Math.min(body.length, at + len + 55);
  return (start > 0 ? "\u2026 " : "") + body.slice(start, end).trim() + (end < body.length ? " \u2026" : "");
}

// src/app/rulebook/rulebook.component.ts
var _c0 = ["scroller"];
var _forTrack0 = ($index, $item) => $item.id;
function RulebookComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 20);
    \u0275\u0275domListener("click", function RulebookComponent_Conditional_9_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.clearSearch());
    });
    \u0275\u0275text(1, "\xD7");
    \u0275\u0275domElementEnd();
  }
}
function RulebookComponent_Conditional_10_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 21);
    \u0275\u0275text(1, "Suche l\xE4uft \u2026");
    \u0275\u0275domElementEnd();
  }
}
function RulebookComponent_Conditional_10_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 21);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Nichts gefunden f\xFCr \u201E", ctx_r2.query(), '"');
  }
}
function RulebookComponent_Conditional_10_Conditional_3_For_1_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const hit_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(hit_r5.excerpt);
  }
}
function RulebookComponent_Conditional_10_Conditional_3_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 23);
    \u0275\u0275domListener("click", function RulebookComponent_Conditional_10_Conditional_3_For_1_Template_button_click_0_listener() {
      const hit_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.openHit(hit_r5));
    });
    \u0275\u0275domElementStart(1, "span", 24);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "span", 25);
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(5, "span", 26);
    \u0275\u0275text(6);
    \u0275\u0275domElementEnd();
    \u0275\u0275conditionalCreate(7, RulebookComponent_Conditional_10_Conditional_3_For_1_Conditional_7_Template, 2, 1, "span", 27);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const hit_r5 = ctx.$implicit;
    \u0275\u0275classProp("rb-result--text", hit_r5.kind === "text");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(hit_r5.kind === "jump" ? "Sprungmarke" : "Text");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(hit_r5.title);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(hit_r5.pageTab);
    \u0275\u0275advance();
    \u0275\u0275conditional(hit_r5.excerpt ? 7 : -1);
  }
}
function RulebookComponent_Conditional_10_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, RulebookComponent_Conditional_10_Conditional_3_For_1_Template, 8, 6, "button", 22, \u0275\u0275repeaterTrackByIndex);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r2.results());
  }
}
function RulebookComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 10);
    \u0275\u0275conditionalCreate(1, RulebookComponent_Conditional_10_Conditional_1_Template, 2, 0, "div", 21)(2, RulebookComponent_Conditional_10_Conditional_2_Template, 2, 1, "div", 21)(3, RulebookComponent_Conditional_10_Conditional_3_Template, 2, 0);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.searching() ? 1 : !ctx_r2.results().length ? 2 : 3);
  }
}
function RulebookComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 28);
    \u0275\u0275domListener("click", function RulebookComponent_Conditional_11_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.close.emit());
    });
    \u0275\u0275text(1, "\xD7");
    \u0275\u0275domElementEnd();
  }
}
function RulebookComponent_For_17_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElement(0, "span");
  }
  if (rf & 2) {
    const p_r8 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275classMap("app-icon i-" + p_r8.icon);
  }
}
function RulebookComponent_For_17_Conditional_4_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 34);
    \u0275\u0275domListener("click", function RulebookComponent_For_17_Conditional_4_For_2_Template_button_click_0_listener() {
      const entry_r10 = \u0275\u0275restoreView(_r9).$implicit;
      const p_r8 = \u0275\u0275nextContext(2).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.jumpFromMenu(p_r8.id, entry_r10.id));
    });
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const entry_r10 = ctx.$implicit;
    \u0275\u0275attribute("data-level", entry_r10.level);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", entry_r10.text, " ");
  }
}
function RulebookComponent_For_17_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 32);
    \u0275\u0275repeaterCreate(1, RulebookComponent_For_17_Conditional_4_For_2_Template, 2, 2, "button", 33, _forTrack0);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const p_r8 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.outlineOf(p_r8.id));
  }
}
function RulebookComponent_For_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 29);
    \u0275\u0275domListener("mouseenter", function RulebookComponent_For_17_Template_div_mouseenter_0_listener() {
      const p_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onTabEnter(p_r8.id));
    });
    \u0275\u0275domElementStart(1, "button", 30);
    \u0275\u0275domListener("click", function RulebookComponent_For_17_Template_button_click_1_listener() {
      const p_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onTabClick(p_r8.id));
    });
    \u0275\u0275conditionalCreate(2, RulebookComponent_For_17_Conditional_2_Template, 1, 2, "span", 31);
    \u0275\u0275text(3);
    \u0275\u0275domElementEnd();
    \u0275\u0275conditionalCreate(4, RulebookComponent_For_17_Conditional_4_Template, 3, 0, "div", 32);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const p_r8 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275classProp("active", p_r8.id === ctx_r2.activeId());
    \u0275\u0275advance();
    \u0275\u0275conditional(p_r8.icon ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", p_r8.tab, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.openMenu() === p_r8.id && ctx_r2.outlineOf(p_r8.id).length ? 4 : -1);
  }
}
function RulebookComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 17)(1, "p");
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "p", 35);
    \u0275\u0275text(4, " Liegt eine ");
    \u0275\u0275domElementStart(5, "code");
    \u0275\u0275text(6, "index.json");
    \u0275\u0275domElementEnd();
    \u0275\u0275text(7, " in ");
    \u0275\u0275domElementStart(8, "code");
    \u0275\u0275text(9, "public/rulebook/");
    \u0275\u0275domElementEnd();
    \u0275\u0275text(10, "? Erzeuge sie mit ");
    \u0275\u0275domElementStart(11, "code");
    \u0275\u0275text(12, "npm run rulebook:manifest");
    \u0275\u0275domElementEnd();
    \u0275\u0275text(13, ". ");
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.fatal());
  }
}
function RulebookComponent_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 18);
    \u0275\u0275domElement(1, "span", 36);
    \u0275\u0275text(2, " Wird geladen \u2026");
    \u0275\u0275domElementEnd();
  }
}
function RulebookComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 17)(1, "p");
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "button", 37);
    \u0275\u0275domListener("click", function RulebookComponent_Conditional_22_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.retry());
    });
    \u0275\u0275text(4, "Erneut versuchen");
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.error());
  }
}
function RulebookComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElement(0, "article", 19);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275domProperty("innerHTML", ctx_r2.html(), \u0275\u0275sanitizeHtml);
  }
}
var RulebookComponent = class _RulebookComponent {
  /** 'overlay' = fullscreen modal inside the sheet; 'page' = standalone /rulebook route. */
  mode = "overlay";
  startPage;
  close = new EventEmitter();
  service = inject(RulebookService);
  sanitizer = inject(DomSanitizer);
  injector = inject(Injector);
  route = inject(ActivatedRoute, { optional: true });
  pages = this.service.pages;
  activeId = signal(null, ...ngDevMode ? [{ debugName: "activeId" }] : []);
  html = signal(null, ...ngDevMode ? [{ debugName: "html" }] : []);
  headings = signal([], ...ngDevMode ? [{ debugName: "headings" }] : []);
  loading = signal(true, ...ngDevMode ? [{ debugName: "loading" }] : []);
  error = signal(null, ...ngDevMode ? [{ debugName: "error" }] : []);
  fatal = signal(null, ...ngDevMode ? [{ debugName: "fatal" }] : []);
  history = signal([], ...ngDevMode ? [{ debugName: "history" }] : []);
  canGoBack = computed(() => this.history().length > 0, ...ngDevMode ? [{ debugName: "canGoBack" }] : []);
  /** Tab whose section dropdown is currently open (hover/focus). */
  openMenu = signal(null, ...ngDevMode ? [{ debugName: "openMenu" }] : []);
  menuTimer = null;
  // Search
  query = signal("", ...ngDevMode ? [{ debugName: "query" }] : []);
  results = signal([], ...ngDevMode ? [{ debugName: "results" }] : []);
  searching = signal(false, ...ngDevMode ? [{ debugName: "searching" }] : []);
  searchSeq = 0;
  scroller = viewChild("scroller", ...ngDevMode ? [{ debugName: "scroller" }] : []);
  async ngOnInit() {
    const routePath = this.route?.snapshot.routeConfig?.path ?? "";
    if (routePath.startsWith("rulebook"))
      this.mode = "page";
    const routePage = this.route?.snapshot.paramMap.get("page") ?? void 0;
    try {
      const manifest = await this.service.loadManifest();
      const first = manifest.pages[0]?.id;
      const start = this.startPage ?? routePage ?? first;
      if (!start) {
        this.fatal.set("Das Regelwerk enth\xE4lt noch keine Seiten.");
        this.loading.set(false);
        return;
      }
      await this.openPage(start, void 0, false);
    } catch {
      this.fatal.set("Das Regelwerk konnte nicht geladen werden.");
      this.loading.set(false);
    }
  }
  /** Tab clicks, jump links and Back all funnel through here. */
  async openPage(id, anchor, push = true) {
    if (push && this.activeId()) {
      const scrollTop = this.scroller()?.nativeElement.scrollTop ?? 0;
      this.history.update((h) => [...h, { pageId: this.activeId(), scrollTop }]);
    }
    this.loading.set(true);
    this.error.set(null);
    this.activeId.set(id);
    try {
      const result = await this.service.loadPage(id);
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(result.html));
      this.headings.set(result.headings);
      this.loading.set(false);
      this.afterRender(() => anchor ? this.scrollToAnchor(anchor) : this.scroller()?.nativeElement.scrollTo({ top: 0 }));
    } catch {
      this.loading.set(false);
      this.html.set(null);
      this.error.set(`Die Seite \u201E${id}" konnte nicht geladen werden.`);
    }
  }
  retry() {
    const id = this.activeId();
    if (id)
      void this.openPage(id, void 0, false);
  }
  goBack() {
    const stack = this.history();
    const prev = stack.at(-1);
    if (!prev)
      return;
    this.history.set(stack.slice(0, -1));
    void this.openPage(prev.pageId, void 0, false).then(() => this.afterRender(() => this.scroller()?.nativeElement.scrollTo({ top: prev.scrollTop })));
  }
  /** One delegated listener — survives every re-render of the [innerHTML] content. */
  onContentClick(event) {
    const el = event.target?.closest("[data-rb-page],[data-rb-anchor]");
    if (!el)
      return;
    event.preventDefault();
    const page = el.getAttribute("data-rb-page") ?? "";
    const anchor = el.getAttribute("data-rb-anchor") ?? void 0;
    if (page && page !== this.activeId()) {
      void this.openPage(page, anchor);
    } else {
      const scrollTop = this.scroller()?.nativeElement.scrollTop ?? 0;
      this.history.update((h) => [...h, { pageId: this.activeId(), scrollTop }]);
      this.scrollToAnchor(anchor);
    }
  }
  onTabClick(id) {
    if (id !== this.activeId())
      void this.openPage(id);
  }
  onAltLeft(event) {
    if (!this.canGoBack())
      return;
    event.preventDefault();
    this.goBack();
  }
  // ── Tab section dropdowns ────────────────────────────────────────────────────
  onTabEnter(id) {
    if (this.menuTimer)
      clearTimeout(this.menuTimer);
    this.openMenu.set(id);
  }
  /** Small delay so moving the pointer from the tab into the dropdown doesn't close it. */
  onTabLeave() {
    if (this.menuTimer)
      clearTimeout(this.menuTimer);
    this.menuTimer = setTimeout(() => this.openMenu.set(null), 320);
  }
  outlineOf(id) {
    return this.pages().find((p) => p.id === id)?.outline ?? [];
  }
  jumpFromMenu(pageId, anchor) {
    this.openMenu.set(null);
    void this.openPage(pageId, anchor);
  }
  // ── Search ───────────────────────────────────────────────────────────────────
  async onQueryChange(value) {
    this.query.set(value);
    const seq = ++this.searchSeq;
    if (value.trim().length < 2) {
      this.results.set([]);
      this.searching.set(false);
      return;
    }
    this.searching.set(true);
    const hits = await this.service.search(value);
    if (seq !== this.searchSeq)
      return;
    this.results.set(hits);
    this.searching.set(false);
  }
  openHit(hit) {
    this.clearSearch();
    void this.openPage(hit.pageId, hit.anchor);
  }
  clearSearch() {
    this.query.set("");
    this.results.set([]);
    this.searching.set(false);
    this.searchSeq++;
  }
  scrollToAnchor(anchor) {
    if (!anchor)
      return;
    const host = this.scroller()?.nativeElement;
    const target = host?.querySelector(`#${CSS.escape(anchor)}`);
    if (!target)
      return;
    let node = target;
    while (node) {
      const details = node.closest("details");
      if (!details)
        break;
      details.open = true;
      node = details.parentElement;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  /** The [innerHTML] DOM only exists after the next render — not when the signal is set. */
  afterRender(fn) {
    afterNextRender(fn, { injector: this.injector });
  }
  static \u0275fac = function RulebookComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _RulebookComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _RulebookComponent, selectors: [["app-rulebook"]], viewQuery: function RulebookComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuerySignal(ctx.scroller, _c0, 5);
    }
    if (rf & 2) {
      \u0275\u0275queryAdvance();
    }
  }, hostBindings: function RulebookComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("keydown.alt.arrowleft", function RulebookComponent_keydown_alt_arrowleft_HostBindingHandler($event) {
        return ctx.onAltLeft($event);
      }, \u0275\u0275resolveDocument);
    }
  }, inputs: { mode: "mode", startPage: "startPage" }, outputs: { close: "close" }, decls: 24, vars: 8, consts: [["scroller", ""], [1, "rb-root"], [1, "rb-panel"], [1, "rb-header"], [1, "rb-title"], [1, "app-icon", "i-ability"], [1, "rb-searchbox"], [1, "app-icon", "i-lasso", "rb-search-ico"], ["type", "text", "placeholder", "Suchen \u2026 (Sprungmarken zuerst)", 1, "rb-search", 3, "input", "keydown.escape", "value"], ["title", "Suche leeren", 1, "rb-search-clear"], [1, "rb-results"], ["title", "Schlie\xDFen (Esc)", 1, "rb-close"], [1, "rb-tabbar"], ["title", "Zur\xFCck (Alt+\u2190)", 1, "rb-back", 3, "click", "disabled"], [1, "rb-tabs", 3, "mouseleave"], [1, "rb-tabwrap"], [1, "rb-content", 3, "click"], [1, "rb-error"], [1, "rb-loading"], [1, "rb-article", 3, "innerHTML"], ["title", "Suche leeren", 1, "rb-search-clear", 3, "click"], [1, "rb-results-empty"], [1, "rb-result", 3, "rb-result--text"], [1, "rb-result", 3, "click"], [1, "rb-result-kind"], [1, "rb-result-title"], [1, "rb-result-page"], [1, "rb-result-excerpt"], ["title", "Schlie\xDFen (Esc)", 1, "rb-close", 3, "click"], [1, "rb-tabwrap", 3, "mouseenter"], [1, "rb-tab", 3, "click"], [3, "class"], [1, "rb-menu"], [1, "rb-menu-item"], [1, "rb-menu-item", 3, "click"], [1, "rb-error-hint"], [1, "rb-spinner"], [1, "rb-retry", 3, "click"]], template: function RulebookComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275domElementStart(0, "div", 1)(1, "div", 2)(2, "div", 3)(3, "h1", 4);
      \u0275\u0275domElement(4, "span", 5);
      \u0275\u0275text(5, " Regelwerk");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(6, "div", 6);
      \u0275\u0275domElement(7, "span", 7);
      \u0275\u0275domElementStart(8, "input", 8);
      \u0275\u0275domListener("input", function RulebookComponent_Template_input_input_8_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onQueryChange($event.target.value));
      })("keydown.escape", function RulebookComponent_Template_input_keydown_escape_8_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.clearSearch());
      });
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(9, RulebookComponent_Conditional_9_Template, 2, 0, "button", 9);
      \u0275\u0275conditionalCreate(10, RulebookComponent_Conditional_10_Template, 4, 1, "div", 10);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(11, RulebookComponent_Conditional_11_Template, 2, 0, "button", 11);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(12, "div", 12)(13, "button", 13);
      \u0275\u0275domListener("click", function RulebookComponent_Template_button_click_13_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.goBack());
      });
      \u0275\u0275text(14, "\u2190");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(15, "div", 14);
      \u0275\u0275domListener("mouseleave", function RulebookComponent_Template_div_mouseleave_15_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onTabLeave());
      });
      \u0275\u0275repeaterCreate(16, RulebookComponent_For_17_Template, 5, 5, "div", 15, _forTrack0);
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(18, "div", 16, 0);
      \u0275\u0275domListener("click", function RulebookComponent_Template_div_click_18_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onContentClick($event));
      });
      \u0275\u0275conditionalCreate(20, RulebookComponent_Conditional_20_Template, 14, 1, "div", 17)(21, RulebookComponent_Conditional_21_Template, 3, 0, "div", 18)(22, RulebookComponent_Conditional_22_Template, 5, 1, "div", 17)(23, RulebookComponent_Conditional_23_Template, 1, 1, "article", 19);
      \u0275\u0275domElementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275classProp("rb-root--overlay", ctx.mode === "overlay");
      \u0275\u0275advance(8);
      \u0275\u0275domProperty("value", ctx.query());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.query() ? 9 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.query().length > 1 ? 10 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.mode === "overlay" ? 11 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275domProperty("disabled", !ctx.canGoBack());
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.pages());
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.fatal() ? 20 : ctx.loading() ? 21 : ctx.error() ? 22 : 23);
    }
  }, styles: ['/* src/app/rulebook/rulebook.component.css */\n.rb-root {\n  --rb-info: var(--mana-color, #3b82f6);\n  --rb-formula: var(--energy-color, #22c55e);\n  --rb-warning: var(--health-color, #ef4444);\n  --rb-tip: var(--accent, #8b5cf6);\n  --rb-highlight: #f59e0b;\n  display: flex;\n  min-height: 0;\n  color: var(--text, #e5e7eb);\n}\n.rb-root--overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 2000;\n  background: rgba(0, 0, 0, 0.85);\n  -webkit-backdrop-filter: blur(5px);\n  backdrop-filter: blur(5px);\n  align-items: center;\n  justify-content: center;\n  padding: 2vh 2vw;\n  animation: rb-fade 0.16s ease;\n}\n@keyframes rb-fade {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.rb-panel {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  max-width: 1100px;\n  max-height: 96vh;\n  min-height: 0;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 12px;\n  overflow: hidden;\n}\n.rb-root:not(.rb-root--overlay) .rb-panel {\n  max-width: none;\n  max-height: none;\n  height: 100vh;\n  border: none;\n  border-radius: 0;\n}\n.rb-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.9rem 1.4rem;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n}\n.rb-title {\n  margin: 0;\n  font-size: 1.15rem;\n  font-weight: 700;\n  letter-spacing: 0.03em;\n  color: var(--accent, #8b5cf6);\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.rb-close {\n  background: none;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  font-size: 1.7rem;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 0.4rem;\n  border-radius: 6px;\n}\n.rb-close:hover {\n  color: var(--text, #e5e7eb);\n  background: rgba(255, 255, 255, 0.08);\n}\n.rb-tabbar {\n  position: relative;\n  z-index: 5;\n  overflow: visible;\n  display: flex;\n  align-items: stretch;\n  border-bottom: 1px solid var(--border, #374151);\n  background: var(--card, #1f2937);\n  flex-shrink: 0;\n}\n.rb-back {\n  padding: 0.65rem 0.95rem;\n  background: transparent;\n  border: none;\n  border-right: 1px solid var(--border, #374151);\n  color: var(--text-muted, #9ca3af);\n  font-size: 1rem;\n  cursor: pointer;\n  transition: color 0.18s;\n}\n.rb-back:hover:not(:disabled) {\n  color: var(--accent, #8b5cf6);\n}\n.rb-back:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n.rb-tabs {\n  display: flex;\n  flex-wrap: wrap;\n  overflow: visible;\n  min-width: 0;\n}\n.rb-tab {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.65rem 1.35rem;\n  background: transparent;\n  border: none;\n  border-bottom: 3px solid transparent;\n  margin-bottom: -1px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  font-weight: 700;\n  white-space: nowrap;\n  cursor: pointer;\n  transition: all 0.18s;\n}\n.rb-tab:hover {\n  color: var(--text, #e5e7eb);\n}\n.rb-tab.active {\n  color: var(--accent, #8b5cf6);\n  border-bottom-color: var(--accent, #8b5cf6);\n}\n.rb-content {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 1.5rem 2rem 4rem;\n}\n.rb-content::-webkit-scrollbar {\n  width: 8px;\n}\n.rb-content::-webkit-scrollbar-track {\n  background: transparent;\n}\n.rb-content::-webkit-scrollbar-thumb {\n  background: var(--border, #374151);\n  border-radius: 4px;\n}\n.rb-article {\n  max-width: 900px;\n  margin: 0 auto;\n}\n.rb-loading,\n.rb-error {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.9rem;\n  padding: 4rem 2rem;\n  color: var(--text-muted, #9ca3af);\n}\n.rb-error-hint {\n  font-size: 0.8rem;\n  opacity: 0.8;\n  text-align: center;\n}\n.rb-spinner {\n  width: 20px;\n  height: 20px;\n  border: 2px solid var(--border, #374151);\n  border-top-color: var(--accent, #8b5cf6);\n  border-radius: 50%;\n  animation: rb-spin 0.8s linear infinite;\n}\n@keyframes rb-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.rb-retry {\n  padding: 0.5rem 1.1rem;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n}\n.rb-retry:hover {\n  filter: brightness(1.12);\n}\n.rb-article h1,\n.rb-article h2,\n.rb-article h3,\n.rb-article h4 {\n  color: var(--accent, #8b5cf6);\n  line-height: 1.25;\n  scroll-margin-top: 1rem;\n}\n.rb-article h1 {\n  font-size: 1.75rem;\n  margin: 0 0 1.2rem;\n}\n.rb-article h2 {\n  font-size: 1.4rem;\n  margin: 2.2rem 0 0.9rem;\n  padding-bottom: 0.4rem;\n  border-bottom: 1px solid var(--border, #374151);\n}\n.rb-article h3 {\n  font-size: 1.15rem;\n  margin: 1.6rem 0 0.6rem;\n}\n.rb-article h4 {\n  font-size: 1rem;\n  margin: 1.2rem 0 0.5rem;\n}\n.rb-article p,\n.rb-article li {\n  line-height: 1.7;\n  color: var(--text, #e5e7eb);\n}\n.rb-article p {\n  margin: 0.7rem 0;\n}\n.rb-article ul,\n.rb-article ol {\n  margin: 0.7rem 0;\n  padding-left: 1.4rem;\n}\n.rb-article li {\n  margin: 0.3rem 0;\n}\n.rb-article strong {\n  color: #fff;\n  font-weight: 700;\n}\n.rb-article code {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 4px;\n  padding: 0.05rem 0.35rem;\n  font-size: 0.88em;\n}\n.rb-article hr {\n  border: none;\n  border-top: 1px solid var(--border, #374151);\n  margin: 2rem 0;\n}\n.rb-link {\n  color: var(--accent, #8b5cf6);\n  text-decoration: none;\n  border-bottom: 1px dotted currentColor;\n  cursor: pointer;\n}\n.rb-link:hover {\n  filter: brightness(1.2);\n}\n.rb-hl {\n  color: var(--rb-highlight);\n  font-weight: 700;\n}\n.rb-kbd {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-bottom-width: 2px;\n  border-radius: 5px;\n  padding: 0.05rem 0.4rem;\n  font-size: 0.85em;\n  font-weight: 700;\n}\n.rb-section {\n  margin: 2rem 0;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border, #374151);\n  border-radius: 10px;\n  scroll-margin-top: 1rem;\n  overflow: hidden;\n}\n.rb-section {\n  --rb-section-color: var(--accent, #8b5cf6);\n}\n.rb-section-title {\n  margin: 0;\n  padding: 1rem 1.5rem;\n  font-size: 1.2rem;\n  font-weight: 700;\n  color: var(--rb-section-color, var(--accent, #8b5cf6));\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  list-style: none;\n  -webkit-user-select: none;\n  user-select: none;\n  transition: background 0.15s;\n}\n.rb-section-title::-webkit-details-marker {\n  display: none;\n}\n.rb-section-title:hover {\n  background: rgba(255, 255, 255, 0.04);\n}\n.rb-section-titletext {\n  flex: 1;\n}\n.rb-section-chev {\n  width: 0;\n  height: 0;\n  flex: none;\n  border-left: 5px solid transparent;\n  border-right: 5px solid transparent;\n  border-top: 6px solid currentColor;\n  opacity: 0.65;\n  transition: transform 0.18s;\n}\n.rb-section[open] > .rb-section-title .rb-section-chev {\n  transform: rotate(180deg);\n}\n.rb-section-body {\n  padding: 0 1.5rem 1.3rem;\n}\n.rb-section-body > :first-child {\n  margin-top: 0;\n}\n.rb-section-body > :last-child {\n  margin-bottom: 0;\n}\n.rb-note {\n  --rb-note-color: var(--rb-info);\n  border-left: 4px solid var(--rb-note-color);\n  background: color-mix(in srgb, var(--rb-note-color) 13%, transparent);\n  box-shadow: 0 2px 10px color-mix(in srgb, var(--rb-note-color) 18%, transparent);\n  padding: 1rem 1.2rem;\n  margin: 1.2rem 0;\n  border-radius: 8px;\n}\n.rb-note--formula {\n  --rb-note-color: var(--rb-formula);\n  font-family:\n    ui-monospace,\n    "Courier New",\n    monospace;\n}\n.rb-note--warning {\n  --rb-note-color: var(--rb-warning);\n}\n.rb-note--tip {\n  --rb-note-color: var(--rb-tip);\n}\n.rb-note-title {\n  font-weight: 700;\n  color: var(--rb-note-color);\n  margin-bottom: 0.4rem;\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n.rb-note > :first-child {\n  margin-top: 0;\n}\n.rb-note > :last-child {\n  margin-bottom: 0;\n}\n.rb-note p {\n  margin: 0.35rem 0;\n}\n.rb-grid > .rb-card {\n  margin: 0;\n}\n.rb-grid {\n  display: grid;\n  gap: 1rem;\n  margin: 1.3rem 0;\n  grid-template-columns: repeat(auto-fit, minmax(var(--rb-grid-min, 280px), 1fr));\n}\n.rb-card {\n  margin: 1.25rem 0;\n  --rb-card-color: var(--accent, #8b5cf6);\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid color-mix(in srgb, var(--rb-card-color) 35%, var(--border, #374151));\n  border-radius: 10px;\n  padding: 1rem 1.1rem;\n  transition:\n    transform 0.18s,\n    box-shadow 0.18s,\n    border-color 0.18s;\n  scroll-margin-top: 1rem;\n}\n.rb-card:hover {\n  transform: translateY(-3px);\n  border-color: var(--rb-card-color);\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--rb-card-color) 28%, transparent);\n}\n.rb-card--health {\n  --rb-card-color: var(--health-color, #ef4444);\n}\n.rb-card--energy {\n  --rb-card-color: var(--energy-color, #22c55e);\n}\n.rb-card--mana {\n  --rb-card-color: var(--mana-color, #3b82f6);\n}\n.rb-card-title {\n  margin: 0 0 0.6rem !important;\n  color: var(--rb-card-color) !important;\n  font-size: 1rem;\n  display: flex;\n  align-items: center;\n  gap: 0.45rem;\n}\n.rb-card-body > :first-child {\n  margin-top: 0;\n}\n.rb-card-body > :last-child {\n  margin-bottom: 0;\n}\n.rb-tag {\n  margin-left: auto;\n  font-size: 0.62rem;\n  font-weight: 800;\n  letter-spacing: 0.06em;\n  padding: 0.1rem 0.45rem;\n  border-radius: 999px;\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid var(--border, #374151);\n}\n.rb-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin: 1.2rem 0;\n}\n.rb-jump {\n  padding: 0.45rem 1rem;\n  background: rgba(139, 92, 246, 0.14);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  color: var(--accent, #8b5cf6);\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.rb-jump:hover {\n  background: rgba(139, 92, 246, 0.28);\n}\n.rb-datagroup {\n  margin: 1.2rem 0;\n}\n.rb-datagroup-title {\n  font-size: 0.7rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  color: var(--text-muted, #9ca3af);\n  margin-bottom: 0.5rem;\n}\n.rb-chiplist {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.45rem;\n}\n.rb-chip {\n  display: flex;\n  flex-direction: column;\n  gap: 0.1rem;\n  padding: 0.4rem 0.7rem;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 7px;\n  font-size: 0.82rem;\n}\n.rb-chip small {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.68rem;\n}\n.rb-tablewrap {\n  overflow-x: auto;\n  margin: 1.2rem 0;\n}\n.rb-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.84rem;\n}\n.rb-table th,\n.rb-table td {\n  text-align: left;\n  padding: 0.45rem 0.6rem;\n  border-bottom: 1px solid var(--border, #374151);\n}\n.rb-table th {\n  font-size: 0.66rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--text-muted, #9ca3af);\n}\n.rb-table tbody tr:hover {\n  background: rgba(255, 255, 255, 0.03);\n}\n@media (max-width: 768px) {\n  .rb-grid {\n    grid-template-columns: 1fr;\n  }\n  .rb-content {\n    padding: 1rem 1rem 3rem;\n  }\n}\n.rb-tabwrap {\n  position: relative;\n  display: flex;\n}\n.rb-menu {\n  position: absolute;\n  top: calc(100% - 1px);\n  left: 0;\n  z-index: 40;\n  min-width: 240px;\n  max-width: 340px;\n  max-height: 60vh;\n  overflow-y: auto;\n  padding: 0.35rem;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 0 0 10px 10px;\n  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);\n  animation: rb-menu-in 0.14s ease;\n}\n.rb-menu::before {\n  content: "";\n  position: absolute;\n  top: -10px;\n  left: 0;\n  right: 0;\n  height: 10px;\n}\n@keyframes rb-menu-in {\n  from {\n    opacity: 0;\n    transform: translateY(-6px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n.rb-menu-item {\n  display: block;\n  width: 100%;\n  text-align: left;\n  padding: 0.4rem 0.6rem;\n  background: none;\n  border: none;\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.83rem;\n  cursor: pointer;\n  transition: all 0.12s;\n}\n.rb-menu-item:hover {\n  background: rgba(139, 92, 246, 0.16);\n  color: var(--text, #e5e7eb);\n}\n.rb-menu-item[data-level="1"] {\n  font-weight: 800;\n  color: var(--text, #e5e7eb);\n}\n.rb-menu-item[data-level="2"] {\n  font-weight: 700;\n}\n.rb-menu-item[data-level="3"] {\n  padding-left: 1.1rem;\n}\n.rb-menu-item[data-level="4"] {\n  padding-left: 1.7rem;\n  font-size: 0.79rem;\n}\n.rb-searchbox {\n  position: relative;\n  flex: 1;\n  max-width: 420px;\n  margin: 0 1rem;\n  display: flex;\n  align-items: center;\n}\n.rb-search-ico {\n  position: absolute;\n  left: 0.6rem;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  pointer-events: none;\n}\n.rb-search {\n  width: 100%;\n  padding: 0.5rem 2rem 0.5rem 2rem;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 8px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.86rem;\n}\n.rb-search:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.rb-search-clear {\n  position: absolute;\n  right: 0.45rem;\n  background: none;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  font-size: 1.2rem;\n  line-height: 1;\n  cursor: pointer;\n}\n.rb-search-clear:hover {\n  color: var(--text, #e5e7eb);\n}\n.rb-results {\n  position: absolute;\n  top: calc(100% + 6px);\n  left: 0;\n  right: 0;\n  z-index: 60;\n  max-height: 60vh;\n  overflow-y: auto;\n  padding: 0.35rem;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 10px;\n  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);\n}\n.rb-results-empty {\n  padding: 0.9rem;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.83rem;\n  text-align: center;\n}\n.rb-result {\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  gap: 0.2rem 0.5rem;\n  width: 100%;\n  text-align: left;\n  padding: 0.5rem 0.6rem;\n  background: none;\n  border: none;\n  border-radius: 7px;\n  cursor: pointer;\n  transition: background 0.12s;\n}\n.rb-result:hover {\n  background: rgba(139, 92, 246, 0.14);\n}\n.rb-result-kind {\n  font-size: 0.58rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  padding: 0.12rem 0.4rem;\n  border-radius: 999px;\n  color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.16);\n  align-self: center;\n}\n.rb-result--text .rb-result-kind {\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.07);\n}\n.rb-result-title {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n}\n.rb-result-page {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n  align-self: center;\n}\n.rb-result-excerpt {\n  grid-column: 2 / -1;\n  font-size: 0.74rem;\n  color: var(--text-muted, #9ca3af);\n  line-height: 1.4;\n}\n.rb-c {\n  font-weight: inherit;\n}\n/*# sourceMappingURL=rulebook.component.css.map */\n'], encapsulation: 2, changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RulebookComponent, [{
    type: Component,
    args: [{ selector: "app-rulebook", standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: `<div class="rb-root" [class.rb-root--overlay]="mode === 'overlay'">\r
  <div class="rb-panel">\r
\r
    <!-- Header -->\r
    <div class="rb-header">\r
      <h1 class="rb-title"><span class="app-icon i-ability"></span> Regelwerk</h1>\r
\r
      <div class="rb-searchbox">\r
        <span class="app-icon i-lasso rb-search-ico"></span>\r
        <input\r
          class="rb-search"\r
          type="text"\r
          placeholder="Suchen \u2026 (Sprungmarken zuerst)"\r
          [value]="query()"\r
          (input)="onQueryChange($any($event.target).value)"\r
          (keydown.escape)="clearSearch()" />\r
        @if (query()) {\r
          <button class="rb-search-clear" (click)="clearSearch()" title="Suche leeren">&times;</button>\r
        }\r
\r
        @if (query().length > 1) {\r
          <div class="rb-results">\r
            @if (searching()) {\r
              <div class="rb-results-empty">Suche l\xE4uft \u2026</div>\r
            } @else if (!results().length) {\r
              <div class="rb-results-empty">Nichts gefunden f\xFCr \u201E{{ query() }}"</div>\r
            } @else {\r
              @for (hit of results(); track $index) {\r
                <button class="rb-result" [class.rb-result--text]="hit.kind === 'text'"\r
                        (click)="openHit(hit)">\r
                  <span class="rb-result-kind">{{ hit.kind === 'jump' ? 'Sprungmarke' : 'Text' }}</span>\r
                  <span class="rb-result-title">{{ hit.title }}</span>\r
                  <span class="rb-result-page">{{ hit.pageTab }}</span>\r
                  @if (hit.excerpt) { <span class="rb-result-excerpt">{{ hit.excerpt }}</span> }\r
                </button>\r
              }\r
            }\r
          </div>\r
        }\r
      </div>\r
\r
      @if (mode === 'overlay') {\r
        <button class="rb-close" (click)="close.emit()" title="Schlie\xDFen (Esc)">&times;</button>\r
      }\r
    </div>\r
\r
    <!-- Tab bar + back -->\r
    <div class="rb-tabbar">\r
      <button class="rb-back" (click)="goBack()" [disabled]="!canGoBack()"\r
              title="Zur\xFCck (Alt+\u2190)">&#8592;</button>\r
      <div class="rb-tabs" (mouseleave)="onTabLeave()">\r
        @for (p of pages(); track p.id) {\r
          <div class="rb-tabwrap" (mouseenter)="onTabEnter(p.id)">\r
            <button class="rb-tab" [class.active]="p.id === activeId()" (click)="onTabClick(p.id)">\r
              @if (p.icon) { <span [class]="'app-icon i-' + p.icon"></span> }\r
              {{ p.tab }}\r
            </button>\r
\r
            <!-- Hover dropdown: jump straight to any section of that page -->\r
            @if (openMenu() === p.id && outlineOf(p.id).length) {\r
              <div class="rb-menu">\r
                @for (entry of outlineOf(p.id); track entry.id) {\r
                  <button class="rb-menu-item" [attr.data-level]="entry.level"\r
                          (click)="jumpFromMenu(p.id, entry.id)">\r
                    {{ entry.text }}\r
                  </button>\r
                }\r
              </div>\r
            }\r
          </div>\r
        }\r
      </div>\r
    </div>\r
\r
    <!-- Content -->\r
    <div class="rb-content" #scroller (click)="onContentClick($event)">\r
      @if (fatal()) {\r
        <div class="rb-error">\r
          <p>{{ fatal() }}</p>\r
          <p class="rb-error-hint">\r
            Liegt eine <code>index.json</code> in <code>public/rulebook/</code>?\r
            Erzeuge sie mit <code>npm run rulebook:manifest</code>.\r
          </p>\r
        </div>\r
      } @else if (loading()) {\r
        <div class="rb-loading"><span class="rb-spinner"></span> Wird geladen \u2026</div>\r
      } @else if (error()) {\r
        <div class="rb-error">\r
          <p>{{ error() }}</p>\r
          <button class="rb-retry" (click)="retry()">Erneut versuchen</button>\r
        </div>\r
      } @else {\r
        <article class="rb-article" [innerHTML]="html()"></article>\r
      }\r
    </div>\r
\r
  </div>\r
</div>\r
`, styles: ['/* src/app/rulebook/rulebook.component.css */\n.rb-root {\n  --rb-info: var(--mana-color, #3b82f6);\n  --rb-formula: var(--energy-color, #22c55e);\n  --rb-warning: var(--health-color, #ef4444);\n  --rb-tip: var(--accent, #8b5cf6);\n  --rb-highlight: #f59e0b;\n  display: flex;\n  min-height: 0;\n  color: var(--text, #e5e7eb);\n}\n.rb-root--overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 2000;\n  background: rgba(0, 0, 0, 0.85);\n  -webkit-backdrop-filter: blur(5px);\n  backdrop-filter: blur(5px);\n  align-items: center;\n  justify-content: center;\n  padding: 2vh 2vw;\n  animation: rb-fade 0.16s ease;\n}\n@keyframes rb-fade {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.rb-panel {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  max-width: 1100px;\n  max-height: 96vh;\n  min-height: 0;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 12px;\n  overflow: hidden;\n}\n.rb-root:not(.rb-root--overlay) .rb-panel {\n  max-width: none;\n  max-height: none;\n  height: 100vh;\n  border: none;\n  border-radius: 0;\n}\n.rb-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.9rem 1.4rem;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n}\n.rb-title {\n  margin: 0;\n  font-size: 1.15rem;\n  font-weight: 700;\n  letter-spacing: 0.03em;\n  color: var(--accent, #8b5cf6);\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.rb-close {\n  background: none;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  font-size: 1.7rem;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 0.4rem;\n  border-radius: 6px;\n}\n.rb-close:hover {\n  color: var(--text, #e5e7eb);\n  background: rgba(255, 255, 255, 0.08);\n}\n.rb-tabbar {\n  position: relative;\n  z-index: 5;\n  overflow: visible;\n  display: flex;\n  align-items: stretch;\n  border-bottom: 1px solid var(--border, #374151);\n  background: var(--card, #1f2937);\n  flex-shrink: 0;\n}\n.rb-back {\n  padding: 0.65rem 0.95rem;\n  background: transparent;\n  border: none;\n  border-right: 1px solid var(--border, #374151);\n  color: var(--text-muted, #9ca3af);\n  font-size: 1rem;\n  cursor: pointer;\n  transition: color 0.18s;\n}\n.rb-back:hover:not(:disabled) {\n  color: var(--accent, #8b5cf6);\n}\n.rb-back:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n.rb-tabs {\n  display: flex;\n  flex-wrap: wrap;\n  overflow: visible;\n  min-width: 0;\n}\n.rb-tab {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.65rem 1.35rem;\n  background: transparent;\n  border: none;\n  border-bottom: 3px solid transparent;\n  margin-bottom: -1px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  font-weight: 700;\n  white-space: nowrap;\n  cursor: pointer;\n  transition: all 0.18s;\n}\n.rb-tab:hover {\n  color: var(--text, #e5e7eb);\n}\n.rb-tab.active {\n  color: var(--accent, #8b5cf6);\n  border-bottom-color: var(--accent, #8b5cf6);\n}\n.rb-content {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 1.5rem 2rem 4rem;\n}\n.rb-content::-webkit-scrollbar {\n  width: 8px;\n}\n.rb-content::-webkit-scrollbar-track {\n  background: transparent;\n}\n.rb-content::-webkit-scrollbar-thumb {\n  background: var(--border, #374151);\n  border-radius: 4px;\n}\n.rb-article {\n  max-width: 900px;\n  margin: 0 auto;\n}\n.rb-loading,\n.rb-error {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.9rem;\n  padding: 4rem 2rem;\n  color: var(--text-muted, #9ca3af);\n}\n.rb-error-hint {\n  font-size: 0.8rem;\n  opacity: 0.8;\n  text-align: center;\n}\n.rb-spinner {\n  width: 20px;\n  height: 20px;\n  border: 2px solid var(--border, #374151);\n  border-top-color: var(--accent, #8b5cf6);\n  border-radius: 50%;\n  animation: rb-spin 0.8s linear infinite;\n}\n@keyframes rb-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.rb-retry {\n  padding: 0.5rem 1.1rem;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n}\n.rb-retry:hover {\n  filter: brightness(1.12);\n}\n.rb-article h1,\n.rb-article h2,\n.rb-article h3,\n.rb-article h4 {\n  color: var(--accent, #8b5cf6);\n  line-height: 1.25;\n  scroll-margin-top: 1rem;\n}\n.rb-article h1 {\n  font-size: 1.75rem;\n  margin: 0 0 1.2rem;\n}\n.rb-article h2 {\n  font-size: 1.4rem;\n  margin: 2.2rem 0 0.9rem;\n  padding-bottom: 0.4rem;\n  border-bottom: 1px solid var(--border, #374151);\n}\n.rb-article h3 {\n  font-size: 1.15rem;\n  margin: 1.6rem 0 0.6rem;\n}\n.rb-article h4 {\n  font-size: 1rem;\n  margin: 1.2rem 0 0.5rem;\n}\n.rb-article p,\n.rb-article li {\n  line-height: 1.7;\n  color: var(--text, #e5e7eb);\n}\n.rb-article p {\n  margin: 0.7rem 0;\n}\n.rb-article ul,\n.rb-article ol {\n  margin: 0.7rem 0;\n  padding-left: 1.4rem;\n}\n.rb-article li {\n  margin: 0.3rem 0;\n}\n.rb-article strong {\n  color: #fff;\n  font-weight: 700;\n}\n.rb-article code {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 4px;\n  padding: 0.05rem 0.35rem;\n  font-size: 0.88em;\n}\n.rb-article hr {\n  border: none;\n  border-top: 1px solid var(--border, #374151);\n  margin: 2rem 0;\n}\n.rb-link {\n  color: var(--accent, #8b5cf6);\n  text-decoration: none;\n  border-bottom: 1px dotted currentColor;\n  cursor: pointer;\n}\n.rb-link:hover {\n  filter: brightness(1.2);\n}\n.rb-hl {\n  color: var(--rb-highlight);\n  font-weight: 700;\n}\n.rb-kbd {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-bottom-width: 2px;\n  border-radius: 5px;\n  padding: 0.05rem 0.4rem;\n  font-size: 0.85em;\n  font-weight: 700;\n}\n.rb-section {\n  margin: 2rem 0;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--border, #374151);\n  border-radius: 10px;\n  scroll-margin-top: 1rem;\n  overflow: hidden;\n}\n.rb-section {\n  --rb-section-color: var(--accent, #8b5cf6);\n}\n.rb-section-title {\n  margin: 0;\n  padding: 1rem 1.5rem;\n  font-size: 1.2rem;\n  font-weight: 700;\n  color: var(--rb-section-color, var(--accent, #8b5cf6));\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  list-style: none;\n  -webkit-user-select: none;\n  user-select: none;\n  transition: background 0.15s;\n}\n.rb-section-title::-webkit-details-marker {\n  display: none;\n}\n.rb-section-title:hover {\n  background: rgba(255, 255, 255, 0.04);\n}\n.rb-section-titletext {\n  flex: 1;\n}\n.rb-section-chev {\n  width: 0;\n  height: 0;\n  flex: none;\n  border-left: 5px solid transparent;\n  border-right: 5px solid transparent;\n  border-top: 6px solid currentColor;\n  opacity: 0.65;\n  transition: transform 0.18s;\n}\n.rb-section[open] > .rb-section-title .rb-section-chev {\n  transform: rotate(180deg);\n}\n.rb-section-body {\n  padding: 0 1.5rem 1.3rem;\n}\n.rb-section-body > :first-child {\n  margin-top: 0;\n}\n.rb-section-body > :last-child {\n  margin-bottom: 0;\n}\n.rb-note {\n  --rb-note-color: var(--rb-info);\n  border-left: 4px solid var(--rb-note-color);\n  background: color-mix(in srgb, var(--rb-note-color) 13%, transparent);\n  box-shadow: 0 2px 10px color-mix(in srgb, var(--rb-note-color) 18%, transparent);\n  padding: 1rem 1.2rem;\n  margin: 1.2rem 0;\n  border-radius: 8px;\n}\n.rb-note--formula {\n  --rb-note-color: var(--rb-formula);\n  font-family:\n    ui-monospace,\n    "Courier New",\n    monospace;\n}\n.rb-note--warning {\n  --rb-note-color: var(--rb-warning);\n}\n.rb-note--tip {\n  --rb-note-color: var(--rb-tip);\n}\n.rb-note-title {\n  font-weight: 700;\n  color: var(--rb-note-color);\n  margin-bottom: 0.4rem;\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n.rb-note > :first-child {\n  margin-top: 0;\n}\n.rb-note > :last-child {\n  margin-bottom: 0;\n}\n.rb-note p {\n  margin: 0.35rem 0;\n}\n.rb-grid > .rb-card {\n  margin: 0;\n}\n.rb-grid {\n  display: grid;\n  gap: 1rem;\n  margin: 1.3rem 0;\n  grid-template-columns: repeat(auto-fit, minmax(var(--rb-grid-min, 280px), 1fr));\n}\n.rb-card {\n  margin: 1.25rem 0;\n  --rb-card-color: var(--accent, #8b5cf6);\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid color-mix(in srgb, var(--rb-card-color) 35%, var(--border, #374151));\n  border-radius: 10px;\n  padding: 1rem 1.1rem;\n  transition:\n    transform 0.18s,\n    box-shadow 0.18s,\n    border-color 0.18s;\n  scroll-margin-top: 1rem;\n}\n.rb-card:hover {\n  transform: translateY(-3px);\n  border-color: var(--rb-card-color);\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--rb-card-color) 28%, transparent);\n}\n.rb-card--health {\n  --rb-card-color: var(--health-color, #ef4444);\n}\n.rb-card--energy {\n  --rb-card-color: var(--energy-color, #22c55e);\n}\n.rb-card--mana {\n  --rb-card-color: var(--mana-color, #3b82f6);\n}\n.rb-card-title {\n  margin: 0 0 0.6rem !important;\n  color: var(--rb-card-color) !important;\n  font-size: 1rem;\n  display: flex;\n  align-items: center;\n  gap: 0.45rem;\n}\n.rb-card-body > :first-child {\n  margin-top: 0;\n}\n.rb-card-body > :last-child {\n  margin-bottom: 0;\n}\n.rb-tag {\n  margin-left: auto;\n  font-size: 0.62rem;\n  font-weight: 800;\n  letter-spacing: 0.06em;\n  padding: 0.1rem 0.45rem;\n  border-radius: 999px;\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid var(--border, #374151);\n}\n.rb-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin: 1.2rem 0;\n}\n.rb-jump {\n  padding: 0.45rem 1rem;\n  background: rgba(139, 92, 246, 0.14);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  color: var(--accent, #8b5cf6);\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.rb-jump:hover {\n  background: rgba(139, 92, 246, 0.28);\n}\n.rb-datagroup {\n  margin: 1.2rem 0;\n}\n.rb-datagroup-title {\n  font-size: 0.7rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  color: var(--text-muted, #9ca3af);\n  margin-bottom: 0.5rem;\n}\n.rb-chiplist {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.45rem;\n}\n.rb-chip {\n  display: flex;\n  flex-direction: column;\n  gap: 0.1rem;\n  padding: 0.4rem 0.7rem;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 7px;\n  font-size: 0.82rem;\n}\n.rb-chip small {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.68rem;\n}\n.rb-tablewrap {\n  overflow-x: auto;\n  margin: 1.2rem 0;\n}\n.rb-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.84rem;\n}\n.rb-table th,\n.rb-table td {\n  text-align: left;\n  padding: 0.45rem 0.6rem;\n  border-bottom: 1px solid var(--border, #374151);\n}\n.rb-table th {\n  font-size: 0.66rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--text-muted, #9ca3af);\n}\n.rb-table tbody tr:hover {\n  background: rgba(255, 255, 255, 0.03);\n}\n@media (max-width: 768px) {\n  .rb-grid {\n    grid-template-columns: 1fr;\n  }\n  .rb-content {\n    padding: 1rem 1rem 3rem;\n  }\n}\n.rb-tabwrap {\n  position: relative;\n  display: flex;\n}\n.rb-menu {\n  position: absolute;\n  top: calc(100% - 1px);\n  left: 0;\n  z-index: 40;\n  min-width: 240px;\n  max-width: 340px;\n  max-height: 60vh;\n  overflow-y: auto;\n  padding: 0.35rem;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 0 0 10px 10px;\n  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);\n  animation: rb-menu-in 0.14s ease;\n}\n.rb-menu::before {\n  content: "";\n  position: absolute;\n  top: -10px;\n  left: 0;\n  right: 0;\n  height: 10px;\n}\n@keyframes rb-menu-in {\n  from {\n    opacity: 0;\n    transform: translateY(-6px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n.rb-menu-item {\n  display: block;\n  width: 100%;\n  text-align: left;\n  padding: 0.4rem 0.6rem;\n  background: none;\n  border: none;\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.83rem;\n  cursor: pointer;\n  transition: all 0.12s;\n}\n.rb-menu-item:hover {\n  background: rgba(139, 92, 246, 0.16);\n  color: var(--text, #e5e7eb);\n}\n.rb-menu-item[data-level="1"] {\n  font-weight: 800;\n  color: var(--text, #e5e7eb);\n}\n.rb-menu-item[data-level="2"] {\n  font-weight: 700;\n}\n.rb-menu-item[data-level="3"] {\n  padding-left: 1.1rem;\n}\n.rb-menu-item[data-level="4"] {\n  padding-left: 1.7rem;\n  font-size: 0.79rem;\n}\n.rb-searchbox {\n  position: relative;\n  flex: 1;\n  max-width: 420px;\n  margin: 0 1rem;\n  display: flex;\n  align-items: center;\n}\n.rb-search-ico {\n  position: absolute;\n  left: 0.6rem;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  pointer-events: none;\n}\n.rb-search {\n  width: 100%;\n  padding: 0.5rem 2rem 0.5rem 2rem;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 8px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.86rem;\n}\n.rb-search:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.rb-search-clear {\n  position: absolute;\n  right: 0.45rem;\n  background: none;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  font-size: 1.2rem;\n  line-height: 1;\n  cursor: pointer;\n}\n.rb-search-clear:hover {\n  color: var(--text, #e5e7eb);\n}\n.rb-results {\n  position: absolute;\n  top: calc(100% + 6px);\n  left: 0;\n  right: 0;\n  z-index: 60;\n  max-height: 60vh;\n  overflow-y: auto;\n  padding: 0.35rem;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 10px;\n  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);\n}\n.rb-results-empty {\n  padding: 0.9rem;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.83rem;\n  text-align: center;\n}\n.rb-result {\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  gap: 0.2rem 0.5rem;\n  width: 100%;\n  text-align: left;\n  padding: 0.5rem 0.6rem;\n  background: none;\n  border: none;\n  border-radius: 7px;\n  cursor: pointer;\n  transition: background 0.12s;\n}\n.rb-result:hover {\n  background: rgba(139, 92, 246, 0.14);\n}\n.rb-result-kind {\n  font-size: 0.58rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  padding: 0.12rem 0.4rem;\n  border-radius: 999px;\n  color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.16);\n  align-self: center;\n}\n.rb-result--text .rb-result-kind {\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.07);\n}\n.rb-result-title {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n}\n.rb-result-page {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n  align-self: center;\n}\n.rb-result-excerpt {\n  grid-column: 2 / -1;\n  font-size: 0.74rem;\n  color: var(--text-muted, #9ca3af);\n  line-height: 1.4;\n}\n.rb-c {\n  font-weight: inherit;\n}\n/*# sourceMappingURL=rulebook.component.css.map */\n'] }]
  }], null, { mode: [{
    type: Input
  }], startPage: [{
    type: Input
  }], close: [{
    type: Output
  }], scroller: [{ type: ViewChild, args: ["scroller", { isSignal: true }] }], onAltLeft: [{
    type: HostListener,
    args: ["document:keydown.alt.arrowleft", ["$event"]]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(RulebookComponent, { className: "RulebookComponent", filePath: "app/rulebook/rulebook.component.ts", lineNumber: 38 });
})();
export {
  RulebookComponent
};
//# sourceMappingURL=chunk-TOQPYLCF.js.map
