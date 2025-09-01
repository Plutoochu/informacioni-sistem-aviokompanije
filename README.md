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

`git clone https://github.com/AnandPap321/informacioni-sistem-za-aviokompanije.git`

2. Instalirati odgovarajuće pakete i u "client" i u "server" folderu navigiranjem u svaki od njih pojedinačno, te izvršavanjem komande:

`npm install`

3. Pokrenuti lokalno aplikaciju također iz oba folder "client" i "server" sa:

`npm run dev`

4. Aplikacija bi trebala biti dostupna na adresi:

`http://localhost:5173`
