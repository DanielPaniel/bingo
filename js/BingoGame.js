/**
 * The purpose of the bingo-game component is to:
 * - Create new game, and save and load from local storage
 * - Play sounds
 * - Keep track of dimensions
 */
customElements.define('bingo-game', class extends HTMLElement  {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this._renderUI();
  
    }

    _renderUI() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild(this._getTemplate());
        this.shadowRoot.appendChild(this._getStyle());

        /* Start sound on touch in order to allow other sounds to play later (for ios) */
        const dummySound = () => {
            this._playClickAudio(true);
            this.removeEventListener("touchstart", dummySound);
        };
        this.addEventListener("touchstart", dummySound);
    }



    _getTemplate() {
        let template = document.createElement("template");
        template.innerHTML = // html
        `
            <slot></slot>
            <dialog>
                <div class="dialog-container">
                    <p>Nytt spel!</p>
                    <div class="buttons">
                        <button data-dimension="3">Lätt</button>
                        <button data-dimension="4">Lagom</button>
                        <button data-dimension="6">Omöjlig</button>
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
                --font: var(--bingo-font, monospace);
                --foreground: var(--bingo-foreground, #000);
                --background: var(--bingo-background, #fff);

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
                --foreground: var(--bingo-background);
                --background: var(--bingo-foreground);

                font-family: var(--font);
                font-size: 2em;
                background: transparent;
                border: none;

                color: var(--foreground);
                padding-block: 0;
                padding-inline: 0;
            }
            dialog::backdrop {
                background: rgba(0,0,0,.75);
                backdrop-filter: blur(10px);
            }
            .dialog-container {
                padding-block: 1em;
                padding-inline: 2em;
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
                font-size: .8em;

            }
            dialog p {
                margin-inline: 0;
                margin-block: 0 1em;
                padding: 0;
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
                this._reset();
                this._setup();
            });
        });

        // Close outside .dialog-container
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });


        this._checkForBingoBar();
        this._checkForBingoTray();

    }

   _playClickAudio(instantPause = false) {
        let clickAudio = this.querySelector("[data-id='bingo-sound-click']");
        if (clickAudio) {
            clickAudio.play();

            /* Note: the play function returns a promise, which is rejected on pause.
            This goes unhandled and throws an error in safari console for ios */
            if (instantPause) {
                clickAudio.pause();
            }
        }
        
    }
    _playWinAudio() {
        let winAudio = this.querySelector("[data-id='bingo-sound-win']");
        if (winAudio) {
            // magic - to sync better with animation
            setTimeout(() => {
                winAudio.play();
            }, 750);
        }
    }

    _checkForBingoBar() {
        if (this.querySelector("bingo-bar")) {
            let bingoBar = this.querySelector("bingo-bar");
            let dialog = this.shadowRoot.querySelector("dialog");
            bingoBar.addEventListener("bingoRestart", () => {
                dialog.showModal();
            });
        } else {
            setTimeout(() => {
                this._checkForBingoBar();
            }, 200);
        }
    }

    _checkForBingoTray() {
        if (this.querySelector("bingo-tray")) {
            let bingoTray = this.querySelector("bingo-tray");
            bingoTray.addEventListener("bingoMark", () => {
                this._saveGame();
                this._playClickAudio();
            });
            bingoTray.addEventListener("bingo", () => this._playWinAudio());
            this._checkForBingoChecks();
        } else {
            setTimeout(() => {
                this._checkForBingoTray();
            }, 200);
        }
    }

    _checkForBingoChecks() {
        let allChecks = this.querySelectorAll("bingo-check");
        let dimension = this.getAttribute("dimension");
        let checksNeeded = dimension * dimension;
        
        if (allChecks.length >= checksNeeded) {
            this._setup();
        } else {
            setTimeout(() => {
                this._checkForBingoChecks();
            }, 200);
        }
    }

    _setup() {
        if(!this._loadGame()) {
            this._createNew(this.getAttribute("dimension"));
        }
    }


    _createNew(dimension) {
        let allChecks = this.querySelectorAll("bingo-check");
        // Do we have enough checks in our DOM?
        let checksNeeded = dimension * dimension;
        // set css grid
        this.querySelector("bingo-tray").style.setProperty("--dimension", dimension);

        let arrayCopy = Array.from(allChecks);
        let newOrder = [];

        for (let i = 0; i < checksNeeded; i ++) {
            // select random index
            let randomIndex = Math.floor(Math.random() * arrayCopy.length);
            // show check on selected index and reorder to top of tray-DOM
            this.querySelector("bingo-tray").prepend(arrayCopy[randomIndex]);
            arrayCopy[randomIndex].setAttribute("show", "");
            newOrder.push(arrayCopy[randomIndex]);
            // remove from array to avoid duplicate selection
            arrayCopy.splice(randomIndex, 1);
        }
        this._setIndexes();
        this._saveGame();
    }

    _reset() {
        let allChecks = this.querySelectorAll("bingo-check");
        allChecks.forEach(check => {
            check.removeAttribute("show");
            check.removeAttribute("marked");
            check.removeAttribute("bingo");
        });
        localStorage.removeItem("bingo-game");
    }

    _setIndexes() {
        let visibleChecks = this.querySelectorAll("bingo-check[show]");
        let dimension = this.getAttribute("dimension");
        visibleChecks.forEach((check, index) => {
            let row = Math.floor(index/dimension);
            let col = index%dimension;
            check.style.setProperty("--check-index", col + row);
        });
    }

    _saveGame() {
        let dimension = this.getAttribute("dimension");
        let visibleChecks = this.querySelectorAll("bingo-check[show]");
        let jsonForLocalStorage = {
            "dimension": dimension,
            "checks": []
        };
        visibleChecks.forEach((check) => {
            let checkAsJson = {
                "id": check.getAttribute("id"),
                "isMarked": check.hasAttribute("marked"),
                "isBingo": check.hasAttribute("bingo")
            };
            jsonForLocalStorage.checks.push(checkAsJson);
        });
        jsonForLocalStorage.checks.reverse();
        localStorage.setItem("bingo-game", JSON.stringify(jsonForLocalStorage));
    }

    _loadGame() {
        let dataFromStorage = localStorage.getItem("bingo-game");
        if (dataFromStorage) {
            let dataAsJson = JSON.parse(dataFromStorage);

            this.querySelector("bingo-tray").style.setProperty("--dimension", dataAsJson.dimension);
            this.setAttribute("dimension", dataAsJson.dimension);
            
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
            this._setIndexes();
            return true;
        }
        return false;
    }


});
