let response
let word
const GUESS_COUNT = 6
let isGameOver

let currentGuess
let guessedLetters
let currentGuessing


const grid = document.querySelector(".grid")
const message = document.querySelector(".message")
const mobileInput = document.querySelector(".mobileInput")
const mobileMessage = document.querySelector(".mobileMessage")

let currentInputState = mobileInput.textContent
mobileInput.addEventListener("input", () => parseMobileInput())


document.addEventListener('keydown', parseKeyEvent);
document.querySelector(".resetbtn").addEventListener("click", newGame)

newGame().then()

async function newGame() {
    isGameOver = false
    currentGuess = 0
    guessedLetters = []
    currentGuessing = []
    response = await fetch(document.URL + "motauhasard")
    word = await response.json()
    message.textContent = ""
    initLetterGuesses()
    initCSS()
    const letters = document.querySelectorAll(".letter")
    for (let letter of letters) {
        letter.addEventListener("click", () => {
            mobileInput.style.visibility = "visible";
            mobileInput.focus()
            mobileInput.style.visibility = "hidden";
            mobileMessage.style.display = "none";
        })
    }
}


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
            if (letter === 0 && row === 0)
                DIVletter.classList.add("CORRECT")
            if (row <= currentGuess) {
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
    const DIVRow = document.querySelector(".row" + currentGuess)
    for (let letter = 0; letter < DIVRow.childNodes.length; letter++) {
        let replacementLetter;
        if (currentGuessing.length !== 0)
            replacementLetter = "."
        else
            replacementLetter = guessedLetters[letter] || "."
        DIVRow.childNodes[letter].textContent = currentGuessing[letter] || replacementLetter
    }
}

function parseKeyEvent(e) {
    if (isGameOver)
        return
    if (e.keyCode >= 65 && e.keyCode <= 90 && currentGuessing.length < word.length) {
        currentGuessing.push(e.key.toUpperCase())
    }
    if (e.keyCode === 8) {
        currentGuessing.pop()
    }
    if (e.keyCode === 13) {
        e.preventDefault()
        validateGuess()
    }
    if(e.keyCode === 32) {
        e.preventDefault()
        newGame().then()
        return
    }
    buildWord()
}

function parseMobileInput() {
    if(currentInputState.length > mobileInput.value)
        currentGuessing.pop()
    else {
        const lastInput = mobileInput.value.charAt(mobileInput.value.length - 1)
        if((/[a-zA-Z]/).test(lastInput) && currentGuessing.length < word.length) {
            currentGuessing.push(lastInput.toUpperCase())
        }
        else if(lastInput === " ")
            validateGuess()
    }
    buildWord()
    mobileInput.value = ""
}

function mergeArrays(array1, array2) {
    let res = []
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== ".")
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
            body: JSON.stringify({word: guessingword})
        }).then(res => res.json()).then(res => parseRes(res.res))
    }
}

function parseRes(res) {
    if (res === "NOTAWORD") {
        const completeGuessing = mergeArrays(currentGuessing, guessedLetters)
        const guessingword = completeGuessing.join("")
        message.textContent = guessingword + " n'est pas un mot dans mon dictionnaire 🤨"
        return
    }
    message.textContent = ""
    const DIVRow = document.querySelector(".row" + currentGuess)
    for (let letter = 0; letter < DIVRow.childNodes.length; letter++) {
        DIVRow.childNodes[letter].classList.add(res[letter].status)
        if (res[letter].status === "CORRECT") {
            guessedLetters[letter] = res[letter].letter
        }
    }
    currentGuess++;
    currentGuessing = []
    if (!checkGameOver())
        buildWord()
}

function checkGameOver() {
    if (currentGuess >= GUESS_COUNT && guessedLetters.includes(".")) {
        message.textContent = "Perdu... 😔 Le mot était " + word
        isGameOver = true
        return true
    }
    for (let guessedLetter of guessedLetters) {
        if (guessedLetter === ".")
            return false
    }
    message.textContent = "GG BG 🎉"
    isGameOver = true
    return true
}