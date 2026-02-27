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
        const sections = document.querySelectorAll(".section");
        const sectionColors: (string | null)[] = new Array(sections.length).fill(null);
        
        const scrollGlowEl = document.getElementById("scrollGlow");
        const scrollContainer = document.getElementById("scrollContainer");

        let scrollTimeout: number | null = null;
        let isResting = false;
        
        const updateScrollGlow = () => {
          if (!scrollGlowEl || !scrollContainer) return;
          
          const scrollTop = scrollContainer.scrollTop;
          const height = window.innerHeight;
          const progress = scrollTop / height;
          const currentIndex = Math.floor(progress);
          const fraction = progress - currentIndex;

          let targetIndex = currentIndex + 1;

          // Clear any existing resting timeout because the user is moving
          if (scrollTimeout) {
            window.clearTimeout(scrollTimeout);
          }
          isResting = false;

          // If we are basically snapped to a section (fraction is very small)
          if (fraction < 0.05 || fraction > 0.95) {
            // Adjust currentIndex if we are at the very top edge of the next section
            const actualCurrentIndex = fraction > 0.95 ? currentIndex + 1 : currentIndex;
            targetIndex = actualCurrentIndex + 1;
            
            // Hide glow immediately while scrolling/snapping
            scrollGlowEl.style.opacity = '0';
            
            if (targetIndex < sections.length) {
                // Set a timer to show the glow after 3 seconds of resting
                scrollTimeout = window.setTimeout(() => {
                  const targetColor = sectionColors[targetIndex];
                  if (targetColor) {
                    const softColor = targetColor.replace('rgb', 'rgba').replace(')', ', 0.4)');
                    const softColorCenter = targetColor.replace('rgb', 'rgba').replace(')', ', 0.8)');
                    scrollGlowEl.style.background = `radial-gradient(ellipse at bottom, ${softColorCenter} 0%, ${softColor} 25%, transparent 45%)`;
                    scrollGlowEl.style.opacity = '1';
                  }
                }, 3000); // 3 second delay
            }
          } else {
             // We are actively scrolling between sections
             scrollGlowEl.style.opacity = '0';
          }
        };

        if (scrollContainer) {
          scrollContainer.addEventListener("scroll", () => {
            requestAnimationFrame(updateScrollGlow);
          });
          window.addEventListener("resize", () => {
            requestAnimationFrame(updateScrollGlow);
          });
        }

        const images = document.querySelectorAll("img.photo");

        images.forEach((el) => {
          const img = el as HTMLImageElement;
          const section = img.closest(".section");
          const index = Array.from(sections).indexOf(section as Element);

          // Wrap in closure to capture image
          const extractAndApply = () => {
            const color = getAverageColor(img);
            if (color) {
              // Store the color for the scroll glow
              if (index !== -1) {
                sectionColors[index] = color;
                // Force an update immediately so the initial glow shows up
                requestAnimationFrame(updateScrollGlow);
              }

              const bgContainer = img.closest(".image-container");
              if (bgContainer) {
                const glowEl = bgContainer.querySelector(".ambient-glow") as HTMLElement;
                if (glowEl) {
                  const softColor = color.replace('rgb', 'rgba').replace(')', ', 0.4)');
                  const softColorCenter = color.replace('rgb', 'rgba').replace(')', ', 0.8)');
                  glowEl.style.background = `radial-gradient(circle at center, ${softColorCenter} 0%, ${softColor} 25%, transparent 60%)`;
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
