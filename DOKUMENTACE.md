# Patria – dokumentace prototypu

## 1. Účel projektu

Patria je webový prototyp karetní hry o budování panství. Hra se nedá prohrát; cílem je rozvíjet karty a získávat vítězné body. Mechanika vychází z postupného hraní balíčku po kolech a z vylepšování jednotlivých karet mezi až čtyřmi stavy.

Aktuální veřejná verze: https://partia.foxlairstudio.com

## 2. Základní herní smyčka

- Hráč začíná s balíčkem deseti karet.
- Na začátku tahu dostane až čtyři karty.
- Může dobrat další dvě, pokud jsou v dobíracím balíčku. Dobírání nezačíná nový tah a nemaže získané suroviny.
- Produkce přidá suroviny, kartu odhodí a tah pokračuje.
- Aktivní efekt může mít vlastní cenu nebo vyžadovat výběr obětované karty.
- Vylepšení je hlavní akce: zaplatí cenu, změní stav karty a ukončí tah.
- Po vyčerpání balíčku skončí kolo. Následuje závěrečná stránka a poté úvod nového období se dvěma novými kartami.
- Tlačítko „Zamíchat“ přidá nové karty do balíčku, spustí animaci a zahájí další kolo.

## 3. Karty a jejich data

Definice karet jsou na začátku `app.js` v objektu `templates`. Každá šablona obsahuje:

- `title` – interní označení vývojové řady,
- `kind` – typ karty, například Krajina nebo Budova,
- `stages` – seznam stavů karty,
- volitelně `branchCosts` – ceny větvených přechodů.

Jeden stav karty obsahuje název, cestu k obrázku, produkci, cenu vylepšení, bodovou hodnotu, text efektu a seznam možných následujících stavů. Karta v rozehrané hře má vlastní `id`, klíč šablony `template` a index aktuálního stavu `state`.

Úvodní balíček určuje `initialCards`. Pořadí dalších objevovaných karet určuje `discoveryQueue`.

## 4. Suroviny

Suroviny jsou definované v objektu `R` v `app.js`:

- mince `🪙`,
- dřevo `🪵`,
- kámen `🪨`,
- kov `⚙️`,
- síla `⚔️`,
- zboží `📦`.

V hlavičce se každá získaná jednotka zobrazuje samostatnou ikonou ve stabilním pořadí. Suroviny platí pro aktuální tah.

## 5. Rozhraní

- Fixní hlavička obsahuje logo, suroviny, dobírací balíček, dobrání dvou karet, číslo kola, ukončení tahu, odhazovací balíček a hamburger menu. Na telefonu se textová tlačítka zkrátí na ikony a při dalším zúžení se hlavička rozdělí do dvou řádků.
- Počet karet v řádku lze nastavit na 4, 6 nebo 8. Volba se ukládá v prohlížeči.
- Karty zachovávají poměr stran a prvky na kartě se škálují společně s kartou.
- Stavové tečky otevírají galerii všech stavů.
- Odhazovací balíček a knihovna zobrazují prohlížitelný pás či seznam celých karet.
- Závěr kola a úvod nového období jsou dvě oddělené obrazovky.

## 6. Ukládání

Prototyp automaticky ukládá stav hry do `localStorage` prohlížeče pod klíčem `patria-autosave`. Nastavení počtu karet v řádku používá klíč `patria-max-columns`; volitelné zobrazení interních čísel karet klíč `patria-show-card-numbers`.

Uložená hra je zatím lokální pro konkrétní prohlížeč a zařízení. Synchronizace mezi zařízeními ani uživatelské účty nejsou implementované.

## 7. Struktura projektu

- `index.html` – základní struktura aplikace a dialogy.
- `styles.css` – celý vzhled, rozvržení, škálování a animace.
- `app.js` – data karet, herní stav, pravidla a obsluha rozhraní.
- `assets/` – ilustrace jednotlivých stavů karet. Herní soubory používají názvy ve formátu `ID + stav`, například `045a.jpg`, `045b.jpg`; písmeno značí index stavu od `a`.
- `CNAME` – vlastní doména GitHub Pages.
- `.nojekyll` – vypnutí zpracování Jekyllem.
- `.github/workflows/pages.yml` – automatické zveřejnění po změně větve `main`.
- `PREDANI_CHATGPT.md` – kontext pro dalšího asistenta.

## 8. Lokální spuštění

Aplikace je čisté HTML, CSS a JavaScript bez instalace balíčků. Lze otevřít `index.html` přímo. Při vývoji je vhodné obsah složky servírovat jednoduchým HTTP serverem a otevřít jeho lokální adresu.

Po změně JavaScriptu je vhodné zkontrolovat syntaxi příkazem `node --check app.js` a aplikaci následně projít v prohlížeči.

## 9. Publikování

Zdrojový repozitář: https://github.com/foxlairapps/partia

Každá změna ve větvi `main` spustí GitHub Actions workflow a publikuje kořen repozitáře na GitHub Pages. V DNS musí `partia.foxlairstudio.com` zůstat jako CNAME směrovaný na GitHub Pages. Soubor `CNAME` v repozitáři musí obsahovat stejnou doménu.

## 10. Známá omezení a další směr

- Kampaň je zpracovaná do karty 059. Druhá vlna přistěhovalců otevírá volbu z karet 048–051; další období přidávají Mohylu, Čarodějnici, Písaře, volbu vládce, Mor, Vraha, Požár města a Tajemnou jeskyni. V katalogu jsou i všechny jejich návaznosti: 078–081, 105–106, 108 a 119–134, takže žádný objev nezmizí bez náhrady.
- Assety nově přidaných karet jsou uložené podle čísla a stavu (`059a.jpg`, `059b.jpg` atd.). Každá nová karta má vlastní tematický motiv; klíčové vícestavové vývoje mají samostatné ilustrace jednotlivých stavů.
- Uložení není zatím možné načíst z menu a není přenosné mezi zařízeními.
- Chybí úplné vyhodnocení vítězných bodů, závěrečné skóre a delší postup kampaní.
- Před rozšířením obsahu je vhodné oddělit data karet od herního enginu do samostatného datového souboru.
- Pro větší množství ilustrací bude vhodná optimalizace formátu a velikosti obrázků.

## 11. Zásady pro další úpravy

- Zachovat poměr stran karet a společné škálování všech jejich prvků.
- Dobírání dvou karet nesmí resetovat suroviny.
- Produkce neukončuje tah; vylepšení jej zpravidla ukončuje.
- Při požadavku na odhození karty jako platbu musí hráč vždy konkrétní kartu vybrat.
- Detail otevřený z knihovny či odhazovacího balíčku se má zavřít zpět do původního dialogu.
- Než se nové karty zamíchají, musí být možné prohlédnout je i všechny jejich stavy.
