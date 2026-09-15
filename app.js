const R = {
  coin: { label: "Mince", icon: "🪙" },
  wood: { label: "Dřevo", icon: "🪵" },
  stone: { label: "Kámen", icon: "🪨" },
  metal: { label: "Kov", icon: "⚙️" },
  sword: { label: "Síla", icon: "⚔️" },
  goods: { label: "Zboží", icon: "📦" },
};

const art = (family, stage) => `assets/${family}-${stage}.jpg`;
const stage = (name, image, production = {}, cost = null, fame = 0, effect = "", next = [], extra = {}) => ({ name, image, production, cost, fame, effect, next, ...extra });

const templates = {
  meadow: {
    title: "Divoká tráva", kind: "Krajina",
    stages: [
      stage("Divoká tráva", art("meadow",1), {coin:1}, {coin:2}, 0, "", [1]),
      stage("Pláň", art("meadow",2), {coin:1}, {coin:3}, 0, "Odhoď tuto a jednu další přátelskou kartu: získej 2 mince.", [2], {action:"sacrifice-coin"}),
      stage("Obdělaná pole", art("meadow",3), {coin:2}, {wood:3}, 0, "", [3]),
      stage("Sýpky", art("meadow",4), {coin:2}, null, 3, "Zůstává ve hře.", [], {stays:true,kind:"Budova"}),
    ]
  },
  mountain: {
    title: "Vzdálená hora", kind: "Krajina",
    stages: [
      stage("Vzdálená hora", art("mountain",1), {coin:1}, {coin:2}, 0, "", [1]),
      stage("Skalnatá oblast", art("mountain",2), {stone:1}, {coin:2,wood:2}, 0, "Zaplať 1 minci a odhoď tuto kartu: získej 2 kameny.", [2], {action:"buy-stone"}),
      stage("Lom", art("mountain",3), {stone:2}, {coin:2,wood:2}, 0, "", [3]),
      stage("Mělký důl", art("mountain",4), {stone:1,metal:1}, null, 3, "Znič tuto kartu: objev kartu Důl 084 nebo 085.", [], {action:"discover-mine"}),
    ]
  },
  forest: {
    title: "Les", kind: "Krajina",
    stages: [
      stage("Les", art("forest",1), {wood:1}, null, 0, "Vykácej les: získej 3 dřeva a změň jej na Vykácený les.", [3], {action:"fell-forest"}),
      stage("Vykácený les", art("forest",2), {}, {coin:2,wood:1}, 0, "", [2]),
      stage("Dřevorubecká osada", art("forest",4), {wood:2}, null, 2, "", [], {kind:"Budova"}),
      stage("Posvátná studna", art("forest",3), {coin:1}, null, 2, "Znič tuto kartu: objev Svatyni 082 nebo 083.", [], {action:"discover-shrine",kind:"Budova"}),
    ],
    branchCosts: { 3: {stone:2} }
  },
  headquarters: {
    title: "Velitelství", kind: "Budova",
    stages: [
      stage("Velitelství", art("manor",1), {coin:1}, {stone:3,wood:1}, 0, "", [1]),
      stage("Radnice", art("manor",2), {sword:1}, {wood:2,stone:4}, 3, "Zahraj 1 krajinu z odhazovacího balíčku.", [2], {action:"retrieve", retrieveKinds:["Krajina"]}),
      stage("Pevnost", art("manor",3), {sword:1}, {wood:2,metal:1,stone:4}, 7, "Zahraj 1 krajinu nebo budovu z odhazovacího balíčku.", [3], {action:"retrieve", retrieveKinds:["Krajina","Budova"]}),
      stage("Hrad", art("manor",4), {sword:1}, null, 12, "Zahraj libovolnou kartu z odhazovacího balíčku.", [], {action:"retrieve", retrieveKinds:null}),
    ]
  },
  trader: {
    title: "Obchodník", kind: "Osoba",
    stages: [
      stage("Obchodník", art("market",1), {}, {coin:3}, 0, "Zaplať 1 minci a odhoď tuto kartu: získej 1 dřevo.", [1], {action:"trade", options:["wood"]}),
      stage("Bazar", art("market",2), {}, {coin:3}, 1, "Zaplať 1 minci: získej 1 dřevo nebo 1 kámen.", [2], {action:"trade", options:["wood","stone"],kind:"Budova"}),
      stage("Tržiště", art("market",3), {}, {coin:5}, 3, "Zaplať 1 minci: získej 1 dřevo, kámen nebo kov.", [3], {action:"trade", options:["wood","stone","metal"],kind:"Budova"}),
      stage("Slavnost", art("market",4), {}, null, 4, "Vyprodukuj 1 minci, dřevo, kámen nebo kov.", [], {action:"choose-production", options:["coin","wood","stone","metal"],kind:"Událost"}),
    ]
  },
  jungle: {
    title: "Džungle", kind: "Krajina",
    stages: [
      stage("Džungle", art("forest",1), {}, {coin:3}, 0, "Zaplať 1 minci: získej 1 dřevo.", [1], {action:"jungle-wood", amount:1}),
      stage("Obří stromy", art("forest",2), {wood:1}, {coin:3}, 0, "Zaplať 1 minci: získej 2 dřeva.", [2], {action:"jungle-wood", amount:2}),
      stage("Hluboká džungle", art("forest",3), {wood:2}, {coin:2,wood:2}, 0, "", [3]),
      stage("Domy v korunách", art("forest",4), {coin:1,wood:2}, null, 4, "Zůstává ve hře.", [], {stays:true,kind:"Budova"}),
    ]
  },
  river: {
    title: "Řeka", kind: "Krajina",
    stages: [
      stage("Řeka", art("meadow",1), {coin:1}, {wood:3}, 0, "", [1]),
      stage("Most", art("meadow",2), {coin:1}, {stone:3}, 2, "", [2]),
      stage("Kamenný most", art("meadow",3), {coin:1}, {coin:2}, 4, "", [3]),
      stage("Průzkumníci", art("meadow",4), {coin:1}, null, 4, "Odhoď a vrať kartu na stav Řeka: objev Pobřeží 071–074.", [], {action:"discover-shore-reset",kind:"Osoba"}),
    ]
  },
  workerChoice: {
    title:"Polní dělník / Sluha", kind:"Osoba", chooseOnDiscover:true,
    stages:[
      stage("Polní dělník",art("meadow",3),{},null,0,"Odhoď tuto kartu: získej produkci zvolené krajiny ve hře.",[],{action:"copy-production",targetKind:"Krajina"}),
      stage("Sluha",art("manor",1),{},null,0,"Odhoď tuto kartu: získej 1 minci, dřevo nebo kámen.",[],{action:"choose-production",options:["coin","wood","stone"]}),
    ]
  },
  banditWorker: {
    title:"Bandita", kind:"Nepřítel",
    stages:[stage("Bandita",art("market",2),{},null,-2,"Při vyložení blokuje přátelskou kartu produkující mince. Zaplať 1 sílu: znič Banditu a získej libovolné 2 suroviny.",[],{action:"defeat-bandit",onPlay:"block-coin"}),stage("Dělník",art("manor",2),{},null,0,"Odhoď tuto kartu: získej produkci zvolené budovy ve hře.",[],{action:"copy-production",targetKind:"Budova",kind:"Osoba"})]
  },
  banditField: {
    title:"Bandita", kind:"Nepřítel",
    stages:[stage("Bandita",art("market",2),{},null,-2,"Při vyložení blokuje přátelskou kartu produkující mince. Zaplať 1 sílu: znič Banditu a získej libovolné 2 suroviny.",[],{action:"defeat-bandit",onPlay:"block-coin"}),stage("Polní dělník",art("meadow",3),{},null,0,"Odhoď tuto kartu: získej produkci zvolené krajiny ve hře.",[],{action:"copy-production",targetKind:"Krajina",kind:"Osoba"})]
  },
  church: {
    title:"Kopec", kind:"Krajina",
    stages:[
      stage("Kopec",art("mountain",1),{coin:1},{coin:1,wood:1,stone:1},0,"",[1]),
      stage("Kaple",art("manor",1),{coin:1},{wood:2,stone:2},1,"Zaplať 3 mince a přivítej Misionáře.",[2],{action:"future-discovery",pay:{coin:3},future:"Misionář",discoverNumber:103,kind:"Budova"}),
      stage("Kostel",art("manor",3),{coin:1},{wood:2,metal:1,stone:4},3,"Zaplať 4 mince a přivítej Kněze.",[3],{action:"future-discovery",pay:{coin:4},future:"Kněz",discoverNumber:104,kind:"Budova"}),
      stage("Katedrála",art("manor",4),{coin:1},null,7,"Navíc produkuje 1 minci za každou osobu ve hře. Zůstává ve hře.",[],{stays:true,productionPerPerson:true,kind:"Budova"})
    ]
  },
  cliffs: {
    title:"Východní útesy",kind:"Krajina",
    stages:[
      stage("Východní útesy",art("mountain",1),{stone:1},null,0,"",[1,3]),
      stage("Kovárna",art("mountain",4),{metal:1},{coin:2,metal:2},1,"Vrať kartu na Východní útesy a objev Šperk 090.",[2],{action:"reset-discover",future:"Šperk 090",kind:"Budova"}),
      stage("Arzenál",art("manor",3),{metal:1},null,4,"Odhoď tuto kartu: získej 1 sílu za každou osobu ve hře.",[],{action:"strength-per-person",kind:"Budova"}),
      stage("Hradba",art("mountain",3),{sword:1},null,3,"Zůstává ve hře.",[],{stays:true,kind:"Budova"})
    ], branchCosts:{1:{stone:1,wood:1,metal:2},3:{stone:3}}
  },
  swamp: {
    title:"Bažina",kind:"Krajina",
    stages:[stage("Bažina",art("forest",1),{},{coin:1,wood:1},0,"",[1]),stage("Zpřístupněná bažina",art("forest",2),{},{coin:3},1,"",[2]),stage("Bažinná zahrada",art("forest",3),{coin:1},{coin:1,wood:2},3,"",[3]),stage("Exotické ovocné stromy",art("forest",4),{goods:2},null,4,"",[])]
  },
  lake: {
    title:"Jezero",kind:"Krajina",
    stages:[
      stage("Jezero",art("meadow",1),{coin:1},null,0,"",[1,3]),
      stage("Rybářská chata",art("manor",1),{coin:1},{wood:3},1,"",[2],{kind:"Budova"}),
      stage("Rybářská loď",art("meadow",4),{coin:2},null,1,"Objev Pobřeží 075.",[],{action:"future-discovery",future:"Pobřeží 075",kind:"Námořní"}),
      stage("Maják",art("manor",4),{},null,5,"Dokud je ve hře, můžeš odhazovat vrchní kartu dobíracího balíčku. Zůstává ve hře.",[],{action:"discard-top",stays:true,kind:"Budova"})
    ], branchCosts:{1:{stone:2,wood:1},3:{stone:4}}
  },
  legacyNotice:{title:"Začátek odkazu",kind:"Listina",stages:[stage("Začátek odkazu",art("manor",4),{},null,0,"Odemkne Úrodnou půdu, Armádu, Pokladnici a Export.",[])]},
  fertileDecree:{title:"Úrodná půda a efektivita",kind:"Listina",stages:[stage("Úrodná půda",art("meadow",3),{},null,0,"Na konci kola přidej produkci mince jedné krajině a zesil produkci jedné budovy.",[])]},
  army:{title:"Armáda",kind:"Permanentní",stages:[stage("Armáda",art("manor",3),{},null,0,"Utrať postupně 1 až 10 síly a získávej body. Akce ukončí tah.",[]),stage("Velká armáda",art("manor",4),{},null,50,"Pokračuj v budování armády až k celkové hodnotě 100 bodů.",[])]},
  treasury:{title:"Pokladnice",kind:"Permanentní",stages:[stage("Pokladnice",art("market",3),{},null,0,"Ukládej postupně 1 až 12 mincí. Akce ukončí tah.",[]),stage("Rozšířená pokladnice",art("market",4),{},null,50,"Pokračuj v naplňování pokladnice až k celkové hodnotě 100 bodů.",[])]},
  exportTrack:{title:"Export",kind:"Permanentní",stages:[stage("Export",art("market",2),{},null,0,"Kdykoli utrácej zboží a odemykej odměny mezi koly.",[]),stage("Masový export",art("market",4),{},null,25,"Pokračuj v exportu a odemykej další odměny.",[])]},
  volcano:{title:"Sopečná erupce",kind:"Událost",stages:[stage("Sopečná erupce",art("mountain",4),{},null,0,"Znič následující krajinu, kterou dohraješ. Poté se změň na Spáleniště.",[],{onPlay:"volcano"}),stage("Spáleniště",art("forest",1),{},{coin:2},-2,"",[2],{kind:"Krajina"}),stage("Mladý les",art("forest",2),{},null,1,"Ukonči tah a posuň růst. Po třech růstech produkuje 3 dřeva.",[],{kind:"Krajina",action:"grow-forest"}),stage("Obnovený les",art("forest",4),{wood:3},null,1,"",[],{kind:"Krajina"})]},
  opportunist:{title:"Prospěchář",kind:"Osoba",stages:[stage("Prospěchář",art("market",1),{coin:1},{},0,"Bezplatně změň povolání; je to vylepšení a ukončí tah.",[1,2]),stage("Rekrut",art("manor",2),{sword:1},{},0,"",[0,3]),stage("Dělník",art("mountain",2),{stone:1},{},0,"",[0,3]),stage("Domnělý šlechtic",art("manor",4),{},null,4,"Vylepši produkci jedné strany této karty.",[1,2],{action:"improve-self"})]},
  canyon:{title:"Západní kaňon",kind:"Krajina",stages:[stage("Západní kaňon",art("mountain",1),{},null,0,"Vyprodukuj kámen nebo kov.",[1,3],{action:"choose-production",options:["stone","metal"]}),stage("Horníci",art("mountain",2),{stone:1,metal:1},{sword:2},2,"Může se počítat jako jedna nebo dvě osoby.",[2],{kind:"Osoba"}),stage("Stát nucených prací",art("mountain",4),{stone:2,metal:2},null,-3,"",[],{kind:"Stát"}),stage("Hradba",art("mountain",3),{sword:2},null,3,"Zůstává ve hře.",[],{kind:"Budova",stays:true})],branchCosts:{1:{stone:1,metal:1,coin:1,wood:1},3:{stone:3}}},
  shore:{title:"Pobřeží",kind:"Krajina",stages:[stage("Pobřeží",art("meadow",1),{coin:1},{wood:3,coin:1},0,"",[1]),stage("Loděnice",art("manor",1),{},null,3,"Vyprodukuj minci nebo dřevo.",[2],{kind:"Budova",action:"choose-production",options:["coin","wood"]}),stage("Obchodní loď",art("meadow",4),{},null,6,"Vyprodukuj minci, dřevo nebo zboží.",[3],{kind:"Námořní",action:"choose-production",options:["coin","wood","goods"]}),stage("Obchodní trasa",art("market",4),{},null,13,"Vyprodukuj minci, dřevo, kov nebo zboží. Při vyložení objev Piráta 076.",[],{kind:"Námořní",action:"choose-production",options:["coin","wood","metal","goods"],onPlay:"discover-pirate"})]},
  pirate:{title:"Pirát",kind:"Nepřítel",stages:[stage("Pirát",art("market",2),{}, {coin:4,metal:1},-2,"Sniž každé získání mincí o 1. Zaplať 1 sílu: znič Piráta a objev Lagunu 077.",[1],{stays:true,action:"defeat-pirate"}),stage("Zkušený spojenec",art("market",3),{},null,3,"Vyprodukuj sílu nebo kov; místo toho můžeš objevit Výpravu za pokladem 093.",[],{kind:"Osoba · Námořní",action:"pirate-ally"})]},
  lagoon:{title:"Laguna",kind:"Krajina",stages:[stage("Laguna",art("forest",3),{coin:1},null,0,"",[1,3]),stage("Vor",art("meadow",4),{},null,0,"",[2],{kind:"Námořní"}),stage("Bujný ostrov",art("forest",4),{goods:1,coin:2},null,1,"",[],{kind:"Krajina · Námořní"}),stage("Mořská brána",art("manor",3),{sword:1},null,3,"Zahraj námořní kartu z odhazovacího balíčku.",[],{kind:"Budova",action:"retrieve",retrieveKinds:["Námořní"]})],branchCosts:{1:{wood:3},3:{goods:1,stone:2}}},
  shrine:{title:"Svatyně",kind:"Budova",stages:[stage("Svatyně",art("forest",1),{},{coin:3},3,"Na konci tahu odhoď: 1 jiná karta zůstane ve hře.",[1]),stage("Útočiště",art("forest",2),{},{coin:3,stone:2},5,"Na konci tahu odhoď: až 2 jiné karty zůstanou ve hře.",[2]),stage("Oratoř",art("forest",3),{},{coin:2,wood:2},6,"Na konci tahu odhoď: až 3 jiné karty zůstanou ve hře.",[3]),stage("Chrám",art("forest",4),{},null,15,"Na konci tahu odhoď: až 4 jiné karty zůstanou ve hře.",[])]},
  mine:{title:"Důl",kind:"Budova",stages:[stage("Důl",art("mountain",1),{stone:1,metal:1},{wood:3},4,"",[1]),stage("Hluboký důl",art("mountain",2),{stone:1,metal:2},{wood:3,coin:2},9,"",[2]),stage("Rubínový důl",art("mountain",3),{stone:1,metal:2,goods:1},{coin:2,wood:2,stone:2},6,"",[3]),stage("Diamantový důl",art("mountain",4),{stone:1,metal:2,goods:2},null,13,"",[])]},
  missionary:{title:"Misionář",kind:"Osoba",stages:[stage("Misionář",art("manor",1),{}, {coin:3},0,"Zaplať 3 mince a přivítej Banditu mezi své lidi.",[1],{action:"convert-bandit"}),stage("Včelař",art("meadow",3),{coin:1},{},2,"Posuň včelaření; po čtvrtém použití přidej 1 minci k produkci.",[0],{action:"beekeeper"})]},
  priest:{title:"Kněz",kind:"Osoba",stages:[stage("Kněz",art("manor",2),{}, {coin:6,goods:2},0,"Zaplať 2 mince a vylepši kartu za běžnou cenu; tah nekončí.",[1],{action:"priest-upgrade"}),stage("Kardinál",art("manor",4),{},null,5,"Vylepši kartu za běžnou cenu; tah nekončí.",[],{action:"cardinal-upgrade"})]},
  dubbing:{title:"Pasování",kind:"Událost",stages:[stage("Pasování",art("manor",3),{},null,0,"Na konci kola přidej osobě produkci síly a bodový bonus; poté se změň na Renovaci.",[1],{stays:true}),stage("Renovace",art("manor",4),{},null,0,"Na konci kola vylepši produkci jedné budovy a tuto kartu znič.",[],{stays:true})]},
  jewelry:{title:"Klenotnictví",kind:"Permanentní",stages:[stage("Klenotnictví",art("market",4),{},null,0,"Utrácej postupně 1 až 10 kovů; každá značka přidá 5 zboží a zvyšuje bodovou hodnotu.",[])]},
  treasure:{title:"Výprava za pokladem",kind:"Námořní",stages:[stage("Výprava za pokladem",art("meadow",4),{}, {coin:1,wood:1,metal:1},0,"",[1]),stage("Pirátská zátoka",art("market",2),{},null,0,"Při vyložení objev Podrazáka nebo Krvavou kletbu 094.",[2],{onPlay:"discover-curse"}),stage("Mapa pokladu",art("meadow",3),{coin:1},null,5,"",[3]),stage("Pirátský poklad",art("market",4),{coin:2},null,15,"",[],{kind:"Předmět"})]},
  curseChoice:{title:"Podrazák / Krvavá kletba",kind:"Nepřítel",chooseOnDiscover:true,stages:[stage("Podrazák",art("market",2),{},null,-4,"Při vyložení odhoď 2 osoby. Zaplať 4 síly: znič tuto kartu.",[],{action:"defeat-backstabber",onPlay:"discard-persons"}),stage("Krvavá kletba",art("forest",1),{},null,0,"Když dobereš 2 karty, dober další 2.",[],{kind:"Událost"})]},
  royalChoice:{title:"Královská návštěva / Inkvizitor",kind:"Událost",chooseOnDiscover:true,stages:[stage("Královská návštěva",art("manor",4),{},null,2,"Odhoď: trvale sniž jednu cenu vylepšení ve hře o 1 surovinu.",[],{action:"reduce-upgrade"}),stage("Inkvizitor",art("manor",2),{coin:1},null,0,"Znič tuto kartu: znič jednu negativní kartu ve hře.",[],{kind:"Osoba",action:"destroy-negative"})]},
  tradeRelations:{title:"Obchodní vztahy",kind:"Permanentní",stages:[stage("Obchodní vztahy",art("market",4),{},null,0,"Utrať 3 zboží: získej libovolnou 1 surovinu.",[],{action:"trade-relations"})]},
  vassal:{title:"Pohraniční země",kind:"Nepřítel · Krajina",stages:[stage("Pohraniční země",art("mountain",4),{}, {sword:10},0,"Utrácej sílu a trvale sniž cenu dobytí.",[1]),stage("Okupace",art("mountain",3),{}, {sword:9},0,"Pokračuj v dobývání.",[2],{kind:"Událost"}),stage("Nepoddajná města",art("manor",3),{}, {sword:8},0,"Po vylepšení zapiš 20 bodů na poslední stav.",[3],{kind:"Krajina"}),stage("Vazalské státy",art("meadow",4),{},null,20,"Resetuj kartu a můžeš ji dobývat znovu.",[0],{kind:"Krajina",action:"reset-vassal"})]}
};

