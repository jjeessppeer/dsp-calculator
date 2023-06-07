class SettingsRow extends HTMLTableRowElement {
    constructor() {
        super();
        this.classList.add('settings-row');
        this.innerHTML = `
            <td>Title:</td>
            <td></td>`;
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

    addContent(content) {
        this.content.append(content);
    }
}

class RecipeSelectionRow extends SettingsRow {
    constructor() {
        super();
        this.classList.add('recipe-toggle');

        this.content.innerHTML = `
            <table class="recipe-selection-table">
                <tr>
                </tr>
            </table>
        `;

        this.row = this.querySelector('tr')
        this.recipeGroups = [];
        // this.recipeGroup = document.createElement('td', { is: 'recipe-selector' });
        // this.querySelector('tr').append(this.recipeGroup);
        // this.recipeGroup = document.createElement('td', { is: 'recipe-selector' });
        // this.querySelector('tr').append(this.recipeGroup);
        // this.recipeGroup = document.createElement('td', { is: 'recipe-selector' });
        // this.querySelector('tr').append(this.recipeGroup);
    }

    setRecipes(duplicateRecipes) {
        for (const itemId in duplicateRecipes) {
            if (this.recipeGroups.length % 4 == 0) {
                const row = document.createElement('tr');
                this.querySelector('table').append(row);
                this.row = row;
            }
            const recipeGroup = document.createElement('td', { is: 'recipe-selector' });
            recipeGroup.setRecipes(itemId, duplicateRecipes[itemId]);
            this.recipeGroups.push(recipeGroup);

            recipeGroup.toggleGroup.addEventListener('group-toggled', (evt) => {
                // Toggle all instances of the recipe button.
                this.toggleRecipe(evt.detail.itemId, evt.detail.enabled);
            });

            this.row.append(recipeGroup);
        }
    }

    toggleRecipe(recipeId, enable) {
        for (const group of this.recipeGroups) {
            group.toggleRecipe(recipeId, enable);
        }
    }

    getDisabledRecipes() {
        
    }
}

class CheckboxRow extends SettingsRow {

}

class TextRow extends SettingsRow {

}

class ItemSelectionRow extends SettingsRow {
    constructor() {
        super();
        this.classList.add('item-selection-row');
        
        this.group = document.createElement('div', { is: 'toggle-group' });
        this.addContent(this.group);

        this.items = [];
        this.isExlusive = true;
    }

    addItem(imgSrc, itemId, title) {
        this.group.addItem(imgSrc, itemId, title);
    }

    getActiveItems() {
        return this.group.getActiveItems();
    }
}





customElements.define('settings-row', SettingsRow, { extends: 'tr' });
customElements.define('item-selection-row', ItemSelectionRow, { extends: 'tr' });
customElements.define('recipe-selection-row', RecipeSelectionRow, { extends: 'tr' });

