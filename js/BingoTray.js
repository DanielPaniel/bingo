/**
 * The purpose of the bingo-tray component is to:
 * - Layout the grid of bingo-checks
 * - Keep track of rows and columns getting Bingoed
 */

customElements.define('bingo-tray', class extends HTMLElement  {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        let shadow = this.shadowRoot;
        shadow.appendChild(this._getTemplate());
        shadow.appendChild(this._getStyle());
    }

    /**
     * Create structure
     * @returns Node
     */
    _getTemplate() {
        let template = document.createElement("template");
        template.innerHTML = // html
        `
            <slot></slot>
            <div class="bingo">
                <div>Bingo!</div>
            </div>
        `;

        // Wrap "Bingo!" in span:s for animation
        let textNode = template.content.querySelector(".bingo div");
        let textContent = textNode.textContent;
        textNode.innerHTML = "";
        for (let i = 0; i < textContent.length; i ++) {
            let element = document.createElement("span");
            element.style.setProperty("--letter-index", i);
            element.innerHTML = textContent[i];
            textNode.append(element);
        }

        return template.content.cloneNode(true);
    }
    
    /**
     * Create CSS for shadow DOM
     * @returns Node
     */
    _getStyle() {
        let styles = document.createElement("style");
        styles.textContent = //css
        `
            :host {
                --dimension: 4;
                --font: var(--bingo-font, monospace);
                --overlay: rgba(255,255,255,.75);
                --foreground: var(--bingo-foreground, #000);

                --rainbow-1: var(--bingo-rainbow-1, #9244D0);
                --rainbow-2: var(--bingo-rainbow-2, #348CF4);
                --rainbow-3: var(--bingo-rainbow-3, #15D74C);
                --rainbow-4: var(--bingo-rainbow-4, #DEEC37);
                --rainbow-5: var(--bingo-rainbow-5, #FFAA46);
                --rainbow-6: var(--bingo-rainbow-6, #F63D32);

                display: grid;
                grid-template-columns: repeat(var(--dimension), 
                    max(
                        5rem, 
                        min(
                            calc(100vw/var(--dimension)), 
                            calc(100vh/(var(--dimension) + 1))
                            )
                        )
                    );
                inline-size: fit-content;
                position: relative;
            }
            .bingo {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                pointer-events: none;

                background: var(--overlay);
                backdrop-filter: blur(10px);
                opacity: 0;

            }
            .bingo div {
                margin: auto;

                font-family: var(--font);
                font-size: max(5rem, min(15vw, 15vh));
                    
                font-weight: normal;
                color: var(--foreground);
                text-transform: uppercase;
            }
            .bingo.play-animation {
                animation: 2200ms ease-out 500ms show-bingo;
            }
            .bingo span {
                --letter-index: 0;
                display: inline-block;
                animation: none;
                transform: translateX(-.5em) translateY(.5em);
                opacity: 0;
            }
            .bingo.play-animation span {
                --delay: calc(600ms + (50ms * var(--letter-index)));
                animation: 1200ms cubic-bezier(.47,2.03,.59,.66) var(--delay) 1 forwards celebrate;
            }

            @keyframes show-bingo {
                0% {
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
            @keyframes celebrate {
                0% {
                    transform: translateX(-.3em) translateY(.5em);
                    opacity: 0;
                    text-shadow: 
                        0 .2em .05em var(--rainbow-1),
                        0 .4em .1em var(--rainbow-2),
                        0 .6em .15em var(--rainbow-3),
                        0 .8em .2em var(--rainbow-4),
                        0 1em .25em var(--rainbow-5),
                        0 1.2em .3em var(--rainbow-6);
                }
                33% {
                    opacity: 1;
                }
                100% {
                    transform: translateX(0) translateY(0);
                    opacity: 1;
                    text-shadow: 
                        0 0 0 var(--rainbow-1),
                        0 0 0 var(--rainbow-2),
                        0 0 0 var(--rainbow-3),
                        0 0 0 var(--rainbow-4),
                        0 0 0 var(--rainbow-5),
                        0 0 0 var(--rainbow-6);
                }
            }
        `;
        return styles.cloneNode(true);
    }


    connectedCallback() {

        // Listener for when a check is marked/unmarked update statuses and check for bingos  
        this.addEventListener("bingoMark", (event) => {
            let dimension = parseInt(this.style.getPropertyValue("--dimension"));
            let currentChecks = this.querySelectorAll("bingo-check[show]");
            this._updateChecks(currentChecks, dimension);
        });

        // Listener for ending and remove bingo-celebration-animation
        let bingoMessageContainer = this.shadowRoot.querySelector(".bingo");
        bingoMessageContainer.addEventListener("animationend", (event) => {
            if (event.target === bingoMessageContainer) {
                bingoMessageContainer.classList.remove("play-animation");
            }
        });
    }

    /**
     * Loop through given checks and update status
     * @param {Node[]} checks 
     * @param {int} dimension 
     */
    _updateChecks(checks, dimension) {
        checks.forEach((check, index) => {
            let checkIsBingo = false;

            // Look up row, based on current check
            let row = this._getRowFromCheckIndex(checks, index, dimension);
            if (this._allIsMarked(row)) {
                this._setBingo(row);
                checkIsBingo = true;
            }
            // Look up col, based on current check
            let col = this._getColFromCheckIndex(checks, index, dimension);
            if (this._allIsMarked(col)) {
                this._setBingo(col);
                checkIsBingo = true;
            }

            if (!checkIsBingo) {
                check.removeAttribute("bingo");
            }
        });
    }

    /**
     * Get elements in row, based on index
     * @param {Node[]} checks 
     * @param {int} checkIndex 
     * @param {int} dimension 
     * @returns {Node[]}
     */
    _getRowFromCheckIndex(checks, checkIndex, dimension) {
       let rowIndex = dimension - Math.ceil((checks.length - checkIndex) / dimension);
        return this._getRow(checks, rowIndex, dimension);
    }

        /**
     * Get elements in column, based on index
     * @param {Node[]} checks 
     * @param {int} checkIndex 
     * @param {int} dimension 
     * @returns {Node[]}
     */
    _getColFromCheckIndex(checks, checkIndex, dimension) {
        let colIndex = checkIndex %= dimension;
         return this._getColumn(checks, colIndex, dimension);
     }

     /**
      * Select all checks in a row with given index
      * @param {Node[]} checks 
      * @param {int} rowIndex 
      * @param {int} dimension 
      * @returns 
      */
     _getRow(checks, rowIndex, dimension) {
        let row = [];
        for (let col = 0; col < dimension; col ++) {
            let currentCheck = checks[col + dimension * rowIndex];
            row.push(currentCheck);
        }
        return row;
    }

         /**
      * Select all checks in a column with given index
      * @param {Node[]} checks 
      * @param {int} columnIndex 
      * @param {int} dimension 
      * @returns 
      */
    _getColumn(checks, columnIndex, dimension) {
        let col = [];
        for (let row = 0; row < dimension; row ++) {
            let currentCheck = checks[columnIndex + dimension * row];
            col.push(currentCheck);
        }
        return col; 
    }

    /**
     * If all given elements are "marked"
     * @param {Node[]} checks 
     * @returns {boolean}
     */
    _allIsMarked(checks) {
        let isMarked = true;
        checks.forEach((check) => {
            if (!check.hasAttribute("marked")) {
                isMarked = false;
            }
        });
        return isMarked;
    }

    /**
     * Set given elemens as "Bingo", and if not "Bingo" before - trigger animation
     * @param {Node[]} checks 
     */
    _setBingo(checks) {
        let isNewBingo = false;
        checks.forEach((check) => {
            if (!check.hasAttribute("bingo")) {
                check.setAttribute("bingo", "");
                isNewBingo = true;
            }
        });
        // If any of the given checks are new "Bingoed" - trigger Bingo animation and event
        if (isNewBingo) {
            this.shadowRoot.querySelector(".bingo").classList.add("play-animation");
            this.dispatchEvent(new CustomEvent("bingo"));
        }
    }


});
