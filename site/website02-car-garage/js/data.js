/* Gantry Motor Works: opening hours, closed days, prices, services, the jobs people can ask a quote for,
   and the postcode districts we collect from. Every page reads this one file, so a price or an opening
   time is changed here and nowhere else.

   SAMPLE SITE: Gantry Motor Works is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept
   for drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. */
window.Gantry = {
  // true = booking, quote and contact buttons show what would happen instead of opening WhatsApp,
  // the phone or email.
  sample: true,

  name: "Gantry Motor Works",
  shortName: "Gantry",
  whatsapp: "447700900584",
  mobile: "07700 900584",
  phone: "020 7946 0584",
  phoneLink: "+442079460584",
  email: "workshop@gantrymotorworks.example",
  address: ["Unit 3, Linnet Yard", "Walthamstow", "London E17"],

  // Opening hours in London time. 1 = Monday ... 6 = Saturday, 0 = Sunday. null = closed all day.
  hours: {
    1: ["08:00", "18:00"],
    2: ["08:00", "18:00"],
    3: ["08:00", "18:00"],
    4: ["08:00", "18:00"],
    5: ["08:00", "18:00"],
    6: ["08:00", "13:00"],
    0: null
  },

  // Days the garage is shut (bank holidays and the Christmas break). Format YYYY-MM-DD.
  closed: {
    "2026-12-25": "Christmas Day",
    "2026-12-26": "Boxing Day",
    "2026-12-28": "Boxing Day bank holiday",
    "2027-01-01": "New Year's Day",
    "2027-03-26": "Good Friday",
    "2027-03-29": "Easter Monday",
    "2027-05-03": "Early May bank holiday",
    "2027-05-31": "Spring bank holiday",
    "2027-08-30": "Summer bank holiday",
    "2027-12-25": "Christmas Day",
    "2027-12-27": "Christmas Day bank holiday",
    "2027-12-28": "Boxing Day bank holiday",
    "2028-01-03": "New Year's Day bank holiday"
  },

  // Days with shorter hours than usual: [opens, closes, why].
  shortDays: {
    "2026-12-24": ["08:00", "13:00", "Christmas Eve"],
    "2026-12-31": ["08:00", "13:00", "New Year's Eve"],
    "2027-12-24": ["08:00", "13:00", "Christmas Eve"],
    "2027-12-31": ["08:00", "13:00", "New Year's Eve"]
  },

  // Booking: from tomorrow up to this many days ahead. Same-day work is by phone.
  bookingDays: 21,

  // Drop-off times. A drop-off is offered only on days the garage stays open until `needsOpenUntil`.
  dropOff: {
    morning: { label: "Morning", from: "08:00", to: "09:30", ready: "13:00", needsOpenUntil: "13:00" },
    afternoon: { label: "Afternoon", from: "12:30", to: "13:30", ready: "17:30", needsOpenUntil: "18:00" }
  },

  // MOT for cars (class 4). The legal maximum fee is £54.85; we charge less.
  mot: {
    price: 45,
    withService: 35,
    legalMax: 54.85,
    partialRetest: 22.5
  },

  // Labour rate for repairs, VAT included.
  labourRate: 96,

  // Service prices by engine size, VAT, parts, oil and labour included. Fuel adds the amounts in `fuels`.
  sizes: {
    small: { label: "Up to 1.4 litres", short: "Up to 1.4 L", examples: "Fiesta, Polo, Corsa, Yaris" },
    medium: { label: "1.4 to 2.0 litres", short: "1.4 to 2.0 L", examples: "Golf, Focus, Qashqai, Octavia" },
    large: { label: "Over 2.0 litres", short: "Over 2.0 L", examples: "5 Series, XC90, Discovery, vans" }
  },

  fuels: {
    petrol: { label: "Petrol", extra: { interim: 0, full: 0, major: 0 } },
    diesel: { label: "Diesel", extra: { interim: 10, full: 15, major: 35 } },
    hybrid: { label: "Hybrid", extra: { interim: 20, full: 20, major: 20 } }
  },

  services: {
    interim: {
      name: "Interim service",
      short: "Interim",
      prices: { small: 139, medium: 159, large: 189 },
      every: "Every 6 months or 6,000 miles",
      takes: "About 1½ hours",
      blurb: "An oil change and safety check between full services. Good for cars that do a lot of miles."
    },
    full: {
      name: "Full service",
      short: "Full",
      prices: { small: 219, medium: 249, large: 289 },
      every: "Every 12 months or 12,000 miles",
      takes: "About 3 hours",
      blurb: "The yearly service most cars need. Oil, filters and a thorough check from top to bottom."
    },
    major: {
      name: "Major service",
      short: "Major",
      prices: { small: 309, medium: 349, large: 399 },
      every: "Every 2 years or 24,000 miles",
      takes: "Most of the day",
      // Needs a morning drop-off on a full working day (not Saturdays or short days).
      morningOnly: true,
      fullDay: true,
      blurb: "Everything in a full service, plus brake fluid, plugs or fuel filter and the cabin filter."
    }
  },

  // What each service includes. in: [interim, full, major]. fuel: only for these fuels.
  checklist: [
    { item: "Engine oil and oil filter changed", in: [1, 1, 1] },
    { item: "All fluids checked and topped up", in: [1, 1, 1] },
    { item: "Brake pads, discs and pipes checked", in: [1, 1, 1] },
    { item: "Tyre tread, condition and pressures", in: [1, 1, 1] },
    { item: "Lights, horn, wipers and washers", in: [1, 1, 1] },
    { item: "Steering, suspension and exhaust checked", in: [1, 1, 1] },
    { item: "Battery tested", in: [1, 1, 1] },
    { item: "Hybrid system and battery cooling checked", in: [1, 1, 1], fuel: ["hybrid"] },
    { item: "Road test, service light reset, book stamped", in: [1, 1, 1] },
    { item: "Air filter replaced", in: [0, 1, 1] },
    { item: "Fault-code scan", in: [0, 1, 1] },
    { item: "Wheel bearings, drive belts and hoses checked", in: [0, 1, 1] },
    { item: "Antifreeze strength tested", in: [0, 1, 1] },
    { item: "Cabin (pollen) filter replaced", in: [0, 0, 1] },
    { item: "Brake fluid changed", in: [0, 0, 1] },
    { item: "Spark plugs replaced", in: [0, 0, 1], fuel: ["petrol", "hybrid"] },
    { item: "Fuel filter replaced", in: [0, 0, 1], fuel: ["diesel"] }
  ],

  // Jobs people can ask a quote for (the quote form's tick boxes).
  jobs: {
    brakes: { label: "Brakes", hint: "Squeal, grinding or a soft pedal" },
    warning: { label: "Warning light", hint: "Engine, ABS, airbag or another light" },
    clutch: { label: "Clutch or gearbox", hint: "Slipping, heavy or noisy" },
    timing: { label: "Timing belt", hint: "Cam belt and water pump" },
    suspension: { label: "Suspension or steering", hint: "Knocks, pulling or uneven tyre wear" },
    exhaust: { label: "Exhaust", hint: "Blowing, rattling or a smell" },
    aircon: { label: "Air conditioning", hint: "Not cold, or a smell" },
    battery: { label: "Battery or starting", hint: "Slow to start, or flat" },
    tyres: { label: "Tyres or tracking", hint: "New tyres, punctures, alignment" },
    noise: { label: "A noise or vibration", hint: "Tell us when it happens" },
    motfail: { label: "MOT failure repairs", hint: "From an MOT here or elsewhere" },
    other: { label: "Something else", hint: "Describe it below" }
  },

  // Guide prices for common repairs, VAT included, on the prices page. from: true = "from" price (the
  // final price depends on the car). job: the quote form's tick box to start with.
  repairs: [
    { name: "Diagnostic check", price: 60, from: false, note: "Taken off the bill if we do the repair", job: "warning" },
    { name: "Front brake pads", price: 120, from: true, job: "brakes" },
    { name: "Front brake discs and pads", price: 240, from: true, job: "brakes" },
    { name: "Air-con regas", price: 79, from: true, note: "Newer cars use a dearer gas: from £139", job: "aircon" },
    { name: "Four-wheel alignment", price: 65, from: false, job: "tyres" },
    { name: "Battery, supplied and fitted", price: 120, from: true, job: "battery" },
    { name: "Exhaust back box", price: 150, from: true, job: "exhaust" },
    { name: "Timing belt and water pump", price: 420, from: true, job: "timing" },
    { name: "Clutch replacement", price: 550, from: true, job: "clutch" }
  ],

  // Collection and delivery: postcode districts we cover, the area name, and the charge for the round trip.
  collect: {
    districts: {
      E17: ["Walthamstow", 0],
      E10: ["Leyton", 0],
      N17: ["Tottenham", 0],
      E4: ["Chingford", 15],
      E11: ["Leytonstone", 15],
      E18: ["South Woodford", 15],
      E5: ["Clapton", 15],
      N15: ["South Tottenham", 15],
      N18: ["Upper Edmonton", 15],
      IG8: ["Woodford Green", 15]
    },
    // When we pick up and bring back. A collected car comes in at this drop-off time.
    pickup: "We collect between 8am and 9:30am and bring the car back by 6pm.",
    dropOff: "morning",
    station: "8 minutes' walk from Blackhorse Road station (Victoria line and Overground)."
  }
};
