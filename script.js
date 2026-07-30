/**
 * ==========================================
 * Adriano Jorge - Premium Digital Card Script
 * Pure Vanilla JavaScript - No Frameworks
 * ==========================================
 */

// 1. EDITABLE SOCIAL LINKS (Configure your profile URLs here)
const links = {
  whatsapp: "https://wa.me/5571991261474?text=Ol%C3%A1%20Adriano%2C%20gostaria%20de%20saber%20mais%20sobre%20suas%20solu%C3%A7%C3%B5es%20inteligentes.",
  pinterest: "https://br.pinterest.com/heinestudio/",
  tiktok: "https://www.tiktok.com/@vozepalavraoficial",
  youtube: "https://www.youtube.com/@adrianojorgeoficial",
  instagram: "https://www.instagram.com/solucoes_premium/"
};

// 2. DOM INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  // Bind dynamic links to HTML buttons
  setupSocialLinks();

  // Initialize Scroll Reveal (Intersection Observer)
  setupScrollReveal();

  // Initialize PWA Service Worker
  registerServiceWorker();

  // Initialize PWA Installation Banner
  setupPWAInstall();

  // Attach core button events
  setupActionButtons();

  // Setup QR Code Modal
  setupQRCodeModal();

  // Initialize Portfolio Carousel
  setupPortfolioCarousel();

  // Initialize Lucide Icons if available (failsafe)
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

// 3. APPLY SOCIAL LINKS TO DOM
function setupSocialLinks() {
  // Map link keys to HTML elements by ID
  const mappings = {
    whatsapp: "link-whatsapp",
    pinterest: "link-pinterest",
    tiktok: "link-tiktok",
    youtube: "link-youtube",
    instagram: "link-instagram",
    whatsappFeatured: "link-whatsapp-featured"
  };

  // Assign href values
  if (document.getElementById(mappings.whatsapp)) {
    document.getElementById(mappings.whatsapp).href = links.whatsapp || "#";
  }
  if (document.getElementById(mappings.whatsappFeatured)) {
    document.getElementById(mappings.whatsappFeatured).href = links.whatsapp || "#";
  }
  if (document.getElementById(mappings.pinterest)) {
    document.getElementById(mappings.pinterest).href = links.pinterest || "#";
  }
  if (document.getElementById(mappings.tiktok)) {
    document.getElementById(mappings.tiktok).href = links.tiktok || "#";
  }
  if (document.getElementById(mappings.youtube)) {
    document.getElementById(mappings.youtube).href = links.youtube || "#";
  }
  if (document.getElementById(mappings.instagram)) {
    document.getElementById(mappings.instagram).href = links.instagram || "#";
  }
}

// 4. SCROLL REVEAL (Intersection Observer for elegant fade/slide-up effects)
function setupScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target); // Animates only once
        }
      });
    },
    {
      threshold: 0.08, // Trigger when 8% of element is visible
      rootMargin: "0px 0px -50px 0px" // Offset slightly for better scroll timing
    }
  );

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });

  // Failsafe: in iframe environments or if IntersectionObserver is blocked, 
  // ensure everything is visible after a short delay so the user doesn't see a blank page.
  setTimeout(() => {
    revealElements.forEach((el) => {
      el.classList.add("active");
    });
  }, 1000);
}

// 5. BUTTON ACTIONS: SHARE & VCARD EXPORT
function setupActionButtons() {
  // Save Contact (Dynamic vCard Export)
  const saveContactBtn = document.getElementById("btn-save-contact");
  if (saveContactBtn) {
    saveContactBtn.addEventListener("click", downloadVCard);
  }

  // Share Card (Web Share API with Clipboard Fallback)
  const shareBtn = document.getElementById("btn-share-card");
  if (shareBtn) {
    shareBtn.addEventListener("click", shareCard);
  }
}

