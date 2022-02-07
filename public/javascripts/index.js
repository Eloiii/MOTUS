let response
let word
const GUESS_COUNT = 6
let isGameOver

let currentGuess
let guessedLetters
let currentGuessing

let history = []
let streak = 0

const grid = document.querySelector(".grid")
const message = document.querySelector(".message")
const mobileInput = document.querySelector(".mobileInput")
const mobileMessage = document.querySelector(".mobileMessage")
const streakDiv = document.querySelector(".streak")

let currentInputState = mobileInput.textContent
mobileInput.addEventListener("input", () => parseMobileInput())


document.addEventListener('keydown', parseKeyEvent);
document.querySelector(".resetbtn").addEventListener("click", newGame)

await newGame()

async function newGame() {
    initVars()
    await getNewWord()
    message.textContent = ""
    message.style.opacity = "0"
    initLetterGuesses()
    initCSS()
    setMobileEvents()
    setStreak()
}

function setStreak() {
    if(streak >= 0)
        streakDiv.textContent = streak + "🔥"
    else
        streakDiv.textContent = Math.abs(streak) + "🥶"
}

function initVars() {
    isGameOver = false
    currentGuess = 0
    guessedLetters = []
    currentGuessing = []
}

async function getNewWord() {
    response = await fetch(document.URL + "motauhasard")
    word = await response.json()
}

function setMobileEvents() {
    const letters = document.querySelectorAll(".letter")
    for (let letter of letters) {
        letter.addEventListener("click", () => {
            letter.focus()
            mobileInput.style.opacity = "1";
            mobileInput.focus()
            mobileInput.style.opacity = "0";
            mobileMessage.style.display = "none";
        })
    }
}

function initLetterGuesses() {
    for (let letterCount = 0; letterCount < word.length - 1; letterCount++) {
        if (letterCount === 0)
            guessedLetters.push(word.firstLetter)
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

async function parseKeyEvent(e) {
    //space
    if (e.keyCode === 32) {
        e.preventDefault()
        await newGame()
        return
    }
    if (isGameOver)
        return
    //a-z
    if (e.keyCode >= 65 && e.keyCode <= 90 && currentGuessing.length < word.length) {
        currentGuessing.push(e.key.toUpperCase())
    }
    //backspace
    if (e.keyCode === 8) {
        currentGuessing.pop()
    }
    //enter
    if (e.keyCode === 13) {
        e.preventDefault()
        await validateGuess()
    }
    if(!isGameOver)
        buildWord()
}

async function parseMobileInput() {
    if (currentInputState.length > mobileInput.value)
        currentGuessing.pop()
    else {
        const lastInput = mobileInput.value.charAt(mobileInput.value.length - 1)
        if ((/[a-zA-Z]/).test(lastInput) && currentGuessing.length < word.length) {
            currentGuessing.push(lastInput.toUpperCase())
        } else if (lastInput === " ")
            await validateGuess()
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

async function validateGuess() {
    const completeGuessing = mergeArrays(currentGuessing, guessedLetters)
    if (completeGuessing.length === word.length) {
        const guessingword = completeGuessing.join("")
        const request = await fetch(document.URL + "testWord", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({word: guessingword})
        })
        const res = await request.json()
        await parseRes(res.res)
    } else {
        displayMessage("Le mot est trop court 😮‍💨", false)
    }
}

function displayMessage(text, resetGuess) {
    message.textContent = text
    message.style.opacity = "0"
    message.style.opacity = "1"
    if (resetGuess)
        currentGuessing = []
    sleep(4000).then(() => message.style.opacity = "0")
}

async function parseRes(res) {
    if (res === "NOTAWORD") {
        const completeGuessing = mergeArrays(currentGuessing, guessedLetters)
        const guessingword = completeGuessing.join("")
        displayMessage(guessingword + " n'est pas un mot dans mon dictionnaire 🤨", true)
        return
    }
    if (res === "WRONGFIRSTLETTER") {
        displayMessage("Le mot doit commencer par un ", true)
        const letterSpan = document.createElement("span")
        letterSpan.textContent = word.firstLetter + " 🙄"
        letterSpan.className = "letterMessage"
        message.appendChild(letterSpan)
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
    const gameOver = await checkGameOver()
    if (!gameOver)
        buildWord()
}

async function checkGameOver() {
    if (currentGuess >= GUESS_COUNT && guessedLetters.includes(".")) {
        const response = await fetch(document.URL + "CORRECTWORD")
        const CORRECTWORD = await response.json()
        displayMessage("Perdu... 😔 Le mot était " + CORRECTWORD, false)
        isGameOver = true
        streak - 1 >= 0 ? streak = -1 : streak -=1
        return true
    }
    for (let guessedLetter of guessedLetters) {
        if (guessedLetter === ".")
            return false
    }
    displayMessage("GG BG 🎉", false)
    isGameOver = true
    streak + 1 <= 0 ? streak = 1 : streak +=1
    return true
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}