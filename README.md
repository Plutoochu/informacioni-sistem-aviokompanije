# Informacioni sistem za aviokompanije

Informacioni sistem za aviokompanije je platforma namijenjena za optimizaciju operacija i resursa aviokompanije, dizajnirana za putnike i administratore.

Ova aplikacija je razvijena u sklopu predmeta "Napredni razvoj softvera" na Elektrotehničkom fakultetu u Sarajevu, akademske 2024./2025. godine.

[Live verzija](https://informacioni-sistem-za-aviokompanije.vercel.app/)

## Korištene tehnologije

Pri realizaciji našeg projekta korišteni su sljedeći alati i tehnologije:

Na frontendu

- **React** - JS biblioteka za izgradnju korisničkog interfejsa
- **Vite** za bundling frontend dijela aplikacije
- **React router** za rutiranje
- **Tailwind** za olakšani styling komponenti
- **Axios** za slanje zahtjeva ka serveru
- **Redux toolkit** za globalno upravljanje stanjem aplikacije

Na backendu

- **Node.js** sa **Express** frameworkom za server
- **MongoDB** - NoSQL baza podataka
- **Mongoose** - ODM (Object Data Model), alat za modeliranje MongoDB objekata

Deployment je obavljen na Vercel platformi za frontend dio aplikacije, a na Render platformi za backend dio aplikacije.

## Upute za lokalno pokretanje

1. Klonirati repozitorij lokalno komandom:

`git clone https://github.com/AnandPap/informacioni-sistem-za-aviokompanije.git`

2. Instalirati odgovarajuće pakete i u "client" i u "server" folderu navigiranjem u svaki od njih pojedinačno, te izvršavanjem komande:

`npm install`

3. Osigurati da je MongoDB pokrenut na lokalnom računaru (port 27017)

4. Pokrenuti lokalno aplikaciju iz oba foldera "client" i "server" sa:

```bash
# U server folderu (port 5000)
npm run dev

# U client folderu (port 5173)
npm run dev
```

5. Aplikacija bi trebala biti dostupna na adresi:

`http://localhost:5173`

### Napomene za razvoj
- Backend server mora biti pokrenut na portu 5000
- MongoDB mora biti pokrenut na portu 27017
- Frontend aplikacija koristi proxy konfiguraciju za preusmjeravanje API poziva na backend

## Kako doprinijeti razvoju sistema?

1. Napravite **fork** repozitorija i klonirajte ga lokalno. Ako ste **kolaborator** na repozitoriju, potrebno je samo klonirat ga lokalno `git clone https://github.com/AnandPap/informacioni-sistem-za-aviokompanije.git`.
2. Kreirajte novi **branch** preko **develop** brancha kroz **Issue** za razvoj željene funkcionalnosti (opcija se nalazi sa desne strane kada se otvori Issue).
3. Napraviti `git pull` lokalno kako bi se ucitao novi branch i prebaciti se na njega tokom rada.
4. Napraviti **Pull Request (PR)** sa predloženim izmjenama i sačekajte pregled i odobrenje.




/// Sprint 3 - Grupa 1 ///

Implementirana je funkcionalnost pretrage i pregleda letova za korisnike:

### Implementirane komponente:

1. **Backend**:
   - Modifikovan `letKontroleri.js`:
     - Dodata pretraga po destinaciji (case-insensitive)
     - Dodata pretraga po datumu polaska (format DD/MM/YYYY)
     - Implementirano sortiranje letova po datumu
     - Dodano populiranje informacija o avionu
     - Dodan endpoint za dohvatanje svih dostupnih destinacija
     - Implementirano kreiranje testnih podataka (avion i letovi)

2. **Frontend**:
   - Unaprijeđena `Letovi.jsx` komponenta:
     - Implementiran dropdown menu za odabir destinacije
     - Implementiran custom date input sa odvojenim poljima za dan, mjesec i godinu
     - Dodana validacija datuma (ograničenja za dan i mjesec)
     - Implementiran prikaz letova u grid layoutu
     - Dodate informacije o avionu za svaki let
     - Implementiran loading state i error handling
     - Dodan prikaz "Nema rezultata" kada nema letova
     - Dodana validacija i sigurnosne provjere za podatke
     - Dodano dugme za kreiranje testnih podataka

3. **Stilovi**:
   - Dodani novi stilovi u `App.css`:
     - Stiliziran dropdown menu za destinacije
     - Dodan custom arrow indicator za dropdown
     - Implementiran custom date input sa odvojenim poljima
     - Dodan fokus efekat na date input grupu
     - Responsivan grid layout za kartice letova
     - Hover efekti i animacije
     - Loading i error stanja
     - Prilagođen prikaz za mobilne uređaje

### Lokacija izmjena:
- `server/src/kontroleri/letKontroleri.js`
- `server/src/rute/letRute.js`
- `client/src/glavne-komponente/Letovi.jsx`
- `client/src/stilovi/App.css`

### Nove funkcionalnosti:
- Pretraga letova po destinaciji kroz dropdown menu
- Pretraga letova po datumu polaska kroz custom date input (DD/MM/YYYY)
- Validacija unosa datuma sa ograničenjima za dan (1-31) i mjesec (1-12)
- Automatsko formatiranje datuma pri unosu
- Prikaz detalja o avionu za svaki let
- Mogućnost kreiranja testnih podataka za demonstraciju
- Poboljšano korisničko iskustvo kroz dropdown i custom date input
- Bolje rukovanje greškama i edge slučajevima
