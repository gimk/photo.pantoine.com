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

      // 2. Average Color Extraction Logic
      function getAverageColor(imgElement: HTMLImageElement) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return null;

        // Scale down for performance
        const width = (canvas.width = 100);
        const height = (canvas.height = 100);

        context.drawImage(imgElement, 0, 0, width, height);

        let data;
        try {
          data = context.getImageData(0, 0, width, height).data;
        } catch (e) {
          // If cross-origin fails, silently abort
          console.error("Could not extract image data (CORS):", e);
          return null;
        }

        let r = 0,
          g = 0,
          b = 0;
        const length = data.length;
        let count = 0;

        for (let i = 0; i < length; i += 4) {
          // Skip highly transparent pixels
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        if (count === 0) return null;

        // Calculate average and round
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        return `rgb(${r}, ${g}, ${b})`;
      }

      function processImageColors() {
        const images = document.querySelectorAll("img.photo");

        images.forEach((el) => {
          const img = el as HTMLImageElement;
          // Wrap in closure to capture image
          const extractAndApply = () => {
            const color = getAverageColor(img);
            if (color) {
              const bgContainer = img.closest(".image-container");
              if (bgContainer) {
                const glowEl = bgContainer.querySelector(".ambient-glow") as HTMLElement;
                if (glowEl) {
                  glowEl.style.background = `radial-gradient(circle at center, ${color} 0%, transparent 60%)`;
                  glowEl.classList.add("active");
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

      // Run when DOM is ready
      document.addEventListener("DOMContentLoaded", processImageColors);
