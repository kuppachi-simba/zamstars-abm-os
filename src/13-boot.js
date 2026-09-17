
/* ============================================================
   29. BOOT
   ============================================================ */
(function boot(){
  const restored = load();
  /* Research for the worked example. Only touches the shipped demo, and only
     when that account has none of its own, so it cannot overwrite real work. */
  try{ S.order.forEach(id=>seedIntel(S.clients[id])); }catch(e){}
  bindOnce();
  render();
  if(!restored){
    setTimeout(()=>toast('<b>ZAMSTARS ABM OS.</b> A worked example is loaded. <b>0</b> for the summary, <b>1</b> to <b>9</b> for the build stages, <b>D</b> for the dashboard, <b>P</b> for presenter notes.'),700);
  }
})();

/* Boot lives in the last source file on purpose. The whole app is one
   script block, so function declarations hoist, but const does not. Booting
   from the middle would render a screen whose taxonomies had not been
   evaluated yet, and fail in the temporal dead zone. */
