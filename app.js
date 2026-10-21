/* Renders every page from data.js. Each HTML file only sets data-page (and data-stage) on <body>. */
(() => {
const KEY = "isai-roadmap-v2"; let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || "{}") || {} } catch (e) { state = {} }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} };

const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const sid = (st, i) => `${st.id}-${i}`;
const doneCount = st => st.steps.filter((_, i) => state[sid(st, i)]).length;

const B = document.body, ROOT = B.dataset.root || "", PAGE = B.dataset.page;
const LINK = {home: ROOT + "index.html", timeline: ROOT + "timeline.html", ref: ROOT + "reference.html", stage: id => `${ROOT}stages/${id}.html`};

// Every reference section, in stage order, with the operating principles first.
const REFS = [{t: "Operating principles", html: PRINCIPLES, id: "operating-principles"},
  ...STAGES.flatMap((s, i) => s.refs.map(r => ({...r, id: slug(r.t), stage: s, n: i + 1})))];

/* ---------- shared chrome ---------- */
function header() {
  const cur = k => PAGE === k ? ` aria-current="page"` : "";
  return `<header class="site">
   <a class="brand" href="${LINK.home}"><span class="eyebrow">India School of AI · Franchise build</span><span class="bt">ISAI Franchise Roadmap</span></a>
   <nav class="top" aria-label="Site"><a href="${LINK.home}"${cur("home")}>Overview</a><a href="${LINK.timeline}"${cur("timeline")}>Timeline</a><a href="${LINK.ref}"${cur("reference")}>Reference</a></nav>
   <div class="overall" aria-live="polite"><span id="allText"></span><span class="bar"><i id="allBar"></i></span></div>
  </header>`;
}
function sidebar() {
  return `<nav class="side" aria-label="Stages">
   <div class="sh">Stages</div>
   <ol class="slist">${STAGES.map((s, i) => `<li><a href="${LINK.stage(s.id)}" data-sl="${s.id}"${B.dataset.stage === s.id ? ` aria-current="page"` : ""}>
     <span class="sn">${i + 1}</span><span class="st"><span class="stt">${esc(s.short)}</span><span class="sw">${esc(s.when)}</span></span><span class="sp" data-sp="${s.id}"></span></a></li>`).join("")}</ol>
   <div class="sh refh">Reference</div>
   <ul class="rlist">${REFS.map(r => `<li><a href="${LINK.ref}#${r.id}">${esc(r.t)}</a></li>`).join("")}</ul>
  </nav>`;
}
const note = `<p class="note">This roadmap is a planning tool, not legal advice. Have a corporate or franchise lawyer and a CA confirm entity choices, agreements and tax treatment, and confirm NSDC and NASSCOM terms in writing.</p>`;

/* ---------- home ---------- */
function homeHTML() {
  const ni = STAGES.findIndex(s => doneCount(s) < s.steps.length);
  let next;
  if (ni < 0) next = `<a class="nextup" href="${LINK.timeline}"><span class="pk">All steps complete</span><span class="nt">Review the critical path</span><span class="nd">Every step is ticked. Check each gate is genuinely met.</span><span class="arrow">→</span></a>`;
  else {
    const s = STAGES[ni], k = s.steps.findIndex((_, i) => !state[sid(s, i)]);
    next = `<a class="nextup" href="${LINK.stage(s.id)}"><span class="pk">${doneCount(s) ? "Continue" : "Up next"} · Stage ${ni + 1}</span><span class="nt">${esc(s.title)}</span><span class="nd">Next step: ${esc(s.steps[k].t)} (${esc(s.steps[k].o)})</span><span class="arrow">→</span></a>`;
  }
  return `<section class="page">
   <div class="shdr"><div class="eyebrow">Start here</div><h1>Eight stages from readiness to scale</h1>
    <p class="lede">Each stage has its own page with steps, owners, the documents and SOPs each step needs, and an exit gate. No stage starts until the previous gate is met. Tick steps as they close; progress stays in this browser.</p></div>
   ${next}
   <div class="group"><div class="ghead"><h2>Stages</h2></div>
    <div class="cards">${STAGES.map((s, i) => `<a class="card" href="${LINK.stage(s.id)}">
     <span class="ctop"><span class="cn">${i + 1}</span><span class="cw">${esc(s.when)}</span></span>
     <span class="ct">${esc(s.title)}</span><span class="cg">${esc(s.goal.split(". ")[0])}.</span>
     <span class="cp"><span class="bar"><i data-cb="${s.id}"></i></span><span data-cc="${s.id}"></span></span></a>`).join("")}</div></div>
   <div class="group"><div class="ghead"><h2>Explore</h2></div>
    <div class="explore">
     <a href="${LINK.timeline}"><b>Timeline &amp; critical path</b><span>When each stage runs, and every exit gate in order.</span></a>
     <a href="${LINK.ref}"><b>Reference library</b><span>Entity structure, agreements, fees, roles, reporting and risks.</span></a>
    </div></div>
   ${note}
  </section>`;
}

