const R = {
  coin: { label: "Mince", icon: "🪙" },
  wood: { label: "Dřevo", icon: "🪵" },
  stone: { label: "Kámen", icon: "🪨" },
  metal: { label: "Kov", icon: "⚙️" },
  sword: { label: "Síla", icon: "⚔️" },
  goods: { label: "Zboží", icon: "📦" },
};
const BUILD_NUMBER = "0.17.0";

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
  entrepreneur:{title:"Podnikatel",kind:"Osoba",stages:[
    stage("Podnikatel",art("market",1),{goods:1},{wood:2,stone:1},0,"Přiveď do panství Školu.",[1],{action:"future-discovery",future:"Škola",discoverNumber:118}),
    stage("Hostinec",art("market",2),{coin:1,goods:2},{coin:2,wood:2},2,"Získej 1 minci za každou osobu ve hře.",[2],{action:"coin-per-person",kind:"Budova"}),
    stage("Útulná krčma",art("market",3),{goods:2},{coin:2,stone:2},3,"Odhoď jednu osobu a přiveď Cizince.",[3],{action:"discover-with-person",discoverNumber:92,kind:"Budova"}),
    stage("Taverna",art("market",4),{coin:2,goods:2},null,4,"Přiveď do panství Výpravy.",[],{action:"future-discovery",future:"Výpravy",discoverNumber:87,kind:"Budova"})
  ]},
  scientist:{title:"Vědec",kind:"Osoba",stages:[
    stage("Vědec",art("manor",1),{coin:1},null,0,"Dokud je ve hře, každá osoba produkuje navíc 1 minci.",[1,2],{personCoinAura:true}),
    stage("Observatoř",art("mountain",4),{coin:1,goods:1},null,5,"Přiveď Astronoma.",[],{action:"future-discovery",future:"Astronom",discoverNumber:95,kind:"Budova"}),
    stage("Laboratoř",art("manor",3),{coin:1,goods:2},null,10,"Přiveď Alchymistu.",[],{action:"future-discovery",future:"Alchymista",discoverNumber:96,kind:"Budova"})
  ],branchCosts:{1:{wood:1,stone:3,coin:1},2:{wood:2,coin:1}}},
  engineer:{title:"Inženýr",kind:"Osoba",stages:[
    stage("Inženýr",art("mountain",2),{}, {wood:2,metal:1},0,"Nahraď Dřevorubeckou osadu, Sýpky nebo Rybářskou loď jejich pokročilou verzí.",[1],{action:"engineer-improve"}),
    stage("Trebuchet",art("manor",3),{},null,1,"Znič Trebuchet, poraz nepřítele a posuň Armádu o jedno pole.",[],{action:"trebuchet",kind:"Budova"})
  ]},
  inventor:{title:"Vynálezkyně",kind:"Osoba",stages:[
    stage("Vynálezkyně",art("market",1),{}, {coin:4},0,"Za každou získanou značku má hodnotu 5 bodů.",[1]),
    stage("Inspirovaná vynálezkyně",art("market",4),{},null,0,"Vrať kartu na začátek, přidej značku a objev vynález, nebo získej libovolné suroviny.",[0],{action:"inventor-reset"})
  ]},
  mercenary:{title:"Žoldnéř",kind:"Osoba",stages:[
    stage("Žoldnéř",art("manor",2),{}, {coin:4},0,"Zaplať 2 mince, označ jedno nebo dvě pole a za každé získej 1 sílu.",[1],{action:"mercenary-marks"}),
    stage("Rytíř",art("manor",4),{sword:1},null,3,"Zaplať 3 kovy a přidej další produkci síly; lze použít dvakrát.",[],{action:"knight-train"})
  ]},
  school:{title:"Škola",kind:"Budova",stages:[stage("Venkovská škola",art("manor",1),{},null,1,"Vylepši jednu osobu bez placení běžné ceny a školu otoč.",[1],{action:"school-upgrade"}),stage("Městská škola",art("manor",2),{},null,2,"Vylepši jednu osobu bez placení běžné ceny a školu otoč.",[2],{action:"school-upgrade"}),stage("Akademie",art("manor",3),{},null,5,"Přidej osobě 1 produkci a školu otoč.",[3],{action:"school-boost"}),stage("Univerzita",art("manor",4),{},null,9,"Jednou přidej osobě 1 produkci.",[],{action:"school-boost"})]},
  quests:{title:"Výpravy",kind:"Permanentní",stages:[stage("Výpravy",art("manor",3),{},null,0,"Na konci tahu můžeš vysílat rostoucí počet osob a získávat body.",[])]},
  stranger:{title:"Cizinec",kind:"Osoba",chooseOnDiscover:true,stages:[stage("Potulný kupec",art("market",2),{goods:2},null,2,"Při objevení zvol tuto stranu natrvalo.",[]),stage("Zkušený rádce",art("manor",2),{coin:2},null,3,"Zůstává ve hře.",[],{stays:true})]},
  astronomer:{title:"Astronom",kind:"Osoba",stages:[stage("Astronom",art("mountain",4),{coin:1},null,4,"Pozorování hvězd připravuje další objevy.",[])]},
  alchemist:{title:"Alchymista",kind:"Osoba",stages:[stage("Alchymista",art("manor",3),{goods:1},null,4,"Proměňuje suroviny v cenné zboží.",[])]},
  printingPress:{title:"Knihtisk",kind:"Vynález",stages:[stage("Knihtisk",art("manor",2),{coin:2}, {wood:2,metal:1},4,"",[1]),stage("Tiskařská dílna",art("manor",3),{coin:2,goods:1},null,8,"",[])]},
  calendar:{title:"Kalendář",kind:"Vynález",stages:[stage("Kalendář",art("mountain",4),{},null,4,"Odhoď kartu a podívej se na vrchní karty balíčku.",[1],{action:"discard-top"}),stage("Hvězdný kalendář",art("manor",4),{coin:1},null,8,"",[])]},
  workshop:{title:"Mechanická dílna",kind:"Vynález",stages:[stage("Mechanická dílna",art("mountain",2),{metal:1}, {wood:2,stone:2},4,"",[1]),stage("Automaty",art("manor",3),{metal:1,goods:1},null,9,"",[])]},
  improvedLumber:{title:"Pokročilé zpracování dřeva",kind:"Budova",chooseOnDiscover:true,stages:[stage("Pila",art("forest",3),{wood:3},null,5,"Založ stavbu Archy.",[],{action:"future-discovery",future:"Archa",discoverNumber:91}),stage("Vývoz dřeva",art("market",3),{goods:1},null,6,"Vyprodukuj dřevo nebo minci.",[],{action:"choose-production",options:["wood","coin"]})]},
  improvedBarns:{title:"Pokročilé hospodářství",kind:"Krajina · Vynález",chooseOnDiscover:true,stages:[stage("Pluhy",art("meadow",3),{coin:2},null,5,"",[]),stage("Královské sýpky",art("manor",4),{goods:1},null,8,"Jedna jiná karta může zůstat ve hře.",[],{stays:true,kind:"Budova"})]},
  improvedFishing:{title:"Pokročilý rybolov",kind:"Námořní",chooseOnDiscover:true,stages:[stage("Rybářská flotila",art("meadow",4),{coin:2,goods:1},null,6,"",[]),stage("Rybářská dokonalost",art("manor",4),{},null,13,"Námořní karty produkují navíc 1 minci.",[],{kind:"Permanentní"})]},
  ark:{title:"Archa",kind:"Permanentní",stages:[stage("Stavba Archy",art("manor",3),{},null,0,"Postupným vkládáním dřeva vznikne slavná loď.",[]),stage("Archa",art("meadow",4),{},null,20,"Dokončená slavná loď.",[])]},
  canyon:{title:"Západní kaňon",kind:"Krajina",stages:[stage("Západní kaňon",art("mountain",1),{},null,0,"Vyprodukuj kámen nebo kov.",[1,3],{action:"choose-production",options:["stone","metal"]}),stage("Horníci",art("mountain",2),{stone:1,metal:1},{sword:2},2,"Může se počítat jako jedna nebo dvě osoby.",[2],{kind:"Osoba"}),stage("Stát nucených prací",art("mountain",4),{stone:2,metal:2},null,-3,"",[],{kind:"Stát"}),stage("Hradba",art("mountain",3),{sword:2},null,3,"Zůstává ve hře.",[],{kind:"Budova",stays:true})],branchCosts:{1:{stone:1,metal:1,coin:1,wood:1},3:{stone:3}}},
  shore:{title:"Pobřeží",kind:"Krajina",stages:[stage("Pobřeží",art("meadow",1),{coin:1},{wood:3,coin:1},0,"",[1]),stage("Loděnice",art("manor",1),{},null,3,"Vyprodukuj minci nebo dřevo.",[2],{kind:"Budova",action:"choose-production",options:["coin","wood"]}),stage("Obchodní loď",art("meadow",4),{},null,6,"Vyprodukuj minci, dřevo nebo zboží.",[3],{kind:"Námořní",action:"choose-production",options:["coin","wood","goods"]}),stage("Obchodní trasa",art("market",4),{},null,13,"Vyprodukuj minci, dřevo, kov nebo zboží. Při vyložení objev Piráta 076.",[],{kind:"Námořní",action:"choose-production",options:["coin","wood","metal","goods"],onPlay:"discover-pirate"})]},
  pirate:{title:"Pirát",kind:"Nepřítel",stages:[stage("Pirát",art("market",2),{}, {coin:4,metal:1},-2,"Sniž každé získání mincí o 1. Zaplať 1 sílu: znič Piráta a objev Lagunu 077.",[1],{stays:true,action:"defeat-pirate"}),stage("Zkušený spojenec",art("market",3),{},null,3,"Vyprodukuj sílu nebo kov; místo toho můžeš objevit Výpravu za pokladem 093.",[],{kind:"Osoba · Námořní",action:"pirate-ally"})]},
  lagoon:{title:"Laguna",kind:"Krajina",stages:[stage("Laguna",art("forest",3),{coin:1},null,0,"",[1,3]),stage("Vor",art("meadow",4),{},null,0,"",[2],{kind:"Námořní"}),stage("Bujný ostrov",art("forest",4),{goods:1,coin:2},null,1,"",[],{kind:"Krajina · Námořní"}),stage("Mořská brána",art("manor",3),{sword:1},null,3,"Zahraj námořní kartu z odhazovacího balíčku.",[],{kind:"Budova",action:"retrieve",retrieveKinds:["Námořní"]})],branchCosts:{1:{wood:3},3:{goods:1,stone:2}}},
  shrine:{title:"Svatyně",kind:"Budova",stages:[stage("Svatyně",art("forest",1),{},{coin:3},3,"Na konci tahu odhoď: 1 jiná karta zůstane ve hře.",[1],{endTurnKeep:1}),stage("Útočiště",art("forest",2),{},{coin:3,stone:2},5,"Na konci tahu odhoď: až 2 jiné karty zůstanou ve hře.",[2],{endTurnKeep:2}),stage("Oratoř",art("forest",3),{},{coin:2,wood:2},6,"Na konci tahu odhoď: až 3 jiné karty zůstanou ve hře.",[3],{endTurnKeep:3}),stage("Chrám",art("forest",4),{},null,15,"Na konci tahu odhoď: až 4 jiné karty zůstanou ve hře.",[],{endTurnKeep:4})]},
  mine:{title:"Důl",kind:"Budova",stages:[stage("Důl",art("mountain",1),{stone:1,metal:1},{wood:3},4,"",[1]),stage("Hluboký důl",art("mountain",2),{stone:1,metal:2},{wood:3,coin:2},9,"",[2]),stage("Rubínový důl",art("mountain",3),{stone:1,metal:2,goods:1},{coin:2,wood:2,stone:2},6,"",[3]),stage("Diamantový důl",art("mountain",4),{stone:1,metal:2,goods:2},null,13,"",[])]},
  missionary:{title:"Misionář",kind:"Osoba",stages:[stage("Misionář",art("manor",1),{}, {coin:3},0,"Zaplať 3 mince a přivítej Banditu mezi své lidi.",[1],{action:"convert-bandit"}),stage("Včelař",art("meadow",3),{coin:1},{},2,"Posuň včelaření; po čtvrtém použití přidej 1 minci k produkci.",[0],{action:"beekeeper"})]},
  priest:{title:"Kněz",kind:"Osoba",stages:[stage("Kněz",art("manor",2),{}, {coin:6,goods:2},0,"Zaplať 2 mince a vylepši kartu za běžnou cenu; tah nekončí.",[1],{action:"priest-upgrade"}),stage("Kardinál",art("manor",4),{},null,5,"Vylepši kartu za běžnou cenu; tah nekončí.",[],{action:"cardinal-upgrade"})]},
  dubbing:{title:"Pasování",kind:"Událost",stages:[stage("Pasování",art("manor",3),{},null,0,"Na konci kola přidej osobě produkci síly a bodový bonus; poté se změň na Renovaci.",[1],{stays:true}),stage("Renovace",art("manor",4),{},null,0,"Na konci kola vylepši produkci jedné budovy a tuto kartu znič.",[],{stays:true})]},
  jewelry:{title:"Klenotnictví",kind:"Permanentní",stages:[stage("Klenotnictví",art("market",4),{},null,0,"Utrácej postupně 1 až 10 kovů; každá značka přidá 5 zboží a zvyšuje bodovou hodnotu.",[])]},
  treasure:{title:"Výprava za pokladem",kind:"Námořní",stages:[stage("Výprava za pokladem",art("meadow",4),{}, {coin:1,wood:1,metal:1},0,"",[1]),stage("Pirátská zátoka",art("market",2),{},null,0,"Při vyložení objev Podrazáka nebo Krvavou kletbu 094.",[2],{onPlay:"discover-curse"}),stage("Mapa pokladu",art("meadow",3),{coin:1},null,5,"",[3]),stage("Pirátský poklad",art("market",4),{coin:2},null,15,"",[],{kind:"Předmět"})]},
  curseChoice:{title:"Podrazák / Krvavá kletba",kind:"Nepřítel",chooseOnDiscover:true,stages:[stage("Podrazák",art("market",2),{},null,-4,"Při vyložení odhoď 2 osoby. Zaplať 4 síly: znič tuto kartu.",[],{action:"defeat-backstabber",onPlay:"discard-persons"}),stage("Krvavá kletba",art("forest",1),{},null,0,"Když dobereš 2 karty, dober další 2.",[],{kind:"Událost"})]},
  royalChoice:{title:"Královská návštěva / Inkvizitor",kind:"Událost",chooseOnDiscover:true,stages:[stage("Královská návštěva",art("manor",4),{},null,2,"Odhoď: trvale sniž jednu cenu vylepšení ve hře o 1 surovinu.",[],{action:"reduce-upgrade",destroySelf:false}),stage("Inkvizitor",art("manor",2),{coin:1},null,0,"Znič tuto kartu: znič jednu negativní kartu ve hře.",[],{kind:"Osoba",action:"destroy-negative"})]},
  tradeRelations:{title:"Obchodní vztahy",kind:"Permanentní",stages:[stage("Obchodní vztahy",art("market",4),{},null,0,"Utrať 3 zboží: získej libovolnou 1 surovinu.",[],{action:"trade-relations"})]},
  ambitionsDecree:{title:"Ambice panství",kind:"Listina",stages:[stage("Ambice panství",art("manor",4),{},null,0,"Zvol cíle panství, Dvorního baviče nebo Kupce a Polního dělníka nebo Sklad.",[])]},
  populationGoal:{title:"Početní převaha / Vojenská nadvláda",kind:"Permanentní · Cíl",chooseOnDiscover:true,permanent:true,stages:[stage("Početní převaha",art("manor",2),{},null,0,"Na konci hry získáš 2 body za každou osobu.",[]),stage("Vojenská nadvláda",art("manor",3),{},null,0,"Na konci hry získáš 2 body za každou produkovanou sílu.",[])]},
  expansionGoal:{title:"Rozšiřování hranic / Maximální využití",kind:"Permanentní · Cíl",chooseOnDiscover:true,permanent:true,stages:[stage("Rozšiřování hranic",art("meadow",4),{},null,0,"Cílem je mít 75 nepermanentních karet; za každou chybějící ztratíš 2 body.",[]),stage("Maximální využití",art("market",4),{},null,0,"Na konci hry ztratíš 1 bod za každou nepermanentní kartu bez bodové hodnoty.",[])]},
  loyaltyGoal:{title:"Věrnost / Obchodník",kind:"Permanentní · Cíl",chooseOnDiscover:true,permanent:true,stages:[stage("Věrnost",art("manor",4),{},null,25,"Získáš 25 bodů, pokud v panství nezůstane žádný nepřítel.",[]),stage("Obchodník",art("market",4),{},null,25,"Získáš 25 bodů, pokud produkce zboží dosáhne alespoň 10.",[])]},
  courtChoice:{title:"Dvorní bavič / Kupec",kind:"Osoba",chooseOnDiscover:true,stages:[stage("Dvorní bavič",art("market",2),{},null,1,"Odhoď vrchní kartu balíčku, označ další pole a získej jeho odměnu. Zůstává ve hře.",[],{action:"jester",stays:true}),stage("Kupec",art("market",3),{},null,2,"Označ jedno nebo dvě pole a získej odpovídající suroviny.",[],{action:"merchant-marks"})]},
  workerStorage:{title:"Polní dělník / Sklad",kind:"Osoba",chooseOnDiscover:true,stages:[stage("Polní dělník",art("meadow",3),{},null,0,"Odhoď tuto kartu: získej produkci zvolené krajiny ve hře.",[],{action:"copy-production",targetKind:"Krajina"}),stage("Sklad",art("manor",2),{},null,1,"Na konci tahu může jiná karta zůstat ve hře. Sklad zůstává ve hře.",[],{stays:true,kind:"Budova"})]},
  mason:{title:"Kameník",kind:"Osoba",stages:[stage("Kameník",art("mountain",2),{stone:1},{coin:2},0,"Zaplať 2 mince a zahaj jeden ze dvou stavebních projektů.",[1,2],{action:"mason-project"}),stage("Cihlová cesta",art("meadow",2),{coin:1},{stone:4},3,"Vyber jeden z projektů 109 nebo 110.",[3],{action:"discover-guild-or-barn",kind:"Budova"}),stage("Kamenná ulice",art("mountain",3),{coin:1},{stone:4},2,"Vyber jeden z projektů 111 nebo 112.",[3],{action:"discover-mint-or-stable",kind:"Budova"}),stage("Mistrovská cesta",art("manor",4),{coin:2},null,7,"Panství propojuje pevná síť cest.",[],{kind:"Budova"})]},
  weather:{title:"Bouře",kind:"Událost",stages:[stage("Bouře",art("mountain",4),{},null,0,"Při vyložení odhoď tři vrchní karty balíčku a kartu otoč.",[],{onPlay:"storm"}),stage("Déšť",art("meadow",1),{},null,0,"Krajiny produkují navíc 2 mince. Dokud prší, nelze dobírat další karty.",[],{landCoinAura:2})]},
  darkKnight:{title:"Temný rytíř",kind:"Nepřítel",stages:[stage("Temný rytíř",art("manor",3),{},null,-3,"Dokud je ve hře, nelze dobírat ani vylepšovat. Utrať 3 síly a poraz jej.",[1],{action:"defeat-dark-knight",stays:true}),stage("Nadšený chlapec",art("manor",1),{}, {metal:1,sword:1},0,"Znič tuto kartu a získej 2 síly.",[2],{action:"destroy-for-swords",amount:2,kind:"Osoba"}),stage("Panoš",art("manor",2),{sword:1},null,3,"Znič tuto kartu a získej 3 síly.",[],{action:"destroy-for-swords",amount:3,kind:"Osoba"})]},
  camp:{title:"Tábor",kind:"Budova",stages:[stage("Tábor",art("meadow",2),{coin:1,wood:1,metal:1},{coin:2,wood:2},0,"",[1]),stage("Cvičiště",art("manor",2),{metal:2},{coin:3,metal:2},1,"Zaplať 1 minci a získej 1 sílu.",[2],{action:"train-soldier"}),stage("Rytířský dvůr",art("manor",4),{sword:2},null,3,"Vyškolení rytíři chrání celé panství.",[])]},
  stoneMonument:{title:"Kamenný monument",kind:"Permanentní",permanent:true,stages:[stage("Kamenný monument",art("mountain",3),{},null,0,"Vkládej postupně rostoucí množství kamene a získávej body.",[])]},
  buildingProject:{title:"Stavební projekt",kind:"Budova",stages:[stage("Staveniště",art("manor",1),{}, {wood:2,stone:2},0,"Rozhodni se mezi Městskou studnou a Vězením.",[1,2]),stage("Městská studna",art("meadow",3),{coin:2},null,5,"",[]),stage("Vězení",art("manor",3),{sword:1},null,6,"",[])]},
  guild:{title:"Cech",kind:"Budova",stages:[stage("Malý cech",art("market",2),{coin:2},{wood:2,stone:2},3,"",[1]),stage("Velká cechovní síň",art("market",4),{coin:2,goods:1},null,9,"",[])]},
  barnProject:{title:"Velký statek",kind:"Budova",stages:[stage("Stodola",art("meadow",2),{wood:2},{stone:3},2,"",[1]),stage("Velký statek",art("meadow",4),{wood:2,goods:1},null,8,"",[])]},
  mint:{title:"Mincovna",kind:"Budova",stages:[stage("Nová mincovna",art("market",1),{coin:6},{coin:1},0,"Po produkci se její výnos postupně snižuje.",[1]),stage("Zaběhnutá mincovna",art("market",2),{coin:5},{coin:1},2,"",[2]),stage("Stará mincovna",art("market",3),{coin:4},{coin:2},4,"",[3]),stage("Královská mincovna",art("market",4),{coin:3},null,9,"Přivítej šlechtice 116.",[],{action:"future-discovery",discoverNumber:116,future:"Šlechtic"})]},
  stable:{title:"Stáj",kind:"Budova",stages:[stage("Stáj",art("meadow",2),{}, {wood:2},1,"Přiveď prvního koně 113.",[1],{action:"future-discovery",discoverNumber:113,future:"Kůň"}),stage("Rozšířená stáj",art("meadow",3),{}, {wood:2,stone:2},3,"Přiveď druhého koně 114.",[2],{action:"future-discovery",discoverNumber:114,future:"Kůň"}),stage("Velká stáj",art("manor",3),{}, {coin:2,metal:1},5,"Přiveď třetího koně 115.",[3],{action:"future-discovery",discoverNumber:115,future:"Kůň"}),stage("Mistrovská stáj",art("manor",4),{coin:2},null,9,"Koně mohou být dále cvičeni a posilováni.",[])]},
  horseCoin:{title:"Tažný kůň",kind:"Zvíře",stages:[stage("Tažný kůň",art("meadow",2),{coin:2},null,2,"",[])]},
  horseWood:{title:"Lesní kůň",kind:"Zvíře",stages:[stage("Lesní kůň",art("forest",2),{wood:2},null,2,"",[])]},
  horseChoice:{title:"Ušlechtilý kůň",kind:"Zvíře",stages:[stage("Ušlechtilý kůň",art("manor",2),{},null,3,"Vyprodukuj minci, dřevo, kámen nebo sílu.",[],{action:"choose-production",options:["coin","wood","stone","sword"]})]},
  nobleChoice:{title:"Šlechtic",kind:"Osoba",chooseOnDiscover:true,stages:[stage("Lady Elvina",art("manor",4),{coin:2},null,7,"Při vyložení odhoď zvolenou jinou kartu.",[],{stays:true}),stage("Eadric Stínový",art("manor",3),{sword:1},null,8,"Odhoď jinou osobu a získej 3 síly.",[],{stays:true})]},
  secondImmigration:{title:"Druhá vlna přistěhovalců",kind:"Listina",stages:[stage("Druhá vlna přistěhovalců",art("manor",4),{},null,0,"Vyber dva ze čtyř nových obyvatel panství.",[])]},
  envoy:{title:"Vyslanec",kind:"Osoba",stages:[stage("Vyslanec",art("market",1),{coin:1},{coin:4},0,"Přiveď Obchodníka 119.",[1],{action:"future-discovery",discoverNumber:119,future:"Obchodník"}),stage("Emisar",art("market",2),{coin:1},{coin:4},2,"Přiveď Investora 120.",[2],{action:"future-discovery",discoverNumber:120,future:"Investor"}),stage("Diplomat",art("manor",3),{coin:2},{coin:5},4,"Přiveď Spojence 121.",[3],{action:"future-discovery",discoverNumber:121,future:"Spojenec"}),stage("Velvyslanec",art("manor",4),{coin:3},null,8,"Přiveď Choť 122.",[],{action:"future-discovery",discoverNumber:122,future:"Choť"})]},
  royalArchitect:{title:"Královská architektka",kind:"Osoba",stages:[stage("Královská architektka",art("manor",1),{}, {stone:3,wood:2},2,"Nahraď dokončený Hrad, Diamantový důl nebo Chrám velkolepější stavbou.",[1],{action:"architect-project"}),stage("Mistryně mostů",art("meadow",2),{coin:2},{stone:3},4,"Znič Kamenný most a vytvoř Most divů.",[2],{action:"architect-bridge"}),stage("Dvorní stavitelka",art("manor",3),{stone:1,coin:2},{metal:2},7,"Zdokonal jednu dokončenou budovu.",[3],{action:"architect-project"}),stage("Most divů",art("manor",4),{coin:3,stone:1},null,12,"Může zahrát kartu z odhazovacího balíčku.",[],{action:"retrieve",retrieveKinds:null,kind:"Budova"})]},
  traveller:{title:"Cestovatel",kind:"Osoba",stages:[stage("Cestovatel",art("meadow",1),{}, {goods:1},0,"Objev Borový les nebo Rybník 126.",[1],{action:"future-discovery",discoverNumber:126,future:"Nová krajina"}),stage("Průzkumník",art("forest",2),{coin:1},{goods:2},1,"Objev Balvany nebo Houby 127.",[2],{action:"future-discovery",discoverNumber:127,future:"Nová krajina"}),stage("Hledač",art("mountain",2),{stone:1},{goods:3},1,"Objev Hluboký důl 128.",[3],{action:"future-discovery",discoverNumber:128,future:"Hluboký důl"}),stage("Kartograf",art("meadow",4),{coin:2},null,2,"Objev Proměnlivou krajinu 129.",[],{action:"future-discovery",discoverNumber:129,future:"Proměnlivá krajina"})]},
  strategist:{title:"Stratég",kind:"Osoba",stages:[stage("Stratég",art("manor",2),{sword:1},{stone:2,wood:1},1,"Objev Strategickou výšinu 130.",[1],{action:"future-discovery",discoverNumber:130,future:"Strategická výšina"}),stage("Magistrát",art("manor",3),{sword:1},{stone:3,metal:1},3,"Objev Opevněnou pláň 131.",[2],{action:"future-discovery",discoverNumber:131,future:"Opevněná pláň"}),stage("Vojevůdce",art("manor",4),{sword:2},{metal:2,goods:1},6,"Objev Větrný kopec 132.",[3],{action:"future-discovery",discoverNumber:132,future:"Větrný kopec"}),stage("Královský stratég",art("manor",4),{sword:2},null,10,"Zahraj jednu Hradbu nebo Rytíře z odhazovacího balíčku.",[],{action:"retrieve",retrieveKinds:["Budova","Osoba"]})]},
  mightyMound:{title:"Mohutná mohyla",kind:"Krajina",stages:[stage("Mohutná mohyla",art("meadow",1),{stone:1},{stone:2},0,"",[1]),stage("Osada na návrší",art("meadow",2),{coin:1,stone:1},{wood:2,stone:2},2,"",[2]),stage("Městečko na kopci",art("manor",2),{coin:2},{wood:3,stone:3},5,"",[3]),stage("Vrcholová vesnice",art("manor",3),{coin:2,stone:1},null,8,"Objev Malé město 105 a vrať Mohylu na začátek.",[],{action:"discover-reset",discoverNumber:105})]},
  witch:{title:"Čarodějnice",kind:"Nepřítel",stages:[stage("Čarodějnice",art("forest",4),{},null,-6,"Utrať 4 síly a znič ji, nebo odhoď 3 osoby a uklidni ji. Jinak přeskočíš jedno období.",[],{action:"witch-choice",stays:true}),stage("Chýše čarodějnice",art("forest",2),{},null,-3,"Utrať 3 síly, nebo znič osobu. Poté chýši znič.",[],{action:"witch-hut"})]},
  scribe:{title:"Písař",kind:"Osoba",stages:[stage("Písař",art("manor",1),{}, {coin:2},1,"Na konci tahu mohou dvě jiné karty zůstat ve hře.",[1],{stays:true}),stage("Kronikář",art("manor",2),{coin:1},{coin:3},3,"Na konci tahu mohou dvě jiné karty zůstat ve hře.",[2],{stays:true}),stage("Iluminátor",art("manor",3),{coin:2},{goods:2},5,"Na konci tahu mohou dvě jiné karty zůstat ve hře.",[3],{stays:true}),stage("Mistr kronik",art("manor",4),{coin:2,goods:1},null,8,"Vrať kartu na začátek a objev jednu z karet 078 nebo 079.",[],{action:"discover-scribe"})]},
  lordChoice:{title:"Vůdce panství",kind:"Osoba",chooseOnDiscover:true,stages:[stage("Lord Aethan",art("manor",4),{coin:2,wood:1,stone:1},null,2,"Objev karty 080 a 081.",[],{action:"discover-aethan",stays:true}),stage("Lord Nimrod",art("manor",3),{metal:1,sword:2},null,5,"Objev Nájezd 133 a Rivala 134.",[],{action:"discover-nimrod"})]},
  plague:{title:"Mor",kind:"Událost",stages:[stage("Mor",art("market",4),{},null,-2,"Zůstává ve hře. Na konci období znič dvě osoby a kartu otoč.",[],{stays:true,endRound:"plague"}),stage("Nepřátelský voják",art("manor",3),{},null,-2,"Při vyložení blokuje krajinu nebo budovu. Utrať 2 síly a znič jej.",[],{stays:true,action:"defeat-soldier",onPlay:"block-land-building"})]},
  assassin:{title:"Vrah",kind:"Nepřítel",stages:[stage("Vrah",art("forest",3),{},null,-4,"Zničí následující vyloženou osobu. Utrať 3 síly a poraz jej.",[],{action:"defeat-assassin",onPlay:"assassin"}),stage("Nepřátelský voják",art("manor",3),{},null,-2,"Při vyložení blokuje krajinu nebo budovu. Utrať 2 síly a znič jej.",[],{stays:true,action:"defeat-soldier",onPlay:"block-land-building"})]},
  cityFire:{title:"Požár města",kind:"Událost",stages:[stage("Požár města",art("market",4),{},null,-3,"Na konci období znič jednu budovu a změň kartu na Spáleniště.",[],{stays:true,endRound:"fire"}),stage("Spáleniště",art("forest",1),{}, {coin:2},-2,"",[2],{kind:"Krajina"}),stage("Mladý les",art("forest",2),{wood:1},{coin:2},1,"Nech les postupně dorůst.",[3],{action:"grow-forest",kind:"Krajina"}),stage("Obnovený háj",art("forest",4),{wood:3},null,3,"",[],{kind:"Krajina"})]},
  mysteriousCave:{title:"Tajemná jeskyně",kind:"Krajina",stages:[stage("Tajemná jeskyně",art("mountain",1),{stone:1},{sword:1},0,"",[1]),stage("Staré chodby",art("mountain",2),{stone:1,coin:1},{sword:2},2,"",[2]),stage("Síň artefaktů",art("mountain",3),{goods:1},{sword:3},5,"Objev Tajemný artefakt 108.",[3],{action:"future-discovery",discoverNumber:108,future:"Tajemný artefakt"}),stage("Královská pokladnice",art("mountain",4),{coin:2,goods:1},null,10,"Zůstává ve hře.",[],{stays:true,kind:"Předmět"})]},
  courtRecord:{title:"Dvorní záznamy",kind:"Budova",stages:[stage("Archiv",art("manor",2),{coin:1},{wood:2},3,"Zahraj osobu z odhazovacího balíčku.",[1],{action:"retrieve",retrieveKinds:["Osoba"]}),stage("Královský archiv",art("manor",4),{coin:2},null,8,"Zahraj libovolnou osobu z odhazovacího balíčku.",[],{action:"retrieve",retrieveKinds:["Osoba"]})]},
  academyHall:{title:"Dvorní akademie",kind:"Budova",stages:[stage("Písařská škola",art("manor",1),{coin:1},{coin:3},2,"",[1]),stage("Dvorní akademie",art("manor",4),{coin:2,goods:1},null,9,"",[])]},
  aethanRetinue:{title:"Aethanova družina",kind:"Osoba",stages:[stage("Mladý šlechtic",art("manor",2),{coin:2},{coin:3},3,"Získej produkci jiné osoby.",[1],{action:"copy-production",targetKind:"Osoba"}),stage("Přední šlechtic",art("manor",4),{coin:3},null,8,"Zůstává ve hře.",[],{stays:true})]},
  bodyguard:{title:"Osobní stráž",kind:"Osoba",stages:[stage("Strážce",art("manor",2),{sword:1},{metal:2},2,"",[1]),stage("Osobní stráž",art("manor",3),{sword:2},null,7,"Chrání cenné karty panství.",[],{stays:true})]},
  smallTown:{title:"Malé město",kind:"Budova",stages:[stage("Malé město",art("meadow",2),{coin:2},{wood:2,stone:2},4,"",[1]),stage("Město na kopci",art("manor",2),{coin:3},{wood:3,stone:3},8,"",[2]),stage("Velké město",art("manor",3),{coin:3,goods:1},{metal:2},12,"",[3]),stage("Slavné město",art("manor",4),{coin:4,goods:1},null,18,"Objev Camelot 106.",[],{action:"future-discovery",discoverNumber:106,future:"Camelot"})]},
  camelot:{title:"Camelot",kind:"Budova",stages:[stage("Camelot",art("manor",1),{coin:3},{stone:3},10,"",[1]),stage("Rozšířený Camelot",art("manor",2),{coin:3,goods:1},{stone:4},15,"",[2]),stage("Velký Camelot",art("manor",3),{coin:4,goods:1},{metal:2},20,"",[3]),stage("Legendární Camelot",art("manor",4),{coin:5,goods:2},null,30,"Na konci období přidej další bodovou slávu.",[])]},
  mysteryArtifact:{title:"Tajemný artefakt",kind:"Permanentní",permanent:true,stages:[stage("Tajemný artefakt",art("mountain",4),{},null,10,"Nelze jej zničit. Jeho skutečný účel zůstává záhadou.",[])]},
  envoyTrader:{title:"Zahraniční obchodník",kind:"Osoba",stages:[stage("Směnárník",art("market",1),{}, {coin:2},1,"Zaplať minci a získej dřevo.",[1],{action:"trade",options:["wood"]}),stage("Obchodník",art("market",2),{}, {coin:3},3,"Zaplať minci a získej dřevo nebo kámen.",[2],{action:"trade",options:["wood","stone"]}),stage("Velkoobchodník",art("market",3),{}, {coin:4},6,"Zaplať minci a získej dřevo, kámen nebo kov.",[3],{action:"trade",options:["wood","stone","metal"]}),stage("Kupecký princ",art("market",4),{coin:2,goods:1},null,10,"",[])]},
  investor:{title:"Investor",kind:"Osoba",stages:[stage("Investor",art("market",1),{},null,1,"Získej 4 mince a kartu otoč.",[1],{action:"investment",amount:4}),stage("Velký investor",art("market",2),{},null,2,"Získej 5 mincí a kartu otoč.",[2],{action:"investment",amount:5}),stage("Mecenáš",art("manor",3),{},null,4,"Získej 6 mincí a kartu otoč.",[3],{action:"investment",amount:6}),stage("Usedlý investor",art("manor",4),{coin:2},null,6,"",[])]},
  allyChoice:{title:"Spojenec",kind:"Osoba",chooseOnDiscover:true,stages:[stage("Věrný spojenec",art("manor",2),{sword:1},null,6,"Zůstává ve hře.",[],{stays:true}),stage("Mocná spojenkyně",art("manor",4),{coin:2},null,8,"Obětuj jinou osobu a posuň trvalý cíl.",[])]},
  consortChoice:{title:"Královská choť",kind:"Osoba",chooseOnDiscover:true,stages:[stage("Moudrá choť",art("manor",4),{coin:3},null,10,"",[]),stage("Bojovná choť",art("manor",3),{sword:2},null,10,"",[])]},
  grandCastle:{title:"Velkolepý hrad",kind:"Budova",stages:[stage("Velkolepý hrad",art("manor",3),{sword:2},{stone:4},12,"Zahraj kartu z odhazovacího balíčku.",[1],{action:"retrieve",retrieveKinds:null}),stage("Královský palác",art("manor",4),{sword:2,coin:2},null,20,"Zahraj kartu z odhazovacího balíčku.",[],{action:"retrieve",retrieveKinds:null})]},
  grandMine:{title:"Velkolepý důl",kind:"Budova",stages:[stage("Velkolepý důl",art("mountain",3),{stone:2,metal:2},{wood:3},10,"",[1]),stage("Královský důl",art("mountain",4),{stone:2,metal:3,goods:1},null,18,"",[])]},
  grandTemple:{title:"Velkolepý chrám",kind:"Budova",stages:[stage("Velkolepý chrám",art("manor",3),{coin:2},{stone:3},12,"Až pět jiných karet může zůstat ve hře.",[1],{stays:true}),stage("Nejvyšší chrám",art("manor",4),{coin:3,goods:1},null,22,"Až pět jiných karet může zůstat ve hře.",[],{stays:true})]},
  pinePond:{title:"Borový les / Rybník",kind:"Krajina",chooseOnDiscover:true,stages:[stage("Borový les",art("forest",3),{wood:3},null,4,"",[]),stage("Rybník",art("meadow",3),{coin:2,goods:1},null,5,"",[])]},
  boulderMushroom:{title:"Balvany / Houby",kind:"Krajina",chooseOnDiscover:true,stages:[stage("Balvany",art("mountain",2),{stone:3},null,4,"",[]),stage("Houby",art("forest",2),{goods:2},null,5,"",[])]},
  deepDig:{title:"Hluboký důl",kind:"Krajina",stages:[stage("Průzkumný vrt",art("mountain",1),{stone:1},{stone:2},1,"",[1]),stage("Hluboká šachta",art("mountain",2),{stone:2},{metal:2},4,"",[2]),stage("Staré naleziště",art("mountain",3),{metal:2},{goods:2},8,"",[3]),stage("Legendární žíla",art("mountain",4),{metal:2,goods:1},null,12,"Ukonči tah a získej další bodovou slávu.",[])]},
  changingLand:{title:"Proměnlivá krajina",kind:"Krajina",stages:[stage("Jarní údolí",art("meadow",1),{coin:2},{wood:1},1,"Po použití se promění.",[1]),stage("Letní pole",art("meadow",3),{wood:2},{stone:1},2,"Po použití se promění.",[2]),stage("Podzimní háj",art("forest",3),{goods:1,coin:1},{coin:1},3,"Po použití se promění.",[3]),stage("Zimní kraj",art("mountain",1),{stone:2},null,4,"",[])]},
  watchtower:{title:"Strategická výšina",kind:"Krajina",stages:[stage("Strategická výšina",art("mountain",1),{stone:1},{stone:2},0,"Vyber Strážní věž nebo Dvojitou hradbu.",[1,2]),stage("Strážní věž",art("manor",2),{sword:1},null,6,"Vidíš dvě vrchní karty balíčku.",[],{stays:true,kind:"Budova"}),stage("Dvojitá hradba",art("manor",3),{sword:2},null,10,"Získává body za každou Hradbu.",[],{stays:true,kind:"Budova"})]},
  fortifiedPlain:{title:"Opevněná pláň",kind:"Krajina",stages:[stage("Opevněná pláň",art("meadow",1),{coin:1},{stone:2},0,"Vyber Hradbu nebo Most přes příkop.",[1,2]),stage("Hradba",art("manor",2),{sword:1},null,5,"",[],{stays:true,kind:"Budova"}),stage("Most přes příkop",art("meadow",4),{coin:2},null,7,"Zaplať minci a zahraj osobu z odhazovacího balíčku.",[],{action:"retrieve",retrieveKinds:["Osoba"],kind:"Budova"})]},
  windHill:{title:"Větrný kopec",kind:"Krajina",stages:[stage("Větrný kopec",art("meadow",1),{coin:1},{stone:2},0,"Vyber Hradbu nebo Větrný mlýn.",[1,2]),stage("Hradba na kopci",art("manor",3),{sword:2},null,7,"",[],{stays:true,kind:"Budova"}),stage("Větrný mlýn",art("meadow",4),{coin:2,goods:1},null,8,"",[],{kind:"Budova"})]},
  raider:{title:"Nájezdník",kind:"Osoba",stages:[stage("Nájezdník",art("market",2),{}, {coin:2},0,"Odhoď a získej libovolnou surovinu.",[1],{action:"choose-production",options:["coin","wood","stone","metal","sword","goods"]}),stage("Zkušený nájezdník",art("market",3),{}, {coin:3},2,"Odhoď a získej dvě libovolné suroviny.",[2],{action:"free-resources",amount:2}),stage("Mistr nájezdů",art("market",4),{}, {coin:4},5,"Odhoď a získej dvě libovolné suroviny.",[3],{action:"free-resources",amount:2}),stage("Legenda nájezdů",art("manor",4),{},null,9,"Odhoď a získej tři libovolné suroviny.",[],{action:"free-resources",amount:3})]},
  rival:{title:"Rival",kind:"Nepřítel",stages:[stage("Rival",art("manor",3),{},null,-20,"Lord Nimrod jej musí čtyřikrát překonat.",[],{stays:true}),stage("Poražený rival",art("manor",4),{coin:2},null,10,"Získej produkci zvolené osoby.",[],{action:"copy-production",targetKind:"Osoba",kind:"Osoba"})]},
  skilledBanditBuilding:{title:"Zkušený bandita",kind:"Nepřítel",stages:[stage("Zkušený bandita",art("forest",4),{},null,-5,"Při vyložení zablokuje až 3 přátelské karty s produkcí. Utrať 3 síly: poraz jej a získej libovolné 3 suroviny.",[],{action:"defeat-bandit",defeatCost:3,rewardCount:3,onPlay:"block-production",blockCount:3}),stage("Dělník",art("manor",2),{},null,0,"Odhoď tuto kartu: získej produkci zvolené budovy ve hře.",[],{action:"copy-production",targetKind:"Budova",kind:"Osoba"})]},
  darkPrince:{title:"Temný princ",kind:"Nepřítel",stages:[stage("Temný princ",art("manor",4),{},null,-7,"Dokud je ve hře, nelze dobírat další karty, vylepšovat ani používat časové efekty. Utrať 5 síly a poraz jej.",[],{action:"defeat-dark-prince",advanceLock:true}),stage("Ohromený chlapec",art("manor",1),{}, {metal:1,sword:1},0,"Znič tuto kartu a získej 2 síly.",[2],{action:"destroy-for-swords",amount:2,kind:"Osoba"}),stage("Panoš",art("manor",2),{sword:1},{metal:2},3,"Znič tuto kartu a získej 3 síly.",[3],{action:"destroy-for-swords",amount:3,kind:"Osoba"}),stage("Sir ochránce",art("manor",4),{sword:2},null,3,"Zkušený rytíř chrání panství.",[],{kind:"Osoba"})]},
  warriorCamp:{title:"Vojenský tábor",kind:"Krajina",stages:[stage("Tábor",art("forest",2),{coin:1,wood:1,metal:1},{coin:1,wood:1,metal:1},0,"",[1]),stage("Cvičiště",art("meadow",2),{metal:2},{metal:2},1,"Zaplať 1 minci a získej 1 sílu.",[2],{action:"train-soldier"}),stage("Rytířské ležení",art("manor",4),{sword:2},null,3,"",[],{kind:"Osoba"})]},
  farFields:{title:"Vzdálená pole",kind:"Krajina",branchCosts:{1:{wood:2,stone:2},2:{stone:4}},stages:[stage("Vzdálená pole",art("meadow",1),{coin:1},{wood:2,stone:2},0,"Vybuduj Hostinec, nebo Hradbu.",[1,2]),stage("Hostinec",art("market",2),{coin:2},{coin:6},2,"",[3],{kind:"Budova"}),stage("Hradba",art("manor",3),{},null,3,"Zůstává ve hře.",[],{kind:"Budova",stays:true}),stage("Hostinská",art("market",4),{},null,3,"Odhoď jinou osobu a získej libovolné 2 suroviny.",[],{kind:"Osoba",action:"innkeeper"})]},
  skilledBanditLand:{title:"Zkušený bandita",kind:"Nepřítel",stages:[stage("Zkušený bandita",art("forest",4),{},null,-5,"Při vyložení zablokuje až 3 přátelské karty s produkcí. Utrať 3 síly: poraz jej a získej libovolné 3 suroviny.",[],{action:"defeat-bandit",defeatCost:3,rewardCount:3,onPlay:"block-production",blockCount:3}),stage("Polní dělnice",art("meadow",3),{},null,0,"Odhoď tuto kartu: získej produkci zvolené krajiny ve hře.",[],{action:"copy-production",targetKind:"Krajina",kind:"Osoba"})]},
  tornado:{title:"Tornádo",kind:"Událost",stages:[stage("Tornádo",art("meadow",4),{},null,0,"Zůstává ve hře. Na konci období znič 3 přátelské nepermanentní karty, poté kartu otoč.",[],{stays:true,endRound:"tornado"}),stage("Povodeň",art("market",4),{},null,0,"Zablokuje až 5 budov. Na konci období znič Povodeň a jednu budovu.",[],{stays:true,onPlay:"block-building",blockCount:5,endRound:"flood"})]},
  princess:{title:"Mladá princezna",kind:"Osoba",stages:[stage("Mladá princezna",art("manor",1),{},null,2,"Na konci tahu odhoď 2 osoby, nebo se z ní stane Rozmazlená princezna. Obětuj 2 osoby, 2 krajiny a 2 budovy: vzdělej ji.",[],{stays:true,action:"educate-princess"}),stage("Rozmazlená princezna",art("manor",2),{},null,0,"Při vyložení odhoď 3 jiné přátelské karty. Obětuj 2 osoby: vzdělej ji.",[],{action:"reform-princess",onPlay:"discard-three"}),stage("Vzdělaná princezna",art("manor",4),{},null,8,"Odhoď tuto kartu a získej libovolnou 1 surovinu.",[],{action:"choose-production",options:["coin","wood","stone","metal","sword","goods"]})]},
  sickness:{title:"Nemoc",kind:"Událost",branchCosts:{1:{coin:1},2:{goods:7}},stages:[stage("Nemoc",art("manor",1),{}, {coin:1},-8,"Při vyložení odhoď 2 vrchní karty. Zvol levnou amputaci, nebo drahou léčbu.",[1,2],{onPlay:"sickness"}),stage("Zmrzačení",art("manor",2),{},null,-2,"Tento následek je permanentní.",[],{permanent:true,kind:"Permanentní · Stav"}),stage("Hostina",art("manor",4),{},null,2,"Znič tuto kartu a získej libovolnou 1 surovinu.",[],{action:"feast"})]},
  finalNotice:{title:"Závěr kroniky",kind:"Listina",stages:[stage("Závěr kroniky",art("manor",4),{},null,0,"Objev poslední dvě karty 069 a 070. Následující období je závěrečné.",[])]},
  finalChoice:{title:"Poslední úprava / Hostina",kind:"Událost",chooseOnDiscover:true,stages:[stage("Poslední úprava",art("manor",3),{},null,0,"Znič tuto kartu a trvale posil jednu přátelskou kartu.",[],{action:"finishing-touch"}),stage("Banket",art("manor",4),{},null,0,"Znič tuto kartu a získej libovolné 4 suroviny.",[],{action:"banquet"})]},
  finalRoyalChoice:{title:"Královská návštěva / Inkvizitor",kind:"Událost",chooseOnDiscover:true,stages:[stage("Královská návštěva",art("manor",4),{},null,2,"Znič tuto kartu a trvale sniž cenu jednoho vylepšení o 1 surovinu.",[],{action:"reduce-upgrade"}),stage("Inkvizitor",art("manor",2),{coin:1},null,0,"Znič tuto kartu a jednu nepřátelskou kartu v panství.",[],{kind:"Osoba",action:"destroy-negative"})]},
  vassal:{title:"Pohraniční země",kind:"Nepřítel · Krajina",stages:[stage("Pohraniční země",art("mountain",4),{}, {sword:10},0,"Utrácej sílu a trvale sniž cenu dobytí.",[1]),stage("Okupace",art("mountain",3),{}, {sword:9},0,"Pokračuj v dobývání.",[2],{kind:"Událost"}),stage("Nepoddajná města",art("manor",3),{}, {sword:8},0,"Po vylepšení zapiš 20 bodů na poslední stav.",[3],{kind:"Krajina"}),stage("Vazalské státy",art("meadow",4),{},null,20,"Resetuj kartu a můžeš ji dobývat znovu.",[0],{kind:"Krajina",action:"reset-vassal"})]}
};

