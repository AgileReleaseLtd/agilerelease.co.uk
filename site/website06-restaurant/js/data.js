/* Jonjoli: the restaurant's menu, opening hours, booking rules and private dining. Every page reads this
   one file, so a price, a dish or an opening time is changed here and nowhere else.

   SAMPLE SITE: Jonjoli is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for drama
   (020 7946 0xxx and 07700 900xxx), and the email addresses use the reserved .example domain. */
window.Jonjoli = {
  // true = booking, enquiry and contact buttons show what would happen instead of opening WhatsApp,
  // the phone or email.
  sample: true,

  name: "Jonjoli",
  whatsapp: "447700900618",
  phone: "020 7946 0618",
  phoneLink: "+442079460618",
  email: "table@jonjoli.example",
  eventsEmail: "feasts@jonjoli.example",
  address: "4 Tarragon Yard, Clapton, London E5",

  // Opening hours, in London time. 0 = Sunday, 1 = Monday ... 6 = Saturday. Each pair is [open, close].
  hours: {
    0: [["12:00", "21:00"]],
    1: [],
    2: [["17:30", "22:30"]],
    3: [["12:00", "15:00"], ["17:30", "22:30"]],
    4: [["12:00", "15:00"], ["17:30", "22:30"]],
    5: [["12:00", "15:00"], ["17:30", "23:00"]],
    6: [["12:00", "15:30"], ["17:30", "23:00"]]
  },
  // The kitchen takes its last food orders this many minutes before closing.
  lastOrdersMinutes: 45,

  // Closed every year on these days (MM-DD), whatever the weekday.
  closedEveryYear: {
    "12-25": "Christmas Day",
    "12-26": "Boxing Day",
    "01-01": "New Year's Day"
  },
  // One-off closures (YYYY-MM-DD), for example a holiday or a private hire of the whole restaurant.
  closedDates: {},

  booking: {
    // How far ahead a table can be requested, in days (today counts as day 1).
    days: 42,
    // A same-day request must be at least this many minutes before the table time. Sooner: phone us.
    noticeMinutes: 120,
    // Party sizes the booking form takes. Bigger groups go to the private dining enquiry.
    maxGuests: 8,
    // Tables of this many or more pay a deposit per head when the booking is confirmed.
    depositFrom: 6,
    depositPerHead: 10,
    depositRefundHours: 48,
    // Bookable service periods by weekday. Either times every `step` minutes from `first` to `last`,
    // or fixed `sittings` ([time, what it means]).
    services: {
      0: [{ name: "Sunday supra", first: "12:00", last: "19:00", step: 30 }],
      2: [{ name: "Dinner", first: "17:30", last: "21:30", step: 15 }],
      3: [{ name: "Lunch", first: "12:00", last: "14:00", step: 15 }, { name: "Dinner", first: "17:30", last: "21:30", step: 15 }],
      4: [{ name: "Lunch", first: "12:00", last: "14:00", step: 15 }, { name: "Dinner", first: "17:30", last: "21:30", step: 15 }],
      5: [
        { name: "Lunch", first: "12:00", last: "14:00", step: 15 },
        { name: "Dinner", sittings: [["18:00", "First sitting: the table is yours until 8:15pm"], ["20:30", "Second sitting: stay until we close at 11pm"]] }
      ],
      6: [
        { name: "Lunch", first: "12:00", last: "14:30", step: 30 },
        { name: "Dinner", sittings: [["18:00", "First sitting: the table is yours until 8:15pm"], ["20:30", "Second sitting: stay until we close at 11pm"]] }
      ]
    },
    occasions: ["Birthday", "Anniversary", "Date night", "Engagement", "Family meal", "Work meal", "Something else"]
  },

  serviceCharge: 12.5,

  // Dietary tags. A vegan dish also counts as vegetarian and dairy-free in the menu filter.
  diets: {
    vg: "Vegan",
    v: "Vegetarian",
    gf: "Gluten-free",
    df: "Dairy-free"
  },

  // The 14 allergens that UK food law says we must tell you about.
  allergens: {
    celery: "Celery",
    gluten: "Gluten",
    crustaceans: "Crustaceans",
    eggs: "Eggs",
    fish: "Fish",
    lupin: "Lupin",
    milk: "Milk",
    molluscs: "Molluscs",
    mustard: "Mustard",
    nuts: "Tree nuts",
    peanuts: "Peanuts",
    sesame: "Sesame",
    soya: "Soya",
    sulphites: "Sulphites"
  },

  // The menu. price in pounds. diets: tags above. allergens: { key: "what exactly" } ("" when the name says it all).
  // featured: shown on the home page.
  menu: [
    {
      id: "pickles", title: "Pickles & bread", ka: "Mzhave da puri", icon: "i-jar",
      intro: "Start here while you decide.",
      dishes: [
        { id: "jonjoli", name: "Jonjoli & house pickles", desc: "Pickled bladdernut flower buds, the pickle we are named after, with green tomatoes and beetroot-pink cabbage.", price: 6, diets: ["vg", "gf"], allergens: { sulphites: "wine vinegar" } },
        { id: "shotis", name: "Shotis puri", desc: "Long loaf slapped on to the wall of the tone oven. Hot, crisp and chewy, with Kakhetian sunflower oil.", price: 4.5, diets: ["vg"], allergens: { gluten: "wheat" } },
        { id: "mchadi", name: "Mchadi", desc: "Little cornbreads from western Georgia, crisp outside and soft in the middle.", price: 4.5, diets: ["vg", "gf"], allergens: {} }
      ]
    },
    {
      id: "cold", title: "Cold plates", ka: "Tsivi kerdzebi", icon: "i-leaf",
      intro: "Walnuts, garlic and herbs, pounded the old way.",
      dishes: [
        { id: "pkhali", name: "Pkhali trio", desc: "Spinach, beetroot and leek, each pounded with walnuts, garlic, coriander and blue fenugreek. Pomegranate seeds on top.", price: 12, diets: ["vg", "gf"], allergens: { nuts: "walnuts" }, featured: true },
        { id: "badrijani", name: "Badrijani", desc: "Fried aubergine rolled around walnut and garlic paste, with pomegranate and purple basil.", price: 11, diets: ["vg", "gf"], allergens: { nuts: "walnuts" }, featured: true },
        { id: "salad", name: "Georgian salad", desc: "Tomatoes, cucumber, red onion and purple basil in a walnut dressing. Ask and we will make it with sunflower oil instead.", price: 9.5, diets: ["vg", "gf"], allergens: { nuts: "walnuts" } },
        { id: "satsivi", name: "Satsivi", desc: "Cold poached chicken in a rich walnut sauce with garlic and Imeretian saffron (dried marigold). A winter feast dish.", price: 13, diets: ["gf", "df"], allergens: { nuts: "walnuts" } },
        { id: "gadazelili", name: "Gadazelili", desc: "Soft sulguni cheese rolled with fresh mint, sitting in matsoni (our own yoghurt).", price: 10.5, diets: ["v", "gf"], allergens: { milk: "" } }
      ]
    },
    {
      id: "khachapuri", title: "Khachapuri", ka: "From the tone oven", icon: "i-oven",
      intro: "Cheese bread, baked to order. Allow fifteen minutes.",
      dishes: [
        { id: "adjaruli", name: "Adjaruli khachapuri", desc: "The boat. Sulguni and imeruli cheese, a raw egg yolk and a slab of butter. Stir it all together at the table and tear off the crust to dip.", price: 16.5, diets: ["v"], allergens: { gluten: "wheat", milk: "", eggs: "" }, featured: true },
        { id: "imeruli", name: "Imeruli khachapuri", desc: "Round, flat and cut into eight, with cheese all the way through. Made for sharing.", price: 14, diets: ["v"], allergens: { gluten: "wheat", milk: "" } },
        { id: "megruli", name: "Megruli khachapuri", desc: "Imeruli with another layer of sulguni baked on top, for people who think there can never be enough cheese.", price: 16, diets: ["v"], allergens: { gluten: "wheat", milk: "", eggs: "egg wash" } },
        { id: "lobiani", name: "Lobiani", desc: "Bread filled with kidney beans cooked with onion, savory and coriander, brushed with sunflower oil.", price: 12, diets: ["vg"], allergens: { gluten: "wheat" } }
      ]
    },
    {
      id: "khinkali", title: "Khinkali", ka: "Folded by hand every afternoon", icon: "i-dumpling",
      intro: "Hold one by its knot, bite a small hole, sip the broth, then eat the rest. Leave the knot on the plate.",
      dishes: [
        { id: "kalakuri", name: "Kalakuri khinkali", desc: "Beef and pork with coriander, chilli and plenty of broth. Black pepper on top.", price: 13, unit: "for five", diets: ["df"], allergens: { gluten: "wheat" }, featured: true },
        { id: "soko", name: "Mushroom khinkali", desc: "Chestnut and oyster mushrooms with onion, thyme and a little chilli.", price: 12, unit: "for five", diets: ["vg"], allergens: { gluten: "wheat" } },
        { id: "kveli", name: "Cheese and mint khinkali", desc: "Sulguni and cottage cheese with fresh mint, finished with melted butter.", price: 12.5, unit: "for five", diets: ["v"], allergens: { gluten: "wheat", milk: "" } }
      ]
    },
    {
      id: "fire", title: "Fire & clay pot", ka: "Mtsvadi da ketsi", icon: "i-flame",
      intro: "Grilled over vine cuttings, or slow-cooked and served in clay.",
      dishes: [
        { id: "mtsvadi", name: "Pork mtsvadi", desc: "Pork neck grilled over vine cuttings, with raw onion, pomegranate and tkemali, our sour plum sauce.", price: 22, diets: ["gf", "df"], allergens: {}, featured: true },
        { id: "soko-mtsvadi", name: "Mushroom mtsvadi", desc: "King oyster mushrooms over the vine fire, with ajika (red pepper and blue fenugreek paste) and herbs.", price: 17, diets: ["vg", "gf"], allergens: {} },
        { id: "shkmeruli", name: "Chicken shkmeruli", desc: "Half a chicken, fried until crisp, then baked in garlic and cream in a clay ketsi. Bring bread for the sauce.", price: 23, diets: ["gf"], allergens: { milk: "" } },
        { id: "chakapuli", name: "Chakapuli", desc: "Lamb shoulder braised with tarragon, white wine and sour green plums. A spring dish we cook all year.", price: 25, diets: ["gf", "df"], allergens: { sulphites: "wine" } },
        { id: "kalmakhi", name: "Kalmakhi", desc: "Whole rainbow trout grilled on the bone, stuffed with tarragon, with pomegranate sauce.", price: 21, diets: ["gf", "df"], allergens: { fish: "trout" } },
        { id: "lobio", name: "Lobio", desc: "Red beans stewed in a clay pot with coriander, savory and ground walnuts. Served with mchadi and pickles.", price: 15, diets: ["vg", "gf"], allergens: { nuts: "walnuts", sulphites: "pickles" } },
        { id: "ajapsandali", name: "Ajapsandali", desc: "Aubergine, peppers, tomato and potato, cooked slowly with a big handful of herbs.", price: 16, diets: ["vg", "gf"], allergens: { celery: "" } }
      ]
    },
    {
      id: "sides", title: "On the side", ka: "Garnirebi", icon: "i-bowl",
      dishes: [
        { id: "potatoes", name: "Fried potatoes", desc: "Fried in sunflower oil with onion and dill, the way every Georgian grandmother makes them.", price: 6, diets: ["vg", "gf"], allergens: {} },
        { id: "greens", name: "Herb plate", desc: "Tarragon, coriander, purple basil, spring onion and radishes. Eat them between bites, like we do.", price: 5, diets: ["vg", "gf"], allergens: {} },
        { id: "tkemali", name: "Tkemali", desc: "Sour plum sauce, green or red. Good with everything from the grill.", price: 2.5, diets: ["vg", "gf"], allergens: {} },
        { id: "matsoni", name: "Matsoni", desc: "Our own thick, sour yoghurt.", price: 3, diets: ["v", "gf"], allergens: { milk: "" } }
      ]
    },
    {
      id: "sweet", title: "Sweet", ka: "Tkbili", icon: "i-sweet",
      dishes: [
        { id: "pelamushi", name: "Pelamushi", desc: "Grape must set into a soft, deep purple pudding, with crushed walnuts.", price: 7.5, diets: ["vg", "gf"], allergens: { nuts: "walnuts" }, featured: true },
        { id: "churchkhela", name: "Churchkhela", desc: "Walnuts on a string, dipped again and again in thickened grape juice. Two pieces, with tea.", price: 6, diets: ["vg"], allergens: { nuts: "walnuts", gluten: "wheat flour" } },
        { id: "gozinaki", name: "Gozinaki & matsoni", desc: "Walnuts set in honey, broken into shards, with a bowl of cold matsoni.", price: 7, diets: ["v", "gf"], allergens: { nuts: "walnuts", milk: "" } },
        { id: "napoleoni", name: "Napoleoni", desc: "Thin pastry layers and vanilla custard, the cake at every Georgian birthday.", price: 7.5, diets: ["v"], allergens: { gluten: "wheat", milk: "", eggs: "" } },
        { id: "sorbet", name: "Sour plum & tarragon sorbet", desc: "Sharp, cold and bright green. Nut-free and dairy-free.", price: 6, diets: ["vg", "gf"], allergens: {} }
      ]
    }
  ],

  // Feast menus. The whole table orders the same feast. groups: only for groups of 9 or more.
  feasts: [
    {
      id: "supra", name: "The supra", price: 45, minGuests: 2,
      blurb: "Our feast menu. The table fills up, empties, and fills up again.",
      courses: [
        ["To start", "Pkhali trio, badrijani, Georgian salad, jonjoli and pickles, mchadi"],
        ["From the oven", "Imeruli khachapuri"],
        ["Khinkali", "Beef and pork, or mushroom"],
        ["From the fire", "Pork mtsvadi and chicken shkmeruli, with lobio and fried potatoes"],
        ["Sweet", "Pelamushi and churchkhela, with Georgian tea"]
      ],
      allergens: "Contains gluten, milk, tree nuts (walnuts) and sulphites. We can change it for most allergies and for vegetarians with a day's notice."
    },
    {
      id: "garden", name: "The garden supra", price: 40, minGuests: 2, vegan: true,
      blurb: "The same five rounds, all vegan. Georgian cooking is full of it: the church calendar has a lot of fasting days.",
      courses: [
        ["To start", "Pkhali trio, badrijani, Georgian salad, jonjoli and pickles, mchadi"],
        ["From the oven", "Lobiani"],
        ["Khinkali", "Mushroom"],
        ["From the fire", "Mushroom mtsvadi, ajapsandali and lobio"],
        ["Sweet", "Pelamushi and sour plum sorbet"]
      ],
      allergens: "Contains gluten, tree nuts (walnuts), celery and sulphites."
    },
    {
      id: "grand", name: "The grand supra", price: 62, minGuests: 9, groups: true,
      blurb: "For groups. A bigger supra, with an Adjaruli khachapuri for every four people, chakapuli and trout, and a chacha toast.",
      courses: [
        ["To start", "Pkhali trio, badrijani, satsivi, Georgian salad, gadazelili, pickles, mchadi"],
        ["From the oven", "Imeruli and Adjaruli khachapuri"],
        ["Khinkali", "Beef and pork, mushroom, and cheese and mint"],
        ["From the fire", "Pork mtsvadi, chakapuli, kalmakhi trout, lobio"],
        ["Sweet", "Napoleoni, pelamushi and churchkhela, and a glass of chacha"]
      ],
      allergens: "Contains gluten, milk, eggs, fish, tree nuts (walnuts) and sulphites. Tell us about allergies when you book and we will plan around them."
    },
    {
      id: "standing", name: "The standing feast", price: 32, minGuests: 20, groups: true,
      blurb: "For parties on your feet. Plates come round for two hours, then the khachapuri arrives.",
      courses: [
        ["Passed round", "Pkhali on mchadi, badrijani, khinkali, mushroom and pork mtsvadi skewers"],
        ["To share", "Imeruli and Adjaruli khachapuri, cut into fingers"],
        ["Sweet", "Churchkhela and gozinaki"]
      ],
      allergens: "Contains gluten, milk, eggs, tree nuts (walnuts) and sulphites."
    }
  ],
  winePairing: 34,

  // Drinks. Wine prices: [125 ml glass, 750 ml bottle].
  drinks: [
    {
      title: "Qvevri wine", note: "Made in clay jars buried in the ground, by small family wineries in Kakheti and Imereti. Glass 125 ml, bottle 750 ml. All our wines contain sulphites.",
      items: [
        { name: "Rkatsiteli", kind: "Amber, Kakheti", desc: "Six months on its skins in qvevri. Dried apricot, black tea and a firm grip.", glass: 8.5, bottle: 39 },
        { name: "Kisi", kind: "Amber, Kakheti", desc: "Orange peel, quince and honey, then a long, dry finish.", glass: 10, bottle: 46 },
        { name: "Tsolikouri", kind: "White, Imereti", desc: "Light, fresh and lemony. Very good with khachapuri.", glass: 8, bottle: 36 },
        { name: "Saperavi", kind: "Red, Kakheti", desc: "Deep, dark and plummy. Our house red.", glass: 9.5, bottle: 44 },
        { name: "Ojaleshi", kind: "Red, Samegrelo", desc: "Lighter, peppery and full of wild berries. Lovely served a little cool.", glass: 11, bottle: 52 }
      ]
    },
    {
      title: "Something else",
      items: [
        { name: "Chacha", kind: "25 ml", desc: "Georgian grape spirit, for the toasts.", price: 6 },
        { name: "Tarkhuna", kind: "Alcohol-free", desc: "Our own tarragon soda. Bright green and not too sweet.", price: 4.5 },
        { name: "Sour plum spritz", kind: "Alcohol-free", desc: "Tkemali plums, soda and mint.", price: 5.5 },
        { name: "Georgian black tea", kind: "Pot for one", desc: "From Guria, with lemon or a spoon of jam.", price: 3.5 }
      ]
    }
  ],

  privateDining: {
    // Group sizes the enquiry form takes.
    minGuests: 9,
    maxGuests: 90,
    depositPerHead: 20,
    finalNumbersHours: 72,
    // How far ahead a group can enquire, in months.
    monthsAhead: 12,
    spaces: [
      {
        id: "longtable", name: "The long table", where: "Ground floor, by the tone oven",
        seated: [9, 14], standing: 0, stepFree: true, mondays: false,
        blurb: "One long oak table at the back of the dining room, with a heavy curtain you can draw across. Step-free, and you can watch the bread go into the oven.",
        minSpend: null,
        spendNote: "No minimum spend. The table orders one of our feast menus."
      },
      {
        id: "marani", name: "The Marani", where: "Downstairs, a room of your own",
        seated: [12, 24], standing: 30, stepFree: false, mondays: false,
        blurb: "Our cellar room, built around two old qvevri we brought back from Kakheti. Brick arches, candles, one long table and your own playlist. Down fourteen stairs, with no lift.",
        // Minimum spend on food and drink, before service, by weekday (0 = Sunday).
        minSpend: { 0: 900, 2: 700, 3: 700, 4: 700, 5: 1400, 6: 1400 }
      },
      {
        id: "whole", name: "The whole restaurant", where: "Both floors, just for you",
        seated: [25, 60], standing: 90, stepFree: true, mondays: true,
        blurb: "For weddings, launches and very big birthdays. We can open on a Monday, when we are normally closed.",
        minSpend: { 0: 5000, 1: 3000, 2: 4000, 3: 4000, 4: 4000, 5: 7500, 6: 7500 }
      }
    ],
    extras: [
      { id: "pairing", name: "Qvevri wine pairing", price: "£34 a head", blurb: "Four glasses, chosen to follow the feast." },
      { id: "chacha", name: "A chacha toast", price: "£6 a head", blurb: "A glass of grape spirit for each guest, for the big toast." },
      { id: "singers", name: "Georgian table singers", price: "from £380", blurb: "A trio sings the old feast songs in three-part harmony between the courses." },
      { id: "cake", name: "Your own cake", price: "no charge", blurb: "Bring it in the afternoon. We plate it, light the candles and bring it out with the tea." },
      { id: "menus", name: "Printed menus", price: "£2 a head", blurb: "Your names or a message at the top of each guest's menu." }
    ]
  },

  vouchers: {
    amounts: [25, 50, 100],
    // The supra for two with a bottle of Saperavi: 2 x £45 + £44.
    supraForTwo: 134,
    validMonths: 12,
    postage: 2
  }
};
