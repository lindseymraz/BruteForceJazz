let enforceAllSelectedToShowAtLeastOnce = false;

const checkedNotesMap = new Map(); //e.g. 0 to C, 1 to D#...
const chordsGeneratedList = document.getElementById("chordsGeneratedList");

document.querySelectorAll('input[type="checkbox"].noteName').forEach(noteNameCheckBox  => noteNameCheckBox.addEventListener('change', toggleAllChordsInCategory));
document.querySelectorAll('input[type="checkbox"].fastCheckToggles').forEach(fastToggleCheckBox  => fastToggleCheckBox.addEventListener('change', toggleAllChordsInCategory));
document.getElementById("enforceAllSelectedToShowAtLeastOnce").addEventListener('change', onToggleEnforceAllShows);
document.getElementById("getChordsButton").addEventListener("click", onGetNotesClicked);
document.getElementById("saveCookie").addEventListener("click", onSaveCookieClicked);
document.getElementById("clearCookie").addEventListener("click", onClearCookieClicked);
document.addEventListener('DOMContentLoaded', loadCookieContent);

function pickRandomNote() {
    return checkedNotesMap.get(Math.floor(Math.random() * checkedNotesMap.size));
}

/**
 * Populates checkedNotesMap, with name of all checked 7th chord boxes (i.e. if A, Amaj7, Amin7, and A7 are checked, A is ignored) serving as the note names
 */
function populateMap() {
    let checkedChords = document.querySelectorAll('input[type="checkbox"]:checked:not(#enforceAllSelectedToShowAtLeastOnce, .noteName, .fastCheckToggles)');
    checkedNotesMap.clear();
    if(checkedChords.length === 0) { //perhaps refactor this
        alert("Check off some chords!")
    }
    for (let i = 0; i < checkedChords.length; i++) {
        checkedNotesMap.set(i, checkedChords[i].value); //add name of each checked box to map
    }
}

function onGetNotesClicked() {
    const generatedChordArray = generateChordArray();
    getAndShowChordSets(generatedChordArray);
    showChordList(generatedChordArray);
}

function generateChordArray() {
    populateMap();
    const generatedChordArray = [];
    chordsGeneratedList.textContent = ''; //replace all children with nothing
    for(let i = 0; i < Number(document.getElementById("amtToGenerate").value); i++) {
        generatedChordArray[i] = pickRandomNote();
    }
    return generatedChordArray;
}

function getAndShowChordSets(generatedChordArray) {
    const chordsGeneratedSetArray = [];
    const chordsNotGeneratedSetArray = [];
    const duplicateIndices = [];
    generatedChordArray.forEach((generatedChord, index) => {
        if(!chordsGeneratedSetArray.includes(generatedChord)) {
            chordsGeneratedSetArray.push(generatedChord);
        } else { //already included in this array: a duplicate
            if(enforceAllSelectedToShowAtLeastOnce) {
                duplicateIndices.push(index);
            }
        }
    });
    checkedNotesMap.forEach((value) => {
        if(!chordsGeneratedSetArray.includes(value)) {
            chordsNotGeneratedSetArray.push(value);
        }
    });
    if(enforceAllSelectedToShowAtLeastOnce && !(chordsNotGeneratedSetArray.length === 0)) {
        let i = duplicateIndices.length;
        while(chordsNotGeneratedSetArray.length !== 0) {
            const indexForDuplicate = Math.floor(Math.random() * i);
            const indexForChord = Math.floor(Math.random() * chordsNotGeneratedSetArray.length);
            generatedChordArray[duplicateIndices[indexForDuplicate]] = (chordsNotGeneratedSetArray[indexForChord]);
            chordsGeneratedSetArray.push(chordsNotGeneratedSetArray[indexForChord]);
            chordsNotGeneratedSetArray.splice(indexForChord, 1);
            duplicateIndices.splice(indexForDuplicate, 1);
        }
    }
    placeArrayContentInParagraph(chordsGeneratedSetArray, "chordsGeneratedSet");
    placeArrayContentInParagraph(chordsNotGeneratedSetArray, "chordsNotGeneratedSet");
}

function showChordList(generatedChordArray) {
    generatedChordArray.forEach((generatedChord) => {
        const noteMsg = document.createElement("p");
        noteMsg.textContent = generatedChord;
        chordsGeneratedList.appendChild(noteMsg);
    });
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
    } else if(paragraphId==="chordsGeneratedSet"&&array.length===checkedNotesMap.size) {
        str = "all checked";
    } else {
        array.forEach(generatedChord => str += generatedChord + ", ");
        str = str.substring(0, str.length - 2);
    }
    document.getElementById(paragraphId).textContent = str;
}

