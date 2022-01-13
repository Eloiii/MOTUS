const response = await fetch(document.URL + "motauhasard")
const word = await response.json()
const grid = document.querySelector(".grid")
const message = document.querySelector(".message")

const GUESS_COUNT = 6

let currentRow = 0
let guessedLetters = []
let currentGuessing = []

document.addEventListener('keydown', logKey);

console.log(word)
initLetterGuesses()
initCSS()


function initLetterGuesses() {
    for (let letterCount = 0; letterCount < word.length - 1; letterCount++) {
        if (letterCount === 0)
            guessedLetters.push(word.charAt(0))
        guessedLetters.push(".")
    }
}

function initCSS() {
    clearGrid()
    for (let row = 0; row < GUESS_COUNT; row++) {
        let DIVRow = document.createElement("div")
        DIVRow.className = "row" + row
        DIVRow.style.display = "flex";
        for (let letter = 0; letter < word.length; letter++) {
            let DIVletter = document.createElement("div")
            DIVletter.className = "letter"
            if(letter === 0 && row === 0)
                DIVletter.classList.add("CORRECT")
            if (row <= currentRow) {
                DIVletter.textContent = guessedLetters[letter]
            }
            DIVRow.appendChild(DIVletter)
        }
        grid.appendChild(DIVRow)
    }
}

function clearGrid() {
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
}

function buildWord() {
    const DIVRow = document.querySelector(".row" + currentRow)
    for (let letter = 0; letter < DIVRow.childNodes.length; letter++) {
        let replacementLetter;
        if(currentGuessing.length !== 0)
            replacementLetter = "."
        else
            replacementLetter = guessedLetters[letter] || "."
        DIVRow.childNodes[letter].textContent = currentGuessing[letter] || replacementLetter
    }
}

function logKey(e) {
    if (e.keyCode >= 65 && e.keyCode <= 90 && currentGuessing.length < word.length) {
        currentGuessing.push(e.key.toUpperCase())
    }
    if (e.keyCode === 8) {
        currentGuessing.pop()
    }
    if (e.keyCode === 13) {
        validateGuess()
    }
    buildWord()
}

function mergeArrays(array1, array2) {
    let res = []
    for (let i = 0; i < array1.length; i++) {
        if(array1[i] !== ".")
            res.push(array1[i])
        else res.push(array2[i])
    }
    return res
}

function validateGuess() {
    const completeGuessing = mergeArrays(currentGuessing, guessedLetters)
    if (completeGuessing.length === word.length) {
        const guessingword = completeGuessing.join("")
        fetch(document.URL + "testWord", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({word : guessingword, guessed: guessedLetters})
        }).then(res => res.json()).then(res => parseRes(res.res))
    }
}

function parseRes(res) {
    if(res === "NOTAWORD") {
        const completeGuessing = mergeArrays(currentGuessing, guessedLetters)
        const guessingword = completeGuessing.join("")
        message.textContent = guessingword + " n'est pas un mot dans mon dictionnaire"
        return
    }
    message.textContent = ""
    const DIVRow = document.querySelector(".row" + currentRow)
    for (let letter = 0; letter < DIVRow.childNodes.length; letter++) {
        DIVRow.childNodes[letter].classList.add(res[letter].status)
        if(res[letter].status === "CORRECT") {
            guessedLetters[letter] = res[letter].letter
        }
    }
    currentRow++;
    currentGuessing = []
    if(!checkWin())
        buildWord()
}

function checkWin() {
    for (let guessedLetter of guessedLetters) {
        if(guessedLetter === ".")
            return false
    }
    message.textContent = "GG BG"
    return true
}