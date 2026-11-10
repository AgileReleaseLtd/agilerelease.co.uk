/* Quinlan Mensah Solicitors: contact details, opening hours, practice areas, team and prices. Every page reads
   this one file, so a change to a price, a person or an opening time is made here and nowhere else.

   SAMPLE SITE: Quinlan Mensah Solicitors is made up, and so are its people, prices and address. The phone and
   WhatsApp numbers are in Ofcom's ranges kept for drama (020 7946 0xxx and 07700 900xxx), and the email uses the
   reserved .example domain. Regulatory numbers (SRA number, SRA IDs, company number) are shown as "example" slots.

   Third-party fees (HM Land Registry, the probate application fee, The Gazette, the Office of the Public Guardian,
   the divorce court fee and the Stamp Duty Land Tax rates) are real figures, checked on the official websites on
   10 November 2026. The README lists the sources. Check them again before reusing this file for a real firm. */
window.QM = {
  // true = WhatsApp, phone and email buttons explain what they would do instead of opening them.
  sample: true,

  firm: "Quinlan Mensah Solicitors",
  shortName: "Quinlan Mensah",
  whatsapp: "447700900659",
  mobile: "07700 900659",
  phone: "020 7946 0659",
  phoneLink: "+442079460659",
  email: "hello@quinlanmensah.example",
  address: "6 Halyard Walk, Chiswick, London W4",
  mapsQuery: "Turnham Green, Chiswick, London W4",

  // Office hours. 1 = Monday ... 5 = Friday. Times are "HH:MM", 24-hour.
  hours: {
    1: ["09:00", "17:30"], 2: ["09:00", "17:30"], 3: ["09:00", "17:30"], 4: ["09:00", "17:30"], 5: ["09:00", "17:30"]
  },
  // Wills and LPA appointments on the first Saturday of each month, by appointment.
  saturday: { open: "09:30", close: "12:30", label: "Wills and lasting powers of attorney, by appointment" },
  replyDays: 1, // we reply within this many working days

  // Days the office is shut (bank holidays in England and our Christmas closure). Format YYYY-MM-DD.
  closed: {
    "2026-12-24": "Christmas closure", "2026-12-25": "Christmas Day", "2026-12-28": "Boxing Day (substitute day)",
    "2026-12-29": "Christmas closure", "2026-12-30": "Christmas closure", "2026-12-31": "Christmas closure",
    "2027-01-01": "New Year's Day", "2027-03-26": "Good Friday", "2027-03-29": "Easter Monday",
    "2027-05-03": "Early May bank holiday", "2027-05-31": "Spring bank holiday", "2027-08-30": "Summer bank holiday",
    "2027-12-24": "Christmas closure", "2027-12-27": "Christmas Day (substitute day)", "2027-12-28": "Boxing Day (substitute day)",
    "2027-12-29": "Christmas closure", "2027-12-30": "Christmas closure", "2027-12-31": "Christmas closure",
    "2028-01-03": "New Year's Day (substitute day)", "2028-04-14": "Good Friday", "2028-04-17": "Easter Monday",
    "2028-05-01": "Early May bank holiday", "2028-05-29": "Spring bank holiday", "2028-08-28": "Summer bank holiday",
    "2028-12-25": "Christmas Day", "2028-12-26": "Boxing Day"
  },

  vatRate: 0.2,

  /* ---------------------------------------------------------------- Team ---------------------------------------------------------------- */
  // solicitor: true shows an "SRA ID: example" slot. areas: practice-area ids this person works on.
  team: [
    {
      id: "niamh", name: "Niamh Quinlan", initials: "NQ", role: "Founding partner", solicitor: true, qualified: 2007,
      areas: ["conveyancing"], firmRole: "Compliance officer for legal practice (COLP)",
      specialisms: ["Buying and selling homes", "Leasehold flats", "Remortgages and transfers of equity"],
      bio: "Niamh has done residential conveyancing in west London for nearly twenty years. She supervises every property file in the office and takes the trickier leasehold and unregistered titles herself.",
      languages: "English, Irish",
      supervises: ["rhys"]
    },
    {
      id: "abena", name: "Abena Mensah", initials: "AM", role: "Founding partner", solicitor: true, qualified: 2009,
      areas: ["wills", "lpa"], firmRole: "Compliance officer for finance and administration (COFA)",
      specialisms: ["Wills and simple trusts", "Probate and estate administration", "Lasting powers of attorney"],
      bio: "Abena looks after wills, estates and powers of attorney. She is patient with families at difficult times, and will happily visit a client at home or in a care home if they cannot come in.",
      languages: "English, Twi",
      supervises: ["grace"]
    },
    {
      id: "tomasz", name: "Tomasz Wrona", initials: "TW", role: "Senior associate", solicitor: true, qualified: 2013,
      areas: ["family"],
      specialisms: ["Divorce and dissolution", "Money and property on separation", "Arrangements for children"],
      bio: "Tomasz helps people separate as calmly and cheaply as they can. He encourages mediation where it is safe, and goes to court when it is needed.",
      languages: "English, Polish"
    },
    {
      id: "leila", name: "Leila Haddad", initials: "LH", role: "Associate solicitor", solicitor: true, qualified: 2019,
      areas: ["landlord"],
      specialisms: ["Possession claims", "Tenancy agreements and rent increases", "Deposits and disrepair"],
      bio: "Leila acts for small landlords and for tenants. She has guided many clients through the Renters' Rights Act changes that started in May 2026.",
      languages: "English, Arabic, French"
    },
    {
      id: "rhys", name: "Rhys Morgan", initials: "RM", role: "Conveyancing executive", solicitor: false, experience: 9,
      areas: ["conveyancing"],
      specialisms: ["Freehold purchases and sales", "Remortgages", "New-build purchases"],
      bio: "Rhys is not a solicitor. He has nine years' experience running purchases, sales and remortgages from offer to registration, and is supervised by Niamh.",
      languages: "English, Welsh",
      supervisedBy: "niamh"
    },
    {
      id: "grace", name: "Grace Liu", initials: "GL", role: "Paralegal", solicitor: false, experience: 3,
      areas: ["wills", "lpa"],
      specialisms: ["Estate accounts", "Collecting in bank accounts and pensions", "Registering LPAs"],
      bio: "Grace is not a solicitor. She does much of the day-to-day work on estates and LPAs under Abena's supervision, and is often the person who rings you with an update.",
      languages: "English, Mandarin",
      supervisedBy: "abena"
    },
    {
      id: "marcia", name: "Marcia Fenton", initials: "MF", role: "Practice manager and cashier", solicitor: false,
      areas: [],
      specialisms: ["Client account and payments", "Appointments", "First point of contact"],
      bio: "Marcia runs the office and the client account. If you ring us, you will probably speak to her first. She will never ask you to send money to a new bank account by email.",
      languages: "English"
    }
  ],

  /* ----------------------------------------------------------- Practice areas ----------------------------------------------------------- */
  // tab: the colour of the area's divider tab. guides: one or more plain-English guides, each with what it covers,
  // the usual steps (time is a typical timescale), and what we need from you.
  areas: [
    {
      id: "conveyancing", name: "Residential conveyancing", tabLabel: "Home", tab: "olive", icon: "i-house",
      short: "Buying, selling or remortgaging a house or flat in England and Wales.",
      points: ["Buying a house or flat", "Selling, with your mortgage paid off", "Remortgages and transfers of equity"],
      intro: "Conveyancing is the legal work that moves a home from one owner to another, or moves your mortgage to a new lender. We check the property, deal with the other side's lawyers, handle the money safely and register you as the owner.",
      fromPrice: "Buying from £1,195 + VAT", priceLink: "prices.html#conveyancing", enquire: "conveyancing",
      team: ["niamh", "rhys"],
      guides: [
        {
          title: "Buying a home", short: "Buying", price: "From £1,195 + VAT", enquire: "conveyancing&deal=buy",
          covers: [
            "Checking the title (the legal ownership) and the contract",
            "Searches with the council, water company and an environmental search",
            "Raising questions with the seller's lawyers and reporting to you in writing",
            "Checking your mortgage offer and acting for your lender",
            "Exchange, completion, and sending the Stamp Duty Land Tax return and payment",
            "Registering you as the owner at HM Land Registry"
          ],
          steps: [
            { title: "Instruct us", time: "Day 1 to 3", text: "You accept our quote and return the signed client care letter. We check your ID and where your money comes from." },
            { title: "Contract papers and searches", time: "Weeks 1 to 3", text: "The seller's lawyers send the draft contract. We order searches and read everything carefully." },
            { title: "Questions and your mortgage", time: "Weeks 3 to 8", text: "We raise questions with the seller's side and check your mortgage offer. Leasehold flats take longer here." },
            { title: "Report and signing", time: "Weeks 8 to 10", text: "We send a plain-English report, go through it with you, and you sign the contract and mortgage deed." },
            { title: "Exchange of contracts", time: "Week 10 to 12", text: "You pay the deposit and the deal becomes binding. A completion date is fixed, often one to four weeks later." },
            { title: "Completion and registration", time: "Completion day, then 2 to 6 weeks", text: "We send the money, you get the keys, and we pay the Stamp Duty Land Tax and register you as the owner." }
          ],
          provide: [
            "Photo ID and proof of address for everyone buying",
            "Bank statements that show where the deposit is coming from",
            "A gift letter from anyone helping with the deposit",
            "Your mortgage offer, when your lender sends it",
            "The estate agent's memorandum of sale"
          ],
          note: "A freehold purchase usually takes 12 to 16 weeks from instruction to completion, and a leasehold flat 16 to 20 weeks. A chain, a new-build or a slow managing agent can add time."
        },
        {
          title: "Selling a home", short: "Selling", price: "From £950 + VAT", enquire: "conveyancing&deal=sell",
          covers: [
            "Preparing the contract and the property information forms",
            "Getting the leasehold management pack from the managing agent",
            "Answering the buyer's lawyers' questions",
            "Paying off your mortgage and sending you the balance on completion"
          ],
          steps: [
            { title: "Instruct us", time: "Day 1 to 3", text: "We check your ID, get copies of the title from HM Land Registry and ask your lender for a redemption figure." },
            { title: "Forms and contract pack", time: "Weeks 1 to 2", text: "You fill in the property information and fittings forms. We send the contract pack to the buyer's lawyers." },
            { title: "Buyer's questions", time: "Weeks 2 to 8", text: "We answer the buyer's lawyers' questions, asking you where only you know the answer." },
            { title: "Exchange and completion", time: "Week 10 onwards", text: "You sign the contract and transfer. On completion we pay off your mortgage, the estate agent and send you the rest." }
          ],
          provide: [
            "Photo ID and proof of address for every owner",
            "Your mortgage account number",
            "Guarantees, planning and building control papers for any work done",
            "For a flat: the lease and the managing agent's details"
          ]
        },
        {
          title: "Remortgaging", short: "Remortgaging", price: "From £595 + VAT", enquire: "conveyancing&deal=remortgage",
          covers: [
            "Acting for you and your new lender",
            "Paying off your old mortgage on the day the new one starts",
            "Adding or removing someone from the title (a transfer of equity) if you need it"
          ],
          steps: [
            { title: "Instruct us", time: "Day 1 to 3", text: "We check your ID and the title, and ask your current lender for a redemption figure." },
            { title: "Mortgage offer and signing", time: "Weeks 1 to 3", text: "We check the offer's conditions and you sign the mortgage deed." },
            { title: "Completion and registration", time: "Weeks 3 to 6", text: "The new lender sends the money, we repay the old mortgage and register the new one." }
          ],
          provide: [
            "Photo ID and proof of address for every borrower",
            "Your new mortgage offer and your old mortgage account number"
          ],
          note: "Many lenders offer a free remortgage through their own panel conveyancers. It is worth asking them before you instruct us."
        }
      ]
    },
    {
      id: "wills", name: "Wills and probate", tabLabel: "Wills", tab: "heather", icon: "i-quill",
      short: "Making or updating a will, and dealing with the estate of someone who has died.",
      points: ["Wills and simple trusts", "Applying for probate", "Dealing with the whole estate"],
      intro: "A will says who gets what, who looks after it, and who looks after your children. When someone dies, probate is the legal permission to deal with their money and property. We can apply for it for you, or deal with the whole estate.",
      fromPrice: "Wills from £350 + VAT", priceLink: "prices.html#probate", enquire: "will",
      team: ["abena", "grace"],
      guides: [
        {
          title: "Making a will", short: "Wills", price: "Will for one person £350 + VAT", priceLink: "prices.html#other-fees", enquire: "will",
          covers: [
            "A meeting at the office, by video or at your home",
            "Advice on executors, guardians for children and gifts",
            "Simple trusts, for example to protect a child's inheritance",
            "Supervising the signing so the will is valid",
            "Keeping the original safe at no extra cost"
          ],
          steps: [
            { title: "First meeting", time: "Week 1", text: "About an hour. We talk through your family, what you own and what you want to happen." },
            { title: "Draft will", time: "Within 10 working days", text: "We send a draft with a plain-English letter that explains each part." },
            { title: "Changes", time: "Weeks 2 to 3", text: "You tell us what to change. Small changes are included in the fixed fee." },
            { title: "Signing", time: "Weeks 3 to 4", text: "You sign in front of two witnesses, at the office or at home. We keep the original safe." }
          ],
          provide: [
            "Photo ID and proof of address",
            "A rough list of what you own and any debts",
            "Full names of your executors, guardians and the people you want to benefit",
            "Any earlier will, and any property you own outside England and Wales"
          ]
        },
        {
          title: "Probate and estates", short: "Probate", price: "Grant only £1,650 + VAT", priceLink: "prices.html#probate", enquire: "probate",
          covers: [
            "Valuing the estate and dealing with HMRC",
            "Applying for the grant of probate (or letters of administration if there is no will)",
            "Collecting in bank accounts, pensions and policies, and selling or transferring the home",
            "Paying debts and tax, then sharing out the estate with clear accounts"
          ],
          steps: [
            { title: "First meeting", time: "Weeks 1 to 2", text: "We confirm who the executors are, read the will and agree whether you want a grant-only service or full administration." },
            { title: "Valuing the estate", time: "Weeks 2 to 8", text: "We write to banks, pension companies and others for date-of-death values, and work out whether inheritance tax is due." },
            { title: "Applying for probate", time: "Usually within 12 weeks of applying", text: "We send the application to the Probate Registry. It can take longer if they ask for more information." },
            { title: "Collecting the estate", time: "Weeks 4 to 12 after the grant", text: "We close accounts, cash in policies and sell or transfer any property." },
            { title: "Notices and debts", time: "At least 2 months", text: "We place notices for unknown creditors in The Gazette and a local paper, then pay the debts." },
            { title: "Sharing out the estate", time: "Usually 6 to 12 months in all", text: "We prepare estate accounts for the executors to approve and pay the beneficiaries." }
          ],
          provide: [
            "The original will, if there is one, and the death certificate",
            "Letters and statements about bank accounts, pensions, shares and policies",
            "Details of the home and any mortgage",
            "Names and addresses of the beneficiaries"
          ],
          note: "Claims against an estate under the Inheritance (Provision for Family and Dependants) Act 1975 usually have to be made within six months of the grant, so executors often wait until then before the final payments."
        }
      ]
    },
    {
      id: "lpa", name: "Lasting powers of attorney", tabLabel: "LPA", tab: "mist", icon: "i-hands",
      short: "Choosing who can make decisions for you if you cannot make them yourself.",
      points: ["Property and financial affairs", "Health and welfare", "Registering with the Office of the Public Guardian"],
      intro: "A lasting power of attorney (LPA) lets people you trust make decisions for you if you lose mental capacity, or need help. There are two kinds: one for property and financial affairs, and one for health and welfare. You can only make one while you still have capacity, so it is better done early.",
      fromPrice: "One LPA £450 + VAT", priceLink: "prices.html#other-fees", enquire: "lpa",
      team: ["abena", "grace"],
      guides: [
        {
          title: "Making an LPA",
          covers: [
            "Advice on which LPA you need, and who to choose as attorneys",
            "Preparing the forms, including any instructions or preferences",
            "Acting as certificate provider where we can, to confirm you understand the LPA",
            "Registering the LPA with the Office of the Public Guardian"
          ],
          steps: [
            { title: "Meeting", time: "Week 1", text: "We meet you on your own for part of the time, to make sure the decisions are yours." },
            { title: "Forms", time: "Weeks 1 to 2", text: "We prepare the LPA forms and send them to you to check." },
            { title: "Signing", time: "Weeks 2 to 4", text: "You, the certificate provider and your attorneys sign in the right order. We guide everyone through it." },
            { title: "Registration", time: "8 to 10 weeks", text: "The Office of the Public Guardian registers the LPA. It cannot be used until then." }
          ],
          provide: [
            "Photo ID and proof of address",
            "Names, dates of birth and addresses of your attorneys",
            "Details of anyone you want told when the LPA is registered"
          ],
          note: "If someone has already lost capacity, it is too late for an LPA. We can explain how to apply to the Court of Protection for a deputyship instead."
        }
      ]
    },
    {
      id: "family", name: "Family law", tabLabel: "Family", tab: "clay", icon: "i-people",
      short: "Divorce, money and property when you separate, and arrangements for children.",
      points: ["No-fault divorce and dissolution", "Money and property when you separate", "Arrangements for children"],
      intro: "Separating is hard enough without a fight about every step. We give clear advice early, encourage mediation where it is safe, and keep court for when it is really needed.",
      fromPrice: "First meeting £250 + VAT", priceLink: "prices.html#other-fees", enquire: "family",
      team: ["tomasz"],
      guides: [
        {
          title: "Divorce and separation",
          covers: [
            "No-fault divorce and dissolution of a civil partnership, on your own or jointly",
            "Agreeing how to split money, property and pensions, and making it legally binding",
            "Arrangements for children, through agreement, mediation or court",
            "Cohabitation and pre-nuptial agreements"
          ],
          steps: [
            { title: "First meeting", time: "Week 1", text: "A fixed-fee hour to understand your situation and explain your options and likely costs." },
            { title: "Divorce application", time: "Weeks 1 to 3", text: "We apply online, on your own or jointly with your spouse. The court fee is paid then." },
            { title: "Waiting period", time: "20 weeks", text: "The law sets a 20-week wait before you can apply for the conditional order. We use it to work on the finances." },
            { title: "Money and property", time: "Often 3 to 9 months", text: "Both sides share financial information. We negotiate, often with mediation, and turn an agreement into a consent order." },
            { title: "Final order", time: "At least 6 weeks and 1 day after the conditional order", text: "The marriage ends. We usually advise waiting until the financial order is made first." }
          ],
          provide: [
            "Your marriage or civil partnership certificate",
            "Recent payslips, bank statements and pension statements",
            "Details of the home, the mortgage and any other property",
            "Any letters from your spouse's solicitor or the court"
          ],
          note: "Before applying to court about money or children, you usually have to attend a Mediation Information and Assessment Meeting (MIAM). There are exceptions, for example where there has been domestic abuse."
        }
      ]
    },
    {
      id: "landlord", name: "Landlord and tenant", tabLabel: "Lettings", tab: "sand", icon: "i-door",
      short: "Advice for landlords and tenants of homes in England, under the new renting rules.",
      points: ["Getting a property back, on the right ground", "Rent increases and tenancy terms", "Deposits and repairs"],
      intro: "Since 1 May 2026 the Renters' Rights Act has changed how private tenancies in England work. Fixed terms have become periodic tenancies, 'no-fault' section 21 evictions have ended, and a landlord needs a legal ground to get a property back. We help landlords do it properly, and tenants check their rights.",
      fromPrice: "Notices from £350 + VAT", priceLink: "prices.html#other-fees", enquire: "landlord",
      team: ["leila"],
      guides: [
        {
          title: "Getting a property back (landlords)",
          covers: [
            "Checking the tenancy, the deposit protection and your paperwork first",
            "Choosing the right ground for possession and serving the notice (Form 3A)",
            "Possession claims in the county court, including rent arrears",
            "Rent increases, tenancy terms and deposit disputes"
          ],
          steps: [
            { title: "Review", time: "Week 1", text: "We read the tenancy and your paperwork. A deposit that was not protected properly can stop some claims, so we check first." },
            { title: "Notice", time: "Week 1 to 2", text: "We prepare and serve a notice on the right ground. The notice period depends on the ground used." },
            { title: "Court claim", time: "After the notice ends", text: "If the tenant stays, we issue a possession claim. Rent arrears claims can be made online." },
            { title: "Hearing and order", time: "Often several months", text: "The court decides whether to make a possession order. Court waiting times vary." },
            { title: "Eviction", time: "If needed", text: "If the tenant still does not leave, we apply for bailiffs to enforce the order." }
          ],
          provide: [
            "The tenancy agreement and the date the tenancy started",
            "Deposit protection certificate and prescribed information",
            "Gas safety certificate, EPC and electrical report",
            "A rent statement, if the claim is about arrears"
          ],
          note: "The grounds for moving in or selling cannot be used in the first 12 months of a tenancy. Tenants: if you have received a notice, talk to us early. We can check whether it is valid."
        }
      ]
    }
  ],

  /* -------------------------------------------------------------- Prices --------------------------------------------------------------- */
  // Hourly rates, before VAT.
  rates: [
    { role: "Partner", rate: 340 },
    { role: "Senior associate", rate: 295 },
    { role: "Associate solicitor", rate: 250 },
    { role: "Conveyancing executive", rate: 210 },
    { role: "Paralegal", rate: 155 }
  ],

  conveyancing: {
    // Legal fee bands by price (or, for a remortgage, by the new loan). up: top of band; fee: before VAT;
    // fee null = we give an individual fixed quote.
    bands: {
      purchase: [
        { up: 250000, fee: 1195 }, { up: 500000, fee: 1350 }, { up: 750000, fee: 1550 },
        { up: 1000000, fee: 1795 }, { up: 1500000, fee: 2150 }, { up: 2500000, fee: 2650 }, { up: Infinity, fee: null }
      ],
      sale: [
        { up: 250000, fee: 950 }, { up: 500000, fee: 1095 }, { up: 750000, fee: 1250 },
        { up: 1000000, fee: 1450 }, { up: 1500000, fee: 1750 }, { up: 2500000, fee: 2150 }, { up: Infinity, fee: null }
      ],
      remortgage: [
        { up: 500000, fee: 595 }, { up: 1000000, fee: 695 }, { up: 2500000, fee: 850 }, { up: Infinity, fee: null }
      ]
    },
    // Extra legal fees, before VAT.
    supplements: {
      leaseholdPurchase: { label: "Leasehold supplement", fee: 495 },
      leaseholdSale: { label: "Leasehold supplement", fee: 395 },
      leaseholdRemortgage: { label: "Leasehold supplement", fee: 150 },
      lender: { label: "Acting for your mortgage lender", fee: 195 },
      newBuild: { label: "New-build supplement", fee: 350 },
      lisa: { label: "Lifetime ISA or Help to Buy ISA", fee: 75 },
      transfer: { label: "Same-day bank transfer (one per transaction)", fee: 40 },
      sharedOwnership: { label: "Shared ownership supplement", fee: 450 },
      unregistered: { label: "Unregistered title", fee: 295 },
      gift: { label: "Gifted deposit (for each person giving)", fee: 95 },
      extraMortgage: { label: "Paying off each extra mortgage or secured loan on a sale", fee: 95 }
    },
    // Disbursements: paid to others on your behalf. net + vat = what you pay.
    searchPack: { label: "Search pack: local authority, drainage and water, and environmental searches", net: 265, vat: 53 },
    idCheck: { label: "Electronic ID check, per person", net: 12, vat: 2.4 },
    officialCopies: { label: "HM Land Registry copies of the title register and plan", net: 14, vat: 0 },
    os1: { label: "HM Land Registry priority search", net: 7, vat: 0 },
    bankruptcy: { label: "HM Land Registry bankruptcy search, per person", net: 6, vat: 0 },
    searchIndemnity: { label: "Remortgage search insurance, where your lender accepts it", net: 45, vat: 0 },
    // HM Land Registry fees (Land Registration Fee Order 2024, in force since 9 December 2024): portal fee for a
    // whole-title application. Scale 1 for a purchase (by price); Scale 2 for a mortgage on its own (by the loan).
    landRegistry: {
      scale1: [{ up: 80000, fee: 20 }, { up: 100000, fee: 40 }, { up: 200000, fee: 100 }, { up: 500000, fee: 150 }, { up: 1000000, fee: 295 }, { up: Infinity, fee: 500 }],
      scale2: [{ up: 100000, fee: 20 }, { up: 200000, fee: 30 }, { up: 500000, fee: 45 }, { up: 1000000, fee: 65 }, { up: Infinity, fee: 140 }]
    },
    // Fees a leasehold purchase usually brings, set by the lease or the landlord. Shown as ranges, not in the total.
    leaseholdExtras: [
      { label: "Notice of transfer fee", range: "£100 to £250" },
      { label: "Notice of charge fee (if you have a mortgage)", range: "£100 to £250" },
      { label: "Deed of covenant fee", range: "£150 to £350" },
      { label: "Certificate of compliance fee", range: "£50 to £200" }
    ],
    timescales: { purchase: "12 to 16 weeks (freehold), 16 to 20 weeks (leasehold)", sale: "10 to 16 weeks", remortgage: "4 to 6 weeks" }
  },

  // Stamp Duty Land Tax for homes in England (rates from 1 April 2025, checked on GOV.UK on 10 November 2026).
  sdlt: {
    standard: [{ up: 125000, rate: 0 }, { up: 250000, rate: 0.02 }, { up: 925000, rate: 0.05 }, { up: 1500000, rate: 0.1 }, { up: Infinity, rate: 0.12 }],
    firstTime: { maxPrice: 500000, bands: [{ up: 300000, rate: 0 }, { up: 500000, rate: 0.05 }] },
    additionalSurcharge: 0.05,
    additionalFrom: 40000
  },

  probate: {
    grantOnly: { fee: 1650 },
    // Full administration of a straightforward estate: a range, worked out from the time it usually takes.
    full: { low: 3500, high: 6500, hoursLow: 12, hoursHigh: 22 },
    // A worked example for the full administration range, priced at the hourly rates above.
    example: { estate: "a home, four bank accounts and three beneficiaries", hours: [["Partner", 6], ["Paralegal", 14]] },
    disbursements: [
      { label: "Probate application fee (estates over £5,000)", net: 526, vat: 0, note: "Paid to HM Courts and Tribunals Service" },
      { label: "Extra copies of the grant, ordered with the application", net: 2, vat: 0, note: "Each. Ordered later, they cost £16 each" },
      { label: "Bankruptcy-only land charges search, per beneficiary", net: 6, vat: 0, note: "Paid to HM Land Registry" },
      { label: "Deceased estates notice in The Gazette", net: 96.55, vat: 19.31, note: "Protects the executors against claims from unknown creditors" },
      { label: "Notice in a local newspaper", net: 240, vat: 48, note: "Typical cost. Also helps protect against unexpected claims" }
    ]
  },

  // Fixed fees for other work, before VAT. extra: a third-party fee on top.
  otherFees: [
    { area: "wills", label: "Will for one person", fee: 350 },
    { area: "wills", label: "Mirror wills for a couple", fee: 550 },
    { area: "wills", label: "Will with a trust (for example a property trust)", fee: 650, from: true },
    { area: "lpa", label: "One lasting power of attorney", fee: 450, extra: "plus £92 registration fee to the Office of the Public Guardian" },
    { area: "lpa", label: "Both LPAs for one person", fee: 750, extra: "plus £92 for each LPA (£184)" },
    { area: "family", label: "First meeting, up to an hour", fee: 250 },
    { area: "family", label: "Divorce or dissolution where you both agree, without finances", fee: 850, extra: "plus the £628 court fee" },
    { area: "family", label: "Consent order for an agreed financial settlement", fee: 1200, from: true, extra: "plus the court fee" },
    { area: "landlord", label: "Possession notice (Form 3A) prepared and served", fee: 350 },
    { area: "landlord", label: "Review of a tenancy agreement", fee: 250 },
    { area: "landlord", label: "Undefended possession claim, up to the order", fee: 1250, from: true, extra: "plus the court fee" }
  ]
};
