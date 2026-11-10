/* Quarterday: the practice's fees, packages, deadlines, Making Tax Digital rules, team, hours and contact
   details. Every page reads this one file, so a fee or a rule is changed here and nowhere else.

   SAMPLE SITE: Quarterday is made up. The phone and WhatsApp numbers are in Ofcom's ranges kept for drama
   (020 7946 0xxx and 07700 900xxx), and the email uses the reserved .example domain.

   TAX RULES: the Making Tax Digital thresholds and dates were checked on GOV.UK on 10 November 2026 (sources
   in README.md). Check them again before reusing this file: HMRC changes them. */
window.Quarterday = {
  // true = WhatsApp, phone and email buttons show what would happen instead of opening them.
  sample: true,

  name: "Quarterday",
  whatsapp: "447700900131",
  mobile: "07700 900131",
  phone: "020 7946 0131",
  phoneLink: "+442079460131",
  email: "hello@quarterday.example",
  address: "First floor, 27 Penwick Row, Hammersmith, London W6",

  // Office hours. 1 = Monday ... 6 = Saturday, 0 = Sunday. null = closed.
  hours: {
    1: ["09:00", "17:30"],
    2: ["09:00", "17:30"],
    3: ["09:00", "17:30"],
    4: ["09:00", "19:00"],
    5: ["09:00", "17:00"],
    6: null,
    0: null
  },
  // Self Assessment season: Saturday mornings in January (month 0).
  januarySaturdays: ["10:00", "14:00"],
  // Days the office is shut. Format YYYY-MM-DD.
  closed: {
    "2026-12-24": "Christmas Eve",
    "2026-12-25": "Christmas Day",
    "2026-12-28": "Boxing Day (bank holiday)",
    "2026-12-29": "Christmas break",
    "2026-12-30": "Christmas break",
    "2026-12-31": "Christmas break",
    "2027-01-01": "New Year's Day",
    "2027-03-26": "Good Friday",
    "2027-03-29": "Easter Monday",
    "2027-05-03": "Early May bank holiday",
    "2027-05-31": "Spring bank holiday",
    "2027-08-30": "Summer bank holiday",
    "2027-12-24": "Christmas Eve",
    "2027-12-27": "Christmas Day (bank holiday)",
    "2027-12-28": "Boxing Day (bank holiday)"
  },

  /* ---------- Fees ----------
     Every fee is a month, plus VAT, paid by Direct Debit. The turnover band picks the fee: for landlords
     it is rent received (your share), for the others it is sales before expenses. */
  vatRate: 0.2,
  bands: [
    { id: "u20", label: "Under £20,000", short: "under £20k" },
    { id: "20-30", label: "£20,000 to £30,000", short: "£20k to £30k" },
    { id: "30-50", label: "£30,000 to £50,000", short: "£30k to £50k" },
    { id: "50-90", label: "£50,000 to £90,000", short: "£50k to £90k" },
    { id: "90-250", label: "£90,000 to £250,000", short: "£90k to £250k" },
    { id: "250", label: "Over £250,000", short: "over £250k" }
  ],

  packages: {
    sole: {
      name: "Sole traders and freelancers",
      short: "Sole trader",
      icon: "i-person",
      turnoverWord: "Turnover",
      who: "Self-employed people, freelancers, tradespeople, creatives and anyone working for themselves without a company.",
      // fee by band, and which tier that band gets
      fees: { "u20": 40, "20-30": 48, "30-50": 65, "50-90": 75, "90-250": 95, "250": 125 },
      tiers: { "u20": "essentials", "20-30": "essentials", "30-50": "mtd", "50-90": "mtd", "90-250": "mtd", "250": "mtd" },
      tierInfo: {
        essentials: {
          name: "Essentials",
          includes: [
            "Your year-end accounts, from your records or bank statements",
            "Your Self Assessment tax return, checked and sent",
            "Your tax bill worked out by October, so January holds no surprises",
            "Payments on account checked, and reduced where the rules allow",
            "We deal with HMRC for you, as your agent",
            "Questions by email or WhatsApp, with no clock running",
            "A yearly check of when Making Tax Digital applies to you"
          ]
        },
        mtd: {
          name: "Making Tax Digital",
          includes: [
            "Everything in Essentials",
            "Set-up in HMRC-recognised software: yours, or one we set up with you",
            "Your digital records checked every quarter",
            "All four quarterly updates sent to HMRC for you",
            "Your year-end tax return sent through MTD software",
            "A running tax estimate after each quarter"
          ]
        }
      },
      addons: ["rent", "vat", "payroll", "cgt", "catchup", "reference"]
    },

    landlord: {
      name: "Landlords",
      short: "Landlord",
      icon: "i-key",
      turnoverWord: "Rent received (your share)",
      who: "People who let out one or more homes, a room or a holiday let, on their own or jointly.",
      fees: { "u20": 30, "20-30": 38, "30-50": 55, "50-90": 65, "90-250": 85, "250": 120 },
      tiers: { "u20": "essentials", "20-30": "essentials", "30-50": "mtd", "50-90": "mtd", "90-250": "mtd", "250": "mtd" },
      tierInfo: {
        essentials: {
          name: "Essentials",
          includes: [
            "Your rental income and costs summarised, property by property",
            "The property pages of your Self Assessment return",
            "Repairs and improvements sorted correctly (only one is a running cost)",
            "Mortgage interest relief worked out (the 20% tax credit)",
            "Joint ownership split correctly between you",
            "Your tax bill worked out by October",
            "Up to three properties included"
          ]
        },
        mtd: {
          name: "Making Tax Digital",
          includes: [
            "Everything in Essentials",
            "Digital records kept for each property in recognised software",
            "All four quarterly updates sent to HMRC for you",
            "Your year-end tax return sent through MTD software",
            "A running tax estimate after each quarter"
          ]
        }
      },
      addons: ["property", "cgt", "vat", "reference", "catchup"]
    },

    ltd: {
      name: "Limited companies",
      short: "Limited company",
      icon: "i-building",
      turnoverWord: "Company turnover",
      who: "Small limited companies and contractors trading through their own company, with one or a few directors.",
      fees: { "u20": 105, "20-30": 110, "30-50": 120, "50-90": 135, "90-250": 190, "250": 260 },
      tiers: { "u20": "director", "20-30": "director", "30-50": "director", "50-90": "director", "90-250": "growing", "250": "growing" },
      tierInfo: {
        director: {
          name: "Director",
          includes: [
            "Year-end accounts filed at Companies House",
            "Corporation Tax return (CT600) and the tax worked out",
            "Confirmation statement filed every year",
            "Payroll for directors, with the monthly returns to HMRC",
            "Dividend paperwork: vouchers and board minutes",
            "One director's Self Assessment return",
            "A salary and dividend plan each tax year",
            "Help with Companies House identity checks for directors"
          ]
        },
        growing: {
          name: "Growing company",
          includes: [
            "Everything in Director",
            "Quarterly management accounts, with a short call to go through them",
            "Your bookkeeping reviewed every quarter",
            "Two directors' Self Assessment returns",
            "A tax planning meeting before your year end"
          ]
        }
      },
      addons: ["vat", "payroll", "director", "formation", "catchup", "reference"]
    },

    books: {
      name: "Bookkeeping only",
      short: "Bookkeeping",
      icon: "i-book",
      turnoverWord: "Turnover",
      who: "Businesses that want their books kept every month, whether we or another accountant does the year end.",
      fees: { "u20": 60, "20-30": 70, "30-50": 85, "50-90": 110, "90-250": 160, "250": 230 },
      tiers: { "u20": "monthly", "20-30": "monthly", "30-50": "monthly", "50-90": "monthly", "90-250": "monthly", "250": "monthly" },
      tierInfo: {
        monthly: {
          name: "Monthly bookkeeping",
          includes: [
            "Your bank feed reconciled every month",
            "Receipts and invoices matched to payments",
            "Sales and purchase ledgers kept up to date",
            "A one-page profit and loss snapshot each month",
            "A list of who owes you money, and for how long",
            "Records ready for your year end, with us or another accountant",
            "Done in the software you already use, or one we set up with you"
          ]
        }
      },
      addons: ["vat", "payroll", "catchup"]
    }
  },

  // amount: per month unless oneOff. perUnit: priced per property or director.
  addons: {
    rent: { name: "Rental income on the same return", amount: 15, note: "If you are self-employed and a landlord too." },
    property: { name: "Each property after the third", amount: 8, perUnit: "property" },
    director: { name: "Each extra director's Self Assessment return", amount: 20, perUnit: "director" },
    vat: { name: "VAT returns, every quarter", amount: 40, note: "Sent through MTD for VAT software." },
    payroll: { name: "Payroll for staff, with pension auto-enrolment", amount: 25, note: "1 to 3 employees. 4 to 10: £55 a month. More: we will quote." },
    cgt: { name: "Selling a second home or a let property", amount: 350, oneOff: true, note: "Capital Gains Tax reported and paid within the 60-day deadline." },
    catchup: { name: "Catch-up: late or missing returns", amount: 395, oneOff: true, from: true, note: "Each late year, with your records brought up to date." },
    formation: { name: "Setting up a limited company", amount: 150, oneOff: true },
    reference: { name: "Accountant's reference letter", amount: 60, oneOff: true, note: "For a mortgage, a rental or a visa application." }
  },

  /* ---------- Package finder ---------- */
  finder: {
    types: [
      { id: "sole", label: "Sole trader or freelancer" },
      { id: "landlord", label: "Landlord" },
      { id: "both", label: "Both: self-employed and a landlord" },
      { id: "ltd", label: "Limited company" },
      { id: "books", label: "I only need bookkeeping" }
    ],
    vat: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
      { id: "unsure", label: "Not sure" }
    ],
    staff: [
      { id: "none", label: "No, just me", hint: "Directors on the payroll count as just you." },
      { id: "1-3", label: "1 to 3 people", fee: 25 },
      { id: "4-10", label: "4 to 10 people", fee: 55 },
      { id: "11", label: "More than 10", fee: null }
    ],
    // Bands at or over the VAT registration threshold (£90,000 of VAT-taxable sales in 12 months).
    vatBands: ["90-250", "250"]
  },

  /* ---------- Making Tax Digital for Income Tax ----------
     Who must use it: sole traders and landlords registered for Self Assessment whose qualifying income
     (self-employment and property income before expenses) is MORE THAN the threshold for the tax year. */
  mtd: {
    checked: "10 November 2026",
    phases: [
      { taxYear: "2024 to 2025", threshold: 50000, starts: "2026-04-06" },
      { taxYear: "2025 to 2026", threshold: 30000, starts: "2027-04-06" },
      { taxYear: "2026 to 2027", threshold: 20000, starts: "2028-04-06" }
    ],
    firstTaxYear: 2026, // the first tax year (6 April 2026 to 5 April 2027) anyone is in MTD
    // Standard update periods, each running from 6 April. [label, end of period, deadline month (1-12), day]
    quarters: [
      ["6 April to 5 July", 8, 7],
      ["6 April to 5 October", 11, 7],
      ["6 April to 5 January", 2, 7],
      ["6 April to 5 April", 5, 7]
    ],
    softwareList: "https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax"
  },

  /* ---------- Key dates ----------
     The deadlines page and the home page turn these into real dates for the next twelve months.
     cat: sa (Self Assessment), mtd (Making Tax Digital), year (the tax year), payroll (employers).
     {ty} is the tax year a date belongs to, worked out in dates.js. minor: only applies to some people, so
     the home page's tax year card skips it when it picks the next big deadline. */
  deadlines: [
    { id: "sa-online", month: 1, day: 31, cat: "sa", title: "Online tax return deadline", detail: "Your Self Assessment return for {ty}, sent online." },
    { id: "sa-pay", month: 1, day: 31, cat: "sa", title: "Pay your Self Assessment tax", detail: "What is left to pay for {ty}, plus your first payment on account for {next}, if you make them." },
    { id: "mtd-q3", month: 2, day: 7, cat: "mtd", title: "MTD quarterly update", detail: "Covers 6 April to 5 January in {ty}." },
    { id: "year-end", month: 4, day: 5, cat: "year", title: "The tax year ends", detail: "Last day of {ty}. A good time to send us your records." },
    { id: "year-start", month: 4, day: 6, cat: "year", title: "New tax year starts", detail: "{ty} begins." },
    { id: "mtd-q4", month: 5, day: 7, cat: "mtd", title: "MTD quarterly update", detail: "Covers the whole of {ty}, 6 April to 5 April." },
    { id: "p60", month: 5, day: 31, cat: "payroll", title: "Give employees their P60", detail: "Each employee's pay and tax for {ty}." },
    { id: "poa2", month: 7, day: 31, cat: "sa", title: "Second payment on account", detail: "Towards your tax bill for {ty}, if you make payments on account." },
    { id: "mtd-q1", month: 8, day: 7, cat: "mtd", title: "MTD quarterly update", detail: "Covers 6 April to 5 July in {ty}." },
    { id: "register", month: 10, day: 5, cat: "sa", title: "Register for Self Assessment", detail: "If you started working for yourself or letting property in {ty}." },
    { id: "paper", month: 10, day: 31, cat: "sa", minor: true, title: "Paper tax return deadline", detail: "If you still send a paper return for {ty}." },
    { id: "mtd-q2", month: 11, day: 7, cat: "mtd", title: "MTD quarterly update", detail: "Covers 6 April to 5 October in {ty}." },
    { id: "paye-code", month: 12, day: 30, cat: "sa", minor: true, title: "File online to pay through your tax code", detail: "For {ty}, if you owe less than £3,000 and already pay tax through PAYE." },
    // Every month: employers pay PAYE and National Insurance by the 22nd if they pay electronically.
    { id: "paye", monthly: 22, cat: "payroll", title: "Pay PAYE and National Insurance", detail: "For the tax month that ended on the 5th, if you pay electronically." }
  ],
  // Start dates for the next groups to join Making Tax Digital, shown on 6 April of those years.
  mtdStarts: {
    "2027": "Making Tax Digital starts for qualifying income over £30,000 in 2025 to 2026.",
    "2028": "Making Tax Digital starts for qualifying income over £20,000 in 2026 to 2027."
  },

  /* ---------- Enquiry form ----------
     next: a deadline id from the list above (or "mtd" for the next quarterly update), so the form can say
     when that deadline is. say: how the WhatsApp message puts it; {date} becomes that date. */
  enquiry: {
    worries: [
      { id: "sa", label: "The 31 January Self Assessment deadline", next: "sa-online", say: "the Self Assessment deadline on {date}" },
      { id: "mtd", label: "A Making Tax Digital quarterly update", next: "mtd", say: "the next MTD quarterly update, due {date}" },
      { id: "company", label: "Company accounts or Corporation Tax" },
      { id: "vat", label: "A VAT return, or whether to register" },
      { id: "hmrc", label: "A letter or penalty from HMRC" },
      { id: "late", label: "Tax returns I have not sent yet" }
    ],
    situations: {
      switching: "Switching from another accountant",
      new: "I have never had an accountant",
      starting: "Just starting out in business",
      behind: "Behind on returns, and need to catch up"
    }
  }
};