const initialCards = ["meadow","meadow","meadow","meadow","mountain","mountain","forest","forest","headquarters","trader"].map((template,index)=>({number:index+1,template}));
const discoveryQueue = ["jungle","river","workerChoice","banditWorker","mountain","banditField","church","cliffs","forest","swamp","swamp","lake"].map((template,index)=>({number:index+11,template})).concat([{number:23,template:"legacyNotice"},{number:28,template:"volcano"},{number:29,template:"opportunist"},{number:30,template:"immigrantDecree"},{number:35,template:"mountain"},{number:36,template:"mercenary"},{number:37,template:"ambitionsDecree"},{number:38,template:"populationGoal"},{number:39,template:"expansionGoal"},{number:40,template:"loyaltyGoal"},{number:41,template:"courtChoice"},{number:42,template:"workerStorage"},{number:43,template:"mason"},{number:44,template:"weather"},{number:45,template:"darkKnight"},{number:46,template:"camp"},{number:47,template:"secondImmigration"},{number:52,template:"mightyMound"},{number:53,template:"witch"},{number:54,template:"scribe"},{number:55,template:"lordChoice"},{number:56,template:"plague"},{number:57,template:"assassin"},{number:58,template:"cityFire"},{number:59,template:"mysteriousCave"},{number:60,template:"skilledBanditBuilding"},{number:61,template:"darkPrince"},{number:62,template:"warriorCamp"},{number:63,template:"farFields"},{number:64,template:"skilledBanditLand"},{number:65,template:"tornado"},{number:66,template:"princess"},{number:67,template:"sickness"},{number:68,template:"finalNotice"}]);
const catalog={23:"legacyNotice",24:"fertileDecree",25:"army",26:"treasury",27:"exportTrack",28:"volcano",29:"opportunist",31:"entrepreneur",32:"scientist",33:"engineer",34:"inventor",35:"mountain",36:"mercenary",37:"ambitionsDecree",38:"populationGoal",39:"expansionGoal",40:"loyaltyGoal",41:"courtChoice",42:"workerStorage",43:"mason",44:"weather",45:"darkKnight",46:"camp",47:"secondImmigration",48:"envoy",49:"royalArchitect",50:"traveller",51:"strategist",52:"mightyMound",53:"witch",54:"scribe",55:"lordChoice",56:"plague",57:"assassin",58:"cityFire",59:"mysteriousCave",60:"skilledBanditBuilding",61:"darkPrince",62:"warriorCamp",63:"farFields",64:"skilledBanditLand",65:"tornado",66:"princess",67:"sickness",68:"finalNotice",69:"finalChoice",70:"finalRoyalChoice",71:"mountain",72:"forest",73:"canyon",74:"shore",75:"shore",76:"pirate",77:"lagoon",78:"courtRecord",79:"academyHall",80:"aethanRetinue",81:"bodyguard",82:"shrine",83:"shrine",84:"mine",85:"mine",86:"dubbing",87:"quests",88:"stoneMonument",89:"buildingProject",90:"jewelry",91:"ark",92:"stranger",93:"treasure",94:"curseChoice",95:"astronomer",96:"alchemist",97:"printingPress",98:"calendar",99:"workshop",100:"improvedLumber",101:"improvedBarns",102:"improvedFishing",103:"missionary",104:"priest",105:"smallTown",106:"camelot",107:"royalChoice",108:"mysteryArtifact",109:"guild",110:"barnProject",111:"mint",112:"stable",113:"horseCoin",114:"horseWood",115:"horseChoice",116:"nobleChoice",117:"tradeRelations",118:"school",119:"envoyTrader",120:"investor",121:"allyChoice",122:"consortChoice",123:"grandCastle",124:"grandMine",125:"grandTemple",126:"pinePond",127:"boulderMushroom",128:"deepDig",129:"changingLand",130:"watchtower",131:"fortifiedPlain",132:"windHill",133:"raider",134:"rival",135:"vassal"};
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
let pendingRoundResolve = null;
let pendingTurnResolve = null;
const savedColumns = Number(localStorage.getItem("patria-max-columns"));
let maxColumns = Number.isInteger(savedColumns)&&savedColumns>=2&&savedColumns<=8 ? savedColumns : 6;
let showCardNumbers = localStorage.getItem("patria-show-card-numbers") === "true";
const savedProductionConfirmation=localStorage.getItem("patria-confirm-production");
let confirmProductionSetting=savedProductionConfirmation===null?(matchMedia("(pointer: coarse)").matches||innerWidth<760):savedProductionConfirmation==="true";
let debugMode=localStorage.getItem("patria-debug-mode")==="true";

