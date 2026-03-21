// Stars background animation
function createStars() {
  const container = document.getElementById("stars-container");
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    // Random size between 1 and 3px
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // Random position
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;

    // Random animation duration between 3 and 7 seconds
    star.style.animationDuration = `${Math.random() * 4 + 3}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;

    // Random twinkle effect
    if (Math.random() > 0.5) {
      star.style.boxShadow = `0 0 4px 1px white`;
    }

    container.appendChild(star);
  }
}

// Enhanced Music Player - Robust Singleton Implementation
let _musicInitialized = false;
function setupMusic() {
  if (_musicInitialized) return;
  _musicInitialized = true;

  let playlist = [];
  let currentTrack = 0;
  let isPlayerVisible = false;

  // DOM Elements
  const music = document.getElementById("bgMusic");
  const toggleBtn = document.getElementById("musicToggle");
  const prevBtn = document.getElementById("prevMusic");
  const nextBtn = document.getElementById("nextMusic");
  const musicIcon = document.getElementById("musicIcon");
  const musicPlayer = document.getElementById("musicPlayer");
  const toggleMusicPlayer = document.getElementById("toggleMusicPlayer");
  const currentTrackTitle = document.getElementById("currentTrackTitle");
  const progressBar = document.getElementById("progressBar");
  const currentTime = document.getElementById("currentTime");
  const totalTime = document.getElementById("totalTime");
  const volumeControl = document.getElementById("volumeControl");

  let _trackReady = false;

  // Initialize volume
  music.volume = 0.8;

  function applyPlaylist(data) {
    const processedData = data
      ? Array.isArray(data)
        ? data
        : Object.values(data)
      : [];

    if (processedData.length === 0) {
      playlist = [{ title: "A mortal music", src: "A mortal music.mp3" }];
    } else {
      playlist = processedData;
    }

    if (currentTrack >= playlist.length) currentTrack = 0;

    if (!_trackReady && playlist.length > 0) {
      _trackReady = true;
      loadTrack(currentTrack, false); // Don't autoplay yet
    }
  }

  function loadTrack(index, shouldPlay = true) {
    if (index < 0 || index >= playlist.length) return;
    currentTrack = index;

    const track = playlist[currentTrack];
    let trackSrc = track.src;

    // Only encode if it's NOT a full URL (Firebase URLs are already encoded)
    if (!trackSrc.startsWith("http")) {
      // Safe encoding for local paths with spaces
      trackSrc = encodeURI(trackSrc);
    }

    music.src = trackSrc;
    currentTrackTitle.textContent = track.title;

    music.load();
    if (shouldPlay) {
      music.play().catch((err) => {
        console.warn("Playback blocked or failed:", err);
        updateUI(); // Ensure UI stays in sync if play fails
      });
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function updateProgress() {
    if (music.duration) {
      const progress = (music.currentTime / music.duration) * 100;
      progressBar.style.width = `${progress}%`;
      currentTime.textContent = formatTime(music.currentTime);
      totalTime.textContent = formatTime(music.duration);
    }
  }

  function updateUI() {
    const isActuallyPlaying =
      !music.paused && !music.ended && music.readyState > 2;

    if (isActuallyPlaying) {
      musicIcon.className = "fas fa-pause text-white";
      toggleMusicPlayer.classList.add("music-playing");
      toggleBtn.classList.add("music-playing-btn");
    } else {
      musicIcon.className = "fas fa-play text-white";
      toggleMusicPlayer.classList.remove("music-playing");
      toggleBtn.classList.remove("music-playing-btn");
    }
  }

  function togglePlayPause() {
    if (!music.src || music.src === window.location.href) {
      loadTrack(currentTrack, true);
      return;
    }

    if (music.paused) {
      music.play().catch((err) => {
        console.error("Manual play failed:", err);
        // Retry with a fresh load if error
        loadTrack(currentTrack, true);
      });
    } else {
      music.pause();
    }
  }

  // Event Listeners
  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    togglePlayPause();
  });

  nextBtn.addEventListener("click", () =>
    loadTrack((currentTrack + 1) % playlist.length),
  );
  prevBtn.addEventListener("click", () =>
    loadTrack((currentTrack - 1 + playlist.length) % playlist.length),
  );

  toggleMusicPlayer.addEventListener("click", () => {
    isPlayerVisible = !isPlayerVisible;
    musicPlayer.classList.toggle("show", isPlayerVisible);
  });

  const closeBtn = document.getElementById("closeMusicPlayer");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      isPlayerVisible = false;
      musicPlayer.classList.remove("show");
    });
  }

  if (volumeControl) {
    volumeControl.addEventListener(
      "input",
      (e) => (music.volume = e.target.value / 100),
    );
  }

  // Audio state listeners
  music.addEventListener("timeupdate", updateProgress);
  music.addEventListener("ended", () =>
    loadTrack((currentTrack + 1) % playlist.length),
  );
  music.addEventListener("play", updateUI);
  music.addEventListener("pause", updateUI);
  music.addEventListener("playing", updateUI);
  music.addEventListener("canplay", updateUI);

  music.addEventListener("error", () => {
    console.error("Audio error. Path might be wrong:", music.src);
    currentTrackTitle.textContent = "Error loading music";
  });

  // Data Listeners
  document.addEventListener("firebase:music", (e) => applyPlaylist(e.detail));
  if (window._firebaseMusic) applyPlaylist(window._firebaseMusic);

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT") {
      e.preventDefault();
      togglePlayPause();
    }
  });
}

// Mobile menu toggle
function setupMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// Smooth scrolling for navigation
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        // Close mobile menu if open
        const mobileMenu = document.getElementById("mobile-menu");
        if (!mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden");
        }
      }
    });
  });

  // Close mobile menu when admin button is clicked
  const adminBtn = document.querySelector(".admin-nav-btn");
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      const mobileMenu = document.getElementById("mobile-menu");
      if (!mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
      }
    });
  }
}

// Schedule day tabs
function setupScheduleTabs() {
  const dayButtons = document.querySelectorAll(".schedule-day");

  dayButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      dayButtons.forEach((btn) => {
        btn.classList.remove("bg-purple-900", "text-white");
        btn.classList.add("bg-gray-800", "text-gray-300");
      });

      // Add active class to clicked button
      button.classList.remove("bg-gray-800", "text-gray-300");
      button.classList.add("bg-purple-900", "text-white");

      // Hide all tables
      document.querySelectorAll(".day-schedule").forEach((table) => {
        table.classList.add("hidden");
      });

      // Show selected table
      const day = button.getAttribute("data-day");
      document.getElementById(`${day}-schedule`).classList.remove("hidden");
    });
  });

  document.addEventListener("firebase:schedule", (e) => {
    const schedules = e.detail || [];
    const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    days.forEach((day) => {
      const table = document.getElementById(`${day}-schedule`);
      if (table) {
        const tbody = table.querySelector("tbody");
        if (tbody) {
          const daySchedules = schedules
            .filter((s) => s.day === day)
            .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
          if (daySchedules.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-400">Belum ada jadwal</td></tr>`;
          } else {
            tbody.innerHTML = daySchedules
              .map(
                (s) => `
              <tr class="hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-purple-300">${s.time}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">${s.course}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${s.lecturer}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${s.room}</td>
              </tr>
            `,
              )
              .join("");
          }
        }
      }
    });
  });
}

