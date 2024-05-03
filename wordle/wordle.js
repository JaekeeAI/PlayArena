"use strict";
let ATTEMPTS = 6;
let wordLength = 4;
let targetWord;
let wordArray = [];
let curLine = 0;
let curCellIndex = 0; // it is the index of the char we are about to type
let container = document.getElementsByClassName("container")[0];
let gameState = 2; // 0 for lose, 1 for win, 2 for going
let lettersDict = {}; // stores the letters of the tgt word
// common 4, 5, 6 words
let fourLettersWords = ["Able", "Bite", "Code", "Dish", "Echo", 
"Face", "Game", "Hide", "Jump", "Kind", "Lace", "Mine", "Port",
"Ride", "Sale", "Talk", "Wave"];
let fiveLettersWords = ["Aware", "Brave", "Clock", "Exist", "Focus",
"Leave", "Scene", "Sweet", "Store", "Rainy", "Tiger", "Paste", 
"Mouse", "Peace", "Smile", "Trade"];
let sixLettersWords = ["People", "Aspect", "Debate", "Border", "Driver",
"Bottle", "Effort", "Should", "Before", "Change", "Member",
"Second", "Public", "Become", "Family", "Little"];
let tgtWordDict = {4:fourLettersWords, 5:fiveLettersWords, 6:sixLettersWords};

// testground
initGame();
// connect buttons to functions
let resetButton = document.querySelectorAll("div > button")[0];
let revealButton = document.querySelectorAll("div > button")[1];
resetButton.addEventListener("click", resetGame);
revealButton.addEventListener("click", revealWord);




function initGame()
{
    setRandomTargetWord();
    setLettersDicitionary();
    addCells();
    addFunctionsToKeys();
}

function setRandomTargetWord()
{
    let num = Math.random();
    num *= tgtWordDict[wordLength].length;
    num = Math.floor(num);
    targetWord = tgtWordDict[wordLength][num].toUpperCase();
    console.log(targetWord);
}

function setLettersDicitionary()
{
    // init a dictionary capturing the letters of the tgt word
    // character map to its frequency
    lettersDict = {};
    for (let i=0;i<targetWord.length;i++)
    {
        if (targetWord[i] in lettersDict)
        {
            lettersDict[targetWord[i]]++;
        }
        else
        {
            lettersDict[targetWord[i]] = 1;
        }
    }
}

// check if the word is a valid word
function isValidWord()
{
    return true;
}

// check if we guessed the correct word
function checkWin()
{
    // all word in current line match the tgt word
    for (let i=0;i<wordLength;i++)
    {
        if (wordArray[curLine * wordLength + i] !== targetWord[i])
        {
            return false;
        }
    }
    return true;
}