function newGame() {
  state = {
    round: 1, turn: 1,
    resources: emptyResources(),
    cards: initialCards.map(spec => ({ id: spec.number, number: spec.number, template: spec.template, state: 0 })),
    deck: [], slots: Array(80).fill(null), discard: [], inactive: new Set(), blocked: {}, busy: false,
    permanents: [], specials: [],
    discoveries: discoveryQueue.map(spec=>({...spec})),
    history: ["Panství bylo založeno. První kolo začíná."],
    selectedCard: null, decreePending:null, permanentIntroQueue:[], immigrantChoices:[], finalRound:false,
  };
  startRound();
}

function serializableState(phase="turn"){
  return {version:3,phase,savedAt:new Date().toISOString(),round:state.round,turn:state.turn,resources:state.resources,cards:state.cards,deck:state.deck,slots:state.slots,discard:state.discard,inactive:[...state.inactive],blocked:state.blocked,discoveries:state.discoveries,permanents:state.permanents,specials:state.specials,decreePending:state.decreePending,permanentIntroQueue:state.permanentIntroQueue||[],immigrantChoices:state.immigrantChoices||[],finalRound:!!state.finalRound};
}
function autosave(phase="turn"){localStorage.setItem("patria-autosave",JSON.stringify(serializableState(phase)));}
function applySavedState(saved){
  if(!saved||!Array.isArray(saved.cards)||!Array.isArray(saved.deck)||!Array.isArray(saved.discard))throw new Error("Neplatný soubor uložené hry.");
  state={...saved,inactive:new Set(saved.inactive||[]),blocked:saved.blocked||{},resources:{...emptyResources(),...(saved.resources||{})},permanents:saved.permanents||[],specials:saved.specials||[],discoveries:saved.discoveries||[],slots:[...(saved.slots||[])],permanentIntroQueue:saved.permanentIntroQueue||[],immigrantChoices:saved.immigrantChoices||[],busy:false,selectedCard:null};
  while(state.slots.length<80)state.slots.push(null);
  migrateCampaignQueue();render();
  document.querySelector("#welcome-screen").hidden=true;
  if(saved.phase==="intermission"){
    if(saved.finalRound)showFinalScore();
    else{
      state.busy=true;
      showRoundTransition(state.round,state.round+1).then(()=>{state.round+=1;state.turn=1;state.busy=false;startRound();});
    }
  }else{
    const unresolved=activeIds().filter(id=>{const card=getCard(id);return card&&["block-coin","block-land-building","block-production","block-building","assassin"].includes(getStage(card).onPlay);});
    queueBanditBlocks(unresolved);
  }
  return true;
}
function restoreAutosave(){
  const raw=localStorage.getItem("patria-autosave");if(!raw)return false;
  try{return applySavedState(JSON.parse(raw));}catch{return false;}
}
function migrateCampaignQueue(){
  const known=new Set([...state.cards,...state.permanents,...state.specials,...state.discoveries].map(item=>item.number));
  if(state.finalRound)known.add(68);
  // Starší uložené hry zůstaly po odemknutí permanentů bez další dvojice karet.
  // Pokud v uložené partii ještě není nic z druhé části kampaně, doplň její vstupní karty.
  if((state.round||1)<=9){
    const missing=[];
    if(!known.has(28)){missing.push({number:28,template:"volcano"});known.add(28);}
    if(!known.has(29)){missing.push({number:29,template:"opportunist"});known.add(29);}
    if(missing.length)state.discoveries=[...missing,...state.discoveries];
  }
  if(![31,32,33,34].some(number=>known.has(number))&&!known.has(30))state.discoveries.push({number:30,template:"immigrantDecree"});
  if(!known.has(35))state.discoveries.push({number:35,template:"mountain"});
  if(!known.has(36))state.discoveries.push({number:36,template:"mercenary"});
  discoveryQueue.filter(spec=>spec.number>=37&&!known.has(spec.number)).forEach(spec=>state.discoveries.push({...spec}));
}
function showWelcome(){
  closeDialogs();
  document.querySelector("#continue-game-button").hidden=!(state||localStorage.getItem("patria-autosave"));
  document.querySelector("#welcome-screen").hidden=false;
  hideSettingsMenu();
}
function startFromWelcome(){document.querySelector("#welcome-screen").hidden=true;localStorage.removeItem("patria-autosave");newGame();}
function continueFromWelcome(){
  document.querySelector("#welcome-screen").hidden=true;
  if(state){render();return;}
  if(!restoreAutosave()){showWelcome();notify("Uloženou hru se nepodařilo načíst.");}
}
async function loadGameFile(file){
  if(!file)return;
  try{const saved=JSON.parse(await file.text());applySavedState(saved);localStorage.setItem("patria-autosave",JSON.stringify(serializableState(saved.phase==="intermission"?"intermission":"turn")));notify("Uložená hra byla načtena.");}
  catch(error){showWelcome();notify(error?.message||"Soubor uložené hry se nepodařilo načíst.");}
}

