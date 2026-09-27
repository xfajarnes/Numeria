# Numèria · Tall 1: Equatia

Primera prova jugable del joc. És una sola zona petita (la costa d'Al-Gerba, amb el port d'Equatia) pensada per provar les peces principals abans de fer créixer el món: moviment a PC i mòbil, quatre NPC i una tomba amb repte, cinc tipus de repte amb tres nivells, filtre de nivell, desat al núvol i telemetria cap a Apps Script.

## Què hi ha dins

| Carpeta o fitxer | Què és | L'has de tocar? |
|---|---|---|
| `index.html` | La pàgina del joc | No |
| `js/config.js` | L'adreça d'Apps Script | **Sí, un cop** |
| `dades/dialegs.txt` | Tots els textos dels personatges, en text pla | Quan vulguis |
| `js/reptes/generadors.js` | Els generadors de reptes (enunciats, pistes, errors típics) | Si vols canviar reptes |
| `js/mon/equatia.js` | El mapa: on és cada casa, NPC i objecte | Si vols moure coses |
| `js/art/` | La biblioteca d'art en codi (paleta de 07-art i peces) | No cal |
| `apps-script/Codi.gs` | El servidor, per enganxar a Apps Script | Només per copiar-lo |

## Els cinc reptes

| On | Qui | Tipus | 1r-2n ESO | 3r-4t ESO | Batxillerat |
|---|---|---|---|---|---|
| Davant del Basar | Qàsim ibn Jabr | R-NUM | E-NUM-44 | E-NUM-45 | B-NUM-06 |
| Tomba de Diofant | (objecte) | R-PAS | E-ALG-15 | E-ALG-22 | B-ALG-04 |
| Parada de dàtils | Venedora de dàtils | R-TRI | E-NUM-50 | E-NUM-45 | B-NUM-06 |
| Plaça del mercat | Emiliana Rho | R-TAU | E-NUM-51 | E-NUM-52 | B-NUM-06 |
| Moll | Leo Summi | R-CLA | E-ALG-06 | E-ALG-22 | B-ALG-01 |

Cada repte genera variants infinites, té tres pistes (orientació, mètode i exemple semblant), detecta alguns errors típics i registra saber, nivell, encert, intents, pistes i temps.

---

## Pas a pas

Calcula uns 20 minuts. No cal instal·lar res: tot es fa des del navegador.

### Part A · El full de càlcul i Apps Script (el servidor)

1. Crea un **full de càlcul nou** a Google Drive (amb el compte del centre). Posa-li un nom, per exemple *Numèria · dades*.
2. Obre **Extensions → Apps Script**.
3. Esborra el que hi hagi a `Codi.gs` i enganxa-hi tot el contingut del fitxer `apps-script/Codi.gs`. Desa (icona del disquet).
4. Torna al full i **recarrega la pàgina**. Apareixerà un menú nou, **Numèria**. Tria **Numèria → 1 · Preparar el full**. La primera vegada Google demanarà permisos: accepta'ls (és el teu propi script).
5. Ara tens tres pestanyes: *Alumnes*, *Partides* i *Telemetria*. A *Alumnes* hi ha tres alumnes de prova amb contrasenya `numeria`: `PROVA01` (1r ESO), `PROVA03` (3r ESO) i `PROVAB1` (1r Batx MACS).
6. A l'editor d'Apps Script, prem **Implementa → Implementació nova**. A la roda dentada tria **Aplicació web**. Posa:
   - *Executa com a:* **Jo**
   - *Qui hi té accés:* **Qualsevol usuari** (en anglès, *Anyone*)
7. Prem **Implementa** i copia l'**URL de l'aplicació web** (acaba en `/exec`).
8. Comprovació ràpida: enganxa aquesta URL al navegador. Has de veure `{"ok":true,"missatge":"Numèria · servidor actiu"}`.

