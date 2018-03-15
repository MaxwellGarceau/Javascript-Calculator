// Global Variables
var calcArr = [];
var calcHistoryArr = [];
var operatorsArr = [];
var calcDisplay = document.getElementById("output");
var randSupNumArr = [];
var calcNumbers = document.getElementsByClassName("number");
var operators = document.getElementsByClassName("operator");
var clearOp = document.getElementsByClassName("clear");
var lastTotVal = [];
var lastEquals = "notPressed";
var partialClear = 0;

// Values from calculator made clickable and able to be passed into calculator function
startUp();

function startUp() {
    for (var i = 0; i < calcNumbers.length; i++) {
        calcNumbers[i].addEventListener("click", numberCombine, false);
    }
    for (var j = 0; j < operators.length; j++) {
        operators[j].addEventListener("click", operatorsCombine, false);
        operatorsArr.push(operators[j].value);
    }
    for (var x = 0; x < clearOp.length; x++) {
        clearOp[x].addEventListener("click", clearCalc, false);
    }
}

// Numbers
function numberCombine(numVal) {
    var curNum = numVal.target.value;
    // If equals sign was pressed and THEN a number was pressed clear the calc and then enter number
    if (lastEquals === "pressed") {
        clearCalc({ target: { value: "AC" } });
    }
    // Make sure 0 can't be entered first or after negative sign  
    if (curNum === "0") {
        if (calcArr.length === 0) {
            return;
        } else if (calcArr.length === 1 && calcArr[0] === "-") {
            return;
        }
    }
    // Check for multiple decimals
    if (curNum === "." && decimalDupFilter(curNum)) {
        return;
    }
    // Push number to calculator total array
    lastEquals = "notPressed";
    calcHistory(curNum);
}

// Operators
function operatorsCombine(opVal) {
    var curOperator = opVal.target.value;
    $(".operator").removeClass("cur-oper");
    // If there is nothing pressed don't let any operators except minus sign display
    if (calcArr.length === 0 && curOperator !== "-") {
        return;
    }
    // If last button pressed was an operator change operator being pressed
    if (checkLastOper()) {
        // If last button operator and current button pressed is equals exit function
        if (curOperator === "=") {
            return;
        }
        if (calcArr.length === 1) {
            $("#subtract").addClass("cur-oper");
            return;
        }
        calcArr.pop();
        calcHistoryArr.pop();
        // If lastTotVal.length is 1 or less then make it an empty array (prevents "cannot read prop of undefined" error)
        lastTotVal.length <= 1 ? lastTotVal = [] : lastTotVal = calcArr[calcArr.length - 1];
        opVal.target.classList.add("cur-oper");
        calcHistory(curOperator);
        return;
    }
    // If equals is pressed call function to evaluate
    if (curOperator === "=") {
        calcHistoryArr.push(curOperator);
        if (multipleOperators()) {
            equalsFunc();
            return;
        } else {
            calcHistoryArr.pop(curOperator);
            return;
        }
    }
    opVal.target.classList.add("cur-oper");
    calcHistory(curOperator);
}

// Clear Buttons
function clearCalc(clearVal) {
    var curClearBtn = clearVal.target.value;
    // CE is pressed    
    if (curClearBtn === "CE") {
        // If there are no numbers left to take away when user presses "CE" set calcArr, calcHistoryArr, and lastTotVal to 0 
        if (calcArr.length <= 1) {
            partialClear = 1;
            clearCalc({ target: { value: "AC" } });
            return;
        }
        calcHistoryArr.pop();
        calcArr.pop();
        lastTotVal = calcArr[calcArr.length - 1];
        calcDisplayFunc(calcArr[calcArr.length - 1]);
        return;
        // Equals is pressed         
    } else if (curClearBtn === "AC") {
        calcArr = [];
        lastTotVal = [];
        calcHistoryArr = [];
        (Boolean(partialClear) ? calcDisplayFunc(0) : calcDisplayFunc('༼ つ ◕_◕ ༽つ ༼ つ ◕_◕ ༽つ ༼ つ ◕_◕ ༽つ'));
        partialClear = 0;
        return;
    }
}

