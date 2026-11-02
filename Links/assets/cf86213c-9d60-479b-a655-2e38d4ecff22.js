function DZ_EDITOR(){
  if (window.__dzEditor) return; window.__dzEditor = true;
  var STAMP = document.documentElement.getAttribute('data-dz-stamp') || 'dc';
  var KEY = 'dossier-vision-ia-editor:' + STAMP;
  function hash(s){ var x = 5381; for (var i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return (x >>> 0).toString(36); }
  var G = '#a91831', N = '#202221';
  var editing = false, sel = null, dp = null, saveT = null;

  var css = ''
  + '.dz-bar{position:fixed;left:0;right:0;margin:0 auto;width:max-content;bottom:16px;z-index:9999;display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;background:'+N+';padding:8px;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.45);font:600 12px/1 "Space Mono",ui-monospace,monospace;max-width:96vw}'
  + '.dz-bar button{background:#353736;color:#fff;border:0;border-radius:4px;padding:9px 11px;cursor:pointer;font:inherit;letter-spacing:.02em;white-space:nowrap}'
  + '.dz-bar button:hover{background:#4a4c4b}.dz-bar button.on,.dz-bar button.dz-primary{background:'+G+'}.dz-bar button.on:hover,.dz-bar button.dz-primary:hover{background:#c22a45}'
  + '.dz-bar button:disabled{opacity:.3;cursor:default}.dz-bar .dz-sep{width:1px;height:24px;background:#555;margin:0 2px}'
  + '.dz-bar .dz-status{color:#dee5ec;font-weight:400;padding:0 6px;min-width:90px;text-align:center}'
  + '.dz-editing section.page *:hover{outline:1px dashed rgba(255,77,94,.7);outline-offset:1px}'
  + '.dz-editing section.page{cursor:text}'
  + '.dz-sel{outline:2px solid #ff4d5e!important;outline-offset:2px!important}'
  + '.dz-pagectl{position:absolute;top:10px;right:10px;z-index:80;display:none;gap:4px;font:600 12px/1 "Space Mono",monospace}'
  + '.dz-editing .dz-pagectl{display:flex}'
  + '.dz-pagectl button{background:#fff;color:'+N+';border:1px solid '+N+';border-radius:3px;padding:6px 8px;cursor:pointer;font:inherit}'
  + '.dz-pagectl button:hover{background:'+G+';color:#fff;border-color:'+G+'}'
  + '.dz-pagectl *:hover{outline:none!important}'
  + '.dz-doc{display:flex;flex-direction:column;align-items:center;gap:28px;padding:28px 0 140px}'
  + '.dz-doc>section.page{width:210mm;height:297mm;flex:none;box-shadow:0 4px 30px rgba(0,0,0,.4)}'
  + '@page{size:A4;margin:0}'
  + '@media print{.dz-bar,.dz-pagectl,.no-print{display:none!important}.dz-sel{outline:none!important}body{background:none!important}.dz-doc{display:block;padding:0}.dz-doc>section.page{box-shadow:none;break-after:page}}';

  function boot(){
    dp = document.querySelector('doc-page') || document.querySelector('.dz-doc');
    if (!dp || !dp.querySelector('section.page')) return setTimeout(boot, 250);
    var st = document.createElement('style'); st.id = 'dz-style'; st.textContent = css; document.head.appendChild(st);
    KEY = KEY + ':' + hash(cleanHTML());
    restore(); buildBar(); decorate();
    dp.addEventListener('click', onClick, true);
    dp.addEventListener('input', autosave);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') select(null); });
      }

  function pages(){ return Array.prototype.slice.call(dp.querySelectorAll(':scope > section.page')); }
  function remeasure(){ if (dp._scheduleMeasure) dp._scheduleMeasure(); }

  function decorate(){
    pages().forEach(function(p){
      if (p.querySelector(':scope > .dz-pagectl')) return;
      var c = document.createElement('div'); c.className = 'dz-pagectl no-print'; c.setAttribute('contenteditable','false');
      [['↑','Subir página','up'],['↓','Bajar página','down'],['⧉','Duplicar página','dup'],['✕','Eliminar página','del']].forEach(function(b){
        var bt = document.createElement('button'); bt.type='button'; bt.textContent=b[0]; bt.title=b[1];
        bt.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); pageOp(p, b[2]); });
        c.appendChild(bt);
      });
      p.appendChild(c);
    });
  }

  function pageOp(p, op){
    if (op === 'up' && p.previousElementSibling) p.parentNode.insertBefore(p, p.previousElementSibling);
    if (op === 'down' && p.nextElementSibling) p.parentNode.insertBefore(p.nextElementSibling, p);
    if (op === 'dup'){ var c = p.cloneNode(true); c.removeAttribute('id'); c.querySelectorAll('.dz-pagectl').forEach(function(x){x.remove()}); p.after(c); decorate(); applyEditable(); }
    if (op === 'del'){ if (pages().length <= 1) return; if (!confirm('¿Eliminar esta página?')) return; if (sel && p.contains(sel)) select(null); p.remove(); }
    remeasure(); save();
  }

  function applyEditable(){
    pages().forEach(function(p){ if (editing) p.setAttribute('contenteditable','true'); else p.removeAttribute('contenteditable'); });
    document.documentElement.classList.toggle('dz-editing', editing);
  }

  function onClick(e){
    if (!editing) return;
    if (e.target.closest('.dz-pagectl')) return;
    var a = e.target.closest('a'); if (a) e.preventDefault();
    var t = e.target.closest('section.page *');
    if (t) select(t);
  }

  function select(el){
    if (sel) sel.classList.remove('dz-sel');
    sel = el; if (sel) sel.classList.add('dz-sel');
    refreshBar();
  }

  function imgTarget(el){
    for (var n = el; n && n !== dp; n = n.parentElement){
      if (n.tagName === 'IMG') return n;
      var bg = getComputedStyle(n).backgroundImage;
      if (bg && bg.indexOf('url(') > -1) return n;
      if (n.matches && n.matches('section.page')) break;
    }
    var pg = el && el.closest('section.page');
    if (pg){ var all = pg.querySelectorAll('*'); for (var i=0;i<all.length;i++){ var b = getComputedStyle(all[i]).backgroundImage; if (all[i].tagName==='IMG' || (b && b.indexOf('url(')>-1)) { var r1=all[i].getBoundingClientRect(), r2=el.getBoundingClientRect(); if (r1.left<=r2.left+1&&r1.top<=r2.top+1&&r1.right>=r2.right-1&&r1.bottom>=r2.bottom-1) return all[i]; } } }
    return null;
  }

  function pickFile(cb){
    var i = document.createElement('input'); i.type='file'; i.accept='image/*';
    i.onchange = function(){ var f = i.files[0]; if (!f) return; var r = new FileReader(); r.onload = function(){ cb(r.result); }; r.readAsDataURL(f); };
    i.click();
  }

  function replaceImage(){
    var t = sel && imgTarget(sel); if (!t) return status('Selecciona una imagen');
    pickFile(function(data){
      if (t.tagName === 'IMG'){ t.src = data; }
      else {
        var s = t.getAttribute('style') || '';
        if (/url\(/.test(s)) t.setAttribute('style', s.replace(/url\((['"]?)[^)'"]*\1\)/, 'url("'+data+'")'));
        else t.style.backgroundImage = 'url("'+data+'")';
      }
      save(); status('Imagen cambiada');
    });
  }

  function insertImage(){
    var ref = sel || (pages()[0]);
    pickFile(function(data){
      var img = document.createElement('img'); img.src = data; img.alt = '';
      img.setAttribute('style','display:block;width:100%;max-height:60cqw;object-fit:cover;border-radius:.3cqw;margin-top:2cqw');
      if (ref.matches('section.page')) ref.insertBefore(img, ref.querySelector('.dz-pagectl')); else ref.after(img);
      select(img); save(); status('Imagen añadida');
    });
  }

  function dupEl(){ if (!sel || sel.matches('section.page')) return; var c = sel.cloneNode(true); c.classList.remove('dz-sel'); sel.after(c); select(c); save(); }
  function delEl(){ if (!sel || sel.matches('section.page')) return; var n = sel; select(null); n.remove(); save(); status('Elemento eliminado'); }
  function parentEl(){ if (sel && sel.parentElement && !sel.parentElement.matches('section.page')) select(sel.parentElement); }

  function currentPage(){ return (sel && sel.closest('section.page')) || pages()[pages().length-1]; }
  var PG = 'position:relative;overflow:hidden;color:'+N+';font-family:Inter,sans-serif;container-type:size;display:flex;flex-direction:column;padding:8cqw;box-sizing:border-box;';
  var LAB = 'font-family:\'Space Mono\',monospace;font-size:1.8cqw;letter-spacing:.15cqw;text-transform:uppercase;color:'+G;
  var TIT = 'font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:13cqw;line-height:.88;margin-top:1cqw';
  function addPage(kind){
    var s = document.createElement('section'); s.className = 'page'; s.setAttribute('data-screen-label','Nueva página');
    if (kind === 'img'){
      s.setAttribute('style', PG + 'background:'+G+';color:#fff');
      s.innerHTML = '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(169,24,49,.1) 30%,rgba(32,34,33,.85) 100%),url(&quot;\'\'&quot;) center/cover no-repeat,#a91831"></div>'
        + '<div style="position:relative;margin-top:auto"><div style="'+LAB.replace(G,'#fff')+'">Etiqueta</div><div style="'+TIT+'">TÍTULO DE LA PÁGINA</div>'
        + '<div style="font-family:\'Space Mono\',monospace;font-style:italic;font-size:4cqw;margin-top:1cqw">Subtítulo en cursiva</div></div>';
    } else {
      s.setAttribute('style', PG + 'background:#fff');
      s.innerHTML = '<div style="'+LAB+'">Etiqueta</div><div style="'+TIT+'">TÍTULO DE LA PÁGINA</div>'
        + '<div style="font-family:\'Space Mono\',monospace;font-style:italic;font-size:5cqw;letter-spacing:-.3cqw">subtítulo en cursiva</div>'
        + '<div style="font-weight:300;font-size:2.4cqw;line-height:1.6;margin-top:5cqw;max-width:72cqw">Escribe aquí el texto de la página. Haz clic en cualquier texto para editarlo.</div>';
    }
    currentPage().after(s); decorate(); applyEditable(); remeasure(); save();
    var top = s.getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({top: top, behavior: 'smooth'});
    if (kind === 'img'){ select(s.firstElementChild); status('Pulsa “Cambiar imagen”'); }
  }

  function cleanHTML(){
    var c = dp.cloneNode(true);
    c.querySelectorAll('.dz-pagectl').forEach(function(x){x.remove()});
    c.querySelectorAll('[contenteditable]').forEach(function(x){x.removeAttribute('contenteditable')});
    c.querySelectorAll('.dz-sel').forEach(function(x){x.classList.remove('dz-sel')});
    c.querySelectorAll('[data-dc-tpl]').forEach(function(x){x.removeAttribute('data-dc-tpl')});
    return c.innerHTML;
  }
  function save(){
    try { localStorage.setItem(KEY, cleanHTML()); status('Guardado ✓'); }
    catch(e){ status('Sin espacio: descarga el HTML'); }
  }
  function autosave(){ clearTimeout(saveT); status('Editando…'); saveT = setTimeout(save, 800); }
  function restore(){
    var s = null; try { s = localStorage.getItem(KEY); } catch(e){}
    if (s){ dp.innerHTML = s; remeasure(); }
  }
  function reset(){
    if (!confirm('¿Descartar todos los cambios guardados en este navegador?')) return;
    try { localStorage.removeItem(KEY); } catch(e){}
    location.reload();
  }

  function toData(url){
    return fetch(url).then(function(r){ return r.blob(); }).then(function(b){
      return new Promise(function(res){ var fr = new FileReader(); fr.onload = function(){ res(fr.result); }; fr.readAsDataURL(b); });
    }).catch(function(){ return url; });
  }
  function download(){
    status('Preparando…');
    var html = cleanHTML();
    var urls = {}; var re = /url\((?:&quot;|["'])?([^)"'&]+)(?:&quot;|["'])?\)|src="([^"]+)"/g, m;
    while ((m = re.exec(html))){ var u = m[1] || m[2]; if (u && u.indexOf('data:') !== 0) urls[u] = 1; }
    var list = Object.keys(urls);
    Promise.all(list.map(function(u){ return toData(new URL(u, location.href).href).then(function(d){ return [u, d]; }); })).then(function(pairs){
      pairs.forEach(function(p){ html = html.split(p[0]).join(p[1]); });
      var stamp = 'f' + Date.now();
      var out = '<!DOCTYPE html>\n<html lang="es" data-dz-stamp="'+stamp+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dossier Visión IA · ENAE</title>'
        + '<link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Barlow+Condensed:wght@500;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">'
        + '<style>body{margin:0;background:#2a2627}a{color:inherit}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>'
        + '<div class="dz-doc">' + html + '</div>'
        + '<script>(' + DZ_EDITOR.toString() + ')();<\/script></body></html>';
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([out], {type:'text/html'}));
      a.download = 'Dossier Vision IA - editable.html'; document.body.appendChild(a); a.click(); a.remove();
      status('HTML descargado');
    });
  }

  var bar, stEl, btn = {};
  function mk(label, fn, cls, title){ var b = document.createElement('button'); b.type='button'; b.textContent = label; if (cls) b.className = cls; if (title) b.title = title; b.addEventListener('click', function(e){ e.preventDefault(); fn(); }); bar.appendChild(b); return b; }
  function sep(){ var s = document.createElement('span'); s.className = 'dz-sep'; bar.appendChild(s); }
  function buildBar(){
    bar = document.createElement('div'); bar.className = 'dz-bar no-print';
    btn.edit = mk('✎ Editar', toggle, '', 'Activar edición: clic en textos para escribir, clic en elementos para seleccionarlos');
    sep();
    btn.addT = mk('+ Página texto', function(){ addPage('txt'); });
    btn.addI = mk('+ Página imagen', function(){ addPage('img'); });
    sep();
    btn.img = mk('↺ Cambiar imagen', replaceImage, '', 'Sube una foto para la imagen seleccionada');
    btn.ins = mk('+ Insertar foto', insertImage, '', 'Añade una foto después del elemento seleccionado');
    btn.dup = mk('⧉ Duplicar', dupEl);
    btn.del = mk('✕ Quitar', delEl);
    btn.par = mk('⬑ Bloque padre', parentEl, '', 'Seleccionar el contenedor del elemento');
    sep();
    var box = document.querySelector('#dz-contacto');
    if (box){
      var sl = document.createElement('select'); sl.title = 'Persona de contacto (no aparece en el PDF)';
      sl.style.cssText = 'background:#353736;color:#fff;border:0;border-radius:4px;padding:8px;font:inherit;cursor:pointer';
      box.querySelectorAll('[data-contact]').forEach(function(c){ var o = document.createElement('option'); o.value = c.getAttribute('data-contact'); o.textContent = 'Contacto: ' + (c.querySelector('div > div > div:first-child') || c).textContent.trim(); if (c.style.display !== 'none') o.selected = true; sl.appendChild(o); });
      sl.addEventListener('change', function(){ document.querySelectorAll('#dz-contacto [data-contact]').forEach(function(c){ c.style.display = c.getAttribute('data-contact') === sl.value ? 'grid' : 'none'; }); save(); });
      bar.appendChild(sl); sep();
    }
    stEl = document.createElement('span'); stEl.className = 'dz-status'; bar.appendChild(stEl);
    mk('↺ Restablecer', reset, '', 'Volver al dossier original');
    mk('↓ Descargar HTML', download, '', 'Descarga una copia editable con tus cambios');
    mk('↓ Exportar PDF', function(){ select(null); window.print(); }, 'dz-primary');
    document.body.appendChild(bar);
    refreshBar(); status(localStorage.getItem(KEY) ? 'Cambios cargados' : '');
  }
  function refreshBar(){
    if (!bar) return;
    btn.edit.classList.toggle('on', editing); btn.edit.textContent = editing ? '✓ Editando' : '✎ Editar';
    var s = editing && !!sel, notPage = s && !sel.matches('section.page');
    btn.addT.disabled = btn.addI.disabled = !editing;
    btn.img.disabled = !(s && imgTarget(sel)); btn.ins.disabled = !editing;
    btn.dup.disabled = btn.del.disabled = !notPage;
    btn.par.disabled = !(notPage && sel.parentElement && !sel.parentElement.matches('section.page'));
  }
  function toggle(){ editing = !editing; if (!editing) select(null); applyEditable(); refreshBar(); status(editing ? 'Clic para editar' : ''); }
  function status(t){ if (stEl) stEl.textContent = t || ''; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
}
DZ_EDITOR();
