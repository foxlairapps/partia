const R = {
  coin: { label: "Mince", icon: "🪙" },
  wood: { label: "Dřevo", icon: "🪵" },
  stone: { label: "Kámen", icon: "🪨" },
  metal: { label: "Kov", icon: "⚙️" },
  sword: { label: "Síla", icon: "⚔️" },
  goods: { label: "Zboží", icon: "📦" },
};

const art = (family, stage) => `assets/${family}-${stage}.jpg`;
const stage = (name, image, production, cost, fame, effect, next = []) => ({ name, image, production, cost, fame, effect, next });

const templates = {
  meadow: {
    title: "Hospodářská půda", kind: "Krajina",
    stages: [
      stage("Pustý lán", art("meadow",1), {coin:1}, {coin:2}, 0, "Skromná půda poskytuje první příjem.", [1]),
      stage("Obdělaný lán", art("meadow",2), {coin:1}, {coin:3}, 0, "Místo produkce můžeš odhodit další přátelskou kartu a získat 2 mince.", [2]),
      stage("Úrodná pole", art("meadow",3), {coin:2}, {wood:3}, 0, "Rozšířená pole spolehlivě živí rostoucí panství.", [3]),
      stage("Panské sýpky", art("meadow",4), {coin:2}, null, 3, "Zůstávají ve hře na konci tahu, dokud je nepoužiješ.", []),
    ]
  },
  mountain: {
    title: "Kamenité území", kind: "Krajina",
    stages: [
      stage("Kamenné návrší", art("mountain",1), {coin:1}, {coin:2}, 0, "Odlehlá půda čeká na první investici.", [1]),
      stage("Odkryté skály", art("mountain",2), {stone:1}, {coin:2}, 0, "Zaplať 1 minci a odhoď kartu: získej místo produkce 2 kameny.", [2]),
      stage("Panský lom", art("mountain",3), {stone:2}, {coin:2,wood:2}, 0, "Lom poskytuje dost kamene pro velké stavby.", [3]),
      stage("Hlubinný důl", art("mountain",4), {stone:1,metal:1}, null, 3, "Rozvinutý důl otevírá cestu k dalším průmyslovým kartám.", []),
    ]
  },
  forest: {
    title: "Lesní držba", kind: "Krajina",
    stages: [
      stage("Temný hvozd", art("forest",1), {}, null, 0, "Vykácej hvozd: získej 3 dřeva a změň jej na Lesní paseku.", []),
      stage("Lesní paseka", art("forest",2), {wood:1}, null, 0, "Zvol duchovní, nebo hospodářskou budoucnost tohoto místa.", [2,3]),
      stage("Studánkový háj", art("forest",3), {goods:1}, null, 2, "Klidné místo poskytuje zboží a věhlas.", []),
      stage("Dřevařská osada", art("forest",4), {wood:2}, null, 1, "Silná produkce dřeva pro další rozvoj.", []),
    ],
    branchCosts: { 2: {coin:2}, 3: {wood:2} }
  },
  manor: {
    title: "Správa panství", kind: "Budova",
    stages: [
      stage("Starý dvorec", art("manor",1), {coin:1}, {coin:3}, 0, "Středisko správy a budoucí opora balíčku.", [1]),
      stage("Správcovský dům", art("manor",2), {coin:1}, {wood:2,stone:1}, 0, "Odhodíš-li jej, vrať první krajinu z odhazovacího balíčku do hry.", [2]),
      stage("Zemská rada", art("manor",3), {coin:1}, {stone:2,metal:1}, 1, "Může vrátit do hry krajinu nebo budovu.", [3]),
      stage("Panská kancelář", art("manor",4), {coin:2}, null, 4, "Může vrátit do hry libovolnou odhozenou kartu.", []),
    ]
  },
  market: {
    title: "Obchodní zázemí", kind: "Budova",
    stages: [
      stage("Kupecký přístřešek", art("market",1), {}, {wood:2}, 0, "Odhodíš-li jej a zaplatíš minci, získáš dřevo.", [1]),
      stage("Směnárna", art("market",2), {}, {stone:2}, 0, "Směň minci za dřevo nebo kámen.", [2]),
      stage("Městská tržnice", art("market",3), {}, {metal:2}, 1, "Směň minci za dřevo, kámen nebo kov.", [3]),
      stage("Obchodní dvůr", art("market",4), {wood:1,stone:1}, null, 3, "Při produkci si zvol dřevo, kámen nebo kov.", []),
    ]
  },
  jungle: {
    title: "Pohraniční porost", kind: "Krajina",
    stages: [
      stage("Neprostupný porost", art("forest",1), {}, {coin:2}, 0, "Odhodíš-li jej, získáš dřevo.", [1]),
      stage("Průsek", art("forest",2), {wood:1}, {wood:2}, 0, "Nová cesta zpřístupňuje vzdálené místo.", [2]),
      stage("Lesní osada", art("forest",4), {wood:1,coin:1}, {stone:2}, 1, "Osada zůstává ve hře na konci tahu.", [3]),
      stage("Korunové domy", art("forest",3), {goods:1,coin:1}, null, 3, "Rozvinutá osada spojuje obchod s krajinou.", []),
    ]
  },
  expedition: {
    title: "Výprava", kind: "Ostatní",
    stages: [
      stage("Za obzorem", art("meadow",1), {}, {coin:1}, 0, "Příslib nových území.", [1]),
      stage("První mapa", art("meadow",2), {}, {wood:1,coin:1}, 0, "Připravená cesta snižuje nejistotu výpravy.", [2]),
      stage("Zeměměřičská stezka", art("meadow",3), {goods:1}, {stone:1,goods:1}, 1, "Přináší první obchodní užitek.", [3]),
      stage("Nové hranice", art("meadow",4), {goods:2}, null, 3, "Otevírá další větev objevovaných karet.", []),
    ]
  }
};

