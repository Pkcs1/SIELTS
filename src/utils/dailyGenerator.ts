import {
  DailyChallengePack,
  IeltsStream,
  ListeningPartSet,
  ReadingPassageSet,
  SpeakingTopicSet,
  WritingTaskPrompt,
} from '../types/ielts';

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng(seedStr: string) {
  let state = hashString(seedStr) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

interface ReadingThemeTemplate {
  topicTag: string;
  title: string;
  researcher: string;
  city: string;
  year: number;
  pct: number;
  material: string;
  defectTerm: string;
  p1: (c: { city: string; year: number; pct: number; researcher: string }) => string;
  p2: (c: { material: string; researcher: string }) => string;
  p3: (c: { defectTerm: string }) => string;
  p4: string;
  tfngTruePrompt: string;
  tfngTrueQuote: string;
  tfngFalsePrompt: string;
  tfngFalseQuote: string;
  tfngNgPrompt: string;
  mcqPrompt: string;
  mcqOptions: string[];
  mcqAnswer: string;
  mcqQuote: string;
  mcqExplanation: string;
  gapPrompt: string;
  gapMaxWords: number;
  gapAnswer: string;
  gapQuote: string;
  shortPrompt: string;
  shortMaxWords: number;
  shortAnswer: string;
  shortQuote: string;
}

const READING_THEMES: ReadingThemeTemplate[] = [
  {
    topicTag: 'Geothermal Energy & District Grids',
    title: 'Subsurface Brine Turbines & Urban District Heating',
    researcher: 'Dr. Henrik Lindqvist',
    city: 'Reykjavik',
    year: 2018,
    pct: 64,
    material: 'basalt',
    defectTerm: 'mineral scaling',
    p1: ({ city, year, pct, researcher }) =>
      `Municipal engineers in ${city} commissioned a deep borehole heating network in ${year} to replace aging oil boilers across northern suburbs. Telemetry published by ${researcher} confirmed that direct geothermal loops satisfied exactly ${pct}% of winter residential thermal demand within three years. Although critics warned that shallow aquifers might cool rapidly under continuous extraction, reinjection wells maintained stable reservoir pressures throughout seasonal cold snaps.`,
    p2: ({ material, researcher }) =>
      `High-salinity underground brine poses severe corrosion challenges for conventional steel heat exchangers. To extend turbine durability, ${researcher} lined primary collection manifolds with dense volcanic ${material} sleeves resistant to acidic chlorides. Field inspections conducted after 18,000 operating hours showed negligible wear inside insulated manifold joints compared with uncoated alloy pipes.`,
    p3: ({ defectTerm }) =>
      `Nevertheless, engineers still contend with a recurring operational issue known as ${defectTerm}, whereby dissolved silica precipitates along narrow valve throats whenever brine temperatures fall below 75°C. Automated acoustic sensors now trigger brief acid-free flushing cycles before crystal deposits restrict flow velocity.`,
    p4: `Urban planners argue that subsurface heating remains viable even outside volcanic zones, provided municipalities pair medium-depth heat pumps with insulated neighborhood distribution pipes. Yet high upfront drilling costs mean small towns frequently rely on shared regional bonds to finance initial exploration boreholes.`,
    tfngTruePrompt: 'Reinjection wells helped stabilize underground pressure during winter demand.',
    tfngTrueQuote: 'reinjection wells maintained stable reservoir pressures throughout seasonal cold snaps.',
    tfngFalsePrompt: 'Geothermal loops supplied more than 80% of northern suburb heating needs.',
    tfngFalseQuote: 'satisfied exactly 64% of winter residential thermal demand...',
    tfngNgPrompt: 'Dr. Henrik Lindqvist previously worked on hydroelectric dams in Norway.',
    mcqPrompt: 'Why do treatment teams use automated acoustic sensors in Paragraph C?',
    mcqOptions: [
      'A. To locate deeper volcanic fault lines.',
      'B. To detect silica deposits before flow slows down.',
      'C. To measure household radiator temperatures.',
      'D. To reduce regional municipal bond interest.',
    ],
    mcqAnswer: 'B',
    mcqQuote: 'Automated acoustic sensors now trigger brief acid-free flushing cycles before crystal deposits restrict flow velocity.',
    mcqExplanation: 'Sensors detect silica build-up early so flushing prevents flow restriction.',
    gapPrompt: 'Valve throats become narrowed by a recurring operational issue termed _________.',
    gapMaxWords: 2,
    gapAnswer: 'mineral scaling',
    gapQuote: '...contend with a recurring operational issue known as mineral scaling...',
    shortPrompt: 'Which natural stone material was used to line primary collection manifolds?',
    shortMaxWords: 1,
    shortAnswer: 'basalt',
    shortQuote: '...lined primary collection manifolds with dense volcanic basalt sleeves...',
  },
  {
    topicTag: 'Urban Agronomy & Aeroponic Systems',
    title: 'Vertical Aeroponic Towers & Closed-Loop Nutrient Mist',
    researcher: 'Prof. Nadia Al-Mansoor',
    city: 'Singapore',
    year: 2021,
    pct: 92,
    material: 'zeolite',
    defectTerm: 'nozzle clogging',
    p1: ({ city, year, pct, researcher }) =>
      `Facing acute arable land scarcity, urban agronomists in ${city} retrofitted multi-storey warehouse shells into vertical aeroponic farms in ${year}. Controlled irrigation audits led by ${researcher} documented a ${pct}% reduction in freshwater consumption compared with open-field lettuce cultivation. Rather than submerging plant roots in stagnant trays, pressurized atomizers suspend seedlings inside dark chambers bathed in fine nutrient mist.`,
    p2: ({ material, researcher }) =>
      `Maintaining sterile root zones without synthetic fungicides requires meticulous filtration of recirculated condensate. In parallel bench trials, ${researcher} packed secondary return filters with porous ${material} granules capable of trapping excess ammonium ions before droplets return to the main reservoir.`,
    p3: ({ defectTerm }) =>
      `Despite strong water savings, commercial operators routinely battle a mechanical bottleneck called ${defectTerm}, caused when concentrated calcium salts crystallize inside microscopic mist apertures. Technicians swap ultrasonic emitter plates every fortnight to sustain uniform droplet dispersion.`,
    p4: `Agricultural economists caution that high electricity expenditure for full-spectrum LED arrays currently limits aeroponics to fast-growing leafy greens and culinary herbs. Staple calorie crops such as wheat and maize remain economically uncompetitive inside artificially lit towers.`,
    tfngTruePrompt: 'Aeroponic seedlings grow inside dark enclosures sprayed with nutrient mist rather than soil.',
    tfngTrueQuote: 'pressurized atomizers suspend seedlings inside dark chambers bathed in fine nutrient mist.',
    tfngFalsePrompt: 'Vertical aeroponic farms are already cost-effective for growing staple wheat crops.',
    tfngFalseQuote: 'Staple calorie crops such as wheat and maize remain economically uncompetitive inside artificially lit towers.',
    tfngNgPrompt: 'Singapore exported surplus aeroponic herbs to neighboring countries in 2022.',
    mcqPrompt: 'What currently restricts commercial vertical farms from cultivating staple grain crops?',
    mcqOptions: [
      'A. Lack of dark enclosure shelving.',
      'B. Excessive freshwater evaporation rates.',
      'C. Electricity expenses required for artificial lighting.',
      'D. Restrictions on synthetic fungicides.',
    ],
    mcqAnswer: 'C',
    mcqQuote: 'high electricity expenditure for full-spectrum LED arrays currently limits aeroponics to fast-growing leafy greens...',
    mcqExplanation: 'LED lighting power costs make calorie-dense staple crops uncompetitive.',
    gapPrompt: 'Concentrated calcium salts frequently cause a mechanical problem known as _________.',
    gapMaxWords: 2,
    gapAnswer: 'nozzle clogging',
    gapQuote: '...battle a mechanical bottleneck called nozzle clogging...',
    shortPrompt: 'Which porous mineral trapped excess ammonium ions inside return filters?',
    shortMaxWords: 1,
    shortAnswer: 'zeolite',
    shortQuote: '...packed secondary return filters with porous zeolite granules...',
  },
  {
    topicTag: 'Marine Logistics & Acoustic Mitigation',
    title: 'Wind-Assisted Cargo Sails & Cetacean Acoustic Corridors',
    researcher: 'Dr. Tomas Novak',
    city: 'Rotterdam',
    year: 2020,
    pct: 28,
    material: 'fibreglass',
    defectTerm: 'hull cavitation',
    p1: ({ city, year, pct, researcher }) =>
      `Shipping consortiums operating out of ${city} installed collapsible rigid rotor sails onto bulk freighters starting in ${year}. Independent fuel-log evaluations compiled by ${researcher} revealed an average ${pct}% reduction in heavy marine diesel consumption along windy North Atlantic crossings. By harnessing the Magnus effect perpendicular to crosswinds, spinning cylinders generate forward thrust without crowding deck cargo hatches.`,
    p2: ({ material, researcher }) =>
      `Beyond fuel savings, maritime regulators demanded quieter propulsion signatures along seasonal whale migration corridors. Working with naval architects, ${researcher} fabricated lightweight propeller fairings from laminated ${material} composites to damp turbulent vortex shedding around rudder posts.`,
    p3: ({ defectTerm }) =>
      `Acoustic engineers noted that most broadband underwater vessel noise originates from a physical phenomenon termed ${defectTerm}, wherein collapsing micro-bubbles along fast-spinning propeller blades emit sharp high-frequency crackles. Slowing vessel cruising speeds by two knots drastically curtails bubble implosion.`,
    p4: `Port authorities increasingly reward quieter vessels with discounted harbour berthing tariffs. However, maritime insurers remind operators that rigid deck sails require reinforced hydraulic retraction drills whenever severe tropical cyclones approach shipping lanes.`,
    tfngTruePrompt: 'Reducing cruising speed by two knots lowers high-frequency bubble noise from propellers.',
    tfngTrueQuote: 'Slowing vessel cruising speeds by two knots drastically curtails bubble implosion.',
    tfngFalsePrompt: 'Rigid rotor sails permanently block cargo hatch loading operations on freighters.',
    tfngFalseQuote: '...spinning cylinders generate forward thrust without crowding deck cargo hatches.',
    tfngNgPrompt: 'Rotterdam port authorities spent twelve million euros subsidizing rotor sail installations.',
    mcqPrompt: 'How do port authorities incentivize quieter shipping fleets in Paragraph D?',
    mcqOptions: [
      'A. By banning bulk freighters during winter.',
      'B. By offering reduced harbour berthing fees.',
      'C. By funding hydraulic cyclone shelters.',
      'D. By supplying free marine diesel fuel.',
    ],
    mcqAnswer: 'B',
    mcqQuote: 'Port authorities increasingly reward quieter vessels with discounted harbour berthing tariffs.',
    mcqExplanation: '"Discounted harbour berthing tariffs" paraphrases "reduced harbour berthing fees".',
    gapPrompt: 'Collapsing micro-bubbles along propeller tips create broadband noise called _________.',
    gapMaxWords: 2,
    gapAnswer: 'hull cavitation',
    gapQuote: '...originates from a physical phenomenon termed hull cavitation...',
    shortPrompt: 'Which composite material was laminated into quieter propeller fairings?',
    shortMaxWords: 1,
    shortAnswer: 'fibreglass',
    shortQuote: '...fabricated lightweight propeller fairings from laminated fibreglass composites...',
  },
  {
    topicTag: 'Circular Materials & Mycelium Composites',
    title: 'Fungal Mycelium Packaging & Agricultural By-Product Moulds',
    researcher: 'Dr. Mei-Ling Hsu',
    city: 'Bristol',
    year: 2019,
    pct: 45,
    material: 'hemp',
    defectTerm: 'moisture wicking',
    p1: ({ city, year, pct, researcher }) =>
      `Packaging laboratories near ${city} began replacing expanded polystyrene appliance cushions with grown fungal composites in ${year}. Lifecycle audits conducted by ${researcher} confirmed that mycelium-bound moulds decomposed completely in domestic garden compost within ${pct} days under summer soil conditions. Unlike petroleum foams that linger in landfills for centuries, living fungal threads bind farm husks into dense, shock-absorbing blocks inside five-day dark incubation rooms.`,
    p2: ({ material, researcher }) =>
      `To achieve sufficient compressive rigidity for heavy electronics cartons, ${researcher} blended shredded ${material} stalks with oat hulls prior to fungal inoculation. Coarse fibrous stalks acted like microscopic rebar, preventing corners from crumbling under forklift stacking loads.`,
    p3: ({ defectTerm }) =>
      `Early cold-chain shipping trials exposed a stubborn vulnerability called ${defectTerm}, in which condensation inside refrigerated trucks softened unsealed mycelium panels. Engineers solved this by misting cured blocks with natural carnauba plant wax.`,
    p4: `Retail analysts observe that mycelium packaging remains slightly costlier per unit than virgin polystyrene. Nevertheless, strict European landfill taxes on single-use plastics are steadily erasing that price gap across consumer appliance supply chains.`,
    tfngTruePrompt: 'Fungal packaging moulds finish growing inside dark rooms within five days.',
    tfngTrueQuote: '...bind farm husks into dense, shock-absorbing blocks inside five-day dark incubation rooms.',
    tfngFalsePrompt: 'Mycelium panels require several decades to break down in home garden compost.',
    tfngFalseQuote: '...decomposed completely in domestic garden compost within 45 days...',
    tfngNgPrompt: 'Dr. Mei-Ling Hsu patented carnauba wax spraying equipment in Germany.',
    mcqPrompt: 'Why did Dr. Hsu add shredded hemp stalks to the oat hull mixture?',
    mcqOptions: [
      'A. To speed up landfill decomposition to three days.',
      'B. To reinforce structural strength under heavy stacking loads.',
      'C. To attract beneficial earthworms in refrigerated trucks.',
      'D. To eliminate the need for dark incubation chambers.',
    ],
    mcqAnswer: 'B',
    mcqQuote: 'Coarse fibrous stalks acted like microscopic rebar, preventing corners from crumbling under forklift stacking loads.',
    mcqExplanation: 'Fibrous stalks added compressive strength/rigidity to support stacked loads.',
    gapPrompt: 'Refrigerated truck condensation caused a moisture vulnerability known as _________.',
    gapMaxWords: 2,
    gapAnswer: 'moisture wicking',
    gapQuote: '...exposed a stubborn vulnerability called moisture wicking...',
    shortPrompt: 'Which fibrous plant stalk was mixed with oat hulls to reinforce corners?',
    shortMaxWords: 1,
    shortAnswer: 'hemp',
    shortQuote: '...blended shredded hemp stalks with oat hulls prior to fungal inoculation.',
  },
  {
    topicTag: 'Cognitive Science & Neurolinguistics',
    title: 'Bilingual Executive Control & Acoustic Phoneme Filtering',
    researcher: 'Prof. Claire Moreau',
    city: 'Montreal',
    year: 2017,
    pct: 36,
    material: 'spectrograms',
    defectTerm: 'lexical interference',
    p1: ({ city, year, pct, researcher }) =>
      `Cognitive neuroscientists in ${city} launched a longitudinal reading-comprehension study among bilingual university students in ${year}. Reaction-time measurements reported by ${researcher} indicated that habitual dual-language speakers switched between conflicting visual sorting rules ${pct}% faster than monolingual peers. Researchers attributed this flexibility to constant daily practice suppressing whichever vocabulary system is currently irrelevant.`,
    p2: ({ material, researcher }) =>
      `To observe how listeners isolate subtle vowel distinctions amid noisy cafe chatter, ${researcher} analyzed neural timing alongside acoustic ${material} captured from volunteer participants. High-frequency consonant cues triggered sharper brainstem phase-locking among early bilinguals.`,
    p3: ({ defectTerm }) =>
      `Conversely, bilingual participants occasionally exhibited brief hesitation pauses termed ${defectTerm} during timed picture-naming drills, because two competing translation equivalents activated simultaneously in memory before one word was articulated.`,
    p4: `Educational psychologists caution against overstating cognitive advantages, noting that socioeconomic access to quality libraries strongly shapes reading outcomes regardless of how many languages a child speaks at home.`,
    tfngTruePrompt: 'Constant mental suppression of an unused language trains rapid task-switching flexibility.',
    tfngTrueQuote: '...attributed this flexibility to constant daily practice suppressing whichever vocabulary system is currently irrelevant.',
    tfngFalsePrompt: 'Bilingual speakers never experience hesitation during picture-naming tasks.',
    tfngFalseQuote: '...bilingual participants occasionally exhibited brief hesitation pauses termed lexical interference...',
    tfngNgPrompt: 'Prof. Claire Moreau conducted follow-up trials with elderly retirees in Zurich.',
    mcqPrompt: 'What conclusion do educational psychologists add in Paragraph D?',
    mcqOptions: [
      'A. Bilingualism guarantees higher exam scores without reading practice.',
      'B. Library access and socioeconomic factors also heavily shape literacy.',
      'C. Monolingual children cannot distinguish vowels in noisy environments.',
      'D. Picture-naming drills slow down executive control permanently.',
    ],
    mcqAnswer: 'B',
    mcqQuote: 'socioeconomic access to quality libraries strongly shapes reading outcomes regardless of how many languages a child speaks...',
    mcqExplanation: 'Paragraph D highlights library access and socioeconomic factors alongside bilingualism.',
    gapPrompt: 'Simultaneous activation of two translation words causes brief pauses called _________.',
    gapMaxWords: 2,
    gapAnswer: 'lexical interference',
    gapQuote: '...exhibited brief hesitation pauses termed lexical interference...',
    shortPrompt: 'Which acoustic visual recordings did Prof. Moreau analyze alongside neural timing?',
    shortMaxWords: 1,
    shortAnswer: 'spectrograms',
    shortQuote: '...analyzed neural timing alongside acoustic spectrograms captured from volunteer participants.',
  },
  {
    topicTag: 'High-Altitude Wind & Grid Stability',
    title: 'Airborne Tethered Wind Kites & Frequency Flywheels',
    researcher: 'Dr. Samuel Osei',
    city: 'Aberdeen',
    year: 2022,
    pct: 58,
    material: 'dyneema',
    defectTerm: 'tether fatigue',
    p1: ({ city, year, pct, researcher }) =>
      `Offshore test engineers near ${city} piloted autonomous tethered wind kites flying 450 metres above coastal waters in ${year}. Output logs evaluated by ${researcher} showed that upper-airstream kites generated electricity ${pct}% more consistently than fixed seabed towers located three kilometres closer to shore. Because winds aloft blow steadier and stronger than surface gusts, lighter airborne wings capture equivalent megawatts with a fraction of structural steel.`,
    p2: ({ material, researcher }) =>
      `Anchoring an airborne wing generating several tonnes of pull without weighing down its flight envelope demanded ultra-light rigging. After testing metallic cables, ${researcher} selected braided ${material} polymer tethers capable of withstanding salt spray and ultraviolet exposure.`,
    p3: ({ defectTerm }) =>
      `Repeated reel-out and reel-in cycles around winch drums eventually induce localized abrasion known as ${defectTerm}, forcing ground crews to rotate load-bearing line segments every six hundred flight hours.`,
    p4: `Grid operators pair kite winches with spinning kinetic flywheels to smooth millisecond power dips during reel-in recovery phases, ensuring steady alternating current reaches coastal substations.`,
    tfngTruePrompt: 'Airborne kites fly higher where winds blow more steadily than near sea level.',
    tfngTrueQuote: 'Because winds aloft blow steadier and stronger than surface gusts...',
    tfngFalsePrompt: 'Engineers chose heavy metallic steel cables instead of polymer lines to tether the kites.',
    tfngFalseQuote: 'After testing metallic cables, Dr. Samuel Osei selected braided dyneema polymer tethers...',
    tfngNgPrompt: 'Civil aviation regulators restricted Aberdeen kites from operating during night hours.',
    mcqPrompt: 'Why are kinetic flywheels connected to kite winch stations in Paragraph D?',
    mcqOptions: [
      'A. To launch wings into upper airstreams at dawn.',
      'B. To smooth brief power drops while lines reel back in.',
      'C. To coat braided tethers against ultraviolet damage.',
      'D. To replace coastal electrical substations entirely.',
    ],
    mcqAnswer: 'B',
    mcqQuote: '...smooth millisecond power dips during reel-in recovery phases...',
    mcqExplanation: 'Flywheels bridge the brief drop in power when the tether reels back in.',
    gapPrompt: 'Winch drum abrasion over hundreds of hours produces localized _________.',
    gapMaxWords: 2,
    gapAnswer: 'tether fatigue',
    gapQuote: '...induce localized abrasion known as tether fatigue...',
    shortPrompt: 'Which braided polymer material was selected for lightweight kite lines?',
    shortMaxWords: 1,
    shortAnswer: 'dyneema',
    shortQuote: '...selected braided dyneema polymer tethers...',
  },
];

interface ListeningScenario {
  title: string;
  contextType: string;
  accentLabel: string;
  partNumber: 1 | 2 | 3 | 4;
  callerSpeaker: string;
  hostSpeaker: string;
  callerVoice: 'female-uk' | 'female-au';
  hostVoice: 'male-uk' | 'male-us';
  itemWordOptions: string[];
  streetOptions: string[];
  timeOptions: string[];
  feeOptions: number[];
}

const LISTENING_SCENARIOS: ListeningScenario[] = [
  {
    title: 'Community Makerspace & Laser-Cutter Induction',
    contextType: 'Part 1 • Everyday Social Dialogue',
    accentLabel: 'British English',
    partNumber: 1,
    callerSpeaker: 'Hannah (Applicant)',
    hostSpeaker: 'Liam (Coordinator)',
    callerVoice: 'female-uk',
    hostVoice: 'male-uk',
    itemWordOptions: ['birch', 'acrylic', 'ceramic', 'aluminium'],
    streetOptions: ['Alderney', 'Kestrel', 'Thornhill', 'Cromwell'],
    timeOptions: ['6.15 pm', '6.45 pm', '7.15 pm', '5.30 pm'],
    feeOptions: [28, 34, 42, 19],
  },
  {
    title: 'Regional Herbarium Volunteer Registration',
    contextType: 'Part 1 • Campus & Community Dialogue',
    accentLabel: 'Australian & British',
    partNumber: 1,
    callerSpeaker: 'Chloe (Student)',
    hostSpeaker: 'Arthur (Curator)',
    callerVoice: 'female-au',
    hostVoice: 'male-uk',
    itemWordOptions: ['lichen', 'ferns', 'mosses', 'orchids'],
    streetOptions: ['Lansdowne', 'Marigold', 'Hartwell', 'Beresford'],
    timeOptions: ['8.45 am', '9.30 am', '10.15 am', '11.00 am'],
    feeOptions: [15, 22, 25, 18],
  },
  {
    title: 'Sports Centre Climbing Wall Membership',
    contextType: 'Part 1 • Transactional Booking',
    accentLabel: 'British & North American',
    partNumber: 1,
    callerSpeaker: 'Maya (Member)',
    hostSpeaker: 'Daniel (Receptionist)',
    callerVoice: 'female-uk',
    hostVoice: 'male-us',
    itemWordOptions: ['chalk', 'harness', 'carabiner', 'gloves'],
    streetOptions: ['Ravenswood', 'Whitby', 'Clifton', 'Pennine'],
    timeOptions: ['5.45 pm', '6.30 pm', '7.45 pm', '8.15 pm'],
    feeOptions: [38, 45, 52, 29],
  },
];

const SPEAKING_TOPICS_POOL = [
  {
    title: 'Practical Skill You Learned Outside School',
    cue: 'Describe a practical skill you learned outside formal classes.',
    bullets: ['what the skill was', 'how you practiced it', 'what mistakes you made at first', 'and explain why this skill remains useful today.'],
    part1Topic: 'Hands-On Learning & Daily Tools',
    part1Prompt: 'Do you prefer learning new skills by watching tutorials or reading written manuals?',
    part3Theme: 'Vocational Skills & Lifelong Learning',
    part3Prompt: 'Why do many modern universities overlook practical hands-on crafts in favor of purely theoretical exams?',
    modelP2: [
      'A practical skill I picked up entirely outside formal classrooms is basic bicycle maintenance—specifically adjusting derailleur gears and patching punctured inner tubes.',
      'I started practicing about two years ago after getting stranded five kilometres from home with a snapped chain. Instead of paying a repair shop every month, I watched slow-motion repair breakdowns and practiced tuning my own commuter bike on Sunday afternoons.',
      'At first, I constantly over-tightened cable tension, which made shifting gears noisy and stiff. Once I learned to listen carefully to chain alignment and test one quarter-turn at a time, the mechanics clicked.',
      'This skill remains invaluable today because it saves money, keeps my daily commute reliable, and gives me genuine confidence to troubleshoot mechanical problems independently.',
    ],
    collocations: ['basic bicycle maintenance', 'cable tension', 'troubleshoot independently', 'slow-motion breakdowns'],
  },
  {
    title: 'Quiet Public Place Where You Concentrate Best',
    cue: 'Describe a quiet public place where you enjoy studying or reading.',
    bullets: ['where it is located', 'what the atmosphere is like', 'how often you visit it', 'and explain why it helps you focus better than home.'],
    part1Topic: 'Study Environments & Noise',
    part1Prompt: 'Do you find background ambient noise distracting or comforting when working?',
    part3Theme: 'Urban Architecture & Community Spaces',
    part3Prompt: 'Why are free public libraries still vital in cities where almost all books are available digitally?',
    modelP2: [
      'My favourite quiet place to concentrate is the upper reading mezzanine inside our municipal central library, located right beside the botanical gardens.',
      'Unlike noisy coffee shops, the mezzanine features tall arched windows, solid oak tables, and warm desk lamps that create a calm, studious atmosphere without feeling overly strict.',
      'Whenever I prepare for timed reading or writing drills, I try to visit three mornings a week right when the doors open at nine.',
      'Studying there helps me focus far better than staying in my bedroom because leaving my desk at home creates a clear mental boundary—seeing others quietly absorbed in their books nudges me to put my phone away and sustain deep concentration.',
    ],
    collocations: ['upper reading mezzanine', 'studious atmosphere', 'clear mental boundary', 'sustain deep concentration'],
  },
  {
    title: 'Memorable Public Transport Journey',
    cue: 'Describe a memorable journey you took using public transportation.',
    bullets: ['where you travelled', 'who you were with', 'what happened during the trip', 'and explain why the journey stayed in your memory.'],
    part1Topic: 'Commuting & Transit',
    part1Prompt: 'How reliable is public transit in the neighbourhood where you currently live?',
    part3Theme: 'Sustainable Mobility & Rail Networks',
    part3Prompt: 'What policies could persuade frequent car drivers to switch to high-speed trains or electric buses?',
    modelP2: [
      'One public transport journey I still remember vividly was an early-morning coastal train trip along the southern cliffs last autumn.',
      'I travelled alone with just a backpack and a notebook, heading to visit a small maritime museum in a harbour town two hours away.',
      'Halfway through the journey, thick coastal fog lifted suddenly, revealing dramatic chalk cliffs and fishing boats far below the railway viaduct. A retired marine engineer sitting opposite struck up a fascinating conversation about how Victorian builders anchored the seawall.',
      'The trip stayed in my memory because slowing down by rail turned simple transit into an unexpected moment of reflection and human connection that highway driving never offers.',
    ],
    collocations: ['early-morning coastal train', 'railway viaduct', 'struck up a conversation', 'unexpected moment of reflection'],
  },
];

export function buildProceduralDailyPack(
  date: string,
  stream: IeltsStream,
  variant = 0
): DailyChallengePack {
  const seedKey = `${date}-${stream}-v${variant}`;
  const rand = createRng(seedKey);
  const packId = `daily-${date}-${stream}-v${variant}`;

  // 1. Reading Set
  const rThemeIdx = (hashString(seedKey) + variant) % READING_THEMES.length;
  const rTemplate = READING_THEMES[rThemeIdx];
  const rYear = rTemplate.year + Math.floor(rand() * 2);
  const rPct = rTemplate.pct + Math.floor(rand() * 5) - 2;
  const p1Text = rTemplate
    .p1({ city: rTemplate.city, year: rYear, pct: rPct, researcher: rTemplate.researcher })
    .replace(String(rTemplate.pct), String(rPct));
  const p2Text = rTemplate.p2({ material: rTemplate.material, researcher: rTemplate.researcher });
  const p3Text = rTemplate.p3({ defectTerm: rTemplate.defectTerm });
  const p4Text = rTemplate.p4;

  const reading: ReadingPassageSet = {
    id: `${packId}-reading`,
    title: rTemplate.title,
    stream,
    sectionLabel: `Daily ${stream === 'academic' ? 'Academic' : 'GT'} Challenge (${date})`,
    topicTag: rTemplate.topicTag,
    difficultyBand: 'Band 6.5 – 8.5',
    recommendedMinutes: 16,
    wordCount: 390,
    sourceStyle: 'Daily Generated IELTS Passage',
    isDaily: true,
    paragraphs: [
      { label: 'A', text: p1Text },
      { label: 'B', text: p2Text },
      { label: 'C', text: p3Text },
      { label: 'D', text: p4Text },
    ],
    questions: [
      {
        id: `${packId}-rq1`,
        questionNumber: 1,
        type: 'true-false-not-given',
        typeLabel: 'True / False / Not Given',
        instructionNote: 'Choose TRUE, FALSE, or NOT GIVEN.',
        prompt: rTemplate.tfngTruePrompt,
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        paragraphRef: 'Paragraph A',
        passageQuote: rTemplate.tfngTrueQuote,
        explanation: 'Directly supported by the evidence in Paragraph A.',
      },
      {
        id: `${packId}-rq2`,
        questionNumber: 2,
        type: 'true-false-not-given',
        typeLabel: 'True / False / Not Given',
        instructionNote: 'Choose TRUE, FALSE, or NOT GIVEN.',
        prompt: rTemplate.tfngNgPrompt,
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        paragraphRef: 'Passage',
        passageQuote: rTemplate.researcher,
        explanation: 'The passage mentions the researcher, but gives zero detail on that biographical claim.',
      },
      {
        id: `${packId}-rq3`,
        questionNumber: 3,
        type: 'multiple-choice',
        typeLabel: 'Multiple Choice',
        instructionNote: 'Choose the correct letter A, B, C, or D.',
        prompt: rTemplate.mcqPrompt,
        options: rTemplate.mcqOptions,
        correctAnswer: rTemplate.mcqAnswer,
        paragraphRef: 'Paragraph C / D',
        passageQuote: rTemplate.mcqQuote,
        explanation: rTemplate.mcqExplanation,
      },
      {
        id: `${packId}-rq4`,
        questionNumber: 4,
        type: 'sentence-completion',
        typeLabel: 'Sentence Completion',
        instructionNote: `Write NO MORE THAN ${rTemplate.gapMaxWords} WORDS from Paragraph C.`,
        prompt: rTemplate.gapPrompt,
        maxWords: rTemplate.gapMaxWords,
        correctAnswer: rTemplate.gapAnswer,
        paragraphRef: 'Paragraph C',
        passageQuote: rTemplate.gapQuote,
        explanation: 'Extracted verbatim from Paragraph C within the word cap.',
      },
      {
        id: `${packId}-rq5`,
        questionNumber: 5,
        type: 'short-answer',
        typeLabel: 'Short-Answer Question',
        instructionNote: `Write ONE WORD ONLY from Paragraph B.`,
        prompt: rTemplate.shortPrompt,
        maxWords: rTemplate.shortMaxWords,
        correctAnswer: rTemplate.shortAnswer,
        paragraphRef: 'Paragraph B',
        passageQuote: rTemplate.shortQuote,
        explanation: 'Single technical noun extracted directly from Paragraph B.',
      },
    ],
  };

  // 2. Listening Set (with distractor + spelled word + price + time!)
  const lIdx = (hashString(seedKey + '-l') + variant) % LISTENING_SCENARIOS.length;
  const lTemplate = LISTENING_SCENARIOS[lIdx];
  const materialChoice = pick(lTemplate.itemWordOptions, rand);
  const distractorMaterial =
    lTemplate.itemWordOptions.find((m) => m !== materialChoice) ?? 'steel';
  const streetChoice = pick(lTemplate.streetOptions, rand);
  const timeChoice = pick(lTemplate.timeOptions, rand);
  const feeChoice = pick(lTemplate.feeOptions, rand);
  const feeDistractor = feeChoice + 10;
  const spelledStreet = streetChoice.toUpperCase().split('').join('-');

  const listening: ListeningPartSet = {
    id: `${packId}-listening`,
    partNumber: lTemplate.partNumber,
    title: `${lTemplate.title} (${date})`,
    contextType: lTemplate.contextType,
    accentLabel: lTemplate.accentLabel,
    recommendedMinutes: 6,
    difficultyBand: 'Band 6.0 – 8.0',
    isDaily: true,
    dialogue: [
      {
        speaker: lTemplate.callerSpeaker,
        voiceRole: lTemplate.callerVoice,
        text: `Good morning! I would like to register for today's induction session and confirm the entry fee and materials.`,
      },
      {
        speaker: lTemplate.hostSpeaker,
        voiceRole: lTemplate.hostVoice,
        text: `Welcome! Originally we required ${distractorMaterial} supplies for beginners, though this term all workshops use standard ${materialChoice} kits provided on site.`,
      },
      {
        speaker: lTemplate.callerSpeaker,
        voiceRole: lTemplate.callerVoice,
        text: `That saves hassle. Is the monthly fee still ${feeDistractor} pounds?`,
      },
      {
        speaker: lTemplate.hostSpeaker,
        voiceRole: lTemplate.hostVoice,
        text: `Actually, we discounted student passes this month to ${feeChoice} pounds if you bring your ID card.`,
      },
      {
        speaker: lTemplate.callerSpeaker,
        voiceRole: lTemplate.callerVoice,
        text: `Brilliant! And where is the annex building located, and what time do doors open?`,
      },
      {
        speaker: lTemplate.hostSpeaker,
        voiceRole: lTemplate.hostVoice,
        text: `Head to 18 ${streetChoice} Road—that is spelled ${spelledStreet}. Evening induction starts promptly at ${timeChoice}.`,
      },
    ],
    questions: [
      {
        id: `${packId}-lq1`,
        questionNumber: 1,
        type: 'note-completion',
        typeLabel: 'Note Completion',
        instructionNote: 'Write ONE WORD ONLY.',
        prompt: 'Primary workshop material provided this term: _________.',
        maxWords: 1,
        correctAnswer: materialChoice,
        audioQuote: `...all workshops use standard ${materialChoice} kits provided on site.`,
        explanation: `"${distractorMaterial}" was mentioned first as a distractor, then corrected to "${materialChoice}".`,
      },
      {
        id: `${packId}-lq2`,
        questionNumber: 2,
        type: 'short-answer',
        typeLabel: 'Short-Answer Question',
        instructionNote: 'Write ONE NUMBER ONLY.',
        prompt: 'What is the discounted monthly fee (£) with an ID card?',
        maxWords: 2,
        allowNumber: true,
        correctAnswer: String(feeChoice),
        acceptedVariants: [`£${feeChoice}`, `${feeChoice} pounds`],
        audioQuote: `Actually, we discounted student passes this month to ${feeChoice} pounds...`,
        explanation: `${feeDistractor} was the original fee distractor; discounted price = ${feeChoice}.`,
      },
      {
        id: `${packId}-lq3`,
        questionNumber: 3,
        type: 'note-completion',
        typeLabel: 'Form Completion',
        instructionNote: 'Write ONE WORD ONLY (exact spelling dictated).',
        prompt: 'Annex address: 18 _________ Road.',
        maxWords: 1,
        correctAnswer: streetChoice,
        audioQuote: `18 ${streetChoice} Road—that is spelled ${spelledStreet}.`,
        explanation: `Dictated spelling matches ${streetChoice}.`,
      },
      {
        id: `${packId}-lq4`,
        questionNumber: 4,
        type: 'short-answer',
        typeLabel: 'Short-Answer Question',
        instructionNote: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER.',
        prompt: 'What time does the evening session start?',
        maxWords: 2,
        allowNumber: true,
        correctAnswer: timeChoice,
        acceptedVariants: [timeChoice.replace('.', ':')],
        audioQuote: `...starts promptly at ${timeChoice}.`,
        explanation: `Exact start time confirmed at ${timeChoice}.`,
      },
    ],
  };

  // 3. Writing Set (Dynamic seeded percentages matching model response!)
  const wCountryA = pick(['Denmark', 'Portugal', 'Finland', 'Austria'], rand);
  const wCountryB = pick(['Belgium', 'Ireland', 'Poland', 'Greece'], rand);
  const a2015 = 18 + Math.floor(rand() * 10);
  const a2025 = a2015 + 22 + Math.floor(rand() * 8);
  const b2015 = 9 + Math.floor(rand() * 6);
  const b2025 = b2015 + 26 + Math.floor(rand() * 8);

  const writing: WritingTaskPrompt =
    stream === 'academic'
      ? {
          id: `${packId}-writing`,
          taskNumber: 1,
          stream: 'academic',
          category: `Daily Academic Task 1 (${date}) • Comparative Table`,
          title: `Urban Heat-Pump & Solar Adoption in ${wCountryA} and ${wCountryB}`,
          recommendedMinutes: 20,
          minWords: 150,
          weightLabel: '33.3% (1/3 of Writing Score)',
          isDaily: true,
          promptText: `The table below compares the percentage of households equipped with residential heat pumps in ${wCountryA} and ${wCountryB} in 2015, 2020, and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.`,
          chartData: {
            kind: 'table',
            title: `Residential Heat-Pump Adoption Rate (%) — Daily Dataset ${date}`,
            unit: '% of Urban Households',
            headers: ['Country', '2015', '2020', '2025', '10-Yr Net Gain'],
            rows: [
              {
                label: wCountryA,
                values: [
                  `${a2015}%`,
                  `${Math.round((a2015 + a2025) / 2)}%`,
                  `${a2025}%`,
                  `+${a2025 - a2015}%`,
                ],
              },
              {
                label: wCountryB,
                values: [
                  `${b2015}%`,
                  `${Math.round((b2015 + b2025) / 2)}%`,
                  `${b2025}%`,
                  `+${b2025 - b2015}%`,
                ],
              },
            ],
          },
          strategySteps: [
            'Intro: Paraphrase the prompt accurately (household heat-pump adoption across two nations, 2015–2025).',
            'Overview: Note that adoption expanded substantially in both countries; one nation held a higher share overall while the other grew faster.',
            'Body Paragraphs: Group data chronologically and make explicit numerical comparisons.',
          ],
          targetVocabulary: [
            'residential adoption rate',
            'upward trajectory',
            'baseline proportion',
            'accelerated markedly',
            'narrowed the gap',
          ],
          modelAnswer: {
            bandEstimate: 'Band 8.0',
            wordCount: 156,
            paragraphs: [
              {
                role: 'Introduction',
                text: `The table illustrates the proportion of urban households fitted with residential heat pumps across ${wCountryA} and ${wCountryB} at five-year intervals between 2015 and 2025.`,
              },
              {
                role: 'Overview',
                text: `Overall, both nations experienced substantial growth in residential heat-pump uptake throughout the decade. ${wCountryA} maintained a higher proportion in every recorded year, whereas ${wCountryB} achieved a larger net percentage-point gain from a lower starting baseline.`,
              },
              {
                role: `Body 1 (${wCountryA})`,
                text: `In 2015, ${a2015}% of urban homes in ${wCountryA} operated heat pumps. Adoption climbed steadily to ${Math.round(
                  (a2015 + a2025) / 2
                )}% by 2020 before reaching ${a2025}% in 2025, representing an overall increase of ${
                  a2025 - a2015
                } percentage points.`,
              },
              {
                role: `Body 2 (${wCountryB})`,
                text: `By contrast, ${wCountryB} began with barely ${b2015}% adoption in 2015. However, rapid mid-decade expansion lifted uptake to ${Math.round(
                  (b2015 + b2025) / 2
                )}% in 2020 and ${b2025}% by 2025—a net gain of ${
                  b2025 - b2015
                } percentage points that noticeably narrowed the gap with ${wCountryA}.`,
              },
            ],
            examinerNotes: [
              'Clear non-numeric overview placed cleanly in Paragraph 2.',
              'Exact dynamic metrics match the table accurately without external speculation.',
            ],
          },
        }
      : {
          id: `${packId}-writing`,
          taskNumber: 1,
          stream: 'general',
          category: `Daily GT Task 1 (${date}) • Formal Community Letter`,
          title: `Extending Weekend Study Hours at ${rTemplate.city} Public Library`,
          recommendedMinutes: 20,
          minWords: 150,
          weightLabel: '33.3% (1/3 of Writing Score)',
          isDaily: true,
          promptText: `Your local public library currently closes at 5.00 pm on weekends, making it difficult for working adults to study. Write a formal letter to the Chief Librarian.\n• Explain why current weekend hours create difficulties\n• Suggest practical revised opening times\n• Offer a constructive way volunteers could support longer hours.`,
          strategySteps: [
            'Use Formal register ("Dear Sir or Madam," -> "Yours faithfully,").',
            'Develop all 3 prompt bullets evenly in continuous connected prose.',
          ],
          targetVocabulary: [
            'I am writing to respectfully propose',
            'working professionals',
            'extended evening access',
            'volunteer rota',
            'I trust you will give this proposal careful consideration',
          ],
          modelAnswer: {
            bandEstimate: 'Band 8.0',
            wordCount: 162,
            paragraphs: [
              {
                role: 'Opening & Purpose',
                text: 'Dear Sir or Madam,\n\nI am writing to propose extending weekend opening hours at the Central District Library so local working residents can utilize quiet study spaces.',
              },
              {
                role: 'Bullet 1 (Current Difficulty)',
                text: 'At present, the library closes promptly at 5.00 pm on Saturdays and remains shut on Sundays. Because many full-time employees and adult learners run errands until late afternoon, we often arrive less than an hour before closing, leaving insufficient time for focused research.',
              },
              {
                role: 'Bullet 2 & 3 (Schedule & Volunteer Support)',
                text: 'Staying open until 8.00 pm on Saturdays and opening from noon until 6.00 pm on Sundays would dramatically improve community access. To minimize staffing costs, several regular members—myself included—would gladly volunteer on a supervised evening rota to handle book returns and keep quiet study halls orderly.\n\nYours faithfully,\nSamira Khan',
              },
            ],
            examinerNotes: [
              'Consistent formal register and full coverage of all three bullet points.',
            ],
          },
        };

  // 4. Speaking Set
  const sIdx = (hashString(seedKey + '-s') + variant) % SPEAKING_TOPICS_POOL.length;
  const sTemplate = SPEAKING_TOPICS_POOL[sIdx];
  const speaking: SpeakingTopicSet = {
    id: `${packId}-speaking`,
    title: `${sTemplate.title} (${date})`,
    theme: 'Daily Speaking Practice',
    difficultyBand: 'Band 7.0 – 8.5',
    isDaily: true,
    part1: {
      topic: sTemplate.part1Topic,
      questions: [
        {
          id: `${packId}-sp1`,
          prompt: sTemplate.part1Prompt,
          tip: 'Answer directly in 2–3 natural sentences with a concrete reason and contrast.',
          modelAnswer:
            'Personally, I get far more out of structured step-by-step practice where I can test concepts immediately rather than passively watching long videos.',
          usefulPhrases: ['far more effective', 'put concepts into practice', 'rather than passively'],
        },
      ],
    },
    part2: {
      cueCardTitle: sTemplate.cue,
      bullets: sTemplate.bullets,
      prepSeconds: 60,
      speakSeconds: 120,
      modelWordCount: 165,
      modelParagraphs: sTemplate.modelP2,
      keyCollocations: sTemplate.collocations,
    },
    part3: {
      themeTitle: sTemplate.part3Theme,
      questions: [
        {
          id: `${packId}-sp3`,
          prompt: sTemplate.part3Prompt,
          tip: 'Zoom out to institutions, policy incentives, and generational trends.',
          modelAnswer:
            'That is an important distinction. Broadly speaking, standardized systems often favour rapid pen-and-paper testing because practical workshops require smaller class sizes and specialized instructors—even though real workplaces prize hands-on problem solving.',
          usefulPhrases: ['Broadly speaking', 'even though', 'prize hands-on problem solving'],
        },
      ],
    },
  };

  return {
    packId,
    date,
    variant,
    stream,
    generatedBy: 'procedural-seed',
    themeTitle: rTemplate.title,
    reading,
    listening,
    writing,
    speaking,
  };
}
