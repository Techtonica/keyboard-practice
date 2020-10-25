// Global variable to keep track of CapsLock
var caps = false;
var allData ;
var reqKeys = []
var typewriter;
var quesNo;
let pressed = new Set();
let commandDown = false;
let isShowHint = true;

// event.keyCode Chrome and Firefox
const CHROME_LEFT_COMMAND_CODE = 91;
const CHROME_RIGHT_COMMAND_CODE = 93;
const FIREFOX_COMMAND_CODE = 224;

// e.code for Chrome and Firefox
const FIREFOX_LEFT_COMMAND_STRING = 'OSLeft';
const FIREFOX_RIGHT_COMMAND_STRING = 'OSRight';
const CHROME_LEFT_COMMAND_STRING = 'MetaLeft';
const CHROME_RIGHT_COMMAND_STRING = 'MetaRight';

// Key names to ID
const keyToId = {
  ctrl: 'control',
  control: 'control',
  command: 'metaleft',
  cmd: 'metaleft',
  meta: 'metaleft',
  fn: 'fnc',
  alt: 'optionleft',
  shift: 'shiftleft',
  esc: 'escape',
  tab: 'tab',
  'space bar': 'space',
  'tilde(~)': 'tilde',
  'comma(,)': 'comma',
  'underscore(_)': 'minus'
};

// this tracks when we started asking for the current key command
let questionStartMS = 0;

$(document).ready(function() {
  //$("#retryButton").toggleClass("on");
  //alert($('li[data-keycode="test"]').attr('id'));
   fetch('scripts/shortcuts.json')
  .then(response => response.json())
  .then(data => {
    allData=data
    if(localStorage.getItem("questionNo")==null)
    {
      localStorage.setItem("questionNo", "1");
      localStorage.setItem("totalCount", Object.keys(allData).length);
    }
     readText()
     updateTimingDisplay()
  });
});

function nextQuestion() {
  if(localStorage.getItem("questionNo")!=null){
    if(parseInt(localStorage.getItem("questionNo"))<parseInt(localStorage.getItem("totalCount"))){
      localStorage.setItem("questionNo", parseInt(localStorage.getItem("questionNo"))+1);
    } else {
      localStorage.setItem("questionNo","1");
    }
  }
  clearPromptKeys();
  clearPressedKeys();
  updateTimingDisplay();
  reqKeys = [];
  readText();
}

function prevQuestion() {
  if(localStorage.getItem("questionNo")!=null){
    if(parseInt(localStorage.getItem("questionNo")) > 1) {
      localStorage.setItem("questionNo", parseInt(localStorage.getItem("questionNo"))-1);
    }
  }
  clearPromptKeys();
  clearPressedKeys();
  updateTimingDisplay();
  reqKeys = [];
  readText();
}

  // Function called on KeyDown to show Pressed key by adding class = 'pressed'
function handle(e) {

  if(e.key.toLowerCase()=="capslock"){
    document.querySelector("#"+e.key.toLowerCase()).classList.toggle("pressed");
    document.querySelectorAll('.letter').forEach(letter => {
      letter.classList.toggle('uppercase');
    });
    return true;
  }else

  if(e.key.toLowerCase()=="alt" || e.key.toLowerCase()=="shift" || e.key.toLowerCase()=="meta"){
    if (e.key.toLowerCase()=="meta") {
      commandDown = true;
    }
    let keyString = e.code;
    if(e.code == FIREFOX_LEFT_COMMAND_STRING) {
      keyString = CHROME_LEFT_COMMAND_STRING
    } else if (e.code == FIREFOX_RIGHT_COMMAND_STRING) {
      keyString = CHROME_RIGHT_COMMAND_STRING
    }
    document.querySelector("#"+keyString.toLowerCase()).classList.add("pressed");
    return true;
  }else
  
  // Highlught Numpad keys
  if(e.which>=96 && e.which<=105){
    document.querySelector(`li[id="${e.key}"]`).classList.add('pressed');
    return true;
  }else
  
  // Highlight Fn key if any of F1-F12 is pressed
  if (e.which>=112 && e.which<=123) {
    document.querySelector("#fnc").classList.add("pressed");
  }

  if (commandDown) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector("#"+e.key.toLowerCase()).classList.add("pressed");
    return false;
  }
  if(document.querySelector(`li[data-keycode="${e.keyCode}"]`))
    document.querySelector(`li[data-keycode="${e.keyCode}"]`).classList.add('pressed');
  
}

