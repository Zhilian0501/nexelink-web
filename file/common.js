// assets/js/navbar.js
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
});

// assets/js/common.js
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.float-up').forEach(el => observer.observe(el));
});

// assets/js/stars.js
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
let width, height;

const stars = [];
const meteors = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 初始化星星
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5,
    alpha: Math.random(),
    delta: Math.random() * 0.02
  });
}

// 每 2~5 秒產生一顆流星
function spawnMeteor() {
  meteors.push({
    x: Math.random() * width,
    y: Math.random() * height * 0.5,
    length: Math.random() * 80 + 50,
    speed: Math.random() * 5 + 5,
    opacity: 1
  });
  setTimeout(spawnMeteor, Math.random() * 3000 + 2000);
}
spawnMeteor();

function draw() {
  ctx.clearRect(0, 0, width, height);

  // 畫星星
  stars.forEach(s => {
    s.alpha += s.delta;
    if (s.alpha <= 0 || s.alpha >= 1) s.delta = -s.delta;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.fill();
  });

  // 畫流星
  for (let i = 0; i < meteors.length; i++) {
    const m = meteors[i];
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.length, m.y + m.length);
    ctx.strokeStyle = `rgba(255, 255, 255, ${m.opacity})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    m.x += m.speed * -1;
    m.y += m.speed;

    m.opacity -= 0.01;
    if (m.opacity <= 0) meteors.splice(i, 1);
  }

  requestAnimationFrame(draw);
}

draw();