/* ---------- timeline ---------- */
function timelineHTML() {
  const pct = v => (v / 24 * 100).toFixed(2);
  return `<section class="page">
   <div class="shdr"><nav class="crumbs"><a href="${LINK.home}">Overview</a> / Timeline</nav><h1>Timeline &amp; critical path</h1>
    <p class="lede">Stages overlap where preparation can start early, but each one only finishes when its gate is met.</p></div>
   <div class="group"><div class="ghead"><h2>Months from go-ahead</h2><span class="counts">Hatched = continues</span></div>
    <div class="gantt"><div class="ginner">
     ${STAGES.map(s => `<div class="grow"><div class="gl"><a href="${LINK.stage(s.id)}">${esc(s.title)}</a></div><div class="gtrack"><span class="gbar${s.open ? " open" : ""}" style="left:${pct(s.start)}%;width:${pct(s.end - s.start)}%" title="${esc(s.when)}"></span></div></div>`).join("")}
     <div class="gaxis"><div></div><div><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div></div>
    </div></div></div>
   <div class="group"><div class="ghead"><h2>Critical path: every gate in order</h2><span class="counts">${STAGES.reduce((a, s) => a + s.gate.length, 0)} conditions</span></div>
    <div class="path">${STAGES.map((s, i) => `<div class="pstep"><span class="sn">${i + 1}</span><div class="group">
     <h3><a href="${LINK.stage(s.id)}">${esc(s.title)}</a> <span class="counts">${esc(s.when)}</span></h3>
     <div class="gatebox"><ul>${s.gate.map(g => `<li>${esc(g)}</li>`).join("")}</ul></div></div></div>`).join("")}</div></div>
  </section>`;
}

/* ---------- reference library ---------- */
function referenceHTML() {
  const groups = [{label: "Model", items: [REFS[0]]}, ...STAGES.map((s, i) => ({label: `${i + 1} · ${s.short}`, items: REFS.filter(r => r.stage === s)}))].filter(g => g.items.length);
  return `<section class="page">
   <div class="shdr"><nav class="crumbs"><a href="${LINK.home}">Overview</a> / Reference</nav><h1>Reference library</h1>
    <p class="lede">Everything that supports the steps: how the entities fit together, what each agreement secures, who owns what, and how the network is governed. Each section also appears on its stage page.</p></div>
   <nav class="toc" aria-label="Contents">${groups.map(g => `<div><b>${esc(g.label)}</b>${g.items.map(r => `<a href="#${r.id}">${esc(r.t)}</a>`).join("")}</div>`).join("")}</nav>
   ${REFS.map(r => `<section class="refsec" id="${r.id}"><div class="rtop"><h2>${esc(r.t)}</h2>${r.stage ? `<a class="reflink" href="${LINK.stage(r.stage.id)}">Stage ${r.n} · ${esc(r.stage.title)} →</a>` : ""}</div>${r.html}</section>`).join("")}
   ${note}
  </section>`;
}

