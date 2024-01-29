// Establish Global Variables
let wordBank = loadStorage();
let ranWordObj;
let ranWord;
let speechPart;
let synOne;
let synTwo;
let hintDef;
let antOne;
let firstLetter;
let lastLetter;
let hints = [];
let win;
let hintCount = 0;
let hintHeader;
let score = loadScores();
let guessWordArr;

// Access HTML components
let startBtn = document.getElementById("start-btn");
let wbBtn = document.getElementById("wb-btn");
let rulesBtn = document.getElementById("rules-btn");
let homeScreenEl = document.getElementById("home-page");
let gamePlayEL = document.getElementById("play-game");
let nextClueBtn = document.getElementById("next-clue");
let hintEl = document.getElementById("hint-area");
let newWordEl = document.getElementById("newWord");
let letterInput = document.querySelector("#letter-input");
let submit = document.querySelector("#submitform");
let letterbankEl = document.querySelector("#letterbank");
let wrongLetterEl = document.querySelector("#wrong-letterbank");
let bankAreaEl = document.querySelector("#bank-area");
let gameplayWordButton = document.getElementById("gameplay-wordbankbutton");
let gameBox = document.querySelector(".container");
let guessedWordEl = document.querySelector("#guessed-word");
let homeButtonEl = document.getElementById("home-btn");

// Function to start game play and reset styles
function startGame() {
  guessWordArr = [];
  gameBox.style.borderWidth = "10px";
  letterInput.style.display = "none";
  letterbankEl.style.display = "none";
  nextClueBtn.style.display = "none";
  newWordEl.style.display = "none";
  bankAreaEl.style.display = "block";
  guessedWordEl.style.display = "block";
  document.getElementById("hint-box").textContent = "";
  if (!score) {
    score = {
      wins: 0,
      loses: 0,
    };
  } else;
  score;
  document.querySelector("h3").style.display = "block";
  document.getElementById("input-alert").textContent = "";
  gameplayWordButton.style.display = "none";
  hints = [];

  letterbankEl.textContent = "";
  guessedWordEl.textContent = "";
  document.querySelector("#text").textContent = "";
  hintCount = 0;
  homeScreenEl.style.display = "none";
  gamePlayEL.style.display = "block";
  commonLettersArr = [];
  wordGen();
  setTimeout(newHint, 4000);
  setTimeout(showButtons, 4000);
}

function showButtons() {
  nextClueBtn.style.display = "block";
  newWordEl.style.display = "block";
  letterInput.style.display = "block";
  letterbankEl.style.display = "block";
}

// set up API fetch for random word generator - https://api.api-ninjas.com/v1/randomword'
function wordGen() {
  fetch("https://api.api-ninjas.com/v1/randomword", {
    method: "GET",
    headers: {
      "X-Api-Key": "fKJQ9FbuX0UGbknMMEa4jA==i8qElInRgcaEERw2",
    },
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      if (!response.ok) {
        $("h3").text = "No word found. Please Try again";
      }
    })
    .then(function (data) {
      console.log(data);
      ranWord = data.word;
      ranWord = ranWord.toLowerCase();
      console.log(ranWord);
      console.log(ranWord.length);
      // check to see if word is between 5 & 7 letters
      if (ranWord.length < 5) {
        wordGen();
      } else if (ranWord.length > 7) {
        wordGen();
      }

      // check word bank to see if word already exists, refetch if it does, else continue
      else if (wordBank.includes(ranWord)) {
        wordGen();
      } else {
        getHints(ranWord);
      }
    });
}

//API fetch for Dictionary with that word
// function to pull clue elements from the word & store clue elements
function getHints(ranWord) {
  fetch(
    `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${ranWord}?key=443eb124-d026-41e8-a7c7-3e38052485a4`
  )
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function (data) {
      console.log(data);
      console.log(data.length);
      // makes sure it is a word with usable values in the dictionary
      if (!data[0].meta) {
        wordGen();
      } else {
        // parse data into hints and choose one from each array of synonyms and antonyms
        // makes sure all parts of word are taken from same usage
        let wordCat = Math.floor(Math.random() * data.length);
        hintDef = "def. " + data[wordCat].shortdef;
        let hintSyns =
          data[wordCat].meta.syns[Math.floor(Math.random() * this.length)];
        console.log(hintSyns);
        firstLetter = "It begins with " + ranWord.charAt(0).toUpperCase();
        lastLetter =
          "This is your last guess. It ends with " +
          ranWord.charAt(ranWord.length - 1).toUpperCase();
        synOne =
          "syn.1: " + hintSyns[Math.floor(Math.random() * hintSyns.length)];
        synTwo =
          "syn.2: " + hintSyns[Math.floor(Math.random() * hintSyns.length)];
        let speechPart = data[wordCat].fl;
        // Push all elements to hints array
        console.log(speechPart);
        console.log(synOne);
        console.log(synTwo);
        console.log(hintDef);
        console.log(firstLetter);
        console.log(lastLetter);
        console.log("word: " + ranWord);
        // adds hints to an object for local storage of wordbank

        ranWordObj = {
          word: ranWord,
          speechPart: speechPart,
          synonym: hintSyns,
          definition: hintDef,
          DictionaryLink: `https://www.merriam-webster.com/dictionary/${ranWord}`,
        };

        wordBank.push(ranWordObj);
        console.log(wordBank);
        localStorage.setItem("word-bank", JSON.stringify(wordBank));
        let firstClue = speechPart + " ( " + ranWord.length + " ) \n" + hintDef;
        // Push all items into hints array
        hints.push(firstClue, synOne, synTwo, firstLetter, lastLetter);
        console.log(hints);
      }
    });
}

