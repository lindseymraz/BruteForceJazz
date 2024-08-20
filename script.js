document.querySelectorAll('input[type="checkbox"].noteName').forEach( (noteNameCheckBox ) => noteNameCheckBox.addEventListener('change', checkUncheckAllAffiliatedChords));

document.getElementById("getChordsButton").addEventListener("click", getNotes);

const checkedNotesMap = new Map(); //e.g. 0 to C, 1 to D#...

const chordsGeneratedList = document.getElementById("chordsGeneratedList");

function pickRandomNote() {
    return checkedNotesMap.get(Math.floor(Math.random() * checkedNotesMap.size));
}

function getNotes() {
    populateMap();
    chordsGeneratedList.textContent = ''; //replace all children with nothing
    for(let i = 0; i < Number(document.getElementById("amtToGenerate").value); i++) {
        const noteMsg = document.createElement("p");
        noteMsg.textContent = pickRandomNote();
        chordsGeneratedList.appendChild(noteMsg);
    }
    showChordSets(); //refactor, this doesn't go in here, it isn't part of getting notes
}

function showChordSets() {
    const chordsGeneratedArray = [];
    const chordsNotGeneratedArray = [];
    chordsGeneratedList.childNodes.forEach((element) => {
        if(!chordsGeneratedArray.includes(element.innerText)) {
            chordsGeneratedArray.push(element.innerText);
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

function placeArrayContentInParagraph(array, paragraphId) {
    array.sort();
    let str = "";
    for(let i = 0; i < (array.length - 1); i++) {
        str += array[i] + ", ";
    }
    if(array.length===0) {
        str = "none";
    } else {
        str += array[array.length - 1];
    }
    document.getElementById(paragraphId).innerText = str;
}

/**
 * Populates checkedNotesMap, with name of all checked 7th chord boxes (i.e. if A, Amaj7, Amin7, and A7 are checked, A is ignored) serving as the note names
 */
function populateMap() {
    let checked = document.querySelectorAll('input[type="checkbox"]:checked:not([class=noteName])'); //get all checked boxes
    checkedNotesMap.clear();
    if(checked.length === 0) { //perhaps refactor this
        alert("Check off some chords!")
    }
    for (let i = 0; i < checked.length; i++) {
        checkedNotesMap.set(i, checked[i].value); //add name of each checked box to map
    }
}

/**
 * If the note name is (un)checked, (un)check all affiliated chords.
 * e.g. if F is (un)checked, (un)check Fmaj7, Fmin7, and F7 as well.
 * @param e
 */
function checkUncheckAllAffiliatedChords(e) {
    let affiliatedChords = document.querySelectorAll(`div.${e.target.id} > input[type="checkbox"]`);
    affiliatedChords.forEach( (affiliatedChord) => {
        if(affiliatedChord !== e.target) {
            affiliatedChord.checked = e.target.checked;
        }
    });
}

//TODO: autoselect and deselect groups of checkboxes (all the white keys, all the sharps, all the flats, the sharp/flat names for white notes, enharmonic equivalents...)
//TODO: algorithm ensuring that you'll see every major, minor, and 7th iteration of a chord at least once
//TODO: format the display like a piano where the key presses down when you have it selected
//TODO: save what you had selected last time
//TODO: make it look better