const initialCards = ["meadow","meadow","meadow","meadow","mountain","mountain","forest","forest","headquarters","trader"].map((template,index)=>({number:index+1,template}));
const discoveryQueue = ["jungle","river","workerChoice","banditWorker","mountain","banditField","church","cliffs","forest","swamp","swamp","lake"].map((template,index)=>({number:index+11,template})).concat([{number:23,template:"legacyNotice"},{number:28,template:"volcano"},{number:29,template:"opportunist"}]);
const catalog={23:"legacyNotice",24:"fertileDecree",25:"army",26:"treasury",27:"exportTrack",28:"volcano",29:"opportunist",71:"mountain",72:"forest",73:"canyon",74:"shore",75:"shore",76:"pirate",77:"lagoon",82:"shrine",83:"shrine",84:"mine",85:"mine",86:"dubbing",90:"jewelry",93:"treasure",94:"curseChoice",103:"missionary",104:"priest",107:"royalChoice",117:"tradeRelations",135:"vassal"};
const PERMANENT_TRACKS={
  25:{resource:"sword",costs:[1,2,3,4,5,6,7,8,9,10,10,10,12,12,15],rewards:[1,4,7,10,14,19,25,32,40,50,60,70,80,90,100],flipAfter:10},
  26:{resource:"coin",costs:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],rewards:[1,2,3,5,7,10,14,19,25,32,40,50,60,70,80,90,100],flipAfter:12},
  27:{resource:"goods",thresholds:[10,20,30,40,55,75,100,125,150,175,200,250,300,350],labels:["Posílit krajinu","Posílit osobu","Objevit Pasování","Posílit budovu","Posílit přátelskou kartu","Výrazně posílit kartu","Otočit Export","Posílit dvě krajiny","Výrazně posílit osobu","Objevit Královskou návštěvu","Výrazně posílit budovu","Posílit jiný permanent","Posílit všechny jiné permanenty","Objevit Obchodní vztahy"]}
};

