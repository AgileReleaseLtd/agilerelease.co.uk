/* Spindle Physio: appointment types, prices, the team and when each person works, opening hours, the
   conditions we treat and the insurers we can bill. Every page reads this one file, so a price, a working
   day or a condition is changed here and nowhere else.

   SAMPLE SITE: Spindle Physio is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for
   drama (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain. */
window.Spindle = {
  // true = booking and contact buttons show what would happen instead of opening WhatsApp, the phone or email.
  sample: true,

  name: "Spindle Physio",
  whatsapp: "447700900715",
  mobile: "07700 900715",
  phone: "020 7946 0715",
  phoneLink: "+442079460715",
  email: "hello@spindlephysio.example",
  address: "3 Wherry Passage, Twickenham TW1",

  // Opening hours and bookable times are worked out in London time, wherever the visitor is.
  timeZone: "Europe/London",
  // How far ahead people can ask for an appointment, in days (today counts as day 1).
  bookingDays: 21,
  // Times sooner than this are not offered online (people can still ring for today).
  minNoticeHours: 3,
  // Appointments start on the hour or half hour.
  slotStepMinutes: 30,

  // Clinic opening hours. 1 = Monday ... 6 = Saturday, 0 = Sunday. [] = closed.
  hours: {
    1: [["07:30", "20:00"]],
    2: [["07:30", "20:00"]],
    3: [["07:30", "20:00"]],
    4: [["07:30", "20:00"]],
    5: [["07:30", "20:00"]],
    6: [["08:30", "14:00"]],
    0: []
  },

  // Days the clinic is shut: bank holidays in England and Christmas. Format YYYY-MM-DD.
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

  // Days with shorter hours. Practitioners only work inside these hours on that day.
  special: {
    "2026-12-24": { name: "Christmas Eve", hours: [["07:30", "13:00"]] },
    "2026-12-31": { name: "New Year's Eve", hours: [["07:30", "15:00"]] },
    "2027-12-24": { name: "Christmas Eve", hours: [["07:30", "13:00"]] },
    "2027-12-31": { name: "New Year's Eve", hours: [["07:30", "15:00"]] }
  },

  // Appointment types. kind "physio" is with a physiotherapist, "massage" with the sports massage therapist.
  types: {
    initial: {
      name: "Initial assessment", kind: "physio", minutes: 50, price: 85,
      short: "Your first visit for a new problem.",
      blurb: "We find out what is going on, explain it and start treatment. Includes your exercise plan."
    },
    follow: {
      name: "Follow-up", kind: "physio", minutes: 30, price: 68,
      short: "Treatment and progress checks.",
      blurb: "For a problem we have already assessed: hands-on treatment, exercise progressions and a check on how it is going."
    },
    running: {
      name: "Running assessment", kind: "physio", minutes: 60, price: 115,
      short: "Video analysis on the treadmill.",
      blurb: "An assessment for runners with slow-motion video of how you run, strength tests and a written return-to-run plan."
    },
    massage30: {
      name: "Sports massage, 30 minutes", shortName: "Sports massage 30", kind: "massage", minutes: 30, price: 48,
      short: "One or two areas, such as calves or shoulders.",
      blurb: "Focused work on one or two areas."
    },
    massage45: {
      name: "Sports massage, 45 minutes", shortName: "Sports massage 45", kind: "massage", minutes: 45, price: 62,
      short: "Legs and back, or upper body.",
      blurb: "Time for the legs and back, or the whole upper body."
    },
    massage60: {
      name: "Sports massage, 60 minutes", shortName: "Sports massage 60", kind: "massage", minutes: 60, price: 78,
      short: "Full body, or a long session before or after an event.",
      blurb: "Full body, or a long session in a heavy training block."
    }
  },

  // Blocks of appointments paid for up front. For one person, used within validMonths, self-pay only.
  packages: [
    { id: "follow5", type: "follow", count: 5, price: 310 },
    { id: "massage45x5", type: "massage45", count: 5, price: 280 },
    { id: "massage60x5", type: "massage60", count: 5, price: 350 }
  ],
  packageValidMonths: 6,

  // Cancellation and missed appointments.
  cancellation: {
    freeHours: 24,      // move or cancel for free up to this many hours before
    lateShare: 50,      // per cent of the fee charged for a later cancellation
    missedShare: 100    // per cent of the fee charged if you do not come and do not tell us
  },

  // The team, in the order they are offered. week: when they work, by day (1 = Monday ... 0 = Sunday),
  // as [start, end] blocks with breaks between them.
  practitioners: {
    rhiannon: {
      name: "Rhiannon Ellery", first: "Rhiannon", initials: "RE",
      role: "Clinic lead and physiotherapist",
      types: ["initial", "follow", "running"],
      week: {
        1: [["07:30", "12:30"], ["13:30", "16:00"]],
        2: [["12:00", "15:30"], ["16:00", "20:00"]],
        4: [["07:30", "12:30"], ["13:30", "16:00"]],
        6: [["08:30", "13:00"]]
      }
    },
    tomasz: {
      name: "Tomasz Wierzbicki", first: "Tomasz", initials: "TW",
      role: "Physiotherapist",
      types: ["initial", "follow"],
      week: {
        1: [["12:00", "15:30"], ["16:00", "20:00"]],
        3: [["07:30", "12:30"], ["13:30", "16:00"]],
        5: [["07:30", "12:30"], ["13:30", "16:00"]]
      }
    },
    grace: {
      name: "Grace Adebayo", first: "Grace", initials: "GA",
      role: "Physiotherapist",
      types: ["initial", "follow"],
      week: {
        2: [["07:30", "12:30"], ["13:30", "16:00"]],
        3: [["12:00", "15:30"], ["16:00", "20:00"]],
        4: [["12:00", "15:30"], ["16:00", "20:00"]],
        5: [["12:00", "17:00"]]
      }
    },
    callum: {
      name: "Callum Reid", first: "Callum", initials: "CR",
      role: "Sports massage therapist",
      types: ["massage30", "massage45", "massage60"],
      week: {
        3: [["15:00", "20:00"]],
        4: [["15:00", "20:00"]],
        5: [["14:00", "20:00"]],
        6: [["08:30", "14:00"]]
      }
    }
  },

  // Body areas on the body chart. The chart and its hotspots are drawn in conditions.html.
  areas: {
    neck: { name: "Neck" },
    shoulder: { name: "Shoulder" },
    "upper-back": { name: "Upper back and ribs" },
    "lower-back": { name: "Lower back" },
    arm: { name: "Elbow, wrist and hand" },
    hip: { name: "Hip and groin" },
    leg: { name: "Thigh, calf and shin" },
    knee: { name: "Knee" },
    foot: { name: "Ankle and foot" }
  },

  // Ways in other than a body area.
  tags: {
    running: "Running",
    sport: "Sport",
    desk: "Desk work",
    surgery: "After an operation"
  },

  // What we treat. summary: what it is. help: how physio can help, in plain words and without promises.
  // plan: what we might do. note: when to get medical help first (optional).
  conditions: [
    {
      id: "neck-pain", name: "Neck pain and stiffness", areas: ["neck"], tags: ["desk"],
      summary: "An aching, stiff neck, sometimes with pain into the shoulder blade or a neck that suddenly locks up on one side. Sleep, stress, long hours at a screen and awkward movements can all play a part.",
      help: "Most neck pain settles with time and the right kind of movement. We find out what is keeping yours going, show you how to stay moving without stirring it up, and build up strength so turning your head, sleeping and working feel easier.",
      plan: ["A check of your neck, shoulders and upper back", "Hands-on treatment to ease stiffness, if it suits you", "Short exercises you can do at your desk", "Advice on sleep, screens and workload"]
    },
    {
      id: "whiplash", name: "Whiplash and neck strain after an accident", areas: ["neck"], tags: ["sport"],
      summary: "Neck pain and stiffness after a car accident, a fall or a heavy tackle. It often builds up over the following day or two.",
      help: "Once a doctor or A&E has ruled out anything serious, gentle movement usually helps more than keeping the neck still. We show you what is safe to do, help you back to driving, work and sport, and build up strength step by step.",
      plan: ["Checks of movement, strength and the nerves to your arms", "A graded plan for daily life, driving and work", "Gentle hands-on treatment where it helps"],
      note: "After a serious accident, or with numbness, weakness or severe pain, go to A&E or call 999 before you see a physio."
    },
    {
      id: "neck-headache", name: "Headaches linked to the neck", areas: ["neck"], tags: ["desk"],
      summary: "Some headaches start at the back of the head or neck and get worse with certain postures or neck movements. Doctors call these cervicogenic headaches.",
      help: "If your assessment suggests the neck is part of the picture, treating the neck and upper back and doing regular exercises can make headaches less frequent or less strong for some people. If we think your headaches need a GP instead, we will say so.",
      plan: ["Questions to tell neck-related headaches apart from other types", "Hands-on treatment of the neck and upper back", "Strength and posture exercises", "A headache diary to see what changes"],
      note: "A sudden, extremely painful headache, or a headache with weakness, numbness, confusion, or trouble speaking or seeing, needs 999 or A&E."
    },
    {
      id: "shoulder-pain", name: "Shoulder pain (rotator cuff)", areas: ["shoulder"], tags: ["sport"],
      summary: "Pain at the top or side of the shoulder when lifting the arm, reaching behind you or lying on that side. Common in swimmers, climbers, racket players and anyone who lifts overhead.",
      help: "Rotator cuff-related shoulder pain often improves with exercise that builds up the load on the shoulder gradually. We find movements that ease it, set the right starting point and adjust your training or work so you can keep doing as much as possible.",
      plan: ["Tests of strength and movement in both shoulders", "A progressive strengthening programme", "Changes to training, swimming strokes or lifting technique"]
    },
    {
      id: "frozen-shoulder", name: "Frozen shoulder", areas: ["shoulder"], tags: [],
      summary: "A painful, stiff shoulder that slowly loses movement in every direction. It can take many months to settle, and is more common between 40 and 60 and in people with diabetes.",
      help: "Physio cannot make frozen shoulder go away quickly, but it can help you manage the pain, keep as much movement as you can and win it back as the stiffness eases. We also explain the options your GP or a specialist may offer, such as an injection.",
      plan: ["An honest explanation of how frozen shoulder usually behaves", "Gentle movement that does not flare it up", "Ways to sleep and get dressed more comfortably"]
    },
    {
      id: "shoulder-instability", name: "Shoulder dislocation and instability", areas: ["shoulder"], tags: ["sport", "surgery"],
      summary: "A shoulder that has come out of joint, or feels as if it might. Often after a fall or a tackle, or from years of overhead sport.",
      help: "After the shoulder has been checked in hospital, rehab rebuilds strength and control around it and prepares you for contact or overhead sport. If it keeps slipping, we talk about whether to see a specialist.",
      plan: ["Strength and control work in positions you need for your sport", "A staged return to contact, throwing or overhead lifting", "Rehab after shoulder surgery, following your surgeon's plan"],
      note: "A shoulder that has just dislocated needs A&E. Do not try to put it back yourself."
    },
    {
      id: "upper-back", name: "Upper back and rib pain", areas: ["upper-back"], tags: ["desk"],
      summary: "Stiffness or a sharp catch between the shoulder blades or around the ribs, sometimes worse when you breathe in deeply or twist.",
      help: "We check your neck, ribs and the way you sit and move, use hands-on treatment where it helps, and give you movement and strength work to keep your upper back moving through long days.",
      plan: ["Checks of the neck, ribs and shoulders", "Hands-on treatment and mobility exercises", "Ideas for breaking up long spells of sitting"],
      note: "Pain in the upper back that is constant, worse at night, or comes with chest pain, breathlessness, a high temperature or weight loss needs your GP first. Chest pain needs 999."
    },
    {
      id: "low-back-pain", name: "Lower back pain", areas: ["lower-back"], tags: ["desk", "sport"],
      summary: "Pain, stiffness or spasm in the lower back. It is very common, it can hurt a lot, and it is rarely caused by serious damage.",
      help: "We explain what is going on in plain words, find positions and movements that ease it, and help you build back up to work, lifting, sport and a good night's sleep. Staying active, within reason, usually helps more than resting.",
      plan: ["A full assessment, including checks for anything that needs a doctor", "Ways to calm a bad flare-up", "A strength plan built around what you want to do", "Hands-on treatment, if it helps you"],
      note: "Back pain with numbness around the genitals or bottom, changes in bladder or bowel control, or weakness or numbness in both legs: call 999 or go to A&E now."
    },
    {
      id: "sciatica", name: "Sciatica (leg pain from the back)", areas: ["lower-back", "leg"], tags: [],
      summary: "Pain that runs from the back or buttock down the leg, sometimes with pins and needles or numbness. It happens when a nerve in the lower back is irritated.",
      help: "Sciatica often settles over weeks to months. We test how the nerves are working, find movements that calm the leg pain, and help you stay as active as you can while it recovers. If you need a scan or a specialist, we tell you and write to your GP.",
      plan: ["Tests of strength, feeling and reflexes in your legs", "Positions and exercises that ease the leg pain", "Help with sleep, sitting and getting back to work"],
      note: "Numbness around the genitals or bottom, changes in bladder or bowel control, or weakness or numbness in both legs: call 999 or go to A&E now."
    },
    {
      id: "elbow", name: "Tennis and golfer's elbow", areas: ["arm"], tags: ["sport", "desk"],
      summary: "Pain on the outside (tennis elbow) or the inside (golfer's elbow) of the elbow, worse when gripping, lifting or using a mouse. Most people who get it do not play tennis or golf.",
      help: "These tendon problems often improve with the right amount of loading, though it can take a few months. We give you a strengthening plan that builds up week by week, help you change your grip and set-up at work, and track your progress.",
      plan: ["Grip strength tests to measure progress", "A progressive tendon loading programme", "Changes to tools, grip and desk set-up"]
    },
    {
      id: "wrist-hand", name: "Wrist, thumb and hand pain", areas: ["arm"], tags: ["desk"],
      summary: "Aching wrists or thumbs from typing, phone use, lifting a baby, climbing, or a fall onto an outstretched hand.",
      help: "We work out what is irritated, change the activities that set it off, and build up strength and movement. If anything needs an X-ray first, we tell you.",
      plan: ["Checks of the wrist, thumb, elbow and neck", "Strength and movement exercises", "Advice on splints, tools and how you use your hands at work"],
      note: "After a fall onto the hand, pain at the base of the thumb can mean a broken bone. Get it checked at an urgent treatment centre or A&E."
    },
    {
      id: "hip-pain", name: "Hip pain", areas: ["hip"], tags: ["running"],
      summary: "Pain at the side of the hip, in the groin or deep in the buttock. It includes tendon pain at the side of the hip, which often makes lying on that side uncomfortable.",
      help: "We check whether the pain comes from the hip joint, the tendons around it or your lower back, then build a strength plan around what you want to do, whether that is walking the dog or running a marathon.",
      plan: ["Tests to find where the pain is coming from", "A strength programme for the hip and trunk", "Changes to sleeping position, sitting and training"]
    },
    {
      id: "groin-strain", name: "Groin strain", areas: ["hip"], tags: ["sport"],
      summary: "Pain in the inner thigh or groin after kicking, changing direction or sprinting. Common in football and rugby.",
      help: "We work out how bad the strain is, plan a step-by-step return to running, kicking and changing direction, and help you lower the chance of it coming back.",
      plan: ["Strength tests for the groin and hip", "Staged running and kicking drills", "A plan to share with your coach"]
    },
    {
      id: "kneecap-pain", name: "Pain around the kneecap (runner's knee)", areas: ["knee"], tags: ["running", "sport"],
      summary: "An ache at the front of the knee, worse on stairs, squatting, running downhill or after sitting for a long time.",
      help: "This often improves by changing your training for a while and strengthening the hips and thighs. We look at how you move, adjust your running or gym plan, and build you back up gradually.",
      plan: ["A look at how you squat, step and run", "Hip and thigh strengthening", "A short-term change to your training, not a complete stop"]
    },
    {
      id: "knee-ligaments", name: "Knee ligament injuries (ACL, MCL)", areas: ["knee"], tags: ["sport", "surgery"],
      summary: "A twisting injury or tackle that damages a ligament, often with a pop, quick swelling and a knee that feels as if it might give way.",
      help: "Whether or not you have surgery, a long, structured rehab programme matters. We plan it with you, and with your surgeon if you have one, from the first weeks through to running, jumping and going back to your sport.",
      plan: ["Clear stages with tests to pass before moving on", "Strength, balance and jumping work", "Rehab after ACL reconstruction, following your surgeon's plan", "Return-to-sport testing"]
    },
    {
      id: "meniscus", name: "Knee cartilage (meniscus) problems", areas: ["knee"], tags: ["sport"],
      summary: "Pain along the joint line of the knee, sometimes with swelling, catching or locking. It can follow a twist or come on gradually.",
      help: "Many meniscus problems can be managed with exercise rather than surgery. We build up strength and confidence in the knee and refer you to a specialist if it keeps locking or is not improving.",
      plan: ["Tests of movement, swelling and strength", "A graded strengthening programme", "Referral to a knee specialist when it is needed"],
      note: "A knee that has locked and will not straighten should be seen soon: call NHS 111."
    },
    {
      id: "knee-oa", name: "Knee osteoarthritis", areas: ["knee"], tags: [],
      summary: "Pain and stiffness in the knee that often comes with age and use. It is very common, and it does not mean your knee is worn out.",
      help: "Exercise is one of the main treatments recommended for knee osteoarthritis. We help you find the right amount, strengthen the muscles that support the knee and keep you doing the things you enjoy.",
      plan: ["An explanation of what osteoarthritis is, and is not", "A strength programme you can do at home or in the gym", "Advice on walking, pacing and managing flare-ups"]
    },
    {
      id: "muscle-strains", name: "Hamstring, calf and thigh strains", areas: ["leg"], tags: ["sport", "running"],
      summary: "A sudden, sharp pain in the back of the thigh, the calf or the front of the thigh, usually while sprinting, kicking or pushing off.",
      help: "We work out how bad the strain is, start gentle loading early, and take you step by step through running, sprinting and your sport, so you know when the muscle is ready.",
      plan: ["Strength tests compared with the other leg", "Early loading and a staged running plan", "Sprint and sport-specific drills before you go back"]
    },
    {
      id: "shin-pain", name: "Shin pain (shin splints)", areas: ["leg"], tags: ["running"],
      summary: "Pain along the inside of the shin bone during or after running, often after a jump in mileage.",
      help: "We look at your training, footwear and strength, adjust your running load and give you a plan to build back up. If we think there could be a stress fracture, we tell you and arrange the right tests through your GP or a specialist.",
      plan: ["A review of your recent training", "Calf and foot strengthening", "A gradual return-to-run plan"]
    },
    {
      id: "achilles", name: "Achilles tendon pain", areas: ["foot", "leg"], tags: ["running"],
      summary: "Pain and stiffness in the tendon at the back of the ankle, often worst first thing in the morning or at the start of a run.",
      help: "Achilles tendon pain often improves with a gradual strengthening programme over a few months. We set it up, help you keep running if that is sensible, and adjust the plan as it settles.",
      plan: ["Calf strength and hopping tests", "A progressive calf and tendon loading programme", "Changes to running volume and footwear"],
      note: "A sudden snap or feeling of being kicked at the back of the ankle, and now you cannot push off: go to A&E, as the tendon may be torn."
    },
    {
      id: "ankle-sprain", name: "Ankle sprains", areas: ["foot"], tags: ["sport", "running"],
      summary: "A rolled ankle, with pain, swelling and bruising, usually on the outside. Very common in football, netball and trail running.",
      help: "Early, guided movement helps most sprains. We check for anything that needs an X-ray, then work on strength and balance so the ankle feels steady again and is less likely to go again.",
      plan: ["Checks for anything that needs an X-ray", "Balance and strength training", "A staged return to running and sport"],
      note: "If you heard a crack, the ankle looks misshapen, or you cannot put any weight on it, go to an urgent treatment centre or A&E."
    },
    {
      id: "heel-pain", name: "Heel pain (plantar fasciitis)", areas: ["foot"], tags: ["running"],
      summary: "Pain under the heel, often sharpest with the first steps in the morning or after sitting.",
      help: "We look at your footwear, activity and calf and foot strength, and set up a plan of exercises and changes you can fit around work and training. It can take a few months to settle, and we will tell you so.",
      plan: ["Calf and foot strengthening", "Advice on footwear and time on your feet", "Taping to ease pain in the short term, if it helps you"]
    },
    {
      id: "post-op", name: "Rehab after an operation", areas: ["knee", "hip", "shoulder"], tags: ["surgery"],
      summary: "Getting back to full strength after a hip or knee replacement, an ACL reconstruction, shoulder surgery or a broken bone that has been fixed.",
      help: "We follow your surgeon's guidance, set clear goals for each stage and progress your exercises safely, so you get the most from your operation. Please bring any letters or rehab instructions from the hospital.",
      plan: ["A plan that follows your surgeon's protocol", "Regular measurements of movement and strength", "Help with stairs, driving and going back to work"],
      note: "If your wound becomes hot, red, more painful or starts leaking, or you get a high temperature, contact your surgical team or NHS 111. Pain and swelling in one calf can be a blood clot: call NHS 111."
    },
    {
      id: "desk-pain", name: "Desk-related aches and pains", areas: ["neck", "upper-back", "arm", "lower-back"], tags: ["desk"],
      summary: "Neck, shoulder, back or wrist pain that builds up through long days at a desk or laptop, at home or in the office.",
      help: "There is no single perfect posture. We help you find a set-up and routine that suit you, give you short exercises to break up the day, and treat the sore spots so you can work in comfort.",
      plan: ["A look at your set-up, from a photo if you like", "Short movement breaks that fit your working day", "Treatment and exercises for the sore areas"]
    },
    {
      id: "running-injuries", name: "Running injuries", areas: ["knee", "foot", "leg", "hip"], tags: ["running"],
      summary: "Niggles that stop you running, such as knee, shin, Achilles, heel and hip pain. They often follow a change in training, shoes or terrain.",
      help: "We look at your training history, your strength and how you run, then plan a return to running that fits your goals, whether that is a Saturday parkrun or a marathon. A running assessment adds slow-motion video on our treadmill.",
      plan: ["A review of your training load", "Strength tests for runners", "Video analysis of how you run (running assessment)", "A written return-to-run plan"]
    },
    {
      id: "sport-return", name: "Sports injuries and getting back to sport", areas: ["shoulder", "knee", "foot", "leg", "hip", "lower-back"], tags: ["sport"],
      summary: "Any injury from rugby, football, tennis, rowing, climbing or the gym, and the step back to training and matches.",
      help: "We work out what was injured, set clear stages for your return, and test strength, speed and confidence before you go back to full training. With your permission, we can talk to your coach.",
      plan: ["A staged plan with clear tests to pass", "Strength, speed and sport-specific drills", "A written summary for your coach or club"]
    }
  ],

  // Health insurers and cash plans, shown as plain names only. EXAMPLES: a real clinic lists the
  // insurers it is registered with.
  insurers: ["Aviva", "AXA Health", "Bupa", "Cigna Healthcare", "Freedom Health Insurance", "Healix", "National Friendly", "Vitality", "WPA"],
  cashPlans: ["BHSF", "Health Shield", "Medicash", "Paycare", "Simplyhealth", "Westfield Health"]
};
