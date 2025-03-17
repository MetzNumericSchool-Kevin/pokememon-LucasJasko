const grille = document.querySelectorAll("#grille_de_jeu > div");
const currentScore = document.querySelector("#stat_nombre_de_coups");
const replay = document.querySelector("#rejouer");

let pkmnArray;
let gridArray = [];

for (let i = 0; i < grille.length; i++) {
  gridArray.push({
    index: i,
    affectedPkmn: null,
    checked: false,
    found: false,
  });
}

async function getPkmn() {
  await fetch("http://localhost:5500/data/pokemon.json")
    .then((res) => res.json())
    .then((data) => {
      pkmnArray = data;
    });
  return pkmnArray;
}

async function setPkmnUsed() {
  await getPkmn();
  for (let i = 0; i < pkmnArray.length; i++) {
    pkmnArray[i]["used"] = false;
  }
}

setPkmnUsed();

let score = 0;
let firstMove = true;
let firstCell = null;
let secondCell = null;
let firstCellToRender = null;
let secondCellToRender = null;
let canClick = true;

grille.forEach((cell) => {
  cell.innerHTML = `<img src="./assets/bush.webp" class="bush">`;

  cell.addEventListener("click", () => {
    // On récupère l'index de la case cliqué
    const cellPos = Array.from(grille).indexOf(cell);

    //  SI la case n'est PAS coché
    if (!gridArray[cellPos].checked && canClick) {
      // On assigne la case cliqué à son équivalent du tableau des cases
      gridArray[cellPos].checked = true;

      // SI la case n'a pas de pokémon attribué
      if (gridArray[cellPos].affectedPkmn == null) {
        // On sélectionne un pokémon aléatoire dans la liste des pokémon
        let rdmPkmnArray = Math.floor(Math.random() * pkmnArray.length);

        // Et on boucle aléatoirement tant que le pokémon sélectionné est un pokémon qui a été utilisé pour ne pas avoir deux fois le même dans la grille
        while (true) {
          if (!pkmnArray[rdmPkmnArray].used) {
            break;
          }
          rdmPkmnArray = Math.floor(Math.random() * pkmnArray.length);
        }

        // On assigne le pokémon sélectionné à la cellule de la grille coché
        gridArray[cellPos].affectedPkmn = pkmnArray[rdmPkmnArray]["name"];

        // On peut rendre l'image du pokémon sélectionné
        cell.innerHTML = `<img src="${pkmnArray[rdmPkmnArray]["sprite"]}" class="pokemon">`;

        // On attribut la paire du pokémon sur la grille par rapport aux cases encore disponibles
        let rdmCell = Math.floor(Math.random() * gridArray.length);
        // On effectue la recherche uniquement si le tableau contient encore des cases non cochés
        let stillFillable = false;
        // On parcours la grille pour vérifier cela
        for (let i = 0; i < gridArray.length; i++) {
          !gridArray[i]["checked"] ? (stillFillable = true) : "";
        }
        // Si la grille peut encore être remplie alors on cherche une case non attribuée
        if (stillFillable) {
          while (true) {
            // On vérifie que la case sélectionné ne soit pas coché ET qu'elle n'ai pas de pokémon attribué
            if (!gridArray[rdmCell].checked && gridArray[rdmCell].affectedPkmn == null) {
              break;
            }
            rdmCell = Math.floor(Math.random() * gridArray.length);
          }
        }
        gridArray[rdmCell].affectedPkmn = pkmnArray[rdmPkmnArray]["name"];

        // Enfin on définit le pokémon choisi comme non utilisable de nouveau
        pkmnArray[rdmPkmnArray]["used"] = true;

        // SINON, la case a un pokémon attribué
      } else {
        // donc on rend l'image du pokémon attribué
        // pour cela on récupère le nom du pokémon attribué à la case
        const affectedPkmn = gridArray[cellPos].affectedPkmn;

        // On récupère son index dans la liste des pokémon
        const indexOfAffectedPkmn = Array.from(pkmnArray).findIndex((item) => item["name"] == affectedPkmn);

        // Afin de cibler le sprite à rendre
        cell.innerHTML = `<img src="${pkmnArray[indexOfAffectedPkmn]["sprite"]}" class="pokemon">`;
      }

      // Si c'est le premier mouvement du joueur
      if (firstMove && firstCell == null) {
        firstCell = gridArray[cellPos];
        firstCellToRender = cell;
        firstMove = false;

        // Sinon c'est le second donc on compare les pokémons
      } else {
        secondCell = gridArray[cellPos];
        secondCellToRender = cell;
        canClick = false;

        // SI les pokémon sont les mêmes
        if (firstCell.affectedPkmn == secondCell.affectedPkmn) {
          firstCellToRender.innerHTML += `<img src="./assets/pokeball.png" class="pokeball" />`;
          secondCellToRender.innerHTML += `<img src="./assets/pokeball.png" class="pokeball" />`;
          firstCellToRender = null;
          secondCellToRender = null;

          firstCell.checked = false;
          secondCell.checked = false;
          firstCell.found = true;
          secondCell.found = true;
          firstCell = null;
          secondCell = null;

          firstMove = true;
          canClick = true;
          score++;
          currentScore.textContent = score;

          // Sinon la réponse est fausse
        } else {
          firstCellToRender.classList.add("wrong");
          secondCellToRender.classList.add("wrong");
          setTimeout(() => {
            firstCellToRender.innerHTML = `<img src="./assets/bush.webp" class="bush" />`;
            secondCellToRender.innerHTML = `<img src="./assets/bush.webp" class="bush" />`;
            firstCellToRender.classList.remove("wrong");
            secondCellToRender.classList.remove("wrong");
            firstCell.checked = false;
            secondCell.checked = false;
            firstCell = null;
            secondCell = null;
            firstCellToRender = null;
            secondCellToRender = null;
            firstMove = true;
            canClick = true;
            score++;
            currentScore.textContent = score;
          }, 1000);
        }
      }
    }

    let verify = 0;
    for (verify = 0; verify < gridArray.length; verify++) {
      if (!gridArray[verify].found) {
        break;
      }
    }
    if (verify == gridArray.length) {
      console.log("finish");
      replay.style.display = "block";
    }
  });
});
