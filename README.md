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




// Sprint 3 - Grupa 1 //

#### Implementirane komponente:

1. **Backend**:
   - Modifikovan `letKontroleri.js`:
     - Dodata pretraga po destinaciji (case-insensitive)
     - Implementirana pretraga po datumu u formatu DD/MM/YYYY
     - Dodana validacija datuma na serveru
     - Implementirano sortiranje letova po datumu
     - Dodano populiranje informacija o avionu
     - Dodan endpoint za dohvatanje svih dostupnih destinacija
     - Implementirano kreiranje testnih podataka
     - Standardiziran format datuma (DD/MM/YYYY) kroz cijelu aplikaciju

2. **Frontend**:
   - Unaprijeđena `Letovi.jsx` komponenta:
     - Implementiran dropdown menu za odabir destinacije
     - Implementiran custom date input sa odvojenim poljima za dan, mjesec i godinu
     - Dodana validacija unosa datuma:
       - Dan (1-31)
       - Mjesec (1-12)
       - Godina (4 cifre)
     - Implementiran prikaz letova u grid layoutu
     - Dodate informacije o avionu za svaki let
     - Implementiran loading state i error handling
     - Dodan prikaz "Nema rezultata" kada nema letova
     - Dodana validacija i sigurnosne provjere za podatke
     - Dodano dugme za kreiranje testnih podataka
     - Standardiziran prikaz datuma u formatu DD/MM/YYYY

3. **Stilovi**:
   - Dodani novi stilovi u `App.css`:
     - Stiliziran dropdown menu za destinacije
     - Dodan custom arrow indicator za dropdown
     - Implementiran custom date input sa odvojenim poljima
     - Dodan fokus efekat na pojedinačna date input polja
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
- Pretraga letova po datumu kroz custom date input (DD/MM/YYYY)
- Validacija unosa datuma sa ograničenjima za dan (1-31) i mjesec (1-12)
- Standardiziran format datuma kroz cijelu aplikaciju
- Prikaz detalja o avionu za svaki let
- Mogućnost kreiranja testnih podataka za demonstraciju
- Poboljšano korisničko iskustvo kroz validaciju unosa
- Bolje rukovanje greškama i edge slučajevima

### Napomene:
- Format datuma je standardiziran na DD/MM/YYYY kroz cijelu aplikaciju
- Implementirana je validacija datuma i na frontendu i na backendu
- Svi datumi se čuvaju u bazi u ISO formatu, ali se prikazuju u DD/MM/YYYY formatu
- Pretraga po datumu traži letove za cijeli dan (00:00 - 23:59)



### Testiranje aplikacije lokalno

1. Nakon što pokrenete aplikaciju, prvo kreirajte testne podatke:
   - Kliknite na dugme "Kreiraj testne letove" na stranici za pretragu letova
   - Ovo će kreirati testni avion i nekoliko testnih letova

   Alternativno, možete manuelno dodati podatke u MongoDB bazu:

   ```javascript
   // 1. Prvo dodajte avion (koristite MongoDB Compass ili mongo shell)
   db.avions.insertOne({
     naziv: "Boeing 737",
     model: "737-800",
     tip: "Putnički",
     registracijskiBroj: "TC-JFV",
     konfiguracijaSjedala: "F10C20Y120",
     brojSjedista: 150,
     status: "aktivan",
     sjedalaPoRedu: {
       F: 2,
       C: 3,
       Y: 6
     }
   })
   
   // 2. Kopirajte ID kreiranog aviona (_id) i iskoristite ga za kreiranje leta
   db.lets.insertOne({
     polaziste: "Sarajevo",
     odrediste: "Istanbul",
     datumPolaska: new Date("2024-05-01T10:00:00Z"),
     cijena: 250,
     brojSlobodnihMjesta: 120,
     avionId: ObjectId("ZAMIJENITE_SA_ID_AVIONA") // Ovdje zamijenite sa stvarnim ID-em
   })
   ```

   **Napomena**: Ako koristite MongoDB Compass:
   - Povežite se na `mongodb://localhost:27017`
   - Kreirajte bazu `aviokompanija` ako ne postoji
   - U kolekciji `avions` dodajte avion
   - Kopirajte `_id` kreiranog aviona
   - U kolekciji `lets` dodajte let sa kopiranim `avionId`

   **Primjer ID-a i kako ga pronaći**:
   1. Nakon što dodate avion, MongoDB će automatski generisati `_id` koji izgleda ovako:
      ```
      _id: ObjectId("65f3a7b8c4d3e2f1a0b9c8d7")
      ```
   2. U MongoDB Compass-u:
      - Kliknite na dodani avion u listi
      - U prvom polju vidjet ćete `_id` (24-karakterni string)
      - Kopirajte taj string
   3. Kada kreirate let, zamijenite "ZAMIJENITE_SA_ID_AVIONA" sa kopiranim ID-em:
      ```javascript
      // Primjer sa stvarnim ID-em
      db.lets.insertOne({
        polaziste: "Sarajevo",
        odrediste: "Istanbul",
        datumPolaska: new Date("2024-05-01T10:00:00Z"),
        cijena: 250,
        brojSlobodnihMjesta: 120,
        avionId: ObjectId("65f3a7b8c4d3e2f1a0b9c8d7") // Ovdje ide vaš kopirani ID
      })
      ```

2. Testirajte pretragu po destinaciji:
   - Koristite dropdown menu za odabir neke od dostupnih destinacija (Istanbul, Dubai, Berlin)
   - Kliknite "Pretraži" da vidite letove za odabranu destinaciju

3. Testirajte pretragu po datumu:
   - Unesite datum u formatu DD/MM/YYYY koristeći tri odvojena polja
   - Dostupni testni datumi su:
     - 01/05/2024 (let za Istanbul)
     - 02/05/2024 (let za Dubai)
     - 03/05/2024 (let za Berlin)
   - Kliknite "Pretraži" da vidite letove za odabrani datum

4. Provjerite prikaz detalja:
   - Za svaki let trebali biste vidjeti:
     - Polazište i odredište
     - Datum polaska u formatu DD/MM/YYYY
     - Cijenu leta
     - Broj slobodnih mjesta
     - Informacije o avionu (naziv i model)