// Function to handle guess input - and reveal correct letters and previous guesses in letter bank
let commonLettersArr = [];
submit.addEventListener("submit", function (event) {
  event.preventDefault();

  let wordInput = letterInput.value.toLowerCase();
  let wordInputArr = wordInput.split("");
  lettersInRanWord = ranWord.split("");

  if (wordInput.length !== ranWord.length) {
    document.getElementById("input-alert").textContent =
      "Your word is " + ranWord.length + " letters long - guess again";
  } else if (wordInput.length === ranWord.length && wordInput !== ranWord) {
    document.getElementById("input-alert").textContent = "";
    newHint();
    //set the common letters;
    let commonLetters = wordInputArr.filter((x) =>
      lettersInRanWord.includes(x)
    );
    // push to array and merge it and delete the duplicate letters in array;
    commonLettersArr.push(commonLetters);
    let merged = [].concat.apply([], commonLettersArr);
    let onlyCommonLetters = [...new Set(merged)];
    letterbankEl.textContent = onlyCommonLetters;
    // shows previous guesses in box
    guessWordArr.push(wordInput);
    console.log(guessWordArr);
    guessedWordEl.textContent = guessWordArr;
  } else if (wordInput === ranWord) {
    document.querySelector("#text").textContent = ranWord;
    nextClueBtn.style.display = "none";
    letterInput.style.display = "none";
    letterbankEl.style.display = "none";
    guessedWordEl.style.display = "none";
    bankAreaEl.style.display = "none";
    gameplayWordButton.style.display = "block";
    win = true;
    calculateScore(score);
  }
  letterInput.value = "";
});

// Function to generate hints (and adjust displayed items through game play)
function newHint() {
  document.querySelector("h3").style.display = "none";
  let hintHeader = document.createElement("h5");
  hintHeader.textContent = hints[hintCount];
  let hintMax = hints.length;
  console.log(hintMax);
  document.getElementById("hint-box").append(hintHeader);
  if (hintCount === hintMax - 1 && !win) {
    nextClueBtn.style.display = "none";
  } else if (hintCount === hintMax) {
    console.log("You Lose");
    letterInput.style.display = "none";
    letterbankEl.style.display = "none";
    guessedWordEl.style.display = "none";
    bankAreaEl.style.display = "none";
    document.querySelector("#text").textContent = ranWord;
    hintHeader.textContent = "";
    gameplayWordButton.style.display = "block";
    !win;
    calculateScore(score);
  }
  hintCount++;
  return;
}

// function to go back to home page
function goHome() {
  document.location.href = "index.html";
}

// Function to calculate score
function calculateScore(scoreObj) {
  if (win) {
    let newWin = scoreObj.wins + 1;
    scoreObj.wins = newWin;
    console.log(scoreObj.wins);
  } else if (!win) {
    let newLose = scoreObj.loses + 1;
    scoreObj.loses = newLose;
    console.log(scoreObj.loses);
  }
  saveScore(scoreObj);
  console.log(scoreObj);
}
// function save current scores to local storage
function saveScore(score) {
  localStorage.setItem("player-score", JSON.stringify(score));
}

// Function to load stored scores on each game play so that scores can update each game
function loadScores() {
  let loadedScores = JSON.parse(localStorage.getItem("player-score"));
  return loadedScores;
}

// function to load stored wordbank words on game replay
function loadStorage() {
  let loadedStorage = JSON.parse(localStorage.getItem("word-bank")) || [];
  return loadedStorage;
}
// function to open wordbank page
function openWordbank() {
  document.location.href = "wordbank.html";
}
// function to open how-to-play page
function openRulesPage() {
  document.location.href = "rules.html";
}

// title animation
let textWrapper = document.querySelector(".ml2");
textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>"
);

anime
  .timeline({ loop: true })
  .add({
    targets: ".ml2 .letter",
    scale: [4, 1],
    opacity: [0, 1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 950,
    delay: (el, i) => 70 * i,
  })
  .add({
    targets: ".ml2",
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000,
  });

// Event Listeners - page buttons
startBtn.addEventListener("click", startGame);
wbBtn.addEventListener("click", openWordbank);
gameplayWordButton.addEventListener("click", openWordbank);
newWordEl.addEventListener("click", startGame);
nextClueBtn.addEventListener("click", newHint);
rulesBtn.addEventListener("click", openRulesPage);
homeButtonEl.addEventListener("click", goHome);
