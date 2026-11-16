import { SpeakingTopicSet } from '../types/ielts';

export const SPEAKING_BANK: SpeakingTopicSet[] = [
  {
    id: 'speak-env-study',
    title: 'Environment, Study Routines & Local Sustainability',
    theme: 'Environment & Daily Productivity',
    difficultyBand: 'Band 7.0 – 8.5',
    part1: {
      topic: 'Study Habits & Hometown',
      questions: [
        {
          id: 'sp1-q1',
          prompt: 'Do you prefer studying in the morning or in the evening?',
          tip: 'Give a direct preference plus a clear reason and a brief contrast (2–3 natural sentences).',
          modelAnswer:
            "Personally, I find that I'm far more productive during the early morning hours. My mind feels sharpest right after waking up, which makes it much easier to tackle dense reading or analytical tasks. By the time evening rolls around, mental fatigue usually sets in, so I try to avoid heavy studying later in the day.",
          usefulPhrases: ['far more productive', 'mental fatigue sets in', 'tackle dense reading'],
        },
        {
          id: 'sp1-q2',
          prompt: 'Let’s talk about your hometown. What do you like most about living there?',
          tip: 'Highlight one specific local feature (parks, cafes, community warmth) rather than vague adjectives like "nice".',
          modelAnswer:
            'What I appreciate most about my hometown is how accessible everything is without sacrificing green space. Even though the commercial district stays lively all week, you can walk fifteen minutes and reach quiet tree-lined parks along the canal, which gives the neighbourhood a very balanced pace of life.',
          usefulPhrases: ['without sacrificing', 'tree-lined parks', 'balanced pace of life'],
        },
      ],
    },
    part2: {
      cueCardTitle: 'Describe an environmental problem in your local area.',
      bullets: [
        'what the problem is',
        'what causes it',
        'how it affects people',
        'and explain what can be done to solve it.',
      ],
      prepSeconds: 60,
      speakSeconds: 120,
      modelWordCount: 185,
      modelParagraphs: [
        "I'd like to talk about the growing issue of airborne particulate pollution in my home city. Over the past five years, this has developed into a major environmental and public health concern.",
        "The problem stems primarily from two main sources: a heavy increase in private vehicle traffic and emissions from the surrounding industrial zone. Because public transport options remain limited in the suburbs, thousands of commuters drive into the city centre each day. In addition, the manufacturing plants on the city's outskirts still rely heavily on fossil fuels, releasing fine particulates into the atmosphere.",
        'This situation directly affects local residents. During the winter, when temperature inversions trap pollutants near the ground, respiratory complaints spike, and vulnerable groups like young children and the elderly are often advised to stay indoors.',
        'To address this issue effectively, the local municipal council needs to take decisive action. First, investing in an affordable, electric public transit network would encourage commuters to leave their cars at home. Second, authorities should enforce stricter emission caps on nearby industrial facilities, offering tax incentives for adopting clean technologies.',
      ],
      keyCollocations: [
        'airborne particulate pollution',
        'stems primarily from',
        'temperature inversions trap pollutants',
        'respiratory complaints spike',
        'enforce stricter emission caps',
      ],
    },
    part3: {
      themeTitle: 'Societal Environmental Policy & Transport',
      questions: [
        {
          id: 'sp3-q1',
          prompt: 'Why do many commuters still prefer private cars even when air pollution is widely publicized?',
          tip: 'Zoom out to urban planning, convenience, and cost incentives rather than personal anecdotes.',
          modelAnswer:
            'That is an intriguing question. If we look at the broader picture, individual choice is heavily shaped by infrastructure convenience rather than pure awareness. When bus routes are infrequent or overcrowded, commuters naturally prioritize predictability and door-to-door comfort—especially families juggling school drop-offs and rigid office shifts.',
          usefulPhrases: ['If we look at the broader picture', 'heavily shaped by infrastructure', 'prioritize predictability'],
        },
        {
          id: 'sp3-q2',
          prompt: 'Should governments penalize polluting industries with heavy taxes or subsidize green upgrades instead?',
          tip: 'Contrast both policy instruments and propose a combined approach using speculative Part 3 phrases.',
          modelAnswer:
            "To a certain extent, both mechanisms play distinct roles. Strict carbon penalties signal clear accountability, yet heavy fines alone can sometimes force smaller manufacturers to pass costs onto consumers or relocate. On the flip side, pairing clear emission ceilings with targeted subsidies gives firms realistic capital to transition toward clean filtration.",
          usefulPhrases: ['To a certain extent', 'On the flip side', 'targeted subsidies'],
        },
      ],
    },
  },
  {
    id: 'speak-books-tech',
    title: 'Reading, Literature & Digital Media Habits',
    theme: 'Reading & Technology',
    difficultyBand: 'Band 7.0 – 8.5',
    part1: {
      topic: 'Reading & Digital Screens',
      questions: [
        {
          id: 'sp2-p1-q1',
          prompt: 'Do you enjoy reading printed books, or do you prefer reading on electronic devices?',
          tip: 'Compare tactile focus vs. portability naturally.',
          modelAnswer:
            'I actually lean toward printed books whenever I am reading at home for pleasure. Holding physical pages helps me unplug from constant phone notifications and remember chapters spatially, although I do switch to an e-reader whenever I travel light.',
          usefulPhrases: ['lean toward', 'unplug from notifications', 'travel light'],
        },
      ],
    },
    part2: {
      cueCardTitle: 'Describe a book or article you read recently that you found interesting.',
      bullets: [
        'what it was',
        'what it was about',
        'why you decided to read it',
        'and explain why you found it interesting.',
      ],
      prepSeconds: 60,
      speakSeconds: 120,
      modelWordCount: 162,
      modelParagraphs: [
        'Recently, I read a fascinating long-form science article titled "Listening to Reefs" in an online environmental magazine. It explored how marine acousticians drop underwater microphones onto coral reefs to track ecosystem recovery.',
        'The piece explained that healthy reefs sound remarkably loud—almost like sizzling bacon—because of thousands of snapping shrimp and fish calls, whereas bleached reefs turn almost silent.',
        'I originally clicked on it while researching ocean conservation for an English practice reading set, expecting a dry technical summary. Instead, the storytelling was vivid and accessible.',
        'What struck me most was the clever restoration trial where scientists placed waterproof speakers on dead coral rubble and broadcast healthy reef sounds, doubling fish larval settlement in six weeks. It made me realize how much of nature relies on invisible sensory cues we rarely notice.',
      ],
      keyCollocations: [
        'long-form science article',
        'vivid and accessible',
        'What struck me most',
        'invisible sensory cues',
      ],
    },
    part3: {
      themeTitle: 'Digital Technology & Younger Generations',
      questions: [
        {
          id: 'sp2-p3-q1',
          prompt: 'How has digital technology changed the way younger generations engage with literature?',
          tip: 'Compare sustained deep reading against fragmented short-form scrolling.',
          modelAnswer:
            'First off, digital platforms have dramatically expanded instant access to global literature and audiobooks, removing traditional cost barriers. Having said that, constant exposure to short-form feeds appears to fragment attention spans, meaning many younger readers consume rapid micro-articles rather than sustained long-form novels unless they consciously carve out quiet offline time.',
          usefulPhrases: ['First off', 'Having said that', 'fragment attention spans'],
        },
      ],
    },
  },
];
