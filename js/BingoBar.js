customElements.define('bingo-bar', class extends HTMLElement  {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(this._getStyle());
        this.shadowRoot.appendChild(this._getTemplate());
  
    }

    _getTemplate() {
        let template = document.createElement("template");
        template.innerHTML = // html
        `
            <slot></slot>
            <button>Nytt spel</button>
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

                display: flex;
                align-items: center;
                justify-content: space-between;

                padding-inline: 1em;
                padding-block: .5em;
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
        `;
        return styles.cloneNode(true);
    }

    connectedCallback() {
        let buttonRestart = this.shadowRoot.querySelector("button");

        buttonRestart.addEventListener("click", () => {
            this.dispatchEvent(this._generateEvent());
        });
    }

    _generateEvent() {
        return new CustomEvent("bingoRestart");
    }
});