function emptyResources() { return Object.fromEntries(Object.keys(R).map(k => [k,0])); }
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}
function getCard(id) { return state.cards.find(card => card.id === id) || state.permanents.find(card => card.id === id) || state.specials.find(card => card.id === id); }
function getTemplate(card) { return templates[card.template]; }
function cardAsset(card,stageIndex=card.state){return `assets/${String(card.number??card.id).padStart(3,"0")}${String.fromCharCode(97+stageIndex)}.jpg?v=${BUILD_NUMBER}`;}
function getStage(card) { return getTemplate(card).stages[card.state]; }
function getKind(card,stageIndex=card.state){const template=getTemplate(card);return template.stages[stageIndex].kind||template.kind;}
function isBlocked(cardOrId){const id=typeof cardOrId==="object"?cardOrId?.id:cardOrId;return id!==undefined&&id!==null&&Boolean(state.blocked[id]);}
function isFriendly(card){return !!card&&!getKind(card).includes("Nepřítel")&&!isBlocked(card);}
function formatBundle(bundle = {}) { return Object.entries(bundle).filter(([,v])=>v).map(([k,v])=>`${R[k].icon} ${v}`).join("  ") || "—"; }
function expandedBundle(bundle = {}) { return Object.entries(bundle||{}).flatMap(([key,value])=>Array.from({length:value},()=>R[key].icon)).join("") || "—"; }
function productionIcons(bundle = {}) { return Object.entries(bundle).flatMap(([key,value])=>Array.from({length:value},()=>`<span class="production-item" aria-hidden="true">${R[key].icon}</span>`)).join(""); }
function canAfford(cost = {}) { return Object.entries(cost).every(([k,v]) => state.resources[k] >= v); }
function spend(cost = {}) { Object.entries(cost).forEach(([k,v]) => state.resources[k] -= v); }
function gain(bundle = {}) { Object.entries(bundle).forEach(([k,v]) => state.resources[k] += v); }
function getProduction(card,stageIndex=card.state){const base=getTemplate(card).stages[stageIndex].production||{},bonus=card.productionBonus?.[stageIndex]||{};const merged={...base};Object.entries(bonus).forEach(([key,value])=>merged[key]=(merged[key]||0)+value);const active=activeIds().map(getCard);const scientist=active.find(other=>other&&getStage(other).personCoinAura);if(scientist&&getKind(card,stageIndex).includes("Osoba")&&slotOf(card.id)>=0)merged.coin=(merged.coin||0)+1;const rain=active.find(other=>other&&getStage(other).landCoinAura);if(rain&&getKind(card,stageIndex).includes("Krajina")&&slotOf(card.id)>=0)merged.coin=(merged.coin||0)+getStage(rain).landCoinAura;return merged;}
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
  if ([25,26,27,38,39,40,87,88,90,91,108,117].includes(number)) {const permanent=installPermanent(number);if(permanent&&!state.permanentIntroQueue.includes(number))state.permanentIntroQueue.push(number);return permanent;}
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
  autosave("turn");
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
  drawn.forEach(id=>{const card=getCard(id),onPlay=getStage(card)?.onPlay;if(onPlay==="storm"){for(let i=0;i<3&&state.deck.length;i++)state.discard.push(state.deck.shift());card.state=1;notify("Bouře odhodila tři vrchní karty. Přichází déšť.");}if(onPlay==="sickness"){for(let i=0;i<2&&state.deck.length;i++)state.discard.push(state.deck.shift());notify("Nemoc odhodila dvě vrchní karty balíčku.");}});
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
  if (state.busy || state.inactive.has(id) || slotOf(id) < 0 || isBlocked(id)) return;
  const card=getCard(id), current=getStage(card), action=forcedAction||current.action;
  if (action === "sacrifice-coin") {
    const choices=activeIds().filter(otherId => otherId !== id&&isFriendly(getCard(otherId)));
    if (!choices.length) return notify("Potřebuješ další aktivní kartu.");
    pendingDiscard={sourceId:id,choices,selectedId:choices[0]};
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
  if(action==="free-resources"){state.busy=false;return showResourceChoice(id,Object.keys(R),current.amount||1,{discard:true});}
  if (action === "jungle-wood") {
    if(!canAfford({coin:1})){state.busy=false;return notify("Chybí 1 mince.");}
    spend({coin:1});gain({wood:current.amount});await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="copy-production") { state.busy=false; return showCardTargetChoice(id,current.targetKind); }
  if(action==="priest-upgrade"||action==="cardinal-upgrade"||action==="school-upgrade"){
    const choices=activeIds().filter(otherId=>otherId!==id&&isFriendly(getCard(otherId))&&getStage(getCard(otherId)).next.length);
    if(!choices.length){state.busy=false;return notify("Ve hře není karta, kterou lze vylepšit.");}
    state.busy=false;pendingActionChoice={type:"action-upgrade",sourceId:id,choices,selectedId:null,targetState:null,extraPay:action==="priest-upgrade"?{coin:2}:null,free:action==="school-upgrade",endTurn:action==="school-upgrade",advanceSource:action==="school-upgrade"};return renderActionChoice();
  }
  if(action==="school-boost"){
    const choices=activeIds().filter(otherId=>otherId!==id&&isFriendly(getCard(otherId))&&getKind(getCard(otherId)).includes("Osoba"));
    if(!choices.length){state.busy=false;return notify("Ve hře není osoba, kterou lze posílit.");}
    state.busy=false;pendingActionChoice={type:"school-boost",sourceId:id,choices,selectedId:null,selectedResource:null};return renderActionChoice();
  }
  if(action==="improve-self"){
    state.busy=false;pendingActionChoice={type:"self-boost",sourceId:id,side:1,selectedResource:null};return renderActionChoice();
  }
  if(action==="pirate-ally"){
    state.busy=false;pendingActionChoice={type:"pirate-ally",sourceId:id,mode:null};return renderActionChoice();
  }
  if(action==="defeat-bandit") {
    const cost=current.defeatCost||1,count=current.rewardCount||2;if(!canAfford({sword:cost})){state.busy=false;return notify(`Chybí ${cost} síly.`);}
    state.busy=false;return showResourceChoice(id,Object.keys(R),count,{pay:{sword:cost},destroy:true});
  }
  if(action==="defeat-backstabber"){
    if(!canAfford({sword:4})){state.busy=false;return notify("Chybí 4 síly.");}spend({sword:4});destroyCard(id);state.busy=false;render();return;
  }
  if(action==="defeat-pirate"){
    if(!canAfford({sword:1})){state.busy=false;return notify("Chybí 1 síla.");}spend({sword:1});destroyCard(id);const lagoon=discoverCard(77);state.busy=false;render();if(lagoon)notify("Laguna byla objevena.");return;
  }
  if(action==="convert-bandit") {
    const missionaryId=activeIds().find(otherId=>getCard(otherId).template==="missionary"&&getCard(otherId).state===0);
    const banditTemplates=["banditWorker","banditField","skilledBanditBuilding","skilledBanditLand"],bandit=banditTemplates.includes(card.template)?card:activeIds().map(getCard).find(other=>banditTemplates.includes(other.template)&&other.state===0);
    if(!missionaryId||!bandit){state.busy=false;return notify("Misionář a Bandita musí být současně ve hře.");}
    if(!canAfford({coin:3})){state.busy=false;return notify("Chybí 3 mince.");}
    spend({coin:3});bandit.state=1;delete state.blocked[bandit.id];Object.keys(state.blocked).forEach(victim=>{if(state.blocked[victim]===bandit.id)delete state.blocked[victim];});
    await animateDiscard([missionaryId,bandit.id]);discardCard(missionaryId);discardCard(bandit.id);state.busy=false;render();return;
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
    const number=current.discoverNumber||Number(current.future?.match(/\d+/)?.[0]);
    if(number===103&&getCard(103)){state.busy=false;return notify("Misionář už byl povolán.");}
    if(current.pay&&!canAfford(current.pay)){state.busy=false;return notify(`Chybí suroviny: ${formatBundle(current.pay)}.`);}
    if(current.pay)spend(current.pay);if(number)discoverCard(number);await animateDiscard([id]);discardCard(id);state.busy=false;render();notify(`${current.future} přichází do tvého panství.`);return;
  }
  if(current.action==="discover-mine"||current.action==="discover-shrine") {
    state.busy=false;return showDiscoveryChoice(id,current.action==="discover-mine"?[84,85]:[82,83],{destroy:true});
  }
  if(action==="coin-per-person"){
    gain({coin:activeIds().filter(otherId=>getKind(getCard(otherId)).includes("Osoba")).length});await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="discover-with-person"){
    const choices=activeIds().filter(otherId=>otherId!==id&&isFriendly(getCard(otherId))&&getKind(getCard(otherId)).includes("Osoba"));if(!choices.length){state.busy=false;return notify("Ve hře není jiná osoba, kterou lze odhodit.");}
    state.busy=false;pendingActionChoice={type:"person-discovery",sourceId:id,choices,selectedId:null,discoverNumber:current.discoverNumber};return renderActionChoice();
  }
  if(action==="engineer-improve"){
    const replacements={};activeIds().forEach(otherId=>{const other=getCard(otherId);if(other.template==="forest"&&other.state===2)replacements[otherId]=100;if(other.template==="meadow"&&other.state===3)replacements[otherId]=101;if(other.template==="lake"&&other.state===2)replacements[otherId]=102;});
    const choices=Object.keys(replacements).map(Number);if(!choices.length){state.busy=false;return notify("Ve hře není Dřevorubecká osada, Sýpky ani Rybářská loď.");}
    state.busy=false;pendingActionChoice={type:"engineer",sourceId:id,choices,selectedId:null,replacements};return renderActionChoice();
  }
  if(action==="trebuchet"){
    const choices=state.cards.filter(other=>other.id!==id&&getKind(other).includes("Nepřítel")).map(other=>other.id);if(!choices.length){state.busy=false;return notify("V panství není nepřítel, kterého lze porazit.");}
    state.busy=false;pendingActionChoice={type:"trebuchet",sourceId:id,choices,selectedId:null};return renderActionChoice();
  }
  if(action==="inventor-reset"){
    const count=(card.marks||0)+1;state.busy=false;const inventions=[97,98,99].filter(number=>!getCard(number));
    pendingActionChoice={type:"inventor",sourceId:id,choices:inventions,selectedId:null,selected:[],count,options:Object.keys(R),mode:inventions.length?null:"resources"};return renderActionChoice();
  }
  if(action==="mercenary-marks"){
    if(!canAfford({coin:2})){state.busy=false;return notify("Chybí 2 mince.");}state.busy=false;pendingActionChoice={type:"mercenary",sourceId:id,markCount:Math.min(2,8-(card.marks||0))};return renderActionChoice();
  }
  if(action==="knight-train"){
    if((card.training||0)>=2){state.busy=false;return notify("Rytíř už získal obě posílení.");}if(!canAfford({metal:3})){state.busy=false;return notify("Chybí 3 kovy.");}
    spend({metal:3});card.training=(card.training||0)+1;card.productionBonus??={};card.productionBonus[1]??={};card.productionBonus[1].sword=(card.productionBonus[1].sword||0)+1;await animateDiscard([id]);discardCard(id);state.busy=false;render();return endTurn(false);
  }
  if(action==="mason-project"){state.busy=false;return showDiscoveryChoice(id,[88,89],{pay:{coin:2},discard:true});}
  if(action==="discover-guild-or-barn"){state.busy=false;return showDiscoveryChoice(id,[109,110],{discard:true});}
  if(action==="discover-mint-or-stable"){state.busy=false;return showDiscoveryChoice(id,[111,112],{discard:true});}
  if(action==="defeat-dark-knight"){
    if(!canAfford({sword:3})){state.busy=false;return notify("Chybí 3 síly.");}spend({sword:3});card.state=1;await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="destroy-for-swords"){gain({sword:current.amount||2});destroyCard(id);state.busy=false;render();return;}
  if(action==="train-soldier"){
    if(!canAfford({coin:1})){state.busy=false;return notify("Chybí 1 mince.");}spend({coin:1});gain({sword:1});await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="jester"){
    if(state.deck.length)state.discard.push(state.deck.shift());card.marks=(card.marks||0)+1;gain(card.marks%3===0?{goods:1}:card.marks%2===0?{wood:1}:{coin:1});state.busy=false;render();return;
  }
  if(action==="merchant-marks"){
    card.marks=(card.marks||0)+1;const rewards=["coin","wood","stone","metal"];gain({[rewards[(card.marks-1)%rewards.length]]:1});await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="beekeeper"){
    card.marks=(card.marks||0)+1;if(card.marks===4){card.productionBonus??={};card.productionBonus[1]??={};card.productionBonus[1].coin=(card.productionBonus[1].coin||0)+1;notify("Včelaření dosáhlo čtvrtého stupně. Produkce vzrostla o 1 minci.");}await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="architect-project"){state.busy=false;return showDiscoveryChoice(id,[123,124,125],{discard:true});}
  if(action==="architect-bridge"){state.busy=false;return showDiscoveryChoice(id,[123],{discard:true});}
  if(action==="discover-reset"){const discovered=discoverCard(current.discoverNumber);card.state=0;await animateDiscard([id]);discardCard(id);state.busy=false;render();if(discovered)notify(`${getStage(discovered).name} přichází do panství.`);return;}
  if(action==="discover-scribe"){state.busy=false;return showDiscoveryChoice(id,[78,79],{resetState:0,discard:true});}
  if(action==="discover-aethan"||action==="discover-nimrod"){
    (action==="discover-aethan"?[80,81]:[133,134]).forEach(discoverCard);await animateDiscard([id]);discardCard(id);state.busy=false;render();notify("Nové navazující karty byly objeveny.");return;
  }
  if(action==="defeat-soldier"){
    if(!canAfford({sword:2})){state.busy=false;return notify("Chybí 2 síly.");}spend({sword:2});Object.keys(state.blocked).forEach(victim=>{if(state.blocked[victim]===id)delete state.blocked[victim];});destroyCard(id);state.busy=false;render();return;
  }
  if(action==="defeat-assassin"){
    if(!canAfford({sword:3})){state.busy=false;return notify("Chybí 3 síly.");}spend({sword:3});card.state=1;await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="investment"){gain({coin:current.amount||4});if(current.next.length)card.state=current.next[0];await animateDiscard([id]);discardCard(id);state.busy=false;render();return;}
  if(action==="grow-forest"){card.state=Math.min(card.state+1,getTemplate(card).stages.length-1);await animateDiscard([id]);discardCard(id);state.busy=false;render();return;}
  if(action==="reset-vassal"){card.state=0;await animateDiscard([id]);discardCard(id);state.busy=false;render();return;}
  if(action==="defeat-dark-prince"){
    if(!canAfford({sword:5})){state.busy=false;return notify("Chybí 5 síly.");}spend({sword:5});card.state=1;await animateDiscard([id]);discardCard(id);state.busy=false;render();return;
  }
  if(action==="feast"){state.busy=false;return showResourceChoice(id,Object.keys(R),1,{destroy:true});}
  if(action==="banquet"){state.busy=false;return showResourceChoice(id,Object.keys(R),4,{destroy:true});}
  if(action==="innkeeper"){
    const choices=activeIds().filter(otherId=>otherId!==id&&isFriendly(getCard(otherId))&&getKind(getCard(otherId)).includes("Osoba"));if(!choices.length){state.busy=false;return notify("Ve hře není jiná osoba.");}state.busy=false;pendingActionChoice={type:"sacrifice-reward",sourceId:id,choices,selectedId:null,count:2};return renderActionChoice();
  }
  if(action==="reduce-upgrade"){
    const choices=state.cards.filter(other=>other.id!==id&&getStage(other).next.length).map(other=>other.id);if(!choices.length){state.busy=false;return notify("V panství není karta s cenou vylepšení.");}state.busy=false;pendingActionChoice={type:"reduce-upgrade",sourceId:id,choices,selectedId:null};return renderActionChoice();
  }
  if(action==="destroy-negative"){
    const choices=state.cards.filter(other=>other.id!==id&&(getKind(other).includes("Nepřítel")||getStage(other).fame<0)).map(other=>other.id);if(!choices.length){state.busy=false;return notify("V panství není nepřátelská karta.");}state.busy=false;pendingActionChoice={type:"destroy-negative",sourceId:id,choices,selectedId:null};return renderActionChoice();
  }
  if(action==="finishing-touch"){
    const choices=state.cards.filter(other=>other.id!==id&&isFriendly(other)).map(other=>other.id);state.busy=false;pendingActionChoice={type:"finishing-touch",sourceId:id,choices,selectedId:null};return renderActionChoice();
  }
  if(action==="educate-princess"||action==="reform-princess"){
    const requirements=action==="educate-princess"?{Osoba:2,Krajina:2,Budova:2}:{Osoba:2},choices=state.cards.filter(other=>other.id!==id&&isFriendly(other)&&Object.keys(requirements).some(kind=>getKind(other).includes(kind))).map(other=>other.id);state.busy=false;pendingActionChoice={type:"princess-education",sourceId:id,choices,selected:[],requirements};return renderActionChoice();
  }
  if(["witch-choice","witch-hut","defeat-witch","defeat-witch-hut","soothe-witch","sacrifice-witch-hut"].includes(action)){
    const witchMode=["witch-choice","defeat-witch","soothe-witch"].includes(action),swordCost=witchMode?4:3;
    if(forcedAction==="defeat-witch"||forcedAction==="defeat-witch-hut"){
      if(!canAfford({sword:swordCost})){state.busy=false;return notify(`Chybí ${swordCost} síly.`);}spend({sword:swordCost});destroyCard(id);state.busy=false;render();return;
    }
    const needed=witchMode?3:1,choices=activeIds().filter(otherId=>otherId!==id&&isFriendly(getCard(otherId))&&getKind(getCard(otherId)).includes("Osoba"));
    if(choices.length<needed){state.busy=false;return notify(`Potřebuješ ${needed} ${needed===1?"osobu":"osoby"}.`);}state.busy=false;pendingActionChoice={type:"sacrifice",sourceId:id,choices,selected:[],count:needed,transform:witchMode};return renderActionChoice();
  }
  state.busy=false;
  notify("Tuto akci teď nelze provést.");
}