const initialCards = ["meadow","meadow","meadow","meadow","mountain","mountain","forest","forest","manor","market"];
const discoveryQueue = ["jungle","expedition","meadow","market","mountain","manor"];

let state;
let toastTimer;
let draggingId = null;
let pendingUpgrade = null;
let pendingDiscard = null;
let pendingDiscardBrowser = null;
let roundTransitionContext = null;
const savedColumns = Number(localStorage.getItem("patria-max-columns"));
let maxColumns = [4,6,8].includes(savedColumns) ? savedColumns : 6;

function newGame() {
  let serial = 1;
  state = {
    round: 1, turn: 1,
    resources: emptyResources(),
    cards: initialCards.map(template => ({ id: serial++, template, state: 0 })),
    deck: [], slots: Array(16).fill(null), discard: [], inactive: new Set(), busy: false,
    discoveries: [...discoveryQueue],
    history: ["Panství bylo založeno. První kolo začíná."],
    selectedCard: null,
  };
  startRound();
}

function emptyResources() { return Object.fromEntries(Object.keys(R).map(k => [k,0])); }
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}
function getCard(id) { return state.cards.find(card => card.id === id); }
function getTemplate(card) { return templates[card.template]; }
function getStage(card) { return getTemplate(card).stages[card.state]; }
function formatBundle(bundle = {}) { return Object.entries(bundle).filter(([,v])=>v).map(([k,v])=>`${R[k].icon} ${v}`).join("  ") || "—"; }
function expandedBundle(bundle = {}) { return Object.entries(bundle).flatMap(([key,value])=>Array.from({length:value},()=>R[key].icon)).join("") || "—"; }
function productionIcons(bundle = {}) { return Object.entries(bundle).flatMap(([key,value])=>Array.from({length:value},()=>`<span class="production-item" aria-hidden="true">${R[key].icon}</span>`)).join(""); }
function canAfford(cost = {}) { return Object.entries(cost).every(([k,v]) => state.resources[k] >= v); }
function spend(cost = {}) { Object.entries(cost).forEach(([k,v]) => state.resources[k] -= v); }
function gain(bundle = {}) { Object.entries(bundle).forEach(([k,v]) => state.resources[k] += v); }
function addHistory() {}
function notify(text) { const el=document.querySelector("#toast"); el.textContent=text; el.classList.add("visible"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("visible"),2200); }
function activeIds() { return state.slots.filter(id => id !== null); }
function slotOf(id) { return state.slots.indexOf(id); }
function firstEmptySlot() { return state.slots.findIndex(id => id === null); }

function startRound() {
  state.resources = emptyResources();
  state.slots = Array(16).fill(null);
  state.discard = [];
  state.deck = shuffle(state.cards.map(card => card.id));
  startTurn(false);
}

function startTurn(increment = true) {
  if (increment) state.turn += 1;
  state.resources = emptyResources();
  state.inactive = new Set();
  const drawn=drawCards(Math.min(4, state.deck.length), false);
  render();
  animateDeal(drawn);
}

function drawCards(count, loseResources = true) {
  if (loseResources) state.resources = emptyResources();
  const drawn=[];
  for (let i=0; i<count && state.deck.length; i++) {
    const slot=firstEmptySlot();
    if (slot < 0) break;
    const id=state.deck.shift();
    state.slots[slot]=id;
    drawn.push(id);
  }
  return drawn;
}

function discardCard(id) {
  const slot=slotOf(id);
  if (slot >= 0) state.slots[slot]=null;
  state.inactive.delete(id);
  if (!state.discard.includes(id)) state.discard.push(id);
}

async function produce(id) {
  const card=getCard(id), current=getStage(card);
  if (state.busy || slotOf(id) < 0 || !Object.values(current.production).some(Boolean)) return;
  state.busy=true;
  gain(current.production);
  await animateDiscard([id]);
  discardCard(id);
  state.busy=false;
  render();
}