// All Clicked Numbers Array
function calcHistory(lastInput) {
    lastEquals = "notPressed";
    calcHistoryArr.push(lastInput);

    // Add all numbers together if more than 2 operators are present
    if (multipleOperators()) {
        calcDisplayFunc(eval(calcArr[calcArr.length - 1]) + lastInput);

        calcArr.push((eval(calcArr[calcArr.length - 1])).toString(), (eval(calcArr[calcArr.length - 1]) + lastInput));
        lastTotVal = calcArr[calcArr.length - 1];
        calcHistoryArr.splice(-1, 1, "STOP", lastInput);
        return;
    }

    // Adds new number to calcArr
    if (lastTotVal.length !== 0) {
        lastTotVal = lastTotVal.split('');
    }
    lastTotVal.push(lastInput);
    lastTotVal = lastTotVal.join('');
    // Calculator History
    calcArr.push(lastTotVal);
    calcDisplayFunc(calcArr[calcArr.length - 1]);
}

// Displays data to calc display
function calcDisplayFunc(display) {
    $('#output').css('text-align', 'right');
    calcDisplay.value = display;
}

// Evaluates calculator math
function equalsFunc() {
    calcDisplayFunc(eval(lastTotVal));
    calcArr.push(eval(lastTotVal).toString());
    lastTotVal = eval(lastTotVal).toString();
    lastEquals = "pressed";
}

// Check for multiple operators
function multipleOperators() {
    // Copy to compensate for splice
    var calcHistoryArrCopy = calcHistoryArr.slice();
    var result;
    // Search calcHistory for "STOP" markers
    for (var i = calcHistoryArr.length - 1; i >= 0; i--) {
        if (calcHistoryArr[i].match(/\b(STOP)\b/)) {
            // "STOP" will be included in calcHistorySpl array. To exclude it change "calcHistoryArr.splice(i)" to "calcHistoryArr.splice(i + 1)"
            calcHistoryArr = calcHistoryArr.splice(i);
            break;
        }
    }
    // Filter for multiple operators
    result = calcHistoryArr.filter(function(elem) {
        return operatorsArr.indexOf(elem) !== -1;
    }).length > 1;
    // Restores calcHistoryArr after splice  
    calcHistoryArr = calcHistoryArrCopy.slice();
    return result;
}

// Detect duplicates in current total; returns true if duplicate is found
function decimalDupFilter(val) {
    var calcHistStr = calcHistoryArr.join('');
    var operCount = 0;

    for (var i = 0; i < operatorsArr.length; i++) {
        if (calcHistStr.lastIndexOf(val) > calcHistStr.lastIndexOf(operatorsArr[i])) {
            operCount++;
        }
    }
    if (operCount === operatorsArr.length) {
        return true;
    } else {
        return false;
    }
}

// Make sure no operators can be added consecutively
function checkLastOper() {
    if (calcArr.length > 0) {
        return operatorsArr.filter(elem => calcArr[calcArr.length - 1].charAt(calcArr[calcArr.length - 1].length - 1) === elem).length !== 0;
    } else return false;
}

//Emotional Support Button Function
document.getElementById("emotional-support").addEventListener("click", function() {
    var prevNum;
    var emoSupArr = ["You're doing great!!", "Math is hard.", "The sky's the limit!", "Numbers are friends.", "I love you.", "༼ つ ◕_◕ ༽つ ༼ つ ◕_◕ ༽つ ༼ つ ◕_◕ ༽つ"];
    var randEmoSupNum = Math.floor(Math.random() * emoSupArr.length);
    clearCalc({ target: { value: "AC" } });

    while (randEmoSupNum === randSupNumArr[randSupNumArr.length - 1]) {
        randEmoSupNum = Math.floor(Math.random() * emoSupArr.length);
    }
    randSupNumArr.push(randEmoSupNum);
    $('#output').css('text-align', 'center');
    $('#output').val(emoSupArr[randEmoSupNum]);
    prevNum = randEmoSupNum;
});