function onToggleEnforceAllShows(e) {
    if(e.target.checked) {//refactor?
        if(Number(document.getElementById("amtToGenerate").value) < document.querySelectorAll(`input[type="checkbox"]:checked:not(#enforceAllSelectedToShowAtLeastOnce, .noteName, .fastCheckToggles)`).length) {
            alert("Cannot ensure all checked options will show at least once, as count of chords to generate is less than count of checked options");
            e.target.checked = false;
        } else {//refactor? having this function modify things with a boolean may not be the best
            enforceAllSelectedToShowAtLeastOnce = true;
            document.querySelectorAll(`input[type="checkbox"]:not(#enforceAllSelectedToShowAtLeastOnce, .noteName, .fastCheckToggles)`).forEach(checkedChord => checkedChord.addEventListener('change', doesCountOfCheckedChordsExceed));
        }
    } else {
        enforceAllSelectedToShowAtLeastOnce = false;
        document.querySelectorAll(`input[type="checkbox"]:not(#enforceAllSelectedToShowAtLeastOnce, .noteName, .fastCheckToggles)`).forEach(checkedChord => checkedChord.removeEventListener('change', doesCountOfCheckedChordsExceed));
    }
}

function doesCountOfCheckedChordsExceed(e) {
    if(e.target.checked) {
        if(Number(document.getElementById("amtToGenerate").value) < document.querySelectorAll(`input[type="checkbox"]:checked:not(#enforceAllSelectedToShowAtLeastOnce, .noteName, .fastCheckToggles)`).length) {
            alert("Checking this option will make it impossible to show all checked options at least once, as the count of chords to generate will be less than than count of checked options");
            e.target.checked = false;
        }
    }
}

/**
 * If the target is (un)checked, (un)check all chords in its category.
 * Chords that are already (un)checked will remain so. e.g. if Fmaj7 is checked, checking F will check Fmin7 and F7, leaving Fmaj7 still checked.
 * @param e
 */

function toggleAllChordsInCategory(e) {
    let nodeList;
    if(e.target.className === "noteName") {
        nodeList = document.querySelectorAll(`tr.${e.target.id} > td > input[type="checkbox"]`);
    } else { //refactor?
        switch(e.target.id) {
            case "allNoteBoxes": nodeList = document.querySelectorAll(`input[type="checkbox"]:not(#enforceAllSelectedToShowAtLeastOnce)`); break;
            case "allWhiteKeys": nodeList = document.querySelectorAll(`tr.white input[type="checkbox"]`); break;
            case "allFlatKeys": nodeList = document.querySelectorAll(`tr.flat input[type="checkbox"]`); break;
            case "allSharpKeys": nodeList = document.querySelectorAll(`tr.sharp input[type="checkbox"]`); break;
            case "allFlatWhiteKeys": nodeList = document.querySelectorAll(`tr.flat.white input[type="checkbox"]`); break;
            case "allSharpWhiteKeys": nodeList = document.querySelectorAll(`tr.sharp.white input[type="checkbox"]`); break;
            case "allAccidentalWhiteKeys": nodeList = document.querySelectorAll(`tr.flat.white input[type="checkbox"], tr.sharp.white input[type="checkbox"]`); break;
            default: alert("Error!"); //refactor uh oh
        }
    }
    if(enforceAllSelectedToShowAtLeastOnce && e.target.checked) {
        if(Number(document.getElementById("amtToGenerate").value) < nodeList.length + document.querySelectorAll(`input[type="checkbox"]:checked:not(#enforceAllSelectedToShowAtLeastOnce, .noteName, .fastCheckToggles)`).length) {
            alert("Checking this option will make it impossible to show all checked options at least once, as the count of chords to generate will be less than than count of checked options");
            e.target.checked = false;
            return;
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
    checked.forEach((checkedBox) => {
        str += checkedBox.id + ", ";
    });
    str = str.substring(0, str.length - 2);
    document.cookie = str;
}

function onClearCookieClicked() {
    document.cookie += ";max-age=0"
}

function loadCookieContent() {
    if(document.cookie!=="") {
        const boxesToCheck = document.cookie.split(", ");
        //turn off the auto-checking of affiliated chords and fast toggles so we can manually check everything
        document.querySelectorAll('input[type="checkbox"].noteName').forEach((noteNameCheckBox) => noteNameCheckBox.removeEventListener('change', toggleAllChordsInCategory));
        document.querySelectorAll('input[type="checkbox"].fastCheckToggles').forEach( (fastToggleCheckBox ) => fastToggleCheckBox.removeEventListener('change', toggleAllChordsInCategory));
        boxesToCheck.forEach((box) => {
                document.getElementById(box).checked = "true";
            }
        );
        //turn the auto-checking back on
        document.querySelectorAll('input[type="checkbox"].noteName').forEach((noteNameCheckBox) => noteNameCheckBox.addEventListener('change', toggleAllChordsInCategory));
        document.querySelectorAll('input[type="checkbox"].fastCheckToggles').forEach( (fastToggleCheckBox ) => fastToggleCheckBox.addEventListener('change', toggleAllChordsInCategory));
    }
}

//TODO: autoselect and deselect groups of checkboxes (enharmonic equivalents, column: maj7, min7, 7)
//TODO: algorithm ensuring that you'll see every major, minor, and 7th iteration of a chord at least once within several sets
//TODO: format the display like a piano where the key presses down when you have it selected
//TODO: make it look better
//TODO: refactor, especially textContent vs innerHTML vs innerText, whether a const is used in place of a document.querySelectorAll or getElementById, and whether you can replace Number(document.getElementById("amtToGenerate").value) and document.querySelectorAll(`input[type="checkbox"]:checked:not(.enforceAllSelectedToShowAtLeastOnce) with a const and its value will change when you change it, and making string quotes consistent ' vs "
//TODO: make cookies work on iOS