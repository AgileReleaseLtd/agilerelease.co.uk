/* Tessel Cleaning: prices, areas, booking times, checklists and contact details. Every page reads this
   one file, so a price, a postcode or a checklist line is changed here and nowhere else.

   SAMPLE SITE: Tessel Cleaning is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain.

   How the estimate works (js/price.js does the sums):
   - Regular cleans are paid by the hour. Hours come from the bedrooms, plus extra bathrooms, plus extras.
     The first clean in any home takes longer (firstClean), and so does a one-off clean.
   - End-of-tenancy cleans have a fixed price by size. The team's hours are shared between the cleaners.
   - Offices are paid by the hour: 1 hour plus 1 hour for every 100 m2, plus extra toilets.
   Hours are rounded up to the next half hour. Prices include products, equipment and VAT. */
window.Tessel = {
  // true = WhatsApp, phone and email buttons show what would happen instead of opening anything.
  sample: true,

  name: "Tessel Cleaning",
  short: "Tessel",
  whatsapp: "447700900927",
  mobile: "07700 900927",
  phone: "020 7946 0927",
  phoneLink: "+442079460927",
  email: "hello@tesselcleaning.example",
  address: "Unit 3, Fenwray Court, Balham, London SW12",

  // When the office answers the phone and WhatsApp. 1 = Monday ... 6 = Saturday, 0 = Sunday.
  hours: {
    1: ["08:00", "18:00"],
    2: ["08:00", "18:00"],
    3: ["08:00", "18:00"],
    4: ["08:00", "18:00"],
    5: ["08:00", "18:00"],
    6: ["09:00", "13:00"],
    0: null
  },

  /* ---------- Booking ---------- */

  // The first day that can be booked is today plus leadDays. People can book up to bookingDays ahead.
  leadDays: 2,
  bookingDays: 42,

  // We never clean on Sundays. Other days we don't work: [first day, last day, reason]. Format YYYY-MM-DD.
  closedWeekdays: [0],
  closed: [
    ["2026-12-24", "2026-12-28", "Christmas break"],
    ["2027-01-01", "2027-01-01", "New Year's Day"],
    ["2027-03-26", "2027-03-26", "Good Friday"],
    ["2027-03-29", "2027-03-29", "Easter Monday"],
    ["2027-05-03", "2027-05-03", "Early May bank holiday"],
    ["2027-05-31", "2027-05-31", "Spring bank holiday"],
    ["2027-08-30", "2027-08-30", "Summer bank holiday"],
    ["2027-12-24", "2027-12-28", "Christmas break"]
  ],

  /* Arrival windows for each service. maxHours = the longest clean that fits after that arrival (homes
     finish by 6pm; offices by 10pm or before staff arrive). days = weekdays the window runs (1 = Monday). */
  windows: {
    regular: [
      { id: "early", from: "08:30", to: "09:30", maxHours: 8.5, days: [1, 2, 3, 4, 5, 6], label: "Morning" },
      { id: "late-morning", from: "10:30", to: "11:30", maxHours: 6.5, days: [1, 2, 3, 4, 5, 6], label: "Late morning" },
      { id: "afternoon", from: "13:00", to: "14:00", maxHours: 4, days: [1, 2, 3, 4, 5], label: "Afternoon" }
    ],
    tenancy: [
      { id: "full-day", from: "08:00", to: "09:00", maxHours: 9, days: [1, 2, 3, 4, 5, 6],
        label: "Full day", note: "The team stays until every room is signed off." },
      { id: "half-day", from: "12:30", to: "13:00", maxHours: 4.5, days: [1, 2, 3, 4, 5],
        label: "Afternoon start", note: "Small homes only: up to 4½ hours on site." }
    ],
    office: [
      { id: "before", from: "06:00", to: "06:30", maxHours: 2.5, days: [1, 2, 3, 4, 5],
        label: "Before you open", note: "Done by about 9am." },
      { id: "after", from: "18:00", to: "18:30", maxHours: 3.5, days: [1, 2, 3, 4, 5],
        label: "After you close", note: "Done by 10pm at the latest." },
      { id: "saturday", from: "08:00", to: "09:00", maxHours: 5, days: [6],
        label: "Saturday morning", note: "Good for a first deep clean." }
    ]
  },

  // How the cleaners get in. services = which services show this choice (all when left out).
  access: [
    { id: "home", label: "Someone will be home", hint: "To let us in. You don't need to stay." },
    { id: "keysafe", label: "Key safe", hint: "We ask for the code by phone the day before, never by message.",
      ask: "Where is the key safe?", placeholder: "For example: left of the front door, behind the bins" },
    { id: "concierge", label: "Concierge or porter", hint: "Leave the keys at the desk in an envelope marked Tessel.",
      ask: "Building name, and when the desk is open", placeholder: "For example: Harbour House, desk open 7am to 7pm" },
    { id: "agent", label: "Keys from the letting agent", hint: "We collect them, and hand them back after the clean.",
      ask: "Letting agent and branch", placeholder: "For example: the Balham branch of your agent", services: ["tenancy"] },
    { id: "keep", label: "Tessel keeps a key", hint: "On a coded tag, locked away at our office.", services: ["regular", "office"] }
  ],

  parking: [
    { id: "free", label: "Free parking nearby", hint: "A drive, or a street with no daytime restrictions" },
    { id: "permit", label: "I can give a visitor permit" },
    { id: "paid", label: "Pay and display only", hint: "We add the parking to the bill, at cost" },
    { id: "unsure", label: "Not sure" }
  ],

  pets: [
    { id: "none", label: "No pets" },
    { id: "cat", label: "Cat" },
    { id: "dog", label: "Dog" },
    { id: "other", label: "Other" }
  ],

  /* ---------- Areas we cover ----------
     "all" = every service. "oneoff" = end-of-tenancy, one-off and office cleans, but regular home cleans
     only from the waiting list (our cleaners' rounds are full there). */
  areas: {
    SW12: { name: "Balham", status: "all", home: true },
    SW17: { name: "Tooting", status: "all" },
    SW4: { name: "Clapham", status: "all" },
    SW11: { name: "Battersea", status: "all" },
    SW18: { name: "Wandsworth and Earlsfield", status: "all" },
    SW16: { name: "Streatham and Norbury", status: "all" },
    SW2: { name: "Brixton Hill and Streatham Hill", status: "all" },
    SW19: { name: "Wimbledon and Colliers Wood", status: "oneoff" },
    SW15: { name: "Putney and Roehampton", status: "oneoff" },
    SW8: { name: "South Lambeth and Nine Elms", status: "oneoff" },
    SW9: { name: "Stockwell and Brixton", status: "oneoff" },
    CR4: { name: "Mitcham", status: "oneoff" }
  },

  /* ---------- Prices ---------- */

  sizes: ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5 or more bedrooms"],

  services: {
    regular: {
      name: "Regular home cleaning",
      short: "Regular clean",
      icon: "i-home",
      blurb: "The same cleaner, on the same day, every week or two. Kitchen, bathrooms, floors, dusting and the bins.",
      // Pounds an hour, by how often.
      rates: { weekly: 25, fortnightly: 27, oneoff: 30 },
      frequencies: [
        { id: "weekly", label: "Weekly" },
        { id: "fortnightly", label: "Every two weeks" },
        { id: "oneoff", label: "Just once" }
      ],
      // Hours for each visit, by bedrooms (0 = studio, 5 = five or more), with one bathroom.
      hours: [2.5, 2.5, 3, 3.5, 4.5, 5.5],
      extraBathroom: 0.5,
      // The first clean in any home takes this much longer (a one-off clean is always a first clean).
      firstClean: [1, 1, 1, 1.5, 1.5, 2],
      minHours: 2.5
    },
    tenancy: {
      name: "End-of-tenancy cleaning",
      short: "End-of-tenancy clean",
      icon: "i-key",
      blurb: "A top-to-bottom clean of an empty home, worked through room by room against a check-out checklist.",
      // Fixed price and the team's total hours, by bedrooms (0 = studio, 5 = five or more).
      prices: [210, 260, 330, 420, 510, 600],
      teamHours: [5, 6, 8, 10, 12, 14],
      cleaners: [2, 2, 2, 2, 2, 3],
      extraBathroom: { price: 45, hours: 1.5 },
      furnished: { price: 40, hours: 1 },
      deposit: 50
    },
    office: {
      name: "Office cleaning",
      short: "Office clean",
      icon: "i-desk",
      blurb: "Small offices, studios and clinics cleaned before you open or after you close, on the days you choose.",
      rates: { standard: 27, busy: 25 },
      busyVisits: 3, // the lower rate from this many visits a week
      visits: [
        { id: "1", label: "Once a week" },
        { id: "2", label: "Twice a week" },
        { id: "3", label: "Three times a week" },
        { id: "5", label: "Every weekday" }
      ],
      m2PerDesk: 8,
      baseHours: 1,
      m2PerHour: 100,
      extraToilet: 0.25,
      minHours: 1.5,
      maxM2: 400 // bigger offices get a quote after a visit
    }
  },

  /* Extras. For each service: hours (added time), price (fixed), each (a price for every room) or
     "included". once = first visit only on regular and office cleans; perBedroom = hours for each bedroom
     (at least one). On end-of-tenancy cleans, hours and hoursEach add to the team's time. Leave a service
     out to hide the extra for that service. */
  extras: [
    { id: "oven", name: "Inside the oven", note: "Racks, glass door and inside, degreased",
      regular: { hours: 1, once: true }, tenancy: "included" },
    { id: "fridge", name: "Inside the fridge", note: "Emptied shelves washed, seals wiped",
      regular: { hours: 0.5, once: true }, tenancy: "included",
      office: { hours: 0.5, once: true, name: "Inside the fridge and microwave" } },
    { id: "cupboards", name: "Inside kitchen cupboards", note: "Empty cupboards, inside and out",
      regular: { hours: 0.5, once: true }, tenancy: "included" },
    { id: "windows", name: "Inside windows", note: "Glass, frames and sills, from inside",
      regular: { hours: 0.5, once: true }, tenancy: "included",
      office: { hours: 1, once: true, name: "Inside windows and glass partitions" } },
    { id: "linen", name: "Change the bed linen", note: "Leave clean linen on the bed",
      regular: { perBedroom: 0.25 } },
    { id: "ironing", name: "Ironing", note: "Shirts, bedding and the rest, by the hour",
      regular: { hours: 1, count: { label: "Hours of ironing", unit: ["hour", "hours"], max: 3 } } },
    { id: "balcony", name: "Balcony or patio", note: "Swept, railings and glass wiped",
      regular: { hours: 0.5, once: true }, tenancy: { price: 30, hours: 0.5 } },
    { id: "blinds", name: "Blinds, slat by slat", note: "Every blind in the home",
      tenancy: { price: 35, hours: 1 } },
    { id: "outside", name: "Outside of ground-floor windows", note: "That we can reach safely from the ground",
      tenancy: { price: 30, hours: 0.5 } },
    { id: "carpets", name: "Carpet steam clean", note: "Hot-water extraction, dry in about 4 hours",
      regular: { each: 35, once: true, count: { label: "Rooms", unit: ["room", "rooms"], max: 8 } },
      tenancy: { each: 35, hoursEach: 0.5, count: { label: "Rooms", unit: ["room", "rooms"], max: 8 } },
      office: { each: 35, once: true, count: { label: "Rooms (or 20 m² each)", unit: ["room", "rooms"], max: 10 } } }
  ],

  /* ---------- Checklists ----------
     For each service, room by room: what is included (yes) and what is not (no). A "no" line may name an
     extra (extra: id), which links to the estimate. */
  checklists: {
    regular: {
      intro: "What your cleaner does on every visit. If something is not on the list, ask: we can often add it for a visit.",
      rooms: [
        {
          name: "Kitchen", icon: "i-kitchen",
          yes: [
            "Worktops, splashback and the outside of the cupboards wiped",
            "Hob cleaned, and the outside of the oven, fridge, microwave and dishwasher",
            "Sink and taps cleaned and polished dry",
            "Washing up done, or the dishwasher loaded and put on",
            "Bins emptied, wiped and given new bags",
            "Floor vacuumed and mopped"
          ],
          no: [
            { text: "Inside the oven", extra: "oven" },
            { text: "Inside the fridge", extra: "fridge" },
            { text: "Inside the cupboards", extra: "cupboards" },
            { text: "Washing up after a party" }
          ]
        },
        {
          name: "Bathrooms", icon: "i-bath",
          yes: [
            "Toilet cleaned and disinfected, including the base and behind the seat",
            "Bath, shower, screen and tiles cleaned, and light limescale removed",
            "Basin, taps and mirror cleaned and polished",
            "Shelves and the outside of cabinets wiped",
            "Towels folded or hung up",
            "Floor vacuumed and mopped"
          ],
          no: [
            { text: "Heavy limescale or mould in the grout (book a one-off clean)" },
            { text: "Inside bathroom cabinets" }
          ]
        },
        {
          name: "Bedrooms", icon: "i-bed",
          yes: [
            "Beds made",
            "Bedside tables, shelves and surfaces dusted",
            "Clothes folded and left on the bed or a chair",
            "Floors vacuumed, under the bed where we can reach, and hard floors mopped"
          ],
          no: [
            { text: "Changing the bed linen", extra: "linen" },
            { text: "Putting clothes away in drawers and wardrobes" },
            { text: "Inside wardrobes and drawers" }
          ]
        },
        {
          name: "Living areas", icon: "i-sofa",
          yes: [
            "Surfaces, shelves and the TV stand dusted",
            "Cushions plumped and throws folded",
            "Fingerprints wiped from doors, glass and mirrors",
            "Floors vacuumed, rugs included, and hard floors mopped"
          ],
          no: [
            { text: "Inside windows", extra: "windows" },
            { text: "Carpet and rug shampooing", extra: "carpets" },
            { text: "Moving heavy furniture" }
          ]
        },
        {
          name: "Throughout", icon: "i-sparkle",
          yes: [
            "Light switches and door handles wiped",
            "Skirting boards dusted, a few rooms on each visit",
            "Stairs vacuumed and banisters wiped",
            "A note left about anything we noticed, like a dripping tap or the last loo roll"
          ],
          no: [
            { text: "Ironing", extra: "ironing" },
            { text: "Laundry, unless you leave a wash ready to put on" },
            { text: "Outside windows, gardens and garages" }
          ]
        }
      ]
    },

    tenancy: {
      intro: "Written with your deposit in mind: it follows the order an inventory clerk checks a home at check-out. The home should be empty, with the power and hot water on.",
      rooms: [
        {
          name: "Kitchen", icon: "i-kitchen",
          yes: [
            "Oven, grill and hob degreased inside and out, racks and glass door included",
            "Extractor hood cleaned, and its metal filters degreased",
            "Fridge and freezer cleaned inside and out (defrost the freezer the day before)",
            "Every cupboard and drawer cleaned inside and out",
            "Washing machine drawer, seal and door, and the dishwasher filter and seals",
            "Microwave cleaned inside and out",
            "Tiles, grout, worktops and splashback scrubbed",
            "Sink and taps descaled and polished",
            "Kick boards under the units wiped, and the floor scrubbed into the edges"
          ],
          no: [
            { text: "Replacing broken parts, like a missing oven light or a damaged filter (we tell you which)" },
            { text: "A freezer that has not been defrosted (we do what we can)" }
          ]
        },
        {
          name: "Bathrooms", icon: "i-bath",
          yes: [
            "Limescale removed from taps, shower heads, screens and tiles",
            "Toilet descaled and cleaned inside and out, including the base and pipes",
            "Bath, shower tray and basin cleaned, overflows included",
            "Grout and sealant scrubbed, and surface mould treated",
            "Extractor fan cover cleaned",
            "Mirrors and glass polished without streaks",
            "Cabinets cleaned inside and out",
            "Floor scrubbed and dried"
          ],
          no: [
            { text: "Mould that has stained the sealant itself: it needs re-sealing, which is a job for your landlord" },
            { text: "Re-grouting or re-sealing" }
          ]
        },
        {
          name: "Bedrooms and living rooms", icon: "i-bed",
          yes: [
            "Wardrobes, drawers and shelves cleaned inside and out",
            "Skirting boards, doors, door frames and handles washed",
            "Light switches, sockets and light fittings wiped",
            "Radiators wiped, tops and pipes included",
            "Inside windows, frames and sills cleaned",
            "Marks spot-cleaned from walls, where the paint allows",
            "Carpets vacuumed into the edges, and hard floors washed"
          ],
          no: [
            { text: "Carpet steam cleaning", extra: "carpets" },
            { text: "Blinds slat by slat", extra: "blinds" },
            { text: "Curtains (they need a dry cleaner)" },
            { text: "Painting over marks" }
          ]
        },
        {
          name: "Hallways and stairs", icon: "i-stairs",
          yes: [
            "Stairs vacuumed, and banisters and spindles wiped",
            "Front door cleaned on both sides, letterbox and door furniture included",
            "Coat and storage cupboards cleaned inside",
            "Meter cupboard dusted (meters photographed for you)"
          ],
          no: [
            { text: "Outside of windows above the ground floor" },
            { text: "Communal areas of a block of flats" }
          ]
        },
        {
          name: "Throughout", icon: "i-sparkle",
          yes: [
            "Cobwebs removed from ceilings and corners",
            "Every bin emptied and washed",
            "A walk-round with our checklist before we leave, room by room",
            "Photos of each room when we finish, sent to you on WhatsApp"
          ],
          no: [
            { text: "Taking away furniture, belongings or rubbish" },
            { text: "Outside of ground-floor windows", extra: "outside" },
            { text: "Balconies and patios", extra: "balcony" },
            { text: "Gardens and garages" }
          ]
        }
      ],
      before: [
        "Take out all your belongings, including what is in the fridge and the cupboards.",
        "Leave the power and hot water on. We can't clean properly without them.",
        "Switch the freezer off the day before, and leave its door open on a towel.",
        "Tell us how we get in, and where we can park the van."
      ],
      promise: {
        title: "Our 48-hour re-clean promise",
        text: "If your landlord, letting agent or inventory clerk finds something on this checklist that we missed, tell us within 48 hours of the clean, with photos if you can. We come back and clean it again, free, usually within two working days.",
        small: "This is Tessel's own promise. We can't promise what happens to your deposit, because that also depends on damage, wear and tear and the inventory."
      }
    },

    office: {
      intro: "What we do on every visit. We agree the list with you before the first clean, and leave a short note each time.",
      rooms: [
        {
          name: "Desks and work areas", icon: "i-desk",
          yes: [
            "Bins and recycling emptied, with new bags",
            "Clear desks wiped (we don't move papers)",
            "Phones, keyboards and mice wiped with a barely damp cloth",
            "Chairs, shelves and window sills dusted",
            "Carpets vacuumed and hard floors mopped"
          ],
          no: [
            { text: "Moving papers or things on desks" },
            { text: "Inside screens and computers" }
          ]
        },
        {
          name: "Kitchen or tea point", icon: "i-kitchen",
          yes: [
            "Worktops, sink and taps cleaned",
            "Outside of the fridge, microwave and kettle wiped",
            "Dishwasher loaded and put on, or the washing up done",
            "Bins emptied and wiped",
            "Floor mopped"
          ],
          no: [
            { text: "Inside the fridge and microwave", extra: "fridge" },
            { text: "Throwing out food from the fridge, unless you ask" }
          ]
        },
        {
          name: "Toilets and washrooms", icon: "i-bath",
          yes: [
            "Toilets, urinals and basins cleaned and disinfected",
            "Mirrors and taps polished",
            "Soap, paper towels and toilet rolls refilled from your stock",
            "Sanitary bins checked (emptied by your sanitary bin service)",
            "Floor mopped"
          ],
          no: [
            { text: "Supplying soap and paper (we can, at cost, if you ask)" },
            { text: "Blocked toilets and drains" }
          ]
        },
        {
          name: "Meeting rooms and reception", icon: "i-chair",
          yes: [
            "Tables wiped and chairs straightened",
            "Glass doors and partitions cleaned of fingerprints",
            "Reception desk and waiting area dusted",
            "Entrance mat vacuumed"
          ],
          no: [
            { text: "Inside windows and glass partitions, top to bottom", extra: "windows" },
            { text: "Carpet steam cleaning", extra: "carpets" }
          ]
        },
        {
          name: "Throughout", icon: "i-sparkle",
          yes: [
            "Door handles, light switches and lift buttons wiped",
            "Recycling sorted as your building asks",
            "Lights off, windows shut and the alarm set, if you'd like us to",
            "A note left about anything we noticed"
          ],
          no: [
            { text: "Server rooms and anything with a lock we don't hold the key for" },
            { text: "Outside windows and shared parts of the building" }
          ]
        }
      ]
    }
  }
};
