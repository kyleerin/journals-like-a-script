export function openSceneLinkDialog(sheet) {
  console.log("JLAS | openSceneLinkDialog called. sheet:", sheet);
  console.log("JLAS | sheet.editors:", sheet.editors);
  console.log("JLAS | sheet.isEditable:", sheet.isEditable);

  const scenes = game.scenes.contents
    .map(s => ({ id: s.id, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`JLAS | Found ${scenes.length} scenes.`);

  if (!scenes.length) {
    return ui.notifications.warn("JLAS | No scenes found in this world.");
  }

  const sceneOptions = scenes
    .map(s => `<option value="${s.id}">${s.name}</option>`)
    .join("");

  const content = `
    <form>
      <div class="form-group">
        <label>Link Type</label>
        <div class="form-fields">
          <select name="linkType">
            <option value="ActivateScene">Activate Scene</option>
            <option value="ViewScene">View Scene</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Search</label>
        <div class="form-fields">
          <input type="search" id="jlas-search" placeholder="Filter scenes…" autocomplete="off">
        </div>
      </div>
      <div class="form-group">
        <label>Scene</label>
        <div class="form-fields">
          <select name="scene" id="jlas-scene-list" size="8" style="width:100%;height:160px;">
            ${sceneOptions}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Link Text</label>
        <div class="form-fields">
          <input type="text" name="linkText" placeholder="Display text for the link">
        </div>
      </div>
    </form>
  `;

  new Dialog({
    title: "Insert JLAS Scene Link",
    content,
    buttons: {
      insert: {
        icon: '<i class="fas fa-link"></i>',
        label: "Insert",
        callback: html => {
          const linkType = html.find("[name=linkType]").val();
          const sceneId  = html.find("[name=scene]").val();
          const linkText = html.find("[name=linkText]").val().trim()
            || game.scenes.get(sceneId)?.name
            || sceneId;
          const syntax = `@${linkType}[${sceneId}]{${linkText}}`;
          console.log(`JLAS | Inserting syntax: ${syntax}`);
          _insertIntoEditor(sheet, syntax);
        }
      },
      cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel" }
    },
    render: html => {
      console.log("JLAS | Dialog rendered.");
      const search   = html.find("#jlas-search");
      const list     = html.find("#jlas-scene-list");
      const linkText = html.find("[name=linkText]");

      // Pre-fill link text from the initially selected scene
      const first = list.find("option:first");
      if (first.length) linkText.val(first.text());

      // Filter the scene list as the user types
      search.on("input", () => {
        const q = search.val().toLowerCase();
        list.find("option").each((_, o) => { o.hidden = !o.text.toLowerCase().includes(q); });
        const visible = list.find("option:not([hidden]):first");
        if (visible.length) { list.val(visible.val()); linkText.val(visible.text()); }
      });

      // Keep link text in sync when the selection changes
      list.on("change", () => {
        const sel = list.find("option:selected");
        if (sel.length) linkText.val(sel.text());
      });
    },
    default: "insert"
  }, { width: 420 }).render(true);
}

function _insertIntoEditor(sheet, text) {
  console.log("JLAS | _insertIntoEditor called. text:", text);
  console.log("JLAS | sheet.editors:", sheet.editors);

  let view;
  for (const [key, ed] of Object.entries(sheet.editors ?? {})) {
    console.log(`JLAS | Checking editor key "${key}":`, ed);
    console.log(`JLAS |   ed.instance:`, ed.instance);
    console.log(`JLAS |   ed.instance?.view:`, ed.instance?.view);
    if (ed.instance?.view) { view = ed.instance.view; break; }
  }

  if (!view) {
    console.error("JLAS | No ProseMirror view found. Full sheet.editors dump:", sheet.editors);
    ui.notifications.warn("JLAS | Editor not ready — make sure you are in edit mode.");
    return;
  }

  console.log("JLAS | Found ProseMirror view:", view);
  console.log("JLAS | Current selection:", view.state.selection);

  const { state, dispatch } = view;
  dispatch(state.tr.insertText(text));
  view.focus();
  console.log("JLAS | Text inserted.");
}
