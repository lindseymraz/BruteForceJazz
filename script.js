document.querySelectorAll('input[type="checkbox"].noteName').forEach( (noteNameCheckBox ) => noteNameCheckBox.addEventListener('change', toggleAllChordsInCategory));
document.querySelectorAll('input[type="checkbox"].fastCheckToggles').forEach( (fastToggleCheckBox ) => fastToggleCheckBox.addEventListener('change', toggleAllChordsInCategory));

document.getElementById("getChordsButton").addEventListener("click", onGetNotesClicked);
document.getElementById("saveCookie").addEventListener("click", onSaveCookieClicked);
document.getElementById("clearCookie").addEventListener("click", onClearCookieClicked);

document.addEventListener('DOMContentLoaded', loadCookieContent);

const checkedNotesMap = new Map(); //e.g. 0 to C, 1 to D#...

const chordsGeneratedList = document.getElementById("chordsGeneratedList");

function pickRandomNote() {
    return checkedNotesMap.get(Math.floor(Math.random() * checkedNotesMap.size));
}

/**
 * Populates checkedNotesMap, with name of all checked 7th chord boxes (i.e. if A, Amaj7, Amin7, and A7 are checked, A is ignored) serving as the note names
 */
function populateMap() {
    let checkedChords = document.querySelectorAll('input[type="checkbox"]:checked:not(.noteName)');
    checkedNotesMap.clear();
    if(checkedChords.length === 0) { //perhaps refactor this
        alert("Check off some chords!")
    }
    for (let i = 0; i < checkedChords.length; i++) {
        checkedNotesMap.set(i, checkedChords[i].value); //add name of each checked box to map
    }
}

function onGetNotesClicked() {
    generateChordList();
    showChordSets();
}

function generateChordList() {
    populateMap();
    chordsGeneratedList.textContent = ''; //replace all children with nothing
    for(let i = 0; i < Number(document.getElementById("amtToGenerate").value); i++) {
        const noteMsg = document.createElement("p");
        noteMsg.textContent = pickRandomNote();
        chordsGeneratedList.appendChild(noteMsg);
    }
}

function showChordSets() {
    const chordsGeneratedArray = [];
    const chordsNotGeneratedArray = [];
    chordsGeneratedList.childNodes.forEach((element) => {
        if(!chordsGeneratedArray.includes(element.textContent)) {
            chordsGeneratedArray.push(element.textContent);
        }
    });
    checkedNotesMap.forEach((value) => {
        if(!chordsGeneratedArray.includes(value)) {
            chordsNotGeneratedArray.push(value);
        }
    });
    placeArrayContentInParagraph(chordsGeneratedArray, "chordsGeneratedSet");
    placeArrayContentInParagraph(chordsNotGeneratedArray, "chordsNotGeneratedSet");
}

/**
 * A helper for showChordSets(), converting the array content to strings sorted by chord name for output
 * @see showChordSets
 * @param array
 * @param paragraphId
 */
function placeArrayContentInParagraph(array, paragraphId) {
    array.sort();
    let str = "";
    if(array.length===0||array[0]==='') { //the case when array[0]==='' is for chordsGeneratedArray: grabs from chordsGeneratedList, which by chordsGeneratedList.textContent = '' in generateChordList() will have content so array.length===0 won't catch it
        str = "none";
    } else {
        array.forEach(element => str += element + ", ");
        str = str.substring(0, str.length - 2);
    }
    document.getElementById(paragraphId).textContent = str;
}

/**
 * If the target is (un)checked, (un)check all chords in its category.
 * Chords that are already (un)checked will remain so. e.g. if Fmaj7 is checked, checking F will check Fmin7 and F7, leaving Fmaj7 still checked.
 * @param e
 */

function toggleAllChordsInCategory(e) {
    let nodeList;
    if(e.target.className === "noteName") {
        nodeList = document.querySelectorAll(`div.${e.target.id} > input[type="checkbox"]`);
    } else { //refactor?
        switch(e.target.id) {
            case "allBoxes": nodeList = document.querySelectorAll(`input[type="checkbox"]`); break;
            case "allWhiteKeys": nodeList = document.querySelectorAll(`div.white > input[type="checkbox"]`); break;
            case "allFlatKeys": nodeList = document.querySelectorAll(`div.flat > input[type="checkbox"]`); break;
            case "allSharpKeys": nodeList = document.querySelectorAll(`div.sharp > input[type="checkbox"]`); break;
            case "allFlatWhiteKeys": nodeList = document.querySelectorAll(`div.flat.white > input[type="checkbox"]`); break;
            case "allSharpWhiteKeys": nodeList = document.querySelectorAll(`div.sharp.white > input[type="checkbox"]`); break;
            case "allAccidentalWhiteKeys": nodeList = document.querySelectorAll(`div.flat.white > input[type="checkbox"], div.sharp.white > input[type="checkbox"]`); break;
            default: alert("Error!"); //refactor uh oh
        }
    }
    nodeList.forEach((chordInCategory) => {
        if(chordInCategory !== e.target) {
            chordInCategory.checked = e.target.checked;
        }
    })
}


function onSaveCookieClicked() {
    let checked = document.querySelectorAll('input[type="checkbox"]:checked');
    let str = "";
    checked.forEach((element) => {
        str += element.id + ", ";
    });
    str = str.substring(0, str.length - 2);
    document.cookie = str;
}

function onClearCookieClicked() {
    document.cookie += ";max-age=0"
}

function loadCookieContent() {
    if(document.cookie!=="") {
        const chordsToSelect = document.cookie.split(", ");
        //turn off the auto-checking of affiliated chords and fast toggles so we can manually check everything
        document.querySelectorAll('input[type="checkbox"].noteName').forEach((noteNameCheckBox) => noteNameCheckBox.removeEventListener('change', toggleAllChordsInCategory));
        document.querySelectorAll('input[type="checkbox"].fastCheckToggles').forEach( (fastToggleCheckBox ) => fastToggleCheckBox.removeEventListener('change', toggleAllChordsInCategory));
        chordsToSelect.forEach((element) => {
                document.getElementById(element).checked = "true";
            }
        );
        //turn the auto-checking back on
        document.querySelectorAll('input[type="checkbox"].noteName').forEach((noteNameCheckBox) => noteNameCheckBox.addEventListener('change', toggleAllChordsInCategory));
        document.querySelectorAll('input[type="checkbox"].fastCheckToggles').forEach( (fastToggleCheckBox ) => fastToggleCheckBox.addEventListener('change', toggleAllChordsInCategory));
    }
}

//TODO: autoselect and deselect groups of checkboxes (enharmonic equivalents...)
//TODO: algorithm ensuring that you'll see every major, minor, and 7th iteration of a chord at least once
//TODO: format the display like a piano where the key presses down when you have it selected
//TODO: make it look better