// Function called on KeyUp to reset the key by removing class = 'pressed'
function release(e) {

  if(e.key.toLowerCase()=="capslock")
    return true;
    
  if(e.key.toLowerCase()=="alt" || e.key.toLowerCase()=="shift" || e.key.toLowerCase()=="meta"){
    if (e.key.toLowerCase()=="meta") {
      commandDown = false;
    }
    let keyString = e.code;
    if(e.code == FIREFOX_LEFT_COMMAND_STRING) {
      keyString = CHROME_LEFT_COMMAND_STRING
    } else if (e.code == FIREFOX_RIGHT_COMMAND_STRING) {
      keyString = CHROME_RIGHT_COMMAND_STRING
    }
    if( document.querySelector("#"+keyString.toLowerCase()).classList.contains("pressed"))
      document.querySelector("#"+keyString.toLowerCase()).classList.remove("pressed");
    return true;
  }else
  
  // Highlught Numpad keys
  if(e.which>=96 && e.which<=105){
    if(document.querySelector(`li[id="${e.key}"]`).classList.contains('pressed'))
      document.querySelector(`li[id="${e.key}"]`).classList.remove('pressed');
    return true;
  }else
  
  // Highlight Fn key if any of F1-F12 is pressed
  if (e.which>=112 && e.which<=123){
    if(document.querySelector("#fnc").classList.contains("pressed"))
      document.querySelector("#fnc").classList.remove("pressed");
  }
  if(document.querySelector(`li[data-keycode="${e.keyCode}"]`) && document.querySelector(`li[data-keycode="${e.keyCode}"]`).classList.contains('pressed'))
    document.querySelector(`li[data-keycode="${e.keyCode}"]`).classList.remove('pressed');

}

function promptKey2(key){
  //if($('li[data-keycode="'+key+'"]'[0]).hasClass('prompt')){
    if (isShowHint) {
      $($('li[data-keycode="'+key+'"]')[0]).addClass("prompt");
      // Highlight Fn to be a combination with F1-F12
      if (key>=112 && key <=123) {
        document.querySelector("#fnc").classList.add("prompt");
      }
    } else {
      $($('li[data-keycode="'+key+'"]')[0]).removeClass("prompt")
      // Remove Fn highlight
      if (key>=112 && key <=123) {
        document.querySelector("#fnc").classList.remove("prompt");
      }
    }
  //}
}

// Function to highlight any key passed as input
function promptKey(key){
  // Handling all key types
  key = key.toLowerCase();
  id = key.length == 1 ? key : keyToId[key];
  if (id) document.querySelector('#' + id).classList.toggle('prompt');
}

/**
 * Function to read the next combination of keys and highlight it on keyboard
 * @param withoutAnimation {boolean=} [withoutAnimation = false] flag to prevent typing question animation
 */
function readText(withoutAnimation){
  quesNo = localStorage.getItem("questionNo")
  if(quesNo!=null){
    commandText = allData[parseInt(quesNo)-1].answer
    answerkeys = allData[parseInt(quesNo)-1].keys
    type = allData[parseInt(quesNo) - 1].shortcutType
    //commandText = "A+Control"  // document.querySelector("#textdiv").textContent; // Will be taken from some other list type of a source.
    //Each command will have an associated question text used in writeQuestion
    var speed = 50
    var i = 0;

    // Call writeQuestion to add question on the top textarea
    if (!withoutAnimation) {
      writeQuestion(allData[parseInt(localStorage.getItem("questionNo"))-1].question)
    }

    $.each(answerkeys , function(index, val) {
      reqKeys.push(val)
      // Highlight the prompt keys
      promptKey2(val)
    });

    // update shortcut type
    document.querySelector("#shortcut-tag").textContent = type + " Shortcut";
    if(type == 'mac') {
      $('#shortcut-tag').first().css('background-color', '#3455db')
    } else {
      $('#shortcut-tag').first().css('background-color', '#4b2142')
    }

    /* commandText.split('+').forEach(function(c) {
      if(c.toLowerCase()=="command"){
        reqKeys.push("meta")
      }else if(c.toLowerCase()=="option"){
        reqKeys.push("alt")
      }
      else{
        reqKeys.push(c)
      }
// Highlight the prompt keys
      promptKey(c)

    }); */

    //key(commandText, function(){ onSuccess(...reqKeys)});
  } // END IF for localStorage check
}

function writeQuestion(question) {
  if(typewriter!=null) {
      typewriter.state.eventQueue = [];
      document.querySelector("#textdiv span").textContent = '';
  } else {
    typewriter = new Typewriter(document.getElementById('textdiv'), {
      loop: false,
      delay: 10
    });
  }
  typewriter.typeString(question).start();

  // and, finally, mark the beginning of asking the question
  questionStartMS = Date.now();
}

function clearIncorrectIndication() {
  if(document.querySelector("#read"))
    document.querySelector("#read").classList.remove('incorrect');
};

function clearPromptKeys() {
  if(document.querySelector('.prompt'))
    document.querySelectorAll('.prompt').forEach(key => key.classList.remove('prompt'));
};


function clearPressedKeys() {
  pressed.clear();
  if(document.querySelector('.pressed'))
    document.querySelector('.pressed').classList.remove('pressed');
};

function updateTimingDisplay() {
  $('#timing-feedback').html('');
  var questionNo = localStorage.getItem('questionNo');
  // grab the last bits of timing data
  getHistory(questionNo).then(timings => {
    // and then drop them into the boxes
    timings.forEach(function(t, idx) {
      var element = $('#timing-' + idx);
      element.html(t / 1000 + ' sec');
      element.show();
    })

    // hide the boxes if we don't have timing data
    for (var i = timings.length; i < 3; i++) {
      $('#timing-' + i).hide();
    }
  });
}

