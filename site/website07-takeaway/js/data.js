/* Kor Charcoal Grill: the menu, prices, meal deals, allergens, opening hours, delivery areas and contact
   details. Every page reads this one file, so a price, a dish or a delivery fee is changed here and nowhere
   else.

   SAMPLE SITE: Kor Charcoal Grill is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept
   for drama (020 7946 0xxx and 07700 900xxx), the email uses the reserved .example domain, and the street
   is invented (Kilburn is real). */
window.Kor = {
  // true = the order, phone, WhatsApp and email buttons show what would happen instead of opening them.
  sample: true,

  name: "Kor Charcoal Grill",
  short: "Kor",
  whatsapp: "447700900734",
  mobile: "07700 900734",
  phone: "020 7946 0734",
  phoneLink: "+442079460734",
  email: "orders@korgrill.example",
  address: "41 Varley Parade, Kilburn, London NW6",
  // The street is made up, so the map link searches for the neighbourhood.
  mapQuery: "Kilburn High Road, London NW6",

  // Kitchen hours. 1 = Monday ... 6 = Saturday, 0 = Sunday. A closing time at or before the opening time
  // is after midnight: ["17:00", "02:00"] is 5pm to 2am the next morning. null = closed all day.
  hours: {
    1: ["17:00", "00:00"],
    2: ["17:00", "00:00"],
    3: ["17:00", "00:00"],
    4: ["17:00", "01:00"],
    5: ["17:00", "02:00"],
    6: ["16:00", "02:00"],
    0: ["16:00", "23:30"]
  },

  // Days with other hours, or closed (hours: null). "MM-DD" repeats every year; "YYYY-MM-DD" is a one-off.
  // "to" is the last day, left out for a single day.
  exceptions: [
    { from: "12-24", hours: ["16:00", "22:00"], label: "Christmas Eve" },
    { from: "12-25", hours: null, label: "Christmas Day" },
    { from: "12-26", hours: ["17:00", "23:00"], label: "Boxing Day" },
    { from: "12-31", hours: ["16:00", "03:00"], label: "New Year's Eve" },
    { from: "01-01", hours: ["17:00", "23:00"], label: "New Year's Day" }
  ],
  // Special hours are listed on the site this many days ahead.
  exceptionsAheadDays: 50,

  // Last orders, in minutes before closing.
  lastOrders: { delivery: 30, collection: 15 },
  // How long a collection order takes, in minutes.
  collectionMinutes: [15, 20],
  // Orders for later go in steps of this many minutes. A pre-order (sent while we are closed) can be for
  // any time in the next opening, from preorderFirstMinutes after we open.
  slotMinutes: 15,
  preorderFirstMinutes: 30,

  // Delivery areas, by postcode district. fee and min (minimum food order) in pounds, time in minutes.
  // bearing: the rough direction from the shop in degrees (0 = north), for the not-to-scale diagram.
  delivery: [
    { district: "NW6", name: "Kilburn, West Hampstead and Queen's Park", fee: 1.5, min: 12, time: [25, 35], bearing: 0 },
    { district: "NW2", name: "Cricklewood and Willesden Green", fee: 2, min: 15, time: [30, 40], bearing: 315 },
    { district: "W9", name: "Maida Vale", fee: 2, min: 15, time: [30, 40], bearing: 160 },
    { district: "NW8", name: "St John's Wood", fee: 2.5, min: 18, time: [35, 45], bearing: 115 },
    { district: "NW10", name: "Willesden, Kensal Rise and Harlesden", fee: 2.5, min: 18, time: [35, 45], bearing: 255 },
    { district: "NW3", name: "Hampstead and Swiss Cottage", fee: 3, min: 20, time: [40, 50], bearing: 40 },
    { district: "W10", name: "North Kensington", fee: 3, min: 20, time: [40, 50], bearing: 205 },
    { district: "NW11", name: "Golders Green", fee: 3.5, min: 25, time: [45, 55], bearing: 350 },
    { district: "NW1", name: "Camden Town and Primrose Hill", fee: 3.5, min: 25, time: [45, 55], bearing: 95 }
  ],

  // The UK's 14 allergens, in the order the law lists them. "where" says where they turn up on our menu.
  allergens: [
    { id: "celery", name: "Celery", where: "In the lentil soup." },
    { id: "gluten", name: "Cereals containing gluten", short: "Gluten", where: "Wheat in our bread, lavash, lahmacun, pide, bulgur and pastry." },
    { id: "crustaceans", name: "Crustaceans", where: "Not on our menu." },
    { id: "eggs", name: "Eggs", where: "Egg wash on the pide, and the filo rolls." },
    { id: "fish", name: "Fish", where: "Not on our menu." },
    { id: "lupin", name: "Lupin", where: "Not on our menu." },
    { id: "milk", name: "Milk", where: "Garlic yoghurt, the chicken marinade, cheeses, ayran, butter and desserts." },
    { id: "molluscs", name: "Molluscs", where: "Not on our menu." },
    { id: "mustard", name: "Mustard", where: "In the chicken wing marinade." },
    { id: "nuts", name: "Tree nuts", short: "Nuts", where: "Pistachios on the baklava and the künefe." },
    { id: "peanuts", name: "Peanuts", where: "Not on our menu." },
    { id: "sesame", name: "Sesame", where: "Tahini in the hummus and falafel sauce, and seeds on our bread." },
    { id: "soya", name: "Soya", where: "In the sucuk sausage." },
    { id: "sulphites", name: "Sulphur dioxide and sulphites", short: "Sulphites", where: "The pomegranate dressing and the sucuk." }
  ],

  // Shared option groups. type "one" = pick one (the first choice, or "default", starts picked);
  // "many" = tick any. add = extra cost in pounds. say = how the choice reads in the order message.
  // showIf: [group, choice] shows the group only when that choice is picked.
  groups: {
    style: {
      label: "Wrap or plate?", type: "one",
      choices: [
        { id: "wrap", label: "Wrap", note: "Rolled in lavash with salad, garlic yoghurt and chilli sauce", say: "wrap" },
        { id: "plate", label: "Plate", note: "With rice or bulgur, salad, bread and garlic yoghurt", add: 5, say: "plate", allergens: ["sesame"] }
      ]
    },
    side: {
      label: "On the plate", type: "one", showIf: ["style", "plate"],
      choices: [
        { id: "rice", label: "Butter rice", say: "with rice" },
        { id: "bulgur", label: "Bulgur pilav", say: "with bulgur" },
        { id: "chips", label: "Chips", add: 1, say: "with chips" }
      ]
    },
    wingSide: {
      label: "Comes with", type: "one",
      choices: [
        { id: "chips", label: "Chips", say: "with chips" },
        { id: "rice", label: "Butter rice", say: "with rice", allergens: ["gluten"] },
        { id: "salad", label: "Salad", say: "with salad", allergens: ["sulphites"] }
      ]
    },
    spice: {
      label: "How hot?", type: "one", default: "medium", spice: true,
      choices: [
        { id: "mild", label: "Mild", heat: 0, say: "mild" },
        { id: "medium", label: "Medium", heat: 1, say: "medium heat" },
        { id: "hot", label: "Hot", heat: 2, say: "hot" },
        { id: "kor", label: "Kor hot", heat: 3, note: "Extra chilli. You have been warned.", say: "Kor hot (extra chilli)" }
      ]
    },
    grillExtras: {
      label: "Extras", type: "many",
      choices: [
        { id: "halloumi", label: "Grilled halloumi", add: 3, say: "+ grilled halloumi" },
        { id: "pepper", label: "Grilled hot pepper", add: 1, say: "+ grilled hot pepper" },
        { id: "garlic", label: "Extra garlic yoghurt", add: 0.8, say: "+ extra garlic yoghurt" },
        { id: "chilli", label: "Extra chilli sauce", add: 0.8, say: "+ extra chilli sauce" }
      ]
    },
    noOnion: {
      label: "Onions", type: "one",
      choices: [
        { id: "yes", label: "With onions", say: "" },
        { id: "no", label: "No onions", say: "no onions" }
      ]
    },
    pideExtras: {
      label: "Extras", type: "many",
      choices: [
        { id: "egg", label: "Egg on top", add: 1, say: "+ egg" },
        { id: "cheese", label: "Extra cheese", add: 1.5, say: "+ extra cheese" },
        { id: "sucuk", label: "Sucuk sausage", add: 2, say: "+ sucuk", allergens: ["soya", "sulphites"] }
      ]
    },
    chipSize: {
      label: "Size", type: "one",
      choices: [
        { id: "regular", label: "Regular", say: "regular" },
        { id: "large", label: "Large", add: 1, say: "large" }
      ]
    },
    chipExtras: {
      label: "Extras", type: "many",
      choices: [
        { id: "cheese", label: "Melted cheese", add: 1.5, say: "+ melted cheese", allergens: ["milk"] },
        { id: "sumac", label: "Chilli and sumac salt", add: 0, say: "+ chilli and sumac salt" }
      ]
    },
    kaymak: {
      label: "Extras", type: "many",
      choices: [
        { id: "kaymak", label: "Clotted cream (kaymak)", add: 1.5, say: "+ kaymak", allergens: ["milk"] }
      ]
    },
    salgam: {
      label: "Spicy or mild?", type: "one",
      choices: [
        { id: "spicy", label: "Spicy", say: "spicy" },
        { id: "mild", label: "Mild", say: "mild" }
      ]
    },
    can: {
      label: "Flavour", type: "one",
      choices: [
        { id: "cola", label: "Cola", say: "cola" },
        { id: "diet", label: "Diet cola", say: "diet cola" },
        { id: "lemonade", label: "Lemonade", say: "lemonade" },
        { id: "orange", label: "Orange", say: "orange" }
      ]
    },
    bottle: {
      label: "Flavour", type: "one",
      choices: [
        { id: "cola", label: "Cola", say: "cola" },
        { id: "diet", label: "Diet cola", say: "diet cola" },
        { id: "lemonade", label: "Lemonade", say: "lemonade" }
      ]
    },
    dealWrap: {
      label: "Your wrap", type: "one",
      choices: [
        { id: "adana", label: "Adana kebab", say: "Adana wrap" },
        { id: "chicken", label: "Chicken shish", say: "chicken shish wrap" },
        { id: "doner", label: "Lamb döner", say: "döner wrap" },
        { id: "halloumi", label: "Halloumi and veg", note: "Vegetarian", say: "halloumi wrap" },
        { id: "lamb", label: "Lamb shish", add: 2, say: "lamb shish wrap" }
      ]
    },
    dealDrink: {
      label: "Your drink", type: "one",
      choices: [
        { id: "ayran", label: "Ayran", say: "ayran", allergens: ["milk"] },
        { id: "cola", label: "Cola", say: "cola" },
        { id: "diet", label: "Diet cola", say: "diet cola" },
        { id: "lemonade", label: "Lemonade", say: "lemonade" },
        { id: "orange", label: "Orange", say: "orange" },
        { id: "water", label: "Water", say: "water" }
      ]
    },
    dip: {
      label: "Your dip", type: "one",
      choices: [
        { id: "hummus", label: "Hummus", say: "hummus", allergens: ["sesame"] },
        { id: "cacik", label: "Cacık", note: "Yoghurt, cucumber and mint", say: "cacık", allergens: ["milk"] },
        { id: "ezme", label: "Ezme", note: "Smoky tomato and chilli", say: "ezme", allergens: ["sulphites"] }
      ]
    },
    bigDrink: {
      label: "Your 1.5 litre drink", type: "one",
      choices: [
        { id: "cola", label: "Cola", say: "1.5l cola" },
        { id: "diet", label: "Diet cola", say: "1.5l diet cola" },
        { id: "lemonade", label: "Lemonade", say: "1.5l lemonade" }
      ]
    }
  },

  /* The menu. price = the lowest price, in pounds (choices with "add" cost more). worth = what the parts
     of a meal deal cost on their own; feeds = how many people a deal is for. diet: "v" vegetarian, "vg"
     vegan. hot: spicy as it comes. allergens: ids from the list above, for the dish as it comes; a choice
     with its own "allergens" adds those when it is picked. featured: on the home page. icon: the
     category's picture; pic: a dish's own picture, if it has one; pics: what is in a meal deal. */
  menu: [
    {
      id: "deals",
      title: "Meal deals",
      icon: "i-deal",
      blurb: "Bundles that cost less than buying each part.",
      items: [
        {
          id: "wrap-meal", name: "Wrap meal", price: 14.5, worth: 16.6, pics: ["i-wrap", "i-chips", "i-cup"],
          desc: "Any wrap from the grill, regular chips and a drink.",
          options: ["dealWrap", "spice", "dealDrink"], allergens: ["gluten", "milk"]
        },
        {
          id: "lahmacun-trio", name: "Lahmacun trio", price: 13, worth: 17, pics: ["i-lahmacun", "i-lahmacun", "i-cup"],
          desc: "Three lahmacun with lemon and onion salad, and an ayran or a can.",
          options: ["spice", "dealDrink"], allergens: ["gluten", "sulphites"]
        },
        {
          id: "grill-for-two", name: "Grill for two", price: 36, feeds: 2, pics: ["i-skewer", "i-skewer", "i-dip"],
          desc: "Adana, chicken shish and lamb shish skewers and four wings, with rice, bulgur, salad, two breads and a dip.",
          options: ["dip", "spice"], allergens: ["gluten", "milk", "mustard", "sesame"]
        },
        {
          id: "family-feast", name: "Family feast", price: 62, feeds: 4, pics: ["i-skewer", "i-lahmacun", "i-dip"],
          desc: "Two Adana, two chicken shish, a lamb shish and eight wings, two lahmacun, rice, bulgur, salad, four breads, hummus, cacık and a 1.5 litre drink.",
          options: ["spice", "bigDrink"], allergens: ["gluten", "milk", "mustard", "sesame", "sulphites"]
        }
      ]
    },
    {
      id: "grill",
      title: "From the charcoal grill",
      icon: "i-skewer",
      blurb: "Cooked to order over lumpwood charcoal. Wraps come in lavash with salad and sauce; plates come with rice or bulgur, salad and bread.",
      items: [
        {
          id: "adana", name: "Adana kebab", price: 11, hot: true, featured: true,
          desc: "Hand-minced lamb with red pepper and chilli flakes, pressed onto a wide skewer.",
          options: ["style", "side", "spice", "grillExtras"], allergens: ["gluten", "milk"]
        },
        {
          id: "chicken-shish", name: "Chicken shish", price: 11, featured: true,
          desc: "Chicken thigh marinated overnight in yoghurt, pepper paste and garlic.",
          options: ["style", "side", "spice", "grillExtras"], allergens: ["gluten", "milk"]
        },
        {
          id: "lamb-shish", name: "Lamb shish", price: 13.5,
          desc: "Cubes of lamb leg with onion and pepper, charred at the edges and pink in the middle.",
          options: ["style", "side", "spice", "grillExtras"], allergens: ["gluten", "milk"]
        },
        {
          id: "doner", name: "Lamb döner", price: 10,
          desc: "Sliced from our own stack, made here every morning. Not the frozen cone kind.",
          options: ["style", "side", "spice", "grillExtras"], allergens: ["gluten", "milk"]
        },
        {
          id: "halloumi-shish", name: "Halloumi and veg shish", price: 10, diet: ["v"],
          desc: "Halloumi, courgette, red onion and peppers, brushed with herb oil.",
          options: ["style", "side", "spice", "grillExtras"], allergens: ["gluten", "milk"]
        },
        {
          id: "wings", name: "Chicken wings", price: 10.5,
          desc: "Eight wings in our red pepper and mustard marinade, crisp from the coals.",
          options: ["wingSide", "spice"], allergens: ["milk", "mustard"]
        },
        {
          id: "lamb-chops", name: "Lamb chops", price: 21,
          desc: "Four chops, salt, pepper and thyme, on a plate with rice or bulgur, salad and bread.",
          options: ["side", "spice"], allergens: ["gluten", "milk", "sesame"]
        },
        {
          id: "mixed-grill", name: "Kor mixed grill", price: 24, featured: true,
          desc: "Adana, chicken shish, lamb shish and two wings on one plate. For the very hungry.",
          options: ["side", "spice", "grillExtras"], allergens: ["gluten", "milk", "mustard", "sesame"]
        }
      ]
    },
    {
      id: "oven",
      title: "Lahmacun and pide",
      icon: "i-pide",
      blurb: "Baked in the stone oven, straight out and into the box.",
      items: [
        {
          id: "lahmacun", name: "Lahmacun", price: 5, featured: true, pic: "i-lahmacun",
          desc: "Thin, crisp flatbread with spiced lamb, tomato and parsley. Squeeze the lemon, add the salad, roll it up.",
          options: ["spice", "noOnion"], allergens: ["gluten", "sulphites"]
        },
        {
          id: "pide-lamb", name: "Minced lamb pide", price: 12.5,
          desc: "The boat-shaped bread, filled with minced lamb, tomato and green pepper.",
          options: ["pideExtras"], allergens: ["gluten", "eggs", "milk"]
        },
        {
          id: "pide-cheese", name: "Cheese pide", price: 11, diet: ["v"],
          desc: "Melted kaşar cheese and a little butter. Add an egg for the full experience.",
          options: ["pideExtras"], allergens: ["gluten", "eggs", "milk"]
        },
        {
          id: "pide-sucuk", name: "Sucuk and egg pide", price: 13, featured: true,
          desc: "Spicy beef sausage, cheese and an egg cracked on top before it goes in.",
          options: ["pideExtras"], allergens: ["gluten", "eggs", "milk", "soya", "sulphites"]
        },
        {
          id: "pide-spinach", name: "Spinach and feta pide", price: 11.5, diet: ["v"],
          desc: "Spinach, feta, onion and a pinch of chilli.",
          options: ["pideExtras"], allergens: ["gluten", "eggs", "milk"]
        }
      ]
    },
    {
      id: "sides",
      title: "Sides and meze",
      icon: "i-chips",
      blurb: "Dips come with warm bread unless you say otherwise.",
      items: [
        { id: "chips", name: "Chips", price: 3.8, diet: ["vg"], desc: "Skin-on, double cooked.", options: ["chipSize", "chipExtras"], allergens: [] },
        { id: "rice", name: "Butter rice", price: 3.5, diet: ["v"], desc: "Turkish-style, with toasted orzo.", allergens: ["gluten", "milk"] },
        { id: "bulgur", name: "Bulgur pilav", price: 3.5, diet: ["vg"], desc: "Cracked wheat cooked with tomato and pepper paste.", allergens: ["gluten"] },
        { id: "salad", name: "Shepherd's salad", price: 5, diet: ["vg"], desc: "Tomato, cucumber, onion, parsley and pomegranate dressing.", allergens: ["sulphites"] },
        { id: "hummus", name: "Hummus", price: 5.5, diet: ["vg"], desc: "Chickpeas, tahini, lemon and olive oil, with bread.", allergens: ["gluten", "sesame"] },
        { id: "cacik", name: "Cacık", price: 4.5, diet: ["v"], desc: "Thick yoghurt with cucumber, garlic and dried mint, with bread.", allergens: ["gluten", "milk", "sesame"] },
        { id: "ezme", name: "Ezme", price: 4.5, diet: ["vg"], hot: true, desc: "Smoky chopped tomato, pepper and chilli, with bread.", allergens: ["gluten", "sesame", "sulphites"] },
        { id: "falafel", name: "Falafel", price: 6, diet: ["vg"], desc: "Six, with tahini sauce and pickled chillies.", allergens: ["sesame"] },
        { id: "borek", name: "Cheese filo rolls", price: 6, diet: ["v"], desc: "Four sigara börek, crisp and hot.", allergens: ["gluten", "eggs", "milk"] },
        { id: "soup", name: "Red lentil soup", price: 5.5, diet: ["vg"], desc: "With lemon, chilli butter on the side if you like, and bread.", allergens: ["celery", "gluten", "sesame"] },
        { id: "bread", name: "Turkish bread", price: 2.5, diet: ["vg"], desc: "Fresh from the oven with sesame and nigella seeds.", allergens: ["gluten", "sesame"] }
      ]
    },
    {
      id: "sweet",
      title: "Something sweet",
      icon: "i-baklava",
      items: [
        { id: "baklava", name: "Pistachio baklava", price: 6.5, diet: ["v"], featured: true, desc: "Four pieces, from a family bakery in north London.", allergens: ["gluten", "milk", "nuts"] },
        { id: "kunefe", name: "Künefe", price: 8.5, diet: ["v"], desc: "Shredded pastry and melting cheese in syrup, baked to order. Allow fifteen minutes.", options: ["kaymak"], allergens: ["gluten", "milk", "nuts"] },
        { id: "sutlac", name: "Baked rice pudding", price: 4.5, diet: ["v"], desc: "Sütlaç, served cold with cinnamon.", allergens: ["milk"] }
      ]
    },
    {
      id: "drinks",
      title: "Drinks",
      icon: "i-cup",
      items: [
        { id: "ayran", name: "Ayran", price: 2, diet: ["v"], desc: "Salted yoghurt drink. The classic with a kebab.", allergens: ["milk"] },
        { id: "salgam", name: "Şalgam", price: 2.5, diet: ["vg"], desc: "Tangy purple carrot juice, an acquired taste.", options: ["salgam"], allergens: [] },
        { id: "can", name: "Can of pop", price: 1.8, diet: ["vg"], desc: "330ml.", options: ["can"], allergens: [] },
        { id: "bottle", name: "1.5 litre bottle", price: 3.5, diet: ["vg"], desc: "To share.", options: ["bottle"], allergens: [] },
        { id: "water", name: "Still water", price: 1.2, diet: ["vg"], desc: "500ml bottle.", allergens: [] }
      ]
    }
  ]
};