// Gallery filter
function setupGalleryFilter() {
  const filterButtons = document.querySelectorAll(".gallery-filter");
  const galleryGrid = document.getElementById("galleryGrid");
  let currentCategory = "all";

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => {
        btn.classList.remove("bg-purple-900", "text-white");
        btn.classList.add("bg-gray-800", "text-gray-300");
      });

      // Add active class to clicked button
      button.classList.remove("bg-gray-800", "text-gray-300");
      button.classList.add("bg-purple-900", "text-white");

      currentCategory = button.getAttribute("data-category");
      filterGalleryGrid();
    });
  });

  function filterGalleryGrid() {
    if (!galleryGrid) return;
    const galleryItems = galleryGrid.querySelectorAll(".gallery-item");
    galleryItems.forEach((item) => {
      if (
        currentCategory === "all" ||
        item.getAttribute("data-category") === currentCategory
      ) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  document.addEventListener("firebase:gallery", (e) => {
    const galleries = e.detail || [];
    if (!galleryGrid) return;

    if (galleries.length === 0) {
      galleryGrid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-8">Belum ada foto di galeri.</div>`;
      return;
    }

    galleryGrid.innerHTML = galleries
      .map(
        (g) => `
            <div data-category="${g.category}" class="gallery-item relative group overflow-hidden rounded-xl shadow-lg">
              <img src="${g.photo}" alt="${g.title}" class="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='https://via.placeholder.com/400x300?text=Not+Found'">
              <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-80 transition-opacity flex items-end p-4">
                <div>
                  <h3 class="text-white font-bold">${g.title}</h3>
                  <p class="text-gray-300 text-sm">${g.date || ""}</p>
                </div>
              </div>
            </div>
      `,
      )
      .join("");

    filterGalleryGrid();
  });
}

// Dynamic Slideshow Manager
function setupSlideshow() {
  const container = document.getElementById("slideshow");
  if (!container) return;

  let currentSlide = 0;
  let timer = null;

  function renderSlides(slideUrls) {
    if (!slideUrls || slideUrls.length === 0) return;

    // Clear and rebuild
    container.innerHTML = "";
    slideUrls.forEach((url, index) => {
      const slideDiv = document.createElement("div");
      slideDiv.className = `slide absolute inset-0 bg-gray-800 flex items-center justify-center transition-opacity duration-1000 ${
        index === 0 ? "opacity-100" : "opacity-0"
      }`;
      slideDiv.innerHTML = `<img src="${url}" alt="Aktivitas Kelas" class="w-full h-full object-cover" />`;
      container.appendChild(slideDiv);
    });

    currentSlide = 0;
    restartTimer();
  }

  function showSlide(n) {
    const slides = container.querySelectorAll(".slide");
    if (slides.length === 0) return;

    slides.forEach((slide) => {
      slide.classList.add("opacity-0");
      slide.classList.remove("opacity-100");
    });

    currentSlide = n % slides.length;
    slides[currentSlide].classList.remove("opacity-0");
    slides[currentSlide].classList.add("opacity-100");
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 5000);
  }

  // Listen for real-time updates
  document.addEventListener("firebase:heroSlides", (e) => {
    renderSlides(e.detail);
  });

  // Initial setup with existing slides if any
  const existingSlides = container.querySelectorAll(".slide");
  if (existingSlides.length > 0) {
    restartTimer();
  }
}

// Calendar
function setupCalendar() {
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const currentMonthEl = document.getElementById("currentMonth");
  const calendarDaysEl = document.getElementById("calendarDays");

  let currentDate = new Date();

  function renderCalendar() {
    // Set month and year in header
    currentMonthEl.textContent = currentDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

    // Clear previous days
    calendarDaysEl.innerHTML = "";

    // Get first day of month and total days
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Add blank cells for days of previous month
    for (let i = 0; i < startingDay; i++) {
      const dayElement = document.createElement("div");
      dayElement.classList.add(
        "h-10",
        "flex",
        "items-center",
        "justify-center",
      );
      calendarDaysEl.appendChild(dayElement);
    }

    // Add days of current month
    for (let i = 1; i <= totalDays; i++) {
      const dayElement = document.createElement("div");
      dayElement.classList.add(
        "h-10",
        "flex",
        "items-center",
        "justify-center",
        "cursor-pointer",
        "relative",
      );
      dayElement.textContent = i;

      // Mark current day
      if (
        i === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear()
      ) {
        dayElement.classList.add("font-bold");
        dayElement.innerHTML = `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-red-500">${i}</span>`;
      }

      // Add event indicators
      const randomEvents = Math.floor(Math.random() * 3);
      if (randomEvents > 0) {
        const eventIndicator = document.createElement("div");
        eventIndicator.classList.add(
          "absolute",
          "bottom-1",
          "left-1/2",
          "transform",
          "-translate-x-1/2",
          "flex",
          "justify-center",
          "space-x-1",
        );

        for (let j = 0; j < randomEvents; j++) {
          const dot = document.createElement("div");
          dot.classList.add("w-2", "h-2", "rounded-full", "bg-purple-500");
          eventIndicator.appendChild(dot);
        }

        dayElement.appendChild(eventIndicator);
      }

      // Add click event to show event details
      dayElement.addEventListener("click", () => {
        showEventModal(i);
      });

      calendarDaysEl.appendChild(dayElement);
    }
  }

  function showEventModal(day) {
    const modal = document.getElementById("eventModal");
    const modalTitle = document.getElementById("eventTitle");
    const modalDetails = document.getElementById("eventDetails");

    const monthName = currentDate.toLocaleDateString("id-ID", {
      month: "long",
    });
    const year = currentDate.getFullYear();

    modalTitle.textContent = `Acara pada ${day} ${monthName} ${year}`;

    modal.classList.remove("hidden");
  }

  function closeEventModal() {
    document.getElementById("eventModal").classList.add("hidden");
  }

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  document
    .getElementById("closeModal")
    .addEventListener("click", closeEventModal);
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeEventModal);

  renderCalendar();
}

