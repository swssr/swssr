<script>
  import { createEventDispatcher } from 'svelte';

  export let t;

  const dispatch = createEventDispatcher();
  const set = (patch) => dispatch('update', patch);

  const updateProject = (i, patch) => {
    const projects = t.projects.map((p, idx) => idx === i ? { ...p, ...patch } : p);
    set({ projects });
  };

  const addProject = () => {
    const n = String(t.projects.length + 1).padStart(2, '0');
    const step = 360 / (t.projects.length + 1);
    const next = t.projects.map((p, i) => ({ ...p, angle: Math.round(-70 + i * step) }));
    next.push({ n, title: 'New project', tag: 'TAG', year: "'26", angle: Math.round(-70 + t.projects.length * step), color: '#0B1733', video: '', shape: 'torus', href: '', previewImage: '' });
    set({ projects: next });
  };

  const delProject = (i) => set({ projects: t.projects.filter((_, idx) => idx !== i) });

  const shapes = ['torus', 'box', 'ico', 'cylinder', 'octa', 'knot'];
</script>

<div class="tweaks">
  <div class="tweaks-head">
    <span>TWEAKS</span>
    <button on:click={() => dispatch('close')} class="close-btn">×</button>
  </div>
  <div class="tweaks-body">

    <div class="tw-group">
      <div class="tw-group-title">Header</div>
      <div class="tw-row">
        <div class="tw-label">Brand</div>
        <input class="tw-input" value={t.brand} on:input={e => set({ brand: e.target.value })} />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px">
        <input class="tw-input" value={t.navIndex}   on:input={e => set({ navIndex: e.target.value })} />
        <input class="tw-input" value={t.navWork}    on:input={e => set({ navWork: e.target.value })} />
        <input class="tw-input" value={t.navWriting} on:input={e => set({ navWriting: e.target.value })} />
        <input class="tw-input" value={t.navContact} on:input={e => set({ navContact: e.target.value })} />
      </div>
      <div style="height:6px" />
      <div class="tw-row">
        <div class="tw-label">Revision</div>
        <input class="tw-input" value={t.rev} on:input={e => set({ rev: e.target.value })} />
      </div>
    </div>

    <div class="tw-group">
      <div class="tw-group-title">About (left)</div>
      <div class="tw-row">
        <div class="tw-label">Eyebrow</div>
        <input class="tw-input" value={t.aboutLabel} on:input={e => set({ aboutLabel: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">Headline</div>
        <textarea class="tw-textarea" value={t.aboutTitle} on:input={e => set({ aboutTitle: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">Body</div>
        <textarea class="tw-textarea" value={t.aboutBody} on:input={e => set({ aboutBody: e.target.value })} />
      </div>
    </div>

    <div class="tw-group">
      <div class="tw-group-title">Availability (right)</div>
      <div class="tw-row">
        <div class="tw-label">Status</div>
        <input class="tw-input" value={t.availLabel} on:input={e => set({ availLabel: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">Body</div>
        <textarea class="tw-textarea" value={t.availBody} on:input={e => set({ availBody: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">CTA label</div>
        <input class="tw-input" value={t.ctaLabel} on:input={e => set({ ctaLabel: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">CTA link</div>
        <input class="tw-input" value={t.ctaHref} on:input={e => set({ ctaHref: e.target.value })} />
      </div>
    </div>

    <div class="tw-group">
      <div class="tw-group-title">Center statement</div>
      <div class="tw-row">
        <div class="tw-label">Eyebrow</div>
        <input class="tw-input" value={t.centerEyebrow} on:input={e => set({ centerEyebrow: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">Line 1</div>
        <input class="tw-input" value={t.centerLine1} on:input={e => set({ centerLine1: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">Line 2</div>
        <input class="tw-input" value={t.centerLine2} on:input={e => set({ centerLine2: e.target.value })} />
      </div>
    </div>

    <div class="tw-group">
      <div class="tw-group-title">Projects (orbit)</div>
      {#each t.projects as p, i}
        <div class="tw-project">
          <div class="tw-project-head">
            <span style="color:#6D7FB3">#{p.n}</span>
            <button class="tw-del" on:click={() => delProject(i)}>delete</button>
          </div>
          <input class="tw-input" value={p.title} on:input={e => updateProject(i, { title: e.target.value })} style="margin-bottom:4px" placeholder="Title" />
          <div style="display:grid;grid-template-columns:1fr 60px 50px;gap:4px;margin-bottom:4px">
            <input class="tw-input" value={p.tag}   on:input={e => updateProject(i, { tag: e.target.value })} placeholder="Tag" />
            <input class="tw-input" value={p.year}  on:input={e => updateProject(i, { year: e.target.value })} placeholder="Year" />
            <input class="tw-input" type="number" value={p.angle} on:input={e => updateProject(i, { angle: +e.target.value })} placeholder="°" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 30px;gap:4px;margin-bottom:4px">
            <input class="tw-input" value={p.color} on:input={e => updateProject(i, { color: e.target.value })} placeholder="Color" />
            <input type="color" value={p.color} on:input={e => updateProject(i, { color: e.target.value })} style="width:100%;height:26px;background:transparent;border:1px solid rgba(255,255,255,0.12);padding:0;cursor:pointer" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 90px;gap:4px;margin-bottom:4px">
            <input class="tw-input" value={p.video || ''} on:input={e => updateProject(i, { video: e.target.value })} placeholder="Video URL (mp4)" />
            <select class="tw-input" value={p.shape || 'torus'} on:change={e => updateProject(i, { shape: e.target.value })} style="background:#0B1733;color:#E9EEFB">
              {#each shapes as s}
                <option value={s}>{s}</option>
              {/each}
            </select>
          </div>
          <input class="tw-input" value={p.href || ''} on:input={e => updateProject(i, { href: e.target.value })} placeholder="Project URL" />
          <input class="tw-input" value={p.previewImage || ''} on:input={e => updateProject(i, { previewImage: e.target.value })} placeholder="Preview image URL (optional; else iframe)" style="margin-top:4px" />
        </div>
      {/each}
      <button class="tw-add" on:click={addProject}>+ ADD PROJECT</button>
    </div>

    <div class="tw-group">
      <div class="tw-group-title">Footer</div>
      <div class="tw-row">
        <div class="tw-label">Copyright</div>
        <input class="tw-input" value={t.footerCopyright} on:input={e => set({ footerCopyright: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">Idle text</div>
        <input class="tw-input" value={t.footerIdle} on:input={e => set({ footerIdle: e.target.value })} />
      </div>
      <div class="tw-row">
        <div class="tw-label">Links (Label|href; …)</div>
        <textarea class="tw-textarea" value={t.footerLinks} on:input={e => set({ footerLinks: e.target.value })} />
      </div>
    </div>

  </div>
</div>

<style>
  .tweaks {
    position: fixed; right: 20px; bottom: 20px;
    width: 340px; max-height: calc(100vh - 40px);
    background: #0B1733; color: #E9EEFB;
    border-radius: 4px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    z-index: 1000;
    overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  }
  .tweaks-head {
    padding: 12px 14px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    letter-spacing: 0.18em; text-transform: uppercase;
  }
  .close-btn {
    background: transparent; border: none; color: #E9EEFB;
    cursor: pointer; font-size: 14px; padding: 0 4px;
  }
  .tweaks-body { overflow-y: auto; padding: 12px 14px; flex: 1; }
  .tw-group { margin-bottom: 14px; }
  .tw-group-title {
    font-size: 9px; letter-spacing: 0.2em; color: #6D7FB3;
    margin-bottom: 8px; text-transform: uppercase;
  }
  .tw-row { margin-bottom: 8px; }
  .tw-label {
    font-size: 9px; letter-spacing: 0.14em; color: #8E9AB8;
    margin-bottom: 3px; text-transform: uppercase;
  }
  :global(.tw-input), .tw-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    color: #E9EEFB;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px; padding: 6px 8px; border-radius: 2px; outline: none;
  }
  .tw-textarea {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    color: #E9EEFB;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px; padding: 6px 8px; border-radius: 2px; outline: none;
    resize: vertical; min-height: 52px;
  }
  .tw-input:focus, .tw-textarea:focus { border-color: #FF5722; }
  .tw-project {
    border: 1px solid rgba(255,255,255,0.08);
    padding: 8px; margin-bottom: 6px; border-radius: 2px;
  }
  .tw-project-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
  }
  .tw-del {
    background: transparent; border: none; color: #8E9AB8;
    cursor: pointer; font-size: 10px; padding: 2px 4px;
  }
  .tw-del:hover { color: #FF5722; }
  .tw-add {
    width: 100%; background: transparent;
    border: 1px dashed rgba(255,255,255,0.2); color: #E9EEFB;
    padding: 6px; font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px; letter-spacing: 0.14em; cursor: pointer; text-transform: uppercase;
  }
  .tw-add:hover { border-color: #FF5722; color: #FF5722; }
</style>
