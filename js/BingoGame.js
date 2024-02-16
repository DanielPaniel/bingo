customElements.define('bingo-game', class extends HTMLElement  {
    
    static observedAttributes = ["dimension"];

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this._renderUI();
  
    }

    _renderUI() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild(this._getTemplate());
        this.shadowRoot.appendChild(this._getStyle());
    }

    _getTemplate() {
        let template = document.createElement("template");
        template.innerHTML = // html
        `
            <slot></slot>
            <dialog>
                <div class="dialog-container">
                    <p>Hur svårt ska det va?</p>
                    <div class="buttons">
                        <button data-dimension="3">Lätt</button>
                        <button data-dimension="4">Lagom</button>
                        <button data-dimension="5">Omöjlig</button>
                    </div>
                </div>
            </dialog>
        `;

        return template.content.cloneNode(true);
    }



    _getStyle() {
        let styles = document.createElement("style");
        styles.textContent = //css
        `
            :host {
                --foreground: var(--black);
                --background: var(--white);

                display: block;
                inline-size: fit-content;
            }
            button {
                cursor: pointer;
                font-family: var(--font);
                margin-inline: auto 0;
                border: 1px solid var(--foreground);
                border-radius: .2em;
                color: var(--foreground);
                background: transparent;
                padding-inline: .5em;
                padding-block: .25em;
                font-size: 1rem;
            }
            dialog {
                --foreground: var(--white);
                --background: var(--black);

                font-family: var(--font);
                font-size: 1rem;
                background: transparent;
                border: none;

                color: var(--foreground);
                padding: 0;
            }
            dialog::backdrop {
                background: rgba(0,0,0,.75);
                backdrop-filter: blur(10px);
            }
            .dialog-container {
                padding: 1em;
                border: 1px solid var(--foreground);
                border-radius: .2em;
                background: var(--background);
            }
            dialog .buttons {
                display: grid;
                grid-template-columns: 1fr;
                gap: .5em;
            }
            dialog button {
                inline-size: 100%;
            }
        `;
        return styles.cloneNode(true);
    }


    connectedCallback() {
        let buttons = this.shadowRoot.querySelectorAll("dialog button");
        let dialog = this.shadowRoot.querySelector("dialog");

        buttons.forEach((button) => {
            button.addEventListener("click", (event) => {
                let dimension = event.target.dataset.dimension;
                this.setAttribute("dimension", dimension);
                dialog.close();
            });
        });

        // Close outside .dialog-container
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
        dialog.showModal();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "dimension") {
            this._setup();
        }
    }

    _setup() {
        if(this._loadGame()) {
            console.log("Loaded!");
        } else {
            this._createNew(this.getAttribute("dimension"));
        }
    }


    _createNew(dimension) {
        let allChecks = this.querySelectorAll("bingo-check");
        // reset all
        this._reset(allChecks);

        // Do we have enough checks in our DOM?
        let checksInTotal = dimension * dimension;
        if (allChecks.length >= checksInTotal) {
            // set css grid
            this.querySelector("bingo-tray").style.setProperty("--dimension", dimension);

            let arrayCopy = Array.from(allChecks);
            let newOrder = [];

            for (let i = 0; i < checksInTotal; i ++) {
                 // select random index
                let randomIndex = Math.floor(Math.random() * arrayCopy.length);
                // show check on selected index and reorder to top of tray-DOM
                this.querySelector("bingo-tray").prepend(arrayCopy[randomIndex]);
                arrayCopy[randomIndex].setAttribute("show", "");
                newOrder.push(arrayCopy[randomIndex]);
                // remove from array to avoid duplicate selection
                arrayCopy.splice(randomIndex, 1);
            }
        }
        let visibleChecks = this.querySelectorAll("bingo-check[show]");
        this._saveGame(dimension, visibleChecks);
        console.log("Saved!");
    }

    _reset(checks) {
        checks.forEach(check => {
            check.removeAttribute("show");
            check.removeAttribute("marked");
            check.removeAttribute("bingo");
        });
    }

    _saveGame(dimension, checks) {
        let jsonForLocalStorage = {
            "dimension": dimension,
            "checks": []
        };
        checks.forEach((check) => {
            let checkAsJson = {
                "id": check.getAttribute("id"),
                "isMarked": check.hasAttribute("marked"),
                "isBingo": check.hasAttribute("bingo")
            };
            jsonForLocalStorage.checks.push(checkAsJson);
        });
        localStorage.setItem("bingo-game", JSON.stringify(jsonForLocalStorage));
    }

    _loadGame() {
        let dataFromStorage = localStorage.getItem("bingo-game");
        if (dataFromStorage) {
            let dataAsJson = JSON.parse(dataFromStorage);

            this.querySelector("bingo-tray").style.setProperty("--dimension", dataAsJson.dimension);
            
            dataAsJson.checks.forEach((checkJson) => {
                let checkElement = this.querySelector(`#${checkJson.id}`);
                if (checkJson.isMarked) {
                    checkElement.setAttribute("marked", "");
                }
                if (checkJson.isBingo) {
                    checkElement.setAttribute("bingo", "");
                }
                this.querySelector("bingo-tray").prepend(checkElement);
                checkElement.setAttribute("show", "");
            });
            return true;
        }
        return false;
    }


});
