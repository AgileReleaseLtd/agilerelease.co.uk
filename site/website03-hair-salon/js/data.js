/* Sorrel & Steel: the salon's prices, team, opening hours and contact details. Every page reads this one
   file, so a price, a working day or an opening time is changed here and nowhere else.

   SAMPLE SITE: Sorrel & Steel is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. */
window.SorrelSteel = {
  // true = booking and contact buttons show what would happen instead of opening WhatsApp, the phone or email.
  sample: true,

  name: "Sorrel & Steel",
  shortName: "Sorrel & Steel",
  whatsapp: "447700900418",
  mobile: "07700 900418",
  phone: "020 7946 0418",
  phoneLink: "+442079460418",
  email: "hello@sorrelandsteel.example",
  address: "18 Merrow Parade, Brockley, London SE4",

  // Booking requests: how many days ahead (today counts as day 1), the notice needed, and the gap between
  // start times offered.
  bookingDays: 28,
  noticeMinutes: 120,
  slotMinutes: 30,

  // Colour needs a skin test at least this many hours before the appointment, for anyone new to colour
  // with us or who has not had colour with us for this many months.
  skinTestHours: 48,
  skinTestMonths: 6,

  // Appointments this long or longer need a deposit (in pounds) when we confirm.
  depositMinutes: 180,
  deposit: 30,

  // Opening hours. 1 = Monday ... 6 = Saturday, 0 = Sunday. null = closed all day.
  hours: {
    1: { open: "10:00", close: "18:00", note: "Barbers only" },
    2: { open: "09:30", close: "18:00" },
    3: { open: "09:30", close: "18:00" },
    4: { open: "09:30", close: "20:00", note: "Late night" },
    5: { open: "09:30", close: "20:00", note: "Late night" },
    6: { open: "09:00", close: "17:00" },
    0: { open: "10:00", close: "16:00" }
  },

  // Closed on these days every year (MM-DD).
  closedEveryYear: {
    "12-25": "Christmas Day",
    "12-26": "Boxing Day",
    "01-01": "New Year's Day"
  },

  // Hair length, for services priced by length.
  lengths: {
    short: { name: "Short", hint: "Above the chin" },
    medium: { name: "Medium", hint: "Chin to shoulders" },
    long: { name: "Long", hint: "Below the shoulders" }
  },

  // Stylist level, for services priced by level.
  levels: {
    stylist: { name: "Stylist" },
    senior: { name: "Senior stylist" }
  },

  // highlights: the services shown on the home page, whose lowest price is the "from" price there.
  categories: [
    {
      id: "cuts", name: "Cuts & styling", short: "Cuts", icon: "i-scissors",
      highlights: ["cut-blowdry", "curly-cut", "short-cut", "blow-dry"],
      blurb: "Cuts for every length and texture, blow-dries, and hair up for a big day.",
      priceNote: "Priced by stylist level. A senior stylist has at least eight years behind the chair."
    },
    {
      id: "colour", name: "Colour", short: "Colour", icon: "i-drop",
      highlights: ["roots", "full-colour", "balayage", "toner"],
      blurb: "From roots to balayage. Every colour finishes with a blow-dry.",
      priceNote: "Priced by hair length. Colour needs a skin test first if you are new to colour with us."
    },
    {
      id: "barbering", name: "Barbering", short: "Barbers", icon: "i-razor",
      highlights: ["classic", "skin-fade", "cut-beard", "shave"],
      blurb: "Fades, classic cuts, beards and hot towel shaves, on every hair type.",
      priceNote: "One price, whoever cuts. Over-65s: classic cut £22, Monday to Wednesday."
    },
    {
      id: "treatments", name: "Treatments", short: "Treatments", icon: "i-leaf",
      highlights: ["bond", "mask", "scalp", "smoothing"],
      blurb: "Repair, condition and smooth. Most can be added to another service.",
      priceNote: "Add a treatment to any cut or colour, or book it on its own."
    }
  ],

  /* Services. price: one number, or { stylist, senior } by level, or { short, medium, long } by hair length.
     minutes: one number, or { short, medium, long }. skinTest: true = needs a skin test first.
     quote: true = priced at a consultation, so it is listed but not booked online. */
  services: [
    { id: "cut-blowdry", cat: "cuts", name: "Cut and blow-dry", minutes: 60, price: { stylist: 62, senior: 78 },
      blurb: "A chat about what you want, then a wash, cut and blow-dry. Any length." },
    { id: "restyle", cat: "cuts", name: "Restyle", minutes: 90, price: { stylist: 74, senior: 92 },
      blurb: "A big change of length or shape, with more time to plan it first." },
    { id: "short-cut", cat: "cuts", name: "Short hair cut", minutes: 45, price: { stylist: 45, senior: 56 },
      blurb: "Crops, pixies and scissor cuts above the collar, with a quick finish." },
    { id: "curly-cut", cat: "cuts", name: "Curly cut", minutes: 75, price: { stylist: 68, senior: 84 },
      blurb: "Cut dry, curl by curl, then diffused. Come with your hair loose and product-free." },
    { id: "blow-dry", cat: "cuts", name: "Blow-dry", minutes: { short: 30, medium: 45, long: 45 }, price: { short: 32, medium: 38, long: 45 },
      blurb: "Wash and blow-dry, sleek or with volume." },
    { id: "hair-up", cat: "cuts", name: "Hair up", minutes: 60, price: { stylist: 65, senior: 80 },
      blurb: "For weddings, parties and big days. Bring a photo if you have one in mind." },
    { id: "fringe", cat: "cuts", name: "Fringe trim", minutes: 15, price: 12,
      blurb: "Free if we cut your hair in the last six weeks." },
    { id: "child-cut", cat: "cuts", name: "Child's cut", minutes: 30, price: 24,
      blurb: "Under 12s, any style, with a quick dry." },

    { id: "consult", cat: "colour", name: "Colour consultation", minutes: 15, price: 0,
      blurb: "Plan a big change with us. We do your skin test at the same visit." },
    { id: "roots", cat: "colour", name: "Root colour", minutes: 90, price: 68, skinTest: true,
      blurb: "Regrowth up to 3 cm, in the same shade as before." },
    { id: "full-colour", cat: "colour", name: "Full head colour", minutes: { short: 105, medium: 120, long: 135 }, price: { short: 82, medium: 96, long: 112 }, skinTest: true,
      blurb: "One shade, roots to ends." },
    { id: "half-highlights", cat: "colour", name: "Half head highlights", minutes: { short: 120, medium: 135, long: 150 }, price: { short: 98, medium: 118, long: 138 }, skinTest: true,
      blurb: "Foils through the top and sides." },
    { id: "full-highlights", cat: "colour", name: "Full head highlights", minutes: { short: 150, medium: 165, long: 180 }, price: { short: 128, medium: 152, long: 176 }, skinTest: true,
      blurb: "Foils all over, for brightness all the way round." },
    { id: "balayage", cat: "colour", name: "Balayage", minutes: { short: 180, medium: 195, long: 210 }, price: { short: 150, medium: 178, long: 210 }, skinTest: true,
      blurb: "Painted by hand for a soft grow-out. Toner included." },
    { id: "toner", cat: "colour", name: "Toner or gloss", minutes: 45, price: { short: 36, medium: 40, long: 46 }, skinTest: true,
      blurb: "Refreshes blonde, adds shine or calms down brassy tones." },
    { id: "correction", cat: "colour", name: "Colour correction", quote: true,
      blurb: "Fixing colour that went wrong, here or elsewhere. Book a free consultation and we will price it then." },

    { id: "classic", cat: "barbering", name: "Classic cut", minutes: 30, price: 28,
      blurb: "Clippers and scissors, finished with a hot towel on the neck." },
    { id: "skin-fade", cat: "barbering", name: "Skin fade", minutes: 45, price: 32,
      blurb: "Faded down to the skin and blended by hand." },
    { id: "cut-beard", cat: "barbering", name: "Cut and beard", minutes: 60, price: 42,
      blurb: "Any cut, plus a beard trim and a razor line-up." },
    { id: "beard", cat: "barbering", name: "Beard trim and line-up", minutes: 20, price: 18,
      blurb: "Shaped with clippers, lined up with a cut-throat razor." },
    { id: "shave", cat: "barbering", name: "Hot towel shave", minutes: 40, price: 34,
      blurb: "Hot towels, pre-shave oil, a cut-throat razor and a cold towel to finish." },
    { id: "head-shave", cat: "barbering", name: "Head shave", minutes: 30, price: 25,
      blurb: "Clippers, then the razor, with a hot towel." },
    { id: "kids-cut", cat: "barbering", name: "Kids' clipper cut", minutes: 30, price: 20,
      blurb: "Under 12s. Clippers, scissors or both." },
    { id: "grey-blend", cat: "barbering", name: "Grey blending", minutes: 30, price: 28, skinTest: true,
      blurb: "Softens grey in hair or beard, so it looks natural rather than dyed." },

    { id: "bond", cat: "treatments", name: "Bond repair", minutes: 20, price: 25,
      blurb: "Strengthens hair after bleach or heat. Best added to a colour." },
    { id: "mask", cat: "treatments", name: "Deep conditioning mask", minutes: 15, price: 18,
      blurb: "Ten minutes under the steamer, for dry or coarse hair." },
    { id: "scalp", cat: "treatments", name: "Scalp treatment", minutes: 30, price: 30,
      blurb: "A gentle scrub, a scalp massage and a calming tonic." },
    { id: "smoothing", cat: "treatments", name: "Smoothing treatment", minutes: { short: 150, medium: 180, long: 210 }, price: { short: 180, medium: 220, long: 260 },
      blurb: "Less frizz and quicker blow-drying for up to three months. Not during pregnancy." }
  ],

  /* The team. level: "stylist" or "senior" (sets the price of services priced by level).
     days: the hours each person works, by weekday (1 = Monday ... 0 = Sunday). does: the services they do.
     tone: the colours of their monogram. */
  team: [
    {
      id: "nadia", name: "Nadia", role: "Owner and senior stylist", level: "senior", tone: "ink",
      specialities: ["Precision bobs", "Curls and coils", "Big restyles"],
      bio: "Opened Sorrel & Steel after twelve years in Soho salons. Cuts curly hair dry, the way it sits.",
      days: { 2: ["09:30", "18:00"], 3: ["09:30", "18:00"], 4: ["11:00", "20:00"], 5: ["09:30", "18:00"], 6: ["09:00", "17:00"] },
      does: ["cut-blowdry", "restyle", "short-cut", "curly-cut", "blow-dry", "hair-up", "fringe", "child-cut",
        "consult", "roots", "full-colour", "toner", "bond", "mask", "scalp", "smoothing"]
    },
    {
      id: "theo", name: "Theo", role: "Senior colourist", level: "senior", tone: "sorrel",
      specialities: ["Balayage", "Lived-in blonde", "Colour correction"],
      bio: "Plans colour around how you live, so it grows out well. Happy to talk you out of bleach.",
      days: { 3: ["09:30", "18:00"], 4: ["09:30", "18:00"], 5: ["11:00", "20:00"], 6: ["09:00", "17:00"], 0: ["10:00", "16:00"] },
      does: ["consult", "roots", "full-colour", "half-highlights", "full-highlights", "balayage", "toner",
        "cut-blowdry", "blow-dry", "fringe", "bond", "mask", "smoothing"]
    },
    {
      id: "rosa", name: "Rosa", role: "Stylist", level: "stylist", tone: "blush",
      specialities: ["Blow-dries", "Hair up", "Children's cuts"],
      bio: "Trained here and now runs our late nights. Brilliant with nervous first-timers and small children.",
      days: { 2: ["09:30", "18:00"], 4: ["11:00", "20:00"], 5: ["11:00", "20:00"], 6: ["09:00", "17:00"], 0: ["10:00", "16:00"] },
      does: ["cut-blowdry", "short-cut", "blow-dry", "hair-up", "fringe", "child-cut", "consult", "roots",
        "full-colour", "half-highlights", "toner", "bond", "mask"]
    },
    {
      id: "femi", name: "Femi", role: "Senior barber", level: "senior", tone: "steel",
      specialities: ["Skin fades", "Afro and textured hair", "Hot towel shaves"],
      bio: "Runs the barbers' side. Fifteen years with the clippers and a very steady hand with a razor.",
      days: { 1: ["10:00", "18:00"], 2: ["09:30", "18:00"], 4: ["11:00", "20:00"], 5: ["09:30", "18:00"], 6: ["09:00", "17:00"] },
      does: ["classic", "skin-fade", "cut-beard", "beard", "shave", "head-shave", "kids-cut", "grey-blend", "scalp"]
    },
    {
      id: "kit", name: "Kit", role: "Barber", level: "stylist", tone: "mist",
      specialities: ["Classic cuts", "Beard shaping", "Kids' cuts"],
      bio: "Does a sharp classic cut in half an hour, and keeps small clients still with a running commentary.",
      days: { 1: ["10:00", "18:00"], 3: ["09:30", "18:00"], 5: ["11:00", "20:00"], 6: ["09:00", "17:00"], 0: ["10:00", "16:00"] },
      does: ["classic", "skin-fade", "cut-beard", "beard", "head-shave", "kids-cut", "grey-blend"]
    }
  ],

  /* Gallery tiles. On the real site each one is a photo of the team's own work, used with the client's
     permission. motif and tone set the placeholder pattern. */
  gallery: [
    { cat: "colour", title: "Copper balayage", detail: "Long hair, by Theo", motif: "waves", tone: "copper", tall: true },
    { cat: "barbering", title: "Mid skin fade", detail: "Textured top, by Femi", motif: "fade", tone: "steel" },
    { cat: "cuts", title: "Blunt bob", detail: "Chin length, by Nadia", motif: "bob", tone: "ink" },
    { cat: "cuts", title: "Curly cut", detail: "Cut dry and diffused, by Nadia", motif: "curls", tone: "blush", tall: true },
    { cat: "colour", title: "Soft blonde", detail: "Highlights and toner, by Rosa", motif: "waves", tone: "sand" },
    { cat: "barbering", title: "Beard line-up", detail: "Razor finish, by Kit", motif: "lines", tone: "mist" },
    { cat: "cuts", title: "Hair up", detail: "Wedding morning, by Rosa", motif: "swirl", tone: "sorrel" },
    { cat: "cuts", title: "Sleek blow-dry", detail: "Long hair, by Rosa", motif: "sleek", tone: "mist" },
    { cat: "barbering", title: "Grey blending", detail: "Hair and beard, by Femi", motif: "fade", tone: "ink" },
    { cat: "colour", title: "Glossy brunette", detail: "Full head colour and gloss, by Theo", motif: "sleek", tone: "sorrel" }
  ]
};
