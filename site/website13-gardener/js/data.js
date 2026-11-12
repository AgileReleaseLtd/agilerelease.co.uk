/* Hornbeam & Hoe: the garden year, visit plans, prices, projects, areas covered and contact details.
   Every page reads this one file, so a price, a postcode or a job's timing is changed here and nowhere else.

   SAMPLE SITE: Hornbeam & Hoe is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), the email uses the reserved .example domain, and the waste
   carrier and insurance details are marked as examples.

   Prices are in pounds and include VAT. */
window.Hornbeam = {
  // true = WhatsApp, phone and email buttons show what would happen instead of opening anything.
  sample: true,

  name: "Hornbeam & Hoe",
  whatsapp: "447700900269",
  mobile: "07700 900269",
  phone: "020 7946 0269",
  phoneLink: "+442079460269",
  email: "hello@hornbeamandhoe.example",
  yard: "Unit 4, Osier Yard, Carshalton SM5",

  // When the office answers the phone and WhatsApp. 1 = Monday ... 6 = Saturday, 0 = Sunday.
  hours: {
    1: ["07:30", "17:30"],
    2: ["07:30", "17:30"],
    3: ["07:30", "17:30"],
    4: ["07:30", "17:30"],
    5: ["07:30", "17:30"],
    6: ["08:00", "12:00"],
    0: null
  },

  // Days we don't work: [first day, last day, reason]. Format YYYY-MM-DD.
  closed: [
    ["2026-12-24", "2027-01-01", "Christmas break"],
    ["2027-03-26", "2027-03-29", "Easter"],
    ["2027-05-03", "2027-05-03", "Bank holiday"],
    ["2027-05-31", "2027-05-31", "Bank holiday"],
    ["2027-08-30", "2027-08-30", "Bank holiday"],
    ["2027-12-24", "2028-01-03", "Christmas break"]
  ],

  /* ---------- The garden year ----------
     Seasons follow the Met Office: spring is March to May, summer June to August, autumn September to
     November, winter December to February. The site picks the current one from today's date. */
  seasons: {
    spring: {
      name: "Spring", months: [3, 4, 5], title: "Waking the garden up",
      intro: "The grass starts growing, weeds race ahead and birds start nesting. We get lawns and borders going and keep hedges safe for nests.",
      jobs: [
        ["First cuts of the year", "Mowing starts in March with the blades set high, then lower as the grass gets going. We edge every cut."],
        ["Lawn feed and repairs", "A spring feed in April. Bare patches are seeded once the soil warms up, usually from mid-April."],
        ["Spring pruning", "Roses in early March. Buddleja and dogwoods cut hard in March. Shrubs that flowered in late winter are trimmed once they finish."],
        ["Weeding and mulching", "We clear beds and mulch them while the soil is still damp, so they hold water into summer."],
        ["Hedges, after a nest check", "Most birds nest from March to August, and the law protects active nests. We check every hedge before we cut and leave any part with a nest until the young have flown."],
        ["Planting", "Shrubs and perennials go in. Summer bedding waits until late May, when the frosts are over."]
      ]
    },
    summer: {
      name: "Summer", months: [6, 7, 8], title: "Keeping on top of it",
      intro: "Everything grows at once. Regular visits keep lawns, hedges and borders looking cared for, even when you're away.",
      jobs: [
        ["Weekly mowing", "In a dry spell we raise the blades and mow less often, so the grass stays green without a sprinkler."],
        ["Hedge cutting", "The main trim for most hedges is from late July to September. We still check for nests first: some birds nest into August."],
        ["Deadheading and tying in", "Keeps roses, salvias and bedding flowering for weeks longer."],
        ["Summer pruning", "Wisteria in July or August (and again in winter), lavender straight after flowering, trained apples and pears in August."],
        ["Holiday watering", "Going away? We water pots and new plants on your visit day, and can add extra visits in a heatwave."],
        ["Patios and paths", "Long dry days suit building work. Book summer patio jobs by spring if you can."]
      ]
    },
    autumn: {
      name: "Autumn", months: [9, 10, 11], title: "Leaves, lawns and planting",
      intro: "The best time of year to fix a lawn and plant almost anything. Leaves need clearing every week from October.",
      jobs: [
        ["Leaf clearance", "From October we clear leaves off lawns, paths and beds on every visit, before they smother the grass or make steps slippery."],
        ["Lawn renovation", "September is the month to scarify, aerate and overseed, while the soil is warm and the rain is back. An autumn feed follows."],
        ["New turf", "Autumn is the best time to lay turf. It roots in a few weeks without daily watering."],
        ["Spring bulbs", "Daffodils and crocuses in September and October. Tulips in November, when the cold helps keep disease away."],
        ["Bare-root planting", "Hedging, fruit trees and roses go in from November. Cheaper than pot-grown plants, and they root better."],
        ["Cutting back", "We cut back tired perennials but leave some seed heads standing for birds and insects over winter."]
      ]
    },
    winter: {
      name: "Winter", months: [12, 1, 2], title: "Pruning and repairs",
      intro: "Plants are dormant, so it's the time for structural work: pruning, hedge renovation, fences and planning next year.",
      jobs: [
        ["Winter pruning", "Apples and pears while they're dormant. Wisteria in January or February. Roses at the end of February."],
        ["Hedge renovation", "Overgrown beech, hornbeam and privet can be cut back hard now, before nesting starts in March."],
        ["Fence repairs", "Winter storms bring fences down. We replace panels and posts, and fit concrete posts if wooden ones keep rotting."],
        ["Bare-root planting", "Hedging, fruit trees and roses, whenever the ground isn't frozen or waterlogged."],
        ["Lawn care", "We keep off frozen or waterlogged lawns. In a mild, dry spell the grass gets a high trim."],
        ["Plan for spring", "A good time to plan a patio, a new border or a fence, so the work is booked before the spring rush."]
      ]
    }
  },

  /* Month by month: one value per month, January first. 2 = best time, 1 = can be done, 0 = not now.
     The home page draws this as a chart and highlights the current month. */
  yearGroups: [
    {
      name: "Lawns",
      jobs: [
        ["Mowing", [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0]],
        ["Scarify, aerate and overseed", [0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0]],
        ["Lawn feed", [0, 0, 1, 2, 1, 0, 0, 0, 2, 1, 0, 0]],
        ["New turf", [0, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 0]]
      ]
    },
    {
      name: "Hedges and pruning",
      jobs: [
        ["Hedge trimming (nest check March to August)", [0, 0, 0, 0, 1, 1, 2, 2, 2, 1, 0, 0]],
        ["Hard cutting back of overgrown hedges", [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2]],
        ["Winter pruning: fruit trees, wisteria, roses", [2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2]],
        ["Summer pruning: wisteria, lavender, trained fruit", [0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0]]
      ]
    },
    {
      name: "Beds and planting",
      jobs: [
        ["Leaf clearance", [1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2]],
        ["Spring bulbs", [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1]],
        ["Bare-root hedging, trees and roses", [2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2]],
        ["Pot-grown shrubs and perennials", [0, 1, 2, 2, 2, 1, 1, 1, 2, 2, 1, 0]],
        ["Mulching beds", [0, 1, 2, 2, 1, 0, 0, 0, 0, 1, 2, 0]]
      ]
    },
    {
      name: "Landscaping",
      jobs: [
        ["Patios and paths", [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0]],
        ["Fences and gates", [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]]
      ]
    }
  ],

  /* ---------- Regular-visit plans ----------
     The monthly price spreads the year's visits evenly over twelve months:
     monthly = per visit x visits a year / 12, rounded to the nearest pound. */
  sizes: {
    small: {
      name: "Small", area: "up to about 60 m²",
      text: "A typical terraced back garden: a small lawn, a border or two, maybe a patio."
    },
    medium: {
      name: "Medium", area: "about 60 to 200 m²",
      text: "A semi-detached garden: a proper lawn, borders on both sides, a hedge or a shed."
    },
    large: {
      name: "Large", area: "about 200 to 500 m²",
      text: "A detached garden: a big lawn, long borders, hedges and a few fruit trees."
    }
  },

  plans: {
    weekly: {
      name: "Weekly", visitsPerYear: 44,
      rhythm: "Every week from March to October, every two weeks from November to February.",
      perVisit: { small: 45, medium: 70, large: 115 },
      hours: { small: 1, medium: 1.5, large: 2.5 },
      every: [
        "Mow and edge the lawn",
        "Weed and hoe the beds",
        "Deadhead and tie in",
        "Sweep paths and the patio",
        "Clear leaves in autumn",
        "Take away all green waste"
      ],
      extras: ["Lawn feed in spring and autumn", "Two hedge trims a year, after a nest check", "Holiday watering on your visit day"],
      best: "For gardens you use every day, and lawns that should always look freshly cut."
    },
    fortnightly: {
      name: "Fortnightly", visitsPerYear: 22,
      rhythm: "Every two weeks from March to October, once a month from November to February.",
      perVisit: { small: 58, medium: 92, large: 150 },
      hours: { small: 1.25, medium: 2, large: 3.25 },
      every: [
        "Mow and edge the lawn",
        "Weed the beds",
        "Deadhead and light pruning",
        "Sweep paths and the patio",
        "Clear leaves in autumn",
        "Take away all green waste"
      ],
      extras: ["Two hedge trims a year, after a nest check"],
      best: "Our most popular plan. Keeps most gardens tidy without a visit every week.",
      popular: true
    },
    monthly: {
      name: "Monthly", visitsPerYear: 12,
      rhythm: "Once a month, all year round.",
      perVisit: { small: 90, medium: 145, large: 235 },
      hours: { small: 2, medium: 3, large: 5 },
      every: [
        "A full tidy: lawn cut and edged",
        "Beds weeded",
        "Shrubs trimmed into shape",
        "Leaves cleared, paths swept",
        "Take away all green waste"
      ],
      extras: [],
      best: "For low-maintenance gardens, or if you enjoy doing some of it yourself."
    }
  },

  /* ---------- One-off jobs and landscaping: guide prices ---------- */
  guides: [
    ["One-off garden tidy", "Two gardeners for half a day. Green waste taken away is extra", "from £360"],
    ["Hedge cutting", "Priced by length and height. A 10 m privet front hedge is about £150", "from £120"],
    ["New turf", "Old lawn lifted, ground levelled and fed, new turf laid", "from £32 a m²"],
    ["Patios and paths", "Sandstone or porcelain on a proper sub-base, including the base", "from £165 a m²"],
    ["Fence panel replaced", "Close-board panel and gravel board. Posts extra if they've gone", "from £165"],
    ["New close-board fence", "Concrete posts, gravel boards and timber panels, old fence taken away", "from £135 a metre"],
    ["Planting a border", "We plan it, buy the plants at trade price and plant it. Plants on top", "from £350"],
    ["Green waste only", "Taken away in our van to a licensed composting site", "£45 a bag (1 m³)"]
  ],

  /* ---------- Areas we cover ----------
     status "all" = regular visits and one-off jobs. "projects" = one-off jobs and landscaping only.
     "part" = some of the district, so we ask for the full postcode.
     x and y place the district on the ring map (Carshalton at 0, 0; one unit is roughly a mile). */
  areas: {
    SM5: { name: "Carshalton", status: "all", x: 0, y: 0, home: true },
    SM6: { name: "Wallington", status: "all", x: 1.7, y: 0.6 },
    SM1: { name: "Sutton", status: "all", x: -1.5, y: 0.1 },
    SM2: { name: "Belmont and South Sutton", status: "all", x: -1.2, y: 1.8 },
    SM3: { name: "Cheam and North Cheam", status: "all", x: -2.8, y: 0.3 },
    SM4: { name: "Morden", status: "all", x: -1.2, y: -2.2 },
    CR4: { name: "Mitcham", status: "all", x: 1.3, y: -2.4 },
    KT4: { name: "Worcester Park", status: "projects", x: -3.9, y: -1.2 },
    SW19: { name: "Wimbledon", status: "projects", x: -2.7, y: -3.9 },
    KT17: { name: "Ewell", status: "projects", x: -4.2, y: 2.4 },
    SM7: { name: "Banstead", status: "projects", x: -0.8, y: 4.2 },
    CR5: { name: "Coulsdon", status: "projects", x: 2.2, y: 4.4 },
    CR8: { name: "Purley and Kenley", status: "projects", x: 3.6, y: 2.6 },
    CR0: { name: "Croydon (Beddington and Waddon side)", status: "part", x: 4.0, y: -0.4 },
    SW16: { name: "Norbury and Streatham", status: "projects", x: 3.0, y: -3.6 }
  },

  /* ---------- Project gallery ----------
     Each project has two drawings in img/projects/ (<id>-before.svg and <id>-after.svg). On the real site
     these are the firm's own before-and-after photos. */
  projectTypes: {
    patio: "Patios and paths",
    planting: "Planting",
    lawn: "Lawns",
    fencing: "Fencing"
  },

  projects: [
    {
      id: "patio-sandstone", type: "patio", area: "Carshalton Beeches", days: "5 days",
      title: "Sandstone patio by the back door",
      text: "Cracked concrete slabs lifted and taken away. New sub-base, Indian sandstone laid in a random pattern, and a low lavender bed along the lawn edge.",
      before: "Garden plan before: cracked, mossy concrete slabs by the house with weeds in the joints, a patchy lawn and a weedy border.",
      after: "Garden plan after: a sandstone patio in mixed sizes with a table and chairs, a lavender bed along the lawn, a striped lawn and a planted border."
    },
    {
      id: "patio-path", type: "patio", area: "Wallington", days: "4 days",
      title: "Stepping-stone path and seating circle",
      text: "A muddy short cut across the lawn turned into a porcelain stepping-stone path, ending in a paved circle with a curved bench. Old shed and brambles cleared.",
      before: "Garden plan before: a worn muddy track across the lawn to an overgrown corner with brambles and a broken shed.",
      after: "Garden plan after: porcelain stepping stones crossing a striped lawn to a round paved seating area with a curved bench, ringed by shrubs."
    },
    {
      id: "planting-shade", type: "planting", area: "Sutton", days: "3 days",
      title: "Shady border under a sycamore",
      text: "Ivy and bramble dug out, soil improved and mulched, then planted for dry shade: hostas, hellebores and Japanese anemones, with a bench under the tree.",
      before: "Garden plan before: a big tree over a border of bare soil, ivy and brambles, with thin grass beneath.",
      after: "Garden plan after: the border planted with hostas, hellebores and anemones in dark mulch, stepping stones and a bench under the tree."
    },
    {
      id: "planting-bees", type: "planting", area: "Cheam", days: "2 days",
      title: "Front garden for bees",
      text: "Weedy gravel and a cracked path replaced with a brick path, a timber bin store, and a gravel garden of lavender, salvias and alliums.",
      before: "Front garden plan before: weedy gravel, a cracked concrete path and three wheelie bins in view.",
      after: "Front garden plan after: a brick path to the door, a timber bin store, and gravel planted with lavender, salvias and alliums."
    },
    {
      id: "lawn-new", type: "lawn", area: "Morden", days: "3 days",
      title: "New lawn after an extension",
      text: "Builders' rubble cleared and the compacted ground broken up. Topsoil, levelling, new turf, a steel edge and a narrow planted border.",
      before: "Garden plan before: bare compacted mud with rubble heaps, tyre tracks and a puddle where the skip stood.",
      after: "Garden plan after: a new striped lawn with a crisp steel edge, a gravel strip by the house and young shrubs along the fences."
    },
    {
      id: "lawn-rescue", type: "lawn", area: "North Cheam", days: "2 visits",
      title: "Mossy lawn brought back",
      text: "Scarified, aerated and overseeded in September, the edge recut into a smooth curve and the borders replanted. Kept on our fortnightly plan since.",
      before: "Garden plan before: a lawn with moss, bare brown patches, dandelions and ragged edges spilling into weedy beds.",
      after: "Garden plan after: an even striped lawn with a smooth curved edge, and borders of shrubs, lavender and flowers all round."
    },
    {
      id: "fence-closeboard", type: "fencing", area: "Mitcham", days: "2 days",
      title: "Storm-damaged fence replaced",
      text: "Three close-board panels after a storm: one leaning, one in pieces, a post snapped at the base. Now concrete posts, gravel boards and new panels.",
      before: "Fence drawing before: grey weathered panels, one leaning over, one broken with boards on the ground, and a snapped post.",
      after: "Fence drawing after: three new close-board panels between concrete posts on gravel boards, with climbers and shrubs in front."
    },
    {
      id: "fence-slatted", type: "fencing", area: "Belmont", days: "3 days",
      title: "Slatted screen and side gate",
      text: "Sagging chain-link and a rotten gate swapped for a horizontal slatted fence on steel posts, with a matching gate and new planting at the foot.",
      before: "Fence drawing before: sagging chain-link between leaning concrete posts and a rotten, dropped wooden gate.",
      after: "Fence drawing after: a horizontal slatted fence on dark posts with a matching slatted gate, grasses and alliums in front."
    }
  ],

  /* ---------- Quote form choices ---------- */
  jobTypes: {
    regular: "Regular visits",
    tidy: "One-off tidy or clearance",
    hedge: "Hedge cutting",
    leaves: "Leaf clearance",
    pruning: "Pruning",
    lawn: "Lawn care or new turf",
    patio: "Patio or path",
    fencing: "Fence or gate",
    planting: "Planting or a new border",
    other: "Something else"
  },

  access: {
    side: "Side gate or side path",
    house: "Through the house",
    back: "Back gate or alley",
    front: "Front garden only"
  },

  waste: {
    remove: "Please take it away",
    bin: "Leave it in my garden waste bin",
    unsure: "Not sure yet"
  },

  timing: {
    soon: "As soon as you can",
    month: "In the next month",
    season: "Next season is fine",
    flexible: "I'm flexible"
  }
};
