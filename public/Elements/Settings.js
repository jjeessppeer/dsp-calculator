class SettingsRow extends HTMLTableRowElement {
    constructor() {
        super();
        this.classList.add('settings-row');
        this.innerHTML = `
            <td>Title:</td>
            <td>content</td>`;
        const cells = this.querySelectorAll('td');
        this.settingsTitle = cells[0];
        this.content = cells[1];
        // console.log(cells);
        // console.log(this.settingsTitle);
        // console.log(this.content);

        // cells[0].innerHTML = "hello there2";
    }

    setTitle(title) {
        console.log(this.title);
        console.log(title);
        this.settingsTitle.textContent = title;
    }
}

class RecipeToggleRow extends SettingsRow {
    constructor() {
        super();
        this.classList.add('recipe-toggle');

        this.content.innerHTML = ``;

        // this.addEventListener('click', event => {
        //     event.target.classList.toggle('active');
        //     reloadResultsTable();
        // });
    }

    setRecipes(itemId, recipeIds) {
        this.setTitle(`${items[itemId].name}:`);
        for (const recipeId of recipeIds) {
            const iconSrc = recepies_full[recipeId].icon;
            const name = recepies_full[recipeId].name;
            this.content.innerHTML += `<img data-recepie="${recipeId}" src="${iconSrc}" title="${name}">`
            
        }
        this.querySelectorAll('img').forEach(
            element => {
              element.addEventListener('click', event => {
                event.target.classList.toggle('active');
              });
          });
    }
}

class ItemSelectionRow extends SettingsRow {
    constructor() {
        super();
    }
}

class ToggleButton extends HTMLImageElement {
    constructor() {
        super();
        this.classList.add('toggle-button');

        this.enabled = false;
    }

    setItem(imgSrc, itemId, title) {
        this.src = imgSrc;
        this.itemId = itemId;
        this.title = title;
    }

    toggle(on=undefined) {

    }

    enable() {

    }

    disable() {

    }
}

class RecipeToggle extends ToggleButton {
    constructor(){
        super();
        this.classList.add('recipe-toggle');

    }
}

customElements.define('settings-row', SettingsRow, { extends: 'tr' });
customElements.define('recipe-toggle', RecipeToggleRow, { extends: 'tr' });


customElements.define('toggle-button', ToggleButton, { extends: 'img' });