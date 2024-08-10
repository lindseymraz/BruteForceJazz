let noteNameCheckBoxes = document.querySelectorAll('input[type="checkbox"].noteName');
noteNameCheckBoxes.forEach( (noteNameCheckBox ) => noteNameCheckBox.addEventListener('change', checkUncheckAllAffiliatedChords));

const getNotesButton = document.getElementById("getNotesButton");
getNotesButton.addEventListener("click", getNotes);

const checkedNotesMap = new Map(); //e.g. 0 to C, 1 to D#...

function pickRandomNote() {
    return checkedNotesMap.get(Math.floor(Math.random() * checkedNotesMap.size));
}

function getNotes() {
    populateMap();
    const output = document.getElementById("output");
    output.textContent = ''; //replace all children with nothing
    for(let i = 0; i < Number(document.getElementById("amtToGenerate").value); i++) {
        const noteMsg = document.createElement("p");
        noteMsg.textContent = pickRandomNote();
        output.appendChild(noteMsg);
    }
}

/**
 * Populates checkedNotesMap, with name of all checked boxes serving as the note names
 */
function populateMap() {
    let checked = document.querySelectorAll('input[type="checkbox"]:checked'); //get all checked boxes
    if(checked.length === 0) { //perhaps refactor this
        checkedNotesMap.clear();
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