async function useEffect(id) {
  if (state.busy || state.inactive.has(id) || slotOf(id) < 0) return;
  const card=getCard(id), current=getStage(card), template=card.template;
  if (template === "meadow" && card.state === 1) {
    const choices=activeIds().filter(otherId => otherId !== id);
    if (!choices.length) return notify("Potřebuješ další aktivní kartu.");
    pendingDiscard={sourceId:id,selectedId:choices[0]};
    renderDiscardChoice();
    document.querySelector("#discard-choice-dialog").showModal();
    return;
  }
  if (template === "manor" && card.state > 0) {
    const eligible=[...state.discard].reverse().filter(otherId=>{
      const other=getCard(otherId), kind=getTemplate(other).kind;
      return card.state>=3 || kind==="Krajina" || (card.state>=2 && kind==="Budova");
    });
    if (!eligible.length) return notify("V odhazovacím balíčku není vhodná karta.");
    showDiscardBrowser(id,eligible);
    return;
  }
  state.busy=true;
  if (template === "forest" && card.state === 0) {
    gain({wood:3}); card.state=1; await animateDiscard([id]); discardCard(id); state.busy=false; render(); return;
  }
  if (template === "mountain" && card.state === 1) {
    if (!canAfford({coin:1})) { state.busy=false; return notify("Chybí 1 mince."); }
    spend({coin:1}); gain({stone:2}); await animateDiscard([id]); discardCard(id); state.busy=false; render(); return;
  }
  if (template === "market" && card.state < 3) {
    if (!canAfford({coin:1})) { state.busy=false; return notify("Chybí 1 mince."); }
    const options = card.state === 0 ? ["wood"] : card.state === 1 ? ["wood","stone"] : ["wood","stone","metal"];
    spend({coin:1}); gain({[options[0]]:1}); await animateDiscard([id]); discardCard(id); state.busy=false; render(); return;
  }
  state.busy=false;
  notify("Tento efekt bude doplněn v další části prototypu.");
}

function renderDiscardChoice() {
  if (!pendingDiscard) return;
  const choices=activeIds().filter(id=>id!==pendingDiscard.sourceId);
  document.querySelector("#discard-choice-content").innerHTML=`
    <div class="dialog-header"><span class="eyebrow">Platba kartou</span><h2>Kterou kartu chceš odhodit?</h2><p>Zvolená karta i karta s efektem odejdou do odhazovacího balíčku.</p></div>
    <div class="discard-choices">${choices.map(id=>{
      const card=getCard(id), selected=id===pendingDiscard.selectedId;
      return `<button class="full-card-choice ${selected?"selected":""}" data-select-discard="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`;
    }).join("")}</div>
    <div class="upgrade-confirm-bar"><button class="secondary-action" data-close-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-discard type="button">Odhodit zvolenou kartu</button></div>`;
}

function selectDiscardCard(id) {
  if (!pendingDiscard || id===pendingDiscard.sourceId || slotOf(id)<0) return;
  pendingDiscard.selectedId=id;
  renderDiscardChoice();
}

async function confirmDiscardChoice() {
  if (!pendingDiscard || state.busy) return;
  const {sourceId,selectedId}=pendingDiscard;
  if (slotOf(sourceId)<0 || slotOf(selectedId)<0) return;
  document.querySelector("#discard-choice-dialog").close();
  pendingDiscard=null;
  state.busy=true;
  await animateDiscard([sourceId,selectedId]);
  discardCard(selectedId); discardCard(sourceId); gain({coin:2});
  state.busy=false; render();
}

function showDiscardBrowser(sourceId=null,eligibleIds=null) {
  const ids=eligibleIds ?? [...state.discard].reverse();
  pendingDiscardBrowser={sourceId,ids,selectedId:sourceId!==null?ids[0]:null};
  renderDiscardBrowser();
  document.querySelector("#discard-browser-dialog").showModal();
}

function renderDiscardBrowser() {
  if (!pendingDiscardBrowser) return;
  const selecting=pendingDiscardBrowser.sourceId!==null;
  document.querySelector("#discard-browser-content").innerHTML=`
    <div class="dialog-header"><span class="eyebrow">Odhazovací balíček</span><h2>${selecting?"Vyber kartu, která se vrátí":"Odhozené karty"}</h2>${selecting?"<p>Vybranou kartu vrátíš do aktivní zóny.</p>":""}</div>
    ${pendingDiscardBrowser.ids.length?`<div class="discard-card-strip">${pendingDiscardBrowser.ids.map(id=>{
      const card=getCard(id),selected=id===pendingDiscardBrowser.selectedId;
      return selecting?`<button class="full-card-choice ${selected?"selected":""}" data-select-retrieve="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`:`<button class="discard-view-card" data-detail="${id}" type="button" aria-label="Prohlédnout kartu ${getStage(card).name}">${renderPreviewCard(card,card.state)}</button>`;
    }).join("")}</div>`:`<div class="discard-empty">Odhazovací balíček je prázdný.</div>`}
    ${selecting?`<div class="upgrade-confirm-bar"><button class="secondary-action" data-close-discard-browser type="button">Zrušit</button><button class="upgrade-action" data-confirm-retrieve type="button">Vrátit vybranou kartu</button></div>`:""}`;
}

function selectRetrieveCard(id) {
  if (!pendingDiscardBrowser?.ids.includes(id)) return;
  pendingDiscardBrowser.selectedId=id;
  renderDiscardBrowser();
}

async function confirmRetrieveCard() {
  if (!pendingDiscardBrowser || state.busy) return;
  const {sourceId,selectedId}=pendingDiscardBrowser;
  if (sourceId===null || !state.discard.includes(selectedId) || slotOf(sourceId)<0) return;
  const originalSlot=slotOf(sourceId);
  document.querySelector("#discard-browser-dialog").close();
  pendingDiscardBrowser=null;
  state.busy=true;
  await animateDiscard([sourceId]); discardCard(sourceId);
  state.discard=state.discard.filter(id=>id!==selectedId); state.slots[originalSlot]=selectedId;
  state.busy=false; render(); animateDeal([selectedId]);
}