function renderDiscardChoice() {
  if (!pendingDiscard) return;
  const choices=(pendingDiscard.choices||[]).filter(id=>id!==pendingDiscard.sourceId&&slotOf(id)>=0&&isFriendly(getCard(id)));
  document.querySelector("#discard-choice-content").innerHTML=`
    <div class="dialog-header"><span class="eyebrow">Platba kartou</span><h2>Kterou kartu chceš odhodit?</h2><p>Zvolená karta i karta s efektem odejdou do odhazovacího balíčku.</p></div>
    <div class="discard-choices">${choices.map(id=>{
      const card=getCard(id), selected=id===pendingDiscard.selectedId;
      return `<button class="full-card-choice ${selected?"selected":""}" data-select-discard="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`;
    }).join("")}</div>
    <div class="upgrade-confirm-bar"><button class="secondary-action" data-close-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-discard type="button">Odhodit zvolenou kartu</button></div>`;
}

function selectDiscardCard(id) {
  if (!pendingDiscard || !(pendingDiscard.choices||[]).includes(id) || id===pendingDiscard.sourceId || slotOf(id)<0 || !isFriendly(getCard(id))) return;
  pendingDiscard.selectedId=id;
  renderDiscardChoice();
}

async function confirmDiscardChoice() {
  if (!pendingDiscard || state.busy) return;
  const {sourceId,selectedId}=pendingDiscard;
  if (slotOf(sourceId)<0 || slotOf(selectedId)<0 || !(pendingDiscard.choices||[]).includes(selectedId) || !isFriendly(getCard(selectedId))) return;
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
  const choices=activeIds().filter(id=>id!==sourceId&&isFriendly(getCard(id))&&getKind(getCard(id)).includes(targetKind)&&Object.values(getProduction(getCard(id))).some(Boolean));
  if(!choices.length)return notify(`Ve hře není vhodná karta typu ${targetKind.toLowerCase()}.`);
  pendingActionChoice={type:"card",sourceId,choices,selectedId:choices[0]};renderActionChoice();
}
function showDiscoveryChoice(sourceId,numbers,after={}) {
  const choices=numbers.filter(number=>catalog[number]&&!getCard(number));
  if(!choices.length)return notify("Všechny navazující karty už byly objeveny.");
  pendingActionChoice={type:"discover",sourceId,choices,selectedId:null,after};renderActionChoice();
}
function showSideChoice(card){pendingActionChoice={type:"side-choice",cardId:card.id,choices:getTemplate(card).stages.map((_,index)=>index),selectedId:null};renderActionChoice();}
function showDecreeChoice(step){
  const choices=state.cards.filter(card=>isFriendly(card)&&(step==="land"?getKind(card).includes("Krajina"):getKind(card).includes("Budova")&&Object.values(getProduction(card)).some(Boolean))).map(card=>card.id);
  if(!choices.length){if(step==="land")return showDecreeChoice("building");state.decreePending=null;return showPermanentIntro();}
  state.decreePending=step;pendingActionChoice={type:"decree",step,choices,selectedId:null,selectedResource:null};renderActionChoice();
}
function showPermanentIntro(){
  const number=state.permanentIntroQueue?.[0];
  if(!number){if(state.decreePending)return showDecreeChoice(state.decreePending);const shuffle=document.querySelector("[data-shuffle-round]");if(shuffle)shuffle.disabled=false;return;}
  pendingActionChoice={type:"permanent-intro",number};renderActionChoice();
}
async function animateBanditArrival(sourceId){
  const card=document.querySelector(`[data-card="${sourceId}"]`);
  if(!card)return;
  const rect=card.getBoundingClientRect(),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,duration=reduced?180:720;
  const veil=document.createElement("div"),dagger=document.createElement("span");
  veil.className="bandit-arrival";
  dagger.className="bandit-arrival-dagger";
  dagger.textContent="🗡️";
  dagger.style.left=`${rect.left+rect.width/2}px`;
  dagger.style.top=`${rect.top+rect.height/2}px`;
  veil.appendChild(dagger);
  document.body.appendChild(veil);
  state.busy=true;
  const cardAnimation=card.animate([
    {transform:"scale(.94)",filter:"brightness(.72) saturate(.7)"},
    {transform:"scale(1.055)",filter:"brightness(1.28) saturate(1.2)",offset:.48},
    {transform:"scale(1)",filter:"brightness(1) saturate(1)"}
  ],{duration,easing:"cubic-bezier(.2,.78,.24,1)"});
  const daggerAnimation=dagger.animate([
    {transform:"translate(-50%,-50%) scale(.18) rotate(-38deg)",opacity:0},
    {transform:"translate(-50%,-50%) scale(1.45) rotate(7deg)",opacity:1,offset:.48},
    {transform:"translate(-50%,-50%) scale(2.15) rotate(18deg)",opacity:0}
  ],{duration,easing:"cubic-bezier(.18,.72,.28,1)"});
  await Promise.all([cardAnimation.finished.catch(()=>{}),daggerAnimation.finished.catch(()=>{})]);
  veil.remove();
  state.busy=false;
}

async function queueBanditBlocks(drawnIds){
  const spoiled=drawnIds.map(getCard).find(card=>card?.template==="princess"&&card.state===1),friendly=activeIds().filter(id=>id!==spoiled?.id&&isFriendly(getCard(id)));
  if(spoiled&&friendly.length){pendingActionChoice={type:"forced-discard",sourceId:spoiled.id,choices:friendly,selected:[],count:Math.min(3,friendly.length),remainingBandits:drawnIds};renderActionChoice();return;}
  const assassin=activeIds().map(getCard).find(card=>card?.template==="assassin"&&card.state===0&&!card.triggered),victims=drawnIds.filter(id=>id!==assassin?.id&&getCard(id)&&getKind(getCard(id)).includes("Osoba"));
  if(assassin&&victims.length){pendingActionChoice={type:"assassination",sourceId:assassin.id,choices:victims,selectedId:null,remainingBandits:drawnIds};renderActionChoice();return;}
  const bandits=drawnIds.filter(id=>{const card=getCard(id);if(!card)return false;const mode=getStage(card).onPlay,count=Object.values(state.blocked).filter(source=>source===id).length;return ["block-coin","block-land-building","block-production","block-building"].includes(mode)&&count<(getStage(card).blockCount||1);});
  if(!bandits.length)return;
  const sourceId=bandits[0],mode=getStage(getCard(sourceId)).onPlay,blockedCount=Object.values(state.blocked).filter(source=>source===sourceId).length,choices=activeIds().filter(id=>id!==sourceId&&isFriendly(getCard(id))&&(mode==="block-coin"?(getStage(getCard(id)).production.coin||0)>0:mode==="block-production"?Object.values(getProduction(getCard(id))).some(Boolean):mode==="block-building"?getKind(getCard(id)).includes("Budova"):["Krajina","Budova"].some(kind=>getKind(getCard(id)).includes(kind))));
  if(!choices.length){const rest=bandits.filter(id=>id!==sourceId);if(rest.length)queueBanditBlocks(rest);return;}
  if(blockedCount===0)await animateBanditArrival(sourceId);
  pendingActionChoice={type:"block",sourceId,choices,selectedId:null,remainingBandits:bandits.slice(1)};renderActionChoice();
}
function renderActionChoice(){
  if(!pendingActionChoice)return;
  const topConfirmation=document.querySelector("#action-confirm-button");
  topConfirmation.hidden=true;
  topConfirmation.disabled=false;
  if(pendingActionChoice.type==="permanent-intro"){
    const descriptions={25:["Armáda","Postupně do ní vkládáš sílu. Každý další stupeň vyžaduje větší sadu a vložení ukončí tah.","Nejvyšší dosažená úroveň určí bodovou hodnotu na konci hry."],26:["Pokladnice","Postupně do ní ukládáš mince. Vždy je nutné vložit celou následující sadu a akce ukončí tah.","Nejvyšší dosažená úroveň určí bodovou hodnotu na konci hry."],27:["Export","Zboží můžeš do Exportu vložit ze své zásoby; tah tím nekončí.","Po dosažení vyznačených hranic si mezi koly vybereš nebo uplatníš novou odměnu."],38:["Nový cíl panství","Zvol Početní převahu, nebo Vojenskou nadvládu. Vybraná strana určuje závěrečné bodování.","Volba je trvalá; kartu si kdykoli prohlédneš v knihovně."],39:["Nový cíl panství","Zvol Rozšiřování hranic, nebo Maximální využití. Cíl mění závěrečné bodování celého balíčku.","Volba je trvalá; kartu si kdykoli prohlédneš v knihovně."],40:["Nový cíl panství","Zvol Věrnost, nebo Obchodníka. Za splnění podmínky získáš na konci hry 25 bodů.","Volba je trvalá; kartu si kdykoli prohlédneš v knihovně."],88:["Kamenný monument","Do monumentu vkládáš stále větší sady kamene a postupně získáváš body.","Vložení je velká akce a ukončí tah."],108:["Tajemný artefakt","Artefakt zůstává v panství natrvalo a nelze jej zničit.","Jeho bodová hodnota se započítává na konci hry."]},copy=descriptions[pendingActionChoice.number]||[getStage(getCard(pendingActionChoice.number)).name,"Tato karta zůstává v panství natrvalo a přináší dlouhodobou schopnost.","Podrobnosti najdeš po jejím rozkliknutí."];
    openActionChoice(`<div class="dialog-header permanent-intro"><span class="permanent-intro-icon">${permanentIcon(pendingActionChoice.number)}</span><span class="eyebrow">Nový permanent</span><h2>${copy[0]}</h2><p>${copy[1]}</p><p>${copy[2]}</p></div><div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button">${state.permanentIntroQueue.length>1?"Další":"Rozumím"}</button></div>`);
  } else if(pendingActionChoice.type==="side-choice"){
    const choice=pendingActionChoice,card=getCard(choice.cardId);
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Trvalá volba</span><h2>Kterou stranu karty zvolíš?</h2><p>Toto rozhodnutí později nepůjde změnit.</p></div><div class="discard-choices">${choice.choices.map(index=>`<button class="full-card-choice ${index===choice.selectedId?"selected":""}" data-select-side-choice="${index}" type="button">${renderPreviewCard(card,index)}</button>`).join("")}</div><div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selectedId===null?"disabled":""}>Potvrdit stranu</button></div>`);
  } else if(pendingActionChoice.type==="production"){
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
  } else if(pendingActionChoice.type==="action-upgrade") {
    const choice=pendingActionChoice;
    const options=choice.choices.flatMap(id=>{const card=getCard(id);return getStage(card).next.map(target=>({id,target,card}));});
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Vylepšení kartou</span><h2>Kterou kartu vylepšíš?</h2><p>${choice.free?"Běžnou cenu tentokrát neplatíš.":choice.extraPay?`Navíc zaplatíš ${formatBundle(choice.extraPay)}.`:"Zaplatíš běžnou cenu vylepšení."}</p></div><div class="discard-choices">${options.map(option=>{const selected=choice.selectedId===option.id&&choice.targetState===option.target;const cost=choice.free?{}:upgradeCost(option.card,option.target),total={...cost};Object.entries(choice.extraPay||{}).forEach(([key,value])=>total[key]=(total[key]||0)+value);return `<button class="full-card-choice ${selected?"selected":""}" data-select-action-upgrade="${option.id}:${option.target}" type="button" ${canAfford(total)?"":"disabled"}>${renderPreviewCard(option.card,option.target)}</button>`;}).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selectedId===null?"disabled":""}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="school-boost") {
    const choice=pendingActionChoice;
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Škola</span><h2>Posil produkci osoby</h2><p>Vyber osobu a surovinu, kterou bude navíc produkovat.</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${choice.selectedId===id?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="resource-choice-grid decree-resources">${Object.keys(R).map(key=>`<button class="${choice.selectedResource===key?"selected":""}" data-pick-resource="${key}" type="button">${R[key].icon}<span>${R[key].label}</span></button>`).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selectedId&&choice.selectedResource?"":"disabled"}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="self-boost") {
    const choice=pendingActionChoice,card=getCard(choice.sourceId);
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Domnělý šlechtic</span><h2>Posil jednu stranu karty</h2></div><div class="discard-choices">${[1,2].map(side=>`<button class="full-card-choice ${choice.side===side?"selected":""}" data-select-self-side="${side}" type="button">${renderPreviewCard(card,side)}</button>`).join("")}</div><div class="resource-choice-grid decree-resources">${Object.keys(R).map(key=>`<button class="${choice.selectedResource===key?"selected":""}" data-pick-resource="${key}" type="button">${R[key].icon}<span>${R[key].label}</span></button>`).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selectedResource?"":"disabled"}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="pirate-ally") {
    const choice=pendingActionChoice,treasureAvailable=!getCard(93);
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Zkušený spojenec</span><h2>Jak využiješ jeho zkušenosti?</h2></div><div class="column-options pirate-options"><button data-pirate-mode="sword" class="${choice.mode==="sword"?"selected":""}" type="button">⚔️ 1 síla</button><button data-pirate-mode="metal" class="${choice.mode==="metal"?"selected":""}" type="button">⚙️ 1 kov</button><button data-pirate-mode="treasure" class="${choice.mode==="treasure"?"selected":""}" type="button" ${treasureAvailable?"":"disabled"}>Objevit Výpravu za pokladem</button></div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.mode?"":"disabled"}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="shrine-stay") {
    const choice=pendingActionChoice;
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Svatyně</span><h2>Které karty zůstanou do příštího tahu?</h2><p>Můžeš ponechat až ${choice.count}. Nevybrané karty se odhodí obvyklým způsobem.</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${choice.selected.includes(id)?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button">${choice.selected.length?`Ponechat vybrané (${choice.selected.length})`:"Neponechat žádnou"}</button></div>`);
  } else if(["forced-discard","princess-education","princess-turn"].includes(pendingActionChoice.type)) {
    const choice=pendingActionChoice,counts=choice.type==="princess-education"?Object.fromEntries(Object.keys(choice.requirements).map(kind=>[kind,choice.selected.filter(id=>getKind(getCard(id)).includes(kind)).length])):{};
    const valid=choice.type!=="princess-education"?choice.selected.length===choice.count:Object.entries(choice.requirements).every(([kind,count])=>(counts[kind]||0)===count)&&choice.selected.length===Object.values(choice.requirements).reduce((a,b)=>a+b,0);
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">${choice.type==="forced-discard"?"Rozmazlená princezna":choice.type==="princess-turn"?"Mladá princezna":"Vzdělání princezny"}</span><h2>${choice.type==="princess-education"?"Vyber požadované oběti":`Odhoď ${choice.count} osoby`}</h2><p>${choice.type==="princess-education"?Object.entries(choice.requirements).map(([kind,count])=>`${kind} ${count}`).join(" · "):"Volba je povinná."}</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${choice.selected.includes(id)?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${valid?"":"disabled"}>Potvrdit</button></div>`);
  } else if(["reduce-upgrade","destroy-negative","finishing-touch","sacrifice-reward"].includes(pendingActionChoice.type)) {
    const choice=pendingActionChoice,titles={"reduce-upgrade":"Které vylepšení zlevníš?","destroy-negative":"Kterého nepřítele odstraníš?","finishing-touch":"Kterou kartu posílíš?","sacrifice-reward":"Kterou osobu odhodíš?"};
    const selected=choice.selectedId?getCard(choice.selectedId):null,costKeys=selected&&choice.type==="reduce-upgrade"?Object.keys(upgradeCost(selected,getStage(selected).next[0])||{}):[];
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Volba karty</span><h2>${titles[choice.type]}</h2></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${choice.selectedId===id?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div>${choice.type==="reduce-upgrade"&&selected?`<p class="choice-summary">Kterou surovinu z ceny odstraníš?</p><div class="resource-choice-grid decree-resources">${costKeys.map(key=>`<button class="${choice.selectedResource===key?"selected":""}" data-pick-resource="${key}" type="button">${R[key].icon}<span>${R[key].label}</span></button>`).join("")}</div>`:""}<div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${!choice.selectedId||choice.type==="reduce-upgrade"&&!choice.selectedResource?"disabled":""}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="assassination") {
    const choice=pendingActionChoice;
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Vrah</span><h2>Kterou osobu Vrah napadne?</h2><p>Volba je povinná; zvolená osoba bude zničena.</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${choice.selectedId===id?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selectedId?"":"disabled"}>Potvrdit cíl</button></div>`);
  } else if(pendingActionChoice.type==="round-destruction") {
    const choice=pendingActionChoice;
    const titles={plague:"Mor zasáhl obyvatele",fire:"Požár zachvátil město",tornado:"Tornádo pustoší panství",flood:"Povodeň ničí budovu"};openActionChoice(`<div class="dialog-header"><span class="eyebrow">Konec období</span><h2>${titles[choice.eventType]||"Následek události"}</h2><p>Vyber ${choice.count===1?"jednu kartu":`karty (${choice.count})`}, které budou zničeny.</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${choice.selected.includes(id)?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selected.length===choice.count?"":"disabled"}>Potvrdit následek</button></div>`);
  } else if(pendingActionChoice.type==="sacrifice") {
    const choice=pendingActionChoice;
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Čarodějnice</span><h2>Vyber ${choice.count===1?"osobu":"tři osoby"}</h2><p>${choice.transform?"Vybrané osoby odhodíš a Čarodějnice se promění v Chýši.":"Vybranou osobu zničíš spolu s Chýší."}</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${choice.selected.includes(id)?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selected.length===choice.count?"":"disabled"}>Potvrdit</button></div>`);
  } else if(["person-discovery","engineer","trebuchet"].includes(pendingActionChoice.type)) {
    const choice=pendingActionChoice,titles={"person-discovery":["Koho pošleš dál?","Odhoď jednu osobu a přiveď Cizince."],engineer:["Kterou kartu zdokonalíš?","Původní kartu zničíš a objevíš její pokročilou variantu."],trebuchet:["Kterého nepřítele porazíš?","Nepřítel může být ve hře i v odhazovacím balíčku."]},copy=titles[choice.type];
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Volba karty</span><h2>${copy[0]}</h2><p>${copy[1]}</p></div><div class="discard-choices">${choice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${id===choice.selectedId?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.selectedId?"":"disabled"}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="mercenary") {
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Žoldnéř</span><h2>Kolik polí označíš?</h2><p>Zaplatíš 2 mince a za každé pole získáš 1 sílu.</p></div><div class="column-options"><button data-mark-count="1" class="${pendingActionChoice.markCount===1?"selected":""}" type="button">1 pole</button><button data-mark-count="2" class="${pendingActionChoice.markCount===2?"selected":""}" type="button">2 pole</button></div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button">Zaplatit a označit</button></div>`);
  } else if(pendingActionChoice.type==="inventor") {
    const choice=pendingActionChoice,remaining=choice.count-choice.selected.length;
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Vynálezkyně</span><h2>Jak využiješ inspiraci?</h2><p>Objev jeden dosud neznámý vynález, nebo získej ${choice.count} libovolné ${choice.count===1?"surovinu":"suroviny"}.</p></div><div class="column-options"><button data-inventor-mode="discover" class="${choice.mode==="discover"?"selected":""}" type="button" ${choice.choices.length?"":"disabled"}>Objevit vynález</button><button data-inventor-mode="resources" class="${choice.mode==="resources"?"selected":""}" type="button">Získat suroviny</button></div>${choice.mode==="discover"?`<div class="discard-choices">${choice.choices.map(number=>{const card={id:number,number,template:catalog[number],state:0};return `<button class="full-card-choice ${number===choice.selectedId?"selected":""}" data-select-action-card="${number}" type="button">${renderPreviewCard(card,0)}</button>`}).join("")}</div>`:choice.mode==="resources"?`<p class="choice-summary">${choice.selected.map(key=>R[key].icon).join(" ")||`Vyber ${choice.count}`}</p><div class="resource-choice-grid">${choice.options.map(key=>`<button data-pick-resource="${key}" type="button">${R[key].icon}<span>${R[key].label}</span></button>`).join("")}</div>`:""}<div class="upgrade-confirm-bar"><button class="upgrade-action" data-confirm-action-choice type="button" ${choice.mode==="discover"&&!choice.selectedId||choice.mode==="resources"&&remaining?"disabled":""}>Potvrdit</button></div>`);
  } else if(pendingActionChoice.type==="discover") {
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">Objev</span><h2>Vyber navazující kartu</h2><p>Prohlédni si celou kartu a potvrď svou volbu.</p></div><div class="discard-choices">${pendingActionChoice.choices.map(number=>{const card={id:number,number,template:catalog[number],state:0};return `<button class="full-card-choice ${number===pendingActionChoice.selectedId?"selected":""}" data-select-action-card="${number}" type="button">${renderPreviewCard(card,0)}</button>`}).join("")}</div><div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button" ${pendingActionChoice.selectedId?"":"disabled"}>Objevit kartu</button></div>`);
  } else {
    const blocking=pendingActionChoice.type==="block";
    if(blocking){topConfirmation.hidden=false;topConfirmation.disabled=!pendingActionChoice.selectedId;}
    openActionChoice(`<div class="dialog-header"><span class="eyebrow">${blocking?"Bandita":"Volba karty"}</span><h2>${blocking?"Kterou kartu Bandita zablokuje?":"Kterou produkci chceš získat?"}</h2></div><div class="discard-choices">${pendingActionChoice.choices.map(id=>{const card=getCard(id);return `<button class="full-card-choice ${id===pendingActionChoice.selectedId?"selected":""}" data-select-action-card="${id}" type="button">${renderPreviewCard(card,card.state)}</button>`}).join("")}</div>${blocking?"":`<div class="upgrade-confirm-bar"><button class="secondary-action" data-close-action-choice type="button">Zrušit</button><button class="upgrade-action" data-confirm-action-choice type="button">Použít produkci</button></div>`}`);
  }
}
function pickResource(key){if(["school-boost","self-boost"].includes(pendingActionChoice?.type)&&R[key]){pendingActionChoice.selectedResource=key;renderActionChoice();return;}if(pendingActionChoice?.type==="reduce-upgrade"){const target=getCard(pendingActionChoice.selectedId),cost=target?upgradeCost(target,getStage(target).next[0]):{};if(cost?.[key]){pendingActionChoice.selectedResource=key;renderActionChoice();}return;}if(pendingActionChoice?.type==="export"&&pendingActionChoice.config.resources?.includes(key)){pendingActionChoice.selectedResource=key;renderActionChoice();return;}if(pendingActionChoice?.type==="decree"&&pendingActionChoice.step==="building"){if(Object.keys(getProduction(getCard(pendingActionChoice.selectedId))).includes(key)){pendingActionChoice.selectedResource=key;renderActionChoice();}return;}if(!pendingActionChoice||!["resources","inventor"].includes(pendingActionChoice.type)||pendingActionChoice.type==="inventor"&&pendingActionChoice.mode!=="resources"||!pendingActionChoice.options.includes(key)||pendingActionChoice.selected.length>=pendingActionChoice.count)return;pendingActionChoice.selected.push(key);renderActionChoice();}
function selectActionCard(id){if(!pendingActionChoice?.choices?.includes(id))return;if(["sacrifice","round-destruction","forced-discard","princess-education","princess-turn","shrine-stay"].includes(pendingActionChoice.type)){const index=pendingActionChoice.selected.indexOf(id);if(index>=0)pendingActionChoice.selected.splice(index,1);else if(!pendingActionChoice.count||pendingActionChoice.selected.length<pendingActionChoice.count)pendingActionChoice.selected.push(id);}else pendingActionChoice.selectedId=id;if(["decree","export","reduce-upgrade"].includes(pendingActionChoice.type))pendingActionChoice.selectedResource=null;renderActionChoice();}
async function confirmActionChoice(){
  if(!pendingActionChoice||(state.busy&&!["decree","export","permanent-intro","princess-turn","shrine-stay","round-destruction"].includes(pendingActionChoice.type)))return;
  const choice=pendingActionChoice;
  if(choice.type==="permanent-intro"){
    state.permanentIntroQueue.shift();document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;showPermanentIntro();return;
  }
  if(choice.type==="side-choice"){
    if(choice.selectedId===null)return;const card=getCard(choice.cardId);card.state=choice.selectedId;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();return;
  }
  if(choice.type==="export"){
    if(!choice.selectedId||(choice.config.resources&&!choice.selectedResource))return;const target=getCard(choice.selectedId);
    if(choice.config.resources){target.productionBonus??={};target.productionBonus[target.state]??={};target.productionBonus[target.state][choice.selectedResource]=(target.productionBonus[target.state][choice.selectedResource]||0)+1;}else target.fameBonus=(target.fameBonus||0)+choice.config.fame;
    markExportClaim(choice.threshold);document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();return;
  }
  if(choice.type==="decree"){
    if(!choice.selectedId||(choice.step==="building"&&!choice.selectedResource))return;
    const target=getCard(choice.selectedId),key=choice.step==="land"?"coin":choice.selectedResource;target.productionBonus??={};target.productionBonus[target.state]??={};target.productionBonus[target.state][key]=(target.productionBonus[target.state][key]||0)+1;
    document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();if(choice.step==="land")showDecreeChoice("building");else{state.decreePending=null;showPermanentIntro();}return;
  }
  if(choice.type==="round-destruction"){
    if(choice.selected.length!==choice.count)return;const event=getCard(choice.sourceId);choice.selected.forEach(destroyCard);if(event){if(choice.eventType==="flood")destroyCard(event.id);else event.state=Math.min(event.state+1,getTemplate(event).stages.length-1);}document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();const resolve=pendingRoundResolve;pendingRoundResolve=null;resolve?.();return;
  }
  if(choice.type==="princess-turn"){
    if(choice.selected.length!==choice.count)return;choice.selected.forEach(discardCard);document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();const resolve=pendingTurnResolve;pendingTurnResolve=null;resolve?.();return;
  }
  if(choice.type==="shrine-stay"){
    const selected=[...choice.selected];document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();const resolve=pendingTurnResolve;pendingTurnResolve=null;resolve?.(selected);return;
  }
  const source=getCard(choice.sourceId);
  if(choice.type==="action-upgrade"){
    if(choice.selectedId===null||choice.targetState===null)return;const target=getCard(choice.selectedId),normal=choice.free?{}:upgradeCost(target,choice.targetState),total={...normal};Object.entries(choice.extraPay||{}).forEach(([key,value])=>total[key]=(total[key]||0)+value);if(!canAfford(total))return;spend(total);target.state=choice.targetState;if(choice.advanceSource&&getStage(source).next.length)source.state=getStage(source).next[0];document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard([source.id,target.id]);discardCard(source.id);discardCard(target.id);state.busy=false;render();if(choice.endTurn)return endTurn(true);return;
  }
  if(choice.type==="school-boost"){
    if(!choice.selectedId||!choice.selectedResource)return;const target=getCard(choice.selectedId);target.productionBonus??={};target.productionBonus[target.state]??={};target.productionBonus[target.state][choice.selectedResource]=(target.productionBonus[target.state][choice.selectedResource]||0)+1;if(getStage(source).next.length)source.state=getStage(source).next[0];document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard([source.id]);discardCard(source.id);state.busy=false;render();return endTurn(true);
  }
  if(choice.type==="self-boost"){
    if(!choice.selectedResource)return;source.productionBonus??={};source.productionBonus[choice.side]??={};source.productionBonus[choice.side][choice.selectedResource]=(source.productionBonus[choice.side][choice.selectedResource]||0)+1;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard([source.id]);discardCard(source.id);state.busy=false;render();return;
  }
  if(choice.type==="pirate-ally"){
    if(!choice.mode)return;if(choice.mode==="treasure")discoverCard(93);else gain({[choice.mode]:1});document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard([source.id]);discardCard(source.id);state.busy=false;render();return;
  }
  if(choice.type==="assassination"){
    if(!choice.selectedId)return;const assassin=getCard(choice.sourceId);destroyCard(choice.selectedId);if(assassin)assassin.triggered=true;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;render();queueBanditBlocks(choice.remainingBandits||[]);return;
  }
  if(!source||(slotOf(source.id)<0&&!choice.after?.keepSource))return;
  if(choice.type==="forced-discard"){
    if(choice.selected.length!==choice.count)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard(choice.selected);choice.selected.forEach(discardCard);state.busy=false;render();queueBanditBlocks(choice.remainingBandits||[]);return;
  }
  if(choice.type==="princess-education"){
    const required=Object.values(choice.requirements).reduce((a,b)=>a+b,0),valid=choice.selected.length===required&&Object.entries(choice.requirements).every(([kind,count])=>choice.selected.filter(id=>getKind(getCard(id)).includes(kind)).length===count);if(!valid)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;choice.selected.forEach(destroyCard);source.state=2;await animateDiscard([source.id]);discardCard(source.id);state.busy=false;render();return;
  }
  if(choice.type==="sacrifice-reward"){
    if(!choice.selectedId)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;return showResourceChoice(source.id,Object.keys(R),choice.count,{discard:true,extraDiscard:choice.selectedId});
  }
  if(choice.type==="destroy-negative"){
    if(!choice.selectedId)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;destroyCard(choice.selectedId);destroyCard(source.id);render();return;
  }
  if(choice.type==="finishing-touch"){
    if(!choice.selectedId)return;const target=getCard(choice.selectedId);target.fameBonus=(target.fameBonus||0)+5;target.productionBonus??={};target.productionBonus[target.state]??={};target.productionBonus[target.state].coin=(target.productionBonus[target.state].coin||0)+1;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;destroyCard(source.id);render();return;
  }
  if(choice.type==="reduce-upgrade"){
    if(!choice.selectedId||!choice.selectedResource)return;const target=getCard(choice.selectedId);target.costReduction??={};target.costReduction[choice.selectedResource]=(target.costReduction[choice.selectedResource]||0)+1;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;if(getStage(source).destroySelf===false)discardCard(source.id);else destroyCard(source.id);render();return;
  }
  if(choice.type==="volcano"){if(!choice.selectedId)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;resolveVolcano(source.id,choice.selectedId);render();return;}
  if(choice.type==="production"){document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;return confirmProduction(source.id);}
  if(choice.type==="person-discovery"){
    if(!choice.selectedId)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard([source.id,choice.selectedId]);discardCard(source.id);discardCard(choice.selectedId);const discovered=discoverCard(choice.discoverNumber);state.busy=false;render();if(discovered&&getTemplate(discovered).chooseOnDiscover)showSideChoice(discovered);return;
  }
  if(choice.type==="engineer"){
    if(!choice.selectedId)return;const number=Number(choice.replacements[choice.selectedId]);document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard([source.id,choice.selectedId]);discardCard(source.id);destroyCard(choice.selectedId);const discovered=discoverCard(number);state.busy=false;render();if(discovered&&getTemplate(discovered).chooseOnDiscover)showSideChoice(discovered);return;
  }
  if(choice.type==="trebuchet"){
    if(!choice.selectedId)return;const enemy=getCard(choice.selectedId),army=state.permanents.find(card=>card.number===25);document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;if(enemy.template==="banditWorker"||enemy.template==="banditField"||enemy.template==="pirate")enemy.state=1;else destroyCard(enemy.id);destroyCard(source.id);if(army){const track=PERMANENT_TRACKS[25];army.marks=Math.min(army.marks+1,track.costs.length);army.score=track.rewards[army.marks-1]||army.score;army.state=army.marks>=track.flipAfter?1:0;}state.busy=false;render();return;
  }
  if(choice.type==="mercenary"){
    const amount=Math.min(choice.markCount,8-(source.marks||0));if(!amount||!canAfford({coin:2}))return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;spend({coin:2});source.marks=(source.marks||0)+amount;gain({sword:amount});if(source.marks>=8)source.state=1;state.busy=true;await animateDiscard([source.id]);discardCard(source.id);state.busy=false;render();return;
  }
  if(choice.type==="inventor"){
    if(choice.mode==="discover"&&!choice.selectedId||choice.mode==="resources"&&choice.selected.length!==choice.count)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;source.marks=choice.count;source.fameBonus=choice.count*5;source.state=0;if(choice.mode==="discover")discoverCard(choice.selectedId);else choice.selected.forEach(key=>gain({[key]:1}));state.busy=true;await animateDiscard([source.id]);discardCard(source.id);state.busy=false;render();return;
  }
  if(choice.type==="sacrifice"){
    if(choice.selected.length!==choice.count)return;document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;await animateDiscard([source.id,...choice.selected]);choice.selected.forEach(targetId=>choice.transform?discardCard(targetId):destroyCard(targetId));if(choice.transform){source.state=1;discardCard(source.id);}else destroyCard(source.id);state.busy=false;render();return;
  }
  if(choice.type==="resources"&&choice.selected.length!==choice.count)return;
  if(choice.type==="block"&&!choice.selectedId)return;
  if(choice.type==="discover"&&!choice.selectedId)return;
  if(choice.after?.pay&&!canAfford(choice.after.pay))return notify(`Chybí suroviny: ${formatBundle(choice.after.pay)}.`);
  document.querySelector("#action-choice-dialog").close();pendingActionChoice=null;state.busy=true;
  if(choice.type==="block"){
    state.blocked[choice.selectedId]=choice.sourceId;state.busy=false;render();
    autosave("turn");
    const source=getCard(choice.sourceId),blockedCount=Object.values(state.blocked).filter(id=>id===choice.sourceId).length,repeat=source&&blockedCount<(getStage(source).blockCount||1)?[choice.sourceId]:[];if(choice.remainingBandits?.length||repeat.length)queueBanditBlocks([...(choice.remainingBandits||[]),...repeat]);
    return;
  }
  if(choice.type==="discover") {
    if(choice.after?.pay)spend(choice.after.pay);const discovered=discoverCard(choice.selectedId);if(choice.after?.resetState!==undefined)source.state=choice.after.resetState;
    await animateDiscard([source.id]);if(choice.after?.destroy)destroyCard(source.id);else if(choice.after?.discard)discardCard(source.id);
    state.busy=false;render();notify(`Karta ${String(choice.selectedId).padStart(3,"0")} byla objevena.`);if(discovered&&getTemplate(discovered).chooseOnDiscover)showSideChoice(discovered);else if(discovered?.permanent&&state.permanentIntroQueue.length)showPermanentIntro();return;
  }
  if(choice.after?.pay)spend(choice.after.pay);
  if(choice.type==="resources")choice.selected.forEach(key=>gain({[key]:1}));
  else gain(getProduction(getCard(choice.selectedId)));
  if(choice.after?.keepSource){state.busy=false;render();return;}
  const extraDiscard=choice.after?.extraDiscard;await animateDiscard(extraDiscard?[source.id,extraDiscard]:[source.id]);if(extraDiscard)discardCard(extraDiscard);
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
  const base={...(template.branchCosts?.[target]||getStage(card).cost||{})};Object.entries(card.costReduction||{}).forEach(([key,value])=>{if(base[key])base[key]=Math.max(0,base[key]-value);});return base;
}

