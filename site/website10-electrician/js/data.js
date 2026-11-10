/* Earthpin Electrical: services, guide prices, quote questions, areas covered, hours and contact details.
   Every page reads this one file, so a price or a postcode is changed here and nowhere else.

   SAMPLE SITE: Earthpin Electrical is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept
   for drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain.

   Guide prices are in pounds and include VAT. Each job in `jobs` works out its range like this:
     base  = the sum of every chosen option's `base`, plus `each` times the job's count answer
     price = base x every chosen option's `times`, plus every chosen option's `extra`
   then `minimum` is applied and the range is rounded (to £10 under £500, £50 under £2,000, else £100).
   An option with `stop` shows its message instead of a price. `note` adds a line under the price.
   A question with `showIf` only appears (and only counts) when another answer matches. */
window.Earthpin = {
  // true = WhatsApp, phone and email buttons show what would happen instead of opening anything.
  sample: true,

  name: "Earthpin Electrical",
  short: "Earthpin",
  whatsapp: "447700900742",
  mobile: "07700 900742",
  phone: "020 7946 0742",
  phoneLink: "+442079460742",
  email: "hello@earthpin.example",
  address: "Unit 3, Kestle Mews, North Finchley, London N12",

  // When the phones and WhatsApp are answered. 1 = Monday ... 6 = Saturday, 0 = Sunday.
  hours: {
    1: ["07:30", "18:00"],
    2: ["07:30", "18:00"],
    3: ["07:30", "18:00"],
    4: ["07:30", "18:00"],
    5: ["07:30", "18:00"],
    6: ["08:00", "13:00"],
    0: null
  },

  // Days we don't work: [first day, last day, reason]. Format YYYY-MM-DD.
  closed: [
    ["2026-12-24", "2027-01-01", "Christmas break"],
    ["2027-03-26", "2027-03-26", "Good Friday"],
    ["2027-03-29", "2027-03-29", "Easter Monday"],
    ["2027-05-03", "2027-05-03", "Early May bank holiday"],
    ["2027-05-31", "2027-05-31", "Spring bank holiday"],
    ["2027-08-30", "2027-08-30", "Summer bank holiday"],
    ["2027-12-24", "2028-01-03", "Christmas break"]
  ],

  /* ---------- Areas we cover ----------
     status "yes" = every job. "big" = bigger jobs only (rewires, fuse boxes, EV chargers, landlord EICRs).
     col and row place the district on the small map on the home page (0 = left / top). */
  areas: {
    EN5: { name: "Barnet", status: "yes", col: 2, row: 0 },
    EN4: { name: "East Barnet and Cockfosters", status: "yes", col: 3, row: 0 },
    EN2: { name: "Enfield", status: "big", col: 4, row: 0 },
    HA8: { name: "Edgware", status: "big", col: 0, row: 1 },
    NW7: { name: "Mill Hill", status: "yes", col: 1, row: 1 },
    N20: { name: "Whetstone and Totteridge", status: "yes", col: 2, row: 1 },
    N14: { name: "Southgate", status: "yes", col: 3, row: 1 },
    N21: { name: "Winchmore Hill", status: "big", col: 4, row: 1 },
    NW9: { name: "Colindale and Kingsbury", status: "big", col: 0, row: 2 },
    NW4: { name: "Hendon", status: "yes", col: 1, row: 2 },
    N12: { name: "North Finchley", status: "yes", col: 2, row: 2, home: true },
    N11: { name: "Friern Barnet and New Southgate", status: "yes", col: 3, row: 2 },
    N13: { name: "Palmers Green", status: "yes", col: 4, row: 2 },
    NW11: { name: "Golders Green", status: "big", col: 1, row: 3 },
    N3: { name: "Finchley Central", status: "yes", col: 2, row: 3 },
    N10: { name: "Muswell Hill", status: "yes", col: 3, row: 3 },
    N22: { name: "Wood Green", status: "big", col: 4, row: 3 },
    N2: { name: "East Finchley", status: "yes", col: 2, row: 4 },
    N6: { name: "Highgate", status: "big", col: 3, row: 4 },
    N8: { name: "Hornsey and Crouch End", status: "big", col: 4, row: 4 }
  },

  /* ---------- Services ----------
     `example` is worked out with the matching job in `jobs`, so the services page and the quote form
     always show the same prices. */
  services: [
    {
      id: "rewire",
      name: "Rewires, full and partial",
      icon: "i-cable",
      short: "New cables, sockets, switches and a new fuse box, for the whole home or just part of it.",
      when: [
        "Your wiring is old and no one knows when it was last checked. Old wiring isn't always unsafe: an EICR tells you whether it needs replacing.",
        "You can see rubber, lead or fabric-covered cables, or old round-pin sockets.",
        "Light switches have no earth wire, which is common in homes wired before the mid-1960s.",
        "An EICR found problems on several circuits, or you're renovating and the floors are coming up anyway."
      ],
      involved: [
        "A free visit first. We agree with you where every socket, switch and light goes.",
        "First fix: we lift floorboards and cut channels in the plaster for the new cables. This is the messy part, done room by room.",
        "Second fix: sockets, switches and lights go on, and a new consumer unit goes in.",
        "We test every circuit, label the fuse box, give you an Electrical Installation Certificate and notify building control for you.",
        "Plastering over the channels (making good) is separate. We can arrange it, or leave it for your builder."
      ],
      time: "About 7 to 10 working days for a 3-bedroom house",
      paperwork: "Electrical Installation Certificate, plus a Building Regulations certificate",
      example: { label: "3-bed terraced house, empty during the work", answers: { ptype: "terraced", beds: "3", scope: "full", occupied: "no", plaster: "no" } }
    },
    {
      id: "consumer-unit",
      name: "Consumer unit (fuse box) upgrades",
      icon: "i-board",
      short: "A modern metal fuse box with RCD protection on every circuit and surge protection.",
      when: [
        "Your fuse box still has fuse wire holders, or sits on a wooden board.",
        "There's no RCD: a switch with a T or Test button that cuts the power in a fraction of a second if someone touches something live.",
        "You're adding an EV charger, an electric shower or a new kitchen, and the board is old or full.",
        "An EICR recommended a new one, or the old one trips, buzzes or feels warm."
      ],
      involved: [
        "We test the existing circuits first. Old wiring sometimes has faults that a new RCD will trip on, and we tell you before we start.",
        "The power is off for most of the day, usually four to six hours.",
        "We fit a metal consumer unit with RCBOs (or RCDs), surge protection and a main switch, and check the main earth and the earth cables to your gas and water pipes.",
        "Every circuit is tested and labelled. You get an Electrical Installation Certificate and we notify building control."
      ],
      time: "One day",
      paperwork: "Electrical Installation Certificate, plus a Building Regulations certificate",
      example: { label: "7 to 10 circuits, RCBO board", answers: { circuits: "7-10", rcd: "yes", board: "rcbo", bonding: "yes" } }
    },
    {
      id: "ev-charger",
      name: "EV charger installation",
      icon: "i-ev",
      short: "A 7 kW smart charger on your drive or garage wall, with its own protected circuit.",
      when: [
        "You have a driveway, a garage or another off-street space next to your home.",
        "You want to charge overnight on a cheaper tariff. A 7 kW charger adds roughly 25 to 30 miles of range an hour.",
        "Only on-street parking? A cable across the pavement isn't allowed without your council's permission. Ask your council about on-street charge points or approved pavement channels."
      ],
      involved: [
        "Send photos of your fuse box, your meter and where you'd like the charger. Most quotes need no visit.",
        "We check your supply and main fuse can take the extra load, and tell the network operator (UK Power Networks in most of London) about the charger, as the rules require.",
        "We fit the charger, run the cable (usually along the outside wall) and add its own protection and earthing.",
        "We connect it to your Wi-Fi and the app, show you how it works and give you the certificate."
      ],
      time: "Half a day to a day",
      paperwork: "Electrical Installation Certificate, plus a Building Regulations certificate",
      example: { label: "Charger supplied, driveway, under 5 metres from the fuse box", answers: { parking: "driveway", distance: "under5", route: "outside", charger: "supply", board: "modern" } }
    },
    {
      id: "eicr",
      name: "EICR (Electrical Installation Condition Report)",
      icon: "i-report",
      short: "An inspection and test of your wiring, with a written report and plain next steps.",
      when: [
        "You let a home in England: you need one at least every five years, and your tenants must get a copy.",
        "You're buying or selling, or you've just moved in.",
        "Your home hasn't been checked for ten years, the usual advice for homes you own and live in.",
        "You run a shop, office or café. Every five years is the usual advice for business premises."
      ],
      involved: [
        "We inspect the fuse box, the earthing and the bonding, and a sample of sockets, switches and lights.",
        "We test every circuit. The power goes off for short spells, so expect the Wi-Fi to drop now and then.",
        "Anything wrong gets a code: C1 (danger now), C2 (potentially dangerous), FI (needs investigating) or C3 (improvement recommended). Any C1, C2 or FI makes the report unsatisfactory.",
        "You get the report by email within two working days. Repairs are quoted separately, and you choose who does them."
      ],
      time: "Two to four hours for most homes",
      paperwork: "Electrical Installation Condition Report (EICR)",
      example: { label: "2-bedroom flat", answers: { ptype: "flat", beds: "2", reason: "check", boards: "one" } }
    },
    {
      id: "lighting",
      name: "Lighting",
      icon: "i-bulb",
      short: "New light fittings, LED downlights, outside lights and new lighting circuits.",
      when: [
        "You want downlights in a kitchen or bathroom, or more light in a dark room.",
        "You've bought new fittings and want them put up safely.",
        "You want outside lights with a sensor, or lights for a garden or garden room."
      ],
      involved: [
        "We plan the layout with you, including dimmers and where the switches go.",
        "Downlights are fire-rated where the ceiling needs it, for example under a bedroom or a loft room.",
        "Bathroom lights are rated for where they sit, and the circuit is protected by an RCD.",
        "We test and give you a certificate: a Minor Works certificate for changes, or an Installation Certificate for a new circuit."
      ],
      time: "Most jobs take a day or less",
      paperwork: "Minor Works or Installation Certificate",
      example: { label: "6 LED downlights with a loft above", answers: { kind: "downlights", count: 6, access: "loft" } }
    },
    {
      id: "sockets",
      name: "Sockets and switches",
      icon: "i-socket",
      short: "Extra sockets, USB sockets, outdoor sockets and new circuits for cookers and showers.",
      when: [
        "You're running extension leads to everything.",
        "A socket is cracked, loose, scorched or warm to the touch. Stop using it until it's checked.",
        "You need a socket outside, or a new circuit for an oven, hob or electric shower."
      ],
      involved: [
        "Most extra sockets come off an existing circuit. We check first that the circuit can take it.",
        "Cables run in the safe zones (straight up or across from the socket), so no one drills into them later.",
        "New circuits, and any work in a bathroom, are notified to building control.",
        "We test and give you a certificate."
      ],
      time: "An hour or two a socket; a new circuit is usually a day",
      paperwork: "Minor Works or Installation Certificate",
      example: { label: "2 extra double sockets", answers: { kind: "extra", count: 2, walls: "stud" } }
    },
    {
      id: "faults",
      name: "Fault finding",
      icon: "i-fault",
      short: "Tripping, flickering, dead sockets or a burning smell. We find the cause and fix it.",
      when: [
        "Your fuse box keeps tripping and you can't find the cause. Try the checks on our safety page first.",
        "Part of your home has no power, or lights flicker or buzz.",
        "You can smell burning or see scorch marks. Switch off at the fuse box and call us."
      ],
      involved: [
        "We start at the fuse box and test circuit by circuit until we find the fault.",
        "Most faults are found within the first hour or two.",
        "We tell you what's wrong and what the repair costs before we do it."
      ],
      time: "Usually one to two hours",
      paperwork: "Minor Works certificate if we change anything",
      example: { label: "One to two hours, including the visit", answers: { problem: "tripping", pattern: "sometimes" } }
    },
    {
      id: "alarms",
      name: "Smoke, heat and CO alarms",
      icon: "i-alarm",
      short: "Mains-powered alarms, linked together: when one goes off, they all do.",
      when: [
        "You only have battery alarms, or yours are more than ten years old. Alarms wear out.",
        "You're a landlord: you need a smoke alarm on every floor used as living space, and a carbon monoxide alarm in any room with a fixed fuel-burning appliance such as a gas boiler or wood burner (gas cookers don't count).",
        "You're renovating or converting a loft. Building regulations usually ask for mains-powered, linked alarms."
      ],
      involved: [
        "Smoke alarms in the hall and on the landing, and a heat alarm in the kitchen, so toast doesn't set it off.",
        "Each alarm has a sealed backup battery, so it still works in a power cut.",
        "They're linked, so an alarm in the kitchen sounds upstairs too.",
        "We test them together and show you the monthly test."
      ],
      time: "Two to four hours for most homes",
      paperwork: "Minor Works certificate",
      example: { label: "2 smoke alarms and a kitchen heat alarm", answers: { count: 2, heat: "yes", co: "no", existing: "none" } }
    }
  ],

  /* ---------- Quote form ---------- */
  jobs: {
    rewire: {
      name: "Rewire",
      title: "Rewire",
      icon: "i-cable",
      hint: "Full or partial",
      includes: ["New consumer unit", "All cables, sockets, switches and light points", "Smoke and heat alarms", "Testing, certificate and building control"],
      photos: ["your fuse box with the cover open", "a few of your sockets and light switches", "any old cables you can see (loft, under the stairs, by the meter)"],
      questions: [
        { id: "ptype", label: "What kind of property is it?", short: "Property", options: [
          { value: "flat", label: "Flat or maisonette", times: 0.9 },
          { value: "terraced", label: "Terraced house", times: 1 },
          { value: "semi", label: "Semi-detached house", times: 1.05 },
          { value: "detached", label: "Detached house", times: 1.12 }
        ] },
        { id: "beds", label: "How many bedrooms?", short: "Bedrooms", options: [
          { value: "1", label: "1", base: [3600, 4800] },
          { value: "2", label: "2", base: [4800, 6400] },
          { value: "3", label: "3", base: [6200, 8200] },
          { value: "4", label: "4", base: [7800, 10200] },
          { value: "5", label: "5 or more", base: [9800, 13500] }
        ] },
        { id: "scope", label: "Full or partial rewire?", short: "Rewire", options: [
          { value: "full", label: "Full rewire", times: 1 },
          { value: "partial", label: "Partial", hint: "One floor, or the kitchen and a few rooms", times: 0.55, note: "Partial rewires vary a lot. Tell us which rooms in your message." }
        ] },
        { id: "occupied", label: "Will you live there during the work?", short: "Lived in during the work", options: [
          { value: "no", label: "No, it will be empty", times: 1 },
          { value: "yes", label: "Yes", hint: "We work room by room and leave power on each evening", times: 1.12 }
        ] },
        { id: "plaster", label: "Plastering over the cable channels afterwards?", short: "Plastering", options: [
          { value: "no", label: "Our builder or decorator will do it", times: 1 },
          { value: "yes", label: "Please arrange it", hint: "Our plasterer follows us in", times: 1.18 }
        ] }
      ]
    },

    "consumer-unit": {
      name: "Consumer unit (fuse box) upgrade",
      title: "Fuse box",
      icon: "i-board",
      hint: "Consumer unit upgrade",
      includes: ["Metal consumer unit and main switch", "Surge protection", "Testing every circuit, and labels", "Certificate and building control"],
      photos: ["your fuse box with the cover open, close enough to read the labels", "your meter and the cables between it and the fuse box", "the pipes by your gas and water meters (we look for the green and yellow earth cables)"],
      questions: [
        { id: "circuits", label: "How many switches or fuses does your fuse box have?", short: "Circuits now", help: "Count the small switches or fuse holders in a row, not the main switch.", options: [
          { value: "up-to-6", label: "Up to 6", base: [620, 820] },
          { value: "7-10", label: "7 to 10", base: [740, 960] },
          { value: "11-14", label: "11 to 14", base: [860, 1140] },
          { value: "unsure", label: "Not sure", base: [620, 1140] }
        ] },
        { id: "rcd", label: "Is there an RCD on it now?", short: "RCD now", help: "An RCD has a small button marked T or Test.", options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No", extra: [0, 150], note: "With no RCD now, a new one may trip on old faults. We test first and tell you before fixing anything." },
          { value: "unsure", label: "Not sure", extra: [0, 150] }
        ] },
        { id: "board", label: "Which kind of new board?", short: "New board", options: [
          { value: "rcbo", label: "RCBO board", hint: "Recommended: a fault only switches off its own circuit", times: 1.2 },
          { value: "rcd", label: "Dual RCD board", hint: "Cheaper: a fault switches off half the house", times: 1 }
        ] },
        { id: "bonding", label: "Is there a green and yellow cable clamped to your gas and water pipes?", short: "Earth cables on gas and water pipes", options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No", extra: [120, 240], note: "We'd add main bonding cables to your gas and water pipes. The regulations need them." },
          { value: "unsure", label: "Not sure", extra: [0, 240] }
        ] }
      ]
    },

    "ev-charger": {
      name: "EV charger installation",
      title: "EV charger",
      icon: "i-ev",
      hint: "Home charger, 7 kW",
      includes: ["Charger's own circuit and protection", "Earthing to suit your supply", "Network operator notified", "Wi-Fi and app set-up, and certificate"],
      photos: ["your fuse box and your meter", "the wall where you'd like the charger", "the route the cable would take", "the main fuse by the meter (look, don't open it: it's often marked 60, 80 or 100)"],
      questions: [
        { id: "parking", label: "Where do you park?", short: "Parking", options: [
          { value: "driveway", label: "Driveway" },
          { value: "garage", label: "Garage" },
          { value: "offstreet", label: "Other off-street space", hint: "For example a bay behind flats", extra: [150, 400], note: "For a shared car park you'll need the freeholder's permission before we start." },
          { value: "street", label: "On the street only", stop: "We can't fit a home charger for on-street parking: a cable across the pavement isn't allowed without your council's permission. Ask your council about on-street charge points or approved pavement channels. You can still send us a question." }
        ] },
        { id: "distance", label: "How far is the charger spot from your fuse box?", short: "Distance from the fuse box", help: "Roughly, following the walls.", options: [
          { value: "under5", label: "Under 5 metres" },
          { value: "5to15", label: "5 to 15 metres", extra: [120, 260] },
          { value: "15to25", label: "15 to 25 metres", extra: [300, 550] },
          { value: "over25", label: "Over 25 metres", extra: [550, 950], note: "Over 25 metres we'd like to visit and measure first." }
        ] },
        { id: "route", label: "How would the cable get there?", short: "Cable route", options: [
          { value: "outside", label: "Along the outside wall" },
          { value: "inside", label: "Through the house", hint: "Under floors or through rooms", extra: [150, 350] },
          { value: "ground", label: "Under the ground", hint: "Across a garden or drive", extra: [400, 900] }
        ] },
        { id: "charger", label: "The charger itself", short: "Charger", options: [
          { value: "supply", label: "Please supply one", hint: "A 7 kW smart charger with a 3-year warranty", base: [1000, 1300] },
          { value: "own", label: "I've bought one", hint: "Fitting only", base: [600, 800] }
        ] },
        { id: "board", label: "Your fuse box", short: "Fuse box", options: [
          { value: "modern", label: "Modern, with RCDs" },
          { value: "old", label: "Old, full or not sure", extra: [0, 250], note: "If your fuse box is old it may need replacing first. We'll say from your photos." }
        ] }
      ]
    },

    eicr: {
      name: "EICR (electrical safety report)",
      title: "EICR",
      icon: "i-report",
      hint: "Safety report",
      includes: ["Inspection and testing of every circuit", "Written report within two working days", "Plain notes on anything that needs fixing"],
      photos: ["your fuse box (it helps us bring the right parts)"],
      questions: [
        { id: "ptype", label: "What kind of property is it?", short: "Property", options: [
          { value: "flat", label: "Flat or maisonette", times: 0.9 },
          { value: "house", label: "House", times: 1 },
          { value: "hmo", label: "Shared house (HMO)", times: 1.35, note: "HMOs often need fire alarm and emergency lighting checks too. We quote those separately." },
          { value: "business", label: "Shop, office or café", hint: "One fuse board", base: [280, 420] }
        ] },
        { id: "beds", label: "How many bedrooms?", short: "Bedrooms", showIf: { ptype: ["flat", "house", "hmo"] }, options: [
          { value: "1", label: "Studio or 1", base: [170, 200] },
          { value: "2", label: "2", base: [195, 235] },
          { value: "3", label: "3", base: [225, 275] },
          { value: "4", label: "4", base: [260, 320] },
          { value: "5", label: "5 or more", base: [300, 380] }
        ] },
        { id: "reason", label: "Why do you need it?", short: "Reason", options: [
          { value: "landlord", label: "I'm a landlord", note: "Several rented homes? Book them together on our landlords page and save 10% on three or more." },
          { value: "moving", label: "Buying or selling" },
          { value: "check", label: "Peace of mind" },
          { value: "asked", label: "Insurer or lender asked" }
        ] },
        { id: "boards", label: "How many fuse boards are there?", short: "Fuse boards", help: "A garage, annexe or outbuilding may have its own.", options: [
          { value: "one", label: "One" },
          { value: "more", label: "Two or more", extra: [60, 120] }
        ] }
      ]
    },

    lighting: {
      name: "Lighting",
      title: "Lighting",
      icon: "i-bulb",
      hint: "Fittings, downlights, outdoor",
      count: "count",
      minimum: 95,
      includes: ["Fitting and connecting", "Fire-rated downlights where needed", "Testing and certificate"],
      photos: ["the ceiling or wall where the lights go", "the fittings, if you've bought them", "your fuse box"],
      questions: [
        { id: "kind", label: "What kind of lighting job?", short: "Job", options: [
          { value: "replace", label: "Replace light fittings", hint: "Using the existing wiring", each: [70, 110] },
          { value: "downlights", label: "New LED downlights", each: [80, 120] },
          { value: "outdoor", label: "Outside lights", hint: "Wall lights or with a sensor", each: [160, 260] },
          { value: "circuit", label: "A new lighting circuit", hint: "Extension, loft or garden room", base: [350, 550], each: [70, 110] }
        ] },
        { id: "count", type: "count", label: "How many lights?", short: "Lights", min: 1, max: 30, start: 4 },
        { id: "access", label: "What's above the ceiling?", short: "Above the ceiling", showIf: { kind: ["downlights", "circuit"] }, options: [
          { value: "loft", label: "A loft we can get into" },
          { value: "floor", label: "Another floor", hint: "We lift a few boards or cut small access holes", times: 1.25 }
        ] }
      ]
    },

    sockets: {
      name: "Sockets and switches",
      title: "Sockets",
      icon: "i-socket",
      hint: "Extra, USB, outdoor",
      count: "count",
      minimum: 95,
      includes: ["Sockets and back boxes", "Cables in the safe zones", "Testing and certificate"],
      photos: ["the wall where you want the sockets", "your fuse box"],
      questions: [
        { id: "kind", label: "What do you need?", short: "Job", options: [
          { value: "extra", label: "Extra double sockets", each: [130, 190] },
          { value: "usb", label: "Swap to USB sockets", hint: "In the same place", each: [60, 95] },
          { value: "outdoor", label: "Outdoor socket", hint: "Weatherproof, RCD-protected", each: [190, 290] },
          { value: "circuit", label: "A new circuit", hint: "Oven, hob or electric shower", each: [380, 650], note: "A new circuit needs space in your fuse box. Send us a photo of it." }
        ] },
        { id: "count", type: "count", label: "How many?", short: "How many", min: 1, max: 20, start: 2 },
        { id: "walls", label: "What are the walls like?", short: "Walls", options: [
          { value: "stud", label: "Hollow (plasterboard)" },
          { value: "solid", label: "Solid (brick or block)", hint: "We cut a channel and you'll need a little filling", times: 1.15 },
          { value: "unsure", label: "Not sure", times: 1.08 }
        ] }
      ]
    },

    faults: {
      name: "Fault finding",
      title: "Fault finding",
      icon: "i-fault",
      hint: "Tripping, no power, flicker",
      base: [110, 230],
      // What we charge: the visit and first hour, then each half hour after. Shown on the safety page.
      rates: { firstHour: 110, halfHour: 35 },
      includes: ["The visit and the first hour", "Then charged by the half hour", "Repairs priced before we do them"],
      photos: ["your fuse box after it tripped (which switch is down)", "any scorch marks or damage (don't touch them)"],
      questions: [
        { id: "problem", label: "What's happening?", short: "Problem", options: [
          { value: "tripping", label: "Fuse box keeps tripping", note: "Try the checks on our safety page first: an appliance is often the cause." },
          { value: "nopower", label: "No power to part of the house" },
          { value: "flicker", label: "Lights flicker or buzz" },
          { value: "burning", label: "Burning smell or scorch marks", note: "Switch that circuit off at the fuse box now and don't use it. If there's smoke or fire, get out and call 999." },
          { value: "other", label: "Something else" }
        ] },
        { id: "pattern", label: "When does it happen?", short: "When", options: [
          { value: "always", label: "All the time" },
          { value: "sometimes", label: "Now and then" },
          { value: "rain", label: "When it rains", hint: "Often an outside light or socket" }
        ] }
      ]
    },

    alarms: {
      name: "Smoke, heat and CO alarms",
      title: "Alarms",
      icon: "i-alarm",
      hint: "Mains-powered, linked",
      count: "count",
      minimum: 150,
      includes: ["Mains-powered alarms with backup batteries", "All linked together", "Testing and certificate"],
      photos: ["your hall and landing ceilings", "your fuse box"],
      questions: [
        { id: "count", type: "count", label: "How many smoke alarms?", short: "Smoke alarms", help: "Usually one in the hall and one on each landing.", min: 1, max: 10, start: 2, each: [95, 140] },
        { id: "heat", label: "A heat alarm in the kitchen?", short: "Kitchen heat alarm", options: [
          { value: "yes", label: "Yes", extra: [95, 140] },
          { value: "no", label: "No" }
        ] },
        { id: "co", label: "A carbon monoxide alarm?", short: "CO alarm", help: "For a room with a gas boiler, open fire or wood burner.", options: [
          { value: "yes", label: "Yes", extra: [70, 110] },
          { value: "no", label: "No" }
        ] },
        { id: "existing", label: "What's there now?", short: "Alarms now", options: [
          { value: "none", label: "Nothing, or battery alarms" },
          { value: "mains", label: "Mains-powered alarms", hint: "We replace them on the same wiring", times: 0.75 }
        ] }
      ]
    }
  },

  // The order of the job buttons on the quote form.
  jobOrder: ["rewire", "consumer-unit", "ev-charger", "eicr", "lighting", "sockets", "faults", "alarms"],

  /* ---------- Landlord EICR booking ----------
     Each property is priced with the EICR job above. */
  landlords: {
    maxProperties: 12,
    discount: { from: 3, percent: 10 },
    // Dates on offer: the first is `leadDays` working days from today, then `dates` working days in all
    // (Monday to Saturday; Saturdays are mornings only). Visitors pick up to `maxDates`.
    leadDays: 2,
    dates: 21,
    maxDates: 3
  },

  // Answers for "best time to call" and "when would you like it done" on the forms.
  contactTimes: ["Any time we're open", "Mornings", "Afternoons", "Message me, please don't call"],
  timings: ["As soon as you can", "In the next two weeks", "In the next month or two", "Just getting prices for now"]
};