function upgradeCost(card, target) {
  const template=getTemplate(card);
  if (card.template === "forest" && card.state === 1) return template.branchCosts[target];
  return getStage(card).cost;
}

async function upgrade(id, target) {
  if (state.busy || state.inactive.has(id)) return;
  const card=getCard(id), current=getStage(card);
  if (slotOf(id) < 0 || !current.next.includes(target)) return;
  const cost=upgradeCost(card,target);
  if (!canAfford(cost)) return notify(`Chybí suroviny: ${formatBundle(cost)}.`);
  state.busy=true;
  spend(cost); card.state=target;
  closeDialogs();
  await animateDiscard([id]); discardCard(id);
  await endTurn(true);
}

async function endTurn(upgraded = false) {
  state.busy=true;
  const staying=[];
  const leaving=[];
  for (const id of activeIds()) {
    const card=getCard(id);
    if (card.template === "meadow" && card.state === 3) staying.push(id);
    else if (card.template === "jungle" && card.state >= 2) staying.push(id);
    else leaving.push(id);
  }
  await animateDiscard(leaving);
  leaving.forEach(discardCard);
  state.resources=emptyResources();
  state.inactive=new Set();
  if (state.deck.length === 0) await endRound();
  else { state.busy=false; startTurn(true); }
}

async function endRound() {
  const remaining=activeIds();
  await animateDiscard(remaining);
  remaining.forEach(discardCard);
  await showRoundTransition(state.round,state.round+1);
  state.round += 1; state.turn=1;
  state.busy=false;
  startRound();
}

function showRoundTransition(finished,next) {
  const overlay=document.querySelector("#round-transition");
  document.querySelector("#round-finished").textContent=`Kolo ${finished} dokončeno`;
  document.querySelector("#round-next").textContent="Panství uzavírá právě skončené období";
  document.querySelector("#round-transition-body").innerHTML=`
    <div class="round-rest-panel">
      <p>Než připravíš další kolo, můžeš si projít své karty nebo uložit současný stav hry.</p>
      <div class="round-rest-actions">
        <button class="secondary-action" data-save-game type="button">💾 Uložit hru</button>
        <button class="secondary-action" data-open-library type="button">▦ Knihovna karet</button>
        <button class="round-primary-action" data-prepare-round type="button">Začít další kolo →</button>
      </div>
    </div>`;
  overlay.className="round-transition phase-intermission";
  overlay.hidden=false;
  return new Promise(resolve=>{roundTransitionContext={finished,next,newCards:[],resolve,phase:"intermission"};});
}

function prepareNextRound() {
  if (!roundTransitionContext || roundTransitionContext.phase!=="intermission") return;
  const found=[];
  for (let i=0;i<2 && state.discoveries.length;i++) {
    const template=state.discoveries.shift();
    const card={id:Math.max(...state.cards.map(c=>c.id))+1,template,state:0};
    state.cards.push(card); found.push(card);
  }
  roundTransitionContext.newCards=found;
  roundTransitionContext.phase="discovery";
  document.querySelector("#round-finished").textContent="Nové období";
  document.querySelector("#round-next").textContent=`Kolo ${roundTransitionContext.next} začíná`;
  const notes=found.map(card=>{
    const stage=getStage(card);
    const description=stage.effect || (stage.production?.length?`Tato karta může produkovat ${stage.production.join(" ")}.`:"Nová karta rozšiřuje možnosti tvého panství.");
    return `<article class="round-note"><strong>${stage.name}</strong><p>${description}</p></article>`;
  }).join("");
  document.querySelector("#round-transition-body").innerHTML=`
    ${found.length?`<p class="round-hint">Prohlédni si nové karty. Kliknutím na kartu otevřeš všechny její stavy.</p><div class="round-new-cards">${found.map(card=>`<button class="round-card-button" data-detail="${card.id}" type="button" aria-label="Prohlédnout kartu ${getStage(card).name}">${renderPreviewCard(card,card.state)}</button>`).join("")}</div><section class="round-notes" aria-label="Novinky tohoto období"><h3>Nové v tomto období</h3>${notes}</section>`:`<p class="round-hint">V tomto období už nečekají žádné další nové karty.</p>`}
    <div class="round-discovery-actions">
      <button class="secondary-action" data-open-library type="button">▦ Knihovna karet</button>
    </div>`;
  document.querySelector("#round-transition-body").insertAdjacentHTML("beforeend",`<div class="round-discovery-footer"><button class="shuffle-round-action" data-shuffle-round type="button"><span class="mini-deck" aria-hidden="true">${state.cards.length}</span><strong>Zamíchat</strong></button></div>`);
  document.querySelector("#round-transition").className="round-transition phase-discovery";
}

async function shuffleAndStartRound() {
  if (!roundTransitionContext || roundTransitionContext.phase!=="discovery") return;
  roundTransitionContext.phase="shuffle";
  const overlay=document.querySelector("#round-transition");
  overlay.className="round-transition phase-shuffle";
  document.querySelector("#round-next").textContent=`Míchání balíčku pro kolo ${roundTransitionContext.next}`;
  document.querySelector("#round-transition-body").innerHTML="";
  await new Promise(resolve=>setTimeout(resolve,1450));
  overlay.classList.add("leaving");
  await new Promise(resolve=>setTimeout(resolve,320));
  overlay.hidden=true;
  overlay.className="round-transition";
  const resolve=roundTransitionContext.resolve;
  roundTransitionContext=null;
  resolve();
}

