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
            <button id="restart">Nytt spel</button>

            <dialog>
                <div class="dialog-container">
                    <p>Vill du börja om?</p>
                    <div class="buttons">
                        <button id="positive">Ja</button>
                        <button id="negative">Nej</button>
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
                grid-template-columns: 1fr 1fr;
                gap: .5em;
            }
            dialog button {
                inline-size: 100%;
            }
        `;
        return styles.cloneNode(true);
    }


    connectedCallback() {
        let buttonRestart = this.shadowRoot.querySelector("button#restart");
        let buttonPositive = this.shadowRoot.querySelector("button#positive");
        let buttonNegative = this.shadowRoot.querySelector("button#negative");
        let dialog = this.shadowRoot.querySelector("dialog");

        buttonRestart.addEventListener("click", () => {
            dialog.showModal();
        });
        buttonPositive.addEventListener("click", () => {
            location.reload();
        });
        buttonNegative.addEventListener("click", () => {
            dialog.close();
        });
        // Close outside .dialog-container
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }



});
