/* Kember & Daughter: projects, price guides, quote questions, payment stages and contact details. Every
   page reads this one file, so a price or a project is changed here and nowhere else.

   SAMPLE SITE: Kember & Daughter is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), the email uses the reserved .example domain, and the project
   pictures are drawings standing in for the firm's own photos. */
window.Kember = {
  // true = quote and contact buttons show what would happen instead of opening WhatsApp, the phone or email.
  sample: true,

  name: "Kember & Daughter",
  whatsapp: "447700900857",
  phone: "020 7946 0857",
  phoneLink: "+442079460857",
  email: "hello@kemberanddaughter.example",
  address: "4 Kilnworth Lane, Beckenham BR3",
  founded: 1998,

  // Our next free start date for a build is about this many weeks away. The site turns it into a month.
  leadWeeks: 11,
  // A written quote follows the first visit within this many working days.
  quoteDays: 10,

  // Office hours (phones and WhatsApp), London time. 1 = Monday ... 6 = Saturday, 0 = Sunday.
  hours: {
    1: ["08:00", "17:30"], 2: ["08:00", "17:30"], 3: ["08:00", "17:30"], 4: ["08:00", "17:30"],
    5: ["08:00", "17:30"], 6: ["09:00", "12:00"], 0: null
  },
  closed: {
    "2026-12-25": "Christmas Day",
    "2026-12-26": "Boxing Day",
    "2026-12-28": "Bank holiday",
    "2027-01-01": "New Year's Day"
  },

  // Postcode districts we work in most weeks. Anywhere else gets a "bit further out" note, not a refusal.
  usualAreas: ["BR1", "BR2", "BR3", "BR4", "BR7", "SE6", "SE20", "SE26", "CR0"],

  // The project types. guide: rough London price ranges in pounds, including VAT, keyed by the answer that
  // changes the price most (guideBy). photos: what to send us on WhatsApp after the quote request.
  types: {
    extension: {
      name: "Extension",
      plural: "Extensions",
      icon: "i-extension",
      guideBy: "kind",
      guide: {
        side: { label: "Side-return extension", low: 55000, high: 90000 },
        rear: { label: "Single-storey rear extension", low: 65000, high: 120000 },
        wrap: { label: "Wraparound extension", low: 100000, high: 170000 },
        two: { label: "Two-storey extension", low: 130000, high: 220000 }
      },
      guideNote: "About £3,200 to £4,200 per m² for the building work, finished and decorated. The kitchen itself is extra.",
      weeks: "10 to 16 weeks on site",
      photos: "the room you want to extend, the back of the house from the garden, and the side alley if there is one"
    },
    loft: {
      name: "Loft conversion",
      plural: "Loft conversions",
      icon: "i-loft",
      guideBy: "kind",
      guide: {
        rooflight: { label: "Roof windows only (no dormer)", low: 45000, high: 62000 },
        dormer: { label: "Rear dormer", low: 60000, high: 85000 },
        hip: { label: "Hip-to-gable with a rear dormer", low: 72000, high: 98000 },
        lshape: { label: "L-shaped dormer", low: 78000, high: 110000 },
        mansard: { label: "Mansard", low: 90000, high: 135000 }
      },
      guideNote: "Includes the stairs, fire doors, a shower room and walls ready to decorate. Fitted wardrobes are extra.",
      weeks: "8 to 12 weeks on site",
      photos: "the loft through the hatch, the landing below it, and the roof from the street and from the garden"
    },
    kitchen: {
      name: "Kitchen",
      plural: "Kitchens",
      icon: "i-kitchen",
      guideBy: "scope",
      guide: {
        same: { label: "New kitchen, same layout", low: 22000, high: 40000 },
        layout: { label: "New kitchen, new layout", low: 30000, high: 50000 },
        knock: { label: "Knock-through and new kitchen", low: 40000, high: 70000 }
      },
      guideNote: "Includes mid-range units and worktops, plumbing, electrics, plastering, flooring and tiling. Appliances are extra. If you buy the units yourself, fitting and building work start at about £9,000.",
      weeks: "3 to 6 weeks on site",
      photos: "the kitchen from each corner, and the wall you might want to take out"
    },
    bathroom: {
      name: "Bathroom",
      plural: "Bathrooms",
      icon: "i-bathroom",
      guideBy: "room",
      guide: {
        wc: { label: "Toilet or cloakroom", low: 6000, high: 10000 },
        family: { label: "Family bathroom", low: 12000, high: 20000 },
        ensuite: { label: "En-suite shower room", low: 11000, high: 19000 },
        wetroom: { label: "Wet room", low: 15000, high: 26000 }
      },
      guideNote: "Includes mid-range fittings, tiling, the plumbing and the electrics.",
      weeks: "2 to 3 weeks on site",
      photos: "the room from the door, the floor, and where the pipes run if you can see them"
    },
    refurb: {
      name: "Refurbishment",
      plural: "Refurbishments",
      icon: "i-refurb",
      guideBy: "property",
      guide: {
        flat: { label: "Flat, two bedrooms", low: 55000, high: 100000 },
        house: { label: "House, three bedrooms", low: 140000, high: 250000 },
        front: { label: "Front of a period house (windows, brickwork, path)", low: 18000, high: 40000 }
      },
      guideNote: "A full refurbishment means rewiring, new heating, plastering, floors and decoration. Every one is different, so we price it room by room.",
      weeks: "6 to 20 weeks on site",
      photos: "each room, the fuse box, the boiler, and anything you already know is a problem"
    },
    other: {
      name: "Something else",
      plural: "Other work",
      icon: "i-pencil",
      guideBy: null,
      guide: {},
      guideNote: "Tell us what you have in mind and we will give you an honest idea of cost at the visit.",
      weeks: "",
      photos: "whatever you want us to look at"
    }
  },

  // Fees that sit outside the building price. Rough London figures, including VAT.
  fees: [
    { label: "Our drawings (existing and proposed plans, elevations and sections)", value: "from £2,200" },
    { label: "Structural engineer's calculations", value: "about £900 to £2,000" },
    { label: "Building control fees", value: "about £900 to £1,800" },
    { label: "Party wall surveyors, if a neighbour wants one", value: "about £1,000 to £1,800 per neighbour" },
    { label: "Planning or lawful development certificate application", value: "the council's set fee" }
  ],

  // Quote form: the questions that change with the project type. type "choice" = radio buttons,
  // "select" = drop-down, "multi" = tick boxes, "text" = a box to write in. msg = the label in the message.
  questions: {
    extension: [
      { id: "kind", label: "What kind of extension?", msg: "Extension type", type: "choice", options: [
        ["side", "Side return", "Along the side of the kitchen"],
        ["rear", "Rear", "Out into the garden"],
        ["wrap", "Wraparound", "Side and rear together"],
        ["two", "Two storeys", "Upstairs as well"],
        ["unsure", "Not sure yet", "We can talk it through"]
      ] },
      { id: "size", label: "Rough size of the new space", msg: "Rough size", type: "select", hint: "Length times width: 3 m by 5 m is 15 m². A guess is fine.", options: [
        ["s", "Up to 15 m²"], ["m", "15 to 25 m²"], ["l", "25 to 40 m²"], ["xl", "Over 40 m²"], ["unsure", "Not sure"]
      ] },
      { id: "house", label: "The property", msg: "Property", type: "select", options: [
        ["terrace", "Terraced house"], ["semi", "Semi-detached house"], ["detached", "Detached house"],
        ["bungalow", "Bungalow"], ["flat", "Flat or maisonette"]
      ], notes: { flat: "Flats and maisonettes have no permitted development rights, so an extension to one always needs planning permission, and usually the freeholder's consent too." } },
      { id: "kitchen", label: "A new kitchen in it as well?", msg: "Kitchen", type: "select", options: [
        ["us", "Yes, supplied and fitted by you"], ["mine", "Yes, but I'm buying the kitchen myself"], ["no", "No"], ["unsure", "Not sure yet"]
      ] }
    ],
    loft: [
      { id: "kind", label: "What kind of loft conversion?", msg: "Loft type", type: "choice", options: [
        ["rooflight", "Roof windows only", "No dormer, the roof keeps its shape"],
        ["dormer", "Rear dormer", "A box out of the back slope"],
        ["hip", "Hip-to-gable", "For a sloping side roof, usually with a dormer"],
        ["lshape", "L-shaped dormer", "Over the back addition too"],
        ["mansard", "Mansard", "Steep sides front and back"],
        ["unsure", "Not sure yet", "We can tell you what fits"]
      ] },
      { id: "house", label: "The property", msg: "Property", type: "select", options: [
        ["terrace", "Terraced house"], ["semi", "Semi-detached house"], ["detached", "Detached house"], ["bungalow", "Bungalow"]
      ] },
      { id: "use", label: "What will the loft be?", msg: "The loft will be", type: "select", options: [
        ["ensuite", "A bedroom with a shower room"], ["bedroom", "A bedroom"], ["office", "An office or study"], ["unsure", "Not sure yet"]
      ] },
      { id: "height", label: "Height of the loft at its highest point", msg: "Loft height", type: "select", hint: "From the top of the ceiling joists to the underside of the ridge. Most conversions need about 2.2 m.", options: [
        ["unmeasured", "Not measured"], ["over", "Over 2.4 m"], ["mid", "2.2 to 2.4 m"], ["under", "Under 2.2 m"]
      ] }
    ],
    kitchen: [
      { id: "scope", label: "What do you have in mind?", msg: "Kitchen work", type: "choice", options: [
        ["same", "New kitchen", "Same layout"],
        ["layout", "New layout", "Moving the sink or the cooker"],
        ["knock", "Knock through", "Open up into another room"],
        ["unsure", "Not sure yet", "Help us decide"]
      ] },
      { id: "units", label: "The units", msg: "Units", type: "select", options: [
        ["us", "Supplied and fitted by you"], ["mine", "I've chosen them, you fit them"], ["help", "Help me choose"]
      ] },
      { id: "size", label: "Size of the room", msg: "Room size", type: "select", options: [
        ["s", "Small, up to 8 m²"], ["m", "Medium, 8 to 15 m²"], ["l", "Large, over 15 m²"], ["unsure", "Not sure"]
      ] }
    ],
    bathroom: [
      { id: "room", label: "Which room?", msg: "Room", type: "choice", options: [
        ["family", "Family bathroom", "The main bathroom"],
        ["ensuite", "En-suite", "Off a bedroom"],
        ["wc", "Toilet or cloakroom", "Downstairs, or under the stairs"],
        ["wetroom", "Wet room", "Level floor, no shower tray"]
      ] },
      { id: "scope", label: "What do you want done?", msg: "Bathroom work", type: "select", options: [
        ["like", "Replace everything, same layout"], ["layout", "A new layout"], ["shower", "Swap the bath for a shower"], ["new", "A new room where there isn't one"], ["unsure", "Not sure yet"]
      ] },
      { id: "fittings", label: "Bath, basin, toilet and taps", msg: "Fittings", type: "select", options: [
        ["us", "Supplied by you"], ["mine", "I'll choose and buy them"], ["unsure", "Not sure yet"]
      ] }
    ],
    refurb: [
      { id: "property", label: "What needs doing?", msg: "Refurbishment", type: "choice", options: [
        ["house", "A whole house", "Room by room"],
        ["flat", "A whole flat", "Or a maisonette"],
        ["front", "The front of the house", "Windows, brickwork, path"]
      ] },
      { id: "bedrooms", label: "Bedrooms", msg: "Bedrooms", type: "select", options: [
        ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4 or more"]
      ] },
      { id: "scope", label: "What's included? Tick all that apply.", msg: "Includes", type: "multi", options: [
        ["rewire", "Rewiring"], ["heating", "New heating"], ["plaster", "Replastering"], ["windows", "Windows"],
        ["floors", "Floors"], ["structural", "Walls moved or removed"], ["decorating", "Decorating"]
      ] },
      { id: "living", label: "Will you live there during the work?", msg: "Living there during the work", type: "select", options: [
        ["yes", "Yes"], ["no", "No, it will be empty"], ["unsure", "Not sure yet"]
      ] }
    ],
    other: [
      { id: "describe", label: "What would you like done?", msg: "The job", type: "text", required: true, placeholder: "For example: a garden room, underpinning, a new staircase" }
    ]
  },

  budgets: [
    ["unsure", "Not sure yet"], ["u25", "Under £25,000"], ["25-50", "£25,000 to £50,000"], ["50-80", "£50,000 to £80,000"],
    ["80-120", "£80,000 to £120,000"], ["120-200", "£120,000 to £200,000"], ["200", "Over £200,000"]
  ],
  timings: [
    ["asap", "As soon as possible"], ["3m", "In the next 3 months"], ["6m", "In 3 to 6 months"],
    ["12m", "In 6 to 12 months"], ["later", "Just planning ahead"]
  ],
  drawings: [
    ["none", "Nothing yet", "We can do the drawings"],
    ["drawings", "I have drawings", "From an architect or a designer"],
    ["planning", "Drawings and planning", "Planning permission or a lawful development certificate"],
    ["approved", "All approved", "Planning and building control"]
  ],

  // How a typical extension is paid for. pct adds up to 100.
  payments: [
    { stage: "Booking your start date", pct: 0, note: "No deposit to hold your slot." },
    { stage: "Foundations", pct: 15, note: "Dug, checked by building control and concrete poured." },
    { stage: "Walls and steels", pct: 20, note: "Walls up to roof level and the steel beams in." },
    { stage: "Watertight", pct: 20, note: "Roof on, windows and doors in." },
    { stage: "First fix and plaster", pct: 20, note: "Wiring and pipes in, walls and ceilings plastered." },
    { stage: "Second fix and finishes", pct: 15, note: "Kitchen, floors, sockets, lights and decorating." },
    { stage: "Completion", pct: 5, note: "Building control sign-off and certificates handed over." },
    { stage: "Held back by you", pct: 5, note: "Paid three months later, once any snags are put right." }
  ],

  // Which permissions a project usually needs. level: 3 = yes, 2 = often, 1 = sometimes, 0 = rarely.
  permissionNames: { planning: "Planning permission", building: "Building control", party: "Party wall notice", buildover: "Build-over agreement" },
  permissions: {
    extension: {
      planning: [1, "Smaller single-storey extensions are often permitted development."],
      building: [3, "Every extension needs building control approval."],
      party: [2, "If you build on or near the boundary, or dig close to next door."],
      buildover: [1, "If a public sewer runs under the new part."]
    },
    loft: {
      planning: [1, "Most rear dormers are permitted development. Mansards, front dormers and lofts in conservation areas usually need planning."],
      building: [3, "Every loft conversion needs building control approval."],
      party: [2, "In terraced and semi-detached houses, because the new beams sit in the shared wall."],
      buildover: [0, ""]
    },
    kitchen: {
      planning: [0, "Not for work inside a house. A listed building needs listed building consent instead."],
      building: [1, "If a load-bearing wall comes out, or for new drains. Electrics are certified separately."],
      party: [0, "Only if we cut into the shared wall."],
      buildover: [0, ""]
    },
    bathroom: {
      planning: [0, "Not for work inside a house. A listed building needs listed building consent instead."],
      building: [1, "For new drainage, a new extractor fan, or a bathroom where there wasn't one."],
      party: [0, "Only if we cut into the shared wall."],
      buildover: [0, ""]
    },
    refurb: {
      planning: [1, "For changes to the outside, especially in a conservation area."],
      building: [2, "For rewiring, new windows, new heating and any structural change."],
      party: [1, "If we cut into or rebuild a shared wall."],
      buildover: [0, ""]
    }
  },

  // The project gallery. finishedMonthsAgo keeps the dates fresh. before and after are drawings standing in
  // for the firm's own photos: swap the src for a photo and keep the alt text up to date.
  projects: [
    {
      id: "shortlands-side-return",
      type: "extension",
      title: "Side-return kitchen extension",
      area: "Shortlands, BR2",
      house: "Victorian terraced house",
      weeks: 14,
      finishedMonthsAgo: 3,
      cost: "£70,000 to £80,000",
      featured: true,
      summary: "The kitchen was a 2.3 m wide galley in the back addition, with a dark side alley next to it. We built across the alley, held the old side wall up on a steel beam, and finished it with a sloping glass roof and steel-framed doors across the full width.",
      work: ["Lawful development certificate: it fitted permitted development", "Party wall agreement with one neighbour", "New foundations, steel beams and a glazed roof", "Kitchen, underfloor heating and new drainage"],
      before: { src: "img/projects/shortlands-before.svg", alt: "Drawing of the back of the house before: a narrow galley kitchen in the back addition, with a dark side alley, bins and a fence beside it." },
      after: { src: "img/projects/shortlands-after.svg", alt: "Drawing after: the side alley is now part of the kitchen, under a sloping glass roof, with an island and wide glazed doors to the garden." }
    },
    {
      id: "eden-park-rear",
      type: "extension",
      title: "Rear extension in place of a conservatory",
      area: "Eden Park, BR3",
      house: "1930s semi-detached house",
      weeks: 12,
      finishedMonthsAgo: 7,
      cost: "£80,000 to £90,000",
      summary: "The old conservatory was too cold in winter and too hot in summer. We took it down and built a 4 m deep brick extension with a flat roof, a roof lantern over the dining table and wide sliding doors to the garden.",
      work: ["Prior approval from the council: 4 m is deeper than the usual 3 m allowance for a semi", "New foundations and a steel beam across the old back wall", "Flat roof with a roof lantern", "Underfloor heating and a new patio"],
      before: { src: "img/projects/eden-park-before.svg", alt: "Drawing of the back of the house before: a pebble-dashed 1930s semi with an old plastic conservatory and cracked paving." },
      after: { src: "img/projects/eden-park-after.svg", alt: "Drawing after: a brick extension with a flat roof and roof lantern, wide sliding doors, fresh render upstairs and a new patio." }
    },
    {
      id: "penge-dormer",
      type: "loft",
      title: "Rear dormer loft with a shower room",
      area: "Penge, SE20",
      house: "Victorian terraced house",
      weeks: 10,
      finishedMonthsAgo: 2,
      cost: "£65,000 to £75,000",
      summary: "A dusty loft with a water tank and a few boxes. Now a double bedroom with its own shower room, a full-width dormer at the back and two roof windows at the front.",
      work: ["Lawful development certificate: permitted development", "Party wall agreements with both neighbours", "Steel beams, new floor joists and a fire-protected staircase", "Shower room, and storage built into the eaves"],
      before: { src: "img/projects/penge-before.svg", alt: "Drawing of the loft before, cut through from front to back: bare rafters, a water tank, boxes and a small hatch." },
      after: { src: "img/projects/penge-after.svg", alt: "Drawing after: a bedroom under the roof with a full-height dormer window at the back, two roof windows at the front, a bed and a bookcase." }
    },
    {
      id: "west-wickham-hip",
      type: "loft",
      title: "Hip-to-gable loft with a rear dormer",
      area: "West Wickham, BR4",
      house: "1930s semi-detached house",
      weeks: 12,
      finishedMonthsAgo: 10,
      cost: "£80,000 to £90,000",
      summary: "The sloping side of the roof left no room for stairs. We built it up into a full gable wall, added a dormer at the back, and made a bedroom, a study and a shower room.",
      work: ["Permitted development, with a lawful development certificate", "Party wall agreement with the attached neighbour", "Gable wall built and rendered to match the house", "New stairs over the existing ones"],
      before: { src: "img/projects/west-wickham-before.svg", alt: "Drawing of the front of a pair of 1930s semis before: both have hipped roofs that slope down at the sides." },
      after: { src: "img/projects/west-wickham-after.svg", alt: "Drawing after: the right-hand house now has a full gable wall with a new window at the top, while next door keeps its hipped roof." }
    },
    {
      id: "beckenham-knock-through",
      type: "kitchen",
      title: "Kitchen and dining room knocked through",
      area: "Beckenham, BR3",
      house: "Edwardian semi-detached house",
      weeks: 5,
      finishedMonthsAgo: 5,
      cost: "£45,000 to £55,000",
      summary: "Two small rooms with a wall between them. We took the wall out, put a steel beam in its place, and fitted a new kitchen with an island and a long run of tall units.",
      work: ["Structural engineer's calculations and building control for the beam", "No planning needed: the work is all inside", "Kitchen supplied and fitted, new floor, plastering and lighting", "Electrics by our registered electrician, with a certificate"],
      before: { src: "img/projects/beckenham-before.svg", alt: "Drawing of the kitchen before: a dated kitchen on the right, a wall with a door, and a small dining room on the left." },
      after: { src: "img/projects/beckenham-after.svg", alt: "Drawing after: the wall has gone, a beam runs across the ceiling, and a new kitchen with an island and pendant lights opens onto the dining table." }
    },
    {
      id: "sydenham-galley",
      type: "kitchen",
      title: "Galley kitchen in a flat",
      area: "Sydenham, SE26",
      house: "Ground-floor flat",
      weeks: 3,
      finishedMonthsAgo: 4,
      cost: "£18,000 to £24,000",
      summary: "A tired galley kitchen with the boiler on show and not much storage. New units up to the ceiling, the boiler hidden in a tall cupboard, a tiled splashback and proper lighting.",
      work: ["Units chosen by the owners, fitted by us", "Boiler left in place, boxed in with the space it needs around it", "New sockets and lights, with an electrical certificate", "The owners got the freeholder's consent before we started"],
      before: { src: "img/projects/sydenham-before.svg", alt: "Drawing of the galley kitchen before: old units, a boiler on the wall, a small window and bare walls." },
      after: { src: "img/projects/sydenham-after.svg", alt: "Drawing after: dark green units up to the ceiling, a tall cupboard where the boiler was, open shelves and a tiled splashback." }
    },
    {
      id: "bromley-bathroom",
      type: "bathroom",
      title: "Family bathroom",
      area: "Bromley, BR1",
      house: "1960s terraced house",
      weeks: 3,
      finishedMonthsAgo: 1,
      cost: "£14,000 to £18,000",
      summary: "An avocado suite from the 1970s, a shower curtain and a carpet. Now a bath with a glass screen and a proper shower, a wall-hung basin with drawers, and tiles from floor to ceiling.",
      work: ["Stripped back to the brick and the joists", "New waste pipes, a thermostatic shower and an extractor fan", "Tiled floor to ceiling, with a recess in the shower wall", "Heated towel rail"],
      before: { src: "img/projects/bromley-before.svg", alt: "Drawing of the bathroom before: a green bath with a shower curtain, a green pedestal basin, old tiles and a carpet." },
      after: { src: "img/projects/bromley-after.svg", alt: "Drawing after: a white bath with a glass screen and a rain shower, a wall-hung basin with drawers, tiles to the ceiling and a towel rail." }
    },
    {
      id: "elmers-end-cloakroom",
      type: "bathroom",
      title: "Toilet under the stairs",
      area: "Elmers End, BR3",
      house: "Victorian terraced house",
      weeks: 2,
      finishedMonthsAgo: 6,
      cost: "£7,000 to £9,000",
      summary: "A cupboard under the stairs, full of coats and the hoover. Now a small toilet with a corner basin and an extractor fan, so nobody has to go upstairs.",
      work: ["Building control for the new drainage and the fan", "New waste pipe to the soil stack", "Compact toilet and a corner basin", "Coats moved to a new cupboard in the hall"],
      before: { src: "img/projects/elmers-end-before.svg", alt: "Drawing of the space under the stairs before: a cupboard with coats, a hoover and boxes." },
      after: { src: "img/projects/elmers-end-after.svg", alt: "Drawing after: a small toilet and corner basin under the sloping stairs, with a mirror, a light and tiles." }
    },
    {
      id: "bickley-front",
      type: "refurb",
      title: "Front of a Victorian house restored",
      area: "Bickley, BR1",
      house: "Victorian semi-detached house",
      weeks: 6,
      finishedMonthsAgo: 8,
      cost: "£30,000 to £38,000",
      summary: "Rotten sash windows, cracked render on the bay and a broken path. We repaired the sashes we could, made new ones where we couldn't, repointed the brickwork, mended the bay and laid a new tiled path.",
      work: ["The house is in a conservation area, so we checked the details with the council first", "Sash windows repaired, and two made new to the old pattern", "Brickwork repointed in lime mortar", "Black-and-white tiled path and a new gate"],
      before: { src: "img/projects/bickley-before.svg", alt: "Drawing of the front of the house before: peeling sash windows, cracked render on the bay, a broken path and an overgrown hedge." },
      after: { src: "img/projects/bickley-after.svg", alt: "Drawing after: painted sash windows, a repaired bay, a dark green front door, a tiled path and a trimmed hedge." }
    }
  ]
};
