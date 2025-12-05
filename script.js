// ============================================
// TOOLS INSTALLATION GUIDE - CLEAN REBUILD
// ============================================

(function () {
  "use strict";

  // ============================================
  // MODAL MANAGEMENT
  // ============================================

  let currentOpenModal = null;
  const totalSteps = 5;

  function openModal(modalId) {
    // Close any open modal first
    if (currentOpenModal) {
      closeModal(currentOpenModal);
    }

    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error("Modal not found:", modalId);
      return;
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    currentOpenModal = modalId;

    // Add animation
    const modalContent = modal.querySelector(".modal-content");
    if (modalContent) {
      modalContent.style.animation = "modalSlideIn 0.3s ease-out";
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
    }

    // Check if any modal is still open
    const anyModalOpen = Array.from(document.querySelectorAll(".modal")).some(
      (m) => window.getComputedStyle(m).display === "block"
    );

    if (!anyModalOpen) {
      document.body.style.overflow = "auto";
      currentOpenModal = null;
    }
  }

  function closeModalAndOpenNext(currentModalId, nextModalId, stepId) {
    closeModal(currentModalId);

    setTimeout(() => {
      // Scroll to next step
      const nextStep = document.getElementById(stepId);
      if (nextStep) {
        nextStep.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Open next modal
      setTimeout(() => {
        openModal(nextModalId);
      }, 400);
    }, 300);
  }

  function closeModalAndOpenConfirmation(modalId) {
    closeModal(modalId);

    setTimeout(() => {
      openModal("confirmation-modal");
    }, 300);
  }

  // ============================================
  // IMAGE ZOOM - SIMPLE & WORKING
  // ============================================

  let zoomedModalId = null;

  function openImageZoom(imageSrc) {
    // Store which modal was open
    zoomedModalId = currentOpenModal;

    // Hide the modal
    if (currentOpenModal) {
      const modal = document.getElementById(currentOpenModal);
      if (modal) {
        modal.style.display = "none";
      }
    }

    // Show zoom overlay
    const overlay = document.getElementById("image-zoom-overlay");
    const zoomedImage = document.getElementById("zoomed-image");

    if (overlay && zoomedImage) {
      zoomedImage.src = imageSrc;
      overlay.style.display = "flex";
      overlay.style.zIndex = "999999";
      document.body.style.overflow = "hidden";
    }
  }

  function closeImageZoom() {
    const overlay = document.getElementById("image-zoom-overlay");
    if (overlay) {
      overlay.style.display = "none";
    }

    // Restore the modal that was open
    if (zoomedModalId) {
      openModal(zoomedModalId);
      zoomedModalId = null;
    } else {
      document.body.style.overflow = "auto";
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  document.addEventListener("DOMContentLoaded", function () {
    // Tool card clicks - open modals
    document.querySelectorAll(".tool-card[data-modal]").forEach((card) => {
      card.addEventListener("click", function () {
        const modalId = this.getAttribute("data-modal");
        openModal(modalId);
      });
    });

    // Close button clicks
    document.querySelectorAll(".close[data-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const modalId = this.getAttribute("data-close");
        closeModal(modalId);
      });
    });

    // Done button - next step
    document.querySelectorAll(".done-btn[data-next]").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const currentModal = this.closest(".modal").id;
        const nextModal = this.getAttribute("data-next");
        const stepId = this.getAttribute("data-step");
        closeModalAndOpenNext(currentModal, nextModal, stepId);
      });
    });

    // All Done button
    document.querySelectorAll(".done-btn[data-all-done]").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const currentModal = this.closest(".modal").id;
        closeModalAndOpenConfirmation(currentModal);
      });
    });

    // Image zoom - click on images
    document.querySelectorAll(".zoomable-image").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        openImageZoom(this.src);
      });
    });

    // Close zoom overlay
    const zoomOverlay = document.getElementById("image-zoom-overlay");
    const zoomClose = document.querySelector(".zoom-close");

    if (zoomOverlay) {
      zoomOverlay.addEventListener("click", function (e) {
        if (e.target === this || e.target === zoomClose) {
          closeImageZoom();
        }
      });
    }

    if (zoomClose) {
      zoomClose.addEventListener("click", function (e) {
        e.stopPropagation();
        closeImageZoom();
      });
    }

    // Close modal on backdrop click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", function (e) {
        if (e.target === this) {
          closeModal(this.id);
        }
      });
    });

    // Escape key to close modals/zoom
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (
          document.getElementById("image-zoom-overlay").style.display === "flex"
        ) {
          closeImageZoom();
        } else if (currentOpenModal) {
          closeModal(currentOpenModal);
        }
      }
    });
  });

  // ============================================
  // FORM SUBMISSION
  // ============================================

  window.handleFormSubmit = function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const tools = formData.getAll("tools");
    const problems = formData.get("problems") || "None";

    if (tools.length === 0) {
      alert("Please select at least one tool that you have completed.");
      return;
    }

    const submitBtn = form.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // Prepare data for Google Sheets
    const submissionData = {
      name: name,
      email: email,
      tools: tools.join(", "), // Convert array to comma-separated string
      problems: problems,
      timestamp: new Date().toISOString(),
    };

    // Replace this URL with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbyzNmWGNBDyM4iiLxgm9UmpXGw55_hyB3_WyxHF5pUDFWYpB3xAu4_fEl3lB6s_p8cvFg/exec";

    // Send data to Google Sheets via Apps Script
    // Using URL-encoded form data (more reliable with Google Apps Script)
    const urlParams = new URLSearchParams();
    urlParams.append("name", name);
    urlParams.append("email", email);
    urlParams.append("tools", tools.join(", "));
    urlParams.append("problems", problems);
    urlParams.append("timestamp", new Date().toISOString());

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlParams.toString(),
    })
      .then(() => {
        // Success - even with no-cors, we assume success
        submitBtn.textContent = "✅ Submitted Successfully!";
        submitBtn.style.background =
          "linear-gradient(135deg, #4caf50 0%, #45a049 100%)";

        setTimeout(() => {
          form.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.background = "";
          closeModal("confirmation-modal");
          alert(
            "Thank you! Your confirmation has been submitted successfully."
          );
        }, 2000);
      })
      .catch((error) => {
        // Error handling
        console.error("Error submitting form:", error);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        alert("There was an error submitting your form. Please try again.");
      });
  };

  // Make functions globally available
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openImageZoom = openImageZoom;
  window.closeImageZoom = closeImageZoom;
})();
