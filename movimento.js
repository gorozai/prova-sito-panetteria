/* Forno Pietrafina · movimento (sesto giro, 24/11/2026). Scritto a mano, nessuna libreria.
   Se il visitatore chiede meno movimento (prefers-reduced-motion) non fa niente e il sito resta fermo e completo. */
(function () {
  var meno = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (meno.matches) return;
  var doc = document.documentElement;
  doc.classList.add("mv");
  var largo = window.matchMedia("(min-width: 56.01rem)");

  /* Titoli che si compongono: ogni parola sale da sotto la riga */
  document.querySelectorAll("[data-parole]").forEach(function (t) {
    var i = 0;
    Array.prototype.slice.call(t.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var pezzi = n.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        pezzi.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          var w = document.createElement("span"); w.className = "parola";
          var s = document.createElement("span"); s.textContent = p; s.style.setProperty("--i", i++);
          w.appendChild(s); frag.appendChild(w);
        });
        t.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        var w = document.createElement("span"); w.className = "parola";
        var s = document.createElement("span"); s.style.setProperty("--i", i++);
        t.replaceChild(w, n); s.appendChild(n); w.appendChild(s);
      }
    });
  });
  /* La parola enorme del piede sale lettera per lettera */
  document.querySelectorAll(".parolona").forEach(function (p) {
    var testo = p.textContent; p.textContent = "";
    testo.split("").forEach(function (c, i) { var s = document.createElement("span"); s.textContent = c; s.style.setProperty("--i", i); p.appendChild(s); });
  });

  /* Comparse allo scorrimento */
  var guarda = new IntersectionObserver(function (voci) {
    voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add("visto"); guarda.unobserve(v.target); } });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  document.querySelectorAll("[data-rivela],[data-maschera],[data-parole],.parolona").forEach(function (el) { guarda.observe(el); });

  /* Effetti legati allo scorrimento, calcolati una volta per fotogramma */
  var apertura = document.querySelector(".apertura");
  var parallassi = Array.prototype.slice.call(document.querySelectorAll("[data-parallasse]"));
  var pin = document.querySelector("[data-orizzontale]");
  var binario = pin && pin.querySelector(".binario");
  var avanza = pin && pin.querySelector(".avanzamento");
  var timbri = Array.prototype.slice.call(document.querySelectorAll(".timbro"));
  var spiga = document.querySelector(".spiga");
  var testata = document.querySelector(".testata");
  var fascia = document.querySelector(".fascia .scorre");
  var ultimoY = window.scrollY, velocita = 0, x = 0, verso = 1, inAttesa = false;

  function limita(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function scorri() {
    inAttesa = false;
    var y = window.scrollY, h = window.innerHeight;
    if (apertura) {
      var p = limita(y / Math.max(1, apertura.offsetHeight), 0, 1);
      apertura.style.setProperty("--p", p.toFixed(4));
    }
    parallassi.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > h + 100) return;
      var centro = (r.top + r.height / 2 - h / 2) / h;
      img.style.transform = "translate3d(0," + (centro * -parseFloat(img.dataset.parallasse) * 100).toFixed(2) + "%,0)";
    });
    if (pin && binario) {
      if (largo.matches) {
        var rp = pin.getBoundingClientRect();
        var corsa = pin.offsetHeight - h;
        var q = limita(-rp.top / Math.max(1, corsa), 0, 1);
        var distanza = binario.scrollWidth - window.innerWidth;
        binario.style.transform = "translate3d(" + (-q * distanza).toFixed(1) + "px,0,0)";
        if (avanza) avanza.style.setProperty("--avanza", q.toFixed(4));
      } else {
        binario.style.transform = "";
      }
    }
    timbri.forEach(function (t) { t.style.setProperty("--giro", (y * 0.12).toFixed(1) + "deg"); });
    if (spiga) {
      var rs = spiga.parentElement.getBoundingClientRect();
      spiga.style.setProperty("--ondeggia", (((rs.top + rs.height / 2) - h / 2) / h * 10).toFixed(2) + "deg");
    }
    if (testata) {
      if (y > ultimoY + 6 && y > 320) testata.classList.add("via");
      else if (y < ultimoY - 6) testata.classList.remove("via");
    }
    velocita = velocita * 0.6 + (y - ultimoY) * 0.4;
    if (Math.abs(y - ultimoY) > 1) verso = y > ultimoY ? 1 : -1;
    ultimoY = y;
  }
  function chiedi() { if (!inAttesa) { inAttesa = true; requestAnimationFrame(scorri); } }
  window.addEventListener("scroll", chiedi, { passive: true });
  window.addEventListener("resize", chiedi);
  scorri();

  /* La fascia scorre da sola e accelera, o cambia verso, con lo scorrimento della pagina */
  if (fascia) {
    var meta = 0;
    var misura = function () { meta = fascia.scrollWidth / 2; };
    misura(); window.addEventListener("resize", misura);
    (function giro() {
      velocita *= 0.92;
      x -= verso * (0.55 + Math.min(Math.abs(velocita), 60) * 0.18);
      if (meta) { if (x <= -meta) x += meta; if (x > 0) x -= meta; }
      fascia.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      requestAnimationFrame(giro);
    })();
  }
})();