function saveGame() {
  const snapshot={
    version:1,savedAt:new Date().toISOString(),round:state.round,turn:state.turn,
    resources:state.resources,cards:state.cards,deck:state.deck,slots:state.slots,
    discard:state.discard,inactive:[...state.inactive],discoveries:state.discoveries
  };
  localStorage.setItem("patria-saved-game",JSON.stringify(snapshot));
  notify("Hra je uložená v tomto zařízení.");
}

function showLibrary() {
  document.querySelector("#library-dialog-content").innerHTML=`
    <div class="dialog-header"><span class="eyebrow">Knihovna</span><h2>Tvé karty</h2><p>${state.cards.length} karet v panství. Kliknutím otevřeš všechny stavy.</p></div>
    <div class="library-grid">${state.cards.map(card=>`<button class="library-card" data-detail="${card.id}" type="button" aria-label="Prohlédnout kartu ${getStage(card).name}">${renderPreviewCard(card,card.state)}</button>`).join("")}</div>`;
  const dialog=document.querySelector("#library-dialog");
  if (!dialog.open) dialog.showModal();
}

function advance() {
  if (state.busy || !state.deck.length) return;
  const room=state.slots.filter(id=>id===null).length;
  if (!room) return notify("Na herní ploše už není volná pozice.");
  const drawn=drawCards(Math.min(2,state.deck.length,room), false);
  render(); animateDeal(drawn);
}

