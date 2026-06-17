document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const revealItems = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll(".filter-chip");
const projectCards = document.querySelectorAll(".project-card");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

let activeGallery = [];
let activeIndex = 0;

function padPageNumber(page) {
  return String(page).padStart(2, "0");
}

function buildGallery(projectName, pages) {
  return pages.map((page) => [
    `./assets/page-${padPageNumber(page)}.png`,
    `${projectName} - PDF 第 ${page} 页`
  ]);
}

const galleryMap = {
  pet: buildGallery("宠物智能胸背", [6, 7, 8, 9, 10, 11, 12]),
  metro: buildGallery("地铁隧道轨道式应急救援设备", [15, 16, 17, 18, 19, 20, 21, 22]),
  starfish: buildGallery("智能棘冠海星清洁设备", [25, 26, 27, 28, 29, 30, 31, 32]),
  gaitsense: buildGallery("智能跑步姿势反馈带", [34, 35, 36, 37, 38, 39, 40, 41]),
  oxypal: buildGallery("OxyPal 智能血氧监测与应急制氧套装", [43, 44, 45, 46, 47, 48, 49, 50])
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.18,
  rootMargin: "0px 0px -40px 0px"
});

revealItems.forEach((item) => observer.observe(item));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((chip) => chip.classList.toggle("is-active", chip === button));
    projectCards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !match);
    });
  });
});

function renderActiveSlide() {
  const [image, title] = activeGallery[activeIndex];
  lightboxImage.src = image;
  lightboxImage.alt = title;
  lightboxTitle.textContent = title;
  lightboxCounter.textContent = activeGallery.length > 1 ? `${activeIndex + 1} / ${activeGallery.length}` : "";
  lightboxPrev.disabled = activeGallery.length <= 1;
  lightboxNext.disabled = activeGallery.length <= 1;
}

function openLightbox(gallery, startIndex = 0) {
  if (!gallery || gallery.length === 0) return;
  activeGallery = gallery;
  activeIndex = startIndex;
  renderActiveSlide();
  if (!lightbox.open) {
    lightbox.showModal();
  }
}

function openSingle(image, title) {
  openLightbox([[image, title]], 0);
}

function moveSlide(step) {
  if (activeGallery.length <= 1) return;
  activeIndex = (activeIndex + step + activeGallery.length) % activeGallery.length;
  renderActiveSlide();
}

function renderProjectStrips() {
  document.querySelectorAll("[data-gallery-strip]").forEach((strip) => {
    const key = strip.dataset.galleryStrip;
    const gallery = galleryMap[key];

    if (!gallery || gallery.length === 0) return;

    const fragment = document.createDocumentFragment();

    gallery.forEach(([image, title], index) => {
      const pageNumber = image.match(/page-(\d+)\.png$/)?.[1] || String(index + 1);
      const button = document.createElement("button");
      const img = document.createElement("img");
      const badge = document.createElement("span");

      button.type = "button";
      button.className = "project-page";
      button.dataset.openGallery = key;
      button.dataset.galleryIndex = String(index);
      button.setAttribute("aria-label", title);

      img.src = image;
      img.alt = title;
      img.loading = "lazy";

      badge.className = "project-page-number";
      badge.textContent = pageNumber;

      button.append(img, badge);
      fragment.appendChild(button);
    });

    strip.appendChild(fragment);
  });
}

renderProjectStrips();

document.querySelectorAll("[data-open-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openSingle(trigger.dataset.image, trigger.dataset.title || "");
  });
});

document.querySelectorAll("[data-open-gallery]:not(.project-page)").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const gallery = galleryMap[trigger.dataset.openGallery];
    openLightbox(gallery, 0);
  });
});

document.querySelectorAll(".project-page").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const gallery = galleryMap[trigger.dataset.openGallery];
    const galleryIndex = Number(trigger.dataset.galleryIndex || 0);
    openLightbox(gallery, galleryIndex);
  });
});

document.querySelectorAll(".project-media").forEach((media) => {
  media.addEventListener("click", () => {
    const card = media.closest(".project-card");
    const strip = card?.querySelector("[data-gallery-strip]");
    const gallery = strip ? galleryMap[strip.dataset.galleryStrip] : null;
    openLightbox(gallery, 0);
  });
});

lightboxPrev.addEventListener("click", () => moveSlide(-1));
lightboxNext.addEventListener("click", () => moveSlide(1));

window.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowRight") moveSlide(1);
  if (event.key === "ArrowLeft") moveSlide(-1);
  if (event.key === "Escape") lightbox.close();
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 10;
    const rotateX = (0.5 - y) * 10;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });

  card.addEventListener("click", () => {
    openSingle(card.dataset.image, card.dataset.title || "");
  });
});
