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
                this.querySelector("bingo-tray").setAttribute("dimension", dimension);
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

    }



});