function checkLose()
{
    // all attempts are used and the game is on
    if (curLine == ATTEMPTS - 1 && gameState === 2)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// get the color background for each letter of guessed word
function getCellColors()
{
    // initiallize color array
    let colors = [];
    for (let i=0;i<targetWord.length;i++) {colors.push("gray");}
    // create a list of indices of the letters that have not been colored
    // create a copy of the lettersDict to keep track the count of each letter left
    let indices = [];
    for (let i=0;i<targetWord.length;i++) {indices.push(i);}
    let copyDict = Object.assign({}, lettersDict);
    // first scan for matching letters
    console.log(copyDict);
    for (let i=wordLength-1;i>=0;i--)
    {
        if (wordArray[curLine * wordLength + i] === targetWord[i])
        {
            colors[i] = "green";
            if (copyDict[wordArray[curLine * wordLength + i]] == 1)
            {
                delete copyDict[wordArray[curLine * wordLength + i]];
            }
            else
            {
                copyDict[wordArray[curLine * wordLength + i]]--;
            }
            indices.splice(i,1);
        }
    }
    // second scan for mismatch but correct letters
    for (let i=0;i<indices.length;i++)
    {
        let num = indices[i];
        // console.log(wordArray[curLine * wordLength + num]);
        if (wordArray[curLine * wordLength + num] in copyDict)
        {
            colors[num] = "yellow";
            if (copyDict[wordArray[curLine * wordLength + num]] == 1)
            {
                delete copyDict[wordArray[curLine * wordLength + num]];
            }
            else
            {
                copyDict[wordArray[curLine * wordLength + num]]--;
            }
        }
    }
    // the leftovers are gray letters
    // console.log(colors);
    return colors;
}

function resetGame()
{
    // clear wordArray, set curLine and curIndex to 0
    // get new random word, reset word dict
    // clear the background color of all cells, set gameState back to 2
    wordLength = parseInt(getWordLength());
    setRandomTargetWord();
    setLettersDicitionary();
    wordArray = [];
    for (let i=0;i<wordLength*ATTEMPTS;i++) {wordArray.push(" ");}
    curLine = 0;
    curCellIndex = 0;
    removeAllCells();
    addCells();
    removeKeyColors();
    gameState = 2;
}

function revealWord()
{
    gameState = 0;
    alert("the word is " + targetWord);
}

function removeAllCells()
{
    let child = container.lastElementChild;
    while (container.children.length > 0)
    {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function removeKeyColors()
{
    let keyArray = document.getElementsByClassName("key");
    for (let i=0;i<keyArray.length;i++)
    {
        keyArray[i].style.backgroundColor = "";
    }
}

function addCells()
{
    changeGridDimension();
    for (let i=0;i<ATTEMPTS;i++)
    {
        for (let j=0;j<wordLength;j++)
        {
            let elt = document.createElement("div");
            elt.classList.add("cell");
            container.appendChild(elt);
            wordArray.push(" "); 
        }
    }
}

//
//

function getWordLength() 
{
    let radios = document.getElementsByName("word-length");
    for (let i=0;i<radios.length;i++)
    {
        if (radios[i].checked)
        {
            return radios[i].value;
        }
    }
}

addEventListener("keydown", function (event){
    console.log(getWordLength());
    // if game is concluded, then don't allow key input
    if (gameState !== 2)
    {
        return;
    }
    // check if the key is a letter
    let key = event.key;
    if (key >= "a" && key <= "z")
    {
        key = key.toUpperCase();
        handleLetter(key);
    }
    else if (key === "Enter")
    {
        handleEnter();
    }
    else if (key === "Backspace")
    {
        handleBackspace();
    }
})

function handleLetter(key)
{
    // can't type beyond the current line
    if (curCellIndex < (curLine + 1) * wordLength)
    {
        // update wordArray
        wordArray[curCellIndex] = key;
        // update text in the corresponding cell
        addTextToCell(curCellIndex, key);
        // increment current index
        curCellIndex++;
    }
}

function handleEnter()
{
    checkWord();
}

function handleBackspace()
{
    // can't erase before the current line
    if (curCellIndex > curLine * wordLength)
    {
        removeTextFromCell(curCellIndex-1);
        curCellIndex--;
    }
}


function checkWord()
{
    // check if the current line is filled
    if (curCellIndex === (curLine + 1) * wordLength)
    {
        if (isValidWord())
        {
            let colors = getCellColors();
            updateCellColors(colors);
            updateKeyColors(colors);
            if (checkWin())
            {
                gameState = 1;
                
            }
            if (checkLose())
            {
                gameState = 0;
                
            }
            // go to the next line
            curLine++;
        }
    }
    if (gameState === 1)
    {
        alert("you win");
    }
    else if (gameState === 0)
    {
        alert("you lose");
    }
}

function addFunctionsToKeys()
{
    let keyList = document.getElementsByClassName("key");
    for (let i=0;i<keyList.length;i++)
    {
        keyList[i].setAttribute("onClick", "keyboardInputs(this.value)");
    }
}

function keyboardInputs(key)
{
    if (key == "Enter")
    {
        handleEnter();
    }
    else if (key == "Backspace")
    {
        handleBackspace();
    }
    else
    {
        handleLetter(key);
    }
}

//
//

let cellArray = document.querySelector(".container").children;
function addTextToCell(index, text)
{
    cellArray[index].innerHTML = text;
}

function removeTextFromCell(index)
{
    cellArray[index].innerHTML = "";
}

function updateCellColors(colors)
{
    for (let i=0;i<wordLength;i++)
    {
        cellArray[curLine * wordLength + i].style.backgroundColor = colors[i];
    }
}

function updateKeyColors(colors)
{
    for (let i=0;i<wordLength;i++)
    {
        let character = wordArray[curLine * wordLength + i];
        let key = document.getElementsByName(character)[0];
        if (key.style.backgroundColor === "yellow")
        {
            if (colors[i] === "green")
            {
                key.style.backgroundColor = "green";
            }
        }
        else if (key.style.backgroundColor === "" || key.style.backgroundColor === "gray")
        {
            key.style.backgroundColor = colors[i];
        }
    }
}

function changeGridDimension()
{
    // reset the number of columns in the grid
    let gridTemplate = "";
    for (let i=0;i<wordLength;i++) 
    {
        gridTemplate = gridTemplate + "1fr ";
    }
    gridTemplate = gridTemplate.slice(0, gridTemplate.length-1);
    container.style.gridTemplateColumns = gridTemplate;
    // reset the max width of the grid
    /*
        2*border + height is cell size
        cells * cellSize + gap * (cells-1) is container width
    */
    let cellWidth = 2*2 + 40;
    let newWidth = (wordLength*cellWidth + 4 * (wordLength-1)).toString() + "px";
    container.style.maxWidth = newWidth;
}