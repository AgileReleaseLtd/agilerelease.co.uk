/* Pinn Plumbing & Heating: prices, call-out rates, areas covered, emergency advice, the boiler service
   booking options and contact details. Every page reads this one file, so a price, an area or an opening
   time is changed here and nowhere else.

   SAMPLE SITE: Pinn Plumbing & Heating is made up. The phone and WhatsApp numbers are in Ofcom's
   ranges kept for drama (020 7946 0xxx and 07700 900xxx), the email uses the reserved .example domain,
   the street is invented (Pinner is real) and the Gas Safe number is an example.
   The National Gas Emergency Service number (0800 111 999) and the Gas Safe Register's number
   (0800 408 5500) are real and must stay correct. */
window.Pinn = {
  // true = the WhatsApp, phone and email buttons and the forms show what would happen instead of opening
  // WhatsApp, the phone or email. The gas emergency number is never intercepted.
  sample: true,

  name: "Pinn Plumbing & Heating",
  short: "Pinn Plumbing",
  whatsapp: "447700900583",
  mobile: "07700 900583",
  phone: "020 7946 0583",
  phoneLink: "+442079460583",
  email: "hello@pinnheating.example",
  address: "Unit 4, Brindle Mews, Pinner HA5",
  // The street is made up, so the map link searches for the neighbourhood.
  mapQuery: "Pinner HA5",

  // Example only: the firm's real Gas Safe registration number goes here.
  gasSafeNumber: "000000",
  gasSafeExample: true,

  // Real numbers. Do not change them to drama numbers.
  gasEmergency: { name: "National Gas Emergency Service", phone: "0800 111 999", link: "0800111999" },
  gasSafeRegister: { phone: "0800 408 5500", web: "https://www.gassaferegister.co.uk/" },

  // When the office answers messages and books work. The emergency line is answered 24 hours.
  // 1 = Monday ... 6 = Saturday, 0 = Sunday. null = closed.
  office: {
    1: ["08:00", "18:00"], 2: ["08:00", "18:00"], 3: ["08:00", "18:00"], 4: ["08:00", "18:00"],
    5: ["08:00", "18:00"], 6: ["08:00", "13:00"], 0: null
  },

  // Bank holidays in England: the night rate applies all day, and no routine work is booked.
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
    "2027-12-28": "Boxing Day (substitute day)"
  },

  // Call-out and hourly rates, VAT included. The first hour includes getting to you; after that it is
  // charged by the half hour. Which band applies is worked out in js/time.js (rateAt).
  rates: [
    { id: "day", name: "Working hours", short: "working-hours rate", when: "Monday to Friday, 8am to 6pm", firstHour: 95, halfHour: 40 },
    { id: "evening", name: "Evenings and Saturdays", short: "evening rate", when: "Weekdays 6pm to 10pm, Saturdays 8am to 10pm", firstHour: 145, halfHour: 60 },
    { id: "night", name: "Nights, Sundays and bank holidays", short: "night rate", when: "10pm to 8am, all day Sunday and bank holidays", firstHour: 195, halfHour: 80 }
  ],

  // Fixed-price jobs, VAT included. from: true shows "from".
  fixed: [
    { id: "service", name: "Annual boiler service", price: 95, note: "Any make of gas boiler, with a written report." },
    { id: "cp12", name: "Landlord gas safety certificate (CP12)", price: 80, note: "Up to 3 gas appliances. £15 for each extra one." },
    { id: "both", name: "Boiler service and CP12 together", price: 150, note: "One visit. Saves £25." },
    { id: "tap", name: "Replace a kitchen or basin tap", price: 125, note: "Fitting only: your tap, or one we supply at cost." },
    { id: "toilet", name: "Fix a toilet that keeps running", price: 135, note: "New fill or flush valve, parts included." },
    { id: "radiator", name: "Swap a radiator, like for like", price: 195, note: "Same size and pipe positions. Radiator extra." },
    { id: "trv", name: "Thermostatic radiator valve", price: 75, note: "Each, valve included. Fitted without draining down where we can." },
    { id: "outsidetap", name: "Outside tap fitted", price: 165, note: "With a frost-proof isolating valve inside." },
    { id: "flush", name: "Power flush", price: 495, note: "Up to 10 radiators, with filter and inhibitor." },
    { id: "boiler", name: "New combi boiler, fitted", price: 2650, from: true, note: "Free survey and a written fixed price." }
  ],

  // Areas covered by postcode district. arrival: how soon we usually reach an emergency there.
  // travel: added to the first hour, in pounds.
  zones: [
    {
      id: "home", name: "Home patch", arrival: "usually within the hour", travel: 0,
      districts: {
        HA5: "Pinner, Eastcote, Hatch End",
        HA2: "North Harrow, Rayners Lane, South Harrow",
        HA4: "Ruislip, South Ruislip",
        HA6: "Northwood"
      }
    },
    {
      id: "near", name: "Close by", arrival: "usually within 90 minutes", travel: 0,
      districts: {
        HA1: "Harrow, Harrow on the Hill",
        HA3: "Kenton, Harrow Weald, Wealdstone",
        HA7: "Stanmore",
        UB9: "Harefield, Denham",
        UB10: "Ickenham, Hillingdon",
        WD19: "South Oxhey, Carpenders Park",
        WD23: "Bushey"
      }
    },
    {
      id: "outer", name: "Further out", arrival: "usually within 2 hours", travel: 20,
      districts: {
        HA0: "Wembley, Alperton, Sudbury",
        HA8: "Edgware, Burnt Oak",
        HA9: "Wembley Park",
        UB4: "Hayes, Yeading",
        UB5: "Northolt",
        UB8: "Uxbridge, Cowley",
        WD3: "Rickmansworth, Croxley Green",
        WD17: "Watford",
        WD18: "West Watford"
      }
    }
  ],

  /* ---------- Is it an emergency? ----------
     Each step is [what to do, more detail]. Kept short on purpose: people read this in a hurry.
     figure: the drawing shown beside the steps (an <svg> id on emergency.html). */
  emergencies: {
    leak: {
      label: "Water is leaking",
      sub: "A leak, a burst pipe or water through a ceiling",
      title: "Turn the water off first",
      intro: "Most of the damage is done in the first few minutes. Stop the water, then call us.",
      figure: "fig-stopcock",
      steps: [
        ["Turn off the stopcock.", "It is usually under the kitchen sink, where the water pipe comes into your home. Turn it clockwise until it stops. In a flat it may be in a hall cupboard or by the front door."],
        ["Keep away from wet electrics.", "If water is near sockets, lights or the fuse box, do not touch them. If you can reach the fuse box from a dry floor with dry hands, switch the main switch off."],
        ["Drain the pipes.", "Turn on the cold taps and flush the toilets to empty the pipes. Switch off the boiler and any immersion heater."],
        ["Catch what you can.", "Buckets and towels under the leak. If a ceiling is bulging, put a bucket under it and keep people out of the room."],
        ["Then call us.", "Tell us where the water is coming from. Take a few photos for your insurer while you wait."]
      ],
      note: "Cannot find the stopcock, or it will not turn? Call us and we will talk you through it on the phone. If the water is coming from the flat above, knock on their door too.",
      action: "us"
    },
    gas: {
      label: "I can smell gas",
      sub: "Or the carbon monoxide alarm is going off",
      title: "Get out, and call 0800 111 999",
      intro: "Call the National Gas Emergency Service first, not us. The call is free, they answer 24 hours a day, and they come out to make it safe for free.",
      figure: "fig-meter",
      steps: [
        ["Do not use any switches.", "Do not turn lights or anything electrical on or off, including the doorbell. Do not smoke, strike a match or use a lighter."],
        ["Open the doors and windows.", "Let fresh air in as you go."],
        ["Turn off the gas at the meter, if you can.", "Move the lever so it sits at a right angle to the pipe. If your meter is in a cellar or basement, leave it and get out."],
        ["Get everyone outside.", "Then call 0800 111 999 from outside, on a mobile or from a neighbour's phone."],
        ["Wait for the emergency engineer.", "They make the gas safe. If an appliance or a pipe then needs repairing, that is when to call us."]
      ],
      note: "Carbon monoxide alarm going off, or headaches, dizziness or sickness that ease when you go outside? Get into fresh air, turn off gas appliances if you can, and call 0800 111 999. If anyone feels unwell, call NHS 111, or 999 in an emergency.",
      action: "gas"
    },
    heating: {
      label: "No heating or hot water",
      sub: "The boiler has stopped or shows a fault",
      title: "Five checks before you call",
      intro: "A good few boiler call-outs end with a flat battery or low pressure. These checks take five minutes and are safe to do.",
      figure: "fig-gauge",
      steps: [
        ["Is the boiler getting power?", "Check its display is lit and the switch next to it is on. Look at the fuse box for a switch that has tripped."],
        ["Check the pressure gauge.", "With the heating off and cold, it should read between 1 and 1.5 bar. Below 1, top it up with the filling loop as the boiler's handbook shows, or ask us."],
        ["Check the thermostat and the timer.", "Turn the thermostat above the room temperature and check the timer is set to on. Put new batteries in a wireless thermostat."],
        ["Is gas getting through?", "Check your gas hob lights. On a prepayment meter, check there is credit."],
        ["Frozen pipe? Then reset once.", "In a freeze, pour warm (not boiling) water along the plastic pipe that runs from the boiler to the drain outside. Then press reset once. If it stops again, write down the fault code and call us. Never take the boiler's cover off."]
      ],
      note: "Someone at home who is elderly, unwell or a baby? Tell us when you call and we will put you first.",
      action: "us"
    },
    other: {
      label: "Something else",
      sub: "A drip, a slow drain, a noisy radiator",
      title: "Probably not an emergency",
      intro: "Dripping taps, slow drains and cold spots on radiators can usually wait for a booked visit at the daytime rate, which costs less.",
      figure: "fig-photo",
      steps: [
        ["Send us a photo or two.", "Use the quote form. Tell us what is happening and attach the photos in WhatsApp."],
        ["We reply with a price.", "Usually the same working day, with a fixed price or an honest estimate."],
        ["Pick a time that suits you.", "Weekdays or Saturday mornings, at the working-hours rate."]
      ],
      note: "Not sure if it can wait? Call us. We would rather you asked.",
      action: "quote"
    }
  },

  /* ---------- Boiler service booking ---------- */
  services: {
    service: { name: "Annual boiler service", short: "Boiler service", price: 95,
      blurb: "Once a year keeps it safe, efficient and in warranty." },
    cp12: { name: "Landlord gas safety certificate (CP12)", short: "Gas safety certificate (CP12)", price: 80,
      blurb: "The yearly gas safety check a landlord needs." },
    both: { name: "Boiler service and gas safety certificate (CP12)", short: "Service and CP12", price: 150,
      blurb: "Both in one visit, and £25 less." }
  },
  // A CP12 price covers this many gas appliances; each extra one costs extraAppliance.
  cp12Included: 3,
  extraAppliance: 15,

  boilerTypes: [
    { id: "combi", name: "Combi", hint: "Hot water straight from the boiler. No hot water tank." },
    { id: "system", name: "System", hint: "A hot water cylinder in a cupboard, no tanks in the loft." },
    { id: "regular", name: "Regular", hint: "A hot water cylinder and water tanks in the loft." },
    { id: "unsure", name: "Not sure", hint: "No problem. We will see when we get there." }
  ],
  boilerMakes: ["Worcester Bosch", "Vaillant", "Baxi", "Ideal", "Viessmann", "Glow-worm", "Potterton",
    "Intergas", "Alpha", "Ariston", "Vokera", "Main", "Another make", "Not sure"],
  boilerAges: [
    { id: "0-2", name: "Under 2 years", tip: "Most makers' warranties need a yearly service by a Gas Safe engineer. We fill in the warranty log for you." },
    { id: "2-5", name: "2 to 5 years", tip: "Most makers' warranties need a yearly service by a Gas Safe engineer. We fill in the warranty log for you." },
    { id: "6-10", name: "6 to 10 years", tip: "" },
    { id: "11-15", name: "11 to 15 years", tip: "We carry common parts for older boilers, and we will tell you honestly if yours is worth keeping." },
    { id: "15+", name: "Over 15 years", tip: "Parts for older boilers can be hard to find. We will check it over and tell you honestly if it is worth keeping." },
    { id: "unsure", name: "Not sure", tip: "" }
  ],

  booking: {
    // The first bookable day is this many days after today; the last is maxDaysAhead after today.
    minDaysAhead: 2,
    maxDaysAhead: 34,
    slots: {
      am: { name: "Morning", time: "8am to 12pm" },
      pm: { name: "Afternoon", time: "12pm to 5pm" }
    },
    // Which slots run on each day of the week. 1 = Monday ... 6 = Saturday, 0 = Sunday.
    days: { 1: ["am", "pm"], 2: ["am", "pm"], 3: ["am", "pm"], 4: ["am", "pm"], 5: ["am", "pm"], 6: ["am"], 0: [] },
    // Days with no booked work (emergencies only), on top of the bank holidays. Format YYYY-MM-DD.
    closed: {
      "2026-12-24": "Christmas Eve",
      "2026-12-29": "Christmas break",
      "2026-12-30": "Christmas break",
      "2026-12-31": "New Year's Eve"
    }
  },

  /* ---------- Quote with photos ---------- */
  jobTypes: [
    {
      id: "leak", name: "Leak or drip", icon: "i-drop",
      example: "For example: water drips from the pipe under the bathroom basin, worse when the tap runs.",
      photos: ["Where the water is coming from, close up", "The wider area, so we can see the pipes around it"]
    },
    {
      id: "fixtures", name: "Tap, toilet or shower", icon: "i-tap",
      example: "For example: the kitchen tap is stiff and drips. I'd like it replaced with one I've bought.",
      photos: ["The tap, toilet or shower", "Underneath or behind it, where the pipes are"]
    },
    {
      id: "heating", name: "Radiators and heating", icon: "i-radiator",
      example: "For example: two radiators upstairs stay cold at the bottom, and the system is noisy.",
      photos: ["The radiators, including both valves", "The boiler and its controls"]
    },
    {
      id: "boiler-repair", name: "Boiler repair", icon: "i-boiler",
      example: "For example: the boiler shows fault code F28 and won't relight after a reset.",
      photos: ["The boiler's display, showing the fault code", "The label with the make and model (often under the front)"]
    },
    {
      id: "new-boiler", name: "New boiler", icon: "i-flame",
      example: "For example: our boiler is 17 years old. We'd like a price for a new combi in the same place.",
      photos: ["The boiler and the space around it", "The hot water cylinder and loft tanks, if you have them", "The gas meter"]
    },
    {
      id: "other", name: "Something else", icon: "i-wrench",
      example: "Tell us what you need, where it is and when it needs doing by.",
      photos: ["Whatever you are asking about, close up and from a step back"]
    }
  ],
  urgency: [
    { id: "soon", name: "This week" },
    { id: "weeks", name: "In the next few weeks" },
    { id: "planning", name: "Just planning ahead" }
  ],
  callTimes: ["Any time", "Mornings", "Afternoons", "After 5pm"]
};
