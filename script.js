
      /* ─── Cursor ─── */
      const dot = document.getElementById("cursorDot");
      const ring = document.getElementById("cursorRing");
      let mx = 0,
        my = 0,
        rx = 0,
        ry = 0;
      document.addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
      });
      function animRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
        requestAnimationFrame(animRing);
      }
      animRing();
      document.querySelectorAll("a,button").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          ring.style.transform = "translate(-50%,-50%) scale(1.8)";
          ring.style.borderColor = "rgba(232,160,32,.7)";
        });
        el.addEventListener("mouseleave", () => {
          ring.style.transform = "translate(-50%,-50%) scale(1)";
          ring.style.borderColor = "rgba(232,160,32,.4)";
        });
      });

      /* ─── Scroll Reveal ─── */
      const reveals = document.querySelectorAll(".reveal");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              observer.unobserve(e.target); // fire only once
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
      );
      reveals.forEach((r) => observer.observe(r));

      /* ─── Back to Top ─── */
      const bt = document.getElementById("backTop");
      window.addEventListener("scroll", () => {
        bt.classList.toggle("visible", window.scrollY > 400);
      });

      /* ─── Mobile Menu ─── */
      const menuBtn = document.getElementById("menuBtn");
      const mobileMenu = document.getElementById("mobileMenu");
      menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
        menuBtn.textContent = mobileMenu.classList.contains("open")
          ? "✕"
          : "☰";
      });
      function closeMobileMenu() {
        mobileMenu.classList.remove("open");
        menuBtn.textContent = "☰";
      }

      /* ─── Contribution Graph ─── */
      (function buildGraph() {
        const container = document.getElementById("contribGraph");
        if (!container) return;
        const levels = [0, 1, 2, 3, 4];
        const weights = [0.45, 0.25, 0.15, 0.1, 0.05];
        let html = "";
        for (let i = 0; i < 52 * 7; i++) {
          const rand = Math.random();
          let cum = 0,
            level = 0;
          for (let j = 0; j < weights.length; j++) {
            cum += weights[j];
            if (rand < cum) {
              level = levels[j];
              break;
            }
          }
          html += `<div class="contrib-cell${level > 0 ? " l" + level : ""}"></div>`;
        }
        container.innerHTML = html;
      })();

      /* ─── Skill Bar Animation ─── */
      // Set CSS custom properties for bar widths
      document.querySelectorAll(".skill-bar-fill").forEach((bar) => {
        const w = bar.style.width || "0%";
        bar.style.setProperty("--bar-target", w);
        bar.style.setProperty("--bar-width", "0%");
        bar.style.width = null; // remove inline width, use CSS var
      });
      const skillSection = document.getElementById("skills");
      const skillObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              document.querySelectorAll(".skill-bar-fill").forEach((bar, i) => {
                setTimeout(() => bar.classList.add("animate"), i * 80);
              });
              skillObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      if (skillSection) skillObserver.observe(skillSection);

      /* ─── Project Filter ─── */
      const filterMap = {
        "All Projects": null,
        "Desktop": "desktop",
        "Web App": "web",
        "AI / ML": "ai",
        "Full-Stack": "fullstack",
      };
      // Tag project cards with data-categories
      document.querySelectorAll(".project-card").forEach((card) => {
        const tags = [...card.querySelectorAll(".project-tag-type")].map(t => t.textContent.trim().toLowerCase());
        let cats = [];
        if (tags.some(t => t.includes("desktop"))) cats.push("desktop");
        if (tags.some(t => t.includes("web") || t.includes("3d"))) cats.push("web");
        if (tags.some(t => t.includes("ai") || t.includes("ml") || t.includes("cv"))) cats.push("ai");
        if (tags.some(t => t.includes("full"))) cats.push("fullstack");
        card.dataset.cats = cats.join(",");
      });
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
          this.classList.add("active");
          const cat = filterMap[this.textContent.trim()];
          document.querySelectorAll(".project-card").forEach((card) => {
            if (!cat || card.dataset.cats.split(",").includes(cat)) {
              card.classList.remove("hidden");
              card.classList.add("fade-in");
              setTimeout(() => card.classList.remove("fade-in"), 500);
            } else {
              card.classList.add("hidden");
            }
          });
        });
      });

      /* ─── Contact Form — FormSubmit AJAX with hash (no activation, works everywhere) ─── */
      (function initContactForm() {
        const form       = document.getElementById("contactForm");
        const btn        = document.getElementById("formSubmitBtn");
        const btnText    = document.getElementById("formBtnText");
        const btnSpinner = document.getElementById("formBtnSpinner");
        const validation = document.getElementById("formValidation");

        // FormSubmit hash endpoint — already tied to yogeshsankranthi131@gmail.com
        const ENDPOINT = "https://formsubmit.co/ajax/2c0c0711c4e30b95856ffb231633816a";

        form.addEventListener("submit", async function (e) {
          e.preventDefault();

          const name    = document.getElementById("fc-name").value.trim();
          const email   = document.getElementById("fc-email").value.trim();
          const subject = document.getElementById("fc-subject").value.trim();
          const message = document.getElementById("fc-message").value.trim();

          // Client-side validation
          if (!name || !email || !message) {
            validation.style.display = "block";
            const firstEmpty = !name ? "fc-name" : !email ? "fc-email" : "fc-message";
            document.getElementById(firstEmpty).focus();
            return;
          }
          validation.style.display = "none";

          // Loading state
          btn.disabled = true;
          btnText.style.display = "none";
          btnSpinner.style.display = "inline";
          btn.style.opacity = "0.75";

          try {
            const payload = {
              name,
              email,
              subject: subject || "New message from Portfolio",
              message,
              _subject: "\u2709\ufe0f New Portfolio Message from " + name,
              _template: "box",
              _captcha: "false",
              _autoresponse: "Hi " + name + "! \ud83d\ude4f Thanks for reaching out. Yogesh received your message and will reply within 24 hours."
            };

            const res = await fetch(ENDPOINT, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (res.ok && (json.success === "true" || json.success === true)) {
              form.reset();
              showSuccessOverlay();
            } else {
              throw new Error(json.message || "Submission failed");
            }
          } catch (err) {
            // Reset button
            btn.disabled = false;
            btnText.style.display = "inline";
            btnSpinner.style.display = "none";
            btn.style.opacity = "1";
            // Show error
            validation.style.color = "#f87171";
            validation.style.background = "rgba(248,113,113,0.08)";
            validation.style.border = "1px solid rgba(248,113,113,0.2)";
            validation.textContent = "\u2715 Could not send. Please email directly: yogeshsankranthi131@gmail.com";
            validation.style.display = "block";
          }
        });

        // Clear validation on input
        ["fc-name", "fc-email", "fc-message"].forEach(id => {
          document.getElementById(id).addEventListener("input", () => {
            validation.style.display = "none";
          });
        });
      })();

      /* ─── Success Overlay ─── */
      function showSuccessOverlay() {
        const overlay = document.createElement("div");
        overlay.id = "successOverlay";
        overlay.innerHTML = `
          <div class="success-modal">
            <div class="success-icon">✉</div>
            <div class="success-title">Message Delivered!</div>
            <div class="success-desc">
              Yogesh received your message and will reply<br>
              to your email within <strong>24 hours</strong>.
            </div>
            <div class="success-email">📬 yogeshsankranthi131@gmail.com</div>
            <button class="success-close" onclick="document.getElementById('successOverlay').remove()">
              Back to Portfolio
            </button>
          </div>
        `;
        // Inject modal styles
        const style = document.createElement("style");
        style.textContent = `
          #successOverlay {
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(8,8,16,0.92);
            backdrop-filter: blur(18px);
            display: flex; align-items: center; justify-content: center;
            animation: overlayIn 0.4s ease;
          }
          @keyframes overlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .success-modal {
            background: #181828;
            border: 1px solid #00c9a7;
            border-radius: 16px;
            padding: 3rem 2.5rem;
            max-width: 420px;
            width: 90%;
            text-align: center;
            box-shadow: 0 0 60px rgba(0,201,167,0.15), 0 32px 80px rgba(0,0,0,0.5);
            animation: modalIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
          }
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          .success-icon {
            font-size: 3rem;
            margin-bottom: 1.2rem;
            display: block;
            animation: iconPop 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          }
          @keyframes iconPop {
            from { transform: scale(0); }
            to   { transform: scale(1); }
          }
          .success-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 700;
            color: #f5f5fa;
            margin-bottom: 0.8rem;
          }
          .success-desc {
            color: #a0a0c0;
            font-size: 0.95rem;
            line-height: 1.8;
            margin-bottom: 1.4rem;
          }
          .success-desc strong { color: #00c9a7; }
          .success-email {
            font-family: 'DM Mono', monospace;
            font-size: 0.78rem;
            color: #e8a020;
            background: rgba(232,160,32,0.08);
            border: 1px solid rgba(232,160,32,0.2);
            padding: 0.45rem 1rem;
            border-radius: 100px;
            display: inline-block;
            margin-bottom: 2rem;
          }
          .success-close {
            background: #00c9a7;
            color: #000;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            font-family: 'Outfit', sans-serif;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 0.04em;
          }
          .success-close:hover {
            background: #33d9bc;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,201,167,0.35);
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        // Close on backdrop click
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) overlay.remove();
        });
      }

      /* ─── Smooth nav active state ─── */
      const sections = document.querySelectorAll("section[id]");
      const navLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");
      function updateNav() {
        let current = "";
        sections.forEach((s) => {
          if (window.scrollY >= s.offsetTop - 140) current = s.id;
        });
        navLinks.forEach((l) => {
          const isActive = l.getAttribute("href") === "#" + current;
          l.style.color = isActive ? "var(--white)" : "";
          // also animate the underline via the ::after pseudo via a class
          if (isActive) {
            l.dataset.active = "true";
          } else {
            delete l.dataset.active;
          }
        });
      }
      window.addEventListener("scroll", updateNav, { passive: true });
      updateNav();

      /* ─── PDF Viewer Modal ─── */
      let currentPdfPage = 1;
      let currentPdfDocument = null;
      let currentPdfNumPages = 0;
      let currentPdfScale = 1.5;
      const PDF_SCALE_MIN = 0.5;
      const PDF_SCALE_MAX = 4.0;
      const PDF_SCALE_STEP = 0.25;
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      function openPdfViewer(pdfPath) {
        const modal = document.getElementById('pdfViewerModal');
        if (!modal) createPdfModal();
        document.getElementById('pdfViewerModal').style.display = 'flex';
        loadAndDisplayPdf(pdfPath);
      }

      function createPdfModal() {
        const modal = document.createElement('div');
        modal.id = 'pdfViewerModal';
        modal.innerHTML = `
          <div class="pdf-modal-content">
            <div class="pdf-modal-header">
              <h3>Resume Viewer</h3>
              <button class="pdf-close-btn" onclick="closePdfViewer()">✕</button>
            </div>
            <div class="pdf-modal-body">
              <div class="pdf-controls">
                <button onclick="previousPdfPage()" class="pdf-btn">← Previous</button>
                <span class="pdf-page-info"><input type="number" id="pdfPageInput" min="1" value="1" onchange="jumpToPdfPage(this.value)" class="pdf-input"> / <span id="pdfTotalPages">0</span></span>
                <button onclick="nextPdfPage()" class="pdf-btn">Next →</button>
                <div class="pdf-zoom-group">
                  <button onclick="zoomOutPdf()" class="pdf-btn pdf-zoom-btn" title="Zoom Out">−</button>
                  <span class="pdf-zoom-level" id="pdfZoomLevel">100%</span>
                  <button onclick="zoomInPdf()" class="pdf-btn pdf-zoom-btn" title="Zoom In">+</button>
                </div>
                <button onclick="downloadPdf()" class="pdf-btn pdf-download-btn">⬇ Download</button>
              </div>
              <div class="pdf-canvas-container">
                <canvas id="pdfCanvas" class="pdf-canvas"></canvas>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      function closePdfViewer() {
        document.getElementById('pdfViewerModal').style.display = 'none';
        currentPdfPage = 1;
        currentPdfDocument = null;
        currentPdfNumPages = 0;
        currentPdfScale = 1.5;
        updateZoomDisplay();
      }

      function loadAndDisplayPdf(pdfPath) {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.getDocument(pdfPath).promise.then(pdf => {
          currentPdfDocument = pdf;
          currentPdfNumPages = pdf.numPages;
          document.getElementById('pdfTotalPages').textContent = pdf.numPages;
          renderPdfPage(1);
        });
      }

      function renderPdfPage(pageNum) {
        if (!currentPdfDocument) return;
        
        currentPdfDocument.getPage(pageNum).then(page => {
          const canvas = document.getElementById('pdfCanvas');
          const ctx = canvas.getContext('2d');
          
          const viewport = page.getViewport({ scale: currentPdfScale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          
          page.render(renderContext).promise.then(() => {
            currentPdfPage = pageNum;
            document.getElementById('pdfPageInput').value = pageNum;
          });
        });
      }

      function zoomInPdf() {
        if (currentPdfScale < PDF_SCALE_MAX) {
          currentPdfScale = Math.min(PDF_SCALE_MAX, parseFloat((currentPdfScale + PDF_SCALE_STEP).toFixed(2)));
          updateZoomDisplay();
          renderPdfPage(currentPdfPage);
        }
      }

      function zoomOutPdf() {
        if (currentPdfScale > PDF_SCALE_MIN) {
          currentPdfScale = Math.max(PDF_SCALE_MIN, parseFloat((currentPdfScale - PDF_SCALE_STEP).toFixed(2)));
          updateZoomDisplay();
          renderPdfPage(currentPdfPage);
        }
      }

      function updateZoomDisplay() {
        const el = document.getElementById('pdfZoomLevel');
        if (el) {
          const pct = Math.round((currentPdfScale / 1.5) * 100);
          el.textContent = pct + '%';
        }
      }

      function nextPdfPage() {
        if (currentPdfPage < currentPdfNumPages) {
          renderPdfPage(currentPdfPage + 1);
        }
      }

      function previousPdfPage() {
        if (currentPdfPage > 1) {
          renderPdfPage(currentPdfPage - 1);
        }
      }

      function jumpToPdfPage(pageNum) {
        pageNum = parseInt(pageNum);
        if (pageNum >= 1 && pageNum <= currentPdfNumPages) {
          renderPdfPage(pageNum);
        }
      }

      function downloadPdf() {
        const link = document.createElement('a');
        link.href = 'Assets/S_Yogesh_Resume.pdf';
        link.download = 'Sankranthi_Yogesh_Resume.pdf';
        link.click();
      }

      // Close modal on background click
      document.addEventListener('click', function(event) {
        const modal = document.getElementById('pdfViewerModal');
        if (modal && event.target === modal) {
          closePdfViewer();
        }
      });

      // Close modal on Escape key
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          closePdfViewer();
        }
      });
    