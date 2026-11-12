/* Cobnut Café: opening hours, holiday closures, the menu, the specials board and the events. Every page
   reads this one file, so a price, a soup or a quiz date is changed here and nowhere else.

   SAMPLE SITE: Cobnut Café is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), the email uses the reserved .example domain, and the street
   is invented (Herne Hill is real). */
window.Cobnut = {
  // true = order, reserve and contact buttons show what would happen instead of opening WhatsApp,
  // the phone or email.
  sample: true,

  name: "Cobnut Café",
  whatsapp: "447700900582",
  mobile: "07700 900582",
  phone: "020 7946 0582",
  phoneLink: "+442079460582",
  email: "hello@cobnut.example",
  address: "6 Wickfield Parade, Herne Hill, London SE24",
  // The street is made up, so the map links search for the neighbourhood.
  mapQuery: "Herne Hill, London SE24",

  // Opening hours. 1 = Monday ... 6 = Saturday, 0 = Sunday. null would mean closed all day.
  hours: {
    1: ["07:30", "17:00"],
    2: ["07:30", "17:00"],
    3: ["07:30", "17:00"],
    4: ["07:30", "17:00"],
    5: ["07:30", "17:00"],
    6: ["08:30", "17:00"],
    0: ["09:00", "16:00"]
  },

  // Days with other hours, or closed (hours: null). "MM-DD" dates repeat every year; a full
  // "YYYY-MM-DD" date is a one-off, for example { from: "2027-03-01", to: "2027-03-02", hours: null,
  // label: "Deep clean", why: "for a deep clean" }. "to" is the last day, and is left out for a single
  // day. "why" finishes the sentence "Closed today ..." on the open-now line.
  exceptions: [
    { from: "12-24", hours: ["08:00", "14:00"], label: "Christmas Eve" },
    { from: "12-25", to: "12-28", hours: null, label: "Christmas break", why: "for the Christmas break" },
    { from: "12-31", hours: ["08:00", "15:00"], label: "New Year's Eve" },
    { from: "01-01", hours: null, label: "New Year's Day", why: "for New Year's Day" }
  ],
  // Holiday hours are listed on the site this many days ahead.
  exceptionsAheadDays: 60,

  // Order ahead for collection: the first collection time is at least leadMinutes from now (and from
  // opening), times go up in stepMinutes, and the last one is lastBeforeCloseMinutes before closing.
  orderAhead: { leadMinutes: 15, stepMinutes: 15, lastBeforeCloseMinutes: 15, maxEach: 10 },

  /* The menu. Prices in pounds. diet: what the dish is as it comes ("vg" vegan, "v" vegetarian,
     "gf" gluten-free; a vegan dish is vegetarian too, so it only needs "vg"). can: what it can be made
     on request, explained in canNote. featured: shown on the home page. short: the line under each
     section's name on the home page. */
  menu: [
    {
      id: "drinks",
      title: "Coffee & drinks",
      icon: "i-cup",
      short: "Hot or iced, with oat or soya milk at no extra cost.",
      note: "Beans roasted in south London. Oat or soya milk at no extra cost, decaf on request, extra shot 60p.",
      items: [
        { id: "espresso", name: "Espresso", price: 2.8, diet: ["vg", "gf"], desc: "A double shot of the house blend. Chocolate and toffee." },
        { id: "cortado", name: "Cortado", price: 3.4, diet: ["v", "gf"], can: ["vg"], canNote: "Vegan with oat or soya milk", desc: "A double shot cut with a little steamed milk." },
        { id: "flat-white", name: "Flat white", price: 3.7, diet: ["v", "gf"], can: ["vg"], canNote: "Vegan with oat or soya milk", featured: true, desc: "Our most ordered drink. Smooth, strong, and not too big." },
        { id: "cappuccino", name: "Cappuccino", price: 3.8, diet: ["v", "gf"], can: ["vg"], canNote: "Vegan with oat or soya milk", desc: "Plenty of foam and a dusting of chocolate if you like." },
        { id: "latte", name: "Latte", price: 3.9, diet: ["v", "gf"], can: ["vg"], canNote: "Vegan with oat or soya milk", desc: "Milky and mellow. Hot or iced." },
        { id: "americano", name: "Americano", price: 3.2, diet: ["vg", "gf"], desc: "A double shot topped up with hot water. Milk on the side if you want it." },
        { id: "filter", name: "Batch filter", price: 3.3, diet: ["vg", "gf"], desc: "Brewed fresh every hour. Top-ups £1.50 if you are staying." },
        { id: "pour-over", name: "Guest pour-over", price: 4.5, diet: ["vg", "gf"], desc: "This month's guest single origin, brewed by hand. It is on the specials board." },
        { id: "mocha", name: "Mocha", price: 4.3, diet: ["v", "gf"], can: ["vg"], canNote: "Vegan with oat or soya milk", desc: "Espresso, steamed milk and proper melted chocolate." },
        { id: "hot-chocolate", name: "Hot chocolate", price: 3.9, diet: ["v", "gf"], can: ["vg"], canNote: "Vegan with oat or soya milk", featured: true, desc: "Made with 54% dark chocolate, not powder. Marshmallows on request." },
        { id: "chai", name: "Chai latte", price: 3.9, featured: true, diet: ["v"], can: ["vg"], canNote: "Vegan with oat or soya milk and maple syrup", desc: "Spiced black tea and steamed milk, sweetened with honey." },
        { id: "matcha", name: "Matcha latte", price: 4.2, diet: ["v", "gf"], can: ["vg"], canNote: "Vegan with oat or soya milk", desc: "Ceremonial-grade matcha, whisked to order." },
        { id: "tea", name: "Pot of tea", price: 3.0, diet: ["vg", "gf"], desc: "English breakfast, Earl Grey, green, peppermint or chamomile." },
        { id: "orange", name: "Fresh orange juice", price: 3.8, diet: ["vg", "gf"], desc: "Squeezed here, to order." },
        { id: "babyccino", name: "Babyccino", price: 1.0, diet: ["v", "gf"], desc: "Frothy warm milk with a sprinkle of chocolate, for little ones." }
      ]
    },
    {
      id: "breakfast",
      title: "Breakfast",
      icon: "i-egg",
      short: "Until 11:30am, or 12 noon at weekends.",
      note: "Until 11:30am on weekdays and 12 noon at weekends. Gluten-free bread is £1 extra.",
      items: [
        { id: "toast", name: "Sourdough toast & jam", price: 4.5, diet: ["v"], can: ["vg", "gf"], canNote: "Vegan with olive oil spread; gluten-free bread £1 extra", desc: "Two thick slices with salted butter and strawberry jam from a Kent farm." },
        { id: "granola", name: "Cobnut granola", price: 7.5, diet: ["v"], can: ["vg"], canNote: "Vegan with coconut yoghurt", desc: "Our own granola with toasted cobnuts, Greek yoghurt and seasonal fruit compote." },
        { id: "porridge", name: "Porridge", price: 6.5, diet: ["v"], can: ["vg"], canNote: "Vegan with oat milk and maple syrup", desc: "Oats cooked slowly with milk, topped with banana, honey and toasted seeds." },
        { id: "eggs", name: "Eggs on toast", price: 8.5, diet: ["v"], can: ["gf"], canNote: "Gluten-free bread £1 extra", desc: "Two free-range eggs, scrambled, poached or fried, on sourdough." },
        { id: "avocado", name: "Avocado on toast", price: 10.5, diet: ["vg"], can: ["gf"], canNote: "Gluten-free bread £1 extra", featured: true, desc: "Crushed avocado, chilli, lime and pumpkin seeds on sourdough. Add a poached egg for £1.80." },
        { id: "bacon-roll", name: "Bacon roll", price: 7.0, diet: [], can: ["gf"], canNote: "Gluten-free roll £1 extra", desc: "Dry-cured back bacon in a soft white roll, with brown sauce or ketchup." },
        { id: "shakshuka", name: "Shakshuka", price: 11.5, diet: ["v"], can: ["gf"], canNote: "With gluten-free toast instead of flatbread", featured: true, desc: "Two eggs baked in spiced tomatoes and peppers, with feta, herbs and warm flatbread." },
        { id: "full", name: "The full Cobnut", price: 14.5, diet: [], featured: true, desc: "Two eggs, bacon, pork sausage, mushrooms, roast tomato, beans and sourdough toast." },
        { id: "veggie-full", name: "Veggie full", price: 13.5, diet: ["v"], can: ["gf"], canNote: "Gluten-free bread £1 extra", desc: "Two eggs, halloumi, mushrooms, roast tomato, spinach, beans and sourdough toast." }
      ]
    },
    {
      id: "lunch",
      title: "Lunch",
      icon: "i-bowl",
      short: "From 11:30am, with a new soup every day.",
      note: "From 11:30am. The soup and the sandwich of the week are on the specials board.",
      items: [
        { id: "soup", name: "Soup of the day", price: 7.5, featured: true, diet: ["v"], can: ["vg", "gf"], canNote: "Most of our soups are vegan; gluten-free bread £1 extra", desc: "With sourdough and butter. Today's soup is on the specials board." },
        { id: "cheese-toastie", name: "Cheese & onion toastie", price: 8.5, diet: ["v"], can: ["gf"], canNote: "Gluten-free bread £1 extra", featured: true, desc: "Mature Cheddar, red onion and English mustard on sourdough." },
        { id: "ham-toastie", name: "Ham & pickle toastie", price: 9.5, diet: [], can: ["gf"], canNote: "Gluten-free bread £1 extra", desc: "Roast ham, Cheddar and our own apple pickle." },
        { id: "grain-bowl", name: "Squash & lentil bowl", price: 11.5, diet: ["vg", "gf"], featured: true, desc: "Roast squash, quinoa, puy lentils, greens, pickled red onion and tahini dressing." },
        { id: "quiche", name: "Quiche of the day", price: 10.5, diet: ["v"], desc: "Baked here every morning, with dressed leaves and coleslaw." },
        { id: "chicken", name: "Chicken ciabatta", price: 10.0, diet: [], desc: "Roast chicken, basil mayonnaise, roast peppers and rocket." },
        { id: "falafel", name: "Falafel wrap", price: 9.5, diet: ["vg"], desc: "Falafel, hummus, pickled cabbage and chilli sauce in a flatbread." },
        { id: "kids-toastie", name: "Little cheese toastie", price: 5.0, diet: ["v"], desc: "Half a cheese toastie with cucumber sticks and apple slices. For under-tens." },
        { id: "salad", name: "Side salad", price: 4.0, diet: ["vg", "gf"], desc: "Leaves, cucumber, radish and a mustard dressing." }
      ]
    },
    {
      id: "bakes",
      title: "Cakes & bakes",
      icon: "i-cake",
      short: "Baked here every morning, while they last.",
      note: "Baked here every morning, apart from the croissants, which come from a bakery up the road. Whole cakes to order with 48 hours' notice.",
      items: [
        { id: "croissant", name: "Butter croissant", price: 3.2, diet: ["v"], desc: "Flaky, buttery, still warm before 9am." },
        { id: "almond-croissant", name: "Almond croissant", price: 4.0, featured: true, diet: ["v"], desc: "Filled with frangipane and topped with flaked almonds." },
        { id: "pain-choc", name: "Pain au chocolat", price: 3.4, diet: ["v"], desc: "Two batons of dark chocolate in croissant pastry." },
        { id: "cinnamon-bun", name: "Cinnamon bun", price: 3.8, diet: ["v"], featured: true, desc: "Cardamom dough rolled with cinnamon butter and brushed with syrup." },
        { id: "brownie", name: "Cobnut brownie", price: 4.2, diet: ["v", "gf"], featured: true, desc: "Dark chocolate brownie with toasted cobnuts. Made without flour." },
        { id: "polenta-cake", name: "Lemon & polenta cake", price: 4.2, diet: ["v", "gf"], desc: "Ground almonds, polenta and lemon syrup. Sharp and sticky." },
        { id: "carrot-cake", name: "Carrot cake", price: 4.5, diet: ["v"], desc: "Spiced sponge, walnuts and cream cheese icing." },
        { id: "vegan-loaf", name: "Chocolate & orange loaf", price: 3.9, diet: ["vg"], desc: "Moist, dark and completely vegan." },
        { id: "banana-bread", name: "Banana bread", price: 3.6, diet: ["v"], desc: "Toasted and served with butter, if you like." },
        { id: "scone", name: "Fruit scone", price: 4.2, diet: ["v"], desc: "With strawberry jam and clotted cream." },
        { id: "flapjack", name: "Cobnut flapjack", price: 3.2, diet: ["v"], desc: "Oats, butter, honey and toasted cobnuts." },
        { id: "sausage-roll", name: "Sausage roll", price: 4.5, diet: [], desc: "Pork, sage and onion in flaky pastry." },
        { id: "mushroom-roll", name: "Mushroom & chestnut roll", price: 4.5, diet: ["vg"], desc: "Our vegan sausage roll, with thyme and a little miso." }
      ]
    }
  ],

  /* The specials board. The soup follows the day of the week. The bake and the sandwich change every
     Monday, working down each list in turn; the guest coffee changes on the 1st of each month. */
  specials: {
    soups: {
      1: { name: "Roast tomato & red pepper", diet: ["vg", "gf"] },
      2: { name: "Leek & potato", diet: ["v", "gf"] },
      3: { name: "Spiced red lentil & coconut", diet: ["vg", "gf"] },
      4: { name: "Mushroom & thyme", diet: ["v"] },
      5: { name: "Carrot, ginger & coriander", diet: ["vg", "gf"] },
      6: { name: "Minestrone with pesto", diet: ["v"] },
      0: { name: "Pea, mint & spinach", diet: ["vg", "gf"] }
    },
    bakes: [
      "Chocolate & cobnut babka",
      "Sticky ginger cake",
      "Raspberry & white chocolate blondie",
      "Cardamom knots",
      "Apple & cinnamon crumble slice",
      "Orange & almond cake (gluten-free)",
      "Coffee & walnut cake",
      "Lemon drizzle loaf"
    ],
    sandwiches: [
      "Roast chicken, tarragon mayo & watercress",
      "Halloumi, roast peppers & harissa",
      "Smoked mackerel, beetroot & horseradish",
      "Brie, apple & chutney",
      "Falafel, hummus & pickled red onion (vegan)",
      "Pastrami, pickles & mustard on rye"
    ],
    coffees: [
      { origin: "Colombia, washed", notes: "Red apple and caramel" },
      { origin: "Ethiopia, natural", notes: "Blueberry and cocoa" },
      { origin: "Kenya, washed", notes: "Blackcurrant and brown sugar" },
      { origin: "Guatemala, washed", notes: "Milk chocolate and orange" },
      { origin: "Rwanda, honey process", notes: "Red grape and honey" },
      { origin: "Brazil, natural", notes: "Hazelnut and fudge" }
    ]
  },

  /* Events. when: "week" (every week on that day), or "month" with nth 1 to 4 (first to fourth) or -1
     (last). day: 1 = Monday ... 6 = Saturday, 0 = Sunday. An event on a day the café is closed (see
     exceptions) is left out. book: what the "save a spot" form asks for. */
  eventsAheadDays: 56,
  events: [
    {
      id: "quiz",
      title: "Quiz night",
      icon: "i-quiz",
      when: "month", nth: 1, day: 4,
      start: "19:30", end: "21:30",
      price: "£3 a head, all of it to the local food bank",
      desc: "Six rounds, a picture round and a very fair quizmaster. Teams of up to six. Toasties and cake until 9pm, and you are welcome to bring a bottle.",
      book: { button: "Save us a table", unit: "people", label: "How many in your team?", max: 6 }
    },
    {
      id: "acoustic",
      title: "Acoustic night",
      icon: "i-guitar",
      when: "month", nth: -1, day: 5,
      start: "19:00", end: "21:30",
      price: "Free, with a hat passed round for the players",
      desc: "Three short sets from local songwriters, candles on the tables and the lights down low. Bring a bottle if you like; we do the food.",
      book: { button: "Save me a seat", unit: "people", label: "How many seats?", max: 8 }
    },
    {
      id: "makers",
      title: "Little Makers craft morning",
      icon: "i-palette",
      when: "week", day: 6,
      start: "09:30", end: "10:30",
      price: "£6 a child, with a babyccino and a biscuit",
      desc: "Painting, sticking and making, for ages 2 to 6 with a grown-up. Everything is provided, aprons too. Expect glitter.",
      book: { button: "Save me a spot", unit: "children", label: "How many children?", max: 4 }
    },
    {
      id: "knit",
      title: "Knit & natter",
      icon: "i-yarn",
      when: "week", day: 2,
      start: "14:00", end: "16:00",
      price: "Free; just buy a drink",
      desc: "Bring your knitting, crochet or mending and take over the big table. Beginners welcome: someone will always show you a stitch.",
      book: { button: "Save me a spot", unit: "people", label: "How many of you?", max: 6 }
    },
    {
      id: "brew",
      title: "Better coffee at home",
      icon: "i-dripper",
      when: "month", nth: 2, day: 0,
      start: "16:30", end: "18:00",
      price: "£20, with 250g of beans to take home",
      desc: "A hands-on class after closing for six people. Learn the cafetière, the AeroPress and the V60, and how to fix a bitter cup.",
      book: { button: "Book a place", unit: "places", label: "How many places?", max: 2 }
    }
  ]
};
