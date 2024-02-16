customElements.define('bingo-tray', class extends HTMLElement  {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        let shadow = this.shadowRoot;
        shadow.appendChild(this._getTemplate());
        shadow.appendChild(this._getStyle());
    }

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
    
    _getStyle() {
        let styles = document.createElement("style");
        styles.textContent = //css
        `
            :host {
                --dimension: 4;

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

                background: rgba(255,255,255,.75);
                backdrop-filter: blur(10px);
                opacity: 0;

            }
            .bingo div {
                margin: auto;

                font-family: var(--font);
                font-size: max(5rem, min(15vw, 15vh));
                    
                font-weight: normal;
                color: var(--black);
                text-transform: uppercase;
            }
            .bingo.play-animation {
                animation: 2200ms ease-out 300ms show-bingo;
            }
            .bingo span {
                --letter-index: 0;
                display: inline-block;
                animation: none;
                transform: translateX(-.5em) translateY(.5em);
                opacity: 0;
            }
            .bingo.play-animation span {
                --delay: calc(500ms + (50ms * var(--letter-index)));
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
                        -.1em .1em 0 red,
                        -.2em .2em 0 gold,
                        -.3em .3em 0 blue;
                }
                33% {
                    opacity: 1;
                }
                100% {
                    transform: translateX(0) translateY(0);
                    opacity: 1;
                    text-shadow: 
                        0 0 0 red,
                        0 0 0 gold,
                        0 0 0 blue;
                }
            }
        `;
        return styles.cloneNode(true);
    }


    connectedCallback() {       
        this.addEventListener("bingoMark", (event) => {
            let dimension = parseInt(this.style.getPropertyValue("--dimension"));
            let currentChecks = this.querySelectorAll("bingo-check[show]");
            this._updateChecks(currentChecks, dimension);
        });

        let bingoMessageContainer = this.shadowRoot.querySelector(".bingo");
        bingoMessageContainer.addEventListener("animationend", (event) => {
            if (event.target === bingoMessageContainer) {
                bingoMessageContainer.classList.remove("play-animation");
            }
        });
    }

    _updateChecks(checks, dimension) {
        checks.forEach((check, index) => {
            let checkIsBingo = false;

            let row = this._getRowFromCheckIndex(checks, index, dimension);
            if (this._allIsMarked(row)) {
                this._setBingo(row);
                checkIsBingo = true;
            }
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

    _getRowFromCheckIndex(checks, checkIndex, dimension) {
       let rowIndex = dimension - Math.ceil((checks.length - checkIndex) / dimension);
        return this._getRow(checks, rowIndex, dimension);
    }

    _getColFromCheckIndex(checks, checkIndex, dimension) {
        let colIndex = checkIndex %= dimension;
         return this._getColumn(checks, colIndex, dimension);
     }

     _getRow(checks, rowIndex, dimension) {
        let row = [];
        for (let col = 0; col < dimension; col ++) {
            let currentCheck = checks[col + dimension * rowIndex];
            row.push(currentCheck);
        }
        return row;
    }

    _getColumn(checks, columnIndex, dimension) {
        let col = [];
        for (let row = 0; row < dimension; row ++) {
            let currentCheck = checks[columnIndex + dimension * row];
            col.push(currentCheck);
        }
        return col; 
    }

    _allIsMarked(checks) {
        let isMarked = true;
        checks.forEach((check) => {
            if (!check.hasAttribute("marked")) {
                isMarked = false;
            }
        });
        return isMarked;
    }

    _setBingo(checks) {
        let isNewBingo = false;
        checks.forEach((check) => {
            if (!check.hasAttribute("bingo")) {
                check.setAttribute("bingo", "");
                isNewBingo = true;
            }
        });
        if (isNewBingo) {
            this.shadowRoot.querySelector(".bingo").classList.add("play-animation");
        }
    }


});