async function upgrade(id, target) {
  if (state.busy || state.inactive.has(id) || isBlocked(id) || activeIds().some(otherId=>{const other=getCard(otherId);return other?.template==="darkKnight"&&other.state===0||getStage(other)?.advanceLock;})) return notify("Tuto kartu teď nelze vylepšit.");
  const card=getCard(id), current=getStage(card);
  if (slotOf(id) < 0 || !current.next.includes(target)) return;
  const cost=upgradeCost(card,target);
  if (!canAfford(cost)) return notify(`Chybí suroviny: ${formatBundle(cost)}.`);
  state.busy=true;
  spend(cost); card.state=target;
  if(getStage(card).permanent){state.cards=state.cards.filter(item=>item.id!==id);state.permanents.push({...card,permanent:true,value:card.fameBonus||0});const slot=slotOf(id);if(slot>=0)state.slots[slot]=null;closeDialogs();state.busy=false;render();return endTurn(true);}
  closeDialogs();
  await animateDiscard([id]); discardCard(id);
  await endTurn(true);
}

async function endTurn(upgraded = false) {
  state.busy=true;
  await resolvePrincessEndTurn();
  const shrineProtected=await resolveShrineEndTurn();
  const staying=[];
  const leaving=[];
  for (const id of activeIds()) {
    const card=getCard(id);
    if (getStage(card).stays||shrineProtected.includes(id)) staying.push(id);
    else leaving.push(id);
  }
  await animateDiscard(leaving);
  leaving.forEach(discardCard);
  if(staying.length){
    state.slots=[...staying,...Array(Math.max(0,state.slots.length-staying.length)).fill(null)].slice(0,state.slots.length);
  }
  state.resources=emptyResources();
  state.inactive=new Set();
  if (state.deck.length === 0) await endRound();
  else { state.busy=false; startTurn(true); }
}

async function resolveShrineEndTurn(){
  const shrine=activeIds().map(getCard).find(card=>card&&getStage(card).endTurnKeep);
  if(!shrine)return [];
  const choices=activeIds().filter(id=>id!==shrine.id&&isFriendly(getCard(id))&&!isBlocked(id));
  if(!choices.length)return [];
  return new Promise(resolve=>{
    pendingTurnResolve=resolve;
    pendingActionChoice={type:"shrine-stay",sourceId:shrine.id,choices,selected:[],count:Math.min(getStage(shrine).endTurnKeep,choices.length)};
    renderActionChoice();
  });
}

async function resolvePrincessEndTurn(){
  const princess=activeIds().map(getCard).find(card=>card?.template==="princess"&&card.state===0);if(!princess)return;
  const choices=activeIds().filter(id=>id!==princess.id&&isFriendly(getCard(id))&&getKind(getCard(id)).includes("Osoba"));if(choices.length<2){princess.state=1;notify("Princezna nenašla dost společníků a stala se rozmazlenou.");return;}
  await new Promise(resolve=>{pendingTurnResolve=resolve;pendingActionChoice={type:"princess-turn",sourceId:princess.id,choices,selected:[],count:2};renderActionChoice();});
}

