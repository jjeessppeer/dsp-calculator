class ToggleButton extends HTMLImageElement {
    constructor() {
        super();
        this.classList.add('toggle-button');
        this.addEventListener('click', event => {
            const enable = !this.isEnabled();
            if (!enable && !this.manualDisable) return;
            if (enable && !this.manualEnable) return;
            this.toggle(enable, true);
        });
        this.manualDisable = false;
        this.manualEnable = true;
        this.enabled = false;
    }

    setItem(imgSrc, itemId, title) {
        this.src = imgSrc;
        this.itemId = itemId;
        this.title = title;
    }

    toggle(enable=undefined, brodcastEvent=false) {
        // if (this.isEnabled() != enable)
        this.classList.toggle('active', enable);
        if (brodcastEvent)
            this.dispatchEvent(new Event('button-toggled'), {detail: this.itemId});
    }

    isEnabled() {
        return this.classList.contains('active');
    }
}

class ToggleGroup extends HTMLDivElement {
    constructor() {
        super();

        this.classList.add('toggle-group');
        this.items = [];
        this.isExlusive = true;
    }

    addItem(imgSrc, itemId, title, manualDisable=false) {
        const item = document.createElement('img', { is: 'toggle-button' });
        item.setItem(imgSrc, itemId, title);
        item.manualDisable = manualDisable;
        item.addEventListener('button-toggled', () => this.itemSelected(item, true));


        this.items.push(item);
        this.append(item);
    }

    getActiveItems() {
        const activeItemIds = []
        for (const item of this.items) {
            if (!item.isEnabled()) continue;
            activeItemIds.push(item.itemId);
        }
        return activeItemIds;
    }

    itemSelected(item, brodcastEvent=false) {
        if (brodcastEvent)
            this.dispatchEvent(new CustomEvent('group-toggled', {detail: {itemId: item.itemId, enabled: item.isEnabled()}}));
        if (!item.isEnabled()) return;
        if (this.isExlusive) {
            for (const it of this.items) {
                if (it != item) it.toggle(false);
            }
        }
        
    }

    toggleItem(itemId, enable) {
        for (const button of this.items) {
            if (button.itemId != itemId) continue;
            button.toggle(enable);
        }
    }
}

class RecipeSelector extends HTMLTableCellElement {
    constructor() {
        super();
        this.classList.add('recipe-selection-group');
        this.innerHTML = `
            <div>
                <img src="icons/spray-coater.png" class="group-item">
            </div>
            <div>
            </div>
        `;
        
        this.toggleGroup = document.createElement('div', { is: 'toggle-group' });
        // this.toggleGroup.addEventListener('group-toggled', () => )
        this.querySelectorAll('div')[1].append(this.toggleGroup);
        this.titleImg = this.querySelector('img');
        
        this.toggleGroup.isExlusive = false;

    }

    // recipeChanged(brodcastEvent=false) {

    // }

    setRecipes(itemId, recipeIds) {
        this.titleImg.src = items[itemId].icon;
        this.titleImg.title = items[itemId].name;
        for (const recipeId of recipeIds) {
            const src = recepies_full[recipeId].icon;
            const title = recepies_full[recipeId].name;
            this.toggleGroup.addItem(src, recipeId, title, true)
        }
        this.toggleRecipe("34", true);
    }

    toggleRecipe(recipeId, enable) {
        this.toggleGroup.toggleItem(recipeId, enable);
    }


}


customElements.define('toggle-button', ToggleButton, { extends: 'img' });
customElements.define('toggle-group', ToggleGroup, { extends: 'div' });
customElements.define('recipe-selector', RecipeSelector, { extends: 'td' });