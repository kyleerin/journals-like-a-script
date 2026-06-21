export class JLASListener {
  static activateListeners() {
    console.log("JLAS | Activating listeners.");
    const body = $("body");
    body.on("click", "a.jlas-activate-scene", this._onClickActivateScene);
    body.on("click","a.jlas-view-scene", this._onClickViewScene);
  }

  /* -------------------------------------------- */

  /**
   * Handle click events on links that activate scenes.
   * @param {Event} event
   * @private
   */
  static async _onClickActivateScene(event) {
    event.preventDefault();
    console.log("JLAS | Clicked activate scene link.");
    const a = event.currentTarget;
    console.log("JLAS | a element:", a);
    console.log("JLAS | a.dataset:", {...a.dataset});
    console.log("JLAS | a.dataset.id:", a.dataset.id);
    console.log("JLAS | All scene ids in world:", game.scenes.contents.map(s => s.id));
    let scene = game.scenes.get(a.dataset.id);
    console.log("JLAS | scene lookup result:", scene);

    // If the scene doesn't exist, warn and exit.
    if ( !scene ) {
      console.warn("JLAS | Scene not found for id:", a.dataset.id);
      return ui.notifications.warn("This link seems to be broken. Does the scene still exist?");
    };

    // If the user has permissions to modify, activate the scene. Otherwise, just
    // view the scene.
    const canView = game.settings.get("journals-like-a-script","playersViewScenes");
    const canMod = scene.canUserModify(game.user, "update");
    console.log("JLAS | canView:", canView, "canMod:", canMod, "ctrlKey:", event.ctrlKey);
    if ( ( !canMod && canView ) || ( canMod && event.ctrlKey ) ) {
      console.log("JLAS | Calling scene.view()");
      scene.view();
    } else {
      console.log("JLAS | Calling scene.activate()");
      scene.activate();
    };

    // If the scene has notes, get those and open them.
    console.log("JLAS | scene.journal:", scene.journal);
    if ( scene.journal ) {
      if ( !scene.journal.testUserPermission(game.user, "LIMITED") ) {
        return ui.notifications.warn(`You do not have permission to view this: ${scene.journal.documentName}`);
      };
      scene.journal.sheet.render(true);
    };
  }

  /**
   * Handle click events on links that view scenes.
   * @param {Event} event
   * @private
   */
  static async _onClickViewScene(event) {
    event.preventDefault();
    console.log("JLAS | Clicked view scene link.");
    const a = event.currentTarget;
    console.log("JLAS | a element:", a);
    console.log("JLAS | a.dataset:", {...a.dataset});
    console.log("JLAS | a.dataset.id:", a.dataset.id);
    console.log("JLAS | All scene ids in world:", game.scenes.contents.map(s => s.id));
    let scene = game.scenes.get(a.dataset.id);
    console.log("JLAS | scene lookup result:", scene);

    // If the scene doesn't exist, warn and exit.
    if ( !scene ) {
      console.warn("JLAS | Scene not found for id:", a.dataset.id);
      return ui.notifications.warn("This link seems to be broken. Does the scene still exist?");
    };

    // View the scene.
    console.log("JLAS | Calling scene.view()");
    scene.view();

    // If the scene has notes, get those and open them.
    console.log("JLAS | scene.journal:", scene.journal);
    if ( scene.journal ) {
      if ( !scene.journal.testUserPermission(game.user, "LIMITED") ) {
        return ui.notifications.warn(`You do not have permission to view this: ${scene.journal.documentName}`);
      };
      scene.journal.sheet.render(true);
    };
  }
}
