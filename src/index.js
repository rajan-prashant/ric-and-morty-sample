import * as $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';


let pristineCharacters;
let refinedCharacters;
let displayedCharacters;
let allSpecies;
let selectedSpecies = {};
let allGenders;
let selectedGenders = {};
let allOrigins;
let selectedOrigins = {};

$('document').ready(initPageData);

function initPageData() {
    $.ajax('https://rickandmortyapi.com/api/character/').then(
        (response) => {
            // Get all species.
            pristineCharacters = response.results;
            refinedCharacters = JSON.parse(JSON.stringify(pristineCharacters));
            displayedCharacters = JSON.parse(JSON.stringify(pristineCharacters));
            [allSpecies, allGenders, allOrigins] = [...getFilterParams(response.results)];
            // Generate and Populate filter fields.
            generateFilterSection('species', allSpecies);
            generateFilterSection('genders', allGenders);
            generateFilterSection('origins', allOrigins);
            // Populate Main Pane.
            generateMainSection(displayedCharacters);
        },
        (error) => { }
    );

    $('#nameSearch')[0].addEventListener('input', (event) => {
        displayedCharacters = searchCharacters(event.target.value);
        generateSelectedFiltersSection();
        let sortStatus = $('#sortOptions')[0].value;
        sortStatus ? (displayedCharacters = sortCharacters(sortStatus)) : '';
        generateMainSection(displayedCharacters);
    });

    $('.filters')[0].addEventListener('click',
        (event) => {
            let target = event.target;
            let checkStatus = ($(event.target).is(':checked'));
            if (target.name === 'species') {
                if (checkStatus === true) {
                    selectedSpecies[target.value] = true;
                } else if (checkStatus === false) {
                    delete selectedSpecies[target.value];
                }
            } else if (target.name === 'genders') {
                if (checkStatus === true) {
                    selectedGenders[target.value] = true;
                } else if (checkStatus === false) {
                    delete selectedGenders[target.value];
                }

            } else if (target.name === 'origins') {
                if (checkStatus === true) {
                    selectedOrigins[target.value] = true;
                } else if (checkStatus === false) {
                    delete selectedOrigins[target.value];
                }
            } else {
                return;
            }
            refinedCharacters = filterCharacters();
            displayedCharacters = refinedCharacters;
            //Populate main pane.
            generateSelectedFiltersSection();
            let sortStatus = $('#sortOptions')[0].value;
            sortStatus ? (displayedCharacters = sortCharacters(sortStatus)) : '';
            generateMainSection(displayedCharacters);
        }
    );
    $('#sortOptions')[0].addEventListener('change', (event) => {
        displayedCharacters = sortCharacters(event.target.value);
        generateMainSection(displayedCharacters);
    });
}

/**
 * Get species, genders and origins of currently displayed data.
 * @param {*} results 
 */
function getFilterParams(results) {
    let species = {}, genders = {}, origins = {};
    results.forEach(element => {
        species[element.species] = 1;
        genders[element.gender] = 1;
        origins[element.origin.name] = 1;
    });
    return [Object.keys(species), Object.keys(genders), Object.keys(origins)];
}

function filterCharacters() {
    let species = Object.keys(selectedSpecies);
    let gender = Object.keys(selectedGenders);
    let origin = Object.keys(selectedOrigins);
    let filteredChars = pristineCharacters;
    if (species.length) {
        filteredChars = displayedCharacters.filter(
            (character) => {
                return species.includes(character['species']);
            }
        );

    } if (gender.length) {
        filteredChars = displayedCharacters.filter(
            (character) => {
                return gender.includes(character['gender']);
            }
        );

    } if (origin.length) {
        filteredChars = displayedCharacters.filter(
            (character) => {
                return origin.includes(character['origin']['name']);
            }
        );
    }
    return filteredChars;
}

function searchCharacters(name) {
    return refinedCharacters.filter(
        (character) => {
            return character.name.toLowerCase().includes(name.toLowerCase());
        }
    );
}