// 6. DYNAMIC vCARD (.VCF) GENERATOR
function downloadVCard() {
  // Contact details
  const info = {
    firstName: "Adriano",
    lastName: "Jorge",
    organization: "Soluções Inteligentes",
    title: "Desenvolvedor de Soluções Inteligentes",
    phone: "+5571991261474", // Correct phone
    email: "jorgeheine@gmail.com", // User email
    url: window.location.href
  };

  // Generate vCard payload compliant with vCard 3.0 specifications
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:${info.lastName};${info.firstName};;;
FN:${info.firstName} ${info.lastName}
ORG:${info.organization}
TITLE:${info.title}
TEL;TYPE=CELL;TYPE=PREF;TYPE=VOICE:${info.phone}
EMAIL;TYPE=PREF;TYPE=INTERNET:${info.email}
URL;TYPE=WORK:${info.url}
REV:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
END:VCARD`;

  try {
    // Create blob and trigger browser download
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${info.firstName}_${info.lastName}.vcf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    showToast("✓ Contato salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar vCard:", error);
    showToast("Erro ao salvar contato.");
  }
}

// 7. WEB SHARE API WITH CLIPBOARD FALLBACK
async function shareCard() {
  const shareData = {
    title: "Adriano Jorge | Soluções Inteligentes",
    text: "Conecte-se com Adriano Jorge - Desenvolvedor de Soluções Inteligentes para empresas em todo o Brasil.",
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast("✓ Compartilhado com sucesso!");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao compartilhar:", error);
        copyLinkToClipboard();
      }
    }
  } else {
    // Fallback: copy link to clipboard
    copyLinkToClipboard();
  }
}

// Copy link helper
function copyLinkToClipboard() {
  const url = window.location.href;
  navigator.clipboard.writeText(url)
    .then(() => {
      showToast("✓ Link copiado para a área de transferência!");
    })
    .catch((err) => {
      console.error("Erro ao copiar link:", err);
      showToast("Erro ao copiar o link.");
    });
}

// 8. TOAST NOTIFICATION UTILITY
function showToast(message) {
  let toast = document.getElementById("toast-notification");
  
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  
  toast.innerText = message;
  toast.classList.add("show");
  
  // Auto dismiss after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// 9. SERVICE WORKER REGISTRATION FOR OFFLINE PWA CAPABILITY
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const isDev = window.location.hostname.includes('localhost') || 
                  window.location.hostname.includes('ais-dev') || 
                  window.location.hostname.includes('ais-pre') || 
                  window.location.hostname.includes('run.app');

    if (isDev) {
      // Unregister active service workers in dev/preview to prevent caching issues
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        let unregisteredAny = false;
        for (let registration of registrations) {
          registration.unregister();
          unregisteredAny = true;
          console.log("[Service Worker] Unregistered active worker for dev/preview reload.");
        }
        if (unregisteredAny) {
          // Force a reload once to get fresh assets
          window.location.reload();
        }
      });
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js")
        .then((reg) => {
          console.log("[Service Worker] Registered successfully with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[Service Worker] Registration failed:", err);
        });
    });
  }
}

// 10. PWA INSTALL BANNER MANAGEMENT ("Add to Home Screen")
function setupPWAInstall() {
  let deferredPrompt;
  const installBanner = document.getElementById("pwa-install-banner");
  const installBtn = document.getElementById("pwa-install-btn");

  if (!installBanner || !installBtn) return;

  // Listen to beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the default browser mini-infobar from appearing
    e.preventDefault();
    // Save the event so it can be triggered later
    deferredPrompt = e;
    // Show the custom premium install banner
    installBanner.style.display = "flex";
  });

  // Handle install button click
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    
    // Show the browser installation prompt
    deferredPrompt.prompt();
    
    // Wait for the user's response to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA Install] User response to install: ${outcome}`);
    
    // We've used the prompt, clear it
    deferredPrompt = null;
    
    // Hide the custom install banner
    installBanner.style.display = "none";
  });

  // Hide banner if app is successfully installed
  window.addEventListener("appinstalled", () => {
    console.log("[PWA Install] App successfully installed on device.");
    installBanner.style.display = "none";
    deferredPrompt = null;
    showToast("✓ Aplicativo adicionado à tela inicial!");
  });
}

// 11. QR CODE MODAL MANAGEMENT
function setupQRCodeModal() {
  const qrBtn = document.getElementById("btn-qr-code");
  const qrModal = document.getElementById("qr-modal");
  const closeModalBtn = document.getElementById("btn-close-modal");
  const qrImg = document.getElementById("qr-image");
  const qrLoading = document.getElementById("qr-loading");
  const qrUrlText = document.getElementById("qr-url-text");
  const copyQrUrlBtn = document.getElementById("btn-copy-qr-url");

  if (!qrBtn || !qrModal || !closeModalBtn) return;

  // Open Modal
  qrBtn.addEventListener("click", () => {
    const currentUrl = window.location.href;
    if (qrUrlText) {
      qrUrlText.innerText = currentUrl;
    }
    
    // Set QR code API source
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;
    
    // Show spinner and reset image loaded status
    if (qrLoading) qrLoading.style.display = "block";
    if (qrImg) {
      qrImg.classList.remove("loaded");
      qrImg.src = qrApiUrl;
      
      qrImg.onload = () => {
        if (qrLoading) qrLoading.style.display = "none";
        qrImg.classList.add("loaded");
      };
    }

    qrModal.classList.add("show");
  });

  // Close Modal
  const closeModal = () => {
    qrModal.classList.remove("show");
  };

  closeModalBtn.addEventListener("click", closeModal);

  // Close when clicking outside card
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) {
      closeModal();
    }
  });

  // Copy URL from within QR Code Modal
  if (copyQrUrlBtn) {
    copyQrUrlBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showToast("✓ Link copiado para a área de transferência!");
        })
        .catch((err) => {
          console.error("Erro ao copiar link:", err);
          showToast("Erro ao copiar o link.");
        });
    });
  }
}

// 12. PORTFOLIO CAROUSEL SYSTEM
function setupPortfolioCarousel() {
  const track = document.getElementById("carousel-track");
  const slides = Array.from(document.querySelectorAll(".carousel-slide"));
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const dots = Array.from(document.querySelectorAll(".pagination-dot"));

  if (!track || slides.length === 0) return;

  let currentIndex = 0;

  function updateCarousel(index) {
    // Clamp index
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;

    // Update active class on slides
    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    // Update active class on dots
    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    // Refresh icons inside slide if any dynamic icons were added
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Next Button Click
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      updateCarousel(currentIndex + 1);
    });
  }

  // Prev Button Click
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      updateCarousel(currentIndex - 1);
    });
  }

  // Dot Clicks
  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const targetIndex = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      updateCarousel(targetIndex);
    });
  });

  // Optional: Auto-play every 7 seconds to keep it dynamic
  let autoplayTimer = setInterval(() => {
    updateCarousel(currentIndex + 1);
  }, 7000);

  // Pause autoplay on user interaction
  const pauseAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  if (nextBtn) nextBtn.addEventListener("click", pauseAutoplay);
  if (prevBtn) prevBtn.addEventListener("click", pauseAutoplay);
  dots.forEach(dot => dot.addEventListener("click", pauseAutoplay));
}

