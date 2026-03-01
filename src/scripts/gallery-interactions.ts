// 0. Scroll Indicator Logic
const setupScrollIndicator = () => {
  const indicator = document.getElementById("scrollIndicator");
  if (indicator) {
    indicator.addEventListener("click", () => {
      const container = document.getElementById("scrollContainer");
      if (container) {
        container.scrollBy({ top: window.innerHeight, behavior: "smooth" });
      }
    });
  }

  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      const container = document.getElementById("scrollContainer");
      if (container) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", setupScrollIndicator);

// 1. Keyboard Navigation Logic
document.addEventListener("keydown", (e) => {
  const container = document.getElementById("scrollContainer");
  if (!container) return;

  const height = window.innerHeight;

  if (e.key === "ArrowDown" || e.key === "PageDown") {
    e.preventDefault();
    container.scrollBy({ top: height, behavior: "smooth" });
  } else if (e.key === "ArrowUp" || e.key === "PageUp") {
    e.preventDefault();
    container.scrollBy({ top: -height, behavior: "smooth" });
  } else if (e.key === "Home") {
    e.preventDefault();
    container.scrollTo({ top: 0, behavior: "smooth" });
  } else if (e.key === "End") {
    e.preventDefault();
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }
});

// 2. Background Color Logic
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function processImageColors() {
  const sections = document.querySelectorAll(".section");
  const sectionColors: (string | null)[] = new Array(sections.length).fill(
    null,
  );

  const scrollContainer = document.getElementById("scrollContainer");

  const updateBackgroundColor = () => {
    if (!scrollContainer) return;

    const scrollTop = scrollContainer.scrollTop;
    const height = window.innerHeight;
    const progress = scrollTop / height;
    const currentIndex = Math.floor(progress);
    const fraction = progress - currentIndex;

    let targetIndex = currentIndex;
    if (fraction > 0.5) targetIndex = currentIndex + 1;

    if (targetIndex < sections.length) {
      const targetColor = sectionColors[targetIndex];
      if (targetColor) {
        document.body.style.backgroundColor = hexToRgba(targetColor, 0.20);
      } else {
        document.body.style.backgroundColor = "var(--bg-color)";
      }
    }
  };

  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", () => {
      requestAnimationFrame(updateBackgroundColor);
    });
    window.addEventListener("resize", () => {
      requestAnimationFrame(updateBackgroundColor);
    });
  }

  const images = document.querySelectorAll("img.photo");

  images.forEach((el) => {
    const img = el as HTMLImageElement;
    const section = img.closest(".section");
    const index = Array.from(sections).indexOf(section as Element);

    const extractAndApply = () => {
      const color = img.getAttribute("data-color");
      if (color) {
        // Store the color for the background
        if (index !== -1) {
          sectionColors[index] = color;
          // Force an update immediately so the initial background shows up
          requestAnimationFrame(updateBackgroundColor);

          // Preload up to 3 upcoming images to prevent layout shift / blank spaces
          for (let i = 1; i <= 3; i++) {
            const nextIndex = index + i;
            if (nextIndex < sections.length) {
              const nextImg = images[nextIndex] as HTMLImageElement;
              if (
                nextImg &&
                !nextImg.complete &&
                nextImg.getAttribute("data-preloaded") !== "true"
              ) {
                nextImg.setAttribute("data-preloaded", "true");
                nextImg.loading = "eager";
                nextImg.removeAttribute("loading"); // Force eager loading on Safari

                // Explicitly fetch the image into browser cache using a detached Image object
                const preloader = new Image();
                // Propagate crossOrigin so the cache matches the DOM image
                preloader.crossOrigin = nextImg.crossOrigin;
                preloader.src = nextImg.src;
              }
            }
          }
        }
      }
    };

    if (img.complete) {
      extractAndApply();
    } else {
      img.addEventListener("load", extractAndApply);
    }
  });
}

// 3. Randomize Info Board Placement
function randomizeInfoBoard() {
  let placements: boolean[] = [];
  try {
    const stored = sessionStorage.getItem("galleryInfoBoardPlacements");
    if (stored) {
      placements = JSON.parse(stored);
    }
  } catch (e) {
    // Ignore sessionStorage errors
  }

  const wrappers = document.querySelectorAll(".artwork-wrapper");
  let modified = false;

  wrappers.forEach((wrapper, index) => {
    // If we don't have a stored placement for this index, generate one
    if (typeof placements[index] !== "boolean") {
      placements[index] = Math.random() > 0.5;
      modified = true;
    }

    if (placements[index]) {
      wrapper.classList.add("right-side");
    }
  });

  if (modified) {
    try {
      sessionStorage.setItem(
        "galleryInfoBoardPlacements",
        JSON.stringify(placements),
      );
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  processImageColors();
  randomizeInfoBoard();
  initDownloadTracker();
});

// 4. Unsplash Download Tracker
function initDownloadTracker() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const downloadUrl = img.getAttribute("data-download-url");

          if (downloadUrl) {
            // Append our client_id or Access Key so Unsplash accepts the tracking ping
            // We use the public query param approach here since it's client-side
            const trackingUrl = new URL(downloadUrl);
            
            // In a real production app with a backend, this should ideally be routed
            // through your server to hide the Access Key, but for a static Astro site 
            // without SSR, hitting the tracking url directly is the standard approach.
            // Note: We don't append the key here if it's already in the URL from the build step,
            // but Unsplash's links.download_location usually requires it.
            // Since exposing the secret key on client-side is bad, we rely on the fact 
            // that the build step could have baked it in, OR we just hit the endpoint 
            // and accept that Unsplash's tracking might be best-effort on purely static sites.
            
            fetch(trackingUrl.toString(), { method: 'GET', mode: 'no-cors' })
                .catch(e => console.error("Download tracking ping failed", e));
            
            // Remove the attribute so we only track the "download/view" once per session
            img.removeAttribute("data-download-url");
            observer.unobserve(img);
          }
        }
      });
    },
    {
      root: document.getElementById("scrollContainer"),
      threshold: 0.5, // Trigger when image is at least 50% visible
    }
  );

  document.querySelectorAll("img[data-download-url]").forEach((img) => {
    observer.observe(img);
  });
}
