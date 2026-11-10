/* Markwell Tuition: subjects, levels, the weekly timetable, tutors, fees, hours and contact details. Every
   page reads this one file, so a class, a price or a tutor is changed here and nowhere else.

   SAMPLE SITE: Markwell Tuition is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain.

   School years are numbered 0 (Reception) to 13 (Year 13), as schools in England count them. */
window.Markwell = {
  // true = WhatsApp, phone and email buttons show what would happen instead of opening them.
  sample: true,

  name: "Markwell Tuition",
  short: "Markwell",
  whatsapp: "447700900649",
  mobile: "07700 900649",
  phone: "020 7946 0649",
  phoneLink: "+442079460649",
  email: "hello@markwell.example",
  safeguardingEmail: "safeguarding@markwell.example",
  address: "14 Inkpen Terrace, Bexleyheath DA6",

  /* ---------- School years in England ----------
     Children start Reception in the September after they turn four. A child's year group is set by their
     age on 31 August, so children born from 1 September to 31 August the next year are in the same year. */
  stages: [
    { id: "eyfs", name: "Early years", long: "Early Years Foundation Stage", from: 0, to: 0 },
    { id: "ks1", name: "Key Stage 1", long: "Key Stage 1", from: 1, to: 2 },
    { id: "ks2", name: "Key Stage 2", long: "Key Stage 2", from: 3, to: 6, exams: "Year 4 multiplication tables check in June. Year 6 national tests (SATs) in May." },
    { id: "ks3", name: "Key Stage 3", long: "Key Stage 3", from: 7, to: 9, exams: "No national exams. Most schools start some GCSE work in Year 9." },
    { id: "ks4", name: "Key Stage 4", long: "Key Stage 4, the GCSE years", tag: "GCSE", from: 10, to: 11, exams: "GCSE exams in May and June of Year 11, graded 9 (highest) to 1." },
    { id: "ks5", name: "Sixth form", long: "Sixth form, often called Key Stage 5", tag: "A level", from: 12, to: 13, exams: "A level exams in May and June of Year 13, graded A* to E." }
  ],
  // Our classes start here: Year 3, the start of Key Stage 2.
  firstYear: 3,

  // The real exam boards in England, as plain text. We teach to the board the child's school uses.
  boards: ["AQA", "Pearson Edexcel", "OCR", "WJEC Eduqas"],

  subjects: {
    maths: { name: "Maths", tab: "Maths", strap: "From times tables to calculus" },
    english: { name: "English", tab: "English", strap: "Reading, writing and set texts" },
    science: { name: "Science", tab: "Science", strap: "Biology, chemistry and physics" },
    elevenplus: { name: "11+ preparation", tab: "11+", strap: "Grammar and independent school entry" }
  },

  /* What we teach, by subject and school year. from/to are school years (3 = Year 3). */
  levels: [
    {
      id: "ks2-maths", subject: "maths", from: 3, to: 6, title: "Key Stage 2 maths",
      points: [
        "Place value, the four operations and fractions, built up step by step",
        "Times tables to 12 × 12, ready for the Year 4 multiplication tables check",
        "Reasoning and word problems, with SATs practice in Year 6"
      ]
    },
    {
      id: "ks3-maths", subject: "maths", from: 7, to: 9, title: "Key Stage 3 maths",
      points: [
        "Number, algebra, ratio, geometry and statistics, in step with school",
        "Gaps from primary school found and filled early",
        "Year 9: a calm head start on GCSE topics"
      ]
    },
    {
      id: "gcse-maths", subject: "maths", from: 10, to: 11, title: "GCSE maths",
      tiers: "Foundation tier (grades 1 to 5) or Higher tier (grades 4 to 9)",
      boards: ["AQA", "Pearson Edexcel", "OCR", "WJEC Eduqas"],
      points: [
        "Every topic on your child's specification, in the order school teaches it",
        "Exam technique: reading the question, showing working, checking",
        "Past papers under timed conditions from the spring of Year 11"
      ]
    },
    {
      id: "alevel-maths", subject: "maths", from: 12, to: 13, title: "A level maths",
      boards: ["AQA", "Pearson Edexcel", "OCR", "OCR (MEI)"],
      points: [
        "Pure maths, statistics and mechanics",
        "Proof, problem solving and modelling questions",
        "Further maths: one-to-one only"
      ]
    },
    {
      id: "ks2-english", subject: "english", from: 3, to: 6, title: "Key Stage 2 English",
      points: [
        "Reading for meaning: finding, explaining and inferring",
        "Planning and writing stories and non-fiction, with neat paragraphs",
        "Spelling, punctuation and grammar, with SATs practice in Year 6"
      ]
    },
    {
      id: "ks3-english", subject: "english", from: 7, to: 9, title: "Key Stage 3 English",
      points: [
        "Close reading of fiction, non-fiction, poetry and Shakespeare",
        "Analytical paragraphs that make a point and back it up",
        "Creative and persuasive writing with a clear structure"
      ]
    },
    {
      id: "gcse-english", subject: "english", from: 10, to: 11, title: "GCSE English Language and English Literature",
      boards: ["AQA", "Pearson Edexcel", "OCR", "WJEC Eduqas"],
      points: [
        "The set texts your child is studying at school",
        "Unseen reading, timed essays and writing to a brief",
        "Quotations and context learned in small, regular steps"
      ]
    },
    {
      id: "alevel-english", subject: "english", from: 12, to: 13, title: "A level English Literature",
      boards: ["AQA", "Pearson Edexcel", "OCR", "WJEC Eduqas"],
      points: [
        "Set texts, critical views and comparison essays",
        "Coursework: planning and feedback within the exam board's rules",
        "Timed essays with detailed written feedback"
      ]
    },
    {
      id: "ks2-science", subject: "science", from: 3, to: 6, title: "Key Stage 2 science",
      points: [
        "Living things, materials, forces, light, sound and electricity",
        "Working scientifically: fair tests, tables and simple graphs",
        "Group classes for Years 5 and 6; one-to-one for Years 3 and 4"
      ]
    },
    {
      id: "ks3-science", subject: "science", from: 7, to: 9, title: "Key Stage 3 science",
      points: [
        "Biology, chemistry and physics, in step with school",
        "Practical skills and writing up experiments",
        "The maths that science needs: units, rearranging and graphs"
      ]
    },
    {
      id: "gcse-science", subject: "science", from: 10, to: 11, title: "GCSE science",
      tiers: "Combined Science (worth two GCSEs) or separate Biology, Chemistry and Physics, at Foundation or Higher tier",
      boards: ["AQA", "Pearson Edexcel", "OCR", "WJEC Eduqas"],
      points: [
        "The required practicals and the questions set on them",
        "Six-mark answers and the maths in science",
        "Separate sciences in their own classes for Year 11"
      ]
    },
    {
      id: "alevel-science", subject: "science", from: 12, to: 13, title: "A level biology, chemistry and physics",
      boards: ["AQA", "Pearson Edexcel", "OCR", "WJEC Eduqas"],
      points: [
        "Topic by topic, matched to your child's specification",
        "Required practicals and data analysis",
        "Long answers, calculations and past papers"
      ]
    },
    {
      id: "elevenplus", subject: "elevenplus", from: 4, to: 6, title: "11+ preparation",
      points: [
        "Maths, English comprehension and writing, verbal and non-verbal reasoning",
        "Matched to the tests of the schools you are applying to",
        "Year 4: first steps. Year 5: the main course. Year 6: final practice, one-to-one"
      ]
    }
  ],

  /* ---------- Rooms and tutors ---------- */
  rooms: {
    r1: { name: "Room 1", where: "ground floor" },
    r2: { name: "Room 2", where: "ground floor" },
    r3: { name: "Room 3", where: "first floor" },
    online: { name: "Online", where: "live video lesson" }
  },

  tutors: {
    esther: {
      name: "Esther M.", initial: "E", colour: "english", role: "Head of centre",
      teaches: "KS2 English and 11+",
      background: "English degree and qualified teacher status. Taught in primary schools for 14 years, the last five as a deputy head."
    },
    asha: {
      name: "Asha P.", initial: "A", colour: "elevenplus", role: "Primary tutor",
      teaches: "KS2 maths and English, 11+",
      background: "Qualified primary teacher with a maths specialism. Seven years in Year 5 and Year 6 classrooms."
    },
    owen: {
      name: "Owen D.", initial: "O", colour: "maths", role: "Maths lead",
      teaches: "Maths, Year 7 to GCSE",
      background: "Maths degree and a teaching qualification. Nine years teaching maths in secondary schools."
    },
    kofi: {
      name: "Kofi A.", initial: "K", colour: "english", role: "English lead",
      teaches: "English, Year 7 to A level",
      background: "English literature degree and master's. Eleven years teaching English in secondary schools and sixth forms."
    },
    farah: {
      name: "Farah N.", initial: "F", colour: "science", role: "Science lead",
      teaches: "Biology and chemistry, KS2 to A level",
      background: "Biochemistry degree and a teaching qualification. Eight years teaching science, including A level chemistry."
    },
    jonah: {
      name: "Jonah R.", initial: "J", colour: "maths", role: "Physics and maths tutor",
      teaches: "Physics and A level maths, mostly online",
      background: "Physics degree and qualified teacher status. Worked as an engineer before teaching physics for six years."
    }
  },
  // The safeguarding leads named in the policy (keys into tutors).
  safeguarding: { lead: "esther", deputy: "owen" },

  /* ---------- Fees ----------
     Group classes: the price of one session. A term's fee is the number of sessions in that term times this. */
  groupFees: {
    ks2: { label: "Key Stage 2", minutes: 60, price: 24 },
    "11plus": { label: "11+ (weekday)", minutes: 60, price: 26 },
    "11plus-sat": { label: "11+ full course (Saturday)", minutes: 90, price: 36 },
    ks3: { label: "Key Stage 3", minutes: 60, price: 26 },
    gcse: { label: "GCSE", minutes: 60, price: 29 },
    alevel: { label: "A level", minutes: 90, price: 44 }
  },
  // One-to-one lessons: price for an hour, in the centre or online.
  oneToOne: [
    { label: "Year 3 to Year 6", price: 50 },
    { label: "11+ preparation", price: 54 },
    { label: "Year 7 to Year 9", price: 52 },
    { label: "GCSE", price: 58 },
    { label: "A level, Further maths", price: 64 }
  ],
  siblingDiscount: 0.1, // off the fees of each brother or sister after the first
  instalments: 3, // a term's fees can be paid in this many monthly parts
  trialMinutesOneToOne: 30,

  /* ---------- The weekly timetable ----------
     day: 1 = Monday ... 6 = Saturday. from/to: the school years the class is for. fee: a key in groupFees.
     capacity and enrolled give the places left; update enrolled as pupils join and leave. */
  classes: [
    { id: "mon-ks2-maths", day: 1, start: "16:15", minutes: 60, subject: "maths", title: "KS2 maths", from: 3, to: 4, room: "r1", tutor: "asha", capacity: 6, enrolled: 4, fee: "ks2" },
    { id: "mon-ks2-english", day: 1, start: "16:15", minutes: 60, subject: "english", title: "KS2 English", from: 5, to: 6, room: "r2", tutor: "esther", capacity: 6, enrolled: 5, fee: "ks2" },
    { id: "mon-ks3-maths", day: 1, start: "17:30", minutes: 60, subject: "maths", title: "KS3 maths", from: 7, to: 8, room: "r1", tutor: "owen", capacity: 6, enrolled: 3, fee: "ks3" },
    { id: "mon-ks3-science", day: 1, start: "17:30", minutes: 60, subject: "science", title: "KS3 science", from: 7, to: 9, room: "r3", tutor: "farah", capacity: 6, enrolled: 4, fee: "ks3" },
    { id: "mon-gcse-maths-higher", day: 1, start: "18:45", minutes: 60, subject: "maths", title: "GCSE maths, Higher tier", from: 11, to: 11, room: "r1", tutor: "owen", capacity: 6, enrolled: 6, fee: "gcse" },
    { id: "mon-alevel-physics", day: 1, start: "19:00", minutes: 90, subject: "science", title: "A level physics", from: 12, to: 13, room: "online", tutor: "jonah", capacity: 5, enrolled: 3, fee: "alevel" },

    { id: "tue-ks2-english", day: 2, start: "16:15", minutes: 60, subject: "english", title: "KS2 English", from: 3, to: 4, room: "r2", tutor: "esther", capacity: 6, enrolled: 3, fee: "ks2" },
    { id: "tue-ks2-maths", day: 2, start: "16:15", minutes: 60, subject: "maths", title: "KS2 maths", from: 5, to: 6, room: "r1", tutor: "asha", capacity: 6, enrolled: 5, fee: "ks2" },
    { id: "tue-ks3-english", day: 2, start: "17:30", minutes: 60, subject: "english", title: "KS3 English", from: 7, to: 9, room: "r2", tutor: "kofi", capacity: 6, enrolled: 4, fee: "ks3" },
    { id: "tue-ks3-maths", day: 2, start: "17:30", minutes: 60, subject: "maths", title: "KS3 maths", from: 9, to: 9, room: "r1", tutor: "owen", capacity: 6, enrolled: 2, fee: "ks3" },
    { id: "tue-gcse-english", day: 2, start: "18:45", minutes: 60, subject: "english", title: "GCSE English Language", from: 10, to: 11, room: "r2", tutor: "kofi", capacity: 6, enrolled: 5, fee: "gcse" },
    { id: "tue-gcse-science", day: 2, start: "18:45", minutes: 60, subject: "science", title: "GCSE Combined Science", from: 10, to: 10, room: "r3", tutor: "farah", capacity: 6, enrolled: 4, fee: "gcse" },

    { id: "wed-11plus-maths", day: 3, start: "16:15", minutes: 60, subject: "elevenplus", title: "11+ maths and reasoning", from: 5, to: 5, room: "r1", tutor: "asha", capacity: 6, enrolled: 5, fee: "11plus" },
    { id: "wed-ks2-science", day: 3, start: "16:15", minutes: 60, subject: "science", title: "KS2 science", from: 5, to: 6, room: "r3", tutor: "farah", capacity: 6, enrolled: 2, fee: "ks2" },
    { id: "wed-gcse-maths-foundation", day: 3, start: "17:30", minutes: 60, subject: "maths", title: "GCSE maths, Foundation tier", from: 10, to: 11, room: "r1", tutor: "owen", capacity: 6, enrolled: 3, fee: "gcse" },
    { id: "wed-ks3-english-online", day: 3, start: "17:30", minutes: 60, subject: "english", title: "KS3 English", from: 7, to: 8, room: "online", tutor: "kofi", capacity: 6, enrolled: 2, fee: "ks3" },
    { id: "wed-gcse-chemistry", day: 3, start: "18:45", minutes: 60, subject: "science", title: "GCSE chemistry", from: 11, to: 11, room: "r3", tutor: "farah", capacity: 6, enrolled: 5, fee: "gcse" },
    { id: "wed-alevel-maths", day: 3, start: "19:00", minutes: 90, subject: "maths", title: "A level maths", from: 12, to: 13, room: "online", tutor: "jonah", capacity: 5, enrolled: 4, fee: "alevel" },

    { id: "thu-11plus-english", day: 4, start: "16:15", minutes: 60, subject: "elevenplus", title: "11+ English and writing", from: 5, to: 5, room: "r2", tutor: "esther", capacity: 6, enrolled: 4, fee: "11plus" },
    { id: "thu-ks2-maths-y6", day: 4, start: "16:15", minutes: 60, subject: "maths", title: "KS2 maths: Year 6 SATs", from: 6, to: 6, room: "r1", tutor: "asha", capacity: 6, enrolled: 3, fee: "ks2" },
    { id: "thu-ks3-maths-online", day: 4, start: "17:30", minutes: 60, subject: "maths", title: "KS3 maths", from: 7, to: 8, room: "online", tutor: "owen", capacity: 6, enrolled: 4, fee: "ks3" },
    { id: "thu-alevel-biology", day: 4, start: "18:30", minutes: 90, subject: "science", title: "A level biology", from: 12, to: 13, room: "r3", tutor: "farah", capacity: 5, enrolled: 2, fee: "alevel" },
    { id: "thu-gcse-maths-higher", day: 4, start: "18:45", minutes: 60, subject: "maths", title: "GCSE maths, Higher tier", from: 10, to: 10, room: "r1", tutor: "owen", capacity: 6, enrolled: 4, fee: "gcse" },
    { id: "thu-gcse-english-lit", day: 4, start: "18:45", minutes: 60, subject: "english", title: "GCSE English Literature", from: 11, to: 11, room: "r2", tutor: "kofi", capacity: 6, enrolled: 6, fee: "gcse" },

    { id: "fri-ks2-maths", day: 5, start: "16:15", minutes: 60, subject: "maths", title: "KS2 maths", from: 3, to: 4, room: "r1", tutor: "asha", capacity: 6, enrolled: 2, fee: "ks2" },
    { id: "fri-gcse-physics", day: 5, start: "17:00", minutes: 60, subject: "science", title: "GCSE physics", from: 10, to: 11, room: "online", tutor: "jonah", capacity: 6, enrolled: 3, fee: "gcse" },

    { id: "sat-11plus-full", day: 6, start: "09:00", minutes: 90, subject: "elevenplus", title: "11+ full course", from: 5, to: 5, room: "r1", tutor: "esther", capacity: 6, enrolled: 5, fee: "11plus-sat" },
    { id: "sat-ks2-maths", day: 6, start: "09:00", minutes: 60, subject: "maths", title: "KS2 maths", from: 3, to: 4, room: "r2", tutor: "asha", capacity: 6, enrolled: 5, fee: "ks2" },
    { id: "sat-gcse-science", day: 6, start: "09:30", minutes: 60, subject: "science", title: "GCSE Combined Science", from: 11, to: 11, room: "r3", tutor: "farah", capacity: 6, enrolled: 4, fee: "gcse" },
    { id: "sat-ks2-english", day: 6, start: "10:15", minutes: 60, subject: "english", title: "KS2 English", from: 3, to: 4, room: "r2", tutor: "asha", capacity: 6, enrolled: 4, fee: "ks2" },
    { id: "sat-11plus-first-steps", day: 6, start: "10:45", minutes: 60, subject: "elevenplus", title: "11+ first steps", from: 4, to: 4, room: "r1", tutor: "esther", capacity: 6, enrolled: 3, fee: "11plus" },
    { id: "sat-ks3-english", day: 6, start: "11:00", minutes: 60, subject: "english", title: "KS3 English", from: 8, to: 9, room: "r3", tutor: "kofi", capacity: 6, enrolled: 3, fee: "ks3" },
    { id: "sat-gcse-maths-higher", day: 6, start: "11:30", minutes: 60, subject: "maths", title: "GCSE maths, Higher tier", from: 11, to: 11, room: "r2", tutor: "owen", capacity: 6, enrolled: 5, fee: "gcse" },
    { id: "sat-alevel-english", day: 6, start: "12:30", minutes: 90, subject: "english", title: "A level English Literature", from: 12, to: 13, room: "r3", tutor: "kofi", capacity: 5, enrolled: 3, fee: "alevel" },
    { id: "sat-alevel-chemistry", day: 6, start: "13:00", minutes: 90, subject: "science", title: "A level chemistry", from: 12, to: 13, room: "r1", tutor: "farah", capacity: 5, enrolled: 4, fee: "alevel" }
  ],

  /* ---------- Terms ----------
     Term dates are worked out from these rules every time a page loads (js/terms.js), so the site always
     shows this term and the next. Group classes do not run in half-term weeks or on these bank holidays. */
  termRules: {
    autumnStartsOnOrAfter: [9, 4], // [month, day]: the first Monday on or after 4 September
    autumnEndsOnOrBefore: [12, 19], // the last Saturday on or before 19 December
    springStartsOnOrAfter: [1, 4], // the first Monday on or after 4 January
    springHalfTermOnOrAfter: [2, 12], // half-term: the week of the first Monday on or after 12 February
    summerEndsOnOrBefore: [7, 18], // the last Saturday on or before 18 July
    rebookWeeksBeforeEnd: 3 // current pupils keep their place for next term if they rebook by then
    // Autumn half-term: the week of the last Monday in October. Easter: two weeks off from the Monday
    // before Good Friday. Summer half-term: the week of the late May bank holiday.
  },
  // Other days with no classes in term time. Format YYYY-MM-DD.
  closed: {},

  /* ---------- Opening hours ----------
     1 = Monday ... 6 = Saturday, 0 = Sunday. null = closed. */
  centreHours: {
    1: ["15:45", "20:00"],
    2: ["15:45", "20:00"],
    3: ["15:45", "20:00"],
    4: ["15:45", "20:00"],
    5: ["15:45", "18:15"],
    6: ["08:45", "14:45"],
    0: null
  },
  officeHours: {
    1: ["10:00", "19:00"],
    2: ["10:00", "19:00"],
    3: ["10:00", "19:00"],
    4: ["10:00", "19:00"],
    5: ["10:00", "18:00"],
    6: ["09:00", "14:00"],
    0: null
  },
  holidayOfficeHours: ["10:00", "15:00"], // Monday to Friday in half-term and school holidays

  /* ---------- Example progress report ----------
     NOT A REAL PUPIL. Used only in the clearly labelled example on the home page. Scores are out of 20,
     from the same short topic checks at the start of the year and at the end of each term. */
  exampleReport: {
    pupil: "Example pupil, Year 10",
    subject: "GCSE maths, Higher tier",
    checks: ["Start of year", "End of autumn", "End of spring"],
    topics: [
      { name: "Number", scores: [11, 14, 16] },
      { name: "Algebra", scores: [6, 10, 14] },
      { name: "Ratio and proportion", scores: [9, 12, 13] },
      { name: "Geometry", scores: [8, 9, 13] },
      { name: "Probability and statistics", scores: [12, 15, 17] }
    ],
    outOf: 20,
    secureFrom: 15, // 15 or more = secure, 10 to 14 = getting there, under 10 = not yet
    gettingThereFrom: 10
  }
};