// // Members search and load more
function setupMembers() {
  const membersList = document.getElementById("membersList");
  const memberSearch = document.getElementById("memberSearch");
  const loadMoreBtn = document.getElementById("loadMoreMembers");

  let memberData = [];
  let visibleMembers = 5;

  function renderMembers() {
    if (!membersList) return;
    membersList.innerHTML = "";

    const searchTerm = memberSearch ? memberSearch.value.toLowerCase() : "";
    const filteredMembers = memberData
      .filter(
        (member) =>
          (member.name && member.name.toLowerCase().includes(searchTerm)) ||
          (member.nim && member.nim.toLowerCase().includes(searchTerm)),
      )
      .slice(0, visibleMembers);

    if (filteredMembers.length === 0 && memberData.length > 0) {
      membersList.innerHTML = `<div class="col-span-full text-center text-gray-400 py-8">Tidak ada anggota yang cocok dengan pencarian.</div>`;
    }

    filteredMembers.forEach((member) => {
      const memberElement = document.createElement("div");
      memberElement.className =
        "member-card bg-gray-800 rounded-xl p-4 text-center shadow-lg hover:shadow-purple-500/20 transition-all fade-in";

      const photoSrc =
        member.photo && member.photo !== ".jpg"
          ? member.photo
          : "https://via.placeholder.com/100?text=" + (member.name[0] || "A");

      memberElement.innerHTML = `
                <img src="${photoSrc}" alt="${member.name}" class="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-purple-500 object-cover" onerror="this.src='https://via.placeholder.com/100?text=' + ('${member.name}'[0] || 'A')">
                <h3 class="font-bold text-white">${member.name}</h3>
                <p class="text-sm text-purple-300">${member.nim}</p>
                <p class="text-xs text-gray-400 mt-2">"${member.quote || "-"}"</p>
            `;
      membersList.appendChild(memberElement);
    });

    // Show/hide load more button
    if (loadMoreBtn) {
      loadMoreBtn.style.display =
        visibleMembers < memberData.length ? "inline-block" : "none";
    }
  }

  if (memberSearch) memberSearch.addEventListener("input", renderMembers);

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleMembers += 5;
      renderMembers();
    });
  }

  document.addEventListener("firebase:members", (e) => {
    memberData = e.detail || [];
    renderMembers();
  });
}