async function endRound() {
  await resolveEndRoundEvents();
  const remaining=activeIds();
  await animateDiscard(remaining);
  remaining.forEach(discardCard);
  state.resources=emptyResources();autosave("intermission");
  if(state.finalRound){state.busy=false;showFinalScore();return;}
  await showRoundTransition(state.round,state.round+1);
  state.round += 1; state.turn=1;
  state.busy=false;
  startRound();
}

function totalFame(){return [...state.cards,...state.permanents].reduce((sum,card)=>sum+(card.score??getStage(card).fame??0)+(card.fameBonus||0),0);}
function showFinalScore(){
  const overlay=document.querySelector("#round-transition");document.querySelector("#round-finished").textContent="Kronika panství je uzavřena";document.querySelector("#round-next").textContent=`Celková sláva: ${totalFame()} bodů`;document.querySelector("#round-transition-body").innerHTML=`<div class="round-end-actions"><button class="secondary-action" data-open-library type="button">Knihovna karet</button><button class="secondary-action" data-go-home type="button">Hlavní stránka</button><button class="primary-action" data-final-new-game type="button">Nová hra</button></div>`;overlay.className="round-transition phase-intermission";overlay.hidden=false;
}

async function resolveEndRoundEvents(){
  const soldiers=activeIds().map(getCard).filter(card=>card&&getStage(card).onPlay==="block-land-building");
  soldiers.forEach(soldier=>{const victim=Number(Object.keys(state.blocked).find(id=>state.blocked[id]===soldier.id));if(victim)destroyCard(victim);});
  const event=activeIds().map(getCard).find(card=>card&&getStage(card).endRound);
  if(!event)return;
  const type=getStage(event).endRound,count=type==="plague"?2:type==="tornado"?3:1,kind=type==="plague"?"Osoba":type==="tornado"?null:"Budova",choices=state.cards.filter(card=>card.id!==event.id&&isFriendly(card)&&!card.permanent&&(!kind||getKind(card).includes(kind))).map(card=>card.id);
  if(!choices.length){if(type==="flood")destroyCard(event.id);else event.state=Math.min(event.state+1,getTemplate(event).stages.length-1);return;}
  await new Promise(resolve=>{pendingRoundResolve=resolve;pendingActionChoice={type:"round-destruction",sourceId:event.id,choices,selected:[],count:Math.min(count,choices.length),eventType:type};renderActionChoice();});
}

function showRoundTransition(finished,next) {
  const overlay=document.querySelector("#round-transition");
  const exportCard=state.permanents.find(card=>card.number===27);
  const exportRewards=exportCard?PERMANENT_TRACKS[27].thresholds.filter(threshold=>exportCard.value>=threshold&&!exportCard.claimed?.includes(threshold)):[];
  document.querySelector("#round-finished").textContent=`Kolo ${finished} dokončeno`;
  document.querySelector("#round-next").textContent="Další období na panství skončilo";
  document.querySelector("#round-transition-body").innerHTML=`
    <div class="round-rest-panel">
      <p class="round-autosave-note">Stav hry se automaticky ukládá na konci každého kola.</p>
      <div class="round-rest-actions">
        ${exportRewards.map(threshold=>`<button class="secondary-action" data-export-reward="${threshold}" type="button">📦 Uplatnit odměnu za ${threshold}</button>`).join("")}
        <button class="round-primary-action" data-prepare-round type="button">Začít další kolo →</button>
        <button class="secondary-action" data-open-library type="button">▦ Knihovna karet</button>
        <button class="secondary-action" data-go-home type="button">⌂ Hlavní stránka</button>
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
  const choices=state.cards.filter(target=>isFriendly(target)&&(!config.kind||getKind(target).includes(config.kind))).map(target=>target.id);
  pendingActionChoice={type:"export",threshold,config,choices,selectedId:null,selectedResource:null};renderActionChoice();
}

function prepareNextRound() {
  if (!roundTransitionContext || roundTransitionContext.phase!=="intermission") return;
  const found=[];
  roundTransitionContext.immigrantMode=false;
  for (let i=0;i<2 && state.discoveries.length;i++) {
    const spec=state.discoveries.shift();
    if(spec.number===23){
      [25,26,27].forEach(number=>installPermanent(number));state.decreePending="land";state.permanentIntroQueue=[25,26,27];break;
    } else if(spec.number===30||spec.number===47){
      const candidateNumbers=spec.number===30?[31,32,33,34]:[48,49,50,51];
      state.immigrantChoices=[];state.specials=state.specials.filter(card=>!candidateNumbers.includes(card.number));
      candidateNumbers.forEach(number=>state.specials.push({id:number,number,template:catalog[number],state:0,candidate:true}));
      roundTransitionContext.immigrantMode=true;roundTransitionContext.candidateNumbers=candidateNumbers;break;
    } else if(spec.number===37){
      state.discoveries=state.discoveries.filter(item=>item.number<38||item.number>42);
      [38,39,40,41,42].forEach(number=>{let card;if(templates[catalog[number]].permanent){card=installPermanent(number);if(card)state.permanentIntroQueue.push(number);}else{card={id:number,number,template:catalog[number],state:0};state.cards.push(card);}if(card)found.push(card);});
      break;
    } else if(spec.number===68){
      state.finalRound=true;
      [69,70].forEach(number=>{if(getCard(number))return;const card={id:number,number,template:catalog[number],state:0};state.cards.push(card);found.push(card);});
      break;
    } else if(templates[spec.template]?.permanent){const card=installPermanent(spec.number);if(card){found.push(card);state.permanentIntroQueue.push(spec.number);}}
    else { const card={id:spec.number,number:spec.number,template:spec.template,state:0};state.cards.push(card); found.push(card); }
  }
  roundTransitionContext.newCards=found;
  roundTransitionContext.phase="discovery";
  document.querySelector("#round-finished").textContent="Nové období";
  document.querySelector("#round-next").textContent=`Kolo ${roundTransitionContext.next} začíná`;
  document.querySelector("#round-transition-body").innerHTML=`
    ${roundTransitionContext.immigrantMode?renderImmigrantChoice():found.length?`<p class="round-hint">Prohlédni si nové karty. Kliknutím na kartu otevřeš všechny její stavy.</p><div class="round-new-cards">${found.map(card=>getTemplate(card).chooseOnDiscover?`<div class="discovered-side-choice"><div class="side-pair">${getTemplate(card).stages.map((side,index)=>`<button class="round-card-button" data-detail="${card.id}" type="button" aria-label="Prohlédnout kartu ${side.name}">${renderPreviewCard(card,index)}</button>`).join("")}</div><span>Zvol stranu karty:</span><div class="column-options">${getTemplate(card).stages.map((side,index)=>`<button type="button" data-choose-side="${card.id}" data-side="${index}" class="${card.state===index?"selected":""}">${side.name}</button>`).join("")}</div></div>`:`<button class="round-card-button" data-detail="${card.id}" type="button" aria-label="Prohlédnout kartu ${getStage(card).name}">${renderPreviewCard(card,card.state)}</button>`).join("")}</div>`:state.decreePending?`<p class="round-hint">Nové instituce byly založeny. Dokonči jejich úvodní rozhodnutí.</p>`:`<p class="round-hint">V tomto období už nečekají žádné další nové karty.</p>`}
    `;
  document.querySelector("#round-transition-body").insertAdjacentHTML("beforeend",`<div class="round-discovery-footer"><button class="shuffle-round-action" data-shuffle-round type="button" ${state.decreePending||state.permanentIntroQueue.length||roundTransitionContext.immigrantMode?"disabled":""}><span class="mini-deck" aria-hidden="true">${state.cards.length}</span><strong>Zamíchat</strong></button></div>`);
  document.querySelector("#round-transition").className="round-transition phase-discovery";
  if(state.permanentIntroQueue.length)setTimeout(showPermanentIntro,0);else if(state.decreePending)setTimeout(()=>showDecreeChoice("land"),0);
}

function renderImmigrantChoice(){
  const cards=(roundTransitionContext?.candidateNumbers||[31,32,33,34]).map(getCard).filter(Boolean);
  return `<div class="immigrant-choice"><p class="round-hint"><strong>Do panství přicházejí noví lidé.</strong> Vyber přesně dva ze čtyř. Každou kartu si můžeš nejprve celou prohlédnout.</p><div class="round-new-cards immigrant-cards">${cards.map(card=>`<div class="immigrant-option ${state.immigrantChoices.includes(card.id)?"selected":""}">${renderPreviewCard(card,card.state)}<div class="immigrant-actions"><button class="secondary-action" data-detail="${card.id}" type="button">Prohlédnout</button><button class="secondary-action" data-choose-immigrant="${card.id}" type="button">${state.immigrantChoices.includes(card.id)?"✓ Vybráno":"Vybrat"}</button></div></div>`).join("")}</div><p class="immigrant-counter">Vybráno ${state.immigrantChoices.length} / 2</p></div>`;
}

function chooseImmigrant(id){
  if(!roundTransitionContext?.immigrantMode||!(roundTransitionContext.candidateNumbers||[31,32,33,34]).includes(id))return;
  const selected=state.immigrantChoices,index=selected.indexOf(id);if(index>=0)selected.splice(index,1);else if(selected.length<2)selected.push(id);
  const body=document.querySelector("#round-transition-body"),choice=body.querySelector(".immigrant-choice");if(choice)choice.outerHTML=renderImmigrantChoice();
  const shuffle=document.querySelector("[data-shuffle-round]");if(shuffle)shuffle.disabled=selected.length!==2;
}

function chooseDiscoveredSide(id,side){const card=getCard(id);if(!card||!getTemplate(card).chooseOnDiscover||!getTemplate(card).stages[side])return;card.state=side;document.querySelectorAll(`[data-choose-side="${id}"]`).forEach(button=>button.classList.toggle("selected",Number(button.dataset.side)===side));}

async function shuffleAndStartRound() {
  if (!roundTransitionContext || roundTransitionContext.phase!=="discovery" || state.decreePending || state.permanentIntroQueue.length || (roundTransitionContext.immigrantMode&&state.immigrantChoices.length!==2)) return;
  if(roundTransitionContext.immigrantMode){
    const selected=new Set(state.immigrantChoices),candidates=state.specials.filter(card=>card.candidate);candidates.filter(card=>selected.has(card.number)).forEach(card=>{delete card.candidate;state.cards.push(card);});state.specials=state.specials.filter(card=>!candidates.includes(card));roundTransitionContext.newCards=state.cards.filter(card=>selected.has(card.number));
  }
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
  if(!state)return;
  const phase=roundTransitionContext?.phase==="intermission"?"intermission":"turn";
  const blob=new Blob([JSON.stringify(serializableState(phase),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`patria-kolo-${state.round}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify("Kompletní stav hry byl uložen do souboru.");
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

function implementedCardSpecs(){
  const specs=new Map();initialCards.forEach(spec=>specs.set(spec.number,spec.template));discoveryQueue.forEach(spec=>{if(templates[spec.template])specs.set(spec.number,spec.template);});Object.entries(catalog).forEach(([number,template])=>specs.set(Number(number),template));return [...specs].sort((a,b)=>a[0]-b[0]);
}
function showCardList(){
  hideSettingsMenu();
  document.querySelector("#card-list-content").innerHTML=`<div class="dialog-header"><span class="eyebrow">Implementovaný obsah</span><h2>Seznam karet</h2><p>Všechny dostupné karty jsou seřazené podle interního čísla. Na jednom řádku vidíš všechny jejich stavy.</p></div><div class="card-list-rows">${implementedCardSpecs().map(([number,template])=>{const card={id:number,number,template,state:0};return `<section class="card-list-row"><strong class="card-list-number">${String(number).padStart(3,"0")}</strong><div class="card-list-states">${templates[template].stages.map((_,index)=>renderPreviewCard(card,index,true)).join("")}</div></section>`;}).join("")}</div>`;
  const dialog=document.querySelector("#card-list-dialog");if(!dialog.open)dialog.showModal();
}

function showDebugCardPicker(){
  hideSettingsMenu();
  const rows=implementedCardSpecs().map(([number,template])=>{
    const item=templates[template],search=`${String(number).padStart(3,"0")} ${item.title} ${item.kind}`.toLocaleLowerCase("cs");
    return `<section class="debug-card-row" data-debug-search="${search}"><div><strong>(${String(number).padStart(3,"0")}) ${item.title}</strong><small>${item.kind}</small></div><select data-debug-state aria-label="Stav karty ${item.title}">${item.stages.map((stage,index)=>`<option value="${index}">${String.fromCharCode(65+index)} · ${stage.name}</option>`).join("")}</select><button class="upgrade-action" data-debug-add-card="${number}" type="button">Vložit</button></section>`;
  }).join("");
  document.querySelector("#debug-card-content").innerHTML=`<div class="dialog-header"><span class="eyebrow">Debug mód</span><h2>Vložit kartu do hry</h2><p>Vyber kartu a její stav. Karta se vloží do první volné pozice.</p></div><input id="debug-card-search" class="debug-card-search" type="search" placeholder="Hledat podle čísla nebo názvu…" autocomplete="off"><div class="debug-card-list">${rows}</div>`;
  const dialog=document.querySelector("#debug-card-dialog");if(!dialog.open)dialog.showModal();
  requestAnimationFrame(()=>document.querySelector("#debug-card-search")?.focus());
}

function addDebugCard(number,stageIndex){
  const template=implementedCardSpecs().find(([id])=>id===number)?.[1];if(!template)return;
  const isPermanent=[25,26,27,38,39,40,87,88,90,91,108,117].includes(number);
  let id=number;if(getCard(id)){id=1000;while(getCard(id))id+=1;}
  const card={id,number,template,state:Math.max(0,Math.min(Number(stageIndex)||0,templates[template].stages.length-1))};
  if(isPermanent){card.permanent=true;card.value=0;card.marks=0;state.permanents.push(card);}
  else{
    const slot=firstEmptySlot();if(slot<0)return notify("V aktivní zóně není volná pozice.");
    state.cards.push(card);state.slots[slot]=id;
  }
  document.querySelector("#debug-card-dialog").close();render();autosave("turn");
  if(!isPermanent){animateDeal([id]);queueBanditBlocks([id]);}
  notify(`Karta ${String(number).padStart(3,"0")} byla vložena do hry.`);
}

function advance() {
  if (state.busy || !state.deck.length) return;
  if(activeIds().some(id=>{const card=getCard(id);return card.template==="darkKnight"&&card.state===0||getStage(card).advanceLock||getStage(card).landCoinAura;}))return notify("Tato karta nyní brání dalšímu dobírání.");
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
  if (!card || slotOf(id) < 0 || !current.next.length || state.busy || isBlocked(id)) return;
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
  const confirmation=document.querySelector("#upgrade-confirm-button"),cost=expandedBundle(upgradeCost(card,pendingUpgrade.target));
  confirmation.setAttribute("aria-label",`Potvrdit vylepšení za ${cost}`);
  confirmation.title=`Potvrdit · ${cost}`;
  document.querySelector("#upgrade-dialog-content").innerHTML=`
    ${current.next.length>1?`<div class="upgrade-targets">${current.next.map(target=>{
        const next=template.stages[target], selected=target===pendingUpgrade.target, cost=upgradeCost(card,target);
        return `<button class="upgrade-choice ${selected?"selected":""}" data-select-upgrade="${target}" type="button" ${canAfford(cost)?"":"disabled"}><span>${next.name}</span><strong>${expandedBundle(cost)}</strong></button>`;
      }).join("")}</div>`:""}
    <div class="upgrade-route">
      <div><span class="preview-label">Nyní</span>${renderPreviewCard(card,card.state)}</div>
      <span class="route-arrow" aria-hidden="true">→</span>
      <div><span class="preview-label">Po vylepšení</span>${renderPreviewCard(card,pendingUpgrade.target)}</div>
    </div>`;
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
  if(isBlocked(id))return;
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
      return `<article class="stage-card ${active?"current":""} ${!active&&!direct?"unreachable":""}" data-stage-index="${index}"><span class="stage-label">${active?"Aktuální stav":`Stav ${index+1}`}</span>${renderPreviewCard(card,index,true)}</article>`;
    }).join("")}</div>`;
}

function renderPermanentDialog(card){
  const track=PERMANENT_TRACKS[card.number],template=getTemplate(card),icon=permanentIcon(card.number);
  if(card.number===117){document.querySelector("#card-dialog-content").innerHTML=`<div class="dialog-header"><span class="eyebrow">Permanentní</span><h2>Obchodní vztahy</h2><p>Utrať 3 zboží a získej libovolnou jednu surovinu.</p></div><div class="permanent-summary"><span>Zásoba <strong>${expandedBundle({goods:state.resources.goods})}</strong></span><button class="upgrade-action" data-use-trade-relations="${card.id}" type="button" ${canAfford({goods:3})?"":"disabled"}>Vyměnit 3 zboží</button></div>`;return;}
  if(!track){document.querySelector("#card-dialog-content").innerHTML=`<div class="dialog-header"><span class="eyebrow">Permanentní</span><h2>${template.title}</h2></div><p>${getStage(card).effect}</p>`;return;}
  const isExport=card.number===27;
  const rows=isExport?track.thresholds.map((threshold,index)=>`<div class="track-row ${card.value>=threshold?"reached":""} ${card.claimed?.includes(threshold)?"claimed":""}"><span>${card.value>=threshold?"✓":"○"}</span><strong>${icon} ${threshold}</strong><em>${track.labels[index]}</em></div>`).join(""):track.costs.map((cost,index)=>`<div class="track-row ${card.marks>index?"reached":""}"><span>${card.marks>index?"✓":"○"}</span><strong>${R[track.resource].icon} ${cost}</strong><em>🏆 ${track.rewards[index]}</em></div>`).join("");
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

function useTradeRelations(id){
  const card=getCard(id);if(!card||card.number!==117||!canAfford({goods:3}))return;document.querySelector("#card-dialog").close();showResourceChoice(id,Object.keys(R),1,{pay:{goods:3},keepSource:true});
}

function effectAvailable(card) {
  const current=getStage(card);
  if(current.discoverNumber===103&&getCard(103))return false;
  return !isBlocked(card)&&Boolean(current.action);
}

function ruleVisible(template,stateIndex) {
  return Boolean(templates[template].stages[stateIndex].effect);
}

function ruleIcon(stageData){return stageData.stays?"♾️":"⚡";}

function stagePips(template,currentIndex,interactiveId=null) {
  const content=template.stages.map((_,i)=>`<span class="${i===currentIndex?"active":""}"></span>`).join("");
  return interactiveId===null?`<div class="state-pips">${content}</div>`:`<button class="state-pips" data-detail="${interactiveId}" type="button" aria-label="Prohlédnout všechny stavy karty">${content}</button>`;
}

function renderCardHeader(card,template,current,currentIndex,interactiveId=null) {
  const points=(current.fame||0)+(card.fameBonus||0);
  return `<div class="card-header"><div class="card-header-row card-header-top"><span class="card-kind">${getKind(card,currentIndex)}</span>${showCardNumbers?`<span class="card-number">(${String(card.number??card.id).padStart(3,"0")})</span>`:""}${stagePips(template,currentIndex,interactiveId)}</div><div class="card-header-row card-header-bottom"><h3>${current.name}</h3>${points?`<strong class="card-points" aria-label="${points} bodů">🏆${points}</strong>`:""}</div></div>`;
}

function renderPreviewCard(card,stageIndex,showRoutes=false) {
  const template=getTemplate(card), current=template.stages[stageIndex], production=getProduction(card,stageIndex), hasProduction=Object.values(production).some(Boolean);
  const previewCost=current.next.length===1?(template.branchCosts?.[current.next[0]]||current.cost):null;
  const previewUpgrades=current.next.map(target=>`<span class="upgrade-line" ${showRoutes?`data-route-target="${target}" title="Vede na: ${template.stages[target].name}"`:""}><span>⭐</span><strong>${expandedBundle(template.branchCosts?.[target]||current.cost)}</strong>${showRoutes?`<small>→ ${template.stages[target].name}</small>`:""}</span>`).join("");
  return `<article class="game-card preview-card ${current.next.length>1?"multiple-upgrades":""}">
    <img class="card-art-full" src="${cardAsset(card,stageIndex)}" alt="" draggable="false"><div class="card-shade" aria-hidden="true"></div>
    ${renderCardHeader(card,template,current,stageIndex)}
    ${hasProduction?`<div class="production-space static-production">${productionIcons(production)}</div>`:""}
    ${ruleVisible(card.template,stageIndex)?`<div class="effect-panel">${ruleIcon(current)} ${current.effect}</div>`:""}
    ${current.next.length?`<div class="upgrade-panel static-upgrade"><div class="upgrade-lines">${previewUpgrades}</div></div>`:""}
  </article>`;
}

function renderCard(id) {
  const card=getCard(id), template=getTemplate(card), current=getStage(card), next=current.next;
  const blockingVictim=Number(Object.keys(state.blocked).find(cardId=>state.blocked[cardId]===id))||null;
  const linkId=state.blocked[id]||(blockingVictim?id:null);
  const production=getProduction(card),hasProduction=Object.values(production).some(Boolean);
  const effectIsActive=effectAvailable(card);
  const affordableTargets=isBlocked(id)?[]:next.filter(target=>canAfford(upgradeCost(card,target)));
  const upgradeLabel=next.length===1?expandedBundle(upgradeCost(card,next[0])):next.map(target=>expandedBundle(upgradeCost(card,target))).join(" / ");
  const upgradeAria=next.length===1?formatBundle(upgradeCost(card,next[0])):next.map(target=>formatBundle(upgradeCost(card,target))).join(" nebo ");
  const upgradeRows=next.map(target=>`<span class="upgrade-line"><span>⭐</span><strong>${expandedBundle(upgradeCost(card,target))}</strong></span>`).join("");
  const isBandit=["banditWorker","banditField","skilledBanditBuilding","skilledBanditLand"].includes(card.template)&&card.state===0,banditCost=current.defeatCost||1;
  const isWitch=card.template==="witch";
  const missionaryReady=activeIds().some(otherId=>getCard(otherId).template==="missionary"&&getCard(otherId).state===0)&&canAfford({coin:3});
  return `<article class="game-card ${next.length>1?"multiple-upgrades":""} ${state.blocked[id]?"bandit-blocked":""} ${linkId&&linkId===selectedBanditLink?"linked-highlight":""}" data-card="${id}" ${linkId?`data-bandit-link="${linkId}"`:""} draggable="true" aria-label="${current.name}">
    <img class="card-art card-art-full" src="${cardAsset(card,card.state)}" alt="" draggable="false" />
    <div class="card-shade" aria-hidden="true"></div>
    ${renderCardHeader(card,template,current,card.state,id)}
    ${state.blocked[id]?`<div class="bandit-mark" aria-label="Tuto kartu blokuje Bandita"><span>Blokováno</span></div>`:""}
    ${hasProduction?`<button class="production-space" data-produce="${id}" type="button" aria-label="Použít produkci: ${formatBundle(production)}" ${state.blocked[id]?"disabled":""}>${productionIcons(production)}</button>`:""}
    ${isBandit?`<div class="effect-panel bandit-actions"><span>⚡ Zvol akci</span><div><button data-effect="${id}" data-effect-mode="defeat-bandit" type="button" ${canAfford({sword:banditCost})?"":"disabled"}>⚔️ Porazit</button><button data-effect="${id}" data-effect-mode="convert-bandit" type="button" ${missionaryReady?"":"disabled"}>🤝 Přivítat</button></div></div>`:isWitch?`<div class="effect-panel bandit-actions"><span>⚡ Zvol akci</span><div><button data-effect="${id}" data-effect-mode="${card.state===0?"defeat-witch":"defeat-witch-hut"}" type="button" ${canAfford({sword:card.state===0?4:3})?"":"disabled"}>⚔️ Porazit</button><button data-effect="${id}" data-effect-mode="${card.state===0?"soothe-witch":"sacrifice-witch-hut"}" type="button">👤 ${card.state===0?"Uklidnit":"Obětovat"}</button></div></div>`:ruleVisible(card.template,card.state)?effectIsActive?`<button class="effect-panel active-effect" data-effect="${id}" type="button">${ruleIcon(current)} ${current.effect}</button>`:`<div class="effect-panel">${ruleIcon(current)} ${current.effect}</div>`:""}
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
  const lastOccupied=state.slots.reduce((last,id,index)=>id===null?last:index,-1);
  const visibleSlots=lastOccupied<0?[]:state.slots.slice(0,lastOccupied+1).map((id,index)=>({id,index}));
  const playArea=document.querySelector("#play-area");
  playArea.classList.toggle("two-rows",visibleSlots.length>maxColumns);
  playArea.style.setProperty("--max-columns",maxColumns);
  playArea.innerHTML=visibleSlots.map(({id,index})=>id===null?`<div class="card-slot empty-slot" data-slot="${index}" aria-hidden="true"></div>`:`<div class="card-slot" data-slot="${index}">${renderCard(id)}</div>`).join("");
  requestAnimationFrame(updateCardSize);
  document.querySelector("#empty-state").hidden=activeIds().length>0;
  document.querySelector("#advance-button").disabled=state.busy||state.deck.length===0||firstEmptySlot()<0;
  document.querySelector("#advance-button").hidden=debugMode;
  document.querySelector("#debug-add-button").hidden=!debugMode;
  document.querySelector("#debug-add-button").disabled=state.busy||firstEmptySlot()<0;
  document.querySelector("#pass-button").disabled=state.busy;
}