/* ---------- stage page ---------- */
function kit(cls, label, items) { return items.length ? `<div class="kit ${cls}"><h5>${label}</h5><ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "" }
function stageHTML(i) {
  const s = STAGES[i], prev = STAGES[i - 1], next = STAGES[i + 1];
  return `<section class="page">
   <div class="shdr"><nav class="crumbs"><a href="${LINK.home}">Overview</a> / Stage ${i + 1} of ${STAGES.length}</nav>
    <div class="eyebrow">Stage ${i + 1} · ${esc(s.when)}</div><h1>${esc(s.title)}</h1><p class="lede">${esc(s.goal)}</p>
    <div class="facts"><div class="fact"><b>Lead</b><span>${esc(s.lead)}</span></div><div class="fact"><b>Starts when</b><span>${esc(s.entry)}</span></div>
     <div class="fact"><b>Progress</b><span data-sc="${s.id}"></span><span class="bar"><i data-cb="${s.id}"></i></span></div></div></div>
   <nav class="jump" aria-label="On this page"><a href="#steps">Steps · ${s.steps.length}</a><a href="#gate">Exit gate · ${s.gate.length}</a>${s.refs.length ? `<a href="#reference">Reference · ${s.refs.length}</a>` : ""}</nav>
   <div class="group" id="steps"><div class="ghead"><h2>Steps</h2>
     <div class="tools"><div class="legend"><span class="l-doc">Docs</span><span class="l-sop">SOPs</span><span class="l-asset">Assets</span></div>
      <button class="small" data-fold="open">Expand all</button><button class="small" data-fold="close">Collapse all</button></div></div>
    ${s.steps.map((st, k) => { const id = sid(s, k), on = !!state[id]; return `<div class="row${on ? " done" : ""}"><input type="checkbox" id="${id}" ${on ? "checked" : ""} aria-label="Mark done: ${esc(st.t)}">
     <details class="fold"><summary><span class="chev"></span><span class="sumt"><strong>${esc(st.t)}</strong><span class="owner">${esc(st.o)}</span></span><span class="counts">${[st.docs.length && plural(st.docs.length, "doc"), st.sops.length && plural(st.sops.length, "SOP"), st.assets.length && plural(st.assets.length, "asset")].filter(Boolean).join(" · ")}</span></summary>
      <div class="foldbody"><p class="desc">${esc(st.d)}</p><div class="kits">${kit("doc", "Documents", st.docs)}${kit("sop", "SOPs", st.sops)}${kit("asset", "Assets", st.assets)}</div></div></details></div>` }).join("")}
   </div>
   <div class="group" id="gate"><div class="ghead"><h2>Exit gate</h2></div>
    <div class="gatebox"><ul>${s.gate.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
     <p>${next ? `When every condition is met, move on to <a href="${LINK.stage(next.id)}">Stage ${i + 2}: ${esc(next.title)}</a>.` : "This is the final stage; it runs on as the network grows."}</p></div></div>
   ${s.refs.length ? `<div class="group" id="reference"><div class="ghead"><h2>Reference</h2><a class="reflink" href="${LINK.ref}">Full library →</a></div>
    ${s.refs.map(r => `<details class="fold ref"><summary><span class="chev"></span><span class="sumt"><strong>${esc(r.t)}</strong></span><span></span></summary><div class="foldbody">${r.html}</div></details>`).join("")}</div>` : ""}
   <nav class="pager" aria-label="Stages">${prev ? `<a href="${LINK.stage(prev.id)}"><span class="pk">← Stage ${i}</span><span class="pt">${esc(prev.title)}</span></a>` : `<a href="${LINK.home}"><span class="pk">← Overview</span><span class="pt">All stages</span></a>`}
    ${next ? `<a class="next" href="${LINK.stage(next.id)}"><span class="pk">Stage ${i + 2} →</span><span class="pt">${esc(next.title)}</span></a>` : `<a class="next" href="${LINK.timeline}"><span class="pk">Timeline →</span><span class="pt">Critical path</span></a>`}</nav>
  </section>`;
}

/* ---------- mount ---------- */
let main;
if (PAGE === "stage") {
  const i = STAGES.findIndex(s => s.id === B.dataset.stage);
  main = i < 0 ? homeHTML() : stageHTML(i);
} else main = PAGE === "timeline" ? timelineHTML() : PAGE === "reference" ? referenceHTML() : homeHTML();
document.getElementById("app").innerHTML = `${header()}<div class="layout">${sidebar()}<main>${main}</main></div>`;
// On narrow screens the stage list is a horizontal strip: bring the current stage into view.
const curStage = document.querySelector(".slist a[aria-current]");
if (curStage) { const strip = curStage.closest(".slist"); strip.scrollLeft = curStage.offsetLeft - strip.offsetLeft - 16; }

function refresh() {
  let all = 0, done = 0;
  STAGES.forEach(s => {
    const d = doneCount(s), n = s.steps.length; all += n; done += d;
    const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
    set(`[data-sp="${s.id}"]`, el => el.textContent = `${d}/${n}`);
    set(`[data-sl="${s.id}"]`, el => el.classList.toggle("complete", d === n));
    set(`[data-cc="${s.id}"]`, el => el.textContent = `${d}/${n} steps`);
    set(`[data-sc="${s.id}"]`, el => el.textContent = `${d} of ${n} steps done`);
    set(`[data-cb="${s.id}"]`, el => el.style.width = (d / n * 100) + "%");
  });
  document.getElementById("allText").textContent = `${done} / ${all} steps`;
  document.getElementById("allBar").style.width = (all ? done / all * 100 : 0) + "%";
}
document.addEventListener("change", e => {
  if (e.target.type !== "checkbox") return;
  if (e.target.checked) state[e.target.id] = 1; else delete state[e.target.id];
  e.target.closest(".row").classList.toggle("done", e.target.checked); save(); refresh();
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-fold]");
  if (b) document.querySelectorAll("#steps details.fold").forEach(d => d.open = b.dataset.fold === "open");
});
refresh();
})();
