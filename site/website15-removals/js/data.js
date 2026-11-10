/* Hither & Thither: prices, vans, items, packing, materials, dates and contact details. Every page reads
   this one file, so a price changes here and nowhere else. All prices include VAT.

   SAMPLE SITE: Hither & Thither is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. */
window.HT = {
  // true = WhatsApp, phone and email buttons show what would happen instead of opening them.
  sample: true,

  name: "Hither & Thither",
  whatsapp: "447700900538",
  phone: "020 7946 0538",
  phoneLink: "+442079460538",
  mobile: "07700 900538",
  email: "hello@hitherandthither.example",
  address: "Unit 2, Ostler Yard, Holloway, London N7",
  // Our yard. Travel fees and the area checker measure from the middle of this postcode district.
  base: "N7",

  /* ---------- Vans and crew ---------- */

  // Each hour is the van's rate plus each mover's rate. The driver is one of the movers.
  moverPerHour: 30,
  minimumHours: 2,
  // Time is rounded up to the next half hour.
  roundTo: 0.5,
  vans: {
    small: { name: "Small van", capacity: 5, perHour: 20, minCrew: 1, fits: "a student room or a few big items" },
    lwb: { name: "Long-wheelbase van", capacity: 11, perHour: 24, minCrew: 1, fits: "a studio flat or a small office" },
    luton: { name: "Luton van with tail lift", capacity: 20, perHour: 30, minCrew: 2, fits: "a one- or two-bedroom flat" },
    lorry: { name: "7.5-tonne lorry", capacity: 38, perHour: 44, minCrew: 3, fits: "a three- or four-bedroom house" },
    fleet: { name: "7.5-tonne lorry and a Luton van", capacity: 58, perHour: 74, minCrew: 4, fits: "five bedrooms and up" }
  },
  // The crews shown in the price table on the home page: [van, movers].
  priceTable: [["small", 1], ["lwb", 1], ["lwb", 2], ["luton", 2], ["luton", 3], ["lorry", 3], ["lorry", 4]],

  /* ---------- Move sizes (by rooms) ---------- */

  // volume in cubic metres; hours = loading and unloading for an average home, both ends together.
  sizes: {
    studio: { name: "Studio flat", short: "studio", volume: 10, van: "lwb", crew: 2, hours: 2.5, icon: "i-studio" },
    bed1: { name: "1-bedroom flat", short: "1-bed", volume: 16, van: "luton", crew: 2, hours: 3.5, icon: "i-bed1" },
    bed2: { name: "2-bedroom flat or house", short: "2-bed", volume: 19, van: "luton", crew: 3, hours: 4.5, icon: "i-bed2" },
    bed3: { name: "3-bedroom house", short: "3-bed", volume: 30, van: "lorry", crew: 3, hours: 6, icon: "i-house" },
    bed4: { name: "4-bedroom house", short: "4-bed", volume: 36, van: "lorry", crew: 4, hours: 7.5, icon: "i-house" },
    bed5: { name: "5 bedrooms or more", short: "5-bed+", volume: 52, van: "fleet", crew: 5, hours: 9, icon: "i-house", survey: true },
    office1: { name: "Small office (up to 5 desks)", short: "small office", volume: 12, van: "luton", crew: 2, hours: 3.5, icon: "i-desk" },
    office2: { name: "Office (6 to 12 desks)", short: "office", volume: 24, van: "lorry", crew: 3, hours: 5.5, icon: "i-desk", survey: true }
  },
  sizeOrder: ["studio", "bed1", "bed2", "bed3", "bed4", "bed5", "office1", "office2"],

  fullness: {
    light: { name: "Light: not much stuff", mult: 0.85 },
    average: { name: "About average", mult: 1 },
    full: { name: "Full: lots of books, toys or tools", mult: 1.2 }
  },

  /* ---------- Small moves (by item) ---------- */

  // volume in cubic metres; mins = minutes to load it and unload it again; heavy = needs two people.
  itemGroups: [
    { name: "Sofas and chairs", items: [
      { id: "sofa2", name: "Sofa, 2-seater", volume: 1.4, mins: 12, heavy: true },
      { id: "sofa3", name: "Sofa, 3-seater or corner", volume: 2.2, mins: 18, heavy: true },
      { id: "armchair", name: "Armchair", volume: 0.7, mins: 6 },
      { id: "chair", name: "Dining or desk chair", volume: 0.25, mins: 2 }
    ] },
    { name: "Beds and bedroom", items: [
      { id: "bedsingle", name: "Single bed frame", volume: 0.8, mins: 8 },
      { id: "beddouble", name: "Double or king bed frame", volume: 1.3, mins: 14, heavy: true },
      { id: "mattress", name: "Mattress", volume: 0.6, mins: 5 },
      { id: "wardrobe", name: "Wardrobe", volume: 1.3, mins: 14, heavy: true },
      { id: "drawers", name: "Chest of drawers", volume: 0.6, mins: 7 },
      { id: "bedside", name: "Bedside table", volume: 0.2, mins: 2 }
    ] },
    { name: "Tables, desks and shelves", items: [
      { id: "table", name: "Dining table", volume: 0.8, mins: 8 },
      { id: "desk", name: "Desk", volume: 0.6, mins: 7 },
      { id: "bookcase", name: "Bookcase or shelves", volume: 0.6, mins: 6 },
      { id: "tv", name: "TV", volume: 0.2, mins: 4 }
    ] },
    { name: "Kitchen and appliances", items: [
      { id: "fridge", name: "Fridge freezer", volume: 0.9, mins: 12, heavy: true },
      { id: "washer", name: "Washing machine", volume: 0.5, mins: 12, heavy: true }
    ] },
    { name: "Boxes, bags and the rest", items: [
      { id: "box", name: "Boxes", volume: 0.07, mins: 1.5 },
      { id: "bag", name: "Suitcases or big bags", volume: 0.1, mins: 1.5 },
      { id: "bike", name: "Bike", volume: 0.5, mins: 4 },
      { id: "other", name: "Other medium things (lamp, rug, plant)", volume: 0.25, mins: 3 }
    ] }
  ],
  // Extra minutes on every small move: parking up, a quick walk-round, strapping the load.
  itemSetupMins: 20,
  // One mover is enough up to this much (and nothing heavy). Over the second figure, three.
  oneMoverUpTo: 3,
  threeMoversOver: 14,

  /* ---------- Distance and travel ---------- */

  // Road miles are about 1.35 times the straight line inside London and 1.2 times on longer runs.
  roadFactor: { near: 1.35, far: 1.2, nearUpTo: 10, farFrom: 40 },
  // Average van speeds, including traffic, in miles per hour: the first 10 miles, the next 20, the rest.
  speeds: [[10, 12], [20, 22], [Infinity, 45]],
  // Rings around the yard, by straight-line miles. travelFee is what we add for getting to your door.
  rings: [
    { id: "home", name: "Home patch", upTo: 3.5, travelFee: 0, blurb: "No travel fee, and short-notice moves are often possible." },
    { id: "london", name: "Across London", upTo: 9, travelFee: 25, blurb: "A £25 travel fee for getting the van to you." },
    { id: "outer", name: "Outer London and the edges", upTo: 17, travelFee: 45, blurb: "A £45 travel fee for getting the van to you." },
    { id: "far", name: "Longer distance", upTo: Infinity, travelFee: null, blurb: "Driving time at half rate, plus fuel. Ask us for a fixed price." }
  ],
  // Driving more than this many road miles on any leg adds fuel and road costs per mile.
  longDistance: { overMiles: 25, fuelPerMile: 0.45, emptyLegRate: 0.5, overnightOverMiles: 150, overnightPerMover: 60 },

  // When the postcode districts are not known, the visitor picks a band of road miles.
  bands: [
    { id: "hop", name: "A short hop", detail: "under 3 miles", min: 1, max: 3 },
    { id: "london", name: "Across London", detail: "3 to 10 miles", min: 3, max: 10 },
    { id: "edge", name: "To the edge of London", detail: "10 to 25 miles", min: 10, max: 25 },
    { id: "counties", name: "Out of London", detail: "25 to 60 miles", min: 25, max: 60 },
    { id: "long", name: "Long distance", detail: "60 to 150 miles", min: 60, max: 150 },
    { id: "verylong", name: "Very long distance", detail: "over 150 miles", min: 150, max: 300 }
  ],

  // London's Congestion Charge (£18 a day from January 2026; check TfL for the current figure). Added when
  // either address is in these districts. SE1, E1 and N1 are only partly inside: we check when we confirm.
  congestion: { charge: 18, zone: "^(EC\\d+[A-Z]?|WC\\d+[A-Z]?|W1[A-Z]?|SW1[A-Z]?|SE1)$" },

  /* ---------- Access ---------- */

  floors: [
    { id: 0, name: "Ground floor, or a house" },
    { id: 1, name: "1st floor" },
    { id: 2, name: "2nd floor" },
    { id: 3, name: "3rd floor" },
    { id: 4, name: "4th floor or higher" }
  ],
  // Share of the time at that end added for each flight of stairs without a lift, or once with a lift.
  stairsPerFloor: 0.07,
  liftExtra: 0.05,
  // name: shown in the calculator; says: how the WhatsApp message puts it.
  parking: [
    { id: "easy", name: "Outside, or a driveway", says: "outside or on a driveway", fee: 0, time: 0 },
    { id: "paid", name: "Pay and display", says: "pay and display nearby", fee: 15, time: 0, line: "Parking meter" },
    { id: "permit", name: "Residents' bays: permit", says: "residents' bays, so it needs a permit or bay suspension", fee: 75, time: 0, line: "Bay suspension or permit (council fees vary; we apply)" },
    { id: "far", name: "Long carry, over 25 m", says: "nowhere close, a carry of over 25 metres", fee: 0, time: 0.15 }
  ],

  /* ---------- Days ---------- */

  // Labour costs more on busy days. 1 = Monday ... 6 = Saturday, 0 = Sunday.
  days: {
    1: { name: "Monday", mult: 1 },
    2: { name: "Tuesday", mult: 1 },
    3: { name: "Wednesday", mult: 1 },
    4: { name: "Thursday", mult: 1 },
    5: { name: "Friday", mult: 1.1 },
    6: { name: "Saturday", mult: 1.15 },
    0: { name: "Sunday", mult: 1.15 }
  },
  bankHolidayMult: 1.15,
  // Bookable days start tomorrow and run this many weeks ahead.
  bookingWeeks: 12,
  // The last this-many working days of each month are completion days for house sales, so they fill up.
  monthEndBusyDays: 2,
  closed: {
    "2026-12-25": "Christmas Day",
    "2026-12-26": "Boxing Day",
    "2027-01-01": "New Year's Day",
    "2027-12-25": "Christmas Day"
  },
  // England and Wales bank holidays (we work them at the weekend rate).
  bankHolidays: {
    "2026-12-28": "Boxing Day (substitute day)",
    "2027-03-26": "Good Friday",
    "2027-03-29": "Easter Monday",
    "2027-05-03": "Early May bank holiday",
    "2027-05-31": "Spring bank holiday",
    "2027-08-30": "Summer bank holiday",
    "2027-12-27": "Christmas Day (substitute day)",
    "2027-12-28": "Boxing Day (substitute day)"
  },
  startTimes: [
    { id: "08:00", name: "8:00am", hint: "Best for full home moves" },
    { id: "09:00", name: "9:00am", hint: "" },
    { id: "10:30", name: "10:30am", hint: "Good if you collect keys first" },
    { id: "13:00", name: "1:00pm", hint: "Small moves, up to about 4 hours" },
    { id: "flex", name: "Flexible", hint: "Whatever suits the day's other jobs" }
  ],
  deposit: 75,

  /* ---------- Packing and extras ---------- */

  // Prices by move size, materials included. Item moves only offer fragile wrapping.
  packing: {
    none: { name: "No packing, thanks", blurb: "You pack. We bring blankets, covers and wrap for the furniture." },
    fragile: { name: "Fragile items only", blurb: "Glass, china, pictures, mirrors and lamps." },
    partial: { name: "Kitchen and breakables", blurb: "The kitchen, plus everything fragile in the home." },
    full: { name: "Full packing", blurb: "Every room, usually the day before. You don't lift a thing." }
  },
  packingPrices: {
    studio: { fragile: 50, partial: 90, full: 180 },
    bed1: { fragile: 70, partial: 130, full: 260 },
    bed2: { fragile: 95, partial: 180, full: 390 },
    bed3: { fragile: 130, partial: 250, full: 560 },
    bed4: { fragile: 170, partial: 320, full: 740 },
    bed5: { fragile: 220, partial: 420, full: 960 },
    office1: { fragile: 60, partial: 110, full: 220 },
    office2: { fragile: 95, partial: 190, full: 420 },
    items: { fragile: 35 }
  },
  dismantle: [
    { id: "bed", name: "Beds", one: "bed", many: "beds", price: 30 },
    { id: "wardrobe", name: "Wardrobes", one: "wardrobe", many: "wardrobes", price: 40 },
    { id: "table", name: "Tables and desks", one: "table or desk", many: "tables and desks", price: 20 },
    { id: "flatpack", name: "Other flat-pack", one: "other flat-pack piece", many: "other flat-pack pieces", price: 20 }
  ],
  specials: [
    { id: "tvbox", name: "TVs packed in a TV box", one: "TV packed in a TV box", many: "TVs packed in TV boxes", price: 18 },
    { id: "art", name: "Large mirrors or pictures, boxed", one: "large mirror or picture, boxed", many: "large mirrors or pictures, boxed", price: 14 }
  ],

  /* ---------- Materials shop ---------- */

  // price in pounds, each. Delivered free with a booked move.
  materials: [
    { group: "Boxes", items: [
      { id: "box-s", name: "Small box", size: "45 × 30 × 30 cm", use: "Books, kitchen, tins", price: 2.2 },
      { id: "box-m", name: "Medium box", size: "50 × 40 × 40 cm", use: "Most things", price: 2.8 },
      { id: "box-l", name: "Large box", size: "60 × 45 × 45 cm", use: "Bedding, cushions, light things", price: 3.4 },
      { id: "wardrobe", name: "Wardrobe box with rail", size: "50 × 50 × 120 cm", use: "Clothes straight off the hanger", price: 12.5 },
      { id: "glass", name: "Glassware box with dividers", size: "36 cells", use: "Glasses and bottles", price: 5.5 },
      { id: "picture", name: "Picture and mirror box", size: "Adjustable", use: "Frames up to 100 × 80 cm", price: 6.5 },
      { id: "tvbox", name: "TV box", size: "Up to 55 inch", use: "With foam corners", price: 15 }
    ] },
    { group: "Wrap and tape", items: [
      { id: "paper", name: "Packing paper", size: "5 kg, about 250 sheets", use: "Plates, glasses, ornaments", price: 14 },
      { id: "bubble", name: "Bubble wrap", size: "50 m roll", use: "Frames, lamps, electronics", price: 16 },
      { id: "tape", name: "Parcel tape", size: "6 rolls", use: "About 40 boxes", price: 8.5 },
      { id: "fragile", name: "Fragile tape", size: "1 roll", use: "So we know at a glance", price: 2.5 },
      { id: "gun", name: "Tape gun", size: "", use: "Saves your thumbs", price: 6.5 },
      { id: "markers", name: "Marker pens", size: "Pack of 3", use: "Room and contents on every box", price: 2 }
    ] },
    { group: "Covers", items: [
      { id: "mattress", name: "Mattress bag", size: "Double or king", use: "Keeps it clean and dry", price: 6 },
      { id: "sofa", name: "Sofa cover", size: "Up to 3-seater", use: "Fabric or leather", price: 7.5 }
    ] },
    { group: "Kits", items: [
      { id: "kit-studio", name: "Studio kit", size: "10 small, 10 medium, paper, 2 rolls tape, markers", use: "", price: 55 },
      { id: "kit-flat", name: "Flat kit (1 to 2 bedrooms)", size: "15 small, 20 medium, 10 large, 2 wardrobe boxes, paper, 6 rolls tape, markers", use: "", price: 139 }
    ] }
  ],
  // name: shown on the page; says: how the customer's WhatsApp message puts it.
  delivery: [
    { id: "move", name: "With my booked move", says: "with my booked move", fee: 0 },
    { id: "home", name: "Delivery in our home patch", says: "to me, in your home patch", fee: 8 },
    { id: "london", name: "Delivery elsewhere in London", says: "to me, elsewhere in London", fee: 15 },
    { id: "collect", name: "I'll collect from the yard", says: "I'll collect from your yard", fee: 0 }
  ],

  /* ---------- Moving checklist ---------- */

  // days: relative to moving day (negative = before).
  checklist: [
    { id: "w8", days: -56, title: "8 weeks before", items: [
      { id: "w8-quotes", text: "Get two or three removal quotes, then book your date. Fridays and the end of the month go first." },
      { id: "w8-notice", text: "Renting? Check your notice period and give notice in writing." },
      { id: "w8-clear", text: "Start clearing out: sell, give to charity, or book your council's bulky waste collection." },
      { id: "w8-measure", text: "Measure big furniture, and the doors, stairs and lift at the new place." }
    ] },
    { id: "w6", days: -42, title: "6 weeks before", items: [
      { id: "w6-pack", text: "Book packing, or order boxes and tape." },
      { id: "w6-parking", text: "Ask both councils about a bay suspension or visitor permits for the van. Some need two weeks' notice." },
      { id: "w6-building", text: "Flats: ask the managing agent about lift bookings and moving-day rules at both buildings." },
      { id: "w6-school", text: "Moving area? Sort school places, and register with a new GP and dentist." }
    ] },
    { id: "w4", days: -28, title: "4 weeks before", items: [
      { id: "w4-broadband", text: "Broadband: move it or give notice now. A new line can take two weeks or more." },
      { id: "w4-post", text: "Set up Royal Mail Redirection. It needs at least five working days." },
      { id: "w4-address", text: "Change your address with your bank, employer, HMRC and pension." },
      { id: "w4-dvla", text: "Update your driving licence and your car's log book (V5C) with DVLA. It's free." },
      { id: "w4-insurance", text: "Arrange home or contents insurance for the new place from moving day." }
    ] },
    { id: "w2", days: -14, title: "2 weeks before", items: [
      { id: "w2-counciltax", text: "Council tax: tell your old council you're leaving and register with the new one." },
      { id: "w2-energy", text: "Tell your gas, electricity and water suppliers your moving date." },
      { id: "w2-tv", text: "Move your TV Licence to the new address online." },
      { id: "w2-vote", text: "Register to vote at your new address." },
      { id: "w2-rooms", text: "Start packing the rooms you use least. Label every box with its room." }
    ] },
    { id: "w1", days: -7, title: "1 week before", items: [
      { id: "w1-confirm", text: "Confirm the time, both addresses and parking with us." },
      { id: "w1-freezer", text: "Eat down the freezer and the fridge." },
      { id: "w1-care", text: "Arrange childcare and somewhere calm for pets on the day." },
      { id: "w1-box", text: "Pack a first-night box: kettle, mugs, tea, chargers, loo roll, bedding, medicines." }
    ] },
    { id: "d2", days: -2, title: "2 days before", items: [
      { id: "d2-defrost", text: "Defrost the freezer and leave the door open to dry, at least 24 hours before." },
      { id: "d2-screws", text: "Taking anything apart yourself? Keep the screws in a labelled bag taped to it." },
      { id: "d2-valuables", text: "Put passports, keys, jewellery and documents in a bag that travels with you." }
    ] },
    { id: "d0", days: 0, title: "Moving day", items: [
      { id: "d0-meters", text: "Take meter readings at both homes and photograph them." },
      { id: "d0-walk", text: "Walk round with our crew lead: what goes, what stays, what's fragile." },
      { id: "d0-check", text: "Last look: loft, cupboards, shed, behind doors." },
      { id: "d0-keys", text: "Lock the windows, take photos for your deposit, and hand over the keys." }
    ] },
    { id: "a1", days: 7, title: "The week after", items: [
      { id: "a1-post", text: "Check your post is being redirected and catch any accounts you missed." },
      { id: "a1-deposit", text: "Renting: check your new deposit is protected, and chase the old one." },
      { id: "a1-boxes", text: "Flatten your boxes. We collect them free in our home patch." }
    ] }
  ]
};