function animateDeal(ids) {
  if (!ids.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  requestAnimationFrame(() => {
    const pile=document.querySelector("#draw-pile .deck-stack")?.getBoundingClientRect();
    if (!pile) return;
    ids.forEach((id,index) => {
      const element=document.querySelector(`[data-card="${id}"]`);
      if (!element) return;
      const rect=element.getBoundingClientRect();
      const fromX=pile.left + pile.width/2 - (rect.left + rect.width/2);
      const fromY=pile.top + pile.height/2 - (rect.top + rect.height/2);
      element.animate([
        { transform:`translate(${fromX}px, ${fromY}px) scale(.18) rotate(-9deg)`, opacity:0 },
        { transform:"translate(0,0) scale(1) rotate(0deg)", opacity:1 }
      ], { duration:360, delay:index*75, easing:"cubic-bezier(.18,.75,.28,1)", fill:"backwards" });
    });
  });
}

function animateDiscard(ids) {
  if (!ids.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  const target=document.querySelector("#discard-pile .deck-stack")?.getBoundingClientRect();
  if (!target) return Promise.resolve();
  const animations=ids.map((id,index) => {
    const source=document.querySelector(`[data-card="${id}"]`);
    if (!source) return Promise.resolve();
    const rect=source.getBoundingClientRect();
    const clone=source.cloneNode(true);
    clone.classList.add("flying-card");
    clone.classList.remove("exhausted","dragging");
    Object.assign(clone.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
    clone.querySelectorAll("button").forEach(button=>button.disabled=true);
    document.body.appendChild(clone);
    source.style.opacity="0";
    const toX=target.left + target.width/2 - (rect.left + rect.width/2);
    const toY=target.top + target.height/2 - (rect.top + rect.height/2);
    const animation=clone.animate([
      { transform:"translate(0,0) scale(1) rotate(0deg)", opacity:1 },
      { transform:`translate(${toX}px, ${toY}px) scale(.15) rotate(${index%2?11:-11}deg)`, opacity:.25 }
    ], { duration:310, delay:index*55, easing:"cubic-bezier(.55,.02,.8,.45)", fill:"forwards" });
    return animation.finished.catch(()=>{}).then(()=>clone.remove());
  });
  return Promise.all(animations);
}

function showCard(id) { state.selectedCard=id; renderDialog(); document.querySelector("#card-dialog").showModal(); }
function hideSettingsMenu() {
  document.querySelector("#settings-menu").hidden=true;
  document.querySelector("#settings-button").setAttribute("aria-expanded","false");
}
function closeDialogs() { document.querySelectorAll("dialog[open]").forEach(d=>d.close()); hideSettingsMenu(); pendingUpgrade=null; pendingDiscard=null; pendingDiscardBrowser=null; }

function showUpgradeChoice(id, preferredTarget = null) {
  const card=getCard(id), current=getStage(card);
  if (!card || slotOf(id) < 0 || !current.next.length || state.busy) return;
  const cardDialog=document.querySelector("#card-dialog");
  if (cardDialog.open) cardDialog.close();
  const target=current.next.includes(preferredTarget) ? preferredTarget : current.next.find(next=>canAfford(upgradeCost(card,next))) ?? current.next[0];
  if (!canAfford(upgradeCost(card,target))) return;
  pendingUpgrade={id,target};
  renderUpgradeDialog();
  const dialog=document.querySelector("#upgrade-dialog");
  if (!dialog.open) dialog.showModal();
}

function renderUpgradeDialog() {
  if (!pendingUpgrade) return;
  const card=getCard(pendingUpgrade.id), template=getTemplate(card), current=getStage(card);
  document.querySelector("#upgrade-dialog-content").innerHTML=`
    <div class="dialog-header"><span class="eyebrow">Vylepšení</span><h2>Na co se karta promění?</h2></div>
    ${current.next.length>1?`<div class="upgrade-targets">${current.next.map(target=>{
        const next=template.stages[target], selected=target===pendingUpgrade.target, cost=upgradeCost(card,target);
        return `<button class="upgrade-choice ${selected?"selected":""}" data-select-upgrade="${target}" type="button" ${canAfford(cost)?"":"disabled"}><span>${next.name}</span><strong>${expandedBundle(cost)}</strong></button>`;
      }).join("")}</div>`:""}
    <div class="upgrade-route">
      <div><span class="preview-label">Nyní</span>${renderPreviewCard(card,card.state)}</div>
      <span class="route-arrow" aria-hidden="true">→</span>
      <div><span class="preview-label">Po vylepšení</span>${renderPreviewCard(card,pendingUpgrade.target)}</div>
    </div>
    <div class="upgrade-confirm-bar"><button class="secondary-action" data-close-upgrade type="button">Zrušit</button><button class="upgrade-action confirm-upgrade" data-confirm-upgrade type="button">Potvrdit · ${expandedBundle(upgradeCost(card,pendingUpgrade.target))}</button></div>`;
}

function selectUpgradeTarget(target) {
  if (!pendingUpgrade) return;
  const card=getCard(pendingUpgrade.id), current=getStage(card);
  if (!current.next.includes(target)) return;
  pendingUpgrade.target=target;
  renderUpgradeDialog();
}

function confirmUpgrade() {
  if (!pendingUpgrade) return;
  const {id,target}=pendingUpgrade;
  upgrade(id,target);
}

function renderDialog() {
  const card=getCard(state.selectedCard); if(!card) return;
  const template=getTemplate(card), current=getStage(card);
  document.querySelector("#card-dialog-content").innerHTML = `
    <div class="dialog-header"><span class="eyebrow">${template.kind}</span><h2>${template.title}</h2><p>Aktuálně: ${current.name}. Všechny stavy můžeš bezpečně prohlížet.</p></div>
    <div class="stage-gallery">${template.stages.map((s,index)=>{
      const direct=current.next.includes(index), cost=direct?upgradeCost(card,index):null, active=index===card.state;
      return `<article class="stage-card ${active?"current":""} ${!active&&!direct?"unreachable":""}">
        <img src="${s.image}" alt="${s.name}" />
        <div class="stage-card-body"><span class="stage-label">${active?"Aktuální stav":`Stav ${index+1}`}</span><h3>${s.name}</h3>
        <div class="card-stats">${Object.values(s.production).some(Boolean)?`<span class="stat-chip">${expandedBundle(s.production)}</span>`:""}${s.fame?`<span class="stat-chip">★ ${s.fame}</span>`:""}</div>
        ${ruleVisible(card.template,index)?`<p>⚡ ${s.effect}</p>`:""}
        ${direct?`<button class="upgrade-action" data-upgrade-preview="${card.id}" data-target="${index}" ${canAfford(cost)?"":"disabled"}>Vylepšit · ${expandedBundle(cost)}</button>`:""}
        </div></article>`;
    }).join("")}</div>`;
}

function effectAvailable(card) {
  return (card.template === "forest" && card.state === 0) ||
    (card.template === "meadow" && card.state === 1) ||
    (card.template === "mountain" && card.state === 1) ||
    (card.template === "market" && card.state < 3) ||
    (card.template === "manor" && card.state > 0);
}

function ruleVisible(template,stateIndex) {
  const rules={meadow:[1,3],mountain:[1],forest:[0],manor:[1,2,3],market:[0,1,2,3],jungle:[0,2,3],expedition:[3]};
  return rules[template]?.includes(stateIndex) ?? false;
}

function stagePips(template,currentIndex,interactiveId=null) {
  const content=template.stages.map((_,i)=>`<span class="${i===currentIndex?"active":""}"></span>`).join("");
  return interactiveId===null?`<div class="state-pips">${content}</div>`:`<button class="state-pips" data-detail="${interactiveId}" type="button" aria-label="Prohlédnout všechny stavy karty">${content}</button>`;
}

function renderCardHeader(template,current,currentIndex,interactiveId=null) {
  return `<div class="card-header"><div class="card-header-row card-header-top"><span class="card-kind">${template.kind}</span>${stagePips(template,currentIndex,interactiveId)}</div><div class="card-header-row card-header-bottom"><h3>${current.name}</h3>${current.fame?`<strong class="card-points" aria-label="${current.fame} bodů">🏆${current.fame}</strong>`:""}</div></div>`;
}

function renderPreviewCard(card,stageIndex) {
  const template=getTemplate(card), current=template.stages[stageIndex], hasProduction=Object.values(current.production).some(Boolean);
  return `<article class="game-card preview-card">
    <img class="card-art-full" src="${current.image}" alt=""><div class="card-shade" aria-hidden="true"></div>
    ${renderCardHeader(template,current,stageIndex)}
    ${hasProduction?`<div class="production-space static-production">${expandedBundle(current.production)}</div>`:""}
    ${ruleVisible(card.template,stageIndex)?`<div class="effect-panel">⚡ ${current.effect}</div>`:""}
    ${current.next.length?`<div class="upgrade-panel static-upgrade"><span>⭐</span><strong>${current.next.length===1?expandedBundle(current.cost):"volba"}</strong></div>`:""}
  </article>`;
}

function renderCard(id) {
  const card=getCard(id), template=getTemplate(card), current=getStage(card), next=current.next;
  const hasProduction=Object.values(current.production).some(Boolean);
  const effectIsActive=effectAvailable(card);
  const affordableTargets=next.filter(target=>canAfford(upgradeCost(card,target)));
  const upgradeLabel=next.length===1?expandedBundle(upgradeCost(card,next[0])):next.map(target=>expandedBundle(upgradeCost(card,target))).join(" / ");
  return `<article class="game-card" data-card="${id}" draggable="true" aria-label="${current.name}">
    <img class="card-art card-art-full" src="${current.image}" alt="" />
    <div class="card-shade" aria-hidden="true"></div>
    ${renderCardHeader(template,current,card.state,id)}
    ${hasProduction?`<button class="production-space" data-produce="${id}" type="button" aria-label="Použít produkci: ${formatBundle(current.production)}">${productionIcons(current.production)}</button>`:""}
    ${ruleVisible(card.template,card.state)?effectIsActive?`<button class="effect-panel active-effect" data-effect="${id}" type="button">⚡ ${current.effect}</button>`:`<div class="effect-panel">⚡ ${current.effect}</div>`:""}
    ${next.length?`<button class="upgrade-panel" data-upgrade-preview="${id}" type="button" aria-label="Vylepšit za ${upgradeLabel}" ${affordableTargets.length?"":"disabled"}><span>⭐</span><strong>${upgradeLabel}</strong></button>`:""}
  </article>`;
}

function render() {
  document.querySelector("#round-value").textContent=state.round;
  document.querySelector("#turn-value").textContent=state.turn;
  document.querySelector("#deck-label").textContent=`${state.deck.length} ${state.deck.length===1?"karta":"karet"}`;
  document.querySelector("#discard-label").textContent=`${state.discard.length} ${state.discard.length===1?"karta":"karet"}`;
  document.querySelector("#deck-count").textContent=state.deck.length;
  document.querySelector("#discard-count").textContent=state.discard.length;
  const resourceBar=document.querySelector("#resources");
  const producedResources=Object.entries(R).flatMap(([key,r])=>Array.from({length:state.resources[key]},()=>`<span class="produced-resource" aria-label="${r.label}">${r.icon}</span>`)).join("");
  resourceBar.innerHTML=producedResources;
  resourceBar.setAttribute("aria-label",producedResources?`Nasbírané suroviny: ${formatBundle(state.resources)}`:"Nasbírané suroviny: žádné");
  resourceBar.classList.toggle("empty",!producedResources);
  const activeSlots=state.slots.map((id,index)=>({id,index})).filter(item=>item.id!==null);
  const playArea=document.querySelector("#play-area");
  playArea.classList.toggle("two-rows",activeSlots.length>maxColumns);
  playArea.style.setProperty("--max-columns",maxColumns);
  playArea.innerHTML=activeSlots.map(({id,index})=>`<div class="card-slot" data-slot="${index}">${renderCard(id)}</div>`).join("");
  requestAnimationFrame(updateCardSize);
  document.querySelector("#empty-state").hidden=activeIds().length>0;
  document.querySelector("#advance-button").disabled=state.busy||state.deck.length===0||firstEmptySlot()<0;
  document.querySelector("#pass-button").disabled=state.busy;
}

function updateCardSize() {
  const area=document.querySelector(".board-scroll"), grid=document.querySelector("#play-area");
  if (!area || !grid) return;
  const horizontal=Math.floor((area.clientWidth-4-(maxColumns-1)*10)/maxColumns);
  const width=Math.max(64,horizontal);
  const availableHeight=Math.max(120,area.parentElement.clientHeight);
  area.style.height=`${availableHeight}px`;
  area.style.overflowY="auto";
  grid.style.setProperty("--card-width",`${width}px`);
  const scale=Math.max(.52,width/178);
  grid.style.setProperty("--card-scale",String(scale));
  const metrics={
    cardRadius:12,headerHeight:56,headerGap:2,headerPadTop:7,headerPadSide:8,headerPadBottom:8,rowGap:7,
    kindFont:9,titleFont:13.5,pointsFont:10.7,pipsGap:3,pipsPad:2,pipSize:7,
    productionTop:60,productionHeight:42,productionPadY:6,productionPadX:8,productGap:2,productWidth:25,productHeight:27,productFont:16,
    effectSide:8,effectBottom:49,effectHeight:43,effectPadY:7,effectPadX:8,effectRadius:6,effectFont:10,
    upgradeSide:7,upgradeBottom:7,upgradeGap:4,upgradeHeight:34,upgradeMaxWidth:128,upgradePadY:5,upgradePadX:7,upgradeRadius:7,upgradeIcon:13.8,upgradeFont:11
  };
  Object.entries(metrics).forEach(([name,value])=>grid.style.setProperty(`--${name}`,`${value*scale}px`));
}

document.addEventListener("click", event => {
  const button=event.target.closest("button");
  if (button) {
    event.stopPropagation();
    if (button.dataset.produce) produce(Number(button.dataset.produce));
    if (button.dataset.effect) useEffect(Number(button.dataset.effect));
    if (button.dataset.upgradePreview) showUpgradeChoice(Number(button.dataset.upgradePreview),button.dataset.target===undefined?null:Number(button.dataset.target));
    if (button.dataset.selectUpgrade) selectUpgradeTarget(Number(button.dataset.selectUpgrade));
    if (button.dataset.selectDiscard) selectDiscardCard(Number(button.dataset.selectDiscard));
    if (button.dataset.selectRetrieve) selectRetrieveCard(Number(button.dataset.selectRetrieve));
    if (button.dataset.columns) {
      maxColumns=Number(button.dataset.columns);
      localStorage.setItem("patria-max-columns",String(maxColumns));
      document.querySelectorAll("[data-columns]").forEach(option=>option.classList.toggle("selected",Number(option.dataset.columns)===maxColumns));
      render();
    }
    if (button.hasAttribute("data-confirm-upgrade")) confirmUpgrade();
    if (button.hasAttribute("data-confirm-discard")) confirmDiscardChoice();
    if (button.hasAttribute("data-confirm-retrieve")) confirmRetrieveCard();
    if (button.hasAttribute("data-save-game")) saveGame();
    if (button.hasAttribute("data-open-library")) showLibrary();
    if (button.hasAttribute("data-prepare-round")) prepareNextRound();
    if (button.hasAttribute("data-shuffle-round")) shuffleAndStartRound();
    if (button.dataset.detail) showCard(Number(button.dataset.detail));
    if (button.hasAttribute("data-close-card")) document.querySelector("#card-dialog").close();
    if (button.hasAttribute("data-close-library")) document.querySelector("#library-dialog").close();
    if (button.hasAttribute("data-close-dialog")) closeDialogs();
    if (button.hasAttribute("data-close-upgrade")) closeDialogs();
    if (button.hasAttribute("data-close-choice")) { document.querySelector("#discard-choice-dialog").close(); pendingDiscard=null; }
    if (button.hasAttribute("data-close-discard-browser")) { document.querySelector("#discard-browser-dialog").close(); pendingDiscardBrowser=null; }
    if (!button.closest("#settings-menu") && button.id!=="settings-button") hideSettingsMenu();
    return;
  }
  if (!event.target.closest("#settings-menu")) hideSettingsMenu();
});
document.addEventListener("dragstart", event => {
  const card=event.target.closest?.("[data-card]");
  if (!card || state.busy) return event.preventDefault();
  draggingId=Number(card.dataset.card);
  event.dataTransfer.effectAllowed="move";
  event.dataTransfer.setData("text/plain",String(draggingId));
  requestAnimationFrame(()=>card.classList.add("dragging"));
});
document.addEventListener("dragend", () => {
  document.querySelectorAll(".dragging,.drag-over").forEach(element=>element.classList.remove("dragging","drag-over"));
  draggingId=null;
});
document.addEventListener("dragover", event => {
  const slot=event.target.closest?.("[data-slot]");
  if (!slot || draggingId===null) return;
  event.preventDefault();
  event.dataTransfer.dropEffect="move";
  document.querySelectorAll(".drag-over").forEach(element=>element.classList.remove("drag-over"));
  slot.classList.add("drag-over");
});
document.addEventListener("drop", event => {
  const slot=event.target.closest?.("[data-slot]");
  if (!slot || draggingId===null) return;
  event.preventDefault();
  const targetIndex=Number(slot.dataset.slot), sourceIndex=slotOf(draggingId);
  if (sourceIndex >= 0 && sourceIndex !== targetIndex) {
    const displaced=state.slots[targetIndex];
    state.slots[targetIndex]=draggingId;
    state.slots[sourceIndex]=displaced;
    render();
  }
  draggingId=null;
});
document.querySelector("#advance-button").addEventListener("click",advance);
document.querySelector("#pass-button").addEventListener("click",()=>{if(!state.busy)endTurn(false);});
document.querySelector("#restart-button").addEventListener("click",()=>{closeDialogs();newGame();});
document.querySelector("#rules-button").addEventListener("click",()=>{hideSettingsMenu();document.querySelector("#rules-dialog").showModal();});
document.querySelector("#settings-button").addEventListener("click",event=>{
  const menu=document.querySelector("#settings-menu"),open=menu.hidden;
  menu.hidden=!open;
  event.currentTarget.setAttribute("aria-expanded",String(open));
  document.querySelectorAll("[data-columns]").forEach(button=>button.classList.toggle("selected",Number(button.dataset.columns)===maxColumns));
});
document.querySelector("#discard-pile").addEventListener("click",()=>showDiscardBrowser());
document.querySelectorAll("dialog").forEach(dialog=>dialog.addEventListener("click",event=>{if(event.target===dialog){dialog.close();if(dialog.id==="discard-choice-dialog")pendingDiscard=null;if(dialog.id==="upgrade-dialog")pendingUpgrade=null;if(dialog.id==="discard-browser-dialog")pendingDiscardBrowser=null;}}));
window.addEventListener("resize",updateCardSize);

newGame();

