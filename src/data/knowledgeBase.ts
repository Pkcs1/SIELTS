import { ModuleKnowledge, SkillId } from '../types/ielts';

export const MODULE_KNOWLEDGE: Record<SkillId, ModuleKnowledge> = {
  reading: {
    id: 'reading',
    title: 'IELTS Reading',
    subtitle: '3 Sections • 40 Questions • 11 Question Types',
    durationSummary: '60 minutes (inclusive of transferring/entering answers — NO extra transfer time)',
    weight: '25% of Overall IELTS Band Score',
    overview: {
      construct:
        'Evaluates operational English reading proficiency across gist, main ideas, specific factual detail, implied meaning, authorial stance/attitude, and complex logical argumentation.',
      whyItExists:
        'Serves as an empirical measurement tool for universities, professional registration boards, employers, and immigration authorities to verify whether a candidate can cope with English-medium texts without operational barriers.',
      skillsMeasured: [
        'Reading for overall gist and general meaning (Skimming)',
        'Locating specific facts, dates, and numbers (Scanning)',
        'Understanding paragraph-level main ideas and themes',
        'Recognizing inferences, theoretical positions, and implied meaning',
        'Distinguishing factual information from authorial stance/opinion',
        'Following complex causal chains and logical reasoning',
      ],
      academicAudience:
        'Candidates seeking undergraduate/postgraduate university admission or professional registration (e.g., doctors, nurses, engineers). Uses 3 long texts (2,150–2,750 words total) from books, journals, research reports, and quality newspapers.',
      generalAudience:
        'Candidates applying for secondary education, vocational training, work development, or migration. Uses 3 sections (2,150–2,375 words total): daily social notices (Sec 1), workplace handbooks/contracts (Sec 2), and general prose (Sec 3).',
    },
    formatRows: [
      {
        field: 'Duration',
        academic: '60 minutes (no dedicated transfer time; enter directly)',
        general: '60 minutes (inclusive of transfer/input time)',
      },
      {
        field: 'Section Architecture',
        academic: '3 Passages, each containing 1 long continuous academic text',
        general: '3 Sections: Sec 1 (2–3 short texts), Sec 2 (2 workplace texts), Sec 3 (1 longer text)',
      },
      {
        field: 'Total Questions',
        academic: '40 questions (1 mark per correct item, no negative marking)',
        general: '40 questions (1 mark per correct item, no negative marking)',
      },
      {
        field: 'Word Count',
        academic: '2,150 to 2,750 words across 3 passages',
        general: '2,150 to 2,375 words across all texts',
      },
      {
        field: 'Text Sources',
        academic: 'Books, academic journals, magazines, quality newspapers; technical terms include simple glossary notes',
        general: 'Notices, ads, timetables, job descriptions, employee contracts, staff handbooks, magazines',
      },
      {
        field: 'Delivery Modes',
        academic: 'IELTS on Computer, IELTS on Paper, and IELTS Online',
        general: 'IELTS on Computer and IELTS on Paper (GT is not offered via IELTS Online)',
      },
    ],
    questionTypes: [
      {
        id: 'r-mcq',
        number: 1,
        title: 'Multiple Choice',
        construct: 'Tests detailed comprehension of specific points or global understanding of main ideas.',
        markingRules: 'Radio button (1 of 4 options) or checkboxes (multi-select). 1 raw mark per correct item.',
        followsTextOrder: 'Yes — questions appear in the same order as information in the text.',
        strategy: [
          'Read the question stem and underline/identify primary content keywords.',
          'Locate the relevant paragraph using chronological passage progression.',
          'Read surrounding sentences closely to eliminate options that contradict the text or add unmentioned claims.',
          'Choose the option that accurately paraphrases meaning rather than relying on superficial word matches.',
        ],
        commonMistakes: [
          'Picking an option simply because it reuses exact vocabulary from the passage (distractor trap).',
          'Failing to notice when a prompt asks for TWO or THREE options instead of one.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Text Extract',
          extract:
            '"While early solar panels achieved an energy conversion rate of barely 8%, recent semiconductor innovations have propelled laboratory yields beyond 24%."',
          question: 'Recent improvements in solar panels are primarily due to:',
          options: [
            'A. Increased governmental funding.',
            'B. Advanced semiconductor materials.',
            'C. Lower manufacturing expenses.',
            'D. Commercial consumer demand.',
          ],
          answer: 'B',
          explanation:
            'The passage attributes yields beyond 24% directly to "recent semiconductor innovations" (paraphrased as B).',
        },
      },
      {
        id: 'r-tfng',
        number: 2,
        title: 'Identifying Information (True / False / Not Given)',
        construct: 'Evaluates objective factual statements against explicit evidence in the passage.',
        markingRules:
          'TRUE = agrees with text; FALSE = directly contradicts text; NOT GIVEN = neither confirmed nor denied.',
        followsTextOrder: 'Yes — statements generally follow the order of the passage.',
        strategy: [
          'Break each statement into verifiable factual propositions (subject, action, quantity, cause).',
          'Scan to locate the exact passage segment covering the concept.',
          'Check strictly: opposite fact = FALSE; absent fact = NOT GIVEN.',
          'Never import external real-world knowledge.',
        ],
        commonMistakes: [
          'Marking FALSE when the text mentions the topic but never confirms or negates the specific detail (NOT GIVEN).',
          'Writing YES/NO instead of TRUE/FALSE (invalidates answer category).',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Text Extract',
          extract: '"Excavations at the northern site ceased in 1984 due to budgetary constraints."',
          question: 'Statement: "Archaeological work at the northern site ended because the researchers ran out of money."',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          answer: 'TRUE',
          explanation: '"Ceased" paraphrases "ended" and "due to budgetary constraints" matches "ran out of money".',
        },
      },
      {
        id: 'r-ynng',
        number: 3,
        title: "Identifying Writer's Views / Claims (Yes / No / Not Given)",
        construct: "Tests recognition of the author's personal stance, opinion, hypothesis, or theoretical bias.",
        markingRules:
          'YES = agrees with writer’s view; NO = directly contradicts writer’s view; NOT GIVEN = writer expresses no clear stance.',
        followsTextOrder: 'Yes — generally follows passage order.',
        strategy: [
          'Scrutinize statements for attitudinal markers (believes, argues, fails to, overstated).',
          'Locate evaluative commentary in the text.',
          'Distinguish between what cited external researchers think vs. what the author personally claims.',
          'Assign YES, NO, or NOT GIVEN strictly based on authorial stance.',
        ],
        commonMistakes: [
          'Confusing an external researcher’s quoted opinion with the writer’s own view.',
          'Answering TRUE/FALSE instead of YES/NO.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Text Extract',
          extract:
            '"Although proponents tout automated grading as a panacea, I remain skeptical that algorithms can ever capture the stylistic subtleties of human prose."',
          question: 'Claim: "The author doubts that algorithmic systems can fully evaluate literary nuance."',
          options: ['YES', 'NO', 'NOT GIVEN'],
          answer: 'YES',
          explanation: '"I remain skeptical" directly matches "The author doubts", and "stylistic subtleties" = "literary nuance".',
        },
      },
      {
        id: 'r-match-info',
        number: 4,
        title: 'Matching Information',
        construct: 'Tests targeted scanning for specific details, reasons, comparisons, examples, or explanations across lettered paragraphs.',
        markingRules:
          'Enter paragraph letter (A, B, C...). Letters may repeat ONLY if instructions say "You may use any paragraph more than once."',
        followsTextOrder: 'No — items do NOT follow passage order.',
        strategy: [
          'Note the functional requirement in each prompt (e.g., "a comparison between...", "an explanation of why...").',
          'Scan paragraphs for functional discourse markers, not just noun keywords.',
          'Verify the paragraph contains the full functional match (an actual comparison/reason, not merely a mention).',
        ],
        commonMistakes: [
          'Matching the overall paragraph topic (which belongs to Matching Headings) rather than a localized detail.',
          'Reusing letters when repetition is not authorized.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Paragraph C Extract',
          extract:
            '"...In contrast to conventional tilling, which strips topsoil nutrients, no-till farming preserves organic subterranean biomass..."',
          question: 'Which paragraph contains: a comparison between two agricultural production techniques?',
          options: ['A', 'B', 'C', 'D'],
          answer: 'C',
          explanation: '"In contrast to conventional tilling..., no-till farming..." directly compares two techniques.',
        },
      },
      {
        id: 'r-match-head',
        number: 5,
        title: 'Matching Headings',
        construct: 'Tests paragraph-level synthesis, gist extraction, and separating main ideas from minor examples.',
        markingRules: 'One-to-one Roman numeral mapping (i, ii, iii...). Extra distractor headings exist; no heading is reused.',
        followsTextOrder: 'No — headings list is disordered relative to paragraphs.',
        strategy: [
          'Read the Roman-numeral heading list first to preview themes.',
          'Read each paragraph focusing on topic sentences and concluding synthesis.',
          'Formulate your own mental 5-word summary before picking a heading.',
          'Eliminate headings that only describe an isolated example inside the paragraph.',
        ],
        commonMistakes: [
          'Falling for keyword traps where a heading word appears once as a minor example.',
          'Reusing the same Roman numeral across two paragraphs.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Paragraph A Extract',
          extract:
            '"Roman municipal engineers constructed intricate gravity-fed conduits spanning hundreds of kilometres to supply city fountains and thermal baths..."',
          question: 'Choose the best heading for Paragraph A:',
          options: [
            'i. Financial ramifications of urban expansion',
            'ii. The structural architecture of Roman aqueducts',
            'iii. Environmental resistance to ancient zoning laws',
          ],
          answer: 'ii',
          explanation: 'The paragraph centers on how Roman engineers built gravity-fed water conduits (aqueducts).',
        },
      },
      {
        id: 'r-match-feat',
        number: 6,
        title: 'Matching Features',
        construct: 'Tests tracking connections between statements/inventions/theories and a categorical list (researchers, eras, regions).',
        markingRules: 'Select option letters (A, B, C...). Options can repeat if instructions permit; some options may go unused.',
        followsTextOrder: 'No — statements typically do not follow passage order.',
        strategy: [
          'Skim the passage first to highlight every appearance of the feature names (e.g., researchers).',
          'Read each statement and locate the matching name segment.',
          'Watch carefully for pronouns (he, she, they) continuing a researcher’s claim in later sentences.',
        ],
        commonMistakes: [
          'Missing claims attributed via pronouns ("she", "the team") in the sentence following the name.',
          'Assuming one-to-one usage when repetition is allowed.',
        ],
        example: {
          sourceTag: 'IELTS Academic Pattern',
          extractLabel: 'Passage Sentence',
          extract: '"...Elena Rostova designed an auditory dampener capable of isolating subterranean ocean frequencies..."',
          question: 'Match the invention to the researcher: "Developed an acoustic filtering device for deep-sea sensors."',
          options: ['A. Dr. Thorne', 'B. Prof. Garcia', 'C. Elena Rostova'],
          answer: 'C',
          explanation: '"Auditory dampener" paraphrases "acoustic filtering device", linked directly to Elena Rostova.',
        },
      },
      {
        id: 'r-match-end',
        number: 7,
        title: 'Matching Sentence Endings',
        construct: 'Tests understanding of cause-and-effect, structural cohesion, and proposition logic.',
        markingRules: 'Match beginning stems to ending options (A, B, C...). More endings are provided than beginnings.',
        followsTextOrder: 'Yes — sentence beginnings follow chronological passage order.',
        strategy: [
          'Read the stem and use chronological order to locate its topic in the passage.',
          'Determine the exact consequence/cause stated in the text.',
          'Check both factual accuracy AND grammatical fit before finalizing the ending.',
        ],
        commonMistakes: [
          'Choosing an ending simply because it forms a smooth English sentence without verifying textual truth.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Text Extract',
          extract:
            '"When drylands are subjected to continuous artificial watering, mineral deposits rise to the surface, triggering extensive salinization."',
          question: 'Complete the sentence: "Intensive irrigation in arid river basins..."',
          options: [
            'A. ...rapidly accelerates soil salinization.',
            'B. ...alleviated water shortages in polar regions.',
            'C. ...eliminated the need for artificial fertilizers.',
          ],
          answer: 'A',
          explanation: '"Continuous artificial watering" = "intensive irrigation", which triggers "extensive salinization".',
        },
      },
      {
        id: 'r-sent-comp',
        number: 8,
        title: 'Sentence Completion',
        construct: 'Tests detail extraction, grammatical parsing, and strict lexical accuracy.',
        markingRules:
          'Direct extraction from passage. Strict word-count cap (e.g., NO MORE THAN TWO WORDS). Hyphenated words = 1 word; do NOT alter word form.',
        followsTextOrder: 'Yes — gaps follow chronological order in the passage.',
        strategy: [
          'Identify the grammatical part of speech needed in the blank (singular noun, noun phrase, verb).',
          'Scan using anchor keywords around the gap.',
          'Copy the exact word(s) from the text without changing plural/tense endings or adding unnecessary articles.',
        ],
        commonMistakes: [
          'Changing a noun into an adjective or altering singular/plural form.',
          'Including an extra article ("the", "a") that exceeds the word limit.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Text Extract',
          extract: '"The probe survived extreme pressures due to an exterior hull coated in synthetic diamond."',
          question:
            'NO MORE THAN TWO WORDS: "The exploratory vehicle was shielded from structural collapse by its _________ coating."',
          answer: 'synthetic diamond',
          explanation: 'Two exact words extracted directly from "coated in synthetic diamond".',
        },
      },
      {
        id: 'r-summary',
        number: 9,
        title: 'Summary, Note, Table & Flow-Chart Completion',
        construct: 'Tests synthesizing a concentrated passage section, tracing process stages, and linking concepts.',
        markingRules:
          'Two variants: (1) direct text extraction with strict word limits, OR (2) letter selection from a synonym option bank.',
        followsTextOrder: 'Usually concentrated in 1–2 paragraphs; items within the summary may not be strictly chronological.',
        strategy: [
          'Check immediately whether answers come from the passage or a lettered word bank.',
          'Isolate the specific paragraph(s) summarized.',
          'Predict grammatical word class around each gap and ensure grammatical fit.',
        ],
        commonMistakes: [
          'Typing full words from the text when the question requires letter codes from an option bank.',
          'Violating ONE WORD ONLY or TWO WORDS limits.',
        ],
        example: {
          sourceTag: 'IELTS Academic Pattern',
          extractLabel: 'Text Extract',
          extract:
            '"Water purification begins with coarse filtration to remove suspended organic debris, followed by aeration to oxidize dissolved iron."',
          question: 'ONE WORD ONLY — Flow Chart Step 2: [?] -> Oxidizes iron',
          answer: 'aeration',
          explanation: 'Step 2 following coarse filtration is "aeration", matching ONE WORD ONLY.',
        },
      },
      {
        id: 'r-diagram',
        number: 10,
        title: 'Diagram Label Completion',
        construct: 'Tests converting spatial, mechanical, or natural prose descriptions into labelled visual diagrams.',
        markingRules: 'Exact word extraction from passage under strict word-count caps.',
        followsTextOrder: 'No — labels follow spatial diagram flow rather than strict prose order.',
        strategy: [
          'Inspect diagram title, arrows, and pre-labelled reference parts.',
          'Locate the paragraph describing physical mechanisms or spatial geometry.',
          'Trace directional flow (inlet -> core -> outlet) carefully before extracting nouns.',
        ],
        commonMistakes: [
          'Confusing directional arrows (intake vs. exhaust, top vs. base).',
          'Misspelling technical terms copied from the passage.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Text Extract',
          extract:
            '"Cold ambient air enters via the lower intake manifold, passes through a ceramic honeycomb core, and exits through the upper exhaust baffle."',
          question: 'NO MORE THAN TWO WORDS: Arrow pointing to lower inlet on furnace cross-section.',
          answer: 'intake manifold',
          explanation: 'Both "intake manifold" (2 words) fits the TWO WORDS limit; "lower intake manifold" would exceed 2 words!',
        },
      },
      {
        id: 'r-short',
        number: 11,
        title: 'Short-Answer Questions',
        construct: 'Tests precise retrieval of factual details (dates, materials, places, metrics).',
        markingRules:
          'Direct extraction under word/number limit. Numbers may be written as figures ("25") or words. No full sentences.',
        followsTextOrder: 'Yes — questions follow the chronological order of the text.',
        strategy: [
          'Pinpoint the interrogative focus (What, Which metal, When, How much).',
          'Track chronologically to locate the target sentence.',
          'Extract only the minimal factual unit without full-sentence phrasing.',
        ],
        commonMistakes: [
          'Writing conversational full sentences ("It was titanium") instead of concise units ("titanium").',
          'Exceeding word caps by copying extra adjectives/prepositions.',
        ],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Text Extract',
          extract: '"Metallurgists added titanium to the outer shell to resist oxidation in saline environments."',
          question: 'ONE WORD ONLY: "Which metal was incorporated into the exterior alloy to prevent corrosion?"',
          answer: 'titanium',
          explanation: '"Prevent corrosion" paraphrases "resist oxidation"; metal added = titanium.',
        },
      },
    ],
    hasQualitativeRubric: false,
    rubricNote:
      'IELTS Reading (like Listening) has NO published qualitative band descriptors. Every correct answer out of 40 earns 1 deterministic mark (with no negative marking), converted to Band 1.0–9.0.',
    rawConversionRows: [
      {
        band: '9.0',
        academicRaw: '39 – 40',
        generalRaw: '40',
        cefrLevel: 'Expert User',
        description: 'Fully operational command; appropriate, fluent, complete, effortless comprehension.',
      },
      {
        band: '8.0',
        academicRaw: '35 – 36',
        generalRaw: '37 – 38',
        cefrLevel: 'Very Good User',
        description: 'Operational command with occasional unsystematic inaccuracies; handles complex abstract reasoning.',
      },
      {
        band: '7.0',
        academicRaw: '30 – 32 (Avg 30)',
        generalRaw: '34 – 35 (Avg 35)',
        cefrLevel: 'Good User',
        description: 'Handles complex language well and grasps detailed reasoning with occasional lapses.',
      },
      {
        band: '6.0',
        academicRaw: '23 – 26 (Avg 23)',
        generalRaw: '30 – 31 (Avg 30)',
        cefrLevel: 'Competent User',
        description: 'Generally effective command; understands reasonably complex language and main ideas in familiar contexts.',
      },
      {
        band: '5.0',
        academicRaw: '15 – 18 (Avg 15)',
        generalRaw: '23 – 26 (Avg 23)',
        cefrLevel: 'Modest User',
        description: 'Partial command; copes with overall meaning in most situations; likely to make many mistakes.',
      },
      {
        band: '4.0',
        academicRaw: '10 – 12',
        generalRaw: '15 – 17 (Avg 15)',
        cefrLevel: 'Limited User',
        description: 'Basic competence limited to familiar, predictable situations; cannot handle complex language.',
      },
    ],
    band6vs7Title: 'Reading: Band 6.0 ("Competent User") vs. Band 7.0 ("Good User")',
    band6vs7Rows: [
      {
        dimension: 'Academic Raw Score',
        band6: '23 – 26 / 40 (~57.5%–65% accuracy)',
        band7: '30 – 32 / 40 (~75%–80% accuracy)',
      },
      {
        dimension: 'General Training Raw Score',
        band6: '30 – 31 / 40',
        band7: '34 – 35 / 40',
      },
      {
        dimension: 'Comprehension Profile',
        band6: 'Grasps main ideas and direct facts in familiar contexts; struggles when dense jargon or implicit nuance obscures surface wording.',
        band7: 'Handles complex language well; tracks detailed reasoning, abstract logic, and theoretical argumentation.',
      },
      {
        dimension: 'CLB Benchmark Correlation',
        band6: 'Roughly aligns with CLB Benchmark 7 / 8',
        band7: 'Correlates with CLB Benchmark 9: integrates multiple cross-text clues, separates fact from opinion, rejects noise.',
      },
      {
        dimension: 'Academic Readiness',
        band6: 'Functional, but likely needs post-entry language support for research-intensive coursework.',
        band7: 'Independently manages academic textbooks, research journals, and technical manuals.',
      },
    ],
    lexicalGroups: [
      {
        title: 'Discourse & Logical Cohesive Markers',
        items: [
          {
            label: 'Adversative / Contrastive',
            phrases: ['However', 'Nevertheless', 'Conversely', 'On the other hand', 'Notwithstanding', 'Whereas'],
          },
          {
            label: 'Causal / Consequential',
            phrases: ['Consequently', 'Thus', 'As a result', 'Hence', 'Due to', 'Triggering'],
          },
          {
            label: 'Additive / Elaborative',
            phrases: ['Furthermore', 'Moreover', 'In addition', 'Comparable to'],
          },
          {
            label: 'Referencing & Substitution',
            phrases: ['The former / The latter', 'Such phenomena', 'These findings', 'It / They (anaphoric)'],
          },
        ],
      },
      {
        title: 'Syntactic Structures to Parse Quickly',
        items: [
          {
            label: 'Concessive Clauses',
            phrases: ['Although early trials failed, ...', 'Whereas X rises, Y falls', 'Notwithstanding budget cuts...'],
          },
          {
            label: 'Objective Passive Voice',
            phrases: ['was observed to', 'were documented among', 'is projected to escalate'],
          },
        ],
      },
    ],
    studyPlan: {
      timeAllocation: [
        'Total 60 minutes across 3 passages (do NOT split evenly 20/20/20 because Passage 3 is hardest).',
        'Recommended split: Passage 1 in 15–17 min -> Passage 2 in 18–20 min -> Passage 3 in 23–25 min.',
        'Record answers directly on screen or answer sheet immediately — ZERO extra transfer time is given.',
      ],
      aiIntegration: [
        'Use AI to summarize complex journal articles paragraph-by-paragraph and verify your gist notes.',
        'Prompt AI to generate paraphrased equivalents of tough sentences to train synonym recognition.',
        'Maintain an Error Deconstruction Log classifying misses into Lexical Failure, Logic Error (F vs NG), or Word-Limit Violation.',
      ],
      aiCaution:
        'Never treat LLM-generated mock items as infallible primary truth — LLMs can hallucinate facts or break official IELTS item constraints. Cross-verify against official specifications.',
    },
    checklist: [
      { id: 'r-c1', title: 'Strict 60-Minute Enforcement', detail: 'Completed all 40 questions within 60 minutes without pausing.' },
      { id: 'r-c2', title: 'Word-Count Limit Adherence', detail: 'Verified every completion item does not exceed MAX WORDS (e.g., NO MORE THAN TWO WORDS).' },
      { id: 'r-c3', title: 'Exact Text Extraction', detail: 'Copied exact words from the passage without altering tense, plural, or morphology.' },
      { id: 'r-c4', title: 'Orthography & Spelling', detail: 'Checked every typed word matches passage spelling accurately.' },
      { id: 'r-c5', title: 'T/F/NG vs. Y/N/NG Accuracy', detail: 'Used TRUE/FALSE for facts and YES/NO for writer views.' },
      { id: 'r-c6', title: 'Strict Contradiction Check', detail: 'Confirmed FALSE/NO marks represent direct contradictions, not missing data (NOT GIVEN).' },
      { id: 'r-c7', title: 'Zero External Knowledge', detail: 'Based 100% of answers purely on passage text, ignoring personal knowledge.' },
      { id: 'r-c8', title: 'Grammar Fit Check', detail: 'Confirmed extracted gap-fill words fit syntactically inside the question sentence.' },
      { id: 'r-c9', title: 'Whole-Paragraph Scope', detail: 'Selected Matching Headings that capture the entire paragraph theme, not a single example.' },
      { id: 'r-c10', title: 'Zero Blanks Left', detail: 'Answered all items since there is no negative marking.' },
    ],
    cheatSheetLines: [
      'TOTAL DURATION      : 60 minutes (ZERO additional transfer time)',
      'TOTAL QUESTIONS     : 40 questions (1 mark each; 40 max; 25% of Overall Band)',
      'ACADEMIC vs GENERAL : AC = 3 long texts (2,150–2,750 words) | GT = 3 sections / 5–6 texts (2,150–2,375 words)',
      'BAND 7 BENCHMARK    : Academic ~30–32 / 40 | General Training ~34–35 / 40',
      'HYPHEN & NUMBER RULE: Hyphenated words ("check-in") = 1 word; contractions are never tested',
      'CHRONOLOGY RULE     : MCQ, T/F/NG, Y/N/NG, Sentence Comp, Short-Answer FOLLOW text order; Headings & Info do NOT',
    ],
    gapsAndUpdates: [
      {
        title: 'No Public Qualitative Reading Band Descriptors',
        detail:
          'Unlike Writing and Speaking, Cambridge/British Council/IDP do not publish qualitative reading rubrics. Reading uses deterministic raw mark equating; researchers map competencies via external standards like CLB.',
      },
      {
        title: 'Equating Variations Across Test Versions',
        detail:
          'Official cut-offs shift by ±1–2 marks depending on passage difficulty (e.g., Band 7.0 Academic averages 30, spanning 30–32).',
      },
      {
        title: 'Transfer Time Trap (Listening vs. Reading)',
        detail:
          'Paper Listening gives 10 minutes of transfer time after audio ends. Paper & Computer Reading provide ZERO transfer time at the end of 60 minutes.',
      },
      {
        title: 'Computer-Delivered Tools & One Skill Retake (OSR)',
        detail:
          'Computer test includes digital highlighter, right-click notes, contrast modes, and question-review flags. Computer test-takers can retake a single component (like Reading) within 60 days via OSR.',
      },
    ],
  },

  listening: {
    id: 'listening',
    title: 'IELTS Listening',
    subtitle: '4 Parts • 40 Questions • Single-Play Audio',
    durationSummary: '~30 minutes active audio (+10 min transfer on Paper; +2 min checking on Computer)',
    weight: '25% of Overall IELTS Band Score',
    overview: {
      construct:
        'Measures receptive listening comprehension across four progressive contexts: transactional dialogues, social monologues, multi-speaker academic seminars, and university lectures.',
      whyItExists:
        'Verifies candidates can navigate everyday social interactions (booking housing, campus tours) and comprehend academic seminars/lectures delivered in varied global English accents.',
      skillsMeasured: [
        'Extracting factual details (names, dates, prices, phone numbers, spellings)',
        'Following conversational turn-taking and speaker self-corrections (distractor filtering)',
        'Tracking spatial directions on maps and floor plans',
        'Identifying speakers’ attitudes, agreements, and implied meanings',
        'Following signposted academic lectures in Part 4',
      ],
      academicAudience: 'Identical test format and content for both IELTS Academic and IELTS General Training candidates.',
      generalAudience: 'Identical test format and content for both IELTS Academic and IELTS General Training candidates.',
    },
    formatRows: [
      {
        field: 'Duration & Review Window',
        academic: '~30 mins audio + 10 mins transfer (Paper) OR + 2 mins review (Computer)',
      },
      {
        field: 'Section Architecture',
        academic: 'Part 1: Social dialogue (2 speakers) | Part 2: Social monologue | Part 3: Academic discussion (up to 4) | Part 4: University lecture',
      },
      {
        field: 'Questions & Marks',
        academic: '40 questions (10 per part); 1 raw mark per question; no negative marking',
      },
      {
        field: 'Audio Playback Rule',
        academic: 'Recording is played ONCE ONLY — cannot be paused or replayed during exam',
      },
      {
        field: 'Accent Variety',
        academic: 'British, Australian, New Zealand, and North American (US/Canadian) accents',
      },
      {
        field: 'Delivery Modes',
        academic: 'IELTS on Computer, IELTS on Paper, and IELTS Online',
      },
    ],
    questionTypes: [
      {
        id: 'l-mcq',
        number: 1,
        title: 'Multiple Choice',
        construct: 'Tests detailed point comprehension or global dialogue agreement among 3 options (or multi-select lists).',
        markingRules: 'Select exact letter (A, B, C...). Questions always follow exact audio chronology.',
        followsTextOrder: 'Yes — exact audio order.',
        strategy: [
          'Use pre-audio reading time to underline stem keywords.',
          'Anticipate distractors: speakers frequently mention ALL 3 options before rejecting two.',
          'Listen sharply for correction signals ("actually", "originally we planned to, but...", "on second thought").',
        ],
        commonMistakes: [
          'Clicking the very first option heard before the speaker qualifies or retracts it.',
        ],
        example: {
          sourceTag: 'Official GT Sample Pattern',
          extractLabel: 'Audio Context',
          extract: 'Student Judy discusses research with her tutor, mentioning library data and participant size before agreeing to narrow the scope.',
          question: 'Why did Judy change her study topic?',
          options: [
            'A. Lack of available library data.',
            'B. Limited interest from participants.',
            'C. Her tutor suggested narrowing the focus.',
          ],
          answer: 'C',
          explanation: 'Options A and B serve as spoken distractors; the final confirmed decision is C.',
        },
      },
      {
        id: 'l-matching',
        number: 2,
        title: 'Matching',
        construct: 'Connects numbered items heard chronologically in audio to a disordered box of lettered options.',
        markingRules: 'Enter the matching option letter. Questions follow audio order; option box does not.',
        followsTextOrder: 'Yes — numbered items follow audio sequence.',
        strategy: [
          'Preview the lettered box options carefully before the track starts.',
          'Keep your eyes locked on the numbered list as the audio progresses.',
          'Listen for paraphrased equivalents of the boxed features.',
        ],
        commonMistakes: ['Staring at the lettered box and missing the transition to the next numbered item.'],
        example: {
          sourceTag: 'Official GT Pattern',
          extractLabel: 'Audio Context',
          extract: 'Travel agent reviews Hotel A, B, and C amenities sequentially.',
          question: 'Match each hotel to its key facility (e.g., Ensuite bathroom vs. Shared kitchen).',
          answer: 'Matches lettered box options to chronological hotels',
          explanation: 'Focus on the hotel names as anchors while listening for paraphrased facilities.',
        },
      },
      {
        id: 'l-map',
        number: 3,
        title: 'Plan, Map, and Diagram Labelling',
        construct: 'Tests spatial orientation, directional prepositions, and sequential physical route tracking.',
        markingRules: 'Enter option letter from box OR exact spoken words within word limits.',
        followsTextOrder: 'Yes — speaker walks through the layout sequentially.',
        strategy: [
          'Find the starting anchor first ("You are here", "Main Entrance", compass rose N/S/E/W).',
          'Orient relative cues (to your left, opposite, just past, round the bend).',
          'Trace your cursor physically along the route while the speaker talks.',
        ],
        commonMistakes: [
          'Flipping left/right perspective when the speaker faces toward vs. away from a landmark.',
        ],
        example: {
          sourceTag: 'Official GT Pattern',
          extractLabel: 'Audio Context',
          extract: 'A tour guide describes buildings along High Street starting from the town square.',
          question: 'Label the post office, pharmacy, and bank on the street grid.',
          answer: 'Follow sequential street turns from anchor point',
          explanation: 'Always anchor at the starting gate before tracking "first right" or "opposite the library".',
        },
      },
      {
        id: 'l-form',
        number: 4,
        title: 'Form, Note, Table, Flow-Chart & Summary Completion',
        construct: 'Tests transcribing exact factual data (names, addresses, materials, fees, dates) under strict word caps.',
        markingRules: 'Strict word-count cap (e.g., ONE WORD ONLY). Exact spelling required; hyphenated words = 1 word.',
        followsTextOrder: 'Yes — follows audio order.',
        strategy: [
          'Predict grammar and data type before audio starts (noun, currency, postcode, date).',
          'Wait for exact spoken word without altering plural -s or verb endings.',
          'Watch carefully for dictated letters (e.g., "double-L", "M as in Mary").',
        ],
        commonMistakes: [
          'Exceeding word limits ("in the library" instead of "library").',
          'Misspelling names explicitly spelled out by the speaker.',
        ],
        example: {
          sourceTag: 'Official GT Sample',
          extractLabel: 'Audio Excerpt',
          extract: '"...The table is in solid condition overall, though there is a small scratch on the surface near the corner..."',
          question: 'ONE WORD ONLY — Condition: Good, minor scratch on the _________.',
          answer: 'surface',
          explanation: 'Single noun directly transcribed from "on the surface".',
        },
      },
      {
        id: 'l-sent',
        number: 5,
        title: 'Sentence Completion',
        construct: 'Tests grasping key propositions and cause-effect relationships in gapped summary sentences.',
        markingRules: 'Exact spoken words extracted under strict word limits.',
        followsTextOrder: 'Yes — follows audio sequence.',
        strategy: [
          'Inspect syntax around the blank to anticipate noun/adjective/verb form.',
          'Listen for paraphrased lead-in words around the gap.',
          'Transcribe exact morphological form heard.',
        ],
        commonMistakes: ['Changing plural/singular forms, breaking sentence grammar.'],
        example: {
          sourceTag: 'Generated Sample',
          extractLabel: 'Audio Excerpt',
          extract: '"During the coldest winter months, scientists collected geological core samples directly from the lower glacier."',
          question: 'NO MORE THAN TWO WORDS: The research team gathered core samples from the _________ during winter.',
          answer: 'lower glacier',
          explanation: '"Gathered" paraphrases "collected"; exact noun phrase = lower glacier.',
        },
      },
      {
        id: 'l-short',
        number: 6,
        title: 'Short-Answer Questions',
        construct: 'Tests listening for concrete facts (times, fees, places, quantities).',
        markingRules: 'Strict word/number limit. Write figures ("15", "7.30 pm") to save time and avoid spelling errors.',
        followsTextOrder: 'Yes — follows audio sequence.',
        strategy: [
          'Highlight the question word (What time? How many? Where?).',
          'Prefer numeric digits over written-out number words.',
          'Never write complete sentences.',
        ],
        commonMistakes: ['Writing full sentences or adding unnecessary prepositions ("at 7.30 pm" when only time is needed).'],
        example: {
          sourceTag: 'Official GT Sample',
          extractLabel: 'Audio Excerpt',
          extract: '"The night tour begins promptly at 7.30 pm at the north gate."',
          question: 'NO MORE THAN TWO WORDS AND/OR A NUMBER: "What time does the evening campus tour commence?"',
          answer: '7.30 pm',
          explanation: 'Digital figure + pm fits within TWO WORDS AND/OR A NUMBER cleanly.',
        },
      },
    ],
    hasQualitativeRubric: false,
    rubricNote:
      'IELTS Listening has NO public qualitative rubric. All 40 items are graded deterministically (1 mark each, no penalty for wrong answers) and mapped via calibrated equating tables.',
    rawConversionRows: [
      { band: '9.0', academicRaw: '39 – 40', ceft: '', cefrLevel: 'Expert User', description: 'Effortless comprehension; catches subtle nuance and rapid connected speech.' } as never,
      { band: '8.0', academicRaw: '35 – 36', cefrLevel: 'Very Good User', description: 'Understands complex detailed argumentation; rare unsystematic lapses.' },
      { band: '7.0', academicRaw: '30 – 31 (Avg 30)', cefrLevel: 'Good User', description: 'Understands complex language, abstract ideas, and detailed reasoning with occasional errors.' },
      { band: '6.0', academicRaw: '23 – 25 (Avg 23)', cefrLevel: 'Competent User', description: 'Understands straightforward facts and main ideas in familiar contexts.' },
      { band: '5.0', academicRaw: '16 – 17 (Avg 16)', cefrLevel: 'Modest User', description: 'Understands direct factual speech; frequent errors on complex/abstract discussions.' },
      { band: '4.0', academicRaw: '10 – 12', cefrLevel: 'Limited User', description: 'Basic competence limited to familiar, predictable contexts.' },
    ].map((r) => ({
      band: r.band,
      academicRaw: r.academicRaw,
      cefrLevel: r.cefrLevel,
      description: r.description,
    })),
    band6vs7Title: 'Listening: Band 6.0 ("Competent User") vs. Band 7.0 ("Good User")',
    band6vs7Rows: [
      {
        dimension: 'Raw Accuracy Required',
        band6: '23 – 25 / 40 (~57.5%–62.5%)',
        band7: '30 – 31 / 40 (~75%–77.5%)',
      },
      {
        dimension: 'Parts 1 & 2 (Social)',
        band6: 'Accurately tracks straightforward dates, prices, and basic dialogue facts.',
        band7: 'Handles distractors, accent shifts, and complex spatial map routes effortlessly.',
      },
      {
        dimension: 'Parts 3 & 4 (Academic)',
        band6: 'Struggles when 3–4 speakers debate abstractly in Part 3 or when Part 4 lectures use dense technical lexis.',
        band7: 'Follows fast academic exchanges, speaker attitudes, implied agreement, and signposted lectures (CLB 8/9).',
      },
    ],
    lexicalGroups: [
      {
        title: 'Lecture Signposting & Distractor Signals',
        items: [
          {
            label: 'Topic Introduction & Transitions',
            phrases: ["Today, I'd like to look at...", 'Turning now to...', 'Having examined X, let us move on to Y'],
          },
          {
            label: 'Self-Correction / Distractor Alerts',
            phrases: ['Actually, wait —', 'Originally we planned to, however...', 'Contrary to popular belief...', 'Recent trials disproved this'],
          },
          {
            label: 'Spatial & Map Prepositions',
            phrases: ['Just opposite', 'Adjacent to', 'Directly beyond', 'At the fork in the road', 'Heading north-west'],
          },
        ],
      },
    ],
    studyPlan: {
      timeAllocation: [
        'Use every 20–30 second preview pause BEFORE each section plays to predict part of speech (noun, number, plural).',
        'Never stay stuck on a missed question — keep moving forward with the audio so you do not lose the next 3 answers.',
        'On Paper: transfer carefully during the 10-minute window. On Computer: check spelling & word limits during the 2-minute window.',
      ],
      aiIntegration: [
        'Listen to British, Australian, and North American podcast/lecture transcripts and turn them into gap-fill drills.',
        'Compare UK, AU, and US connected speech using SIELTS multi-accent neural audio tracks.',
      ],
      aiCaution:
        'Automated synthetic speech does not replicate overlapping Part 3 interruptions or background acoustics — supplement with official British Council/IDP recordings.',
    },
    checklist: [
      { id: 'l-c1', title: 'Exact Word Count', detail: 'Every gap-fill respects the stated limit (e.g., ONE WORD ONLY).' },
      { id: 'l-c2', title: 'Hyphenation Rule', detail: 'Treated hyphenated words (e.g., part-time) as single words.' },
      { id: 'l-c3', title: 'Spelling Accuracy', detail: 'All proper nouns, streets, and academic terms spelled accurately.' },
      { id: 'l-c4', title: 'Exact Form Heard', detail: 'Did not change singular/plural -s or verb tense from what was spoken.' },
      { id: 'l-c5', title: 'Numerical Clarity', detail: 'Used concise figures (e.g., 15) instead of spelling out long numbers.' },
      { id: 'l-c6', title: 'Zero Blanks Left', detail: 'Filled every box before final submission since wrong guesses lose 0 marks.' },
    ],
    cheatSheetLines: [
      'AUDIO PLAYBACK : Played ONCE ONLY (~30 min audio + 10m Paper transfer / 2m Computer review)',
      'STRUCTURE      : 4 Parts × 10 Qs = 40 Qs | Parts 1–2 Social | Parts 3–4 Academic',
      'ACCENTS        : British, Australian, New Zealand, North American',
      'BAND TARGETS   : Band 9 = 39–40 | Band 8 = 35–36 | Band 7 = 30–31 | Band 6 = 23–25',
      'GOLDEN RULE    : Always wait for the distractor correction ("Actually...", "Wait, no...") before locking MCQ',
    ],
    gapsAndUpdates: [
      {
        title: 'Paper vs. Computer Transfer Window Discrepancy',
        detail:
          'Paper candidates receive 10 minutes after audio stops to copy answers onto an optical sheet. Computer candidates type directly in real time and receive only 2 minutes to double-check.',
      },
      {
        title: 'No Public Qualitative Band Descriptors',
        detail:
          'Like Reading, Listening publishes no official rubric descriptors; mastery thresholds are benchmarked via raw score conversion and CLB equivalents.',
      },
    ],
  },

  writing: {
    id: 'writing',
    title: 'IELTS Writing',
    subtitle: 'Task 1 (33.3%) + Task 2 (66.7%) • 60 Minutes',
    durationSummary: '60 minutes total (Recommended: 20 mins Task 1 • 40 mins Task 2)',
    weight: '25% of Overall IELTS Band Score (Task 2 carries DOUBLE the weight of Task 1)',
    overview: {
      construct:
        'Evaluates productive written proficiency: ability to synthesize objective data or write functional correspondence (Task 1) and build coherent discursive arguments in formal prose (Task 2).',
      whyItExists:
        'Universities and employers rely on written output to verify applicants can produce structured reports, technical analyses, and formal correspondence without communicative breakdown.',
      skillsMeasured: [
        'Task Achievement (Task 1) & Task Response (Task 2)',
        'Coherence, logical paragraphing, and cohesive referencing',
        'Lexical range, academic collocation, and register control',
        'Grammatical range (complex clauses, passives, conditionals) and sentence accuracy',
      ],
      academicAudience:
        'Task 1: 150+ word factual report describing a graph, bar/pie chart, table, process diagram, or map comparison. Task 2: 250+ word formal discursive essay.',
      generalAudience:
        'Task 1: 150+ word functional letter (formal, semi-formal, or informal) addressing 3 bullet points. Task 2: 250+ word discursive essay on a general topic.',
    },
    formatRows: [
      {
        field: 'Total Duration',
        academic: '60 minutes (self-managed; ~20 min Task 1 / ~40 min Task 2)',
        general: '60 minutes (self-managed; ~20 min Task 1 / ~40 min Task 2)',
      },
      {
        field: 'Task 1 Type & Min Words',
        academic: 'Factual report on visual data (chart, table, map, process) — min 150 words',
        general: 'Functional letter addressing 3 prompt bullets — min 150 words',
      },
      {
        field: 'Task 2 Type & Min Words',
        academic: 'Discursive academic essay — min 250 words',
        general: 'Discursive general-topic essay — min 250 words',
      },
      {
        field: 'Scoring Weighting',
        academic: 'Task 1 = 33.3% (1/3) | Task 2 = 66.7% (2/3) of Writing Band',
        general: 'Task 1 = 33.3% (1/3) | Task 2 = 66.7% (2/3) of Writing Band',
      },
      {
        field: 'Format Constraints',
        academic: 'Continuous connected prose ONLY — bullet points, notes, or copied prompts are severely penalized',
        general: 'Continuous connected prose ONLY — bullet points or notes are penalized',
      },
      {
        field: 'Delivery Modes',
        academic: 'Computer, Paper, Computer (Writing on Paper), and IELTS Online',
        general: 'Computer, Paper, and Computer (Writing on Paper)',
      },
    ],
    questionTypes: [
      {
        id: 'w-ac-t1',
        number: 1,
        title: 'Academic Task 1: Visual Data / Diagram Report',
        construct: 'Tests objective selection of key trends, comparisons, and process stages without speculating on external causes.',
        markingRules: 'Assessed on TA, CC, LR, GRA. Omitting a clear Overview caps Task Achievement at Band 5. Minimum 150 words.',
        followsTextOrder: 'N/A — Recommended 4-paragraph layout: Intro -> Overview -> Body 1 -> Body 2.',
        strategy: [
          'Deconstruct axes, measurement units, categories, and timeframes before writing.',
          'Intro: Paraphrase the prompt accurately (do not copy verbatim).',
          'Overview Paragraph: Summarize 2–3 overarching trends or extremes WITHOUT listing raw figures.',
          'Body Paragraphs: Group figures logically to make explicit comparisons.',
        ],
        commonMistakes: [
          'Omitting the Overview paragraph (automatic ceiling at Band 5 for TA).',
          'Speculating on external real-world causes ("sales dropped due to inflation") absent from the visual.',
          'Listing every single number mechanically without grouping.',
        ],
        example: {
          sourceTag: 'Official Key Assessment Pattern',
          extractLabel: 'Prompt',
          extract: '"The chart below shows the number of men and women in further education in the UK across three periods."',
          question: 'What is mandatory for Band 7+ Task Achievement?',
          answer: 'Clear overview of overall trends + grouped comparisons of full-time vs. part-time data',
          explanation: 'High-scoring scripts pair a clear non-numeric overview with accurate grouped figures.',
        },
      },
      {
        id: 'w-gt-t1',
        number: 2,
        title: 'General Training Task 1: Functional Letter',
        construct: 'Tests initiating practical correspondence, matching tone/register, and expanding all three prompt bullets.',
        markingRules: 'Assessed on TA, CC, LR, GRA. Leaving any of the 3 bullets underdeveloped caps TA at Band 5. Minimum 150 words.',
        followsTextOrder: 'N/A — Salutation -> Purpose Opening -> 3 Bullet Paragraphs -> Sign-Off.',
        strategy: [
          'Identify recipient to lock register: Formal (unknown official), Semi-formal (landlord/colleague), Informal (friend).',
          'State purpose immediately in line 1.',
          'Dedicate full extended coverage to each of the 3 prompt bullets.',
          'Use matching closing salutation ("Yours faithfully" vs. "Yours sincerely" vs. "Best wishes").',
        ],
        commonMistakes: [
          'Skipping or glossing over one of the three bullet points.',
          'Mixing slang/contractions into a formal complaint letter.',
        ],
        example: {
          sourceTag: 'Official GT Sample',
          extractLabel: 'Situation',
          extract: '"You are having problems with the heating system in your rented house."',
          question: '3 Bullets: (1) Explain problem, (2) Describe impact on you, (3) State required action.',
          answer: 'Semi-formal register ("Dear Mr./Ms. [Name]", "Yours sincerely") covering all 3 bullets in continuous prose',
          explanation: 'A renting agency/landlord warrants polite semi-formal or formal tone.',
        },
      },
      {
        id: 'w-t2',
        number: 3,
        title: 'Writing Task 2: Discursive Essay (Academic & GT)',
        construct: 'Tests presenting a clear sustained position, developing supported arguments, and organizing cohesive academic essays.',
        markingRules: 'Assessed on TR, CC, LR, GRA. Carries 2x weight of Task 1. Minimum 250 words.',
        followsTextOrder: 'N/A — Intro + Thesis -> Body 1 -> Body 2 -> Conclusion.',
        strategy: [
          'Analyze all parts of the prompt ("Discuss both views AND give your opinion").',
          'State a clear central thesis in your Introduction and sustain it through the Conclusion.',
          'Build 2–3 body paragraphs, each anchored by one central topic sentence, explanation, and example.',
          'Synthesize main points in Conclusion without introducing brand-new arguments.',
        ],
        commonMistakes: [
          'Addressing only one view in a "Discuss both views" essay (caps TR at Band 5).',
          'Changing your opinion in the conclusion so it contradicts the body paragraphs.',
          'Relying on memorized, generic template sentences.',
        ],
        example: {
          sourceTag: 'Official GT Sample',
          extractLabel: 'Prompt',
          extract: '"Some people believe that smoking should be banned in all public places, while others feel this restricts personal freedom. Discuss both views and give your opinion."',
          question: 'Required structure for Band 7+ Task Response:',
          answer: 'Clear opinion in Intro + Body 1 (health/public case) + Body 2 (freedom counter-case) + consistent Conclusion',
          explanation: 'Must genuinely evaluate BOTH sides and state an unmistakable personal stance.',
        },
      },
    ],
    hasQualitativeRubric: true,
    rubricNote:
      'Every Writing script is evaluated across 4 equally weighted criteria (25% each): Task Achievement/Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.',
    bandDescriptors: [
      {
        band: 9,
        criteria: [
          { label: 'TA / TR', description: 'Satisfies all requirements fully in depth; fully developed position with relevant, well-supported ideas.' },
          { label: 'Coherence & Cohesion', description: 'Effortless progression; cohesion attracts zero attention; skilful paragraphing.' },
          { label: 'Lexical Resource', description: 'Full flexibility and precise use; sophisticated natural control; rare minor slips.' },
          { label: 'Grammatical Range', description: 'Full syntactic flexibility and accuracy; punctuation appropriate throughout.' },
        ],
      },
      {
        band: 8,
        criteria: [
          { label: 'TA / TR', description: 'Covers all requirements appropriately; key features skilfully highlighted / well-extended arguments.' },
          { label: 'Coherence & Cohesion', description: 'Logically sequenced; cohesion well-managed with occasional lapses; appropriate paragraphing.' },
          { label: 'Lexical Resource', description: 'Wide resource fluently used; skilful uncommon/idiomatic items; rare errors.' },
          { label: 'Grammatical Range', description: 'Wide range of structures used flexibly; majority of sentences error-free.' },
        ],
      },
      {
        band: 7,
        criteria: [
          { label: 'TA / TR', description: 'Clear overview (T1) or clear developed position (T2); addresses main parts though ideas may slightly over-generalize.' },
          { label: 'Coherence & Cohesion', description: 'Logically organized with clear progression; cohesive devices used flexibly with minor over/under-use.' },
          { label: 'Lexical Resource', description: 'Sufficient flexibility & precision; less common vocabulary with style awareness; few spelling errors.' },
          { label: 'Grammatical Range', description: 'Variety of complex structures; FREQUENT error-free sentences; good punctuation control.' },
        ],
      },
      {
        band: 6,
        criteria: [
          { label: 'TA / TR', description: 'Attempts overview/position, but some details inaccurate/missing or conclusions unclear/repetitive.' },
          { label: 'Coherence & Cohesion', description: 'Coherent overall arrangement, but cohesive devices are mechanical/faulty and referencing lacks flexibility.' },
          { label: 'Lexical Resource', description: 'Adequate resource; meaning clear despite errors in word choice, collocation, and spelling.' },
          { label: 'Grammatical Range', description: 'Mix of simple and complex forms, but complex clauses contain frequent errors (rarely impeding meaning).' },
        ],
      },
      {
        band: 5,
        criteria: [
          { label: 'TA / TR', description: 'Incompletely addresses prompt; lacks overview or misses a bullet; mechanical data recount.' },
          { label: 'Coherence & Cohesion', description: 'Evident organization but lacks overall progression; inadequate paragraphing or repetitive linking.' },
          { label: 'Lexical Resource', description: 'Limited resource; simple words accurate but frequent errors cause reader difficulty.' },
          { label: 'Grammatical Range', description: 'Limited repetitive sentence forms; faulty complex structures; frequent punctuation/grammar errors.' },
        ],
      },
    ],
    band6vs7Title: 'Writing: Concrete Divide Between Band 6.0 and Band 7.0',
    band6vs7Rows: [
      {
        dimension: 'Task Achievement / Response',
        band6: 'Attempts an overview (T1) or position (T2), but trends/conclusions lack clarity or depth.',
        band7: 'Unmistakable non-numeric overview (T1) and clear sustained position from Intro through Conclusion (T2).',
      },
      {
        dimension: 'Coherence & Cohesion',
        band6: 'Mechanical linkers ("Firstly, Secondly, Moreover" at every line) and ambiguous pronouns.',
        band7: 'Logical flow within/across paragraphs; flexible referencing ("such measures", "this trend").',
      },
      {
        dimension: 'Lexical Resource',
        band6: 'Adequate general vocabulary; noticeable collocation and word-choice errors.',
        band7: 'Uses less common academic lexis and natural collocations with style awareness.',
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        band6: 'Mixes simple & complex forms, but complex clauses frequently contain morphosyntactic errors.',
        band7: 'Deploys varied complex structures with good control, producing FREQUENT error-free sentences.',
      },
    ],
    lexicalGroups: [
      {
        title: 'Task 1 Data & Letter Language',
        items: [
          {
            label: 'Academic Trend Verbs & Nouns',
            phrases: ['upward trajectory', 'plummeted', 'plateaued', 'experienced a sharp surge', 'fluctuated wildly', 'escalated sixfold'],
          },
          {
            label: 'Comparative & Passive Phrases',
            phrases: ['in stark contrast to', 'considerably outpaced', 'respectively', 'narrowly behind', 'was observed to'],
          },
          {
            label: 'GT Letter Openings & Closings',
            phrases: [
              'I am writing to express my dissatisfaction regarding...',
              'I would be grateful if you could clarify...',
              'Yours faithfully (unknown name)',
              'Yours sincerely (named recipient)',
            ],
          },
        ],
      },
      {
        title: 'Task 2 Argumentative & Linking Devices',
        items: [
          {
            label: 'Stance & Attribution',
            phrases: ['It is indisputable that...', 'Proponents argue that...', 'Conversely, critics maintain that...'],
          },
          {
            label: 'Concessive & Causal Connectors',
            phrases: ['Notwithstanding', 'Nevertheless', 'Albeit', 'Consequently', 'Thereby triggering', 'Culminates in'],
          },
        ],
      },
    ],
    studyPlan: {
      timeAllocation: [
        'Task 1 (20 mins): 3 min deconstruct & plan -> 14 min write (160–185 words) -> 3 min proofread.',
        'Task 2 (40 mins): 5 min prompt analysis & outline -> 30 min write (265–300 words) -> 5 min proofread.',
        'Always write Task 2 carefully because it carries TWICE the scoring weight of Task 1.',
      ],
      aiIntegration: [
        'Submit practice drafts to inspect repetitive sentence structures and isolate punctuation slips.',
        'Ask AI for natural academic collocations and synonyms for overused basic adjectives.',
      ],
      aiCaution:
        'NEVER rely on LLMs to assign official band scores — AI models frequently miscalibrate Task Response, overlook register slips, and hallucinate rubric thresholds.',
    },
    checklist: [
      { id: 'w-c1', title: 'Word Count Minimums', detail: 'Task 1 >= 150 words and Task 2 >= 250 words.' },
      { id: 'w-c2', title: 'Continuous Prose Only', detail: 'Zero bullet points, numbered lists, or note fragments anywhere.' },
      { id: 'w-c3', title: 'Clear Overview (AC Task 1)', detail: 'Dedicated overview paragraph summarizing key trends without raw numbers.' },
      { id: 'w-c4', title: 'Accurate Data Selection', detail: 'Supported claims with exact chart figures and zero external speculation.' },
      { id: 'w-c5', title: 'All 3 Bullets Extended (GT T1)', detail: 'Covered and expanded all three prompt bullets with matching register.' },
      { id: 'w-c6', title: 'Sustained Position (Task 2)', detail: 'Clear thesis stated in Intro and echoed consistently in Conclusion.' },
      { id: 'w-c7', title: 'Topic Sentences', detail: 'Every body paragraph opens with a crisp central topic sentence.' },
      { id: 'w-c8', title: 'Unambiguous Referencing', detail: 'Pronouns ("it, this, these, former") refer clearly to antecedents.' },
      { id: 'w-c9', title: 'Complex Sentence Mix', detail: 'Balanced use of relative clauses, conditionals, concessives, and passives.' },
      { id: 'w-c10', title: 'Error-Free Majority', detail: 'Proofread punctuation, subject-verb agreement, and articles.' },
    ],
    cheatSheetLines: [
      'TOTAL TIME      : 60 minutes (Manage yourself: 20m Task 1 / 40m Task 2)',
      'SCORING SPLIT   : Task 1 = 33.3% (1/3) | Task 2 = 66.7% (2/3) | 25% of Overall Band',
      'MIN WORD COUNTS : Task 1 >= 150 words | Task 2 >= 250 words (underlength penalized)',
      'FORMAT RULE     : Continuous prose ONLY — bullet points incur severe TA/CC penalty',
      '4 RUBRICS (25%) : TA/TR | Coherence & Cohesion | Lexical Resource | Grammatical Range & Accuracy',
    ],
    gapsAndUpdates: [
      {
        title: 'Under-Length Penalty Mechanics',
        detail:
          'Official guides no longer deduct a fixed numeric penalty for scripts under 150/250 words; instead, short scripts automatically fail to show sufficient task extension, coherence, and range across rubrics.',
      },
      {
        title: 'Computer Writing Built-In Word Counter',
        detail:
          'IELTS on Computer displays a live word counter beneath your editor box (replicated in SIELTS Writing Studio) and supports standard cut/copy/paste.',
      },
    ],
  },

  speaking: {
    id: 'speaking',
    title: 'IELTS Speaking',
    subtitle: '3 Interactive Parts • 11–14 Minutes • Live Examiner',
    durationSummary: '11 to 14 minutes total (Face-to-Face or Video Call Speaking)',
    weight: '25% of Overall IELTS Band Score',
    overview: {
      construct:
        'Measures real-time spoken interactional competence across 4 criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.',
      whyItExists:
        'Evaluates spontaneous communication in university tutorials, workplace meetings, and social interactions — identical across Academic and General Training.',
      skillsMeasured: [
        'Spontaneous fluency with natural content-planning pauses (rather than language-search pauses)',
        'Sustained 2-minute narrative organization on a cue card',
        'Abstract societal analysis, speculation, and counter-argumentation in Part 3',
        'Natural stress-timing, connected speech, and expressive intonation',
      ],
      academicAudience: 'Identical across Academic and General Training streams.',
      generalAudience: 'Identical across Academic and General Training streams.',
    },
    formatRows: [
      { field: 'Total Duration', academic: '11 to 14 minutes total (same for Academic & General Training)' },
      { field: 'Part 1: Interview', academic: '4 to 5 minutes — personal topics (home, family, work, hobbies)' },
      { field: 'Part 2: Cue Card Long Turn', academic: '3 to 4 minutes — exactly 1 minute prep + 1–2 minutes uninterrupted speaking' },
      { field: 'Part 3: Abstract Discussion', academic: '4 to 5 minutes — analytical, societal discussion linked to Part 2 theme' },
      { field: 'Delivery Modes', academic: 'In-Person Face-to-Face OR Video Call Speaking (VCS) at test centre with headsets' },
      { field: 'Recording Rule', academic: 'All speaking interviews are audio-recorded for moderation and re-marking' },
    ],
    questionTypes: [
      {
        id: 's-p1',
        number: 1,
        title: 'Part 1: Introduction & Personal Interview (4–5 mins)',
        construct: 'Tests everyday personal exchange, comfort, and concise extended answers on familiar topics.',
        markingRules: 'Standardized examiner interlocutor frames.',
        followsTextOrder: '4–5 minutes covering 2–3 familiar topic sets.',
        strategy: [
          'Answer directly in full sentences — never stop at a bare "Yes" or "No".',
          'Extend each response naturally to 2–3 sentences with a reason, example, or contrast.',
          'Keep tone conversational; avoid robotic memorized scripts.',
        ],
        commonMistakes: [
          'Reciting memorized answers (triggers obvious unnatural intonation).',
          'Giving ultra-short 4-word replies that force constant examiner prompting.',
        ],
        example: {
          sourceTag: 'Official Academic Pattern',
          extractLabel: 'Examiner Question',
          extract: '"Do you prefer studying in the morning or in the evening?"',
          question: 'Target Band 7.5–8.0 Structure:',
          answer: 'Direct preference + biological reason + contrast with evening fatigue (3 natural sentences)',
          explanation: 'Extends naturally using "Personally, I find...", "which makes it much easier...", and "By the time evening rolls around...".',
        },
      },
      {
        id: 's-p2',
        number: 2,
        title: 'Part 2: Individual Long Turn / Cue Card (3–4 mins)',
        construct: 'Tests sustained monologue fluency, narrative coherence, and organizing ideas under time pressure.',
        markingRules: '1 minute preparation with pencil/paper; 1–2 minutes speaking until examiner interrupts.',
        followsTextOrder: '1 min prep -> 1–2 min talk -> 1–2 rounding-off questions.',
        strategy: [
          'During 1-minute prep, write ONLY keywords and strong collocations for each bullet — never full sentences.',
          'Use the 4 cue-card bullets as a chronological roadmap.',
          'Spend extra depth on the final "and explain why..." analytical prompt.',
          'Keep speaking until the examiner signals you to stop at 2 minutes.',
        ],
        commonMistakes: [
          'Stopping after 45 seconds due to thin planning.',
          'Wasting the 60-second prep trying to script complete opening sentences.',
        ],
        example: {
          sourceTag: 'Official Academic Pattern',
          extractLabel: 'Cue Card Prompt',
          extract: 'Describe a book or article you read recently that you found interesting (what, about, why chosen, why interesting).',
          question: 'Optimal target duration:',
          answer: 'Speak smoothly for 1 min 45 sec – 2 min 00 sec covering all 4 bullets',
          explanation: 'Speaking up to the examiner’s gentle stop proves sustained Band 7–8 fluency.',
        },
      },
      {
        id: 's-p3',
        number: 3,
        title: 'Part 3: Two-Way Abstract Discussion (4–5 mins)',
        construct: 'Tests advanced abstract reasoning: analyzing societal trends, comparing causes, speculating on the future.',
        markingRules: 'Flexible examiner follow-up prompts probing upper linguistic limits.',
        followsTextOrder: 'Linked conceptually to Part 2 theme, shifting from personal to societal.',
        strategy: [
          'Zoom out immediately from personal anecdotes to communities, generations, or governments.',
          'Buy thinking time naturally ("That is a multifaceted question...").',
          'Structure responses: Claim -> Reasoning -> Societal Example -> Counter-perspective.',
        ],
        commonMistakes: [
          'Treating Part 3 like Part 1 by telling only personal family stories.',
          'Freezing silently instead of using natural time-buying phrases.',
        ],
        example: {
          sourceTag: 'Official Academic Pattern',
          extractLabel: 'Examiner Question',
          extract: '"How has digital technology changed the way younger generations engage with literature?"',
          question: 'Key shift required:',
          answer: 'Societal comparison (short-form screens vs. deep print reading) using speculative & evaluative lexis',
          explanation: 'Demonstrates analytical abstraction rather than "I read e-books on my phone".',
        },
      },
    ],
    hasQualitativeRubric: true,
    rubricNote:
      'Speaking is graded across 4 equally weighted criteria (25% each): Fluency & Coherence (FC), Lexical Resource (LR), Grammatical Range & Accuracy (GRA), and Pronunciation (P).',
    bandDescriptors: [
      {
        band: 9,
        criteria: [
          { label: 'Fluency & Coherence', description: 'Fluent with rare repetition/self-correction; hesitations are content-related, never lexical searching.' },
          { label: 'Lexical Resource', description: 'Total flexibility and precision across all contexts; sustained natural idiomatic speech.' },
          { label: 'Grammatical Range', description: 'Precise accurate structures throughout; only rare native-like slips.' },
          { label: 'Pronunciation', description: 'Full range of phonological features; sustained connected speech; effortless comprehension.' },
        ],
      },
      {
        band: 8,
        criteria: [
          { label: 'Fluency & Coherence', description: 'Fluent with rare repetition; coherent development; occasional hesitation mostly content-related.' },
          { label: 'Lexical Resource', description: 'Wide resource flexibly used; skilful uncommon/idiomatic items; effective paraphrasing.' },
          { label: 'Grammatical Range', description: 'Wide range flexibly used; majority of sentences error-free; rare unsystematic slips.' },
          { label: 'Pronunciation', description: 'Sustains rhythm; flexible stress & intonation; easily understood throughout.' },
        ],
      },
      {
        band: 7,
        criteria: [
          { label: 'Fluency & Coherence', description: 'Speaks at length without noticeable effort; occasional hesitation/repetition does not break coherence; flexible spoken markers.' },
          { label: 'Lexical Resource', description: 'Flexible across topics; uses some less common/idiomatic expressions with style awareness; paraphrases effectively.' },
          { label: 'Grammatical Range', description: 'Range of complex structures used flexibly; FREQUENT error-free sentences.' },
          { label: 'Pronunciation', description: 'Displays positive Band 6 + Band 8 features; generally easy to understand with occasional lapses.' },
        ],
      },
      {
        band: 6,
        criteria: [
          { label: 'Fluency & Coherence', description: 'Willing to speak at length, but loses coherence when pausing to search for words or grammar.' },
          { label: 'Lexical Resource', description: 'Wide enough to discuss topics at length; some inappropriate word choices; generally paraphrases.' },
          { label: 'Grammatical Range', description: 'Mix of simple & complex structures with limited flexibility; errors occur in complex clauses.' },
          { label: 'Pronunciation', description: 'Intelligible, but variable stress-timing and rapid-speech rhythm cause occasional listener effort.' },
        ],
      },
      {
        band: 5,
        criteria: [
          { label: 'Fluency & Coherence', description: 'Relies on repetition, self-correction, or slow speech; overuses certain connectives.' },
          { label: 'Lexical Resource', description: 'Limited flexibility on unfamiliar topics; mixed success attempting paraphrase.' },
          { label: 'Grammatical Range', description: 'Basic sentences controlled; complex forms limited and nearly always contain errors.' },
          { label: 'Pronunciation', description: 'Frequent rhythm/intonation lapses; mispronunciations cause listener difficulty.' },
        ],
      },
    ],
    band6vs7Title: 'Speaking: Concrete Divide Between Band 6.0 and Band 7.0',
    band6vs7Rows: [
      {
        dimension: 'Fluency & Coherence',
        band6: 'Pauses mid-sentence while SEARCHING FOR WORDS OR GRAMMAR; overuses basic fillers.',
        band7: 'Speaks at length without noticeable effort; pauses are CONTENT-PLANNING pauses, not word-search pauses.',
      },
      {
        dimension: 'Lexical Resource',
        band6: 'Sufficient for familiar topics; limited idiomatic expressions and occasional awkward choices.',
        band7: 'Flexibly uses less common expressions, collocations, and effective circumlocution/paraphrase.',
      },
      {
        dimension: 'Grammatical Range & Accuracy',
        band6: 'Mixes simple and complex clauses, but complex clauses frequently contain errors.',
        band7: 'Uses varied complex structures accurately, achieving FREQUENT error-free sentences.',
      },
      {
        dimension: 'Pronunciation',
        band6: 'Inconsistent word stress and rhythm; listener occasionally works to decode.',
        band7: 'Sustained stress-timed rhythm, clear connected speech, and expressive intonation contours.',
      },
    ],
    lexicalGroups: [
      {
        title: 'Spoken Discourse Markers & Part 3 Speculative Language',
        items: [
          {
            label: 'Structuring & Qualifying',
            phrases: ['First off...', 'Another dimension to consider is...', 'Having said that...', 'To a certain extent, yes, but...', 'On the flip side...'],
          },
          {
            label: 'Natural Time-Buying Phrases',
            phrases: ["That's an intriguing question...", 'Let me think about that for a second...', 'If we look at the broader picture...'],
          },
          {
            label: 'Part 3 Speculative Lexis',
            phrases: ['It is plausible that...', 'One might project that...', 'I would hypothesize that...'],
          },
        ],
      },
    ],
    studyPlan: {
      timeAllocation: [
        'Practice Part 2 Cue Cards daily with a strict 1-minute prep timer + 2-minute speaking countdown.',
        'Record yourself with a microphone and play back specifically to count "um/uh" pauses vs. clean phrasing.',
        'Drill Part 3 answers by forcing yourself to mention society/trends rather than personal anecdotes.',
      ],
      aiIntegration: [
        'Use SIELTS Speaking Simulator microphone recorder + neural examiner prompts for realistic pacing.',
        'Review model Band 8 transcripts to adopt natural discourse markers and stress-timed phrasing.',
      ],
      aiCaution:
        'Human examiners evaluate subtle prosody, conversational warmth, and communicative naturalness — qualities automated scoring tools often misjudge.',
    },
    checklist: [
      { id: 's-c1', title: 'Sustained 2-Minute Long Turn', detail: 'Spoke for at least 1m 45s in Part 2 without running dry.' },
      { id: 's-c2', title: 'Keyword-Only 1-Min Prep', detail: 'Used 60s prep for bullet keywords & collocations instead of full sentences.' },
      { id: 's-c3', title: 'Content-Planning Pauses', detail: 'Paused naturally to choose ideas rather than hunting basic vocabulary.' },
      { id: 's-c4', title: 'Extended Part 1 Replies', detail: 'Answered every Part 1 prompt with 2–3 complete natural sentences.' },
      { id: 's-c5', title: 'Abstract Part 3 Focus', detail: 'Discussed broad societal trends in Part 3 rather than purely personal stories.' },
      { id: 's-c6', title: 'Flexible Spoken Markers', detail: 'Varied natural connectors ("having said that", "on the flip side") cleanly.' },
      { id: 's-c7', title: 'Effective Paraphrasing', detail: 'Explained ideas smoothly around unknown words instead of freezing.' },
      { id: 's-c8', title: 'Complex Clause Mix', detail: 'Included natural conditionals, relative clauses, and passives.' },
      { id: 's-c9', title: 'Stress-Timing & Intonation', detail: 'Stressed key content words and modulated pitch clearly.' },
      { id: 's-c10', title: 'Forward Momentum', detail: 'Kept flowing smoothly without backtracking constantly to self-correct minor slips.' },
    ],
    cheatSheetLines: [
      'TOTAL DURATION  : 11–14 minutes (Face-to-Face OR Video Call Speaking; always recorded)',
      'PART 1 (4–5m)   : Familiar personal interview — answer in 2–3 natural sentences',
      'PART 2 (3–4m)   : Cue Card — exact 1m prep (keywords only) + 1–2m sustained monologue',
      'PART 3 (4–5m)   : Two-way abstract discussion — zoom out to society & future trends',
      '4 RUBRICS (25%) : Fluency & Coherence | Lexical Resource | Grammar | Pronunciation',
    ],
    gapsAndUpdates: [
      {
        title: 'Video Call Speaking (VCS) Dynamics & Headsets',
        detail:
          'Trials confirmed score comparability between in-person and VCS; standardized headsets are now used to avoid audio echo.',
      },
      {
        title: 'No On-Screen Timer During Official Part 2 Prep',
        detail:
          'Official VCS omits an on-screen countdown during the 1-minute prep to mirror in-room human examiner timing (SIELTS lets you toggle the timer visible or hidden!).',
      },
    ],
  },
};

