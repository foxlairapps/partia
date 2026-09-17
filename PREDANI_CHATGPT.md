# Předání projektu Patria do nové konverzace

Tento soubor lze spolu s celým ZIPem předat běžnému ChatGPT nebo jinému vývojáři.

## Stručný kontext

Pracujeme na webové karetní hře Patria, inspirované principem hry Kingdom Legacy. Zachováváme základní herní mechaniku a návaznost karet, ale používáme české názvy, vlastní texty, vlastní rozhraní a vlastní ilustrace.

Hra je částečný deckbuilding o budování panství. Neexistuje prohra; cílem jsou vítězné body. Každá karta má až čtyři samostatně zobrazované stavy a může mít lineární nebo větvený vývoj.

Aktuální verze je čistá statická aplikace v `index.html`, `styles.css` a `app.js`. Nemá framework ani sestavovací krok. Data a pravidla karet jsou zatím přímo v `app.js`. Veřejná verze běží na https://patria.foxlairstudio.com a zdrojový repozitář je https://github.com/foxlairapps/partia.

## Důležité již dohodnuté chování

1. Tah začíná až čtyřmi kartami; další karty se dobírají po dvou.
2. Dobírání není nový tah a nemaže nasbírané suroviny.
3. Produkce přidá suroviny, kartu odhodí a tah pokračuje.
4. Vylepšení mění stav karty a zpravidla ukončuje tah.
5. Pokud efekt vyžaduje odhození jiné karty jako cenu, hráč musí zvolit konkrétní kartu.
6. Na konci kola je samostatná rolovatelná závěrečná obrazovka s informací o automatickém uložení, knihovnou, návratem na hlavní stránku a zahájením dalšího kola. Ruční uložení kompletního aktuálního stavu je v hamburger menu.
7. Poté následuje úvod nového období: nové karty, případná vysvětlení, knihovna a tlačítko „Zamíchat“.
8. Karty mají pevný poměr stran. Uživatel volí kapacitu řádku 4, 6 nebo 8 a velikost karet se řídí touto kapacitou, nikoli aktuálním počtem karet.
9. Hlavička je fixní; oblast karet se může svisle rolovat.
10. Detail karty otevřený z knihovny nebo odhazovacího balíčku se zavírá zpět na stejné místo.

## Doporučený postup navazující práce

Nejprve si přečti `DOKUMENTACE.md`, poté projdi definice `templates` a funkcí herního toku v `app.js`. Před každou změnou zachovej výše uvedené dohody. Po úpravě spusť syntaktickou kontrolu JavaScriptu a vizuálně ověř hlavní tah, dobrání, produkci, vylepšení, konec kola, knihovnu a odhazovací balíček.

Při navazování se nejprve uživatele zeptej, kterou další část chce rozvíjet: úplnost pravidel a karet, ukládání/načítání, skórování, nebo další vizuální dolaďování.