let state;
let toastTimer;
let draggingId = null;
let pendingUpgrade = null;
let pendingDiscard = null;
let pendingDiscardBrowser = null;
let pendingActionChoice = null;
let selectedBanditLink = null;
let roundTransitionContext = null;
const savedColumns = Number(localStorage.getItem("patria-max-columns"));
let maxColumns = [4,6,8].includes(savedColumns) ? savedColumns : 6;
let showCardNumbers = localStorage.getItem("patria-show-card-numbers") === "true";
const savedProductionConfirmation=localStorage.getItem("patria-confirm-production");
let confirmProductionSetting=savedProductionConfirmation===null?(matchMedia("(pointer: coarse)").matches||innerWidth<760):savedProductionConfirmation==="true";

function newGame() {
  state = {
    round: 1, turn: 1,
    resources: emptyResources(),
    cards: initialCards.map(spec => ({ id: spec.number, number: spec.number, template: spec.template, state: 0 })),
    deck: [], slots: Array(80).fill(null), discard: [], inactive: new Set(), blocked: {}, busy: false,
    permanents: [], specials: [],
    discoveries: discoveryQueue.map(spec=>({...spec})),
    history: ["Panství bylo založeno. První kolo začíná."],
    selectedCard: null, decreePending:null,
  };
  startRound();
}

function emptyResources() { return Object.fromEntries(Object.keys(R).map(k => [k,0])); }
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}
function getCard(id) { return state.cards.find(card => card.id === id) || state.permanents.find(card => card.id === id) || state.specials.find(card => card.id === id); }
function getTemplate(card) { return templates[card.template]; }
function getStage(card) { return getTemplate(card).stages[card.state]; }
function getKind(card,stageIndex=card.state){const template=getTemplate(card);return template.stages[stageIndex].kind||template.kind;}
function formatBundle(bundle = {}) { return Object.entries(bundle).filter(([,v])=>v).map(([k,v])=>`${R[k].icon} ${v}`).join("  ") || "—"; }
function expandedBundle(bundle = {}) { return Object.entries(bundle||{}).flatMap(([key,value])=>Array.from({length:value},()=>R[key].icon)).join("") || "—"; }
function productionIcons(bundle = {}) { return Object.entries(bundle).flatMap(([key,value])=>Array.from({length:value},()=>`<span class="production-item" aria-hidden="true">${R[key].icon}</span>`)).join(""); }
function canAfford(cost = {}) { return Object.entries(cost).every(([k,v]) => state.resources[k] >= v); }
function spend(cost = {}) { Object.entries(cost).forEach(([k,v]) => state.resources[k] -= v); }
function gain(bundle = {}) { Object.entries(bundle).forEach(([k,v]) => state.resources[k] += v); }
function getProduction(card,stageIndex=card.state){const base=getTemplate(card).stages[stageIndex].production||{},bonus=card.productionBonus?.[stageIndex]||{};const merged={...base};Object.entries(bonus).forEach(([key,value])=>merged[key]=(merged[key]||0)+value);return merged;}
function addHistory() {}
function notify(text) { const el=document.querySelector("#toast"); el.textContent=text; el.classList.add("visible"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("visible"),2200); }
function activeIds() { return state.slots.filter(id => id !== null); }
function slotOf(id) { return state.slots.indexOf(id); }
function firstEmptySlot() { return state.slots.findIndex(id => id === null); }
function installPermanent(number) {
  if (state.permanents.some(card=>card.number===number) || !catalog[number]) return null;
  const card={id:number,number,template:catalog[number],state:0,permanent:true,value:0,marks:0};
  state.permanents.push(card);
  return card;
}
function discoverCard(number) {
  if (!catalog[number] || getCard(number)) return null;
  if ([25,26,27,90,117].includes(number)) return installPermanent(number);
  const card={id:number,number,template:catalog[number],state:0};
  state.cards.push(card);
  state.discard.push(card.id);
  return card;
}

