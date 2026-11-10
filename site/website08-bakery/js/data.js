/* Crumb & Candle: opening hours, bake times, the everyday range, allergens, the cake order options and
   the gallery. Every page reads this one file, so a price, a bake time or a closed day is changed here
   and nowhere else.

   SAMPLE SITE: Crumb & Candle is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), the email uses the reserved .example domain, and the street is
   invented (Surbiton is real). */
window.Crumb = {
  // true = order and contact buttons show what would happen instead of opening WhatsApp, the phone or
  // email.
  sample: true,

  name: "Crumb & Candle",
  whatsapp: "447700900736",
  mobile: "07700 900736",
  phone: "020 7946 0736",
  phoneLink: "+442079460736",
  email: "hello@crumbandcandle.example",
  address: "14 Cardell Row, Surbiton, KT6",
  // The street is made up, so the map link searches for the neighbourhood.
  mapQuery: "Surbiton station, Surbiton KT6",

  // Shop opening hours. 1 = Monday ... 6 = Saturday, 0 = Sunday. null = closed all day.
  hours: {
    1: null,
    2: ["07:30", "17:00"],
    3: ["07:30", "17:00"],
    4: ["07:30", "17:00"],
    5: ["07:30", "17:00"],
    6: ["08:00", "17:00"],
    0: ["08:30", "14:00"]
  },
  // Why the shop is shut on a normal closed day; finishes "Closed on Mondays ...".
  closedDayWhy: "while we bake for the week",

  // Days with other hours, or closed (hours: null). "MM-DD" dates repeat every year; a full "YYYY-MM-DD"
  // date is a one-off. "to" is the last day, left out for a single day. "why" finishes the sentence
  // "Closed today ...". Cakes can't be collected on a closed day.
  exceptions: [
    { from: "12-24", hours: ["07:30", "14:00"], label: "Christmas Eve" },
    { from: "12-25", to: "12-28", hours: null, label: "Christmas break", why: "for the Christmas break" },
    { from: "12-31", hours: ["07:30", "15:00"], label: "New Year's Eve" },
    { from: "01-01", hours: null, label: "New Year's Day", why: "for New Year's Day" }
  ],
  // Holiday hours are listed on the site this many days ahead.
  exceptionsAheadDays: 60,

  // Days the cake diary is full: open as normal, but no more cake orders for collection that day.
  fullyBooked: ["2026-12-19", "2026-12-23"],

  // Cake collection slots, by day of the week. Slots that would end after closing time are dropped on
  // days with shorter hours.
  collectionSlots: {
    2: [["10:00", "12:00"], ["12:00", "14:00"], ["14:00", "16:30"]],
    3: [["10:00", "12:00"], ["12:00", "14:00"], ["14:00", "16:30"]],
    4: [["10:00", "12:00"], ["12:00", "14:00"], ["14:00", "16:30"]],
    5: [["10:00", "12:00"], ["12:00", "14:00"], ["14:00", "16:30"]],
    6: [["08:30", "10:30"], ["10:30", "12:30"], ["12:30", "15:00"]],
    0: [["09:00", "11:00"], ["11:00", "13:30"]]
  },

  // What comes out of the oven, and when. days: which days of the week (leave out for every open day).
  bakes: [
    { time: "07:30", name: "Croissants and pain au chocolat", note: "Ready when we open" },
    { time: "07:30", name: "Almond croissants", note: "Weekends", days: [6, 0] },
    { time: "08:00", name: "Sourdough loaves", note: "White, seeded and light rye" },
    { time: "08:30", name: "Challah", note: "Fridays only", days: [5] },
    { time: "08:30", name: "Chocolate babka", note: "Weekends", days: [6, 0] },
    { time: "09:00", name: "Cinnamon and cardamom buns", note: "Still warm until about ten" },
    { time: "10:30", name: "Rosemary focaccia", note: "By the slab" },
    { time: "11:30", name: "Leek and cheddar swirls", note: "For lunch", days: [2, 3, 4, 5, 6] },
    { time: "13:00", name: "Second sourdough bake", note: "For the afternoon", days: [5, 6] }
  ],

  /* The everyday range. Prices in pounds. allergens: which of the four allergens we handle each item
     contains ("gluten", "eggs", "milk", "nuts"). from: bake time, shown next to the section. days:
     only on these days. featured: shown on the home page. */
  range: [
    {
      id: "bread",
      title: "Bread",
      from: "08:00",
      note: "Long-fermented sourdough, shaped by hand and baked here every morning.",
      items: [
        { name: "White sourdough", detail: "800g", price: 5.2, allergens: ["gluten"], featured: true },
        { name: "Seeded sourdough", detail: "Sunflower, pumpkin and linseed", price: 5.8, allergens: ["gluten"], featured: true },
        { name: "Light rye", detail: "Sourdough, 40% rye", price: 5.6, allergens: ["gluten"] },
        { name: "Baguette", detail: "", price: 2.6, allergens: ["gluten"], featured: true },
        { name: "Rosemary focaccia", detail: "A slab, sea salt and olive oil", price: 3.9, allergens: ["gluten"] },
        { name: "Milk loaf", detail: "Soft white tin, for toast and sandwiches", price: 4.4, allergens: ["gluten", "milk"] },
        { name: "Challah", detail: "Fridays only", price: 5.8, allergens: ["gluten", "eggs"], days: [5] }
      ]
    },
    {
      id: "pastries",
      title: "Pastries",
      from: "07:30",
      note: "Laminated with British butter over three days.",
      items: [
        { name: "Butter croissant", detail: "", price: 3.2, allergens: ["gluten", "milk", "eggs"], featured: true },
        { name: "Pain au chocolat", detail: "", price: 3.5, allergens: ["gluten", "milk", "eggs"] },
        { name: "Cinnamon and cardamom bun", detail: "", price: 3.6, allergens: ["gluten", "milk", "eggs"], featured: true },
        { name: "Almond croissant", detail: "Weekends", price: 4.2, allergens: ["gluten", "milk", "eggs", "nuts"], days: [6, 0] },
        { name: "Seasonal fruit danish", detail: "Fruit and custard, changes with the seasons", price: 3.9, allergens: ["gluten", "milk", "eggs"], featured: true },
        { name: "Leek and cheddar swirl", detail: "", price: 3.8, allergens: ["gluten", "milk", "eggs"] },
        { name: "Chocolate babka", detail: "Whole loaf, weekends", price: 13, allergens: ["gluten", "milk", "eggs"], days: [6, 0] }
      ]
    },
    {
      id: "slices",
      title: "Cake by the slice",
      from: "09:00",
      note: "The same sponges as our celebration cakes, cut thick.",
      items: [
        { name: "Lemon drizzle", detail: "", price: 3.6, allergens: ["gluten", "eggs", "milk"] },
        { name: "Chocolate fudge", detail: "", price: 4.4, allergens: ["gluten", "eggs", "milk"], featured: true },
        { name: "Pistachio and raspberry", detail: "", price: 4.8, allergens: ["gluten", "eggs", "milk", "nuts"], featured: true },
        { name: "Carrot and walnut", detail: "Cream cheese frosting", price: 4.4, allergens: ["gluten", "eggs", "milk", "nuts"] },
        { name: "Chocolate and orange", detail: "Vegan", price: 4.4, allergens: ["gluten"], featured: true },
        { name: "Orange and almond", detail: "Made without gluten", price: 4.2, allergens: ["eggs", "nuts"] }
      ]
    }
  ],

  // The 14 allergens UK food law names. used: we handle it in our kitchen.
  allergens: [
    { id: "gluten", name: "Cereals containing gluten", used: true, where: "Wheat, rye and spelt flour in almost everything" },
    { id: "eggs", name: "Eggs", used: true, where: "Cakes, pastries, egg wash, meringue" },
    { id: "milk", name: "Milk", used: true, where: "Butter, cream, cheese and milk" },
    { id: "nuts", name: "Tree nuts", used: true, where: "Almonds, pistachios, hazelnuts and walnuts" },
    { id: "peanuts", name: "Peanuts" },
    { id: "sesame", name: "Sesame" },
    { id: "soya", name: "Soya" },
    { id: "celery", name: "Celery" },
    { id: "mustard", name: "Mustard" },
    { id: "lupin", name: "Lupin" },
    { id: "sulphites", name: "Sulphur dioxide and sulphites" },
    { id: "fish", name: "Fish" },
    { id: "crustaceans", name: "Crustaceans" },
    { id: "molluscs", name: "Molluscs" }
  ],

  /* Celebration cakes. Prices in pounds. A size's "scale" multiplies the flavour, diet and finish extras
     (they are priced for a 6 inch cake). lead: days' notice the size needs. */
  cake: {
    deposit: 0.5,
    maxDaysAhead: 180,
    wordingMax: 40,
    occasions: [
      { id: "birthday", label: "Birthday" },
      { id: "kids", label: "Children's party" },
      { id: "wedding", label: "Wedding" },
      { id: "anniversary", label: "Engagement or anniversary" },
      { id: "baby", label: "Baby shower or naming day" },
      { id: "other", label: "Something else" }
    ],
    sizes: [
      { id: "6in", label: "6 inch round", short: "6 inch", tiers: 1, serves: "12 to 14", price: 58, scale: 1, lead: 5 },
      { id: "8in", label: "8 inch round", short: "8 inch", tiers: 1, serves: "20 to 24", price: 78, scale: 1.5, lead: 5 },
      { id: "10in", label: "10 inch round", short: "10 inch", tiers: 1, serves: "32 to 36", price: 105, scale: 2, lead: 5 },
      { id: "2tier", label: "Two tiers, 6 and 8 inch", short: "Two tiers", tiers: 2, serves: "35 to 40", price: 210, scale: 2.5, lead: 14 },
      { id: "3tier", label: "Three tiers, 6, 8 and 10 inch", short: "Three tiers", tiers: 3, serves: "70 to 80", price: 360, scale: 4.5, lead: 14 }
    ],
    // notFor: diets this can't be made for. nuts: contains nuts. colour: the frosting in the drawing.
    flavours: [
      { id: "vanilla", label: "Vanilla bean", extra: 0, colour: "cream" },
      { id: "chocolate", label: "Chocolate fudge", extra: 0, colour: "cocoa" },
      { id: "lemon", label: "Lemon and elderflower", extra: 0, colour: "lemon" },
      { id: "redvelvet", label: "Red velvet", extra: 0, colour: "cream", notFor: ["vegan"] },
      { id: "carrot", label: "Carrot and walnut", extra: 4, colour: "cream", nuts: true, notFor: ["vegan"] },
      { id: "pistachio", label: "Pistachio and raspberry", extra: 8, colour: "pistachio", nuts: true, notFor: ["eggless", "vegan"] }
    ],
    fillings: [
      { id: "buttercream", label: "Vanilla buttercream", extra: 0 },
      { id: "jam", label: "Raspberry jam and buttercream", extra: 0 },
      { id: "ganache", label: "Dark chocolate ganache", extra: 0 },
      { id: "caramel", label: "Salted caramel buttercream", extra: 4 },
      { id: "curd", label: "Lemon curd and buttercream", extra: 0, notFor: ["eggless", "vegan"] },
      { id: "creamcheese", label: "Cream cheese frosting", extra: 0, notFor: ["vegan"] }
    ],
    diets: [
      { id: "none", label: "No special diet", extra: 0 },
      { id: "eggless", label: "Eggless", hint: "Made without eggs. Contains milk.", extra: 6 },
      { id: "vegan", label: "Vegan", hint: "No eggs, no milk.", extra: 10 },
      { id: "gf", label: "Made without gluten", hint: "Baked in our kitchen with wheat flour, so not for coeliacs.", extra: 10 }
    ],
    finishes: [
      { id: "smooth", label: "Smooth buttercream", hint: "Clean sides and a piped border", extra: 0 },
      { id: "drip", label: "Drip and sprinkles", hint: "Chocolate or raspberry drip", extra: 12 },
      { id: "naked", label: "Semi-naked with berries", hint: "A thin scraped coat and fresh fruit", extra: 8 },
      { id: "piped", label: "Hand-piped decoration", hint: "Roses, daisies or lace, piped by hand", extra: 20 },
      { id: "fresh", label: "Fresh flowers", hint: "Seasonal, food-safe, stems wrapped", extra: 24 }
    ],
    // Flat prices, whatever the size.
    extras: [
      { id: "candles", label: "Pack of 12 candles", price: 2 },
      { id: "numbers", label: "Gold number candles", price: 4 },
      { id: "cupcakes", label: "Six matching cupcakes", price: 18 }
    ]
  },

  /* The gallery: drawings until the bakery's own photos go in. category: the filter (birthday, wedding,
     kids, celebration). The order link starts the form with this cake's occasion, size, flavour, filling
     (if given) and finish. art: how the drawing looks (see js/cake-art.js). bg: the tile colour. */
  gallery: [
    { id: "g01", title: "Raspberry drip", category: "birthday", occasion: "birthday", size: "8in", flavour: "vanilla", finish: "drip", bg: "blush",
      art: { frosting: "cream", drip: "raspberry", sprinkles: true, candles: 5 } },
    { id: "g02", title: "Chocolate fudge, gold sprinkles", category: "birthday", occasion: "birthday", size: "6in", flavour: "chocolate", finish: "drip", bg: "butter",
      art: { frosting: "cocoa", drip: "chocolate", sprinkles: "gold", candles: 3 } },
    { id: "g03", title: "Lemon with piped daisies", category: "birthday", occasion: "birthday", size: "8in", flavour: "lemon", finish: "piped", bg: "sky",
      art: { frosting: "lemon", rosettes: "daisy", beads: true } },
    { id: "g04", title: "Hundreds and thousands", category: "kids", occasion: "kids", size: "8in", flavour: "vanilla", finish: "drip", bg: "lilac",
      art: { frosting: "pink", drip: "white", sprinkles: "all", candles: 6 } },
    { id: "g05", title: "Meringue kisses", category: "kids", occasion: "kids", size: "6in", flavour: "redvelvet", finish: "drip", bg: "pistachio",
      art: { frosting: "sky", drip: "raspberry", kisses: true, candles: 4 } },
    { id: "g06", title: "Rainbow stripes", category: "kids", occasion: "kids", size: "10in", flavour: "vanilla", finish: "smooth", bg: "butter",
      art: { frosting: "cream", stripes: true, beads: true, candles: 7 } },
    { id: "g07", title: "Three tiers, berries", category: "wedding", occasion: "wedding", size: "3tier", flavour: "lemon", finish: "naked", bg: "pistachio",
      art: { frosting: "cream", naked: true, berries: true } },
    { id: "g08", title: "Two tiers, fresh flowers", category: "wedding", occasion: "wedding", size: "2tier", flavour: "vanilla", finish: "fresh", bg: "blush",
      art: { frosting: "cream", flowers: true, beads: true } },
    { id: "g09", title: "Three tiers, piped lace", category: "wedding", occasion: "wedding", size: "3tier", flavour: "vanilla", finish: "piped", bg: "lilac",
      art: { frosting: "white", lace: true, beads: true } },
    { id: "g10", title: "Pistachio and roses", category: "celebration", occasion: "anniversary", size: "8in", flavour: "pistachio", finish: "piped", bg: "butter",
      art: { frosting: "pistachio", rosettes: "rose", beads: true } },
    { id: "g11", title: "Salted caramel drip", category: "celebration", occasion: "other", size: "8in", flavour: "vanilla", filling: "caramel", finish: "drip", bg: "sky",
      art: { frosting: "cream", drip: "caramel", sprinkles: "gold" } },
    { id: "g12", title: "Naming day daisies", category: "celebration", occasion: "baby", size: "6in", flavour: "lemon", finish: "fresh", bg: "pistachio",
      art: { frosting: "butter", flowers: true, beads: true } }
  ]
};
