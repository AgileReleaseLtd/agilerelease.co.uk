/* Guide prices: works out a price range for a job from the answers given, using the rules in data.js.
   Used by the quote form, the services list and the landlord booking, so they always agree. */
(function () {
  var data = window.Earthpin;

  // Does this question apply, given the other answers? (A question with `showIf` only counts when it does.)
  function applies(question, answers) {
    if (!question.showIf) {
      return true;
    }
    return Object.keys(question.showIf).every(function (key) {
      return question.showIf[key].indexOf(answers[key]) !== -1;
    });
  }

  function chosenOption(question, answers) {
    var value = answers[question.id];
    if (!question.options) {
      return null;
    }
    for (var i = 0; i < question.options.length; i++) {
      if (question.options[i].value === value) {
        return question.options[i];
      }
    }
    return null;
  }

  function step(n) {
    return n < 500 ? 10 : n < 2000 ? 50 : 100;
  }

  // { lo, hi } in pounds, or { stop: "message" }; `notes` lists anything worth knowing about the answers;
  // `missing` lists questions not answered yet.
  function compute(jobId, answers) {
    var job = data.jobs[jobId];
    var out = { lo: 0, hi: 0, notes: [], missing: [], stop: "" };
    if (!job) {
      out.missing.push("job");
      return out;
    }
    answers = answers || {};
    var count = job.count ? Math.max(1, parseInt(answers[job.count], 10) || 0) : 1;
    var base = job.base ? job.base.slice() : [0, 0];
    var times = 1;
    var extra = [0, 0];

    job.questions.forEach(function (q) {
      if (!applies(q, answers)) {
        return;
      }
      if (q.type === "count") {
        if (q.each) {
          base[0] += q.each[0] * count;
          base[1] += q.each[1] * count;
        }
        return;
      }
      var opt = chosenOption(q, answers);
      if (!opt) {
        out.missing.push(q.id);
        return;
      }
      if (opt.stop) {
        out.stop = opt.stop;
      }
      if (opt.base) {
        base[0] += opt.base[0];
        base[1] += opt.base[1];
      }
      if (opt.each) {
        base[0] += opt.each[0] * count;
        base[1] += opt.each[1] * count;
      }
      if (opt.times) {
        times *= opt.times;
      }
      if (opt.extra) {
        extra[0] += opt.extra[0];
        extra[1] += opt.extra[1];
      }
      if (opt.note) {
        out.notes.push(opt.note);
      }
    });

    var lo = base[0] * times + extra[0];
    var hi = base[1] * times + extra[1];
    lo = Math.floor(lo / step(lo)) * step(lo);
    hi = Math.ceil(hi / step(hi)) * step(hi);
    // The minimum charge is applied after rounding, so it is never rounded below.
    var min = job.minimum || 0;
    out.lo = Math.max(lo, min);
    out.hi = Math.max(hi, min);
    return out;
  }

  // 1250 -> "£1,250"
  function money(n) {
    return "£" + Math.round(n).toLocaleString("en-GB");
  }

  // "£850 to £1,300", or "£110" when both ends are the same.
  function range(lo, hi) {
    return lo === hi ? money(lo) : money(lo) + " to " + money(hi);
  }

  window.EarthpinPrices = {
    applies: applies,
    chosenOption: chosenOption,
    compute: compute,
    money: money,
    range: range
  };
})();
