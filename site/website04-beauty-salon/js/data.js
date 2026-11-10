/* Lunette Beauty Rooms: treatments, prices, opening hours, booking rules, gift vouchers and contact details.
   Every page reads this one file, so a price or an opening time is changed here and nowhere else.

   SAMPLE SITE: Lunette Beauty Rooms is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept
   for drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. */
window.Lunette = {
  // true = booking, voucher and contact buttons show what would happen instead of opening WhatsApp,
  // the phone or email.
  sample: true,

  name: "Lunette Beauty Rooms",
  shortName: "Lunette",
  whatsapp: "447700900482",
  phone: "020 7946 0482",
  phoneLink: "+442079460482",
  email: "hello@lunette.example",
  address: "12 Quince Row, Ealing, London W5",

  // Opening hours, by day of the week: 0 = Sunday, 1 = Monday ... 6 = Saturday. null = closed.
  hours: {
    1: null,
    2: ["10:00", "19:00"],
    3: ["10:00", "19:00"],
    4: ["10:00", "20:00"],
    5: ["10:00", "20:00"],
    6: ["09:00", "18:00"],
    0: ["10:00", "16:00"]
  },

  // Dates that differ from the usual week. Format YYYY-MM-DD. null = closed all day.
  specialDays: {
    "2026-12-24": { hours: ["09:00", "15:00"], label: "Christmas Eve" },
    "2026-12-25": { hours: null, label: "Christmas Day" },
    "2026-12-26": { hours: null, label: "Boxing Day" },
    "2026-12-31": { hours: ["10:00", "16:00"], label: "New Year's Eve" },
    "2027-01-01": { hours: null, label: "New Year's Day" }
  },

  booking: {
    days: 35,              // how far ahead people can ask for, in days (today counts as day 1)
    step: 30,              // start times are offered every this many minutes
    noticeMinutes: 120,    // a same-day appointment needs this much notice
    patchTestHours: 48,    // a patch test must be done at least this long before the treatment
    deposit: 20,           // deposit for lash extension full sets and bookings over depositOver
    depositOver: 100
  },

  categories: [
    {
      id: "nails", name: "Nails", icon: "i-polish",
      blurb: "Gel polish, BIAB, manicures and pedicures. Every nail treatment includes shaping and cuticle care."
    },
    {
      id: "lashes", name: "Lashes & brows", icon: "i-lash",
      blurb: "Lash extensions, lifts, tints and brow shaping. Tints, lifts and lash extensions need a patch test first."
    },
    {
      id: "facials", name: "Facials", icon: "i-drop",
      blurb: "Every facial starts with a short skin consultation. We will tell you honestly what will and will not help."
    },
    {
      id: "waxing", name: "Waxing", icon: "i-wax",
      blurb: "Hot wax for small and intimate areas, warm wax for legs. Hair needs to be about 5 mm long, roughly four weeks' growth."
    }
  ],

  // mins = how long to book, price in pounds. from: true = the price is a starting price.
  // patch: true = needs a patch test at least 48 hours before (tints, lifts and the lash glue).
  // deposit: true = always needs the deposit (lash extension full sets).
  // voucher: false = not offered as a treatment voucher (add-ons and removals).
  treatments: [
    { id: "gel-hands", cat: "nails", name: "Gel polish, hands", mins: 45, price: 36,
      desc: "Shape, cuticle tidy and a gel colour that lasts about two weeks." },
    { id: "gel-toes", cat: "nails", name: "Gel polish, toes", mins: 45, price: 38,
      desc: "Shape, cuticle tidy and gel colour. Lasts three to four weeks on toes." },
    { id: "biab", cat: "nails", name: "BIAB overlay", mins: 60, price: 48,
      desc: "A builder gel layer over your own nails, for strength while they grow. Lasts three to four weeks." },
    { id: "biab-infill", cat: "nails", name: "BIAB infill", mins: 60, price: 44,
      desc: "Rebalance and new colour, within four weeks of your last BIAB with us." },
    { id: "manicure", cat: "nails", name: "Classic manicure", mins: 40, price: 30,
      desc: "Soak, shape, cuticle work, hand massage and a regular polish." },
    { id: "pedicure", cat: "nails", name: "Pedicure with gel", mins: 60, price: 52,
      desc: "Foot soak, hard skin removal, cuticle work, massage and gel colour." },
    { id: "nail-removal", cat: "nails", name: "Gel or BIAB removal", mins: 20, price: 12, voucher: false,
      desc: "Gentle soak-off with a strengthening finish. Free with a new set, so choose this only for a removal on its own." },
    { id: "nail-art", cat: "nails", name: "Nail art", mins: 15, price: 5, from: true, voucher: false,
      desc: "French tips, chrome or simple designs, added to a gel or BIAB set. From £5 for two nails." },

    { id: "lash-classic", cat: "lashes", name: "Classic lash extensions, full set", mins: 120, price: 75, patch: true, deposit: true,
      desc: "One extension on each natural lash, for a natural, mascara-like look." },
    { id: "lash-hybrid", cat: "lashes", name: "Hybrid lash extensions, full set", mins: 120, price: 85, patch: true, deposit: true,
      desc: "A mix of classic and light volume lashes, for a softer and fuller line." },
    { id: "lash-volume", cat: "lashes", name: "Volume lash extensions, full set", mins: 150, price: 95, patch: true, deposit: true,
      desc: "Fans of very fine lashes, for a fuller, darker line." },
    { id: "lash-infill", cat: "lashes", name: "Lash infill", mins: 60, price: 45,
      desc: "Within three weeks of your last set or infill with us, with at least half your extensions still on." },
    { id: "lash-removal", cat: "lashes", name: "Lash extension removal", mins: 30, price: 20, voucher: false,
      desc: "Safe removal with a cream remover. Please never pull extensions off at home." },
    { id: "lash-lift", cat: "lashes", name: "Lash lift & tint", mins: 60, price: 55, patch: true,
      desc: "Lifts and curls your own lashes for six to eight weeks. Includes a tint." },
    { id: "brow-lamination", cat: "lashes", name: "Brow lamination & tint", mins: 50, price: 50, patch: true,
      desc: "Sets brows brushed up and in place for about six weeks. Includes a shape and a tint." },
    { id: "brow-shape", cat: "lashes", name: "Brow shape", mins: 20, price: 18,
      desc: "Wax and tweeze to shape, with a light trim if needed." },
    { id: "brow-shape-tint", cat: "lashes", name: "Brow shape & tint", mins: 30, price: 28, patch: true,
      desc: "A shape plus a tint matched to your hair and skin." },
    { id: "lash-tint", cat: "lashes", name: "Lash tint", mins: 20, price: 18, patch: true,
      desc: "Darkens your own lashes for about four to six weeks." },
    { id: "brow-tint", cat: "lashes", name: "Brow tint", mins: 15, price: 14, patch: true,
      desc: "Defines and fills in brows for about four weeks." },

    { id: "facial-express", cat: "facials", name: "Express facial", mins: 30, price: 45,
      desc: "Cleanse, exfoliate, mask and moisturise. A good lunchtime refresh." },
    { id: "facial-signature", cat: "facials", name: "Signature facial", mins: 60, price: 75,
      desc: "Double cleanse, exfoliation, extractions if needed, face and shoulder massage, and a mask chosen for your skin." },
    { id: "facial-deep", cat: "facials", name: "Deep-cleanse facial", mins: 75, price: 88,
      desc: "Steam, an enzyme peel and careful extractions, for congested skin." },
    { id: "dermaplaning", cat: "facials", name: "Dermaplaning facial", mins: 45, price: 65,
      desc: "Removes dead skin and fine facial hair with a sterile blade. Not suitable during a breakout." },
    { id: "led", cat: "facials", name: "LED light add-on", mins: 20, price: 20, voucher: false,
      desc: "Added to any facial: red or blue light, chosen for your skin." },

    { id: "wax-lip", cat: "waxing", name: "Lip or chin", mins: 10, price: 10,
      desc: "Hot wax." },
    { id: "wax-underarm", cat: "waxing", name: "Underarm", mins: 15, price: 16,
      desc: "Hot wax." },
    { id: "wax-half-leg", cat: "waxing", name: "Half leg", mins: 25, price: 28,
      desc: "Lower or upper leg, warm wax." },
    { id: "wax-full-leg", cat: "waxing", name: "Full leg", mins: 45, price: 42,
      desc: "Warm wax, with knees and ankles finished in hot wax." },
    { id: "wax-bikini", cat: "waxing", name: "Bikini line", mins: 15, price: 20,
      desc: "Hot wax, for hair outside the line of your underwear." },
    { id: "wax-brazilian", cat: "waxing", name: "Brazilian", mins: 30, price: 42,
      desc: "Hot wax, leaving a small strip or triangle at the front." },
    { id: "wax-hollywood", cat: "waxing", name: "Hollywood", mins: 35, price: 45,
      desc: "Hot wax, all hair removed." },
    { id: "wax-leg-bikini", cat: "waxing", name: "Full leg & bikini line", mins: 55, price: 58,
      desc: "Both together, £4 less than booking them separately." }
  ],

  vouchers: {
    amounts: [25, 50, 75, 100, 150],
    min: 20,
    max: 500,
    validMonths: 12,
    messageMax: 140,
    // How many days ahead someone can choose for an e-voucher to be emailed (a birthday, say).
    sendAheadDays: 90,
    designs: [
      { id: "garnet", name: "Garnet" },
      { id: "slate", name: "Slate" },
      { id: "porcelain", name: "Porcelain" }
    ]
  }
};