> **Si al pas 6 no et surt "Qualsevol usuari"** i només pots triar "Qualsevol usuari de INS Manolo Hugué", és una restricció del Workspace del centre. Amb aquesta opció el joc no podrà connectar (el navegador de l'alumne no envia la sessió de Google). Hi ha dues sortides: demanar a l'administrador del domini que permeti aplicacions web obertes, o crear el full i l'script amb un compte personal de Google. El joc funciona igualment en mode convidat mentrestant.

### Part B · Posar l'adreça al joc

9. Obre `js/config.js` amb qualsevol editor de text i enganxa l'URL entre les cometes:
   ```js
   URL_APPS_SCRIPT: 'https://script.google.com/macros/s/..../exec',
   ```
   Si ho vols fer des de GitHub, també es pot editar allà (pas 16).

### Part C · Pujar-ho a GitHub

10. Entra a [github.com](https://github.com) (si no tens compte, crea'n un; és gratuït).
11. A dalt a la dreta, **+ → New repository**. Nom: `numeria` (o el que vulguis). Marca **Public** (GitHub Pages gratuït només funciona amb repositoris públics). **No** marquis cap opció d'afegir README. Prem **Create repository**.
12. A la pàgina del repositori buit, clica l'enllaç **uploading an existing file**.
13. Descomprimeix el zip al teu ordinador i **arrossega el contingut** de la carpeta `numeria` (no la carpeta mateixa: els fitxers `index.html`, `README.md` i les carpetes `js`, `css`, `dades` i `apps-script`) a la finestra de GitHub. GitHub manté les subcarpetes.
14. A baix, a *Commit changes*, escriu un missatge (per exemple, *Tall 1: Equatia*) i prem **Commit changes**.
15. Ves a **Settings → Pages**. A *Build and deployment*, *Source*: **Deploy from a branch**. *Branch*: **main** i carpeta **/ (root)**. **Save**.
16. Espera un o dos minuts i recarrega la pàgina de *Settings → Pages*. Sortirà l'adreça del joc, del tipus `https://el-teu-usuari.github.io/numeria/`. Si al pas 9 no havies posat l'URL, obre `js/config.js` al repositori, clica el llapis, enganxa-la i fes *Commit changes*; en un minut el joc ja la farà servir.

### Part D · Provar-ho

17. Obre l'adreça del joc a l'ordinador. Entra amb `PROVA03` / `numeria`, crea el personatge i resol un repte. A la cantonada de dalt, la icona del núvol ha de passar a **◆ cian** (desat al núvol).
18. Mira el full de càlcul: a *Telemetria* hi ha d'haver una fila per repte, i a *Partides*, la partida de `PROVA03`.
19. Obre la mateixa adreça al mòbil (millor en horitzontal). Surt el joystick a l'esquerra, el botó d'acció a la dreta i, als reptes numèrics, el teclat propi del joc.
20. Per provar tots els nivells sense compte, entra com a **convidat**: el Quadern (a dalt a la dreta) té el filtre de nivell. En mode convidat no s'envia res al núvol.

### Quan vulguis canviar alguna cosa

- **Textos:** edita `dades/dialegs.txt` a GitHub (clica el fitxer i després el llapis). El format és a la capçalera del mateix fitxer.
- **Alumnes:** afegeix files a la pestanya *Alumnes* (codi, curs i itinerari) i fes **Numèria → 2 · Generar contrasenyes que faltin**. El curs pot ser `1`, `2`, `3`, `4`, `B1` o `B2`; l'itinerari, `ESO`, `MAT` o `MACS`. Posa `no` a la columna *actiu* per bloquejar un codi.
- **Si modifiques `Codi.gs`:** cal fer **Implementa → Gestiona les implementacions → llapis → Versió: nova → Implementa**. L'URL es manté.
- Després de cada canvi a GitHub, el joc s'actualitza en un o dos minuts. Si no el veus, recarrega amb Ctrl+Maj+R.

## Límits coneguts d'aquesta prova

- És una sola zona: no hi ha pròleg al Vèrtex, ni Esteles, ni Taulell, ni duels. Són la següent capa.
- Els retrats dels diàlegs són provisionals (inicials dins l'heptàgon) fins que hi hagi els retrats sense text.
- La contrasenya es guarda en clar al full. Val per a una prova pilot dins del Workspace del centre; per a ús real convé guardar-ne un resum (hash).
- A Batxillerat, tres reptes fan servir B-NUM-06 (interès compost), que és de MACS. Per a MAT fan d'eco; quan es faci el capítol sencer, les variants C-MAT seran les de 06-narrativa.
- Les respostes es comproven al navegador. Per a proves amb nota caldrà la comprovació a Apps Script (01 §4), que encara no hi és.
- Si l'enviament falla, la telemetria queda en cua al navegador i es torna a enviar sola. Si l'alumne esborra les dades del navegador abans que torni la connexió, aquella cua es perd.