// Enhanced Contact form functionality
function setupContactForm() {
  const contactForm = document.querySelector("#contact form");
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Add form validation and enhanced UX
  const inputs = contactForm.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    // Add focus effects
    input.addEventListener("focus", () => {
      input.parentElement.classList.add("ring-2", "ring-purple-500");
    });

    input.addEventListener("blur", () => {
      input.parentElement.classList.remove("ring-2", "ring-purple-500");
      validateField(input);
    });

    // Real-time validation
    input.addEventListener("input", () => {
      validateField(input);
    });
  });

  function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.id;
    let isValid = true;
    let errorMessage = "";

    // Remove existing error styling
    field.classList.remove("border-red-500", "border-green-500");
    field.classList.add("border-gray-700");

    // Remove existing error message
    const existingError = field.parentElement.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Validation rules
    switch (fieldName) {
      case "name":
        if (value.length < 2) {
          isValid = false;
          errorMessage = "Nama harus minimal 2 karakter";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = "Format email tidak valid";
        }
        break;
      case "subject":
        if (value.length < 5) {
          isValid = false;
          errorMessage = "Subjek harus minimal 5 karakter";
        }
        break;
      case "message":
        if (value.length < 10) {
          isValid = false;
          errorMessage = "Pesan harus minimal 10 karakter";
        }
        break;
    }

    // Apply validation styling
    if (value.length > 0) {
      if (isValid) {
        field.classList.remove("border-red-500");
        field.classList.add("border-green-500");
      } else {
        field.classList.remove("border-green-500");
        field.classList.add("border-red-500");

        // Add error message
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message text-red-400 text-xs mt-1";
        errorDiv.textContent = errorMessage;
        field.parentElement.appendChild(errorDiv);
      }
    }

    return isValid;
  }

  function validateForm() {
    let isValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    return isValid;
  }

  function showNotification(message, type = "success") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(
      ".contact-notification",
    );
    existingNotifications.forEach((notification) => notification.remove());

    const notification = document.createElement("div");
    notification.className = `contact-notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-all duration-300 ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`;

    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas ${
          type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
        }"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);

    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.add("translate-x-full");
      setTimeout(() => {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      showNotification("Harap lengkapi semua field dengan benar!", "error");
      return;
    }

    // Get form values
    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i>Mengirim...';

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success response
      showNotification(
        `Terima kasih ${name}! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.`,
      );

      // Reset form
      contactForm.reset();

      // Reset validation styling
      inputs.forEach((input) => {
        input.classList.remove("border-green-500", "border-red-500");
        input.classList.add("border-gray-700");
      });
    } catch (error) {
      showNotification("Terjadi kesalahan. Silakan coba lagi nanti.", "error");
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  // Add character counter for message
  const messageField = document.getElementById("message");
  const charCounter = document.createElement("div");
  charCounter.className = "text-xs text-gray-400 mt-1 text-right";
  messageField.parentElement.appendChild(charCounter);

  messageField.addEventListener("input", () => {
    const length = messageField.value.length;
    const maxLength = 500;
    charCounter.textContent = `${length}/${maxLength} karakter`;

    if (length > maxLength * 0.8) {
      charCounter.classList.add("text-yellow-400");
    } else {
      charCounter.classList.remove("text-yellow-400");
    }

    if (length > maxLength) {
      charCounter.classList.add("text-red-400");
    } else {
      charCounter.classList.remove("text-red-400");
    }
  });
}

