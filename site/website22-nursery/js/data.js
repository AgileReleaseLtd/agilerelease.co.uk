/* Button Tin Nursery: rooms, sessions, fees, funded hours, the day, the team, closures and contact details.
   Every page reads this one file, so a price, a closure or a person is changed here and nowhere else.

   SAMPLE SITE: Button Tin Nursery is made up, and so are its people, prices and address. The phone and
   WhatsApp numbers are in Ofcom's ranges kept for drama (020 7946 0xxx and 07700 900xxx), and the email uses
   the reserved .example domain. The Ofsted panel is an example with no real grade or URN.

   The funded-hours rules, Tax-Free Childcare figures, EYFS areas and Ofsted evaluation areas are real. They
   were checked on GOV.UK, Best Start in Life (which replaced the Childcare Choices website) and Ofsted on
   10 November 2026. README.md lists the sources. Check them again before reusing this file for a real nursery. */
window.ButtonTin = {
  // true = WhatsApp, phone and email buttons explain what they would do instead of opening them.
  sample: true,

  name: "Button Tin Nursery",
  short: "Button Tin",
  whatsapp: "447700900283",
  mobile: "07700 900283",
  phone: "020 7946 0283",
  phoneLink: "+442079460283",
  email: "hello@buttontin.example",
  address: "14 Teasel Grove, Wanstead, London E11",
  mapsQuery: "Wanstead, London E11",

  // Opening hours. 1 = Monday ... 5 = Friday. Times are 24-hour "HH:MM". Closed at weekends.
  hours: { days: [1, 2, 3, 4, 5], open: "08:00", close: "18:00" },
  // Weeks a year we are open (closed for bank holidays and between Christmas and New Year).
  weeksOpen: 51,

  // Days the nursery is shut: bank holidays in England, our Christmas closure and one staff training day a
  // year. Format YYYY-MM-DD. Bank holidays and closures are not charged.
  closed: {
    "2026-12-24": "Christmas closure", "2026-12-25": "Christmas Day", "2026-12-28": "Boxing Day (substitute day)",
    "2026-12-29": "Christmas closure", "2026-12-30": "Christmas closure", "2026-12-31": "Christmas closure",
    "2027-01-01": "New Year's Day", "2027-02-19": "Staff training day", "2027-03-26": "Good Friday",
    "2027-03-29": "Easter Monday", "2027-05-03": "Early May bank holiday", "2027-05-31": "Spring bank holiday",
    "2027-08-30": "Summer bank holiday", "2027-12-24": "Christmas closure",
    "2027-12-27": "Christmas Day (substitute day)", "2027-12-28": "Boxing Day (substitute day)",
    "2027-12-29": "Christmas closure", "2027-12-30": "Christmas closure", "2027-12-31": "Christmas closure",
    "2028-01-03": "New Year's Day (substitute day)", "2028-02-18": "Staff training day",
    "2028-04-14": "Good Friday", "2028-04-17": "Easter Monday", "2028-05-01": "Early May bank holiday",
    "2028-05-29": "Spring bank holiday", "2028-08-28": "Summer bank holiday", "2028-12-25": "Christmas Day",
    "2028-12-26": "Boxing Day", "2028-12-27": "Christmas closure", "2028-12-28": "Christmas closure",
    "2028-12-29": "Christmas closure"
  },

  /* ---------- Rooms ----------
     fromMonths/toMonths: the age range in months. rate: our hourly rate in pounds. nappies: most children
     in this room are in nappies. Ratios are the legal minimum in the EYFS; we often have an extra adult. */
  rooms: [
    {
      id: "bobbins", name: "Bobbins", kind: "Baby room", ages: "6 months to 2 years", fromMonths: 6, toMonths: 24,
      places: 9, ratio: "1 adult to every 3 babies", rate: 9.2, nappies: true,
      blurb: "A calm, sunny room on the ground floor with its own sleep room and a little garden just for babies. Babies keep their own routines for feeds and naps."
    },
    {
      id: "thimbles", name: "Thimbles", kind: "Toddler room", ages: "2 to 3 years", fromMonths: 24, toMonths: 36,
      places: 15, ratio: "1 adult to every 5 children", rate: 8.8, nappies: true,
      blurb: "Busy, messy and full of words. Lots of sand, water, paint and singing, and gentle help with potty training when your child is ready."
    },
    {
      id: "patchwork", name: "Patchwork", kind: "Pre-school room", ages: "3 to 5 years", fromMonths: 36, toMonths: 60,
      places: 16, ratio: "1 adult to every 8 children", rate: 8.4, nappies: false,
      blurb: "Bigger projects, longer stories and first steps in sounds and numbers, so children feel ready and proud when they start Reception."
    }
  ],

  /* ---------- Sessions ----------
     hours: care hours in the session. meals: the optional food charge for the session, in pounds. */
  sessions: {
    full: { name: "Full day", short: "Full day", from: "08:00", to: "18:00", hours: 10, meals: 7.5, food: "breakfast, lunch, tea and two snacks" },
    am: { name: "Morning", short: "Morning", from: "08:00", to: "13:00", hours: 5, meals: 4.5, food: "breakfast, a snack and lunch" },
    pm: { name: "Afternoon", short: "Afternoon", from: "13:00", to: "18:00", hours: 5, meals: 3, food: "a snack and tea" }
  },

  /* ---------- Optional extras (chargeable extras) ----------
     All of these are optional for every family. Funded hours never depend on paying for them. */
  extras: [
    { id: "meals", name: "Food", price: "£7.50 a full day, £4.50 a morning, £3 an afternoon", what: "Everything our cook makes for your child that day: breakfast, lunch, tea and snacks, depending on the session.", instead: "Send a packed breakfast, lunch or tea instead. We store it in the fridge and serve it at the table with everyone else." },
    { id: "nappies", name: "Nappies, wipes and cream", price: "£2 a day", what: "Nappies, wipes and nappy cream from us, for children in nappies.", instead: "Bring your own and we keep them in your child's named basket." },
    { id: "music", name: "Music with a visiting teacher", price: "£4.50 a session", what: "A 30-minute music class on Wednesday mornings in Thimbles and Patchwork, led by a visiting music teacher.", instead: "Children who don't join have songs and music with their key person at the same time, as part of the normal day." },
    { id: "trips", name: "Trips", price: "We tell you the cost before each trip", what: "The odd outing, such as a farm visit in summer, which has an entry fee or a coach.", instead: "Say no and your child stays at nursery and has a normal day with their friends." }
  ],
  // What we never charge for. Shown on the fees page.
  neverCharge: [
    "a registration fee or a deposit",
    "a top-up on funded hours, or an \"enrichment\", \"sustainability\" or other general fee",
    "paint, paper, books, toys or anything else children learn with",
    "sun cream, tissues, or the cost of running the nursery",
    "extra support for children with special educational needs or disabilities during funded hours",
    "bank holidays or days we are closed"
  ],

  /* ---------- Funded hours in England ----------
     Checked on GOV.UK and Best Start in Life on 10 November 2026 (see README.md for the pages). */
  funding: {
    checked: "10 November 2026",
    termWeeks: 38,
    stretchWeeks: 51, // we stretch funded hours over the weeks we are open
    tfc: { topUpRate: 0.2, capPerQuarter: 500, capPerQuarterDisabled: 1000 },
    // Which schemes the calculator offers for each age band. hours: funded hours a week over 38 weeks.
    schemes: {
      none: { name: "No funded hours", hours: 0 },
      two: { name: "15 hours: Early Learning for 2 year olds", hours: 15, note: "For families who get extra support, such as Universal Credit, or children with an Education, Health and Care plan. Ask your local council." },
      universal: { name: "15 hours: for all 3 and 4 year olds", hours: 15, note: "Every 3 and 4 year old in England, whatever your income. Starts the term after your child turns 3." },
      working: { name: "30 hours: for eligible working parents", hours: 30, note: "From the term after your child turns 9 months, if you (and any partner) work and earn enough. Apply on GOV.UK for a code." }
    },
    ages: [
      { id: "baby", label: "6 to 8 months", room: "bobbins", schemes: ["none"], note: "Funded hours for working parents start the term after your baby turns 9 months. You can apply for your code up to 16 weeks before." },
      { id: "infant", label: "9 months to 2 years", room: "bobbins", schemes: ["none", "working"] },
      { id: "two", label: "2 years", room: "thimbles", schemes: ["none", "two", "working"] },
      { id: "three", label: "3 or 4 years", room: "patchwork", schemes: ["universal", "working", "none"] }
    ],
    sources: [
      { name: "Free childcare if you're working (GOV.UK)", url: "https://www.gov.uk/free-childcare-if-working" },
      { name: "15 and 30 hours support (Best Start in Life, formerly Childcare Choices)", url: "https://beststartinlife.gov.uk/childcare-early-years-education/15-and-30-hours-support/" },
      { name: "Tax-Free Childcare (GOV.UK)", url: "https://www.gov.uk/tax-free-childcare" },
      { name: "Early education and childcare: statutory guidance, valid from 1 April 2026 (GOV.UK)", url: "https://www.gov.uk/government/publications/early-education-and-childcare--2" }
    ]
  },

  /* ---------- EYFS: the seven areas of learning and development ----------
     From the EYFS statutory framework for group and school-based providers (from 1 September 2026). */
  eyfs: [
    { id: "cl", name: "Communication and language", prime: true, tone: "sky", what: "Listening, understanding and talking: back-and-forth chats, songs, rhymes and lots of new words." },
    { id: "pd", name: "Physical development", prime: true, tone: "peach", what: "Big movements like climbing and running, and small ones like holding a spoon, a crayon or a zip." },
    { id: "psed", name: "Personal, social and emotional development", short: "Personal, social and emotional", prime: true, tone: "rose", what: "Feeling safe, making friends, taking turns, managing feelings and looking after themselves." },
    { id: "lit", name: "Literacy", prime: false, tone: "lav", what: "A love of books and stories, then sounds, letters and early mark-making." },
    { id: "maths", name: "Mathematics", prime: false, tone: "sun", what: "Counting, shapes, patterns, sizes and comparing: more, fewer, heavier, longer." },
    { id: "utw", name: "Understanding the world", prime: false, tone: "sage", what: "People, places, nature and the community: seasons, minibeasts, cooking, and the world beyond Wanstead." },
    { id: "ead", name: "Expressive arts and design", prime: false, tone: "berry", what: "Painting, building, music, dance and pretend play, with their own ideas." }
  ],

  /* ---------- A typical day ----------
     time: when it starts ("HH:MM"). rooms: what is different in a room (bobbins, thimbles, patchwork).
     areas: the EYFS areas this part of the day builds most. icon: a symbol id in the page sprite. tone: its colour.
     now: how the home page says it ("Right now: lunch is being served"). */
  day: [
    {
      id: "arrival", time: "08:00", title: "Arrival", icon: "i-door", tone: "peach",
      now: "children are arriving, hanging up coats and saying hello",
      text: "Drop-off any time from 8am. Coats on pegs, a wave at the window, and a hand-over with your child's key person.",
      rooms: {
        bobbins: "Drop-off any time from 8am. You tell your baby's key person how they slept, when they last fed and anything new, and we write it down.",
        patchwork: "Drop-off any time from 8am. Children find their name card, hang up their own coat and choose where to start."
      },
      learn: "Saying goodbye to a grown-up and hello to a friend, and the confidence that comes from a familiar routine.",
      areas: ["psed", "cl"]
    },
    {
      id: "breakfast", time: "08:15", title: "Breakfast", icon: "i-bowl", tone: "sun",
      now: "breakfast is on the tables",
      text: "Porridge, cereal, toast and fruit, served until 9am at small tables, with the grown-ups sitting down too.",
      rooms: {
        bobbins: "Bottles or breakfast at your baby's own pace, on a lap or in a low chair, with a key person facing them.",
        patchwork: "Children pour their own milk, spread their own toast and clear their own bowls."
      },
      learn: "Using a spoon and cup, pouring and spreading, trying new tastes, and chatting at the table.",
      areas: ["pd", "psed", "cl"]
    },
    {
      id: "play", time: "09:00", title: "Free play", icon: "i-blocks", tone: "lav",
      now: "free play: blocks, sand, the home corner and books",
      text: "Children choose from the home corner, blocks, sand and water, books, puzzles and the craft table. A fruit snack comes round at 10.",
      rooms: {
        bobbins: "Treasure baskets, soft play, mirrors, books to chew and lots of floor time with a grown-up close by.",
        thimbles: "Sand, water, dough, the home corner and the train track, with grown-ups joining in and adding words."
      },
      learn: "Following their own ideas, solving small problems, building, counting and talking about what they are doing.",
      areas: ["cl", "maths", "utw", "ead"]
    },
    {
      id: "outdoors", time: "10:15", title: "Outdoor time", icon: "i-boot", tone: "sage",
      now: "everyone is out in the garden",
      text: "Out in the garden every day, in all weathers: the mud kitchen, bikes, digging, planting and the climbing frame. Some days we walk to the park.",
      rooms: {
        bobbins: "Crawling and toddling on the grass, the baby garden's sensory path, and buggy walks to look at ducks on the pond.",
        patchwork: "Den building, ball games, growing vegetables and our Friday walk to Wanstead Flats and the woods."
      },
      learn: "Running, climbing and balancing, noticing weather and minibeasts, and taking safe risks.",
      areas: ["pd", "utw", "cl"]
    },
    {
      id: "lunch", time: "11:30", title: "Lunch", icon: "i-plate", tone: "rose",
      now: "lunch is being served",
      text: "A hot lunch cooked in our kitchen that morning, eaten together family-style. Children serve themselves when they are ready to.",
      rooms: {
        bobbins: "Purées, mashed or finger food, depending on where your baby is with weaning. We follow what you do at home."
      },
      learn: "Feeding themselves, trying new food, table manners and good conversation.",
      areas: ["pd", "psed", "cl"]
    },
    {
      id: "nap", time: "12:30", title: "Nap and quiet time", icon: "i-moon", tone: "sky",
      now: "nap and quiet time, so the lights are down",
      text: "Sleep or rest after lunch, with the lights down and soft music. Nobody is made to sleep, and nobody is woken for the sake of a timetable unless you ask us to.",
      rooms: {
        bobbins: "Babies sleep when they need to, on their backs in their own cot in the sleep room, always within sight and hearing of a grown-up.",
        thimbles: "Low beds with their own blanket and comforter, and a grown-up stroking backs.",
        patchwork: "A rest on cushions with stories and calm music. Most pre-schoolers no longer nap, but anyone who is tired can."
      },
      learn: "Rest is part of learning. Children learn to settle themselves and listen to their own bodies.",
      areas: ["psed", "pd"]
    },
    {
      id: "activities", time: "14:00", title: "Activities", icon: "i-brush", tone: "berry",
      now: "small-group time: painting, music and stories",
      text: "Small-group time with the key person: painting, music, cooking, stories and counting games.",
      rooms: {
        bobbins: "Messy play, songs with actions, board books and peekaboo, one or two babies at a time.",
        patchwork: "Projects that run for days, a phonics game, counting and shapes, and getting ready for school."
      },
      learn: "Listening, joining in, making marks, exploring paint and sound, and first steps in letters and numbers.",
      areas: ["lit", "maths", "ead", "cl"]
    },
    {
      id: "tea", time: "15:45", title: "Tea", icon: "i-cup", tone: "sun",
      now: "tea time",
      text: "A light tea: soup, sandwiches, pasta or something on toast, with fruit. Water and milk are always on hand.",
      learn: "Feeding themselves, sharing, and talking about the day.",
      areas: ["pd", "psed"]
    },
    {
      id: "home", time: "16:30", title: "Home time", icon: "i-house", tone: "peach",
      now: "stories and quiet play while parents arrive",
      text: "Stories, quiet play and the garden on light evenings until you arrive. Collection any time until 6pm, with a chat about the day.",
      rooms: {
        bobbins: "You get a written note of feeds, sleeps and nappies, and a chat with the key person at hand-over."
      },
      learn: "Telling a grown-up about their day, and saying goodbye to friends until tomorrow.",
      areas: ["cl", "psed"]
    }
  ],

  /* ---------- Lunch menu ----------
     A three-week menu. The fees page and the day page show this week's lunches. */
  menu: [
    ["Chicken and sweet potato casserole with rice", "Lentil and vegetable shepherd's pie", "Salmon fishcakes, peas and new potatoes", "Bean chilli with jacket potato and yoghurt", "Vegetable risotto with cheese"],
    ["Turkey meatballs in tomato sauce with pasta", "Chickpea and spinach curry with rice", "Fish pie with broccoli", "Roast chicken, potatoes and carrots", "Homemade pizza with salad"],
    ["Beef and vegetable stew with mash", "Macaroni cheese with cauliflower", "Cod and tomato bake with couscous", "Lamb and apricot tagine with rice", "Vegetable and bean soup with bread"]
  ],

  /* ---------- Team ----------
     Made up for the sample. Qualification levels are described in general terms (level 2 to level 6). */
  team: [
    { initials: "BA", name: "Bryony Ashworth", role: "Nursery manager", roleTag: "Designated safeguarding lead", tone: "peach", level: "Early years teacher (level 6)", bio: "Bryony opened Button Tin in a house she used to walk past on the school run. She has worked with under-fives for 19 years and still reads the best stories." },
    { initials: "KA", name: "Kwame Asante", role: "Deputy manager", roleTag: "Deputy safeguarding lead", tone: "sage", level: "Early years (level 5)", bio: "Kwame runs the rota, the garden and the Friday walks. He is the person to ask about funded hours and invoices." },
    { initials: "LP", name: "Lidia Popescu", role: "Bobbins room leader", roleTag: "Baby room", tone: "rose", level: "Early years educator (level 3)", bio: "Lidia has looked after babies for 12 years. Calm, unhurried, and very good at getting wind up." },
    { initials: "SV", name: "Sunita Varma", role: "Thimbles room leader", roleTag: "Toddler room", tone: "sun", level: "Early years educator (level 3)", bio: "Sunita has a song for everything, including putting wellies on. She leads our potty-training plans with parents." },
    { initials: "CB", name: "Ciara Brennan", role: "Patchwork room leader", roleTag: "SENCo", tone: "lav", level: "Early years (level 5), SENCo trained", bio: "Ciara leads the pre-school and is our special educational needs co-ordinator, working with families, health visitors and schools." },
    { initials: "DP", name: "Desmond Pike", role: "Cook", roleTag: "Kitchen", tone: "sky", level: "Food hygiene (level 3), allergy trained", bio: "Desmond cooks everything from fresh each morning and knows every child's allergies and favourites by heart." }
  ],
  teamNote: "Plus nine practitioners at level 2 and level 3, and two apprentices. Every room has staff with a full paediatric first aid certificate at all times.",

  /* ---------- Show-round visits ----------
     The days and times we show families round. 2 = Tuesday, 4 = Thursday. Offered from tomorrow,
     for this many days ahead. */
  showRounds: { days: { 2: ["09:30", "14:00"], 4: ["09:30", "14:00"] }, daysAhead: 21 },

  // "How did you hear about us?" on the waiting-list form.
  heardFrom: ["A friend or family member", "Walking past", "A local parents' group", "A search engine", "The council's Family Information Service", "Our noticeboard at the library", "Somewhere else"]
};
