/* Harebell Dental: everything the practice would change lives here (contact details, the NHS list flag,
   opening hours, emergency line and slots, closed days, treatments, fees and the team). Every page reads
   this one file.

   SAMPLE SITE: Harebell Dental is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. The NHS charges
   are the real England charges (see nhsSource); everything else is invented. */
window.Harebell = {
  // true = contact and send buttons explain what they would do instead of opening WhatsApp, the phone or email.
  sample: true,

  name: "Harebell Dental",
  whatsapp: "447700900163",
  phone: "020 7946 0163",
  phoneLink: "+442079460163",
  emergencyPhone: "020 7946 0164",
  emergencyPhoneLink: "+442079460164",
  email: "hello@harebelldental.example",
  address: "7 Linley Place, Eltham, London SE9",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Eltham+High+Street+London+SE9",

  // The NHS list. Change acceptingNew to true when the practice can take new NHS patients again.
  nhs: {
    acceptingNew: false,
    // Under-18s are still taken on the NHS while the list for adults is closed.
    childrenWelcome: true,
    // Adults who ask for NHS care can join a waiting list.
    waitingList: true
  },

  // Practice opening hours, London time. 1 = Monday ... 6 = Saturday, 0 = Sunday. null = closed.
  hours: {
    1: ["08:30", "18:00"],
    2: ["08:30", "19:30"],
    3: ["08:30", "18:00"],
    4: ["08:30", "19:30"],
    5: ["08:30", "17:00"],
    6: ["09:00", "13:00"],
    0: null
  },

  // The emergency phone line opens half an hour before the practice on weekdays.
  emergencyLine: {
    1: ["08:00", "17:30"],
    2: ["08:00", "17:30"],
    3: ["08:00", "17:30"],
    4: ["08:00", "17:30"],
    5: ["08:00", "16:30"],
    6: ["09:00", "12:00"],
    0: null
  },

  // Appointments held back each day for dental emergencies, given out on the phone in order of need.
  emergencySlots: {
    1: ["09:10", "11:40", "14:20", "16:40"],
    2: ["09:10", "11:40", "14:20", "16:40"],
    3: ["09:10", "11:40", "14:20", "16:40"],
    4: ["09:10", "11:40", "14:20", "16:40"],
    5: ["09:10", "11:40", "14:20", "15:50"],
    6: ["09:30", "11:30"],
    0: []
  },

  // Days the practice is shut (bank holidays). Format YYYY-MM-DD.
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
    "2027-12-28": "Boxing Day bank holiday"
  },

  // NHS dental charges in England from 1 April 2026. Checked on nhs.uk and the NHS Business Services
  // Authority on 10 November 2026. Update each April.
  nhsSource: {
    from: "1 April 2026",
    checked: "10 November 2026",
    url: "https://www.nhs.uk/nhs-services/dentists/dental-costs/how-much-will-i-pay-for-nhs-dental-treatment/"
  },
  nhsBands: [
    {
      id: "band1", name: "Band 1", short: "Band 1: check-up", price: "£27.90",
      covers: "A check-up: examination, diagnosis and advice.",
      includes: ["X-rays, if clinically needed", "A scale and polish (simple gum care), if clinically needed", "Fluoride varnish", "Planning any further treatment"]
    },
    {
      id: "band2", name: "Band 2", short: "Band 2: fillings, root canal, extractions", price: "£76.60",
      covers: "Everything in Band 1, plus more treatment.",
      includes: ["Fillings", "Root canal treatment", "Taking out teeth (extractions)", "More extensive gum treatment"]
    },
    {
      id: "band3", name: "Band 3", short: "Band 3: crowns, bridges, dentures", price: "£332.10",
      covers: "Everything in Bands 1 and 2, plus more complex treatment.",
      includes: ["Crowns", "Bridges", "Dentures", "Inlays and onlays"]
    },
    {
      id: "urgent", name: "Urgent treatment", short: "Urgent treatment", price: "£27.90",
      covers: "An urgent assessment and the treatment needed to make you comfortable.",
      includes: ["A temporary (emergency) filling", "Draining an abscess", "Taking out up to 2 teeth", "Starting root canal treatment to ease pain"]
    }
  ],
  nhsRules: [
    "You pay one charge for each course of treatment, even if it takes more than one visit.",
    "If your treatment covers more than one band, you pay only the highest band.",
    "If you need more treatment within 2 months in the same or a lower band, you do not pay again.",
    "Removing stitches, stopping bleeding and repairing dentures are free."
  ],
  // Who gets free NHS dental treatment in England (nhs.uk, checked 10 November 2026).
  nhsFree: [
    "You are under 18, or under 19 and in full-time education",
    "You are pregnant, or have had a baby in the last 12 months",
    "You have had a stillbirth in the last 12 months",
    "You are being treated by a hospital dentist in an NHS hospital (you may still pay for dentures or bridges)",
    "You, or your partner, get Income-related Employment and Support Allowance, Pension Credit Guarantee Credit, or Universal Credit (if your income is below a set amount)",
    "You are named on a valid HC2 certificate (NHS Low Income Scheme)"
  ],

  // Private prices shown on the home page (names from privateFees below).
  homeHighlights: ["New patient consultation", "Hygienist visit, 30 minutes", "Home teeth whitening", "Single implant with crown"],

  // The practice's own private prices. [treatment, price, note]
  privateFees: [
    {
      group: "Check-ups and hygiene",
      items: [
        ["New patient consultation", "£85", "Full examination, any X-rays you need and a written plan with prices"],
        ["Check-up", "£60", "For existing private patients"],
        ["Hygienist visit, 30 minutes", "£85", ""],
        ["Hygienist visit, 45 minutes", "£115", "Includes stain removal"],
        ["Children's check-up", "Free", "Under 18, when a parent is a private patient here"]
      ]
    },
    {
      group: "Emergencies",
      items: [
        ["Emergency appointment", "£95", "Assessment and the first treatment to ease pain"]
      ]
    },
    {
      group: "Fillings and root canals",
      items: [
        ["Tooth-coloured filling, small", "£140", ""],
        ["Tooth-coloured filling, large", "£220", ""],
        ["Root canal treatment, front tooth", "£450", ""],
        ["Root canal treatment, premolar", "£595", ""],
        ["Root canal treatment, molar", "£750", "A crown afterwards is priced separately"]
      ]
    },
    {
      group: "Crowns, bridges and dentures",
      items: [
        ["Porcelain-bonded crown", "£695", ""],
        ["All-ceramic crown", "£795", ""],
        ["Bridge", "from £1,450", "Price depends on how many teeth the bridge covers"],
        ["Full acrylic denture, one jaw", "£850", ""],
        ["Partial metal-framed denture", "£1,150", ""]
      ]
    },
    {
      group: "Extractions",
      items: [
        ["Simple extraction", "£150", ""],
        ["Surgical extraction", "from £295", "For example, a wisdom tooth"]
      ]
    },
    {
      group: "Cosmetic and implants",
      items: [
        ["Home teeth whitening", "£395", "Custom trays, gel and two review visits"],
        ["Clear aligners, minor correction", "from £2,400", "Includes retainers"],
        ["Clear aligners, full treatment", "from £3,600", "Includes retainers"],
        ["Implant consultation", "£150", "Includes X-rays; taken off the implant price if you go ahead"],
        ["Single implant with crown", "from £2,650", ""]
      ]
    }
  ],

  /* Treatments. nhs: the NHS band ("band1", "band2", "band3"), "free" for children, or "" when it is only
     offered privately. private: the private price shown on the card. children: shown under the Children
     filter. icon: an id in the page's icon sprite. */
  treatments: [
    {
      id: "check-ups", children: true, name: "Check-ups and hygiene", icon: "i-mirror", nhs: "band1",
      private: "Check-up £60, hygienist from £85",
      summary: "A careful look at your teeth, gums and mouth, and a clean when you need one.",
      about: "At a check-up the dentist looks at your teeth, gums, tongue and the inside of your cheeks, asks about any problems and tells you what they see. A hygienist visit is a deeper clean of your teeth and gums, with practical tips for brushing and cleaning between your teeth.",
      steps: ["A chat about your health and any worries", "A look round your mouth with a small mirror", "X-rays only if they are needed", "A plan with prices, in writing, before any treatment"],
      time: "A check-up takes about 20 minutes. Hygienist visits are 30 or 45 minutes.",
      note: "How often you need a check-up depends on your mouth: anything from every 3 months to every 2 years. We will tell you why."
    },
    {
      id: "fillings", children: true, name: "Fillings", icon: "i-fill", nhs: "band2",
      private: "from £140",
      summary: "Repairs a tooth with a small hole (decay), a crack or a chip.",
      about: "We numb the tooth, remove the decay and fill the space. Most of our fillings are tooth-coloured. A small filling is usually done in one visit.",
      steps: ["Numbing gel, then a small injection", "Removing the decay", "Filling and shaping the tooth", "Checking your bite feels right"],
      time: "Usually 30 to 45 minutes.",
      note: "Your lip and cheek may feel numb for a couple of hours. Wait until the feeling comes back before eating or having hot drinks."
    },
    {
      id: "root-canal", name: "Root canal treatment", icon: "i-roots", nhs: "band2",
      private: "from £450",
      summary: "Treats an infected or inflamed nerve inside a tooth, so the tooth can be kept.",
      about: "Inside each tooth is soft tissue called the pulp. If it becomes infected or inflamed it can cause pain or an abscess. Root canal treatment removes it, cleans the inside of the tooth and seals it. It is done with local anaesthetic, so for most people it feels much like having a filling.",
      steps: ["Numbing the tooth", "Removing the inflamed or infected pulp", "Cleaning and shaping the root canals", "Sealing the tooth and placing a filling"],
      time: "Usually one or two visits of about an hour.",
      note: "A back tooth often needs a crown afterwards to protect it. No treatment can be guaranteed to last, so we will talk through the chances for your tooth before we start."
    },
    {
      id: "crowns-bridges", name: "Crowns and bridges", icon: "i-crown", nhs: "band3",
      private: "Crowns from £695, bridges from £1,450",
      summary: "A crown covers and protects a weak tooth. A bridge fills a gap with a false tooth held by the teeth either side.",
      about: "We shape the tooth, take a scan or a mould, and fit a temporary crown. A dental laboratory makes the final crown or bridge to match your other teeth, and we fit it at a second visit.",
      steps: ["Numbing and shaping the tooth", "A scan or mould of your teeth", "A temporary crown to wear for now", "Fitting the final crown or bridge"],
      time: "Two visits, about two weeks apart.",
      note: "Look after a crown or bridge like your own teeth, including cleaning under a bridge with floss or small brushes."
    },
    {
      id: "extractions", children: true, name: "Extractions", icon: "i-lift", nhs: "band2",
      private: "from £150",
      summary: "Taking out a tooth that cannot be saved, or one that is causing problems.",
      about: "We always look at ways to keep a tooth first. If it has to come out, we numb the area well and take it out gently. You go home with written aftercare advice and a number to call.",
      steps: ["Talking through why and what the options are", "Numbing the area well", "Taking the tooth out", "Aftercare advice, written down"],
      time: "Most simple extractions take 20 to 40 minutes.",
      note: "Some soreness for a few days is normal. If the socket keeps bleeding, press on a clean rolled-up pad for 15 minutes. If the bleeding is heavy and will not stop, call 999 or go to A&E."
    },
    {
      id: "dentures", name: "Dentures", icon: "i-smile", nhs: "band3",
      private: "from £850",
      summary: "Removable false teeth, to replace some or all of your teeth.",
      about: "A partial denture fills gaps and clips onto your own teeth. A full denture replaces all the teeth in one jaw. They are made over several short visits so they fit well and look like you.",
      steps: ["Moulds of your mouth", "Recording how your teeth meet", "Trying in a wax version", "Fitting, then adjusting at a review"],
      time: "Usually four or five visits over about six weeks.",
      note: "New dentures take a few weeks to get used to. We will see you again to adjust them, and repairs to NHS dentures are free."
    },
    {
      id: "implants", name: "Implants", icon: "i-implant", nhs: "",
      private: "from £2,650",
      summary: "A replacement root, fixed in the jawbone, that holds a crown, bridge or denture.",
      about: "An implant is a small titanium post placed in the jaw with local anaesthetic. Once the bone has healed around it, we fit a crown on top. Implants are not right for everyone, so we check your gums, bone and general health first, and talk through the other options.",
      steps: ["A consultation with X-rays", "Placing the implant", "Healing time, usually a few months", "Fitting the crown"],
      time: "Usually 3 to 6 months from start to finish.",
      note: "Implants are not usually available on the NHS. They need the same daily care as natural teeth, and regular check-ups."
    },
    {
      id: "whitening", name: "Teeth whitening", icon: "i-sun", nhs: "",
      private: "£395",
      summary: "Lightens the colour of your natural teeth, using trays you wear at home.",
      about: "After a check-up, we scan your teeth and make thin trays that fit them closely. You wear the trays with a whitening gel for a set time each day, usually for two to three weeks. In the UK, tooth whitening should only be done by a dentist or another registered dental professional, after an examination.",
      steps: ["A check-up to make sure whitening is safe for you", "A scan for your custom trays", "Two to three weeks of wearing them at home", "A review to see how it went"],
      time: "Two short visits, then two to three weeks at home.",
      note: "Results vary from person to person. Whitening does not change the colour of crowns or fillings, and teeth can feel sensitive for a while. Not for under-18s."
    },
    {
      id: "aligners", name: "Clear aligners", icon: "i-aligner", nhs: "",
      private: "from £2,400",
      summary: "Clear, removable trays that move teeth a little at a time. An option to fixed braces for some adults.",
      about: "We scan your teeth and plan the movement. You get a series of thin plastic trays, each slightly different, and move on to the next set every week or two. They need to be worn for about 22 hours a day, and you take them out to eat and brush.",
      steps: ["An assessment and scan", "A plan showing how your teeth should move", "New trays every week or two, with check-ins", "Retainers to keep the result"],
      time: "Often 6 to 18 months, depending on how far your teeth need to move.",
      note: "Retainers are needed afterwards to stop teeth moving back. Not every case suits aligners, and we will tell you if yours does not. On the NHS, braces are for under-18s with a clinical need, through a referral to a specialist."
    },
    {
      id: "children", children: true, name: "Children's dentistry", icon: "i-balloon", nhs: "free",
      private: "Free with a private parent",
      summary: "Gentle check-ups from the first tooth, with plenty of time to get used to the chair.",
      about: "Bring your child from when their first tooth comes through, or by their first birthday. Early visits are short and relaxed: a ride in the chair, counting teeth and tips for brushing at home. From age 3 we can paint fluoride varnish on their teeth to help prevent decay.",
      steps: ["A ride up and down in the chair", "Counting teeth together", "Fluoride varnish from age 3", "Brushing tips for you and them"],
      time: "Usually 15 to 20 minutes.",
      note: "NHS dental care is free for under-18s, and for under-19s in full-time education. Book children in at the same time as your own check-up if that is easier."
    }
  ],

  // The team. gdc: the General Dental Council number slot (an example on this sample site).
  team: [
    {
      initials: "AO", name: "Dr Amara Osei", role: "Principal dentist", tone: "bell",
      days: "Monday to Thursday", gdc: true,
      bio: "Opened Harebell in 2014. Does most of our crowns, bridges and dentures, and likes to explain every step before she starts."
    },
    {
      initials: "HM", name: "Dr Helen Marsh", role: "Dentist", tone: "apricot",
      days: "Tuesday, Thursday, Friday and Saturday", gdc: true,
      bio: "Sees many of our children and nervous patients. Happy to keep a first visit to a chat and a look, and nothing more."
    },
    {
      initials: "RM", name: "Dr Rohan Mehta", role: "Dentist", tone: "sage",
      days: "Monday, Wednesday and Friday", gdc: true,
      bio: "Does our root canal treatment, implants and clear aligners, and will tell you plainly when a simpler option would do."
    },
    {
      initials: "KD", name: "Kirsty Doyle", role: "Dental hygienist", tone: "bell",
      days: "Tuesday, Wednesday and Saturday", gdc: true,
      bio: "Gentle cleans and no lectures. Good at finding the brushing routine you will actually keep up."
    },
    {
      initials: "GA", name: "Grace Adeyemi", role: "Lead dental nurse", tone: "apricot",
      days: "Monday to Friday", gdc: true,
      bio: "Often the first face you see in the surgery. Will sit with you, hold a hand if you want, and agree a stop signal before you start."
    },
    {
      initials: "JP", name: "Jo Pemberton", role: "Practice manager", tone: "sage",
      days: "Monday to Friday", gdc: false,
      bio: "Looks after bookings, the NHS waiting list and fees. The person to call about anything that is not clinical."
    }
  ],

  // The breathing exercise on the home page, in seconds.
  breathing: { inhale: 4, hold: 2, exhale: 6, rounds: 4 },

  /* Is it an emergency? level: "999" (call 999 or go to A&E), "today" (call us today), "soon" (book in the
     next few days). The page adds the right phone number and the out-of-hours advice. */
  triage: [
    { id: "breathing", label: "Swelling that makes it hard to breathe, swallow or speak", level: "999",
      advice: "Call 999 or go to A&E now. Do not drive yourself." },
    { id: "eye-neck", label: "Swelling spreading to your eye or down your neck", level: "999",
      advice: "Call 999 or go to A&E now." },
    { id: "bleeding", label: "Heavy bleeding from the mouth that will not stop", level: "999",
      advice: "Press firmly on a clean rolled-up pad. If heavy bleeding has not stopped after 15 minutes, call 999 or go to A&E." },
    { id: "injury", label: "A serious injury to the face, mouth or jaw", level: "999",
      advice: "Call 999 or go to A&E now." },
    { id: "knocked-out", label: "An adult tooth knocked out", level: "today",
      advice: "Hold it by the white top, not the root. Rinse it in milk if dirty, push it back into the socket if you can and bite on a clean cloth, or keep it in milk. See a dentist as soon as possible. Do not put a baby tooth back." },
    { id: "toothache", label: "Bad toothache that painkillers are not helping", level: "today",
      advice: "Take ordinary painkillers as the packet says, and avoid very hot or cold food and drink." },
    { id: "swelling", label: "Swelling of the gum or face, with no breathing problems", level: "today",
      advice: "Swelling can mean an infection that needs treating soon. If it starts to affect your breathing, swallowing or eye, call 999." },
    { id: "after-extraction", label: "Bleeding after an extraction that has not settled", level: "today",
      advice: "Press firmly on a clean rolled-up pad for 15 minutes without checking. If it is heavy and will not stop, call 999." },
    { id: "broken", label: "A broken tooth with pain", level: "today",
      advice: "Keep any pieces. Avoid chewing on that side until we have seen you." },
    { id: "lost-filling", label: "A lost filling or crown, but no bad pain", level: "soon",
      advice: "Keep a crown safe and bring it with you. Chew on the other side for now." },
    { id: "chipped", label: "A small chip, with no pain", level: "soon",
      advice: "Not an emergency. Book an appointment in the next week or two." },
    { id: "denture", label: "A broken or loose denture", level: "soon",
      advice: "Do not glue it yourself. Bring all the pieces in. NHS denture repairs are free." }
  ]
};
