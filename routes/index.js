const express = require('express');
const router = express.Router();
const {mots} = require('./mots')

let CORRECTWORD = ""
let lettersStat = new Map()

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomWord() {
    let mot = mots[getRandomInt(mots.length)]
    while (mot.length < 5 || mot.length > 8) {
        mot = mots[getRandomInt(mots.length)]
    }
    CORRECTWORD = mot
    getLettersStat()
    return CORRECTWORD
}


function getLettersStat() {
    lettersStat = new Map()
    let seenLetters = []
    for (let letter = 0; letter < CORRECTWORD.length; letter++) {
        const currLetter = CORRECTWORD.charAt(letter)
        if(!seenLetters.includes(currLetter)) {
            seenLetters.push(currLetter)
            const occ = CORRECTWORD.split(currLetter).length - 1;
            lettersStat.set(currLetter, occ)
        }
    }
}

function test(word) {
    if(mots.indexOf(word) === -1)
        return "NOTAWORD"
    let res = []
    for (let i = 0; i < word.length; i++) {
        res[i] = ""
    }
    let cloneLettersStats = new Map(lettersStat)
    for (let letter = 0; letter < word.length; letter++) {
        const currLetter = word.charAt(letter)
        const currLetterocc = cloneLettersStats.get(currLetter)
        if (currLetter === CORRECTWORD.charAt(letter)) {
            res[letter] = {
                letter: currLetter,
                status: "CORRECT"
            }
            cloneLettersStats.set(currLetter, currLetterocc - 1)
        }
    }
    for (let letter = 0; letter < word.length; letter++) {
        const currLetter = word.charAt(letter)
        const currLetterocc = cloneLettersStats.get(currLetter)
        if(currLetterocc > 0 && res[letter] === "") {
            res[letter] = {
                letter: currLetter,
                status: "MISPLACED"
            }
            cloneLettersStats.set(currLetter, currLetterocc - 1)
        }
        else if(res[letter] === ""){
            res[letter] = {
                letter: word.charAt(letter),
                status: "WRONG"
            }
        }
    }
    return res
}


/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

router.get('/motauhasard', function (req, res) {
    res.status(200).json(getRandomWord())
});

router.post('/testWord', function (req, res) {
    const word = req.body.word
    const testRes = test(word)
    res.send({res : testRes})
});

module.exports = router;
