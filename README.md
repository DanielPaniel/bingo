This is a web component of a bingo game.
The default content is made for use on train trips, with kids, in Sweden. Look out the window - check stuff you see.
My intention was for the game to be easily repurposed by switching the content.

Use the component something like this:

        <bingo-game dimension="4">
        
            <bingo-bar>
                <h1>My bingo game!</h1>
            </bingo-bar>
            
            <bingo-tray>
              <bingo-check>
                  <img slot="image" src="images/my-image-1.svg" width="100" height="100" alt="" />
                  <div slot="label">Description of image</div>
              </bingo-check>
              
              <bingo-check>
                <img slot="image" src="images/my-image-2.svg" width="100" height="100" alt="" />
                <div slot="label">Description of image</div>
              </bingo-check>
              
              <bingo-check>
                  <img slot="image" src="images/my-image-3.svg" width="100" height="100" alt="" />
                  <div slot="label">Description of image</div>
              </bingo-check>
              /.../
              
            </bingo-tray>

            <audio preload="auto" data-id="bingo-sound-win">
                <source src="sounds/bingo.mp3" type="audio/mp3" />
            </audio>
            <audio preload="auto" data-id="bingo-sound-click">
                <source src="sounds/click.mp3" type="audio/mp3" />
            </audio>
            
        </bingo-game>