function sortCharacters(sortType) {
    let sortedChars;
    if (sortType === 'ascending') {
        sortedChars = displayedCharacters.sort(
            (firstEl, secondEl) => {
                if (firstEl.id >= secondEl.id) {
                    return 1;
                } else if (firstEl.id < secondEl.id) {
                    return -1;
                }
                return 0;
            }
        );
    } else if (sortType === 'descending') {
        sortedChars = displayedCharacters.sort(
            (firstEl, secondEl) => {
                if (firstEl.id >= secondEl.id) {
                    return -1;
                } else if (firstEl.id < secondEl.id) {
                    return 1;
                }
                return 0;
            }
        );
    }
    return sortedChars;
}

/**
 * Generate filter sections.
 * @param {*} sectionName 
 * @param {*} sectionValues 
 */
function generateFilterSection(sectionName, sectionValues) {
    let container = $(`.${sectionName}`);
    container.empty();
    sectionValues.forEach(
        sectionValue => {
            let html = `
                <div>
                    <input type="checkbox" id="${sectionValue}" value="${sectionValue}"
                        name="${sectionName}"> <label for="${sectionValue}">${sectionValue}</label>
                </div>
            `;
            container.append(html);
        }
    );
}

function generateSelectedFiltersSection() {
    let filterspecies = Object.keys(selectedSpecies);
    let filtergenders = Object.keys(selectedGenders);
    let filterorigins = Object.keys(selectedOrigins);
    let container = $('.filteredNames');
    container.empty();
    let html = '';
    if (filterspecies.length) {
        filterspecies.forEach(
            species => {
                html = `
                <span class="filterName py-1 px-2 mx-2">
                    ${species} <span class="cross">x</span>
                </span>`;
                container.append(html);
            }
        );
    }

    if (filterorigins.length) {
        filterorigins.forEach(
            origin => {
                html = `
                <span class="filterName py-1 px-2 mx-2">
                    ${origin} <span class="cross">x</span>
                </span>`;
                container.append(html);
            }
        );
    }

    if (filtergenders.length) {
        filtergenders.forEach(
            gender => {
                html = `
                <span class="filterName py-1 px-2 mx-2">
                    ${gender} <span class="cross">x</span>
                </span>`;
                container.append(html);
            }
        );
    }
}

function generateMainSection(characters) {
    let container = $('.character-tile-container');
    container.empty();
    characters.forEach(
        character => {
            let html = `
            <div class="col-6 col-lg-3 character-tile-container p-2">
                <div class="character-tile">
                    <div class="image-wrapper mb-5">
                        <img class='character-image' src='${character.image}'>
                        <div class='character-introduction px-2'>
                            <h4>${character.name}</h4>
                            <div>
                                id: ${character.id} created ${new Date().getFullYear() - new Date('2017-11-04T22:34:53.659Z').getFullYear()} years ago
                            </div>
                        </div>
                    </div>
                    <div class="character-description px-1">
                        <div class="row">
                            <div class="col-4 text-center">STATUS</div>
                            <div class='col-8 detail'>${character.status}</div>
                        </div>
                        <hr/>
                        <div class="row">
                            <div class="col-4 text-center">SPECIES</div>
                            <div class='col-8 detail'>${character.species}</div>
                        </div>
                        <hr/>
                        <div class="row">
                            <div class="col-4 text-center">GENDER</div>
                            <div class='col-8 detail'>${character.gender}</div>
                        </div>
                        <hr/>
                        <div class="row">
                            <div class="col-4 text-center">ORIGIN</div>
                            <div class='col-8 detail'>${character.origin.name}</div>
                        </div>
                        <hr/>
                        <div class="row">
                            <div class="col-4 text-center">LAST LOCATION</div>
                            <div class='col-8 detail'>${character.location.name}</div>
                        </div>
                    <div>
                </div>
            </div>
            `;
            container.append(html);
        }
    );
}
