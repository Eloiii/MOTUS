const express = require('express');
const router = express.Router();
const {mots} = require('./mots')

let CORRECTWORD = ""

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomWord() {
    let mot = mots[getRandomInt(mots.length)]
    while (mot.length < 5 || mot.length > 9) {
        mot = mots[getRandomInt(mots.length)]
    }
    CORRECTWORD = mot
    return mot
}

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

function getLetterStat(letter, guessed) {
    let res = {}
    let alreadyGuessed = 0
    let letterCount = 0
    for (let i = 0; i < CORRECTWORD.length; i++) {
        let curLetter = CORRECTWORD.charAt(i)
        if(curLetter === letter) {
            letterCount++
            alreadyGuessed = countOccurrences(guessed, curLetter)
        }
    }
    res.guessed = alreadyGuessed
    res.total = letterCount
    console.log(letter)
    console.log(res)
    return res
}

function test(word, guessed) {
    if(mots.indexOf(word) === -1)
        return "NOTAWORD"
    let res = []
    for (let letter = 0; letter < word.length; letter++) {
        let indexOfLetter = CORRECTWORD.indexOf(word.charAt(letter))
        const letterStat = getLetterStat(word.charAt(letter), guessed)
        if(word.charAt(letter) === CORRECTWORD.charAt(letter)) {
            guessed[letter] = word.charAt(letter)
            res.push({
                letter: word.charAt(letter),
                status: "CORRECT"
            })
        } else if(indexOfLetter !== -1 && indexOfLetter !== letter && letterStat.total !== letterStat.guessed) {
            res.push({
                letter: word.charAt(letter),
                status: "MISPLACED"
            })
        } else {
            res.push({
                letter: word.charAt(letter),
                status: "WRONG"
            })
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
    const guessedLetter = req.body.guessed
    const testRes = test(word, guessedLetter)
    res.send({res : testRes})
});

module.exports = router;