function startRound() {
  state.resources = emptyResources();
  state.slots = Array(80).fill(null);
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
  queueBanditBlocks(drawn);
}

function drawCards(count, loseResources = true) {
  if (loseResources) state.resources = emptyResources();
  const waitingVolcano=activeIds().find(id=>getCard(id).template==="volcano"&&getCard(id).state===0);
  const drawn=[];
  for (let i=0; i<count && state.deck.length; i++) {
    const slot=firstEmptySlot();
    if (slot < 0) break;
    const id=state.deck.shift();
    state.slots[slot]=id;
    drawn.push(id);
  }
  if(waitingVolcano){
    const lands=drawn.filter(id=>getKind(getCard(id)).includes("Krajina"));
    if(lands.length===1)resolveVolcano(waitingVolcano,lands[0]);
    else if(lands.length>1)setTimeout(()=>{pendingActionChoice={type:"volcano",sourceId:waitingVolcano,choices:lands,selectedId:null};renderActionChoice();},0);
  }
  return drawn;
}

function resolveVolcano(volcanoId,landId){
  const volcano=getCard(volcanoId),land=getCard(landId);if(!volcano||!land)return;
  destroyCard(landId);volcano.state=1;discardCard(volcanoId);notify(`${getStage(land).name} zanikla při sopečné erupci.`);
}

function destroyCard(id) {
  const slot=slotOf(id); if(slot>=0) state.slots[slot]=null;
  state.deck=state.deck.filter(cardId=>cardId!==id);
  state.discard=state.discard.filter(cardId=>cardId!==id);
  state.cards=state.cards.filter(card=>card.id!==id);
  delete state.blocked[id];
  Object.keys(state.blocked).forEach(cardId=>{if(state.blocked[cardId]===id)delete state.blocked[cardId];});
}

function discardCard(id) {
  const slot=slotOf(id);
  if (slot >= 0) state.slots[slot]=null;
  state.inactive.delete(id);
  delete state.blocked[id];
  Object.keys(state.blocked).forEach(cardId=>{if(state.blocked[cardId]===id)delete state.blocked[cardId];});
  if (!state.discard.includes(id)) state.discard.push(id);
}

function produce(id) {
  const card=getCard(id), production=getProduction(card);
  if (state.busy || slotOf(id) < 0 || state.blocked[id] || !Object.values(production).some(Boolean)) return;
  if(!confirmProductionSetting)return confirmProduction(id);
  pendingActionChoice={type:"production",sourceId:id};
  renderActionChoice();
}

async function confirmProduction(id) {
  const card=getCard(id), current=card?getStage(card):null;
  if(state.busy||!card||slotOf(id)<0||state.blocked[id]||!Object.values(getProduction(card)).some(Boolean))return;
  state.busy=true;
  const production={...getProduction(card)};
  if(current.productionPerPerson) production.coin=(production.coin||0)+activeIds().filter(otherId=>otherId!==id&&getKind(getCard(otherId))==="Osoba").length;
  gain(production);
  await animateDiscard([id]);
  discardCard(id);
  state.busy=false;
  render();
}