function onIncorrect() {
  $('#textdiv').effect("shake", { distance: 3 });
  if(document.querySelector("#read"))
    document.querySelector("#read").classList.add('incorrect');
  setTimeout(clearPressedKeys, 500);
};

function handleTimingFeedback(questionNo, curMS) {
  getHistory(questionNo).then(previousTimings => {
    if (previousTimings.length == 0) {
      return;
    }
  
    var average = previousTimings.reduce(
      function(acc, cur) { return acc + cur },
      0,
    ) / previousTimings.length;
  
    var delta = average - curMS;
  
    var template = null;
    if (delta > 0) {
      template = "<br/>You were <span style='color:green;'>faster</span> by ${delta} sec!";
    }
    if (delta < 0) {
      template = "<br/>You were <span style='color:red;'>slower</span> by ${delta} sec.";
    }
    if (template === null) {
      return;
    }
  
    // convert MS to S
    delta = Math.abs(delta) / 1000;
    // now we want to trunate to 2 decimals; the `+` will let us only use 2
    // decimals if we actually need them, e.g., we want 1.5 not 1.50
    // cf. https://stackoverflow.com/a/12830454
    delta = +delta.toFixed(2);
    $('#timing-feedback').html(template.replace('${delta}', delta));
  });
}

// Function to execute when correct keys are pressed.
function onSuccess() {
  var questionNo = localStorage.getItem("questionNo");
  var thisAnswerMS = Date.now() - questionStartMS;
  handleTimingFeedback(questionNo, thisAnswerMS);
  document.querySelector("#textdiv span").textContent = 'Correct Keys pressed!';
  clearPromptKeys();
  clearPressedKeys();
  confetti($("#confetti").get(0), { spread: 180, startVelocity: 50, elementCount: 150 });
  createUserAnswer(questionNo, true, thisAnswerMS);
  setTimeout(nextQuestion, 1500);
}

document.addEventListener('keydown', function(event) {
  event.preventDefault();
  clearIncorrectIndication();
  if(localStorage.getItem("questionNo")!=null){
    if(quesNo!=localStorage.getItem("questionNo")){
      return;
    }
  }

  // If used in Firefox, change command key code to be the same as that of Chrome
  let keyCode = event.keyCode;
  if (navigator.userAgent.search('Firefox') > 0 && keyCode == FIREFOX_COMMAND_CODE) {
    keyCode = CHROME_LEFT_COMMAND_CODE;
  }

  // Make left and right command key the same
  if (keyCode == CHROME_RIGHT_COMMAND_CODE) {
    keyCode = CHROME_LEFT_COMMAND_CODE;
  }

  pressed.add(keyCode);
  handle(event);
  const keySet = new Set(reqKeys);
  if (keySet.size <= pressed.size) {
    for (let key of pressed) { // are all required keys pressed?
      if (!keySet.has(key)) {
        onIncorrect();
        return;
      }
    }
    // All the required keys are pressed
    onSuccess();
  }
});

document.addEventListener('keyup', function(event) {
  event.preventDefault();
  if(localStorage.getItem("questionNo")!=null){
    if(quesNo!=localStorage.getItem("questionNo")) {
      return;
    }
  }

  // If used in Firefox, change command key code to be the same as that of Chrome
  let keyCode = event.keyCode;
  if (navigator.userAgent.search('Firefox') > 0 && keyCode == FIREFOX_COMMAND_CODE) {
    keyCode = CHROME_LEFT_COMMAND_CODE;
  }

  // Make left and right command key the same
  if (keyCode == CHROME_RIGHT_COMMAND_CODE) {
    keyCode = CHROME_LEFT_COMMAND_CODE;
  }

  pressed.delete(keyCode);
  release(event);
});

window.addEventListener('focus', function (e) {
  // Chrome disables capturing certain commands like:
  // Cmd+n, Cmd+t, Cmd+w
  // Here, we're using window refocus to progress the game
  clearPressedKeys();
  if (reqKeys[0] && reqKeys[1] && reqKeys[0] === 91 &&
    (reqKeys[1] === 78 || reqKeys[1] === 87 || reqKeys[1] === 84)) {
    onSuccess();
  }
});

const showHintCheckbox = document.getElementById('show-hint');
showHintCheckbox.addEventListener('change', function(e) {
  isShowHint = e.target.checked;
  readText(true)
})

function createUserAnswer(questionNo, isCorrect, elapsedTimeMs){
  let requestBody = {
    userId: 'guest',
    isCorrect: isCorrect,
    elapsedTimeMs: elapsedTimeMs
  }
  
  fetch(document.URL + 'user/answers/question/' + questionNo, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  }).catch(error => {
    // TODO: handle error messages in a better way
    console.log(error);
  })
}