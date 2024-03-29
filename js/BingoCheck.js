/**
 * The purpose of the bingo-check component is to:
 * - display an image and a label
 * - Keep track of its status as "marked" or if in a "bingo"-row/column, 
 *      and change appearance accordingly
 * - Keep track of clicks and taps and interactions
 */
customElements.define('bingo-check', class extends HTMLElement  {

    constructor() {
        super();
        // clickTimeot is how long a check needs to be pressed before action
        this._clickTimeout = 300;
        this._clickTimer = null;

        this.attachShadow({mode: "open"});
        let shadow = this.shadowRoot;
        shadow.appendChild(this._getTemplate());
        shadow.appendChild(this._getStyle());
    }

    /**
     * Create structure
     * @returns {Node}
     */
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
    
    /**
     * Create CSS for shadow DOM
     * @returns {Node}
     */
    _getStyle() {
        let styles = document.createElement("style");
        styles.textContent = //css
        `
            :host {
                --font: var(--bingo-font, monospace);
                --background: var(--bingo-background, #fff);
                --foreground: var(--bingo-foreground, #000);
                --accent: var(--bingo-accent, #15D74C);

                --button-scale: 1;
                --button-scale-duration: 120ms;
                --button-scale-timing: cubic-bezier(.42,2.21,.67,.58);
                --item-opacity: .6;

                --check-opacity: 0;
                --check-scale: 0;
                --check-color: var(--background);

                display: none;
                width: 100%;
                background: var(--background);
                outline: 1px solid var(--foreground);
                opacity: 0;

                transition: background-color 100ms ease calc(var(--check-index) * 50ms);
            }
            :host([marked]) {
                --check-scale: 1;
                --check-opacity: 1;
                --check-color: var(--accent);
                --item-opacity: 1;
            }
            :host([show]) {
                display: block;
                animation: 300ms cubic-bezier(.73,1.74,.97,1.25) calc(var(--check-index) * 75ms) 1 forwards reveal;
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
                background: radial-gradient(var(--check-color) 50%, #00000066 50%);
                box-sizing: border-box;
                border-radius: 50%;

                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                margin-inline: 5% auto;
                margin-block: 5% auto;
                inline-size: 40%;
                aspect-ratio: 1;
                opacity: var(--check-opacity);
                transform: scale(var(--check-scale));
                transition: opacity 100ms ease-in, 
                    transform 200ms cubic-bezier(.42,2.21,.67,.58);
            }
            :host([marked]) button.pressed,
            button.pressed {
                --button-scale: .75;
                --button-scale-duration: ${this._clickTimeout}ms;
                --button-scale-timing: ease-out;

                --item-opacity: .3;
                
                animation: wiggle 75ms linear infinite;
            }

            button:focus-visible {
                outline: 3px solid var(--accent);
                outline-offset: -6px;
            }

            slot[name="image"] {
                display: block;
                block-size: 100%;
                inline-size: 100%;

                opacity: var(--item-opacity);

                transform: scale(var(--button-scale));
                transition: transform var(--button-scale-duration) var(--button-scale-timing),
                    opacity var(--button-scale-duration) linear; 

            }
            ::slotted(img) {
                border-radius: 2%;
                display: block;
                width: 100%;
                height: auto;
                pointer-events: none;
            }

            slot[name="label"] {
                font-family: var(--font);
                font-size: 1rem;
                font-weight: normal;
                color: var(--foreground);
                word-break: break-word;
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

            @keyframes reveal {
                0% {
                    opacity: 0;
                    transform: scale(.9);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        return styles.cloneNode(true);
    }


    connectedCallback() {

        let button = this.shadowRoot.querySelector("button");
        // Listen to interactions
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

    /**
     * Trigger a delayed activation of a button
     * @param {Element} button 
     */
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

    /**
     * Reset activation animation and timer
     * @param {Element} button 
     */
    _resetClick(button) {
        button.classList.remove("pressed");
        clearInterval(this._clickTimer);
        this._clickTimer = null;
    }

    /**
     * Bubble an event so that Bingo-game only needs to listen to the parent element, not every bingo-check
     * @returns {CustomEvent}
     */
    _createEvent() {
        return new CustomEvent("bingoMark", { bubbles: true });
    }

});
