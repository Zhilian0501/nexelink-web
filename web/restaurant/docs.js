// 檢查清單的勾選存在這台裝置（localStorage）；目錄跟著捲動標示目前段落。
(function () {
  var boxes = document.querySelectorAll('input[type="checkbox"][data-key]');
  function store(k, v) { try { v ? localStorage.setItem("nx_doc_" + k, "1") : localStorage.removeItem("nx_doc_" + k); } catch (e) {} }
  function load(k) { try { return localStorage.getItem("nx_doc_" + k) === "1"; } catch (e) { return false; } }
  function progress() {
    var bar = document.getElementById("bar"), text = document.getElementById("progress-text");
    if (!bar) return;
    var done = 0; boxes.forEach(function (b) { if (b.checked) done++; });
    bar.style.width = (boxes.length ? done / boxes.length * 100 : 0) + "%";
    text.textContent = "已完成 " + done + " / " + boxes.length + " 項";
  }
  boxes.forEach(function (b) {
    b.checked = load(b.dataset.key);
    b.addEventListener("change", function () { store(b.dataset.key, b.checked); progress(); });
  });
  var reset = document.getElementById("reset");
  if (reset) reset.addEventListener("click", function () {
    if (!confirm("清除這份清單的所有勾選？")) return;
    boxes.forEach(function (b) { b.checked = false; store(b.dataset.key, false); });
    progress();
  });
  progress();
  var links = document.querySelectorAll(".toc a"), heads = document.querySelectorAll(".doc h2");
  if ("IntersectionObserver" in window && heads.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    heads.forEach(function (h) { io.observe(h); });
  }
})();
