/* Nightjar Locksmiths: prices, rates, areas, arrival times, opening hours and contact details. Every page
   reads this one file, so a price or an area is changed here and nowhere else.

   SAMPLE SITE: Nightjar Locksmiths is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept
   for drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. */
window.Nightjar = {
  // true = call, WhatsApp and email buttons explain what they would do instead of opening the phone,
  // WhatsApp or email.
  sample: true,

  name: "Nightjar Locksmiths",
  whatsapp: "447700900247",
  mobile: "07700 900247",
  phone: "020 7946 0247",
  phoneLink: "+442079460247",
  email: "help@nightjarlocks.example",
  address: "4 Bellcote Arcade, Hornchurch RM11",

  // Rates by time of day. rateAt() in core.js decides which one applies at any moment:
  // night 10pm to 7am every day and all day on bank holidays; evening 6pm to 10pm on weekdays and
  // 7am to 10pm at weekends; day 7am to 6pm Monday to Friday.
  rates: {
    day: { label: "Day", short: "Day", long: "Day rate", hours: "Monday to Friday, 7am to 6pm" },
    evening: { label: "Evening and weekend", short: "Evening", long: "Evening and weekend rate", hours: "Weekdays 6pm to 10pm, weekends 7am to 10pm" },
    night: { label: "Night and bank holiday", short: "Night", long: "Night rate", hours: "Every night 10pm to 7am, and all day on bank holidays" }
  },
  // Added to a job's day price when it is done in the evening, at a weekend or at night.
  surcharge: { day: 0, evening: 30, night: 60 },
  // Taken off a new lock's price when we fit it on the same visit as a lock-out (we're already there).
  lockoutLockDiscount: 30,

  // Bank holidays in England, charged at the night rate all day. Format YYYY-MM-DD.
  bankHolidays: {
    "2026-12-25": "Christmas Day",
    "2026-12-28": "Boxing Day (substitute day)",
    "2027-01-01": "New Year's Day",
    "2027-03-26": "Good Friday",
    "2027-03-29": "Easter Monday",
    "2027-05-03": "Early May bank holiday",
    "2027-05-31": "Spring bank holiday",
    "2027-08-30": "Summer bank holiday",
    "2027-12-27": "Christmas Day (substitute day)",
    "2027-12-28": "Boxing Day (substitute day)",
    "2028-01-03": "New Year's Day (substitute day)",
    "2028-04-14": "Good Friday",
    "2028-04-17": "Easter Monday",
    "2028-05-01": "Early May bank holiday",
    "2028-05-29": "Spring bank holiday",
    "2028-08-28": "Summer bank holiday",
    "2028-12-25": "Christmas Day",
    "2028-12-26": "Boxing Day"
  },

  // The shop in Bellcote Arcade (key cutting, locks, advice). The phones are answered 24 hours a day.
  // 1 = Monday ... 6 = Saturday, 0 = Sunday. null = shut.
  shop: {
    1: ["08:30", "17:30"], 2: ["08:30", "17:30"], 3: ["08:30", "17:30"], 4: ["08:30", "17:30"],
    5: ["08:30", "17:30"], 6: ["09:00", "13:00"], 0: null
  },

  // Travel bands. travel = added to every job in that band. arrive = typical minutes from the call to
  // the locksmith at your door, [shortest, longest], by rate. Typical, not promised: on the phone we
  // give a real time.
  bands: {
    A: { name: "Home patch", travel: 0, arrive: { day: [20, 35], evening: [20, 35], night: [25, 40] } },
    B: { name: "Close by", travel: 15, arrive: { day: [30, 45], evening: [30, 45], night: [35, 50] } },
    C: { name: "Further out", travel: 30, arrive: { day: [45, 60], evening: [40, 60], night: [45, 70] } }
  },

  // Postcode districts we cover. at = [km east, km north] of the shop, for the map.
  districts: {
    RM11: { band: "A", places: "Hornchurch, Emerson Park, Ardleigh Green", at: [0.5, 1] },
    RM12: { band: "A", places: "Hornchurch south, Elm Park", at: [-1.5, -2] },
    RM14: { band: "A", places: "Upminster, Cranham", at: [2.2, -1.1] },
    RM2: { band: "A", places: "Gidea Park", at: [-1.5, 2.1] },
    RM1: { band: "A", places: "Romford town centre", at: [-3, 1.2] },
    RM3: { band: "B", places: "Harold Wood, Harold Hill", at: [1, 3.8] },
    RM7: { band: "B", places: "Rush Green, Mawneys", at: [-4.2, 1] },
    RM5: { band: "B", places: "Collier Row", at: [-4.4, 3.6] },
    RM13: { band: "B", places: "Rainham, South Hornchurch, Wennington", at: [-2.1, -5.1] },
    RM10: { band: "B", places: "Dagenham east", at: [-4.2, -2.3] },
    RM6: { band: "B", places: "Chadwell Heath", at: [-6.7, 0.9] },
    RM8: { band: "B", places: "Becontree north", at: [-6.7, -1.2] },
    RM9: { band: "C", places: "Becontree south, Dagenham", at: [-6.3, -3.4] },
    RM4: { band: "C", places: "Havering-atte-Bower, Stapleford Abbotts", at: [-3.9, 6.2] },
    RM15: { band: "C", places: "South Ockendon, Aveley", at: [4.4, -5.7] },
    IG3: { band: "C", places: "Seven Kings, Goodmayes", at: [-8.4, -0.2] },
    IG6: { band: "C", places: "Barkingside, Hainault", at: [-9.1, 3.2] },
    IG2: { band: "C", places: "Gants Hill, Newbury Park", at: [-10.1, 1.2] },
    IG1: { band: "C", places: "Ilford", at: [-10.7, -0.9] },
    IG11: { band: "C", places: "Barking", at: [-9.9, -3.3] },
    CM14: { band: "C", places: "Brentwood, Warley", at: [5.1, 6] },
    CM13: { band: "C", places: "Hutton, Ingrave, Herongate", at: [7.2, 5.4] }
  },

  // Prices in pounds, VAT included, parts and labour.
  // day = the day price. Evening, weekend and night prices add the surcharge above, except where a job
  // lists its own prices. extra = each extra lock of the same kind fitted on the same visit.
  // from = the price starts here and depends on what we find; we confirm it before we start.
  groups: {
    lockout: "Lock-outs",
    change: "Lock changes",
    upgrade: "Anti-snap upgrades",
    upvc: "UPVC and composite door repairs",
    burglary: "Burglary repairs",
    safe: "Safes",
    extras: "Small security extras",
    keys: "Keys cut in the shop"
  },
  jobs: {
    lockout: {
      group: "lockout", name: "Lock-out: getting you back in", short: "Lock-out entry",
      prices: { day: 95, evening: 125, night: 165 },
      note: "Most doors open without damage. If a lock has to be drilled, we tell you first and agree the new lock's price before we drill."
    },
    euro: {
      group: "change", name: "Euro cylinder (UPVC and composite doors)", short: "Euro cylinder lock change",
      day: 95, extra: 60, lockType: "euro",
      note: "TS 007 3-star anti-snap as standard. We don't fit basic cylinders on outside doors."
    },
    mortice: {
      group: "change", name: "Mortice deadlock, 5-lever (BS 3621)", short: "Mortice deadlock change",
      day: 145, extra: 115, lockType: "mortice",
      note: "The key-operated deadlock most home insurers ask for on front and back doors."
    },
    sashlock: {
      group: "change", name: "Mortice sashlock, 5-lever (BS 3621)", short: "Sashlock change",
      day: 155, extra: 125, lockType: "mortice",
      note: "A deadlock with a handle and latch, usually on back doors."
    },
    nightlatch: {
      group: "change", name: "Nightlatch, standard", short: "Nightlatch change",
      day: 125, extra: 95, lockType: "nightlatch",
      note: "The surface-mounted latch that locks when the door shuts."
    },
    nightlatchBS: {
      group: "change", name: "Nightlatch, British Standard (BS 3621)", short: "British Standard nightlatch",
      day: 185, extra: 155, lockType: "nightlatch",
      note: "Deadlocks with the key from both sides. Accepted by most insurers on its own."
    },
    snap3: {
      group: "upgrade", name: "Anti-snap cylinder, TS 007 3-star", short: "Anti-snap upgrade (3-star)",
      day: 95, extra: 60, lockType: "euro",
      note: "Tested against snapping. Keyed alike, so one key opens every door, at no extra cost."
    },
    snapDiamond: {
      group: "upgrade", name: "Anti-snap cylinder, Sold Secure SS312 Diamond", short: "Anti-snap upgrade (Diamond)",
      day: 125, extra: 85, lockType: "euro",
      note: "Tested against snapping, bumping, picking and drilling. Keyed alike at no extra cost."
    },
    upvcAdjust: {
      group: "upvc", name: "Stiff or dropped door: adjust and service", short: "UPVC door adjustment",
      day: 85,
      note: "Hinges, keeps and mechanism lined up and lubricated. No new parts."
    },
    upvcGearbox: {
      group: "upvc", name: "Broken handle or key won't turn: new gearbox", short: "UPVC gearbox replacement",
      day: 145, from: true,
      note: "The centre case of the multipoint lock, matched to your door."
    },
    upvcMulti: {
      group: "upvc", name: "New multipoint mechanism, full length", short: "UPVC multipoint mechanism",
      day: 225, from: true,
      note: "Hooks, rollers and gearbox replaced in one piece."
    },
    upvcStuck: {
      group: "upvc", name: "Door stuck locked: open and repair", short: "UPVC door stuck shut",
      day: 135, from: true,
      note: "We open it, find the broken part and fix it the same visit if we carry the part."
    },
    makeSafe: {
      group: "burglary", name: "Make secure after a break-in", short: "Make secure after a break-in",
      day: 145, from: true,
      note: "Temporary repair or board-up so the house can be locked tonight. Materials listed on the receipt."
    },
    frame: {
      group: "burglary", name: "Forced door frame: splice and reinforce", short: "Door frame repair",
      day: 195, from: true,
      note: "New timber spliced in where the frame split, with a steel reinforcing plate."
    },
    safeOpen: {
      group: "safe", name: "Open a locked safe (lost key or code)", short: "Safe opening",
      day: 180, from: true,
      note: "Tell us the make and model and we give you a fixed price on the phone."
    },
    safeFit: {
      group: "safe", name: "Bolt a safe to the floor or wall", short: "Safe fitting",
      day: 95,
      note: "Home and small office safes up to 100 kg."
    },
    safeCode: {
      group: "safe", name: "Change a safe's combination", short: "Safe combination change",
      day: 65,
      note: "Mechanical and electronic locks. Bring proof the safe is yours."
    },
    limiter: {
      group: "extras", name: "Door chain or door limiter", short: "Door limiter",
      day: 45,
      note: "Open the door a little to see who's there. Fitted to a solid part of the frame."
    },
    letterbox: {
      group: "extras", name: "Letterbox guard", short: "Letterbox guard",
      day: 55,
      note: "Stops keys and latches being reached through the letterbox."
    },
    viewer: {
      group: "extras", name: "Door viewer (spy hole)", short: "Door viewer",
      day: 45,
      note: "Wide-angle, fitted at the height of the person who answers the door."
    },
    windowLock: {
      group: "extras", name: "Window locks", short: "Window locks",
      day: 35, extra: 25,
      note: "Key-locking handles or restrictors, for the first window."
    },
    sashJammer: {
      group: "extras", name: "Sash jammers, pair", short: "Sash jammers",
      day: 40, extra: 30,
      note: "Extra locking points for UPVC doors and windows."
    },
    keyStd: {
      group: "keys", name: "Standard door keys", short: "Key cutting",
      day: 6, shop: true,
      note: "Yale-type and mortice keys, while you wait."
    },
    keyEuro: {
      group: "keys", name: "Euro cylinder keys", short: "Euro key cutting",
      day: 9, shop: true,
      note: "Most UPVC and composite door keys, while you wait."
    }
  },

  // Jobs people can book ahead on the quote form (in this order).
  bookable: ["snap3", "snapDiamond", "euro", "mortice", "sashlock", "nightlatch", "nightlatchBS",
    "upvcAdjust", "upvcGearbox", "upvcMulti", "frame", "limiter", "letterbox", "viewer", "windowLock",
    "sashJammer", "safeFit", "safeCode", "safeOpen"],

  // Booked (non-urgent) work: how many days ahead, and the time slots. evening: true = evening rate.
  bookingDays: 14,
  slots: {
    morning: { label: "Morning", hours: "8am to 12pm" },
    afternoon: { label: "Afternoon", hours: "12pm to 4pm" },
    late: { label: "After work", hours: "4pm to 6pm" },
    evening: { label: "Evening", hours: "6pm to 8pm", evening: true }
  },

  // The lock finder on the security page: what a door usually has and what we would fit.
  doors: {
    upvc: {
      label: "UPVC or composite door",
      has: "A multipoint lock: hooks and bolts along the edge, worked by the handle, and a euro cylinder that the key turns.",
      insurers: "Most accept a multipoint lock with a cylinder rated TS 007 3-star or Sold Secure SS312 Diamond. Check your policy.",
      fit: ["snap3", "snapDiamond"],
      tip: "If the handle has to be lifted hard to lock, the door has dropped. An adjustment now saves a gearbox later."
    },
    front: {
      label: "Wooden front door",
      has: "Usually a nightlatch (the latch that locks when the door shuts) and, on many doors, a mortice deadlock lower down.",
      insurers: "Most ask for a 5-lever mortice deadlock to BS 3621 on the final exit door, or a British Standard nightlatch.",
      fit: ["mortice", "nightlatchBS"],
      tip: "A nightlatch on its own can often be slipped. A deadlocking one, or a mortice deadlock as well, stops that."
    },
    back: {
      label: "Wooden back door",
      has: "Usually a mortice sashlock: one lock with a handle, a latch and a key-operated bolt.",
      insurers: "Most ask for a 5-lever lock to BS 3621, plus bolts at top and bottom on the inside.",
      fit: ["sashlock", "mortice"],
      tip: "Old 2- or 3-lever sashlocks are common on back doors and easy to beat. Look for BS 3621 on the faceplate."
    },
    patio: {
      label: "Patio or French doors",
      has: "Usually a multipoint lock with a euro cylinder, or a sliding door lock with a cylinder.",
      insurers: "Most accept a multipoint lock with a 3-star or Diamond cylinder. Older sliding doors may need anti-lift blocks.",
      fit: ["snap3", "snapDiamond"],
      tip: "On French doors, check the second door's shoot bolts reach the frame and the floor. If they don't, the lock does little."
    }
  }
};