export const OFFICIAL_EXTRAS = {
  computerDeliveredFeatures: [
    {
      title: 'Live Top Countdown Clock',
      detail: 'Stays visible throughout Reading, Writing, and Listening, flashing/turning warning coral in final minutes.',
    },
    {
      title: 'Highlight & Right-Click Notes',
      detail: 'Highlight sentences inside Reading passages or Listening instructions and attach private notes.',
    },
    {
      title: 'Display Contrast Modes',
      detail: 'Switch between Standard Dark-on-White, Black-on-Yellow, or White-on-Black to reduce eye strain.',
    },
    {
      title: 'Bottom 1–40 Question Grid & Review Flags',
      detail: 'Jump between any question immediately and flag uncertain items to revisit before submitting.',
    },
    {
      title: 'Live Writing Word Counter',
      detail: 'Tracks exact typed words in Task 1 & Task 2 automatically so you never drop below 150 or 250 words.',
    },
  ],
  oneSkillRetake: {
    summary:
      'IELTS One Skill Retake (OSR) lets Computer-Delivered test takers retake just ONE section (Listening, Reading, Writing, or Speaking) instead of paying for a full 4-skill retake.',
    rules: [
      'Must have completed a full IELTS on Computer test originally.',
      'Must sit the One Skill Retake within 60 days of your original test date.',
      'Allowed once per original test sitting.',
      'Generates an updated Test Report Form (TRF) alongside your 3 original scores — you choose which TRF to send.',
      'Always verify whether your target university, employer, or immigration agency accepts OSR before booking.',
    ],
  },
};