// Enhanced Materials/Documents section functionality
function setupMaterials() {
  const materialSearch = document.querySelector("#materialSearch");
  const subjectFilter = document.querySelector("#subjectFilter");
  const fileTypeFilter = document.querySelector("#fileTypeFilter");
  const materialsGrid = document.querySelector("#materialsGrid");
  const loadMoreBtn = document.querySelector("#loadMoreMaterialsBtn");

  // Enhanced materials data with actual downloadable files
  const materialsData = [
    {
      id: 1,
      title: "Modul Algoritma Pertemuan 1",
      subject: "Algoritma & Pemrograman",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "10 Januari 2025",
      downloadCount: 156,
      downloadUrl: "materials/modul-algoritma-pertemuan-1.pdf",
      icon: "fas fa-file-pdf",
      iconGradient: "from-red-500 to-purple-500",
      badgeColor: "bg-purple-600",
      description:
        "Modul lengkap algoritma dasar dan implementasi dalam bahasa pemrograman",
      filename: "modul-algoritma-pertemuan-1.pdf",
    },
    {
      id: 2,
      title: "Slide Presentasi Basis Data",
      subject: "Sistem Basis Data",
      type: "PPT",
      size: "5.1 MB",
      uploadDate: "15 Januari 2025",
      downloadCount: 89,
      downloadUrl: "materials/slide-basis-data.pptx",
      icon: "fas fa-file-powerpoint",
      iconGradient: "from-orange-500 to-red-500",
      badgeColor: "bg-orange-600",
      description: "Presentasi lengkap konsep basis data dan normalisasi",
      filename: "slide-basis-data.pptx",
    },
    {
      id: 3,
      title: "Laporan Praktikum Sistem Operasi",
      subject: "Pengantar Sistem Operasi",
      type: "DOC",
      size: "1.8 MB",
      uploadDate: "20 Januari 2025",
      downloadCount: 203,
      downloadUrl: "materials/laporan-praktikum-sistem-operasi.docx",
      icon: "fas fa-file-word",
      iconGradient: "from-blue-500 to-cyan-500",
      badgeColor: "bg-blue-600",
      description: "Laporan praktikum sistem operasi Linux dan Windows",
      filename: "laporan-praktikum-sistem-operasi.docx",
    },
    {
      id: 4,
      title: "Data Mahasiswa TIF-B2",
      subject: "Basis Data",
      type: "XLS",
      size: "0.8 MB",
      uploadDate: "25 Januari 2025",
      downloadCount: 67,
      downloadUrl: "materials/data-mahasiswa-tif-b2.xlsx",
      icon: "fas fa-file-excel",
      iconGradient: "from-green-500 to-emerald-500",
      badgeColor: "bg-green-600",
      description: "Database mahasiswa kelas TIF-B2 untuk praktikum",
      filename: "data-mahasiswa-tif-b2.xlsx",
    },
    {
      id: 5,
      title: "Tutorial Desain UI/UX",
      subject: "Dasar Desain Antarmuka",
      type: "MP4",
      size: "45.2 MB",
      uploadDate: "30 Januari 2025",
      downloadCount: 312,
      downloadUrl: "materials/tutorial-desain-ui-ux.mp4",
      icon: "fas fa-play-circle",
      iconGradient: "from-purple-500 to-pink-500",
      badgeColor: "bg-purple-600",
      description: "Video tutorial lengkap desain antarmuka pengguna",
      filename: "tutorial-desain-ui-ux.mp4",
    },
    {
      id: 6,
      title: "Soal Ujian Matematika Diskrit",
      subject: "Matematika Diskrit",
      type: "PDF",
      size: "3.7 MB",
      uploadDate: "5 Februari 2025",
      downloadCount: 178,
      downloadUrl: "materials/soal-ujian-matematika-diskrit.pdf",
      icon: "fas fa-file-pdf",
      iconGradient: "from-yellow-500 to-orange-500",
      badgeColor: "bg-yellow-600",
      description: "Kumpulan soal dan pembahasan matematika diskrit",
      filename: "soal-ujian-matematika-diskrit.pdf",
    },
    {
      id: 7,
      title: "Kode Sumber Algoritma Lanjutan",
      subject: "Algoritma & Pemrograman Lanjutan",
      type: "ZIP",
      size: "12.5 MB",
      uploadDate: "10 Februari 2025",
      downloadCount: 245,
      downloadUrl: "materials/kode-sumber-algoritma-lanjutan.zip",
      icon: "fas fa-file-archive",
      iconGradient: "from-indigo-500 to-purple-500",
      badgeColor: "bg-indigo-600",
      description: "Source code lengkap algoritma sorting dan searching",
      filename: "kode-sumber-algoritma-lanjutan.zip",
    },
    {
      id: 8,
      title: "Template Sistem Informasi",
      subject: "Dasar Pengembangan Sistem Informasi",
      type: "RAR",
      size: "8.9 MB",
      uploadDate: "15 Februari 2025",
      downloadCount: 134,
      downloadUrl: "materials/template-sistem-informasi.rar",
      icon: "fas fa-file-archive",
      iconGradient: "from-teal-500 to-cyan-500",
      badgeColor: "bg-teal-600",
      description: "Template sistem informasi untuk tugas akhir",
      filename: "template-sistem-informasi.rar",
    },
    {
      id: 9,
      title: "Modul Pendidikan Kewarganegaraan",
      subject: "Pendidikan Kewarganegaraan",
      type: "PDF",
      size: "4.2 MB",
      uploadDate: "20 Februari 2025",
      downloadCount: 98,
      downloadUrl: "materials/modul-pendidikan-kewarganegaraan.pdf",
      icon: "fas fa-file-pdf",
      iconGradient: "from-red-500 to-pink-500",
      badgeColor: "bg-red-600",
      description: "Modul lengkap pendidikan kewarganegaraan semester 2",
      filename: "modul-pendidikan-kewarganegaraan.pdf",
    },
  ];

  let visibleMaterials = 6;
  let filteredMaterials = [...materialsData];

  function getFileTypeIcon(type) {
    const iconMap = {
      PDF: "fas fa-file-pdf",
      PPT: "fas fa-file-powerpoint",
      DOC: "fas fa-file-word",
      XLS: "fas fa-file-excel",
      MP4: "fas fa-play-circle",
      ZIP: "fas fa-file-archive",
      RAR: "fas fa-file-archive",
    };
    return iconMap[type] || "fas fa-file-alt";
  }

  function getIconGradient(type) {
    const gradientMap = {
      PDF: "from-red-500 to-purple-500",
      PPT: "from-orange-500 to-red-500",
      DOC: "from-blue-500 to-cyan-500",
      XLS: "from-green-500 to-emerald-500",
      MP4: "from-purple-500 to-pink-500",
      ZIP: "from-indigo-500 to-purple-500",
      RAR: "from-teal-500 to-cyan-500",
    };
    return gradientMap[type] || "from-gray-500 to-gray-600";
  }

  function getBadgeColor(type) {
    const colorMap = {
      PDF: "bg-purple-600",
      PPT: "bg-orange-600",
      DOC: "bg-blue-600",
      XLS: "bg-green-600",
      MP4: "bg-purple-600",
      ZIP: "bg-indigo-600",
      RAR: "bg-teal-600",
    };
    return colorMap[type] || "bg-gray-600";
  }

  function filterMaterials() {
    const searchTerm = materialSearch.value.toLowerCase();
    const selectedSubject = subjectFilter.value;
    const selectedFileType = fileTypeFilter.value;

    filteredMaterials = materialsData.filter((material) => {
      // Filter by search term
      const matchesSearch =
        material.title.toLowerCase().includes(searchTerm) ||
        material.subject.toLowerCase().includes(searchTerm) ||
        material.description.toLowerCase().includes(searchTerm);

      // Filter by subject
      const matchesSubject =
        selectedSubject === "Semua Mata Kuliah" ||
        material.subject === selectedSubject;

      // Filter by file type
      const matchesFileType =
        selectedFileType === "Semua Tipe File" ||
        material.type === selectedFileType;

      return matchesSearch && matchesSubject && matchesFileType;
    });

    visibleMaterials = 6; // Reset to initial count
    renderMaterials();
  }

  function renderMaterials() {
    const materialsToShow = filteredMaterials.slice(0, visibleMaterials);

    if (materialsGrid) {
      materialsGrid.innerHTML = "";

      materialsToShow.forEach((material) => {
        const materialCard = document.createElement("div");
        materialCard.className =
          "bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-purple-500 group";

        materialCard.innerHTML = `
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-gradient-to-r ${material.iconGradient} rounded-xl flex items-center justify-center mr-4">
                  <i class="${material.icon} text-white text-lg"></i>
                </div>
                <div>
                  <h4 class="font-bold text-white text-lg">${material.title}</h4>
                  <p class="text-purple-400 text-sm font-medium">${material.subject}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="${material.badgeColor} text-white text-xs px-2 py-1 rounded-full">${material.type}</span>
              </div>
            </div>
            
            <div class="space-y-3 mb-4">
              <div class="flex items-center text-gray-300 text-sm">
                <i class="fas fa-calendar-alt mr-2 text-purple-400"></i>
                <span>${material.uploadDate}</span>
              </div>
              <div class="flex items-center text-gray-300 text-sm">
                <i class="fas fa-weight-hanging mr-2 text-purple-400"></i>
                <span>${material.size}</span>
              </div>
              <div class="flex items-center text-gray-300 text-sm">
                <i class="fas fa-download mr-2 text-purple-400"></i>
                <span>${material.downloadCount} kali diunduh</span>
              </div>
            </div>

            <div class="flex space-x-3">
              <button onclick="downloadMaterial('${material.id}')" class="flex-1 bg-gradient-to-r from-purple-600 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-red-700 transition-all duration-300 text-center group-hover:shadow-lg">
                <i class="fas fa-download mr-2"></i>Unduh
              </button>
              <button class="bg-gray-700 text-gray-300 p-3 rounded-xl hover:bg-gray-600 transition-colors" onclick="previewMaterial('${material.id}')">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        `;

        materialsGrid.appendChild(materialCard);
      });

      // Show/hide load more button
      if (loadMoreBtn) {
        loadMoreBtn.style.display =
          visibleMaterials < filteredMaterials.length ? "inline-block" : "none";
      }

      // Show no results message
      if (filteredMaterials.length === 0) {
        const noResultsElement = document.createElement("div");
        noResultsElement.className = "col-span-full text-center py-12";
        noResultsElement.innerHTML = `
          <div class="text-gray-400">
            <i class="fas fa-search text-6xl mb-4 opacity-50"></i>
            <h3 class="text-xl font-bold mb-2">Tidak ada materi ditemukan</h3>
            <p class="text-gray-500">Coba ubah filter pencarian Anda</p>
          </div>
        `;
        materialsGrid.appendChild(noResultsElement);
      }
    }
  }

  function loadMoreMaterials() {
    visibleMaterials += 6;
    renderMaterials();
  }

  // Preview material function (can be expanded)
  window.previewMaterial = function (materialId) {
    const material = materialsData.find((m) => m.id == materialId);
    if (material) {
      // Create a modal or show preview
      alert(`Preview: ${material.title}\n\n${material.description}`);
    }
  };

  // Enhanced download functionality
  window.downloadMaterial = function (materialId) {
    const material = materialsData.find((m) => m.id == materialId);
    if (material) {
      // Track download count
      material.downloadCount++;

      // Create download link
      const link = document.createElement("a");
      link.href = material.downloadUrl;
      link.download = material.filename;
      link.target = "_blank";

      // Add click event for tracking
      link.addEventListener("click", () => {
        showDownloadNotification(material.title);
        console.log(`Download started: ${material.title}`);
      });

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      showDownloadNotification(material.title);
    }
  };

  function showDownloadNotification(title) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-download"></i>
        <span>Downloading: ${title}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("translate-x-full");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Download tracking
  function trackDownload(materialId) {
    const material = materialsData.find((m) => m.id == materialId);
    if (material) {
      material.downloadCount++;
      console.log(`Download tracked for: ${material.title}`);
      // Here you would typically send this data to a server
    }
  }

  // Event listeners
  if (materialSearch) {
    materialSearch.addEventListener("input", filterMaterials);
  }

  if (subjectFilter) {
    subjectFilter.addEventListener("change", filterMaterials);
  }

  if (fileTypeFilter) {
    fileTypeFilter.addEventListener("change", filterMaterials);
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreMaterials);
  }

  // Initialize
  renderMaterials();
}

