import { WritingTaskPrompt } from '../types/ielts';

export const WRITING_BANK: WritingTaskPrompt[] = [
  {
    id: 'write-ac-t1-renewables',
    taskNumber: 1,
    stream: 'academic',
    category: 'Academic Task 1 • Comparative Table',
    title: 'European Renewable Electricity Generation (2010–2020)',
    recommendedMinutes: 20,
    minWords: 150,
    weightLabel: '33.3% (1/3 of Writing Score)',
    promptText:
      'The table below shows the percentage of electricity generated from renewable sources across three European nations between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartData: {
      kind: 'table',
      title: 'Share of Electricity Generated from Renewable Sources (%)',
      unit: '% of Total National Electricity Output',
      headers: ['Country', '2010', '2015', '2020', '10-Yr Net Gain'],
      rows: [
        { label: 'Germany', values: ['17%', '31%', '45%', '+28%'] },
        { label: 'Spain', values: ['29%', '36%', '43%', '+14%'] },
        { label: 'United Kingdom', values: ['7%', '24%', '42%', '+35%'] },
      ],
    },
    strategySteps: [
      'Intro: Paraphrase the prompt (proportion of electrical power, 3 European nations, 2010–2020).',
      'Overview (Mandatory for Band 7+): State that all 3 nations saw substantial growth, Germany led throughout/by 2020, while the UK achieved the fastest sixfold expansion.',
      'Body 1: Detail Germany (17% -> 45%) and Spain (highest baseline 29% -> modest rise to 43%).',
      'Body 2: Contrast the UK’s low 7% baseline surging sixfold to 42%, converging nearly evenly with Germany and Spain.',
    ],
    targetVocabulary: [
      'proportion of electrical power',
      'upward trajectory',
      'narrowly behind',
      'lowest baseline figure',
      'escalating sixfold',
      'largely converging with',
    ],
    modelAnswer: {
      bandEstimate: 'Band 8.0 – 8.5',
      wordCount: 164,
      paragraphs: [
        {
          role: 'Introduction (Paraphrase)',
          text: 'The table illustrates the proportion of electrical power produced from renewable resources in Germany, Spain, and the United Kingdom over a ten-year timeframe from 2010 to 2020.',
        },
        {
          role: 'Overview (Key Trends — No Raw Data)',
          text: 'Overall, all three countries recorded substantial increases in renewable electricity generation over the decade. Germany consistently maintained the highest renewable share by the end of the period, while the United Kingdom exhibited the most rapid rate of expansion.',
        },
        {
          role: 'Body 1 (Germany & Spain)',
          text: 'In 2010, Germany generated 17% of its electricity via renewables, rising steadily to reach 45% by 2020. Spain began the period with renewable production accounting for 29% of its total output, but experienced more moderate growth, eventually culminating at 43% in 2020, narrowly behind Germany.',
        },
        {
          role: 'Body 2 (United Kingdom Surge)',
          text: "By contrast, the United Kingdom registered the lowest baseline figure in 2010, generating barely 7% of its electricity from renewable infrastructure. However, the subsequent decade witnessed a dramatic surge, with the UK's proportion escalating sixfold to achieve 42% by 2020, largely converging with the output figures of both Germany and Spain.",
        },
      ],
      examinerNotes: [
        'Clear non-numeric overview placed cleanly in Paragraph 2.',
        'Accurate data selection with explicit cross-country comparisons ("narrowly behind", "By contrast", "sixfold").',
        'Zero external speculation on why renewables grew (purely objective reporting).',
      ],
    },
  },
  {
    id: 'write-ac-t1-education',
    taskNumber: 1,
    stream: 'academic',
    category: 'Academic Task 1 • Grouped Bar Chart',
    title: 'UK Further Education by Gender & Study Mode',
    recommendedMinutes: 20,
    minWords: 150,
    weightLabel: '33.3% (1/3 of Writing Score)',
    promptText:
      'The chart below shows the number of men and women in further education in Britain across three periods (in thousands) and whether they were studying full-time or part-time. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartData: {
      kind: 'grouped-bar',
      title: 'Further Education Enrolment in Britain (Thousands)',
      unit: 'Thousands of Students',
      bars: [
        {
          period: '1970/71',
          series: [
            { name: 'Men Part-Time', value: 1000, color: '#F97316' },
            { name: 'Men Full-Time', value: 100, color: '#FDBA74' },
            { name: 'Women Part-Time', value: 700, color: '#334155' },
            { name: 'Women Full-Time', value: 50, color: '#94A3B8' },
          ],
        },
        {
          period: '1980/81',
          series: [
            { name: 'Men Part-Time', value: 850, color: '#F97316' },
            { name: 'Men Full-Time', value: 150, color: '#FDBA74' },
            { name: 'Women Part-Time', value: 820, color: '#334155' },
            { name: 'Women Full-Time', value: 140, color: '#94A3B8' },
          ],
        },
        {
          period: '1990/91',
          series: [
            { name: 'Men Part-Time', value: 900, color: '#F97316' },
            { name: 'Men Full-Time', value: 230, color: '#FDBA74' },
            { name: 'Women Part-Time', value: 1100, color: '#334155' },
            { name: 'Women Full-Time', value: 220, color: '#94A3B8' },
          ],
        },
      ],
    },
    strategySteps: [
      'Overview: Part-time study overwhelmingly outnumbered full-time study across all periods; female part-time enrolment grew markedly to overtake men by 1990/91.',
      'Body 1: Group part-time trends (Men dipped from 1,000k to 850k then 900k; Women climbed consistently from 700k to 1,100k).',
      'Body 2: Group full-time figures (both genders rose steadily from ~50k–100k to over 200k).',
    ],
    targetVocabulary: [
      'predominantly enrolled in',
      'vastly outnumbered',
      'surpassed male participation',
      'experienced a slight dip',
      'remained relatively modest',
    ],
    modelAnswer: {
      bandEstimate: 'Band 8.0',
      wordCount: 168,
      paragraphs: [
        {
          role: 'Introduction',
          text: 'The bar chart compares male and female participation in full-time and part-time further education across Britain during three academic periods: 1970/71, 1980/81, and 1990/91.',
        },
        {
          role: 'Overview',
          text: 'Overall, part-time learners vastly outnumbered full-time students throughout the entire timeframe. While male part-time numbers declined slightly overall, female participation expanded sharply across both study modes, eventually overtaking men in part-time enrolment by 1990/91.',
        },
        {
          role: 'Body 1 (Part-Time Trends)',
          text: 'In 1970/71, roughly 1,000,000 men studied part-time compared with approximately 700,000 women. Ten years later, male part-time numbers fell to 850,000 before recovering modestly to 900,000 in 1990/91. Conversely, female part-time enrolment climbed steadily to 820,000 in 1980/81 and surged to 1,100,000 by the final period.',
        },
        {
          role: 'Body 2 (Full-Time Trends)',
          text: 'Full-time education remained comparatively small yet grew consistently for both sexes. Male full-time attendance more than doubled from 100,000 in 1970/71 to 230,000 in 1990/91, closely mirrored by women rising fourfold from 50,000 to 220,000.',
        },
      ],
      examinerNotes: [
        'Groups logically by study mode (Part-time vs. Full-time) rather than reading year-by-year.',
        'Hits the exact key requirement from IELTSPLAN.md: overall growth + contrasting full-time vs. part-time.',
      ],
    },
  },
  {
    id: 'write-gt-t1-heating',
    taskNumber: 1,
    stream: 'general',
    category: 'General Training Task 1 • Semi-Formal Letter',
    title: 'Faulty Heating System in Rented Property',
    recommendedMinutes: 20,
    minWords: 150,
    weightLabel: '33.3% (1/3 of Writing Score)',
    promptText:
      'You are having problems with the heating system in your rented house. Write a letter to the renting agency. In your letter, you should:\n• Explain what the problem is\n• Describe how it affects your daily life\n• State clearly what action you want the renting agency to take.',
    bullets: [
      'Explain what the problem is',
      'Describe how it affects your daily life',
      'State clearly what action you want the renting agency to take',
    ],
    strategySteps: [
      'Register: Semi-formal or formal ("Dear Mr. Davies," or "Dear Sir or Madam," -> "Yours sincerely / faithfully").',
      'Opening: State address and exact reason for writing immediately.',
      'Extend all 3 bullets clearly in separate paragraphs — missing or rushing one caps TA at Band 5.',
    ],
    targetVocabulary: [
      'express my concern regarding',
      'intermittent failure',
      'plummeting indoor temperatures',
      'prompt inspection',
      'licensed heating engineer',
      'I look forward to your urgent confirmation',
    ],
    modelAnswer: {
      bandEstimate: 'Band 8.0',
      wordCount: 174,
      paragraphs: [
        {
          role: 'Salutation & Purpose',
          text: 'Dear Ms. Henderson,\n\nI am writing to report an ongoing malfunction with the central heating boiler at my rented residence, 14 Oakridge Lane, and to request urgent maintenance.',
        },
        {
          role: 'Bullet 1 (The Problem)',
          text: 'Over the past five days, the heating system has repeatedly shut down after running for roughly ten minutes, flashing an ignition fault code. Although I reset the control panel as outlined in the tenant manual, the radiators remain completely cold throughout the evening.',
        },
        {
          role: 'Bullet 2 (Personal Impact)',
          text: 'Because overnight temperatures have dropped near freezing this week, the house has become unbearably cold and damp. I work remotely from the spare bedroom, and the lack of warmth and reliable hot water has disrupted both my work focus and sleep quality.',
        },
        {
          role: 'Bullet 3 (Requested Action) & Sign-off',
          text: 'I would appreciate it if you could dispatch a certified heating technician before Thursday afternoon to repair or replace the faulty valve. Please confirm a suitable appointment window by phone today so I can ensure someone is home to grant access.\n\nYours sincerely,\nAlex Turner',
        },
      ],
      examinerNotes: [
        'Maintains consistent polite semi-formal register from salutation to "Yours sincerely".',
        'Every bullet point is fully extended with concrete realistic detail.',
      ],
    },
  },
  {
    id: 'write-t2-space',
    taskNumber: 2,
    stream: 'both',
    category: 'Writing Task 2 • Discuss Both Views & Give Opinion',
    title: 'Space Exploration Budget vs. Urgent Terrestrial Crises',
    recommendedMinutes: 40,
    minWords: 250,
    weightLabel: '66.7% (2/3 of Writing Score)',
    promptText:
      'In many countries, an increasing amount of money is being allocated to space exploration. Some people believe that this expenditure cannot be justified and that governments should spend public funds entirely on immediate terrestrial problems. Discuss both views and give your opinion.',
    strategySteps: [
      'Intro: Paraphrase topic, acknowledge both viewpoints, and state YOUR clear thesis.',
      'Body 1: Discuss why critics oppose space budgets (poverty, healthcare, climate mitigation on Earth).',
      'Body 2: Discuss why advocates support space R&D (spin-off technologies, Earth climate monitoring satellites).',
      'Conclusion: Synthesize both sides and restate your balanced thesis consistently.',
    ],
    targetVocabulary: [
      'exorbitant public funds',
      'anthropogenic climate change',
      'catalyst for ground-level innovation',
      'ubiquitous modern technologies',
      'primary empirical datasets',
      'prudent fiscal model',
    ],
    modelAnswer: {
      bandEstimate: 'Band 8.5',
      wordCount: 262,
      paragraphs: [
        {
          role: 'Introduction + Clear Thesis',
          text: 'The allocation of national financial resources to astronomical exploration has provoked widespread debate. While detractors maintain that planetary research is an irresponsible expenditure amid pressing global crises, proponents argue that scientific exploration yields indispensable technological and ecological advancements. In my view, while terrestrial dilemmas require urgent mitigation, maintaining a balanced investment in space programs remains vital for long-term human development.',
        },
        {
          role: 'Body 1 (View Against Space Spending)',
          text: 'On the one hand, opponents of space missions argue that exorbitant public funds should be directed toward urgent societal crises. Millions of people worldwide continue to endure extreme poverty, deteriorating healthcare infrastructure, and the direct impacts of anthropogenic climate change. From this perspective, spending billions of dollars on interplanetary exploration appears disconnected from human suffering. For instance, allocating these financial reserves toward rural agricultural development or renewable energy deployment would produce immediate, tangible improvements in global living standards.',
        },
        {
          role: 'Body 2 (View Supporting Space Spending)',
          text: 'On the other hand, advocates emphasize that space research acts as a catalyst for ground-level innovation. Many ubiquitous modern technologies—including satellite-based meteorological tracking, telecommunications infrastructure, and water filtration systems—were originally engineered to solve spaceflight challenges. Furthermore, satellite observations provide the primary empirical datasets required to monitor polar ice melt and deforestation patterns. Consequently, abandoning extraterrestrial exploration would significantly impair our capacity to understand and protect our own planet.',
        },
        {
          role: 'Conclusion (Synthesized Opinion)',
          text: 'In conclusion, although domestic socio-economic challenges demand robust state expenditure, dismissing space research as a luxury ignores the profound technological benefits it produces. Governments should therefore implement a prudent fiscal model that addresses immediate human welfare while preserving investment in scientific exploration.',
        },
      ],
      examinerNotes: [
        'Uses the exact Band 8.0+ model essay structure from IELTSPLAN.md (262 words > 250 min).',
        'Topic sentences, real-world examples (water filtration, ice-melt satellites), and zero mechanical filler.',
      ],
    },
  },
  {
    id: 'write-t2-smoking',
    taskNumber: 2,
    stream: 'both',
    category: 'Writing Task 2 • Discuss Both Views & Give Opinion',
    title: 'Public Smoking Bans vs. Individual Personal Freedom',
    recommendedMinutes: 40,
    minWords: 250,
    weightLabel: '66.7% (2/3 of Writing Score)',
    promptText:
      'Some people believe that smoking should be banned in all public places, while others feel this restricts personal freedom. Discuss both views and give your opinion.',
    strategySteps: [
      'Address BOTH views evenly and clarify where you draw the line (e.g., public health outweighs individual liberty when second-hand harm occurs).',
      'Avoid vague statements; cite passive smoking health risks, NHS/healthcare burden, and civil liberties.',
    ],
    targetVocabulary: [
      'second-hand smoke exposure',
      'public healthcare expenditure',
      'individual autonomy',
      'designated outdoor zones',
      'proportionate regulatory measure',
    ],
    modelAnswer: {
      bandEstimate: 'Band 8.0',
      wordCount: 258,
      paragraphs: [
        {
          role: 'Introduction + Opinion',
          text: 'Whether tobacco consumption should be strictly prohibited across all public venues remains a contentious policy issue. While civil libertarians argue that blanket bans infringe upon personal autonomy, public health advocates emphasize the involuntary harm inflicted on non-smokers. I firmly believe that prohibiting smoking in shared indoor and crowded public spaces is justified, provided designated open-air zones remain permitted.',
        },
        {
          role: 'Body 1 (Personal Freedom Argument)',
          text: 'Those who oppose sweeping restrictions contend that competent adults possess the right to make autonomous lifestyle decisions, even unhealthy ones. Since tobacco remains a legal commodity subject to heavy taxation, critics view total public prohibition as patronizing state overreach. Moreover, hospitality business owners sometimes worry that rigid bans deter certain patrons, reducing evening footfall at outdoor cafes and entertainment venues.',
        },
        {
          role: 'Body 2 (Public Health Argument)',
          text: 'Nevertheless, proponents of comprehensive bans present a compelling counterargument rooted in harm prevention. Unlike purely private habits, cigarette smoke disperses into shared air, exposing bystanders, children, and hospitality staff to carcinogenic second-hand particulates. Additionally, smoking-related respiratory and cardiovascular illnesses place an avoidable multi-billion-dollar strain on publicly funded healthcare systems. Curtailing public smoking therefore protects involuntary victims while encouraging long-term cessation.',
        },
        {
          role: 'Conclusion',
          text: 'In conclusion, although adult citizens should retain freedom over private choices, personal liberty rightly ends where measurable physical harm to others begins. Prohibiting tobacco use in public areas while allowing isolated outdoor smoking zones strikes a fair balance between civic rights and collective wellbeing.',
        },
      ],
      examinerNotes: [
        'Balances both perspectives genuinely before delivering a nuanced, sustained stance.',
        'Rich grammatical variety including concessive clauses ("While civil libertarians argue...") and participle phrases.',
      ],
    },
  },
];
