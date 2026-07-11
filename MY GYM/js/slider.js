(function () {
  const track = document.querySelector("#testimonialTrack");
  const prev = document.querySelector("#prevTestimonial");
  const next = document.querySelector("#nextTestimonial");

  if (!track || !prev || !next) {
    return;
  }

  const slides = Array.from(track.children);
  let index = 0;
  let timer;

  const updateSlider = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  const move = (direction) => {
    index = (index + direction + slides.length) % slides.length;
    updateSlider();
  };

  const start = () => {
    timer = window.setInterval(() => move(1), 5000);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  prev.addEventListener("click", () => {
    move(-1);
    restart();
  });

  next.addEventListener("click", () => {
    move(1);
    restart();
  });

  start();
})();