function updateCardSize() {
  const area=document.querySelector(".board-scroll"), grid=document.querySelector("#play-area");
  if (!area || !grid) return;
  const columns=Math.max(1,Number(grid.style.getPropertyValue("--max-columns"))||maxColumns);
  const gap=10;
  const bottomSpace=38;
  const ratio=5/8;
  const horizontal=Math.floor((area.clientWidth-4-(columns-1)*gap)/columns);
  const parent=area.parentElement,parentStyle=getComputedStyle(parent);
  const availableHeight=Math.max(120,parent.clientHeight-(parseFloat(parentStyle.paddingTop)||0)-(parseFloat(parentStyle.paddingBottom)||0));
  const visibleRows=Math.max(1,Math.ceil(grid.children.length/columns));
  let width=Math.max(24,horizontal);
  const idealCardHeight=width/ratio;
  if(visibleRows===1){
    width=Math.max(24,Math.min(width,Math.floor((availableHeight-bottomSpace)*ratio)));
  }else{
    const idealContentHeight=visibleRows*idealCardHeight+(visibleRows-1)*gap+bottomSpace;
    const overflow=idealContentHeight-availableHeight;
    if(overflow>0&&overflow<=idealCardHeight*.2){
      const fitted=Math.floor(((availableHeight-bottomSpace-(visibleRows-1)*gap)/visibleRows)*ratio);
      width=Math.max(24,Math.min(width,fitted));
    }
  }
  area.style.height=`${availableHeight}px`;
  area.style.maxHeight=`${availableHeight}px`;
  area.style.overflowY="auto";
  grid.style.setProperty("--card-width",`${width}px`);
  applyCardMetrics(grid,width);
}

function applyCardMetrics(grid,width) {
  const scale=Math.max(.16,width/178);
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

function showFocusedCard(id){
  const card=getCard(id),dialog=document.querySelector("#card-focus-dialog"),content=document.querySelector("#card-focus-content");
  if(!card||slotOf(id)<0)return;
  content.innerHTML=`<div class="card-grid focus-card-shell" style="--max-columns:1"><div class="card-slot">${renderCard(id).replace('draggable="true"','draggable="false"')}</div></div>`;
  if(!dialog.open)dialog.showModal();
  requestAnimationFrame(()=>{
    const width=Math.max(178,Math.floor(Math.min(380,innerWidth-54,(innerHeight-54)*(5/8))));
    const shell=content.querySelector(".focus-card-shell");
    shell.style.setProperty("--card-width",`${width}px`);
    applyCardMetrics(shell,width);
  });
}

document.addEventListener("click", event => {
  const button=event.target.closest("button");
  if (button) {
    event.stopPropagation();
    button.closest("#card-focus-dialog")?.close();
    if (button.dataset.produce) produce(Number(button.dataset.produce));
    if (button.dataset.effect) useEffect(Number(button.dataset.effect),button.dataset.effectMode||null);
    if (button.dataset.usePermanent) usePermanent(Number(button.dataset.usePermanent));
    if (button.dataset.useTradeRelations) useTradeRelations(Number(button.dataset.useTradeRelations));
    if (button.dataset.upgradePreview) showUpgradeChoice(Number(button.dataset.upgradePreview),button.dataset.target===undefined?null:Number(button.dataset.target));
    if (button.dataset.selectUpgrade) selectUpgradeTarget(Number(button.dataset.selectUpgrade));
    if (button.dataset.selectDiscard) selectDiscardCard(Number(button.dataset.selectDiscard));
    if (button.dataset.selectRetrieve) selectRetrieveCard(Number(button.dataset.selectRetrieve));
    if (button.dataset.pickResource) pickResource(button.dataset.pickResource);
    if (button.dataset.selectActionCard) selectActionCard(Number(button.dataset.selectActionCard));
    if (button.dataset.selectActionUpgrade&&pendingActionChoice?.type==="action-upgrade") {const [cardId,target]=button.dataset.selectActionUpgrade.split(":").map(Number);pendingActionChoice.selectedId=cardId;pendingActionChoice.targetState=target;renderActionChoice();}
    if (button.dataset.selectSelfSide&&pendingActionChoice?.type==="self-boost") {pendingActionChoice.side=Number(button.dataset.selectSelfSide);renderActionChoice();}
    if (button.dataset.pirateMode&&pendingActionChoice?.type==="pirate-ally") {pendingActionChoice.mode=button.dataset.pirateMode;renderActionChoice();}
    if (button.dataset.chooseSide) chooseDiscoveredSide(Number(button.dataset.chooseSide),Number(button.dataset.side));
    if (button.dataset.chooseImmigrant) chooseImmigrant(Number(button.dataset.chooseImmigrant));
    if (button.dataset.markCount&&pendingActionChoice?.type==="mercenary") { pendingActionChoice.markCount=Number(button.dataset.markCount);renderActionChoice(); }
    if (button.dataset.inventorMode&&pendingActionChoice?.type==="inventor") { pendingActionChoice.mode=button.dataset.inventorMode;pendingActionChoice.selectedId=null;pendingActionChoice.selected=[];renderActionChoice(); }
    if (button.dataset.selectSideChoice!==undefined&&pendingActionChoice?.type==="side-choice") { pendingActionChoice.selectedId=Number(button.dataset.selectSideChoice);renderActionChoice(); }
    if (button.hasAttribute("data-confirm-upgrade")) confirmUpgrade();
    if (button.hasAttribute("data-confirm-discard")) confirmDiscardChoice();
    if (button.hasAttribute("data-confirm-retrieve")) confirmRetrieveCard();
    if (button.hasAttribute("data-confirm-action-choice")) confirmActionChoice();
    if (button.hasAttribute("data-save-game")) saveGame();
    if (button.hasAttribute("data-go-home")) showWelcome();
    if (button.hasAttribute("data-final-new-game")){document.querySelector("#round-transition").hidden=true;startFromWelcome();}
    if (button.hasAttribute("data-open-library")) showLibrary();
    if (button.hasAttribute("data-close-card-list")) document.querySelector("#card-list-dialog").close();
    if (button.hasAttribute("data-close-debug-cards")) document.querySelector("#debug-card-dialog").close();
    if (button.dataset.debugAddCard) {const row=button.closest(".debug-card-row"),stage=Number(row?.querySelector("[data-debug-state]")?.value||0);addDebugCard(Number(button.dataset.debugAddCard),stage);}
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
    if (button.hasAttribute("data-close-action-choice")) { if(!["block","decree","volcano","permanent-intro","side-choice","shrine-stay"].includes(pendingActionChoice?.type)){document.querySelector("#action-choice-dialog").close(); pendingActionChoice=null;} }
    if (!button.closest("#settings-menu") && button.id!=="settings-button") hideSettingsMenu();
    return;
  }
  const linkedCard=event.target.closest?.("[data-bandit-link]");
  if(linkedCard){const linkId=Number(linkedCard.dataset.banditLink);selectedBanditLink=selectedBanditLink===linkId?null:linkId;render();return;}
  if (!event.target.closest("#settings-menu")) hideSettingsMenu();
});
document.addEventListener("dblclick",event=>{
  if(event.target.closest("button"))return;
  const focused=event.target.closest("#card-focus-dialog .game-card");
  if(focused){document.querySelector("#card-focus-dialog").close();return;}
  const card=event.target.closest("#play-area .game-card");
  if(card)showFocusedCard(Number(card.dataset.card));
});
document.addEventListener("dragstart", event => {
  const card=event.target.closest?.("[data-card]");
  if (!card || state.busy || event.target.closest?.("button")) return event.preventDefault();
  draggingId=Number(card.dataset.card);
  event.dataTransfer.effectAllowed="move";
  event.dataTransfer.setData("text/plain",String(draggingId));
  requestAnimationFrame(()=>card.classList.add("dragging"));
});
document.addEventListener("pointerover",event=>{const route=event.target.closest?.("[data-route-target]");if(!route)return;const gallery=route.closest(".stage-gallery"),target=gallery?.querySelector(`[data-stage-index="${route.dataset.routeTarget}"]`);route.closest(".stage-card")?.classList.add("route-source");target?.classList.add("route-target");});
document.addEventListener("pointerout",event=>{const route=event.target.closest?.("[data-route-target]");if(!route||route.contains(event.relatedTarget))return;route.closest(".stage-gallery")?.querySelectorAll(".route-source,.route-target").forEach(card=>card.classList.remove("route-source","route-target"));});
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
document.querySelector("#debug-add-button").addEventListener("click",showDebugCardPicker);
document.querySelector("#pass-button").addEventListener("click",()=>{if(!state.busy)endTurn(false);});
document.querySelector("#restart-button").addEventListener("click",()=>{closeDialogs();showWelcome();});
document.querySelector("#start-game-button").addEventListener("click",startFromWelcome);
document.querySelector("#continue-game-button").addEventListener("click",continueFromWelcome);
document.querySelector("#load-game-button").addEventListener("click",()=>document.querySelector("#load-game-input").click());
document.querySelector("#load-game-input").addEventListener("change",event=>{loadGameFile(event.target.files?.[0]);event.target.value="";});
document.querySelector("#welcome-rules-button").addEventListener("click",()=>document.querySelector("#rules-dialog").showModal());
document.querySelector("#rules-button").addEventListener("click",()=>{hideSettingsMenu();document.querySelector("#rules-dialog").showModal();});
document.querySelector("#card-list-button").addEventListener("click",showCardList);
document.querySelector("#save-game-button").addEventListener("click",()=>{hideSettingsMenu();saveGame();});
document.querySelector("#home-button").addEventListener("click",showWelcome);
document.querySelector("#settings-button").addEventListener("click",event=>{
  const menu=document.querySelector("#settings-menu"),open=menu.hidden;
  menu.hidden=!open;
  event.currentTarget.setAttribute("aria-expanded",String(open));
  document.querySelector("#column-count").value=String(maxColumns);
  document.querySelector("#column-count-value").value=String(maxColumns);
  document.querySelector("#show-card-numbers").checked=showCardNumbers;
  document.querySelector("#confirm-production").checked=confirmProductionSetting;
  document.querySelector("#debug-mode").checked=debugMode;
});
document.querySelector("#show-card-numbers").addEventListener("change",event=>{showCardNumbers=event.target.checked;localStorage.setItem("patria-show-card-numbers",String(showCardNumbers));render();});
document.querySelector("#confirm-production").addEventListener("change",event=>{confirmProductionSetting=event.target.checked;localStorage.setItem("patria-confirm-production",String(confirmProductionSetting));});
document.querySelector("#debug-mode").addEventListener("change",event=>{debugMode=event.target.checked;localStorage.setItem("patria-debug-mode",String(debugMode));render();});
document.addEventListener("input",event=>{if(event.target.id!=="debug-card-search")return;const query=event.target.value.trim().toLocaleLowerCase("cs");document.querySelectorAll(".debug-card-row").forEach(row=>row.hidden=query&&!row.dataset.debugSearch.includes(query));});
document.querySelector("#column-count").addEventListener("input",event=>{maxColumns=Math.max(2,Math.min(8,Number(event.target.value)||6));document.querySelector("#column-count-value").value=String(maxColumns);localStorage.setItem("patria-max-columns",String(maxColumns));render();});
document.querySelector("#discard-pile").addEventListener("click",()=>showDiscardBrowser());
document.querySelectorAll("dialog").forEach(dialog=>{
  dialog.addEventListener("cancel",event=>{if(dialog.id==="action-choice-dialog"&&["block","decree","volcano","permanent-intro","side-choice","shrine-stay"].includes(pendingActionChoice?.type))event.preventDefault();});
  dialog.addEventListener("click",event=>{if(event.target===dialog){if(dialog.id==="action-choice-dialog"&&["block","decree","volcano","permanent-intro","side-choice","shrine-stay"].includes(pendingActionChoice?.type))return;dialog.close();if(dialog.id==="discard-choice-dialog")pendingDiscard=null;if(dialog.id==="upgrade-dialog")pendingUpgrade=null;if(dialog.id==="discard-browser-dialog")pendingDiscardBrowser=null;if(dialog.id==="action-choice-dialog")pendingActionChoice=null;if(dialog.id==="library-dialog")document.querySelector("#round-transition")?.classList.remove("behind-dialog");}});
  dialog.addEventListener("close",()=>{if(dialog.id==="library-dialog")document.querySelector("#round-transition")?.classList.remove("behind-dialog");});
});
window.addEventListener("resize",updateCardSize);

document.querySelector("#show-card-numbers").checked=showCardNumbers;
document.querySelector("#confirm-production").checked=confirmProductionSetting;
document.querySelector("#debug-mode").checked=debugMode;
document.querySelector("#column-count").value=String(maxColumns);
document.querySelector("#column-count-value").value=String(maxColumns);
document.querySelector("#build-number").textContent=BUILD_NUMBER;
showWelcome();

