# PARTY GOAT: Content taxonomy

Source of truth for WHAT packs exist, how they are organised, and what each game's content looks like.
Read it when generating content, changing the schema, or building the pack picker.
`docs/CONTENT.md` covers pack JSON mechanics. Where the two disagree, THIS file wins (see "Changes to existing docs").

Legend: ➕ = added suggestion (strike what you don't want). 🇮🇹 = Italian-specific content.

## 1. Model

Packs are **per game**, not universal. Hierarchy: **Game > Folder (`group`) > Pack > Item**.
Optional `section` adds one more level inside a folder (used by Sports: football, basketball).

- A pack belongs to exactly one game (`games` has one id). Duplicate content across games is fine when each version is tuned to the game.
- The picker shows folders first, then packs inside, with search and filters (language, spice, difficulty where it exists).
- **No age gate.** Adults folders are always visible. They use `spice` 2-3. Default spice filter shows all levels.
- Pack ids: `<lang>-<game>-<slug>`, for example `en-impostor-animals`. Files: `src/content/packs/<lang>/<game>/<slug>.json`.
- English and Italian mirror the folder structure, but Italian items are written natively, not translated. Italian may have extra packs (🇮🇹) and skip EN packs that don't make sense.

## 2. Kinds per game

| Game | kind | Pack = | Item shape |
|---|---|---|---|
| Impostor | `words` | a category | `{ word, hint, difficulty }` |
| Who's the Liar | `question-pairs` | a theme | `{ question, liarQuestion }` |
| Circa + Circa Impostor | `numeric` | a theme | `{ question, answer, unit?, format?, asOf?, decoyQuestion?, decoyAnswer? }` |
| Who's got the bomb | `prompts` | a folder of prompts | `{ text, examples? }` |
| 10/10 but... | `prompts` | a theme | `{ text }` |
| Never have I ever | `prompts` | a theme | `{ text }` |
| Truth or dare | `prompts` | a theme | `{ text, type: "truth" \| "dare" }` |
| Most likely to | `prompts` | a theme | `{ text }` |
| Taboom | `cards` | a theme | `{ word, banned: string[4-5], difficulty? }` |
| Mind match | `prompts` | a theme | `{ text }` (for example "A breakfast food") |

Pack fields: `id, title, language, spice (0-3), kind, games, group, section?`.
`difficulty`: `"easy" | "medium" | "hard"`. Setup screens of Impostor and Taboom get a difficulty filter (default: all).
`examples` (Bomb): 3-6 valid answers per prompt, used by the optional "show example" toggle.
`asOf` (Circa): year a changeable fact was true, shown in the answer reveal.

## 3. Rules that apply to all content

- Original content only. Nothing copied from other apps or sites.
- Clean-ish fun by default. Adults folders may be cheeky and suggestive but not explicit. Nothing demeaning, no slurs, no real private individuals. Every dare must be skippable and never dangerous or non-consensual.
- 🇮🇹 Italian is natural, informal (tu), with local references (Serie A, regions, cucina, TV, uni life).
- No duplicates inside a pack. Avoid near-duplicates across packs of the same game and language.
- Generate per game, EN first, then IT natively. Each batch must pass `validate:packs`.

### Impostor hint rules (important)
- 1-3 words. A hint is an association one step removed, not a description.
- It must not be: the category, a synonym, a translation, part of the name, the first letter, a rhyme, or the single most obvious attribute.
- Test: if someone could guess the word from the hint alone in about 3 tries inside that category, it is too close. Make it vaguer.
- Better a bit far than too close. A hint should help the impostor blend in, not hand them the answer.
- Examples: Pizza -> "Friday night" or "Oven" (not "Italian" or "Cheese"). Lion -> "Sunset" or "Pride" is still close, so prefer "Sunset" (not "Mane" or "Africa"). Keep it indirect.
- Spread difficulty: roughly 40% easy, 40% medium, 20% hard per pack.

### Circa quality rules
- Only facts with a stable, checkable answer. Prefer dates, distances, heights, records, counts, official figures.
- Fast-changing numbers (populations, prices, box office) get an `asOf` year or are skipped.
- No survey-style stats ("global intimacy statistics") unless there is a clearly verifiable figure. When unsure, drop the item. Do not guess.
- Answer format: `number` or `year`. Always give the unit.
- Circa Impostor items carry a `decoyQuestion` + `decoyAnswer` in the same unit and similar magnitude.

### Taboom rules
- 4-5 banned words that are the most natural clues. No banned word may be a form of the target word.
- Target words guessable by a normal player of that language.

## 4. Sports module (reused across games)

Folder `sports`, with sections. Applies to Impostor, Bomb, Taboom, Circa and Mind Match, each in the game's own form.

- **Football** (section `football`, 5 packs): ➕ Serie A & Italian Football; Premier League & La Liga; Champions League & European Clubs; World Cup & National Teams; Football Legends & Iconic Moments
- **Basketball** (section `basketball`, 3 packs): ➕ NBA Teams & Stars; NBA Legends & Iconic Moments; EuroLeague & International Basketball
- ➕ Other sports: Olympic & Other Sports (tennis, F1, athletics, combat sports)

## 5. Games

Target sizes are per pack, per language.

### 5.1 Impostor (`words`, 40-60 words each, hint + difficulty on every word)
Pack titles are what the impostor sees in `category` mode. Keep them mid-level: not so broad that they say nothing, not so narrow that they reveal the word. Split a pack that grows past about 60 words.

- **General**: Supermarket Grocery Items; Fast Food & Chain Restaurants; Household Appliances & Tools; Vehicles & Transportation; Animals & Wildlife; Kitchen Utensils & Cookware; ➕ Food by Cuisine (Italian, Asian, Mexican & Latin, Mediterranean & Middle Eastern, Desserts & Sweets); ➕ Space & Astronomy; ➕ Nature, Weather & Landscapes
- **Entertainment**: Blockbuster Movies & Franchises; Binge-Worthy TV Shows & Sitcoms; Music Genres & Musical Instruments; Superheroes & Comic Book Villains; Celebrities, Influencers & Pop Icons; Broadway, Theater & Performing Arts; ➕ Anime & Manga; ➕ Musicians & Bands
- **Gaming**: Console & PC Gaming Franchises; Retro & Arcade Classics; Mobile & Casual Games; Esports & Competitive Titles; RPG, Fantasy & Lore Worlds; Board Games & Card Games
- **Sports** (➕ new folder): the Sports module above
- **Lifestyle**: Fashion Brands & Apparel; Sports & Athletic Equipment; Vacation Destinations & Landmarks; Beauty, Skincare & Grooming; Gym & Fitness Culture; Fine Dining & Gourmet Foods
- **Geography** (➕): Countries & Flags; World Cities & Landmarks; Natural Wonders & Islands; 🇮🇹 Italian Regions & Cities
- **Tech & Internet** (➕): Apps & Social Media; Brands & Logos; Tech & Gadgets
- **Society**: Professions & Career Paths; World Religions & Mythology; School Subjects & Academic Fields; Historical Eras & Famous Empires; Politics & World Leaders; Law, Justice & Criminology; ➕ Student Life
- **Family**: Childhood Toys & Nostalgia; Holiday & Seasonal Celebrations; Classroom & Schoolyard Memories; Camping & Outdoor Activities; Household Chores & Routines; Amusement Park Rides & Attractions
- **Adults** (spice 2-3): Cocktail Drinks & Party Shots; Hookup & Dating App Jargon; Nightclubs, Raves & Music Festivals; Hangover Cures & Morning After; Walk of Shame Essentials; Secret Bedroom Items & Accessories
- **Other**: Bizarre & Unexplained Mysteries; Sci-Fi & Futuristic Concepts; Conspiracy Theories & Urban Legends; Internet Memes & Viral Culture; Random Everyday Quirks
- 🇮🇹 IT-only extras: Italian TV & Celebrities; Cucina Italiana (regional dishes); Italian Music & Sanremo

### 5.2 Who's the Liar (`question-pairs`, 25-40 pairs each)
Both questions get answers of the same type but differ enough to expose the liar.
- Mindset & Opinions (hot takes, moral dilemmas, values) [0-1]
- Everyday Life (habits, eating routines, awkward public moments) [0]
- Dreams & Future (bucket lists, careers, hypotheticals) [0]
- Party & Embarrassing (night-out stories, clumsy moments, social fails) [1]
- Spicy & Personal (dating nightmares, green/red flags, flirting) [2]
- Dark & Taboo (white lies, hidden rivalries, minor confessions) [2]
- ➕ Food & Taste [0]; ➕ Travel [0]; ➕ Money & Work [0-1]; ➕ Friends & Group Dynamics [1]; ➕ Hypotheticals [0-1]

### 5.3 Circa (`numeric`, 30-50 items each, every answer verified)
- Classic (historic dates, capitals, building heights); Food & Everyday Life (calories, portion sizes); Records & Extreme (world records, extreme sports); Science & Body (anatomy, space distances, animal speeds and lifespans); Entertainment (release years, album dates, box office with `asOf`)
- Spicy Facts & Adults: only verifiable items (alcohol content, drink and cocktail facts, famous clubs and festivals, dating-app founding years). No survey statistics.
- ➕ Geography; ➕ History; ➕ Tech & Internet; ➕ Sports (Sports module: football and basketball records, years, stats); ➕ 🇮🇹 Italy

### 5.4 Who's got the bomb (`prompts` with `examples`, 60-100 prompts per folder)
Here the folder is the pack, and each prompt is one line to answer. Prompts must be answerable in 2 seconds by a normal player and have many valid answers.

- **General**: Things Found in a Bathroom; Red Fruits & Vegetables; European & World Capitals; Things Made of Wood; Words Ending in "-TION"; ➕ Things You Can Plug In
- **Entertainment**: Pixar & Animated Movies; Solo Pop Artists & Vocalists; Movie Franchises with 3+ Sequels; Reality TV Shows & Hosts; Famous TV Show Theme Songs
- **Gaming**: Playable Super Mario Characters; Multiplayer First-Person Shooters; Pokemon Types & Species; Mobile Games & Apps; Gaming Hardware & Consoles
- **Lifestyle**: Sneaker & Athletic Shoe Brands; Coffee Shop Beverages; Gym Exercises & Fitness Moves; Luxury Fashion Houses; Road Trip Snack Foods
- **Society**: High School Subjects; Professions That Require a Uniform; Legal & Courtroom Terminology; World Currencies; Historical Generals & Commanders
- **Family**: Breakfast Cereals; Childhood Board Games; Birthday Party Decorations; Playground Games & Equipment; Kitchen Appliances & Cookware
- **Adults** (spice 2-3): Excuses to Leave an Awkward Date; Things Said in Bed (That Also Work While Driving); Hangover Foods & Cures; Slang Terms for Body Parts; Bar Drinks, Cocktails & Shots
- **Other**: Things You Hide Under Your Bed; Excuses for Being Late to Work; Bizarre Phobias & Fears; Things Found in an Attic or Basement; Secrets You Keep from Your Parents
- ➕ **Sports**: Sports module as prompts (for example "Serie A clubs", "NBA teams", "Famous strikers", "Basketball positions and terms")
- ➕ **Geography**: Cities in Spain; Italian Regions; Rivers; Countries in Africa; Islands
- ➕ **Food & Drink**: Pasta Shapes; Cheeses; Cocktail Ingredients; Fruits That Start With a Given Letter
- ➕ **Word Rules**: words ending or starting with a given sound or letters, compound words, rhymes
- 🇮🇹 **Italian native set**: do not translate. Examples: words ending in "-ZIONE", Italian cities, Serie A clubs, Italian singers, regional dishes. Word Rules are written separately for Italian.

### 5.5 10/10 but... (`prompts`, 30-50 each)
Format: "Is a 10/10 but..." followed by the catch.
- Classic [0]; Cringe [1]; Personal [1]; Spicy [2]; Taboo [2-3]; Toxic [2]
- ➕ Food Habits [0-1]; ➕ Phone & Social Media [1]; ➕ Driving [0-1]; ➕ Work & Uni [0-1]; ➕ Gross Habits [1-2]

### 5.6 Never have I ever (`prompts`, 40-60 each)
- Classic [0]; Party [1]; Spicy [2]; True Friends [1]; Deep & Dark [2]
- ➕ Travel & Erasmus [0-1]; ➕ School & Uni [0]; ➕ Social Media [1]; ➕ Food [0]; ➕ Work [0-1]

### 5.7 Truth or dare (`prompts` with `type`, 50-80 each, about 50/50 truth and dare)
Dares are skippable in the game.
- Classic [0]; Outdoor [1]; Chaos [1-2]; ➕ Squad Night (renamed from Girls/Boys Night: gossip, crush reveals, impressions) [1]; Dirty [2]; Hardcore Spicy Adult [3]

### 5.8 Most likely to (`prompts`, 40-60 each)
Phrased as "...most likely to [do something]".
- Classic [0]; Party [1]; Spicy [2]; Wild & Chaotic [1]; True Friends [0-1]; Drama [1-2]; Dirty Little Secrets [2-3]
- ➕ Career & Money [0]; ➕ Travel [0]; ➕ Food [0]; ➕ Uni [0-1]; ➕ Disaster Scenarios [0-1]

### 5.9 Taboom (`cards`, 40-60 cards each, 4-5 banned words, difficulty)
- Around the World; Entertainment; Daily Life & Things; Animals & Nature; Sports & Leisure; Knowledge & School; Festival & Celebrations; Stars & Celebrities; Spicy & Taboo [2-3]
- 🇮🇹 Italian Theme (dishes, historic cities, monuments, traditions). Written natively in Italian; an English-language version is optional.
- ➕ Football; ➕ Basketball (Sports module); ➕ Food & Drink; ➕ Music; ➕ Brands; ➕ Jobs

### 5.10 Mind match (`prompts`, 30-50 each; each prompt asks for ONE word)
- Classic (colors, breakfast foods, pets, sports) [0]; Party [1]; Real Talk [1]; Deep & Personal [1]; Spicy & Taboo [2]
- ➕ Sports & Football [0]; ➕ Italy & Daily Life [0]

## 6. Changes to existing docs (apply in the refactor stage)

Status (stage 10): schema, Bomb, Mind match, Impostor hints, Settings and ROADMAP are done. Still open: picker folder > section navigation and the difficulty filter.

- **Schema**: add `group` and optional `section` to packs, `difficulty` to `words` and `cards` items, `examples` to `prompts` items, and the `numeric` and `cards` kinds. A pack has exactly one game.
- **Bomb**: moves from `words` packs (pack title = category) to `prompts` packs (each prompt = one category). Migrate the Stage 4 builtin bomb packs and update the game, the picker and the tests.
- **Mind match**: now `prompts`, not `words`.
- **Impostor**: hints get the "further, not closer" rule. Replace the old `Pizza -> "Italian"` and `Messi -> "Argentina"` examples in `docs/CONTENT.md` with the guidance above, and revisit existing starter hints that are too close.
- **Picker**: folder > section > pack navigation, difficulty filter where the kind has it.
- **Settings**: remove any 18+ gating idea. Spice filter defaults to all levels.
- **ROADMAP**: add a stage for this refactor before the next game stage, and a content stage per game afterwards.
