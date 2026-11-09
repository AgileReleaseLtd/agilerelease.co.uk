/* Ironfern Studio: the studio's timetable, classes and contact details. Every page reads this one file,
   so a change to the timetable is made here and nowhere else.

   SAMPLE SITE: Ironfern Studio is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. */
window.Ironfern = {
  // true = booking and contact buttons show what would happen instead of opening WhatsApp, the phone or email.
  sample: true,

  whatsapp: "447700900321",
  phone: "020 7946 0321",
  phoneLink: "+442079460321",
  email: "hello@ironfern.example",

  // How far ahead people can book, in days (today counts as day 1).
  bookingDays: 28,
  // A class can be booked until this many minutes before it starts.
  bookingCutoffMinutes: 30,

  // Days the studio is shut. Format YYYY-MM-DD.
  closed: {
    "2026-12-25": "Christmas Day",
    "2026-12-26": "Boxing Day",
    "2027-01-01": "New Year's Day"
  },

  // family: "forge" = strength and cardio, "flow" = yoga, Pilates and mobility. intensity: 1 (gentle) to 3 (hard).
  classes: {
    hiit: {
      name: "HIIT Burn", family: "forge", minutes: 45, intensity: 3, icon: "i-bolt", capacity: 12,
      level: "All levels",
      blurb: "Short, sharp intervals on bikes, rowers and the floor. Every move has an easier and a harder option."
    },
    strength: {
      name: "Strength Club", family: "forge", minutes: 60, intensity: 2, icon: "i-kettlebell", capacity: 10,
      level: "Some experience",
      blurb: "Barbells, kettlebells and dumbbells in a small group, with a coach watching every rep."
    },
    boxfit: {
      name: "Boxfit", family: "forge", minutes: 45, intensity: 3, icon: "i-glove", capacity: 12,
      level: "All levels",
      blurb: "Pad work and bag rounds mixed with conditioning. No sparring and no experience needed."
    },
    circuits: {
      name: "Lunchtime Circuits", family: "forge", minutes: 30, intensity: 2, icon: "i-stopwatch", capacity: 12,
      level: "All levels",
      blurb: "Thirty minutes, ten stations, and you are back at your desk on time."
    },
    foundations: {
      name: "Foundations", family: "forge", minutes: 45, intensity: 1, icon: "i-barbell", capacity: 6,
      level: "Beginners",
      blurb: "New to lifting? Learn the squat, hinge, push and pull properly, in a class of six."
    },
    vinyasa: {
      name: "Vinyasa Flow", family: "flow", minutes: 60, intensity: 2, icon: "i-wave", capacity: 14,
      level: "All levels",
      blurb: "Breath-led yoga that builds strength and balance. Mats, blocks and straps provided."
    },
    pilates: {
      name: "Mat Pilates", family: "flow", minutes: 45, intensity: 1, icon: "i-ring", capacity: 14,
      level: "All levels",
      blurb: "Core, posture and control, done slowly and properly. Kind to backs and knees."
    },
    mobility: {
      name: "Stretch & Mobility", family: "flow", minutes: 30, intensity: 1, icon: "i-spiral", capacity: 14,
      level: "All levels",
      blurb: "Unhurried mobility work for hips, shoulders and spine. The perfect partner to a hard week."
    }
  },

  coaches: {
    maya: { name: "Maya", teaches: "Strength Club, HIIT Burn" },
    dan: { name: "Dan", teaches: "Boxfit, Lunchtime Circuits" },
    priya: { name: "Priya", teaches: "Vinyasa Flow, Stretch & Mobility" },
    leo: { name: "Leo", teaches: "Mat Pilates, Foundations" }
  },

  // The weekly timetable: [start time, class, coach]. 1 = Monday ... 6 = Saturday, 0 = Sunday.
  week: {
    1: [["06:30", "hiit", "maya"], ["07:30", "mobility", "priya"], ["12:30", "circuits", "dan"], ["18:00", "strength", "maya"], ["19:15", "vinyasa", "priya"]],
    2: [["06:30", "boxfit", "dan"], ["09:30", "pilates", "leo"], ["12:30", "circuits", "dan"], ["18:00", "hiit", "maya"], ["19:00", "foundations", "leo"]],
    3: [["06:30", "strength", "maya"], ["09:30", "vinyasa", "priya"], ["12:30", "circuits", "dan"], ["18:00", "boxfit", "dan"], ["19:15", "pilates", "leo"]],
    4: [["06:30", "hiit", "maya"], ["07:30", "mobility", "priya"], ["12:30", "circuits", "dan"], ["18:00", "strength", "maya"], ["19:15", "vinyasa", "priya"]],
    5: [["06:30", "boxfit", "dan"], ["09:30", "pilates", "leo"], ["12:30", "hiit", "maya"], ["17:30", "foundations", "leo"]],
    6: [["08:30", "hiit", "maya"], ["09:45", "strength", "maya"], ["10:00", "boxfit", "dan"], ["11:15", "vinyasa", "priya"]],
    0: [["09:00", "pilates", "leo"], ["10:15", "vinyasa", "priya"], ["17:00", "mobility", "priya"]]
  }
};