// Animate elements on scroll
function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
        }
      });
    },
    {
      threshold: 0.1,
    },
  );

  document.querySelectorAll(".fade-in").forEach((el) => {
    el.classList.add(
      "opacity-0",
      "translate-y-10",
      "transition-all",
      "duration-500",
    );
    observer.observe(el);
  });
}

// Global search functionality
function setupGlobalSearch() {
  const globalSearch = document.getElementById("globalSearch");
  const globalSearchBtn = document.getElementById("globalSearchBtn");
  const searchResults = document.getElementById("searchResults");

  // Search data from all sections
  const searchData = [
    // Navigation items
    {
      type: "menu",
      title: "Beranda",
      url: "#home",
      description: "Halaman utama website",
    },
    {
      type: "menu",
      title: "Tentang",
      url: "#about",
      description: "Informasi tentang TIF-B CyberSquad",
    },
    {
      type: "menu",
      title: "Jadwal",
      url: "#schedule",
      description: "Jadwal mata kuliah dan kalender",
    },
    {
      type: "menu",
      title: "Galeri",
      url: "#gallery",
      description: "Foto dan dokumentasi kegiatan",
    },
    {
      type: "menu",
      title: "Anggota",
      url: "#members",
      description: "Daftar anggota TIF-B CyberSquad",
    },
    {
      type: "menu",
      title: "Kontak",
      url: "#contact",
      description: "Informasi kontak dan lokasi",
    },

    // About section
    {
      type: "about",
      title: "Visi Kelas",
      url: "#about",
      description:
        "Menjadi kelas unggulan yang berprestasi akademik dan non-akademik",
    },
    {
      type: "about",
      title: "Misi Kelas",
      url: "#about",
      description:
        "Membangun budaya belajar yang kolaboratif dan mengembangkan keterampilan teknologi",
    },
    {
      type: "about",
      title: "Ketua Kelas",
      url: "#about",
      description: "TULUS HATI BERKAT ZEGA - Ketua Kelas TIF-B2",
    },
    {
      type: "about",
      title: "Sekretaris",
      url: "#about",
      description: "MANJAYA HAREFA - Sekretaris Kelas TIF-B2",
    },
    {
      type: "about",
      title: "Bendahara",
      url: "#about",
      description: "SELVIN YULINDA GEA - Bendahara Kelas TIF-B2",
    },

    // Schedule section
    {
      type: "schedule",
      title: "Senin",
      url: "#schedule",
      description: "Dasar Pengembangan Sistem Informasi, Matematika Diskrit",
    },
    {
      type: "schedule",
      title: "Selasa",
      url: "#schedule",
      description:
        "Pengantar Sistem Operasi, Pendidikan Kewarganegaraan, Dasar Desain Antarmuka",
    },
    {
      type: "schedule",
      title: "Rabu",
      url: "#schedule",
      description: "Bahasa Inggris, Algoritma & Pemrograman Lanjutan",
    },
    {
      type: "schedule",
      title: "kamis",
      url: "#schedule",
      description: "Bahasa Inggris, Algoritma & Pemrograman Lanjutan",
    },
    {
      type: "schedule",
      title: "Jumat",
      url: "#schedule",
      description: "Praktikum Basis Data, Sistem Basis Data",
    },
    {
      type: "schedule",
      title: "Sabtu",
      url: "#schedule",
      description: "Praktikum Algoritma & Pemrograman Lanjutan",
    },

    // Contact section
    {
      type: "contact",
      title: "Email",
      url: "#contact",
      description: "tifbfamily@gmail.com",
    },
    {
      type: "contact",
      title: "WhatsApp",
      url: "#contact",
      description: "+62 822-6108-1469",
    },
    {
      type: "contact",
      title: "Alamat Kampus",
      url: "#contact",
      description:
        "Universitas Nias, Kota Gunungsitoli, Pulau Nias, Sumatera Utara",
    },
    {
      type: "contact",
      title: "Instagram",
      url: "#contact",
      description: "universitasnias",
    },

    // Gallery section
    {
      type: "gallery",
      title: "Aktivitas Kelas",
      url: "#gallery",
      description: "Foto kegiatan belajar dan praktikum",
    },
    {
      type: "gallery",
      title: "Excellent",
      url: "#gallery",
      description: "Foto kegiatan excellent dan prestasi",
    },
    {
      type: "gallery",
      title: "Studi",
      url: "#gallery",
      description: "Foto kegiatan studi dan penelitian",
    },
    {
      type: "gallery",
      title: "Sosial",
      url: "#gallery",
      description: "Foto kegiatan sosial dan kemasyarakatan",
    },
  ];

  function getTypeIcon(type) {
    const iconMap = {
      menu: "fas fa-home",
      about: "fas fa-info-circle",
      schedule: "fas fa-calendar-alt",
      material: "fas fa-file-alt",
      contact: "fas fa-envelope",
      gallery: "fas fa-images",
    };
    return iconMap[type] || "fas fa-search";
  }

  function getTypeColor(type) {
    const colorMap = {
      menu: "text-blue-400",
      about: "text-green-400",
      schedule: "text-purple-400",
      material: "text-orange-400",
      contact: "text-red-400",
      gallery: "text-pink-400",
    };
    return colorMap[type] || "text-gray-400";
  }

  function performSearch(searchTerm) {
    if (searchTerm.length < 2) {
      searchResults.classList.add("hidden");
      return;
    }

    const results = searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    displaySearchResults(results);
  }

  function displaySearchResults(results) {
    searchResults.innerHTML = "";

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="p-4 text-center text-gray-400">
          <i class="fas fa-search text-2xl mb-2"></i>
          <p>Tidak ada hasil ditemukan</p>
        </div>
      `;
    } else {
      results.forEach((item) => {
        const resultItem = document.createElement("div");
        resultItem.className =
          "p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors";
        resultItem.innerHTML = `
          <div class="flex items-center space-x-3">
            <div class="${getTypeColor(item.type)}">
              <i class="${getTypeIcon(item.type)}"></i>
            </div>
            <div class="flex-1">
              <div class="font-medium text-white">${item.title}</div>
              <div class="text-sm text-gray-400">${item.description}</div>
            </div>
            <div class="text-gray-500">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        `;

        resultItem.addEventListener("click", () => {
          // Smooth scroll to section
          const targetElement = document.querySelector(item.url);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: "smooth",
            });
          }

          // Hide search results
          searchResults.classList.add("hidden");
          globalSearch.value = "";
        });

        searchResults.appendChild(resultItem);
      });
    }

    searchResults.classList.remove("hidden");
  }

  // Event listeners
  globalSearch.addEventListener("input", (e) => {
    performSearch(e.target.value);
  });

  globalSearchBtn.addEventListener("click", () => {
    performSearch(globalSearch.value);
  });

  // Hide search results when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !globalSearch.contains(e.target) &&
      !searchResults.contains(e.target) &&
      !globalSearchBtn.contains(e.target)
    ) {
      searchResults.classList.add("hidden");
    }
  });

  // Keyboard navigation
  globalSearch.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchResults.classList.add("hidden");
      globalSearch.blur();
    }
  });

  // Focus management
  globalSearch.addEventListener("focus", () => {
    if (globalSearch.value.length >= 2) {
      performSearch(globalSearch.value);
    }
  });
}

// Initialize all functions when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  createStars();
  setupMusic();
  setupMobileMenu();
  setupSmoothScrolling();
  setupScheduleTabs();
  setupGalleryFilter();
  setupSlideshow();
  setupCalendar();
  setupMembers();
  setupContactForm();
  setupMaterials();
  setupGlobalSearch();
  setupScrollAnimations();

  // ── Firebase Realtime: Override pengurus kelas when DB data arrives ──
  document.addEventListener("firebase:pengurus", (e) => {
    const pengurusData = e.detail;
    if (!pengurusData || !pengurusData.length) return;

    const grid = document.getElementById("pengurusGrid");
    if (!grid) return;

    grid.innerHTML = pengurusData
      .map(
        (p) => `
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300 fade-in">
            ${
              p.photo
                ? `<img src="${p.photo}" alt="${p.role}" class="w-32 h-32 rounded-full mx-auto mb-4 border-2 border-purple-500 object-cover" onerror="this.style.display='none'" />`
                : `<div class="w-32 h-32 rounded-full mx-auto mb-4 border-2 border-purple-500 flex items-center justify-center bg-gradient-to-r from-purple-500 to-red-500 text-3xl font-bold text-white">${(p.name || "?")[0]}</div>`
            }
            <h4 class="font-bold text-lg uppercase">${p.name}</h4>
            <p class="text-purple-400 mb-2 font-semibold">${p.role}</p>
            <p class="text-sm text-gray-300 italic">
              "${p.quote || "-"}"
            </p>
          </div>`,
      )
      .join("");
  });

  // Jika db-sync selesai duluan sebelum file ini, panggil manual rendering dari variabel penyimpannya
  if (window._firebasePengurus) {
    document.dispatchEvent(
      new CustomEvent("firebase:pengurus", {
        detail: window._firebasePengurus,
      }),
    );
  }

  // Activate first schedule tab
  const firstTab = document.querySelector('.schedule-day[data-day="senin"]');
  if (firstTab) firstTab.click();
});

// Ensure admin link works on mobile
document.addEventListener("DOMContentLoaded", () => {
  const adminLink = document.querySelector(".admin-secret-link");
  if (adminLink) {
    adminLink.addEventListener("touchend", () => {
      window.location.href = "admin.html";
    });
  }
});
