// Global Variables
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var cluePauseTime = 333; //how long to pause in between clues OG 333
var nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence OG 1000

var pattern = [2, 2, 4, 3, 2, 1, 2, 4];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;
var guessCounter = 0;
var lives = 3;
var buttons = 4;
var mode = "tone";

function setPictureMode() {
  mode = "picture";
  // reset button amount, remove ability to add/remove buttons, allow reset to tone mode
  buttons = 4;
  document.getElementById("pictureBtn").classList.add("hidden");
  document.getElementById("toneBtn").classList.remove("hidden");
  document.getElementById("addBtn").disabled = true;
  document.getElementById("removeBtn").disabled = true;
  // hide button loop
  for (let i = 1; i < 9; i++) {
    var buttonToHide = "button" + i;
    document.getElementById(buttonToHide).classList.add("hidden");
  }
  // show picture loop
  for (let i = 1; i < 5; i++) {
    var pictureToShow = "picture" + i;
    document.getElementById(pictureToShow).classList.remove("hidden");
  }
}
function setToneMode() {
  mode = "tone";
  document.getElementById("pictureBtn").classList.remove("hidden");
  document.getElementById("toneBtn").classList.add("hidden");
  document.getElementById("addBtn").disabled = false;

  buttons = 4;
  for (let i = 1; i < 5; i++) {
    var buttonToShow = "button" + i;
    document.getElementById(buttonToShow).classList.remove("hidden");
  }
  for (let i = 1; i < 5; i++) {
    var pictureToHide = "picture" + i;
    document.getElementById(pictureToHide).classList.add("hidden");
  }
}

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  generatePattern();
  lives = 3;
  clueHoldTime = 1000;
  // Swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  // Turn off add/remove buttons
  document.getElementById("addBtn").disabled = true;
  document.getElementById("removeBtn").disabled = true;
  document.getElementById("pictureBtn").disabled = true;
  document.getElementById("toneBtn").disabled = true;

  playClueSequence();
}

function generatePattern() {
  for (let i = 0; i < 8; i++) {
    var num = Math.random() * buttons;
    pattern[i] = Math.ceil(num);
    console.log(pattern[i]);
  }
}
function addButton() {
  document.getElementById("removeBtn").disabled = false;
  if (buttons <= 7) {
    // max buttons is 8
    buttons++;
    if (buttons == 8) {
      document.getElementById("addBtn").disabled = true;
    } else {
      document.getElementById("addBtn").disabled = false;
    }
    var buttonToAdd = "button" + buttons;
    console.log("This button will now be visible: " + buttonToAdd);
    document.getElementById(buttonToAdd).classList.remove("hidden");
  }
}
function removeButton() {
  document.getElementById("addBtn").disabled = false;

  if (buttons >= 5) {
    // minimum buttons is 4
    var buttonToRemove = "button" + buttons;
    console.log("This button will now be invisible: " + buttonToRemove);
    document.getElementById(buttonToRemove).classList.add("hidden");
    buttons--;
    if (buttons == 4) {
      document.getElementById("removeBtn").disabled = true;
    }
  }
}
function endGame() {
  //initialize game variables
  gamePlaying = false;
  // swap the Start and Stop buttons, enable picture/tone mode button
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("pictureBtn").disabled = false;
  document.getElementById("toneBtn").disabled = false;
  // re-active add/remove buttons
  if (mode == "tone") {
    if (buttons > 4 && buttons < 8) {
      // player can add and remove
      document.getElementById("addBtn").disabled = false;
      document.getElementById("removeBtn").disabled = false;
    } else if (buttons == 4) {
      // player can only add buttons
      document.getElementById("addBtn").disabled = false;
    } else {
      document.getElementById("removeBtn").disabled = false;
    }
  }
}

function lightButton(btn) {
  if (mode == "tone") {
    document.getElementById("button" + btn).classList.add("lit");
  } else {
    document.getElementById("picture" + btn).classList.add("lit");
  }
}
function clearButton(btn) {
  if (mode == "tone") {
    document.getElementById("button" + btn).classList.remove("lit");
  } else {
    document.getElementById("picture" + btn).classList.remove("lit");
  }
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  context.resume();
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
}

function guess(btn) {
  console.log("user guessed: " + btn);
  console.log("Overall progress guessed: " + progress);
  console.log("Guess progress : " + guessCounter);

  if (!gamePlaying) {
    return;
  }

  if (btn == pattern[guessCounter]) {
    guessCounter++;
    if (guessCounter == pattern.length) {
      //game won
      winGame();
    } else if (guessCounter > progress) {
      // end of sequence reached
      progress++;
      guessCounter = 0;
      clueHoldTime -= 100;
      playClueSequence();
    }
  } else {
    lives--;
    if (lives == 0) {
      loseGame();
    } else {
      playClueSequence();
    }
  }
}
function loseGame() {
  endGame();
  alert("Game Over. You lost.");
}
function winGame() {
  endGame();
  alert("Congratulations! You won!");
}

// Sound Synthesis Functions ---------------------------------------------
const freqMap = {
  1: 200,
  2: 250,
  3: 300,
  4: 350,
  5: 400,
  6: 450,
  7: 500,
  8: 550,
};
function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}
function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}
function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);