async function useEffect(id,forcedAction=null) {
  if (state.busy || state.inactive.has(id) || slotOf(id) < 0) return;
  const card=getCard(id), current=getStage(card), action=forcedAction||current.action;
  if (action === "sacrifice-coin") {
    const choices=activeIds().filter(otherId => otherId !== id);
    if (!choices.length) return notify("Potřebuješ další aktivní kartu.");
    pendingDiscard={sourceId:id,selectedId:choices[0]};
    renderDiscardChoice();
    document.querySelector("#discard-choice-dialog").showModal();
    return;
  }
  if (action === "retrieve") {
    const eligible=[...state.discard].reverse().filter(otherId=>{
      const other=getCard(otherId), kind=getKind(other);
      return current.retrieveKinds===null || current.retrieveKinds.includes(kind);
    });
    if (!eligible.length) return notify("V odhazovacím balíčku není vhodná karta.");
    showDiscardBrowser(id,eligible);
    return;
  }
  state.busy=true;
  if (action === "fell-forest") {
    gain({wood:3}); card.state=1; await animateDiscard([id]); discardCard(id); state.busy=false; render(); return;
  }
  if (action === "buy-stone") {
    if (!canAfford({coin:1})) { state.busy=false; return notify("Chybí 1 mince."); }
    spend({coin:1}); gain({stone:2}); await animateDiscard([id]); discardCard(id); state.busy=false; render(); return;
  }
  if (action === "trade" || action === "choose-production") { state.busy=false; return showResourceChoice(id,current.options,1,{pay:action==="trade"?{coin:1}:null,discard:true}); }
  if (action === "jungle-wood") {
    if(!canAfford({coin:1})){state.busy=false;return notify("Chybí 1 mince.");}
    spend({coin:1});gain({wood:current.amount});await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="copy-production") { state.busy=false; return showCardTargetChoice(id,current.targetKind); }
  if(action==="defeat-bandit") {
    if(!canAfford({sword:1})){state.busy=false;return notify("Chybí 1 síla.");}
    state.busy=false;return showResourceChoice(id,Object.keys(R),2,{pay:{sword:1},destroy:true});
  }
  if(action==="convert-bandit") {
    const missionaryId=activeIds().find(otherId=>getCard(otherId).template==="missionary"&&getCard(otherId).state===0);
    const bandit=card.template==="banditWorker"||card.template==="banditField"?card:activeIds().map(getCard).find(other=>(other.template==="banditWorker"||other.template==="banditField")&&other.state===0);
    if(!missionaryId||!bandit){state.busy=false;return notify("Misionář a Bandita musí být současně ve hře.");}
    if(!canAfford({coin:3})){state.busy=false;return notify("Chybí 3 mince.");}
    spend({coin:3});bandit.state=1;delete state.blocked[bandit.id];Object.keys(state.blocked).forEach(victim=>{if(state.blocked[victim]===bandit.id)delete state.blocked[victim];});
    await animateDiscard([missionaryId,bandit.id]);discardCard(missionaryId);discardCard(bandit.id);state.busy=false;render();return endTurn(false);
  }
  if(current.action==="strength-per-person") {
    gain({sword:activeIds().filter(otherId=>otherId!==id&&getKind(getCard(otherId))==="Osoba").length});await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(current.action==="discard-top") {
    if(!state.deck.length){state.busy=false;return notify("Dobírací balíček je prázdný.");}
    state.discard.push(state.deck.shift());state.busy=false;render();return;
  }
  if(current.action==="reset-discover"||current.action==="discover-shore-reset") {
    if(current.action==="discover-shore-reset") { state.busy=false;return showDiscoveryChoice(id,[71,72,73,74],{resetState:2,discard:true}); }
    const number=Number(current.future?.match(/\d+/)?.[0]);if(number)discoverCard(number);
    card.state=0;await animateDiscard([id]);discardCard(id);state.busy=false;render();notify(`${current.future} byla objevena.`);return;
  }
  if(action==="future-discovery") {
    if(current.pay&&!canAfford(current.pay)){state.busy=false;return notify(`Chybí suroviny: ${formatBundle(current.pay)}.`);}
    if(current.pay)spend(current.pay);const number=current.discoverNumber||Number(current.future?.match(/\d+/)?.[0]);if(number)discoverCard(number);await animateDiscard([id]);discardCard(id);state.busy=false;render();notify(`${current.future} přichází do tvého panství.`);return;
  }
  if(current.action==="discover-mine"||current.action==="discover-shrine") {
    state.busy=false;return showDiscoveryChoice(id,current.action==="discover-mine"?[84,85]:[82,83],{destroy:true});
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

function openActionChoice(html){document.querySelector("#action-choice-content").innerHTML=html;const dialog=document.querySelector("#action-choice-dialog");if(!dialog.open)dialog.showModal();}
function showResourceChoice(sourceId,options,count,after={}){
  pendingActionChoice={type:"resources",sourceId,options,count,selected:[],after};
  renderActionChoice();
}
function showCardTargetChoice(sourceId,targetKind){
  const choices=activeIds().filter(id=>id!==sourceId&&getKind(getCard(id)).includes(targetKind)&&Object.values(getProduction(getCard(id))).some(Boolean));
  if(!choices.length)return notify(`Ve hře není vhodná karta typu ${targetKind.toLowerCase()}.`);
  pendingActionChoice={type:"card",sourceId,choices,selectedId:choices[0]};renderActionChoice();
}
function showDiscoveryChoice(sourceId,numbers,after={}) {
  const choices=numbers.filter(number=>catalog[number]&&!getCard(number));
  if(!choices.length)return notify("Všechny navazující karty už byly objeveny.");
  pendingActionChoice={type:"discover",sourceId,choices,selectedId:null,after};renderActionChoice();
}
function showDecreeChoice(step){
  const choices=state.cards.filter(card=>step==="land"?getKind(card).includes("Krajina"):getKind(card).includes("Budova")&&Object.values(getProduction(card)).some(Boolean)).map(card=>card.id);
  if(!choices.length){if(step==="land")return showDecreeChoice("building");state.decreePending=null;return;}
  state.decreePending=step;pendingActionChoice={type:"decree",step,choices,selectedId:null,selectedResource:null};renderActionChoice();
}
function queueBanditBlocks(drawnIds){
  const bandits=drawnIds.filter(id=>getCard(id)&&getStage(getCard(id)).onPlay==="block-coin");
  if(!bandits.length)return;
  const sourceId=bandits[0],choices=activeIds().filter(id=>id!==sourceId&&!state.blocked[id]&&(getStage(getCard(id)).production.coin||0)>0);
  if(!choices.length)return;
  pendingActionChoice={type:"block",sourceId,choices,selectedId:null,remainingBandits:bandits.slice(1)};renderActionChoice();
}
function renderActionChoice(){
  if(!pendingActionChoice)return;
  if(pendingActionChoice.type==="production"){
    const card=getCard(pendingActionChoice.sourceId),current=getStage(card);
    openActionChoice(`<div class="production-confirm"><strong>Suroviny: ${expandedBundle(getProduction(card))}</strong><button class="upgrade-action" data-confirm-action-choice type="button">Využít</button></div>`);
  } else if(pendingActionChoice.type==="resources"){
    const remaining=pendingActionChoice.count-pendingActionChoice.selected.length;
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Volba surovin</span><h2>${remaining?`Vyber ještě ${remaining}`:"Volba je připravena"}</h2><p>${pendingActionChoice.selected.map(key=>R[key].icon).join(" ")||"Můžeš zvolit i stejnou surovinu vícekrát."}</p></div><div class="resource-choice-grid">${pendingActionChoice.options.map(key=>`<button data-pick-resource="${key}" type="button">${R[key].icon}<span>${R[key].label}</span></button>`).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${remaining?"disabled":""}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="export") {
    const choice=pendingActionChoice;
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Odměna Exportu</span><h2>Vyber kartu k posílení</h2></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${id===choice.selectedId?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div>${choice.selectedId&&choice.config.resources?`<div class="resource-choice-grid decree-resources">${choice.config.resources.map(key=>`<button class="${choice.selectedResource===key?"selected":""}" data-pick-resource="${key}" type="button">${R[key].icon}<span>${R[key].label}</span></button>`).join("")}</div>`:""}<div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${!choice.selectedId||(choice.config.resources&&!choice.selectedResource)?"disabled":""}>Použít odměnu</button></div>`);
  } else if(pendingActionChoice.type==="volcano") {
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Sopečná erupce</span><h2>Která krajina bude zničena?</h2><p>Obě karty přišly současně, proto volíš ty.</p></div><div class="discard-choices">${pendingActionChoice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${id===pendingActionChoice.selectedId?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${pendingActionChoice.selectedId?"":"disabled"}>Zničit zvolenou krajinu</button></div>`);
  } else if(pendingActionChoice.type==="decree") {
    const choice=pendingActionChoice,selected=choice.selectedId?getCard(choice.selectedId):null,resources=selected?Object.keys(getProduction(selected)).filter(key=>getProduction(selected)[key]>0):[];
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Nové období</span><h2>${choice.step==="land"?"Úrodná půda":"Efektivita"}</h2><p>${choice.step==="land"?"Vyber krajinu, která bude odteď produkovat navíc 1 minci.":"Vyber budovu a surovinu, jejíž produkci trvale zvýšíš o 1."}</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${id===choice.selectedId?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div>${choice.step==="building"&&selected?`<div class="resource-choice-grid decree-resources">${resources.map(key=>`<button class="${choice.selectedResource===key?"selected":""}" data-pick-resource="${key}" type="button">${R[key].icon}<span>${R[key].label}</span></button>`).join("")}</div>`:""}<div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${!choice.selectedId||(choice.step==="building"&&!choice.selectedResource)?"disabled":""}>Potvrdit posílení</button></div>`);
  } else if(pendingActionChoice.type==="discover") {
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Objev</span><h2>Vyber navazující kartu</h2><p>Prohlédni si celou kartu a potvrď svou volbu.</p></div><div class="discard-choices">${pendingActionChoice.choices.map(number=>{const card={id:number,number,template:catalog[number],state:0};return `<button class="full-card-choice ${number===pendingActionChoice.selectedId?"selected":""}" data-select-action-card="${number}" type="button">${renderPreviewCard(card,0)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${pendingActionChoice.selectedId?"":"disabled"}>Objevit kartu</button></div>`);
  } else {
    const blocking=pendingActionChoice.type==="block";
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">${blocking?"Bandita":"Volba karty"}</span><h2>${blocking?"Kterou kartu Bandita zablokuje?":"Kterou produkci chceš získat?"}</h2>${blocking?"<p>Volba je povinná. Bandita nic nezvolí automaticky.</p>":""}</div><div class="discard-choices">${pendingActionChoice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${id===pendingActionChoice.selectedId?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar">${blocking?"":`<button class="secondary-action" data-close-action-choice type="button">Zrušit</button>`}<button class="upgrade-action" data-confirm-action-choice type="button" ${blocking&&!pendingActionChoice.selectedId?"disabled":""}>${blocking?"Zablokovat kartu":"Použít produkci"}</button></div>`);
  }
}
function pickResource(key){if(pendingActionChoice?.type==="export"&&pendingActionChoice.config.resources?.includes(key)){pendingActionChoice.selectedResource=key;renderActionChoice();return;}if(pendingActionChoice?.type==="decree"&&pendingActionChoice.step==="building"){if(Object.keys(getProduction(getCard(pendingActionChoice.selectedId))).includes(key)){pendingActionChoice.selectedResource=key;renderActionChoice();}return;}if(!pendingActionChoice||pendingActionChoice.type!=="resources"||!pendingActionChoice.options.includes(key)||pendingActionChoice.selected.length>=pendingActionChoice.count)return;pendingActionChoice.selected.push(key);renderActionChoice();}
function selectActionCard(id){if(!pendingActionChoice?.choices?.includes(id))return;pendingActionChoice.selectedId=id;if(["decree","export"].includes(pendingActionChoice.type))pendingActionChoice.selectedResource=null;renderActionChoice();}
async function confirmActionChoice(){
  if(!pendingActionChoice||state.busy)return;
  const choice=pendingActionChoice;
  if(choice.type==="export"){
    if(!choice.selectedId||(choice.config.resources&&!choice.selectedResource))return;const target=getCard(choice.selectedId);
    if(choice.config.resources){target.productionBonus??={};target.productionBonus[target.state]??={};target.productionBonus[target.state][choice.selectedResource]=(target.productionBonus[target.state][choice.selectedResource]||0)+1;}else target.fameBonus=(target.fameBonus||0)+choice.config.fame;
    markExportClaim(choice.threshold);document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();return;
  }
  if(choice.type==="decree"){
    if(!choice.selectedId||(choice.step==="building"&&!choice.selectedResource))return;
    const target=getCard(choice.selectedId),key=choice.step==="land"?"coin":choice.selectedResource;target.productionBonus??={};target.productionBonus[target.state]??={};target.productionBonus[target.state][key]=(target.productionBonus[target.state][key]||0)+1;
    document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();if(choice.step==="land")showDecreeChoice("building");else{state.decreePending=null;const shuffle=document.querySelector("[data-shuffle-round]");if(shuffle)shuffle.disabled=false;}return;
  }
  const source=getCard(choice.sourceId);if(!source||slotOf(source.id)<0)return;
  if(choice.type==="volcano"){if(!choice.selectedId)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;resolveVolcano(source.id,choice.selectedId);render();return;}
  if(choice.type==="production"){document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;return confirmProduction(source.id);}
  if(choice.type==="resources"&&choice.selected.length!==choice.count)return;
  if(choice.type==="block"&&!choice.selectedId)return;
  if(choice.type==="discover"&&!choice.selectedId)return;
  if(choice.after?.pay&&!canAfford(choice.after.pay))return notify(`Chybí suroviny: ${formatBundle(choice.after.pay)}.`);
  document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;
  if(choice.type==="block"){
    state.blocked[choice.selectedId]=choice.sourceId;state.busy=false;render();
    if(choice.remainingBandits?.length)queueBanditBlocks(choice.remainingBandits);
    return;
  }
  if(choice.type==="discover") {
    discoverCard(choice.selectedId);if(choice.after?.resetState!==undefined)source.state=choice.after.resetState;
    await animateDiscard([source.id]);if(choice.after?.destroy)destroyCard(source.id);else if(choice.after?.discard)discardCard(source.id);
    state.busy=false;render();notify(`Karta ${String(choice.selectedId).padStart(3,"0")} byla objevena.`);return;
  }
  if(choice.after?.pay)spend(choice.after.pay);
  if(choice.type==="resources")choice.selected.forEach(key=>gain({[key]:1}));
  else gain(getProduction(getCard(choice.selectedId)));
  await animateDiscard([source.id]);
  if(choice.after?.destroy)destroyCard(source.id);else discardCard(source.id);
  state.busy=false;render();
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
  if (template.branchCosts?.[target]) return template.branchCosts[target];
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
    if (getStage(card).stays) staying.push(id);
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
  const exportCard=state.permanents.find(card=>card.number===27);
  const exportRewards=exportCard?PERMANENT_TRACKS[27].thresholds.filter(threshold=>exportCard.value>=threshold&&!exportCard.claimed?.includes(threshold)):[];
  document.querySelector("#round-finished").textContent=`Kolo ${finished} dokončeno`;
  document.querySelector("#round-next").textContent="Panství uzavírá právě skončené období";
  document.querySelector("#round-transition-body").innerHTML=`
    <div class="round-rest-panel">
      <p>Než připravíš další kolo, můžeš si projít své karty nebo uložit současný stav hry.</p>
      <div class="round-rest-actions">
        ${exportRewards.map(threshold=>`<button class="secondary-action" data-export-reward="${threshold}" type="button">📦 Uplatnit odměnu za ${threshold}</button>`).join("")}
        <button class="secondary-action" data-save-game type="button">💾 Uložit hru</button>
        <button class="secondary-action" data-open-library type="button">▦ Knihovna karet</button>
        <button class="round-primary-action" data-prepare-round type="button">Začít další kolo →</button>
      </div>
    </div>`;
  overlay.className="round-transition phase-intermission";
  overlay.hidden=false;
  return new Promise(resolve=>{roundTransitionContext={finished,next,newCards:[],resolve,phase:"intermission"};});
}

function markExportClaim(threshold){const card=state.permanents.find(item=>item.number===27);if(!card)return;card.claimed??=[];if(!card.claimed.includes(threshold))card.claimed.push(threshold);document.querySelector(`[data-export-reward="${threshold}"]`)?.remove();}
function claimExportReward(threshold){
  const card=state.permanents.find(item=>item.number===27);if(!card||card.value<threshold||card.claimed?.includes(threshold))return;
  if([30,100,175,350].includes(threshold)){if(threshold===30)discoverCard(86);else if(threshold===100)card.state=1;else if(threshold===175)discoverCard(107);else discoverCard(117);markExportClaim(threshold);render();notify([30,175,350].includes(threshold)?"Nová karta přichází do panství.":"Export se rozrostl.");return;}
  const config=threshold===10?{kind:"Krajina",resources:["coin","wood","stone"]}:threshold===40?{kind:"Budova",resources:["metal","sword","goods"]}:threshold===55?{kind:null,resources:["wood","stone","metal","sword"]}:threshold===20?{kind:"Osoba",fame:3}:threshold===75?{kind:null,fame:10}:threshold===125?{kind:"Krajina",fame:5}:threshold===150?{kind:"Osoba",fame:10}:threshold===200?{kind:"Budova",fame:10}:null;
  if(!config){markExportClaim(threshold);render();return notify("Odměna permanentu byla zaznamenána.");}
  const choices=state.cards.filter(target=>!config.kind||getKind(target).includes(config.kind)).map(target=>target.id);
  pendingActionChoice={type:"export",threshold,config,choices,selectedId:null,selectedResource:null};renderActionChoice();
}

function prepareNextRound() {
  if (!roundTransitionContext || roundTransitionContext.phase!=="intermission") return;
  const found=[];
  for (let i=0;i<2 && state.discoveries.length;i++) {
    const spec=state.discoveries.shift();
    const card={id:spec.number,number:spec.number,template:spec.template,state:0};
    if(spec.number===23){
      [25,26,27].forEach(number=>installPermanent(number));state.decreePending="land";break;
    } else { state.cards.push(card); found.push(card); }
  }
  roundTransitionContext.newCards=found;
  roundTransitionContext.phase="discovery";
  document.querySelector("#round-finished").textContent="Nové období";
  document.querySelector("#round-next").textContent=`Kolo ${roundTransitionContext.next} začíná`;
  document.querySelector("#round-transition-body").innerHTML=`
    ${found.length?`<p class="round-hint">Prohlédni si nové karty. Kliknutím na kartu otevřeš všechny její stavy.</p><div class="round-new-cards">${found.map(card=>getTemplate(card).chooseOnDiscover?`<div class="discovered-side-choice"><div class="side-pair">${getTemplate(card).stages.map((side,index)=>`<button class="round-card-button" data-detail="${card.id}" type="button" aria-label="Prohlédnout kartu ${side.name}">${renderPreviewCard(card,index)}</button>`).join("")}</div><span>Zvol stranu karty:</span><div class="column-options">${getTemplate(card).stages.map((side,index)=>`<button type="button" data-choose-side="${card.id}" data-side="${index}" class="${card.state===index?"selected":""}">${side.name}</button>`).join("")}</div></div>`:`<button class="round-card-button" data-detail="${card.id}" type="button" aria-label="Prohlédnout kartu ${getStage(card).name}">${renderPreviewCard(card,card.state)}</button>`).join("")}</div>`:state.decreePending?`<p class="round-hint">Nové instituce byly založeny. Dokonči jejich úvodní rozhodnutí.</p>`:`<p class="round-hint">V tomto období už nečekají žádné další nové karty.</p>`}
    <div class="round-discovery-actions">
      <button class="secondary-action" data-open-library type="button">▦ Knihovna karet</button>
    </div>`;
  document.querySelector("#round-transition-body").insertAdjacentHTML("beforeend",`<div class="round-discovery-footer"><button class="shuffle-round-action" data-shuffle-round type="button" ${state.decreePending?"disabled":""}><span class="mini-deck" aria-hidden="true">${state.cards.length}</span><strong>Zamíchat</strong></button></div>`);
  document.querySelector("#round-transition").className="round-transition phase-discovery";
  if(state.decreePending)setTimeout(()=>showDecreeChoice("land"),0);
}

function chooseDiscoveredSide(id,side){const card=getCard(id);if(!card||!getTemplate(card).chooseOnDiscover||!getTemplate(card).stages[side])return;card.state=side;document.querySelectorAll(`[data-choose-side="${id}"]`).forEach(button=>button.classList.toggle("selected",Number(button.dataset.side)===side));}

async function shuffleAndStartRound() {
  if (!roundTransitionContext || roundTransitionContext.phase!=="discovery" || state.decreePending) return;
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
    discard:state.discard,inactive:[...state.inactive],blocked:state.blocked,discoveries:state.discoveries,permanents:state.permanents,specials:state.specials
  };
  localStorage.setItem("patria-saved-game",JSON.stringify(snapshot));
  notify("Hra je uložená v tomto zařízení.");
}

function showLibrary() {
  const libraryCards=[...state.cards,...state.permanents];
  document.querySelector("#library-dialog-content").innerHTML=`
    <div class="dialog-header"><span class="eyebrow">Knihovna</span><h2>Tvé karty</h2><p>${libraryCards.length} karet v panství. Kliknutím otevřeš všechny stavy.</p></div>
    <div class="library-grid">${libraryCards.map(card=>`<button class="library-card" data-detail="${card.id}" type="button" aria-label="Prohlédnout kartu ${getStage(card).name}">${renderPreviewCard(card,card.state)}</button>`).join("")}</div>`;
  const dialog=document.querySelector("#library-dialog");
  document.querySelector("#round-transition")?.classList.add("behind-dialog");
  if (!dialog.open) dialog.showModal();
}

function advance() {
  if (state.busy || !state.deck.length) return;
  const room=state.slots.filter(id=>id===null).length;
  if (!room) return notify("Na herní ploše už není volná pozice.");
  const drawn=drawCards(Math.min(2,state.deck.length,room), false);
  render(); animateDeal(drawn); queueBanditBlocks(drawn);
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

function showCard(id) { const card=getCard(id);if(!card)return;state.selectedCard=id;renderDialog();const dialog=document.querySelector("#card-dialog");if(!dialog.open)dialog.showModal(); }
function hideSettingsMenu() {
  document.querySelector("#settings-menu").hidden=true;
  document.querySelector("#settings-button").setAttribute("aria-expanded","false");
}
function closeDialogs() { document.querySelectorAll("dialog[open]").forEach(d=>d.close()); document.querySelector("#round-transition")?.classList.remove("behind-dialog");hideSettingsMenu(); pendingUpgrade=null; pendingDiscard=null; pendingDiscardBrowser=null; pendingActionChoice=null; }

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
  if(card.permanent){renderPermanentDialog(card);return;}
  const template=getTemplate(card), current=getStage(card);
  document.querySelector("#card-dialog-content").innerHTML = `
    <div class="dialog-header"><span class="eyebrow">${getKind(card)}</span><h2>${template.title}</h2><p>Aktuálně: ${current.name}. Všechny stavy můžeš bezpečně prohlížet.</p></div>
    ${card.permanent?`<div class="permanent-detail"><span class="permanent-detail-icon">${permanentIcon(card.number)}</span><div><span>Nasbíráno</span><strong>${card.value||0}</strong></div></div>`:""}
    <div class="stage-gallery">${template.stages.map((s,index)=>{
      const direct=current.next.includes(index), cost=direct?upgradeCost(card,index):null, active=index===card.state;
      return `<article class="stage-card ${active?"current":""} ${!active&&!direct?"unreachable":""}"><span class="stage-label">${active?"Aktuální stav":`Stav ${index+1}`}</span>${renderPreviewCard(card,index)}</article>`;
    }).join("")}</div>`;
}

function renderPermanentDialog(card){
  const track=PERMANENT_TRACKS[card.number],template=getTemplate(card),icon=permanentIcon(card.number);
  if(!track){document.querySelector("#card-dialog-content").innerHTML=`<div class="dialog-header"><span class="eyebrow">Permanentní</span><h2>${template.title}</h2></div><p>${getStage(card).effect}</p>`;return;}
  const isExport=card.number===27;
  const rows=isExport?track.thresholds.map((threshold,index)=>`<div class="track-row ${card.value>=threshold?"reached":""} ${card.claimed?.includes(threshold)?"claimed":""}"><span>${card.value>=threshold?"✓":"○"}</span><strong>${threshold} ${icon}</strong><em>${track.labels[index]}</em></div>`).join(""):track.costs.map((cost,index)=>`<div class="track-row ${card.marks>index?"reached":""}"><span>${card.marks>index?"✓":"○"}</span><strong>${expandedBundle({[track.resource]:cost})}</strong><em>🏆 ${track.rewards[index]}</em></div>`).join("");
  const nextCost=isExport?null:track.costs[card.marks];
  const canDeposit=isExport?state.resources.goods>0:nextCost!==undefined&&canAfford({[track.resource]:nextCost});
  document.querySelector("#card-dialog-content").innerHTML=`<div class="dialog-header"><span class="eyebrow">Permanentní</span><h2>${icon} ${template.title}</h2><p>${isExport?"Zboží můžeš vkládat po jednotlivých kusech; tah pokračuje.":"Vlož vždy celou následující sadu. Vložení ukončí tah."}</p></div><div class="permanent-summary"><span>Vloženo <strong>${card.value||0}</strong></span>${isExport?"":`<span>Body <strong>${card.score||0}</strong></span>`}<button class="upgrade-action" data-use-permanent="${card.id}" type="button" ${canDeposit?"":"disabled"}>${isExport?`Vložit ze zásoby · ${expandedBundle({goods:state.resources.goods})}`:nextCost===undefined?"Stupnice dokončena":`Vložit ze zásoby · ${expandedBundle({[track.resource]:nextCost})}`}</button></div><div class="permanent-track">${rows}</div>`;
}

async function usePermanent(id){
  const card=getCard(id),track=card&&PERMANENT_TRACKS[card.number];if(!card||!track||state.busy)return;
  if(card.number===27){const amount=state.resources.goods;if(!amount)return;spend({goods:amount});card.value+=amount;render();renderPermanentDialog(card);return;}
  const cost=track.costs[card.marks];if(cost===undefined||!canAfford({[track.resource]:cost}))return;
  spend({[track.resource]:cost});card.value+=cost;card.marks+=1;card.score=track.rewards[card.marks-1];
  if(card.number===25&&card.marks===track.flipAfter)discoverCard(135);
  card.state=card.marks>=track.flipAfter?1:0;document.querySelector("#card-dialog").close();render();await endTurn(false);
}

function effectAvailable(card) {
  return Boolean(getStage(card).action);
}

function ruleVisible(template,stateIndex) {
  return Boolean(templates[template].stages[stateIndex].effect);
}

function stagePips(template,currentIndex,interactiveId=null) {
  const content=template.stages.map((_,i)=>`<span class="${i===currentIndex?"active":""}"></span>`).join("");
  return interactiveId===null?`<div class="state-pips">${content}</div>`:`<button class="state-pips" data-detail="${interactiveId}" type="button" aria-label="Prohlédnout všechny stavy karty">${content}</button>`;
}

function renderCardHeader(card,template,current,currentIndex,interactiveId=null) {
  const points=(current.fame||0)+(card.fameBonus||0);
  return `<div class="card-header"><div class="card-header-row card-header-top"><span class="card-kind">${getKind(card,currentIndex)}</span>${showCardNumbers?`<span class="card-number">(${String(card.number??card.id).padStart(3,"0")})</span>`:""}${stagePips(template,currentIndex,interactiveId)}</div><div class="card-header-row card-header-bottom"><h3>${current.name}</h3>${points?`<strong class="card-points" aria-label="${points} bodů">🏆${points}</strong>`:""}</div></div>`;
}

function renderPreviewCard(card,stageIndex) {
  const template=getTemplate(card), current=template.stages[stageIndex], production=getProduction(card,stageIndex), hasProduction=Object.values(production).some(Boolean);
  const previewCost=current.next.length===1?(template.branchCosts?.[current.next[0]]||current.cost):null;
  const previewUpgrades=current.next.map(target=>`<span class="upgrade-line"><span>⭐</span><strong>${expandedBundle(template.branchCosts?.[target]||current.cost)}</strong></span>`).join("");
  return `<article class="game-card preview-card ${current.next.length>1?"multiple-upgrades":""}">
    <img class="card-art-full" src="${current.image}" alt=""><div class="card-shade" aria-hidden="true"></div>
    ${renderCardHeader(card,template,current,stageIndex)}
    ${hasProduction?`<div class="production-space static-production">${productionIcons(production)}</div>`:""}
    ${ruleVisible(card.template,stageIndex)?`<div class="effect-panel">⚡ ${current.effect}</div>`:""}
    ${current.next.length?`<div class="upgrade-panel static-upgrade"><div class="upgrade-lines">${previewUpgrades}</div></div>`:""}
  </article>`;
}

function renderCard(id) {
  const card=getCard(id), template=getTemplate(card), current=getStage(card), next=current.next;
  const blockingVictim=Number(Object.keys(state.blocked).find(cardId=>state.blocked[cardId]===id))||null;
  const linkId=state.blocked[id]||(blockingVictim?id:null);
  const production=getProduction(card),hasProduction=Object.values(production).some(Boolean);
  const effectIsActive=effectAvailable(card);
  const affordableTargets=next.filter(target=>canAfford(upgradeCost(card,target)));
  const upgradeLabel=next.length===1?expandedBundle(upgradeCost(card,next[0])):next.map(target=>expandedBundle(upgradeCost(card,target))).join(" / ");
  const upgradeAria=next.length===1?formatBundle(upgradeCost(card,next[0])):next.map(target=>formatBundle(upgradeCost(card,target))).join(" nebo ");
  const upgradeRows=next.map(target=>`<span class="upgrade-line"><span>⭐</span><strong>${expandedBundle(upgradeCost(card,target))}</strong></span>`).join("");
  const isBandit=(card.template==="banditWorker"||card.template==="banditField")&&card.state===0;
  const missionaryReady=activeIds().some(otherId=>getCard(otherId).template==="missionary"&&getCard(otherId).state===0)&&canAfford({coin:3});
  return `<article class="game-card ${next.length>1?"multiple-upgrades":""} ${state.blocked[id]?"bandit-blocked":""} ${linkId&&linkId===selectedBanditLink?"linked-highlight":""}" data-card="${id}" ${linkId?`data-bandit-link="${linkId}"`:""} draggable="true" aria-label="${current.name}">
    <img class="card-art card-art-full" src="${current.image}" alt="" />
    <div class="card-shade" aria-hidden="true"></div>
    ${renderCardHeader(card,template,current,card.state,id)}
    ${state.blocked[id]?`<button class="bandit-mark" data-show-bandit-link="${state.blocked[id]}" type="button" aria-label="Tuto kartu blokuje Bandita">🔗 <span>Blokováno</span></button>`:""}
    ${blockingVictim?`<button class="bandit-link-origin" data-show-bandit-link="${id}" type="button" aria-label="Ukázat blokovanou kartu">🔗</button>`:""}
    ${hasProduction?`<button class="production-space" data-produce="${id}" type="button" aria-label="Použít produkci: ${formatBundle(production)}" ${state.blocked[id]?"disabled":""}>${productionIcons(production)}</button>`:""}
    ${isBandit?`<div class="effect-panel bandit-actions"><span>⚡ Zvol akci</span><div><button data-effect="${id}" data-effect-mode="defeat-bandit" type="button" ${canAfford({sword:1})?"":"disabled"}>⚔️ Porazit</button><button data-effect="${id}" data-effect-mode="convert-bandit" type="button" ${missionaryReady?"":"disabled"}>🤝 Přivítat</button></div></div>`:ruleVisible(card.template,card.state)?effectIsActive?`<button class="effect-panel active-effect" data-effect="${id}" type="button">⚡ ${current.effect}</button>`:`<div class="effect-panel">⚡ ${current.effect}</div>`:""}
    ${next.length?`<button class="upgrade-panel" data-upgrade-preview="${id}" type="button" aria-label="Vylepšit za ${upgradeAria}" ${affordableTargets.length?"":"disabled"}><div class="upgrade-lines">${upgradeRows}</div></button>`:""}
  </article>`;
}

function permanentIcon(number){return number===25?"⚔️":number===26?"🪙":number===27?"📦":"◆";}
function renderPermanents(){
  const panel=document.querySelector("#permanent-panel");
  const cards=state.permanents.filter(card=>[25,26,27].includes(card.number));
  panel.hidden=!cards.length;
  panel.innerHTML=cards.map(card=>`<button class="permanent-mini" data-detail="${card.id}" type="button" aria-label="Prohlédnout ${getStage(card).name}"><span>${permanentIcon(card.number)}</span><strong>${card.value||0}</strong></button>`).join("");
}

function render() {
  document.querySelector("#round-value").textContent=state.round;
  document.querySelector("#deck-label").textContent=`${state.deck.length} ${state.deck.length===1?"karta":"karet"}`;
  document.querySelector("#discard-label").textContent=`${state.discard.length} ${state.discard.length===1?"karta":"karet"}`;
  document.querySelector("#deck-count").textContent=state.deck.length;
  document.querySelector("#discard-count").textContent=state.discard.length;
  const resourceBar=document.querySelector("#resources");
  const producedResources=Object.entries(R).flatMap(([key,r])=>Array.from({length:state.resources[key]},()=>`<span class="produced-resource" aria-label="${r.label}">${r.icon}</span>`)).join("");
  resourceBar.innerHTML=producedResources;
  resourceBar.setAttribute("aria-label",producedResources?`Nasbírané suroviny: ${formatBundle(state.resources)}`:"Nasbírané suroviny: žádné");
  resourceBar.classList.toggle("empty",!producedResources);
  renderPermanents();
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
    productionTop:60,productionHeight:42,productionPadY:6,productionPadX:8,productGap:2,productWidth:27,productHeight:27,productFont:16,
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
    if (button.dataset.effect) useEffect(Number(button.dataset.effect),button.dataset.effectMode||null);
    if (button.dataset.usePermanent) usePermanent(Number(button.dataset.usePermanent));
    if (button.dataset.upgradePreview) showUpgradeChoice(Number(button.dataset.upgradePreview),button.dataset.target===undefined?null:Number(button.dataset.target));
    if (button.dataset.selectUpgrade) selectUpgradeTarget(Number(button.dataset.selectUpgrade));
    if (button.dataset.selectDiscard) selectDiscardCard(Number(button.dataset.selectDiscard));
    if (button.dataset.selectRetrieve) selectRetrieveCard(Number(button.dataset.selectRetrieve));
    if (button.dataset.pickResource) pickResource(button.dataset.pickResource);
    if (button.dataset.selectActionCard) selectActionCard(Number(button.dataset.selectActionCard));
    if (button.dataset.chooseSide) chooseDiscoveredSide(Number(button.dataset.chooseSide),Number(button.dataset.side));
    if (button.dataset.columns) {
      maxColumns=Number(button.dataset.columns);
      localStorage.setItem("patria-max-columns",String(maxColumns));
      document.querySelectorAll("[data-columns]").forEach(option=>option.classList.toggle("selected",Number(option.dataset.columns)===maxColumns));
      render();
    }
    if (button.hasAttribute("data-confirm-upgrade")) confirmUpgrade();
    if (button.hasAttribute("data-confirm-discard")) confirmDiscardChoice();
    if (button.hasAttribute("data-confirm-retrieve")) confirmRetrieveCard();
    if (button.hasAttribute("data-confirm-action-choice")) confirmActionChoice();
    if (button.hasAttribute("data-save-game")) saveGame();
    if (button.hasAttribute("data-open-library")) showLibrary();
    if (button.dataset.exportReward) claimExportReward(Number(button.dataset.exportReward));
    if (button.hasAttribute("data-prepare-round")) prepareNextRound();
    if (button.hasAttribute("data-shuffle-round")) shuffleAndStartRound();
    if (button.dataset.detail) showCard(Number(button.dataset.detail));
    if (button.hasAttribute("data-close-card")) document.querySelector("#card-dialog").close();
    if (button.hasAttribute("data-close-library")) { document.querySelector("#library-dialog").close();document.querySelector("#round-transition")?.classList.remove("behind-dialog"); }
    if (button.hasAttribute("data-close-dialog")) closeDialogs();
    if (button.hasAttribute("data-close-upgrade")) closeDialogs();
    if (button.hasAttribute("data-close-choice")) { document.querySelector("#discard-choice-dialog").close(); pendingDiscard=null; }
    if (button.hasAttribute("data-close-discard-browser")) { document.querySelector("#discard-browser-dialog").close(); pendingDiscardBrowser=null; }
    if (button.hasAttribute("data-close-action-choice")) { if(!["block","decree","volcano"].includes(pendingActionChoice?.type)){document.querySelector("#action-choice-dialog").close(); pendingActionChoice=null;} }
    if (button.dataset.showBanditLink) { selectedBanditLink=selectedBanditLink===Number(button.dataset.showBanditLink)?null:Number(button.dataset.showBanditLink);render(); }
    if (!button.closest("#settings-menu") && button.id!=="settings-button") hideSettingsMenu();
    return;
  }
  const linkedCard=event.target.closest?.("[data-bandit-link]");
  if(linkedCard){const linkId=Number(linkedCard.dataset.banditLink);selectedBanditLink=selectedBanditLink===linkId?null:linkId;render();return;}
  if (!event.target.closest("#settings-menu")) hideSettingsMenu();
});
document.addEventListener("dragstart", event => {
  const card=event.target.closest?.("[data-card]");
  if (!card || state.busy || event.target.closest?.("button")) return event.preventDefault();
  draggingId=Number(card.dataset.card);
  event.dataTransfer.effectAllowed="move";
  event.dataTransfer.setData("text/plain",String(draggingId));
  requestAnimationFrame(()=>card.classList.add("dragging"));
});
document.addEventListener("pointerover",event=>{const link=event.target.closest?.("[data-show-bandit-link]");if(!link)return;const id=String(link.dataset.showBanditLink);document.querySelectorAll(`[data-bandit-link="${id}"]`).forEach(card=>card.classList.add("linked-highlight"));});
document.addEventListener("pointerout",event=>{const link=event.target.closest?.("[data-show-bandit-link]");if(!link||link.contains(event.relatedTarget))return;const id=String(link.dataset.showBanditLink);document.querySelectorAll(`[data-bandit-link="${id}"]`).forEach(card=>card.classList.remove("linked-highlight"));});
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
  document.querySelector("#show-card-numbers").checked=showCardNumbers;
  document.querySelector("#confirm-production").checked=confirmProductionSetting;
});
document.querySelector("#show-card-numbers").addEventListener("change",event=>{showCardNumbers=event.target.checked;localStorage.setItem("patria-show-card-numbers",String(showCardNumbers));render();});
document.querySelector("#confirm-production").addEventListener("change",event=>{confirmProductionSetting=event.target.checked;localStorage.setItem("patria-confirm-production",String(confirmProductionSetting));});
document.querySelector("#discard-pile").addEventListener("click",()=>showDiscardBrowser());
document.querySelectorAll("dialog").forEach(dialog=>{
  dialog.addEventListener("cancel",event=>{if(dialog.id==="action-choice-dialog"&&["block","decree","volcano"].includes(pendingActionChoice?.type))event.preventDefault();});
  dialog.addEventListener("click",event=>{if(event.target===dialog){if(dialog.id==="action-choice-dialog"&&["block","decree","volcano"].includes(pendingActionChoice?.type))return;dialog.close();if(dialog.id==="discard-choice-dialog")pendingDiscard=null;if(dialog.id==="upgrade-dialog")pendingUpgrade=null;if(dialog.id==="discard-browser-dialog")pendingDiscardBrowser=null;if(dialog.id==="action-choice-dialog")pendingActionChoice=null;if(dialog.id==="library-dialog")document.querySelector("#round-transition")?.classList.remove("behind-dialog");}});
});
window.addEventListener("resize",updateCardSize);

document.querySelector("#show-card-numbers").checked=showCardNumbers;
document.querySelector("#confirm-production").checked=confirmProductionSetting;
newGame();

