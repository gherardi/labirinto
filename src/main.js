'use strict';
const btnStart = document.querySelector('#btnStart');
const ui = document.querySelector('#ui');
const map = document.querySelector('#map');
const themeSwitcher = document.querySelector('#themeSwitcher');
const mapSwitcher = document.querySelector('#mapSwitcher');
const matrice = [
  // direzioni, coin
  [0, 1, 0, 0], // stanza 0
  [1, 2, 9, 0], // stanza 1
  [2, 2, 10, 1], // stanza 2
  [3, 4, 11, 3], // stanza 3
  [4, 5, 12, 3], // stanza 4
  [5, 5, 13, 4], // stanza 5
  [6, 7, 14, 6], // stanza 6
  [7, 7, 15, 6], // stanza 7
  // -------------------------
  [8, 8, 16, 8], // stanza 8
  [1, 9, 17, 9], // stanza 9
  [2, 11, 18, 10], // stanza 10
  [3, 11, 11, 10], // stanza 11
  [4, 12, 12, 12], // stanza 12
  [5, 13, 21, 13], // stanza 13
  [6, 14, 22, 14], // stanza 14
  [7, 99, 15, 15], // stanza 15
  // ------------------------
  [8, 17, 24, 16], // stanza 16
  [9, 17, 17, 16], // stanza 17
  [10, 18, 18, 18], // stanza 18
  [19, 20, 27, 19], // stanza 19
  [20, 21, 28, 19], // stanza 20
  [13, 21, 21, 20], // stanza 21
  [14, 23, 22, 22], // stanza 22
  [23, 23, 31, 22], // stanza 23
  // ------------------------
  [16, 25, 32, 24], // stanza 24
  [25, 26, 25, 24], // stanza 25
  [26, 27, 34, 25], // stanza 26
  [19, 27, 27, 26], // stanza 27
  [20, 29, 28, 28], // stanza 28
  [29, 30, 29, 28], // stanza 29
  [30, 30, 38, 29], // stanza 30
  [23, 31, 39, 31], // stanza 31
  // ------------------------

  [24, 32, 32, 32], // stanza 32
  [33, 34, 33, 33], // stanza 33
  [26, 34, 34, 33], // stanza 34
  [35, 36, 35, 35], // stanza 35
  [36, 37, 36, 35], // stanza 36
  [37, 38, 37, 36], // stanza 37
  [30, 39, 38, 37], // stanza 38
  [31, 39, 39, 38], // stanza 39
];
const rooms = document.querySelectorAll('.cell');
const walls = document.querySelectorAll('.wall');

const arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

let currRoom;
let currDirectionIndex; // 0: nord, 1: est, 2: sud, 3: ovest
let coinCounter; // numero di coin attuali
let movements; // passi fatti da user
let acceptingMov = true;
let maxCoin;
let timeStart;

// FUNCTION
const createCoins = () => {
  matrice.forEach((cell, index) => cell.push(index === 0 ? false : Math.random() < 0.15));
  maxCoin = matrice.filter(room => room[4] === true).length;
};

const appendCoins = () => {
  const coin = document.createElement('div');
  coin.classList.add('coin');

  matrice.forEach((cell, index) => {
    if (cell[4]) rooms[index].append(coin.cloneNode());
  });
};

const appendUser = currRoom => {
  const userEl = document.createElement('img');
  userEl.src = '/user.svg';
  userEl.classList.add('user');
  userEl.style.transform = `rotate(${currDirectionIndex * 90}deg)`;
  rooms[currRoom].append(userEl);
};

const appendDoors = currRoom => {
  const door = document.createElement('div');
  door.classList.add('door');

  walls.forEach((wall, index) => {
    // [2, 11, 18, 10], // stanza 10
    if (index === 0) {
      if (currDirectionIndex === 0) {
        matrice[currRoom].at(-2) != currRoom ? wall.append(door.cloneNode()) : '';
      } else if (matrice[currRoom].at(currDirectionIndex - 1 + index) != currRoom) {
        wall.append(door.cloneNode());
      }
    }
    if (index === 1) {
      if (matrice[currRoom].at(currDirectionIndex - 1 + index) != currRoom) {
        wall.append(door.cloneNode());
      }
    }
    if (index === 2) {
      if (currDirectionIndex === 3) {
        matrice[currRoom].at(0) != currRoom ? wall.append(door.cloneNode()) : '';
      } else if (matrice[currRoom].at(currDirectionIndex - 1 + index) != currRoom) {
        wall.append(door.cloneNode());
      }
    }
  });
};

const appendGold = () => {
  const goldEl = document.createElement('img');
  goldEl.src = '/gold.svg';
  goldEl.classList.add('gold');
  walls[1].append(goldEl);
};

const cleanUI = currRoom => {
  document.querySelector('.user')?.remove();
  rooms[currRoom].querySelector('.coin')?.remove();
  walls.forEach(wall => wall.querySelector('.door')?.remove());
  walls[1].querySelector('.gold')?.remove();
};

const startGame = () => {
  timeStart = performance.now();
  document.querySelector('#start').classList.add('hidden');
  ui.classList.replace('hidden', 'grid');
  map.classList.replace('hidden', 'grid');
  mapSwitcher.classList.replace('hidden', 'flex');

  currRoom = 0;
  currDirectionIndex = 0; // guardi verso nord
  coinCounter = 0;
  movements = 0;

  createCoins();
  appendCoins();
  updateUI(currRoom);

  document.addEventListener('keyup', e => {
    if (!arrows.includes(e.key)) return;
    if (!acceptingMov) return;

    movements++;
    currDirectionIndex += arrows.findIndex(arrow => e.key === arrow);
    currDirectionIndex > 3 ? (currDirectionIndex -= 4) : currDirectionIndex;
    currRoom = matrice[currRoom][currDirectionIndex];

    updateUI(currRoom);
  });
};

const updateUI = currRoom => {
  if (currRoom === 99) {
    winGame();
    acceptingMov = false;
    return;
  }
  cleanUI(currRoom);
  appendDoors(currRoom);
  appendUser(currRoom);

  if (matrice[currRoom][4]) {
    appendGold();
    coinCounter++;
    matrice[currRoom][4] = false;
  }
};

const winGame = () => {
  const voice = new SpeechSynthesisUtterance(`Complimenti, hai trovato l'uscita`);
  speechSynthesis.speak(voice);
  ui.remove();
  map.remove();
  document.querySelector('#winBanner').classList.replace('hidden', 'flex');
  const timeEnd = performance.now();

  document.querySelector('#movementsEl').textContent = `${movements}`;
  document.querySelector('#coinCounterEl').textContent = `${coinCounter} / ${maxCoin}`;
  document.querySelector('#timeEl').textContent = `${Math.trunc((timeEnd - timeStart) / 1000)} s`;
};

const switchTheme = () => {
  document.querySelector('html').classList.toggle('dark');
  document.querySelector('.moon').classList.toggle('hidden');
  document.querySelector('.sun').classList.toggle('hidden');
};

btnStart.addEventListener('click', startGame);
themeSwitcher.addEventListener('click', switchTheme);
mapSwitcher.addEventListener('click', ()=> map.classList.toggle("opacity-0"));

[...document.querySelector('#start').children].forEach(child => child.classList.remove('opacity-0'));
console.log("i tasti in alto e in basso a sinistra servono per mostrare o nascondere la mappa e per cambiare il tema")