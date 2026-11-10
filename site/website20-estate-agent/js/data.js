/* Transom & Co: the agency's properties, price guides, fees, opening hours and contact details. Every page
   reads this one file, so a new listing, a price change or a new status is made here and nowhere else.

   SAMPLE SITE: Transom & Co is made up, and so is every property, street and person below. The phone and
   WhatsApp numbers are in Ofcom's ranges kept for drama (020 7946 0xxx and 07700 900xxx), and the email
   uses the reserved .example domain. */
window.Transom = {
  // true = forms and contact buttons show what would happen instead of opening WhatsApp, the phone or email.
  sample: true,

  name: "Transom & Co",
  short: "Transom",
  whatsapp: "447700900391",
  phone: "020 7946 0391",
  phoneLink: "+442079460391",
  email: "hello@transom.example",
  address: "41 Cordwain Street, Bow, London E3",
  mapsQuery: "Roman Road, Bow, London E3",

  // Office hours. 1 = Monday ... 6 = Saturday, 0 = Sunday. Times are 24-hour "HH:MM".
  hours: {
    1: ["09:00", "18:30"], 2: ["09:00", "18:30"], 3: ["09:00", "18:30"], 4: ["09:00", "18:30"],
    5: ["09:00", "18:30"], 6: ["09:30", "16:00"], 0: null
  },

  // Days the office is shut (bank holidays). Format YYYY-MM-DD.
  closed: {
    "2026-12-25": "Christmas Day",
    "2026-12-28": "Boxing Day (substitute day)",
    "2027-01-01": "New Year's Day",
    "2027-03-26": "Good Friday",
    "2027-03-29": "Easter Monday",
    "2027-05-03": "Early May bank holiday",
    "2027-05-31": "Spring bank holiday",
    "2027-08-30": "Summer bank holiday",
    "2027-12-27": "Christmas Day (substitute day)",
    "2027-12-28": "Boxing Day (substitute day)"
  },

  // Appointment times offered for viewings and valuations. Weekdays and Saturdays; no Sundays.
  slots: {
    weekday: [
      ["morning", "Morning, 9am to 12pm"],
      ["afternoon", "Afternoon, 12pm to 4pm"],
      ["evening", "Early evening, 4pm to 7:30pm"]
    ],
    saturday: [
      ["morning", "Morning, 9:30am to 12pm"],
      ["afternoon", "Afternoon, 12pm to 3:30pm"]
    ]
  },
  // How many days ahead people can ask for a viewing or valuation (today counts as day 1).
  bookingDays: 14,

  // Our fees. Percentages are before VAT; pages show them with VAT (20%) added.
  vat: 20,
  salesFee: 1.2,
  lettingTiers: [
    {
      id: "let-only", name: "Let only", pct: 9, basis: "once",
      blurb: "We find and check the tenant, you run the tenancy.",
      charge: "of the first 12 months' rent, invoiced when the tenant moves in. If the tenant leaves before 12 months, we refund the months they did not stay.",
      includes: ["Rental valuation and advice on getting the home ready", "Photos, floor plan and listing on our site and the portals", "Accompanied viewings, evenings and Saturdays", "References, affordability and Right to Rent checks", "Tenancy agreement and the Renters' Rights Act information sheet"]
    },
    {
      id: "rent-collection", name: "Rent collection", pct: 11, basis: "monthly",
      blurb: "Everything in Let only, and we collect the rent.",
      charge: "of the rent we collect, taken each month.",
      includes: ["Everything in Let only", "Rent collected and paid to you within 3 working days", "Monthly statements and a yearly summary for your tax return", "Chasing late rent from day 2", "Deposit protected and the prescribed information served"]
    },
    {
      id: "managed", name: "Fully managed", pct: 14, basis: "monthly", featured: true,
      blurb: "We look after the home and the tenant for you.",
      charge: "of the rent we collect, taken each month.",
      includes: ["Everything in Rent collection", "Repairs handled by our own vetted trades, 24 hours a day", "Gas safety, EICR, EPC and alarm checks booked and tracked", "Two property visits a year, with photos", "Rent reviews, notices and the end-of-tenancy deposit return"]
    }
  ],
  // One-off fees to landlords, including VAT. "from" = the starting price for a 1 or 2 bedroom home.
  landlordExtras: [
    ["Tenancy set-up: references, Right to Rent checks, agreement and information sheet", 480, ""],
    ["Deposit registration and prescribed information (Let only)", 60, ""],
    ["Inventory and check-in report", 210, "from"],
    ["Check-out report and deposit advice", 150, "from"],
    ["Rent increase notice (section 13) and talking it through with the tenant", 90, ""],
    ["Booking a gas safety check, EICR or EPC", 0, "contractor's cost only, no mark-up"]
  ],

  // The rough guide on the valuation page. Ranges for homes in Bow, Old Ford and Mile End in good order,
  // from what we have sold and let over the last year. Sale prices in pounds; rents in pounds a month.
  // Keys are bedrooms (0 = studio). Missing sizes fall back to the nearest smaller size listed.
  guide: {
    updated: "autumn 2026",
    sale: {
      house: { 1: [520000, 640000], 2: [650000, 790000], 3: [850000, 1050000], 4: [1150000, 1450000], 5: [1450000, 1850000] },
      flat: { 0: [280000, 335000], 1: [365000, 445000], 2: [460000, 610000], 3: [575000, 725000], 4: [700000, 900000] },
      maisonette: { 1: [395000, 470000], 2: [540000, 660000], 3: [650000, 800000], 4: [780000, 950000] }
    },
    let: {
      house: { 1: [2100, 2450], 2: [2600, 3000], 3: [3200, 3850], 4: [4000, 4800], 5: [4800, 5800] },
      flat: { 0: [1350, 1600], 1: [1750, 2100], 2: [2250, 2750], 3: [2800, 3400], 4: [3300, 4000] },
      maisonette: { 1: [1850, 2150], 2: [2400, 2850], 3: [2900, 3500], 4: [3400, 4100] }
    },
    // Condition moves the whole range.
    condition: { work: 0.9, good: 1, renovated: 1.08 }
  },

  team: [
    { initials: "NO", name: "Nadia Okafor", role: "Director, sales", tone: "taupe",
      bio: "Started Transom in 2012 after nine years selling homes across Tower Hamlets. Does most of the valuations herself." },
    { initials: "TW", name: "Tom Whitlow", role: "Sales negotiator", tone: "pink",
      bio: "Runs the viewings and keeps buyers and sellers up to date every week until completion." },
    { initials: "SR", name: "Shirin Rahman", role: "Lettings manager", tone: "ochre",
      bio: "Finds and checks tenants, and knows the Renters' Rights Act changes inside out." },
    { initials: "CP", name: "Callum Pryce", role: "Property manager", tone: "sage",
      bio: "Looks after our managed homes: repairs, safety checks and the twice-yearly visits." },
    { initials: "MK", name: "Marta Kowalska", role: "Office and client accounts", tone: "ink",
      bio: "Pays landlords on time, sends the statements and answers the phone when we are all out." }
  ],

  /* The properties.
     mode: "sale" or "let". status: "available", "under-offer" (sales), "let-agreed" (lettings) or "sold-stc".
     type: "house", "flat" or "maisonette" (a studio is a flat with 0 bedrooms).
     listed: days since it came on the market. availableIn (lettings): days until it can be moved into (0 = now).
     epc: [current score, potential score] (1 to 100). sqft: internal floor area.
     art: how the illustration is drawn (see art.js). */
  properties: [
    {
      id: "halcombe-square", ref: "TC1041", mode: "sale", status: "available", listed: 6,
      price: 1650000, qualifier: "Guide price",
      title: "4 bedroom Georgian terraced house", type: "house", style: "Georgian terrace",
      street: "Halcombe Square", area: "Bow", postcode: "E3",
      beds: 4, baths: 2, receptions: 2, sqft: 1940,
      tenure: "Freehold", councilTax: "G", epc: [58, 71],
      summary: "A four-storey house on one of Bow's few Georgian squares, with its shutters, fireplaces and a 45 ft walled garden.",
      features: [
        "Four bedrooms over three floors, plus a dry vaulted cellar",
        "Double reception room with original shutters and fireplaces",
        "Kitchen and family room opening onto a 45 ft walled garden",
        "Looks onto the square's garden (key holders pay £180 a year)",
        "Grade II listed, in a conservation area",
        "Ten minutes' walk to Mile End and Bow Road stations"
      ],
      description: [
        "Number 14 was built in the 1830s and has been in the same family for 28 years. It has been looked after rather than modernised, so the shutters, cornicing and stone stairs to the cellar are all still here.",
        "The raised ground floor has a double reception room with a fireplace at each end. The lower ground floor is one long kitchen and family room with glazed doors to the garden. There are two bedrooms and a bathroom on the first floor, and two more bedrooms and a shower room above.",
        "The kitchen would suit updating, and any work needs listed building consent. We can put you in touch with a local architect who has done several houses on the square."
      ],
      rooms: [["Double reception room", "9.40 × 4.20 m"], ["Kitchen and family room", "6.80 × 4.40 m"], ["Principal bedroom", "5.10 × 4.20 m"], ["Bedroom 2", "4.30 × 3.90 m"], ["Bedroom 3", "3.80 × 3.10 m"], ["Bedroom 4", "3.40 × 2.90 m"], ["Garden", "13.7 m (45 ft)"]],
      info: {
        construction: "Standard: solid brick walls, stucco ground floor front, slate roof",
        heating: "Gas central heating (boiler fitted 2021)",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking on the square",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "Grade II listed and in a conservation area: most changes need consent",
        rights: "Shared key-holder access to the square's garden",
        safety: "None known",
        planning: "No applications nearby that we know of",
        access: "Five steps up to the front door"
      },
      art: { kind: "georgian", door: "black", number: "14", sky: "pink", tree: "right" }
    },
    {
      id: "pennyroyal-road", ref: "TC1036", mode: "sale", status: "under-offer", listed: 12,
      price: 985000, qualifier: "Guide price",
      title: "3 bedroom Victorian terraced house", type: "house", style: "Victorian terrace",
      street: "Pennyroyal Road", area: "Old Ford", postcode: "E3",
      beds: 3, baths: 1, receptions: 2, sqft: 1180,
      tenure: "Freehold", councilTax: "E", epc: [63, 80],
      summary: "A bay-fronted family house five minutes from Roman Road market, with a west-facing garden and room to go into the loft.",
      features: [
        "Bay-fronted, with the original cornicing and fireplaces",
        "22 ft through lounge",
        "Kitchen extension with roof lights and a downstairs WC",
        "50 ft west-facing garden",
        "Loft conversion potential (subject to planning permission)",
        "Five minutes' walk to Roman Road market"
      ],
      description: [
        "A classic Old Ford terrace on a quiet, tree-lined road. The through lounge runs from the bay at the front to French doors at the back, and the kitchen was extended in 2018 with roof lights over the dining table.",
        "Upstairs are two double bedrooms, a good single and the family bathroom. Several neighbours have converted their lofts, so there is a clear route to a fourth bedroom.",
        "Offers have been accepted, but we are happy to keep a list of people interested in similar houses on the road."
      ],
      rooms: [["Through lounge", "6.70 × 3.60 m"], ["Kitchen and dining room", "5.20 × 3.40 m"], ["Bedroom 1", "4.40 × 3.60 m"], ["Bedroom 2", "3.60 × 3.20 m"], ["Bedroom 3", "2.80 × 2.10 m"], ["Garden", "15.2 m (50 ft)"]],
      info: {
        construction: "Standard: solid brick walls, slate roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "None known",
        rights: "None known",
        safety: "None known",
        planning: "Loft conversions approved at numbers 31 and 45",
        access: "One step up to the front door"
      },
      art: { kind: "terrace", bay: true, brick: "stock", door: "olive", number: "37", sky: "sage", tree: "right", board: "sale" }
    },
    {
      id: "lamplighter-works", ref: "TC1047", mode: "sale", status: "available", listed: 2,
      price: 650000, qualifier: "Offers in excess of",
      title: "2 bedroom warehouse apartment", type: "flat", style: "Warehouse conversion",
      street: "Lamplighter Works", area: "Fish Island", postcode: "E3",
      beds: 2, baths: 2, receptions: 1, sqft: 840,
      tenure: "Leasehold", lease: { years: 107, groundRent: "£350 a year, next review in 2033", serviceCharge: "£3,120 a year (2026/27 budget)" },
      councilTax: "D", epc: [72, 74],
      summary: "A third-floor apartment in a converted lamp factory, with 3.4 m ceilings, steel windows and a view along the canal.",
      features: [
        "3.4 m ceilings and the original steel factory windows",
        "Open-plan living room and kitchen with canal views",
        "Two double bedrooms, one with an en suite",
        "Lift, secure bike store and a shared roof terrace",
        "107 years left on the lease",
        "12 minutes' walk to Hackney Wick station"
      ],
      description: [
        "Lamplighter Works made gas lamps until the 1950s and was turned into 38 apartments in 2008. This one is on the third floor, at the canal end of the building, so the living room looks along the water.",
        "The living space is one big room with the kitchen along the back wall. The two bedrooms are on the quiet side of the building, and the main one has its own shower room.",
        "The building has a lift, a bike store for 60 bikes and a shared roof terrace. The managing agent's fire safety report is up to date, and we can send it before you view."
      ],
      rooms: [["Living room and kitchen", "7.90 × 5.10 m"], ["Bedroom 1", "4.10 × 3.30 m"], ["Bedroom 2", "3.60 × 3.00 m"], ["Bathroom", "2.40 × 2.10 m"], ["En suite", "2.30 × 1.50 m"]],
      info: {
        construction: "Standard: solid brick walls, steel windows, flat roof",
        heating: "Electric heating and hot water",
        utilities: "Mains electricity, water and drainage. No gas",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on most networks (check Ofcom)",
        parking: "No parking. Secure bike store",
        flood: "Low risk from rivers and the sea (protected by flood defences), low from surface water",
        restrictions: "Lease: no short-term holiday lets, pets with the freeholder's consent",
        rights: "None known",
        safety: "Building over 11 m: fire risk assessment 2026, no cladding remediation needed",
        planning: "Plans for new homes on the Lea side of the canal have been approved",
        access: "Lift to all floors, step-free entrance"
      },
      art: { kind: "warehouse", sign: "LAMPLIGHTER WORKS", sky: "cream", highlight: [3, 2], tree: "left" }
    },
    {
      id: "towpath-house", ref: "TC1029", mode: "sale", status: "sold-stc", listed: 21,
      price: 415000, qualifier: "",
      title: "1 bedroom flat", type: "flat", style: "New build",
      street: "Towpath House", area: "Bow Common", postcode: "E3",
      beds: 1, baths: 1, receptions: 1, sqft: 540,
      tenure: "Leasehold", lease: { years: 994, groundRent: "None (peppercorn)", serviceCharge: "£2,280 a year (2026/27 budget)" },
      councilTax: "C", epc: [84, 85],
      summary: "A fourth-floor flat in a 2021 building by the Limehouse Cut, with a balcony over the water.",
      features: [
        "Fourth floor, with a balcony over the canal",
        "Built in 2021, rest of the 10-year warranty to run",
        "Heated by the building's own heat network",
        "Lift and secure bike store",
        "No ground rent",
        "Eight minutes' walk to Devons Road DLR"
      ],
      description: [
        "A bright one bedroom flat with the living room and bedroom both facing the water. The kitchen has integrated appliances and a breakfast bar.",
        "Heating and hot water come from the building's own heat network. You pay for what you use through a meter, and the charges are set by the managing agent rather than an energy supplier.",
        "Sold subject to contract. Similar flats in the building come up a few times a year, so tell us if you would like to hear first."
      ],
      rooms: [["Living room and kitchen", "6.20 × 3.90 m"], ["Bedroom", "3.90 × 2.90 m"], ["Bathroom", "2.20 × 1.90 m"], ["Balcony", "3.20 × 1.50 m"]],
      info: {
        construction: "Standard: brick-faced concrete frame, flat roof",
        heating: "Heat network (communal heating), metered",
        utilities: "Mains electricity, water and drainage. No gas",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "No parking. Secure bike store",
        flood: "Low risk from rivers and the sea, very low from surface water",
        restrictions: "Lease: no holiday lets, no pets without consent",
        rights: "None known",
        safety: "Building over 11 m: built to current fire safety rules, sprinklers in every flat",
        planning: "None nearby that we know of",
        access: "Lift to all floors, step-free entrance"
      },
      art: { kind: "modern", brick: "light", sky: "blue", highlight: [4, 2], tree: "both" }
    },
    {
      id: "tamsin-road", ref: "TC1048", mode: "sale", status: "available", listed: 1,
      price: 625000, qualifier: "Guide price",
      title: "2 bedroom maisonette", type: "maisonette", style: "Victorian conversion",
      street: "Tamsin Road", area: "Bow", postcode: "E3",
      beds: 2, baths: 1, receptions: 1, sqft: 870,
      tenure: "Share of freehold", lease: { years: 987, groundRent: "None", serviceCharge: "No set charge: costs shared 50/50 with the ground-floor flat as needed (about £600 a year)" },
      councilTax: "C", epc: [61, 76],
      summary: "The top two floors of a Victorian house, with its own front door, a loft bedroom and a small roof terrace off the kitchen.",
      features: [
        "Own front door and a share of the freehold",
        "Loft bedroom with skylights and built-in storage",
        "Kitchen with a small roof terrace (6 m²)",
        "Bay-windowed living room",
        "Quiet street, two minutes from Roman Road",
        "No onward chain"
      ],
      description: [
        "A front door at street level leads up to the first floor, where the living room has the bay window and the kitchen at the back opens onto a small roof terrace.",
        "The second bedroom and bathroom are also on the first floor. The loft was converted in 2016 to make a big main bedroom with skylights front and back.",
        "The two flats in the house own the freehold together. There is no service charge: the owners split the cost of any shared work."
      ],
      rooms: [["Living room", "4.60 × 3.70 m"], ["Kitchen", "3.40 × 2.80 m"], ["Loft bedroom", "5.20 × 3.40 m"], ["Bedroom 2", "3.30 × 2.60 m"], ["Bathroom", "2.30 × 1.80 m"], ["Roof terrace", "6 m²"]],
      info: {
        construction: "Standard: solid brick walls, slate roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "Lease: no short-term holiday lets, pets with the other owner's consent",
        rights: "Right of way over the front path, shared with the ground-floor flat",
        safety: "None known",
        planning: "None nearby that we know of",
        access: "Stairs to both floors"
      },
      art: { kind: "terrace", bay: true, dormer: true, brick: "stock", door: "pink", number: "41", sky: "cream", highlight: "upper", tree: "left" }
    },
    {
      id: "garrod-house", ref: "TC1043", mode: "sale", status: "available", listed: 9,
      price: 449000, qualifier: "",
      title: "2 bedroom flat", type: "flat", style: "1960s block",
      street: "Garrod House", area: "Mile End", postcode: "E3",
      beds: 2, baths: 1, receptions: 1, sqft: 690,
      tenure: "Leasehold", lease: { years: 102, groundRent: "£10 a year", serviceCharge: "£1,460 a year (2026/27), plus major works below" },
      councilTax: "C", epc: [69, 72],
      summary: "A dual-aspect flat on the third floor of a low-rise 1960s block, eight minutes from Mile End station. No onward chain.",
      features: [
        "Dual aspect, with views over the park to the south",
        "Two double bedrooms",
        "Third floor, reached by stairs and an open walkway",
        "102 years left on the lease",
        "Eight minutes' walk to Mile End station",
        "No onward chain"
      ],
      description: [
        "Flats in blocks like this are some of the best value in E3, and this one is bigger than most. Both bedrooms are doubles, and the living room runs the full depth of the flat.",
        "The freeholder is the local council, which runs the block. It has written to leaseholders about replacing the roof and windows in 2027. The estimated share for this flat is £8,000 to £12,000, and the seller has the notice to show you.",
        "Please read the major works note before booking a viewing, and ask us anything about it."
      ],
      rooms: [["Living room", "5.40 × 3.50 m"], ["Kitchen", "3.20 × 2.40 m"], ["Bedroom 1", "4.10 × 3.30 m"], ["Bedroom 2", "3.70 × 2.90 m"], ["Bathroom", "2.10 × 1.80 m"]],
      info: {
        construction: "Non-standard: concrete frame with brick panels, flat roof",
        heating: "Gas central heating (boiler fitted 2022)",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Fibre to the cabinet, up to 80 Mbps (check Ofcom)",
        mobile: "Good indoor signal on most networks (check Ofcom)",
        parking: "Estate parking by permit from the council, waiting list",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "Lease: no business use, subletting allowed",
        rights: "Shared use of the walkways and stairs",
        safety: "Major works planned for 2027 (roof and windows): estimated share £8,000 to £12,000",
        planning: "None nearby that we know of",
        access: "No lift: stairs to the third floor"
      },
      art: { kind: "sixties", sky: "sage", highlight: [3, 3], tree: "right" }
    },
    {
      id: "thursby-street", ref: "TC1033", mode: "sale", status: "under-offer", listed: 17,
      price: 735000, qualifier: "Guide price",
      title: "2 bedroom Victorian cottage", type: "house", style: "Victorian cottage",
      street: "Thursby Street", area: "Old Ford", postcode: "E3",
      beds: 2, baths: 1, receptions: 1, sqft: 760,
      tenure: "Freehold", councilTax: "D", epc: [60, 78],
      summary: "A flat-fronted cottage on a short, quiet street near Victoria Park, with a sunny courtyard garden.",
      features: [
        "Flat-fronted cottage on a short, quiet street",
        "Open-plan kitchen and dining room",
        "30 ft courtyard garden facing south",
        "New roof in 2023",
        "Two double bedrooms",
        "Six minutes' walk to Victoria Park"
      ],
      description: [
        "One of a row of twelve workers' cottages from the 1860s. The front door opens straight into the living room, and the kitchen and dining room at the back open onto the garden.",
        "Upstairs are two double bedrooms and the bathroom. The roof was replaced in 2023 with a 10-year guarantee.",
        "Under offer. If you are looking for something similar, tell us what you need and we will call you first."
      ],
      rooms: [["Living room", "4.10 × 3.70 m"], ["Kitchen and dining room", "4.80 × 3.20 m"], ["Bedroom 1", "4.10 × 3.50 m"], ["Bedroom 2", "3.30 × 3.00 m"], ["Garden", "9.1 m (30 ft)"]],
      info: {
        construction: "Standard: solid brick walls, slate roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "In a conservation area",
        rights: "None known",
        safety: "None known",
        planning: "None nearby that we know of",
        access: "Level front door"
      },
      art: { kind: "cottage", brick: "painted", door: "ochre", number: "9", sky: "pink", board: "sale" }
    },
    {
      id: "wildgoose-road", ref: "TC1022", mode: "sale", status: "sold-stc", listed: 34,
      price: 1295000, qualifier: "Guide price",
      title: "4 bedroom Victorian terraced house", type: "house", style: "Victorian terrace",
      street: "Wildgoose Road", area: "Old Ford", postcode: "E3",
      beds: 4, baths: 2, receptions: 2, sqft: 1560,
      tenure: "Freehold", councilTax: "F", epc: [66, 81],
      summary: "A red-brick family house with a finished loft, a side-return kitchen and a 60 ft garden.",
      features: [
        "Loft conversion with a shower room (2019, signed off)",
        "Side-return kitchen extension",
        "Two reception rooms",
        "60 ft garden with a cabin office",
        "Four bedrooms, two bathrooms",
        "Near three good primary schools"
      ],
      description: [
        "A bigger-than-usual Old Ford house, extended at the back and in the roof. The kitchen runs across the full width of the house and opens onto the garden.",
        "There are three bedrooms and the family bathroom on the first floor, and a fourth bedroom with its own shower room in the loft.",
        "Sold subject to contract. We sold three houses on this road in the last two years and are glad to talk about what yours could be worth."
      ],
      rooms: [["Front reception", "4.50 × 3.80 m"], ["Back reception", "3.90 × 3.60 m"], ["Kitchen", "6.10 × 4.20 m"], ["Loft bedroom", "4.80 × 3.60 m"], ["Garden", "18.3 m (60 ft)"]],
      info: {
        construction: "Standard: solid brick walls, slate roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "None known",
        rights: "None known",
        safety: "None known",
        planning: "Loft and extension done with building regulations sign-off",
        access: "Two steps up to the front door"
      },
      art: { kind: "terrace", bay: true, dormer: true, brick: "red", door: "navy", number: "62", sky: "blue", tree: "left", board: "sale" }
    },
    {
      id: "saffery-court", ref: "TL2058", mode: "let", status: "available", listed: 3,
      price: 1475, availableIn: 0, furnished: "Furnished",
      title: "Studio flat", type: "flat", style: "1930s mansion block",
      street: "Saffery Court", area: "Mile End", postcode: "E3",
      beds: 0, baths: 1, receptions: 0, sqft: 380,
      councilTax: "B", epc: [71, 74],
      summary: "A furnished studio with a separate kitchen on the second floor of a 1930s block, three minutes from Mile End station.",
      features: [
        "Separate kitchen, not a kitchenette",
        "Second floor of a 1930s red-brick block",
        "Furnished, with a double bed and a desk",
        "Bike store and a shared garden",
        "Three minutes' walk to Mile End station",
        "Available now"
      ],
      description: [
        "A good-sized studio with a separate kitchen, which is rare at this rent. The main room has space for a double bed, a sofa and a desk by the window.",
        "The block has a caretaker, a bike store and a shared garden at the back. Bills are not included.",
        "One person only, because of the size. Pets are considered: ask us and we will put your request to the landlord."
      ],
      rooms: [["Living and sleeping room", "5.20 × 3.70 m"], ["Kitchen", "2.60 × 2.10 m"], ["Shower room", "2.00 × 1.60 m"]],
      info: {
        construction: "Standard: brick walls, flat roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "No parking. Bike store",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "None known",
        rights: "None known",
        safety: "None known",
        planning: "None nearby that we know of",
        access: "No lift: stairs to the second floor"
      },
      art: { kind: "mansion", brick: "red", sky: "cream", highlight: [2, 1], tree: "left" }
    },
    {
      id: "brakespear-street", ref: "TL2061", mode: "let", status: "available", listed: 5,
      price: 1925, availableIn: 18, furnished: "Unfurnished",
      title: "1 bedroom garden flat", type: "flat", style: "Victorian conversion",
      street: "Brakespear Street", area: "Bow", postcode: "E3",
      beds: 1, baths: 1, receptions: 1, sqft: 520,
      councilTax: "B", epc: [64, 74],
      summary: "The ground floor of a Victorian house, with wooden floors, a washer-dryer and its own garden.",
      features: [
        "Ground floor of a Victorian house",
        "Private garden, about 25 ft",
        "Wooden floors and a bay window",
        "Washer-dryer and dishwasher",
        "Unfurnished",
        "Pets considered"
      ],
      description: [
        "A quiet one bedroom flat with the bay window at the front and the bedroom at the back, looking onto the garden.",
        "The kitchen has a dishwasher and a washer-dryer. The garden is yours alone and has a small shed.",
        "The landlord is happy to consider a pet. Ask us and we will put your request to them."
      ],
      rooms: [["Living room", "4.50 × 3.80 m"], ["Kitchen", "3.10 × 2.40 m"], ["Bedroom", "3.90 × 3.20 m"], ["Garden", "7.6 m (25 ft)"]],
      info: {
        construction: "Standard: solid brick walls, slate roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "None known",
        rights: "None known",
        safety: "None known",
        planning: "None nearby that we know of",
        access: "One step up to the front door"
      },
      art: { kind: "terrace", bay: true, brick: "stock", door: "sage", number: "18", sky: "pink", highlight: "ground", tree: "right" }
    },
    {
      id: "allbright-wharf", ref: "TL2054", mode: "let", status: "let-agreed", listed: 15,
      price: 2650, availableIn: 9, furnished: "Furnished",
      title: "2 bedroom canal-side flat", type: "flat", style: "New build",
      street: "Allbright Wharf", area: "Bow Common", postcode: "E3",
      beds: 2, baths: 2, receptions: 1, sqft: 760,
      councilTax: "D", epc: [83, 84],
      summary: "A furnished two bedroom, two bathroom flat with a balcony over the canal.",
      features: [
        "Balcony over the canal",
        "Two double bedrooms and two bathrooms",
        "Underfloor heating from the building's heat network",
        "Lift, concierge in the daytime and a bike store",
        "Furnished",
        "Seven minutes' walk to Bow Church DLR"
      ],
      description: [
        "A second-floor flat with the living room and balcony on the canal side and both bedrooms at the back.",
        "Heating comes from the building's heat network and is metered, so you pay for what you use.",
        "Let agreed. We have more flats in this building coming up, so tell us what you are looking for."
      ],
      rooms: [["Living room and kitchen", "6.40 × 4.10 m"], ["Bedroom 1", "3.90 × 3.10 m"], ["Bedroom 2", "3.40 × 2.80 m"], ["Balcony", "4.00 × 1.60 m"]],
      info: {
        construction: "Standard: brick-faced concrete frame, flat roof",
        heating: "Heat network (communal heating), metered",
        utilities: "Mains electricity, water and drainage. No gas",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "No parking. Secure bike store",
        flood: "Low risk from rivers and the sea, very low from surface water",
        restrictions: "None known",
        rights: "None known",
        safety: "Building over 11 m: built to current fire safety rules",
        planning: "None nearby that we know of",
        access: "Lift to all floors, step-free entrance"
      },
      art: { kind: "modern", brick: "dark", sky: "sage", highlight: [2, 3], tree: "right" }
    },
    {
      id: "ludlam-road", ref: "TL2063", mode: "let", status: "available", listed: 4,
      price: 3600, availableIn: 28, furnished: "Unfurnished",
      title: "3 bedroom Victorian terraced house", type: "house", style: "Victorian terrace",
      street: "Ludlam Road", area: "Old Ford", postcode: "E3",
      beds: 3, baths: 1, receptions: 2, sqft: 1120,
      councilTax: "E", epc: [65, 79],
      summary: "A family house with two reception rooms and a 40 ft garden, close to Victoria Park and three primary schools.",
      features: [
        "Two reception rooms",
        "Kitchen and dining room onto a 40 ft garden",
        "Three bedrooms and a downstairs WC",
        "Unfurnished",
        "Pets considered",
        "Near Victoria Park and three primary schools"
      ],
      description: [
        "A well-kept family house on a quiet road between Roman Road and Victoria Park.",
        "Downstairs there are two reception rooms, a kitchen with space to eat, and a WC. Upstairs there are two doubles, a single and the bathroom.",
        "Families and people on benefits are welcome to apply, as the law now requires. We check that the rent is affordable for every applicant in the same way."
      ],
      rooms: [["Front reception", "4.30 × 3.70 m"], ["Back reception", "3.70 × 3.40 m"], ["Kitchen and dining room", "4.60 × 3.00 m"], ["Bedroom 1", "4.30 × 3.70 m"], ["Garden", "12.2 m (40 ft)"]],
      info: {
        construction: "Standard: solid brick walls, slate roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "None known",
        rights: "None known",
        safety: "None known",
        planning: "None nearby that we know of",
        access: "One step up to the front door"
      },
      art: { kind: "terrace", bay: true, brick: "stock", door: "oxblood", number: "23", sky: "sage", tree: "right", board: "let" }
    },
    {
      id: "vincey-street", ref: "TL2060", mode: "let", status: "available", listed: 8,
      price: 4750, availableIn: 42, furnished: "Unfurnished",
      title: "4 bedroom Georgian townhouse", type: "house", style: "Georgian terrace",
      street: "Vincey Street", area: "Bow", postcode: "E3",
      beds: 4, baths: 3, receptions: 2, sqft: 2050,
      councilTax: "G", epc: [59, 70],
      summary: "A four-storey Georgian house with three bathrooms, a garden and the original shutters.",
      features: [
        "Four floors, four bedrooms, three bathrooms",
        "Double reception room with shutters and fireplaces",
        "Kitchen and family room onto the garden",
        "Unfurnished",
        "Grade II listed",
        "Ten minutes' walk to Bow Road station"
      ],
      description: [
        "A rare chance to rent a Georgian house in the conservation area. The rooms are tall and bright, and the original shutters still close.",
        "The kitchen and family room are on the lower ground floor, with doors to the garden. There are two bedrooms on each of the top two floors.",
        "The rent is over £50,000 a year, so the deposit is six weeks' rent rather than five."
      ],
      rooms: [["Double reception room", "9.20 × 4.30 m"], ["Kitchen and family room", "7.00 × 4.30 m"], ["Principal bedroom", "5.00 × 4.30 m"], ["Bedroom 2", "4.30 × 3.80 m"], ["Garden", "12.8 m (42 ft)"]],
      info: {
        construction: "Standard: solid brick walls, stucco ground floor front, slate roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "Residents' permit parking",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "Grade II listed and in a conservation area",
        rights: "None known",
        safety: "None known",
        planning: "None nearby that we know of",
        access: "Five steps up to the front door"
      },
      art: { kind: "georgian", door: "olive", number: "7", sky: "blue", tree: "left" }
    },
    {
      id: "trevenna-house", ref: "TL2051", mode: "let", status: "let-agreed", listed: 20,
      price: 2300, availableIn: 5, furnished: "Part furnished",
      title: "2 bedroom flat", type: "flat", style: "1930s mansion block",
      street: "Trevenna House", area: "Mile End", postcode: "E3",
      beds: 2, baths: 1, receptions: 1, sqft: 650,
      councilTax: "C", epc: [69, 73],
      summary: "A two bedroom flat in a 1930s block by Mile End Park, with a separate kitchen and a balcony.",
      features: [
        "Two bedrooms, one double and one single",
        "Separate kitchen and a small balcony",
        "Part furnished",
        "Looks over Mile End Park",
        "Bike store",
        "Five minutes' walk to Mile End station"
      ],
      description: [
        "A first-floor flat in a well-run 1930s block. The living room and balcony look over the park.",
        "The kitchen is separate, with a washing machine and space for a small table.",
        "Let agreed. Similar flats in the block come up two or three times a year."
      ],
      rooms: [["Living room", "4.60 × 3.60 m"], ["Kitchen", "3.00 × 2.30 m"], ["Bedroom 1", "3.80 × 3.20 m"], ["Bedroom 2", "2.80 × 2.20 m"]],
      info: {
        construction: "Standard: brick walls, flat roof",
        heating: "Gas central heating",
        utilities: "Mains electricity, gas, water and drainage",
        broadband: "Full fibre available, up to 1,000 Mbps (check Ofcom)",
        mobile: "Good indoor signal on all main networks (check Ofcom)",
        parking: "No parking. Bike store",
        flood: "Very low risk from rivers and the sea, low from surface water",
        restrictions: "None known",
        rights: "None known",
        safety: "None known",
        planning: "None nearby that we know of",
        access: "No lift: stairs to the first floor"
      },
      art: { kind: "mansion", brick: "brown", sky: "pink", highlight: [1, 3], tree: "right" }
    }
  ]
};
