class BingoCheck extends HTMLElement  {
    static observedAttributes = ["marked", "bingo"];

    constructor() {
        super();
        this._clickTimeout = 500;
        this._clickTimer = null;

        this.attachShadow({mode: "open"});
        let shadow = this.shadowRoot;
        shadow.appendChild(this._getTemplate());
        shadow.appendChild(this._getStyle());
    }

    _getTemplate() {
        let template = document.createElement("template");
        template.innerHTML = // html
        `
        <button>
            <slot name="image"></slot>
            <slot name="label">label</slot>
            <div class="check"></div>
        </button>
        `;
        return template.content.cloneNode(true);
    }
    
    _getStyle() {
        let styles = document.createElement("style");
        styles.textContent = //css
        `
            :host {
                --button-scale: 1;
                --button-scale-duration: 120ms;
                --button-scale-timing: cubic-bezier(.42,2.21,.67,.58);
                --item-opacity: 1;

                --check-opacity: 0;
                --check-scale: 0;
                --check-color: var(--background);

                /* TODO: denna gör inget?
                Och inte transitionen heller? */
                --check-index: 0;

                display: block;
                width: 100%;
                background: var(--background);
                opacity: 1;
                outline: 1px solid var(--foreground);

                transition: opacity 200ms ease-out calc(var(--check-index) * 50ms);
            }
            :host([marked]) {
                --check-scale: 1;
                --check-opacity: 1;
                --check-color: var(--accent);
                --item-opacity: .5;
            }
            :host([hidden]) {
                opacity: 0;
                display: none;
                transition: none;
            }
            :host([bingo]) {
                background: var(--accent);
            }

            button {
                background: transparent;
                border: none;

                inline-size: 100%;
                padding: .75em 1em;
                cursor: pointer;
                display: grid;
                gap: .75em;
                align-items: center;
                position: relative;

                -webkit-user-select: none;
                user-select: none;
            }
            .check {
                background: var(--check-color);
                outline: 1em solid var(--background);
                border: 1em solid var(--foreground);

                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                margin-inline: auto;
                margin-block: auto;
                inline-size: 20%;
                aspect-ratio: 1;
                opacity: var(--check-opacity);
                transform: scale(var(--check-scale));
                transition: opacity 50ms ease-in, 
                    transform 200ms var(--button-scale-timing);
                box-shadow: .1em .2em .1em rgba(0,0,0,.25);
            }
            :host([marked]) button.pressed,
            button.pressed {
                --button-scale: .75;
                --button-scale-duration: ${this._clickTimeout}ms;
                --button-scale-timing: ease-out;

                animation: wiggle 75ms linear infinite;
            }

            button:focus-visible {
                outline: 3px solid var(--accent);
                outline-offset: -6px;
            }

            slot {
                opacity: var(--item-opacity);
            }

            slot[name="image"] {
                display: block;
                block-size: 100%;
                inline-size: 100%;

                transform: scale(var(--button-scale));
                transition-property: transform;
                transition-duration: var(--button-scale-duration);
                transition-timing-function: var(--button-scale-timing);
            }

            @keyframes wiggle {
                0% {
                    transform: rotateZ(0deg);
                }
                25% {
                    transform: rotateZ(-3deg);
                }
                75% {
                    transform: rotateZ(3deg);
                }
                100% {
                    transform: rotateZ(0deg);
                }
            }
        `;
        return styles.cloneNode(true);
    }


    connectedCallback() {
        let button = this.shadowRoot.querySelector("button");
        
        button.addEventListener("mousedown", () => {
            this._triggerClick(button);
        });
        button.addEventListener("touchstart", () => {
            this._triggerClick(button);
        });
        this.addEventListener("mouseleave", () => {
            this._resetClick(button);
        });
        this.addEventListener("mouseup", () => {
            this._resetClick(button);
        });
        button.addEventListener("touchend", () => {
            this._resetClick(button);
        });
        this.addEventListener("touchcancel", () => {
            this._resetClick(button);
        });
    }

    _triggerClick(button) {
        button.classList.add("pressed");            
            if (!this._clickTimer) {
                let timer = 0;
                this._clickTimer = setInterval(() => {
                    timer += 100;
                    if (timer >= this._clickTimeout) {
                        this.toggleAttribute("marked");
                        this.dispatchEvent(this._createEvent());
                        this._resetClick(button);
                    }
                }, 100);
            }
    }

    _resetClick(button) {
        button.classList.remove("pressed");
        clearInterval(this._clickTimer);
        this._clickTimer = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    _createEvent() {
        return new CustomEvent("bingoMark", { bubbles: true });
    }

}
customElements.define('bingo-check', BingoCheck);
