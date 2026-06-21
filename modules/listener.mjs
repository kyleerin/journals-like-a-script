export class JLASListener {
  static activateListeners() {
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
    const a = event.currentTarget;
    const scene = game.scenes.get(a.dataset.id);

    if ( !scene ) {
      return ui.notifications.warn("This link seems to be broken. Does the scene still exist?");
    };

    const canView = game.settings.get("journals-like-a-script","playersViewScenes");
    const canMod = scene.canUserModify(game.user, "update");
    if ( ( !canMod && canView ) || ( canMod && event.ctrlKey ) ) {
      scene.view();
    } else {
      scene.activate();
    };

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
    const a = event.currentTarget;
    const scene = game.scenes.get(a.dataset.id);

    if ( !scene ) {
      return ui.notifications.warn("This link seems to be broken. Does the scene still exist?");
    };

    scene.view();

    if ( scene.journal ) {
      if ( !scene.journal.testUserPermission(game.user, "LIMITED") ) {
        return ui.notifications.warn(`You do not have permission to view this: ${scene.journal.documentName}`);
      };
      scene.journal.sheet.render(true);
    };
  }
}
