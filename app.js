document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let isLoggedIn = false;
  let userMobile = '';
  let otpTimerInterval = null;

  // DOM Elements
  const sections = document.querySelectorAll('.app-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobNavItems = document.querySelectorAll('.mobile-nav-item');
  const locationText = document.getElementById('current-location-text');
  const locationOverlayText = document.querySelector('.location-overlay-chip span');
  const langText = document.getElementById('current-lang-text');
  
  // Login & OTP Elements
  const loginSection = document.getElementById('login-section');
  const otpSection = document.getElementById('otp-section');
  const loginMobile = document.getElementById('login-mobile');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const btnSendOtp = document.getElementById('btn-send-otp');
  const btnBackToLogin = document.getElementById('btn-back-to-login');
  const displayMobileNumber = document.getElementById('display-mobile-number');
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpErrorMsg = document.getElementById('otp-error-msg');
  const otpCountdown = document.getElementById('otp-countdown');
  const otpTimerText = document.getElementById('otp-timer-text');
  const btnResendOtp = document.getElementById('btn-resend-otp');
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  const profileAvatar = document.getElementById('navbar-profile-btn');
  const avatarInitial = document.getElementById('avatar-initial');

  // SPA Navigation Map
  const hashToSectionMap = {
    '#home': 'landing-section',
    '#dashboard': 'dashboard-section',
    '#myfarm': 'my-farm-section',
    '#advisory': 'pdf-report-section',
    '#scan': 'disease-scan-section',
    '#weather': 'weather-section',
    '#schemes': 'schemes-section',
    '#expert': 'expert-help-section',
    '#profile': 'profile-section',
    '#ai': 'ai-chat-section',
    '#settings': 'settings-section'
  };

  // Single Page routing helper
  const navigateToSection = (sectionId) => {
    sections.forEach(sec => {
      sec.style.display = 'none';
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
      activeSection.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Sync navbar active state
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (hashToSectionMap[href] === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobNavItems.forEach(item => {
      const href = item.getAttribute('href');
      if (hashToSectionMap[href] === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  // Navigations routing event bindings (Desktop)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHash = link.getAttribute('href');
      const targetSection = hashToSectionMap[targetHash];
      
      if (targetHash === '#home') {
        navigateToSection('landing-section');
      } else {
        if (!isLoggedIn) {
          showToast('🔒 Access Restricted. Please log in first.', 3000, 'Authorization');
          navigateToSection('login-section');
        } else {
          navigateToSection(targetSection);
          // Special load hooks
          if (targetSection === 'dashboard-section') updateDashboardView();
          if (targetSection === 'weather-section') updateWeatherView();
          if (targetSection === 'my-farm-section') updateMapView();
          if (targetSection === 'profile-section') updateProfileView();
          if (targetSection === 'pdf-report-section') updateReportView();
        }
      }
    });
  });

  // Navigations routing event bindings (Mobile)
  mobNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHash = item.getAttribute('href');
      const targetSection = hashToSectionMap[targetHash];
      
      if (targetHash === '#home') {
        navigateToSection('landing-section');
      } else {
        if (!isLoggedIn) {
          showToast('🔒 Access Restricted. Please log in first.', 3000, 'Authorization');
          navigateToSection('login-section');
        } else {
          navigateToSection(targetSection);
          if (targetSection === 'dashboard-section') updateDashboardView();
          if (targetSection === 'weather-section') updateWeatherView();
          if (targetSection === 'my-farm-section') updateMapView();
          if (targetSection === 'profile-section') updateProfileView();
        }
      }
    });
  });

  // Modal Functionality Helper
  const setupModal = (triggerId, modalId, closeId, optionsSelector, onSelect) => {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeId);
    const options = document.querySelectorAll(optionsSelector);

    if (trigger && modal && closeBtn) {
      trigger.addEventListener('click', () => {
        modal.classList.add('active');
      });

      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });

      options.forEach(option => {
        option.addEventListener('click', () => {
          options.forEach(opt => opt.classList.remove('selected'));
          option.classList.add('selected');
          
          const selectedValue = option.getAttribute('data-value') || option.textContent.trim();
          onSelect(selectedValue);
          
          setTimeout(() => {
            modal.classList.remove('active');
          }, 200);
        });
      });
    }
  };

  // Setup Location Selector
  setupModal(
    'navbar-location-btn',
    'location-modal',
    'location-modal-close',
    '#location-modal .modal-option-item',
    (selectedLocation) => {
      if (locationText) locationText.textContent = selectedLocation;
      if (locationOverlayText) {
        const district = selectedLocation.split(',')[0];
        locationOverlayText.textContent = `📍 ${district} Fields`;
      }
      farmerProfile.district = selectedLocation.split(',')[0].trim();
      farmerProfile.state = selectedLocation.split(',')[1].trim();
      
      const dashLocText = document.getElementById('dash-location-text');
      if (dashLocText) dashLocText.textContent = selectedLocation;

      showToast(`Location switched to: ${selectedLocation}`);
      if (isLoggedIn) {
        updateDashboardView();
      }
    }
  );

  // Setup Modal GPS Detect Button
  const modalDetectGpsBtn = document.getElementById('modal-detect-gps-btn');
  if (modalDetectGpsBtn) {
    modalDetectGpsBtn.addEventListener('click', () => {
      performAccurateLocationTrack(modalDetectGpsBtn, () => {
        const modal = document.getElementById('location-modal');
        if (modal) modal.classList.remove('active');
      });
    });
  }

  // Setup Language Selector
  setupModal(
    'navbar-lang-btn',
    'lang-modal',
    'lang-modal-close',
    '#lang-modal .modal-option-item',
    (selectedLang) => {
      if (langText) langText.textContent = selectedLang;
      showToast(`Language changed to: ${selectedLang}`);
      updateLanguageStrings(selectedLang);
      
      const setLangSelect = document.getElementById('settings-lang-select');
      if (setLangSelect) {
        setLangSelect.value = selectedLang.includes('Gujarati') ? 'Gujarati (ગુજરાતી)' : 'English';
      }
    }
  );

  // Toggle Dark Mode via Profile Avatar (Shortcut for testing UI styles)
  if (profileAvatar) {
    profileAvatar.addEventListener('click', () => {
      toggleDarkMode();
    });
  }

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Sync settings button if visible
    const settingsThemeBtn = document.getElementById('settings-btn-theme');
    if (settingsThemeBtn) {
      settingsThemeBtn.innerHTML = isDarkMode ? '<i class="fa-solid fa-moon"></i> Dark Mode' : '<i class="fa-solid fa-sun"></i> Light Mode';
    }

    showToast(isDarkMode ? '🌙 Dark Mode (Farm at Dusk) enabled' : '☀️ Light Mode (Digital Krishi) enabled');
  };

  // Mini-Chat Interaction on Landing Page
  const miniChatSend = document.getElementById('mini-chat-send');
  const miniChatInput = document.getElementById('mini-chat-input');
  
  const handleMiniChatSubmit = () => {
    if (!miniChatInput) return;
    const query = miniChatInput.value.trim();
    if (query === '') return;

    showToast(`Sending: "${query}"`);
    miniChatInput.value = '';

    setTimeout(() => {
      const response = generateAIResponse(query);
      showToast(response, 5000, '🤖 Krishi AI');
    }, 1000);
  };

  if (miniChatSend && miniChatInput) {
    miniChatSend.addEventListener('click', handleMiniChatSubmit);
    miniChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleMiniChatSubmit();
      }
    });
  }

  // Welcome page CTAs
  const btnGetStarted = document.getElementById('btn-get-started');
  const btnLearnMore = document.getElementById('btn-learn-more');

  if (btnGetStarted) {
    btnGetStarted.addEventListener('click', () => {
      if (isLoggedIn) {
        navigateToSection('dashboard-section');
        updateDashboardView();
      } else {
        navigateToSection('login-section');
      }
    });
  }

  if (btnLearnMore) {
    btnLearnMore.addEventListener('click', () => {
      showToast('Krishi Sahayak is a Decision Support System connecting local weather, soil context, AI diagnosis, and human experts.', 6000);
    });
  }

  // Floating AI Button
  const floatingAiBtn = document.getElementById('floating-ai-btn');
  if (floatingAiBtn) {
    floatingAiBtn.addEventListener('click', () => {
      if (isLoggedIn) {
        navigateToSection('ai-chat-section');
      } else {
        showToast('🤖 Please log in first to chat with Krishi AI Assistant.');
        navigateToSection('login-section');
      }
    });
  }

  // ==========================================
  // PHASE 2 - LOGIN & OTP LOGIC
  // ==========================================

  // Validation function for mobile number
  const validateMobile = (num) => {
    // Basic format: exactly 10 digits, starting with 6-9
    const regex = /^[6-9]\d{9}$/;
    return regex.test(num);
  };

  // Only allow digits in Mobile input
  if (loginMobile) {
    loginMobile.addEventListener('input', () => {
      loginMobile.value = loginMobile.value.replace(/\D/g, ''); // strip non-digits
      if (loginMobile.value.length > 0) {
        loginErrorMsg.textContent = '';
      }
    });
  }

  // Send OTP API binding
  if (btnSendOtp && loginMobile) {
    btnSendOtp.addEventListener('click', () => {
      const number = loginMobile.value.trim();
      if (!validateMobile(number)) {
        loginErrorMsg.textContent = '❌ Please enter a valid 10-digit Indian mobile number.';
        return;
      }

      // Store number and transition
      userMobile = number;
      if (displayMobileNumber) {
        displayMobileNumber.textContent = `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
      }

      btnSendOtp.disabled = true;
      btnSendOtp.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      // Hit Backend Auth OTP Endpoint
      fetch('http://localhost:3000/api/v1/auth/farmer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: number })
      })
      .then(res => {
        if (!res.ok) throw new Error('Backend error');
        return res.json();
      })
      .then(data => {
        showToast(`OTP Code sent successfully to +91 ${number}`);
        proceedToOtpVerify();
      })
      .catch(err => {
        // Fallback simulation mode
        showToast(`[Demo Mode] Backend offline. Simulated SMS code: "123456" sent to +91 ${number}`, 4500, 'SMS Service');
        proceedToOtpVerify();
      })
      .finally(() => {
        btnSendOtp.disabled = false;
        btnSendOtp.innerHTML = 'Send OTP <i class="fa-solid fa-paper-plane"></i>';
      });
    });
  }

  const proceedToOtpVerify = () => {
    // Clear OTP inputs and focus first box
    otpInputs.forEach(input => input.value = '');
    otpErrorMsg.textContent = '';
    navigateToSection('otp-section');
    setTimeout(() => {
      if (otpInputs[0]) otpInputs[0].focus();
    }, 300);

    // Start Resend timer
    startResendTimer();
  };

  // Change Number (Back Button)
  if (btnBackToLogin) {
    btnBackToLogin.addEventListener('click', () => {
      clearInterval(otpTimerInterval);
      navigateToSection('login-section');
    });
  }

  // OTP inputs keyboard auto-advance & constraints logic
  otpInputs.forEach((input, index) => {
    // Force numbers only
    input.addEventListener('input', (e) => {
      input.value = input.value.replace(/\D/g, '');
      if (input.value.length === 1) {
        // Shift focus forward
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      }
      otpErrorMsg.textContent = '';
    });

    // Keyboard navigation (backspace deletes and shifts backward)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value.length === 0) {
        if (index > 0) {
          otpInputs[index - 1].focus();
          otpInputs[index - 1].value = '';
        }
      }
    });
  });

  // Resend Timer logic
  const startResendTimer = () => {
    clearInterval(otpTimerInterval);
    let timeLeft = 30;
    
    if (otpCountdown && otpTimerText && btnResendOtp) {
      otpCountdown.textContent = timeLeft;
      otpTimerText.style.display = 'block';
      btnResendOtp.style.display = 'none';

      otpTimerInterval = setInterval(() => {
        timeLeft--;
        otpCountdown.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(otpTimerInterval);
          otpTimerText.style.display = 'none';
          btnResendOtp.style.display = 'inline-block';
        }
      }, 1000);
    }
  };

  // Click Resend Action
  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', () => {
      showToast(`SMS containing a new code sent to +91 ${userMobile}`);
      // Clear inputs
      otpInputs.forEach(input => input.value = '');
      otpInputs[0].focus();
      otpErrorMsg.textContent = '';
      startResendTimer();
    });
  }

  // Verify OTP API binding
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', () => {
      // Gather inputs
      let code = '';
      otpInputs.forEach(input => code += input.value.trim());

      if (code.length < 6) {
        otpErrorMsg.textContent = '❌ Please enter the full 6-digit OTP code.';
        return;
      }

      btnVerifyOtp.disabled = true;
      btnVerifyOtp.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';

      fetch('http://localhost:3000/api/v1/auth/farmer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: userMobile, otp: code })
      })
      .then(res => {
        if (!res.ok) throw new Error('Verification failed');
        return res.json();
      })
      .then(data => {
        // Save tokens to session storage
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        
        // Populate profile if exists
        if (data.farmer) {
          farmerProfile.name = data.farmer.name || '';
          farmerProfile.pincode = data.farmer.pincode || '';
          farmerProfile.district = data.farmer.district || '';
          farmerProfile.state = data.farmer.state || '';
          farmerProfile.village = data.farmer.village || '';
          farmerProfile.landArea = parseFloat(data.farmer.landArea) || 5;
          farmerProfile.soilType = data.farmer.soilType || '';
          farmerProfile.waterSources = data.farmer.waterSources ? data.farmer.waterSources.split(',') : [];
          farmerProfile.waterReliability = data.farmer.waterReliability || '';
        }
        
        completeLoginFlow();
      })
      .catch(err => {
        // Fallback for offline demo (accepts code 123456 or matches any code in demo mode)
        if (code === '123456' || code.length === 6) {
          completeLoginFlow();
        } else {
          otpErrorMsg.textContent = '❌ Invalid OTP code. Try "123456".';
          otpInputs.forEach(input => input.value = '');
          otpInputs[0].focus();
        }
      })
      .finally(() => {
        btnVerifyOtp.disabled = false;
        btnVerifyOtp.innerHTML = 'Verify & Continue <i class="fa-solid fa-arrow-right"></i>';
      });
    });
  }

  const completeLoginFlow = () => {
    isLoggedIn = true;
    // Add verification success effects
    otpInputs.forEach(input => input.classList.add('success-flash'));

    setTimeout(() => {
      // Update user avatar representation
      if (avatarInitial) avatarInitial.textContent = farmerProfile.name ? farmerProfile.name.charAt(0).toUpperCase() : 'R';
      
      showToast('✅ Login successful! Checking profile state...', 2500, 'Welcome');

      // Remove class flash
      otpInputs.forEach(input => input.classList.remove('success-flash'));

      // Change Profile Avatar border green for status representation
      if (profileAvatar) {
        profileAvatar.style.borderColor = 'var(--krishi-green-700)';
      }

      // Pre-fill fields in onboarding
      const obMobileDisplay = document.getElementById('ob-mobile-display');
      if (obMobileDisplay) obMobileDisplay.value = userMobile;
      
      const obNameInput = document.getElementById('ob-name');
      if (obNameInput && farmerProfile.name) obNameInput.value = farmerProfile.name;

      // Skip onboarding wizard if already filled
      if (farmerProfile.name && farmerProfile.soilType) {
        navigateToSection('dashboard-section');
        updateDashboardView();
      } else {
        navigateToSection('onboarding-section');
        initOnboarding();
      }
    }, 500);
  };

  // ==========================================
  // PHASE 3 — FARMER ONBOARDING STATE
  // ==========================================

  const farmerProfile = {
    name: '',
    mobile: '',
    pincode: '',
    state: '',
    district: '',
    village: '',
    latitude: null,
    longitude: null,
    landArea: 5.0,
    soilType: '',
    waterSources: [],
    waterReliability: ''
  };

  // Accurate Geolocation Tracker Function with Real Reverse Geocoding
  const performAccurateLocationTrack = (btnElement, callback) => {
    if (btnElement) {
      btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Detecting Precise GPS Location...';
      btnElement.disabled = true;
    }

    if (!navigator.geolocation) {
      showToast('❌ Geolocation is not supported by your browser.', 4000, 'GPS Error');
      if (btnElement) {
        btnElement.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use Current Location';
        btnElement.disabled = false;
      }
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        showToast(`📡 GPS Lock Acquired (±${Math.round(accuracy)}m). Geocoding location...`, 3000, 'GPS Active');

        try {
          let district = '';
          let state = '';
          let pincode = '';
          let village = '';

          // 1. Try BigDataCloud reverse geocode client API
          try {
            const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            if (bdcRes.ok) {
              const geoData = await bdcRes.json();
              district = geoData.locality || geoData.city || geoData.principalSubdivisionCode || '';
              state = geoData.principalSubdivision || '';
              pincode = geoData.postcode || '';
              village = geoData.locality || '';
            }
          } catch (e) {
            console.warn('BigDataCloud geocode failed', e);
          }

          // 2. Try OpenStreetMap Nominatim fallback
          if (!district || !state) {
            try {
              const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
              if (osmRes.ok) {
                const osmData = await osmRes.json();
                const addr = osmData.address || {};
                district = district || addr.county || addr.state_district || addr.city || addr.town || addr.village || '';
                state = state || addr.state || '';
                pincode = pincode || addr.postcode || '';
                village = village || addr.village || addr.suburb || addr.neighbourhood || '';
              }
            } catch (e) {
              console.warn('Nominatim geocode failed', e);
            }
          }

          district = district || 'Tracked Region';
          state = state || '';

          // Save accurate details to global profile
          farmerProfile.latitude = lat;
          farmerProfile.longitude = lng;
          farmerProfile.district = district;
          farmerProfile.state = state;
          if (pincode) farmerProfile.pincode = pincode;
          if (village) farmerProfile.village = village;

          const locationString = state ? `${district}, ${state}` : district;

          // Sync Header & Overlay Text
          if (locationText) locationText.textContent = locationString;
          if (locationOverlayText) locationOverlayText.textContent = `📍 ${district} Fields`;

          const dashLocText = document.getElementById('dash-location-text');
          if (dashLocText) dashLocText.textContent = locationString;

          // Populate Onboarding Inputs if visible
          const stateEl = document.getElementById('ob-state');
          const districtEl = document.getElementById('ob-district');
          const pincodeEl = document.getElementById('ob-pincode');
          const villageEl = document.getElementById('ob-village');

          if (districtEl) districtEl.value = district;
          if (pincodeEl && pincode) pincodeEl.value = pincode;
          if (villageEl && village) villageEl.value = village;
          if (stateEl && state) {
            let matchFound = false;
            for (let i = 0; i < stateEl.options.length; i++) {
              if (stateEl.options[i].text.toLowerCase() === state.toLowerCase()) {
                stateEl.selectedIndex = i;
                matchFound = true;
                break;
              }
            }
            if (!matchFound) {
              const newOpt = new Option(state, state);
              stateEl.add(newOpt);
              stateEl.value = state;
            }
          }

          showMapPreview(district, state || 'India');
          showToast(`🎯 Location tracked: ${locationString} (${lat.toFixed(4)}, ${lng.toFixed(4)})`, 4000, 'GPS Success');

          if (btnElement) {
            btnElement.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${district}, ${state}`;
            btnElement.style.borderColor = 'var(--krishi-green-700)';
            btnElement.style.color = 'var(--krishi-green-700)';
            btnElement.disabled = false;
          }

          if (isLoggedIn) {
            updateDashboardView();
          }

          if (typeof callback === 'function') callback(locationString, lat, lng);

        } catch (err) {
          console.error('Reverse Geocode Exception:', err);
          farmerProfile.latitude = lat;
          farmerProfile.longitude = lng;
          const locStr = `Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`;
          
          if (locationText) locationText.textContent = locStr;
          showToast(`📍 GPS Coordinates Captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 4000, 'GPS Acquired');

          if (btnElement) {
            btnElement.innerHTML = `<i class="fa-solid fa-circle-check"></i> GPS Tracked`;
            btnElement.disabled = false;
          }
          if (typeof callback === 'function') callback(locStr, lat, lng);
        }
      },
      (error) => {
        let errMessage = 'Unable to fetch your GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          errMessage = '⚠️ Geolocation permission denied. Please allow location access in browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMessage = '⚠️ Location position unavailable. Please check GPS connection.';
        } else if (error.code === error.TIMEOUT) {
          errMessage = '⚠️ GPS location request timed out.';
        }
        showToast(errMessage, 5000, 'GPS Alert');

        if (btnElement) {
          btnElement.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use Current Location';
          btnElement.disabled = false;
        }
      },
      options
    );
  };

  // Automatically trigger accurate GPS detection on startup
  if (navigator.geolocation) {
    performAccurateLocationTrack();
  }

  let currentWizardStep = 1;
  const totalWizardSteps = 5;

  const wizardStepEls = document.querySelectorAll('.wizard-step');
  const progressStepEls = document.querySelectorAll('.progress-step');
  const progressFill = document.getElementById('onboarding-progress-fill');

  function initOnboarding() {
    currentWizardStep = 1;
    showWizardStep(1);
  }

  function showWizardStep(stepNum) {
    currentWizardStep = stepNum;

    // Show/hide step panels
    wizardStepEls.forEach(el => {
      el.style.display = 'none';
    });
    const activeStep = document.getElementById(`wizard-step-${stepNum}`);
    if (activeStep) {
      activeStep.style.display = 'block';
      // Re-trigger animation
      const card = activeStep.querySelector('.wizard-card');
      if (card) {
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = 'fadeSlideIn 0.35s var(--ease-curve) both';
      }
    }

    // Update progress bar fill
    const pct = (stepNum / totalWizardSteps) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;

    // Update step dots
    progressStepEls.forEach(el => {
      const s = parseInt(el.getAttribute('data-step'));
      el.classList.remove('active', 'completed');
      if (s === stepNum) el.classList.add('active');
      else if (s < stepNum) el.classList.add('completed');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- STEP 1: Farmer Details ----
  const obStep1Next = document.getElementById('ob-step1-next');
  if (obStep1Next) {
    obStep1Next.addEventListener('click', () => {
      const nameInput = document.getElementById('ob-name');
      const nameError = document.getElementById('ob-name-error');
      const name = nameInput ? nameInput.value.trim() : '';

      if (!name || name.length < 2) {
        if (nameError) nameError.textContent = '❌ Please enter your name.';
        return;
      }
      nameError.textContent = '';

      farmerProfile.name = name;
      farmerProfile.mobile = userMobile;

      // Update avatar initial
      if (avatarInitial) avatarInitial.textContent = name.charAt(0).toUpperCase();

      showWizardStep(2);
    });
  }

  // ---- STEP 2: Farm Location ----
  const obDetectLocation = document.getElementById('ob-detect-location');
  if (obDetectLocation) {
    obDetectLocation.addEventListener('click', () => {
      performAccurateLocationTrack(obDetectLocation);
    });
  }

  // Auto-show map preview when district + state are filled
  const obDistrict = document.getElementById('ob-district');
  const obState = document.getElementById('ob-state');
  const obPincode = document.getElementById('ob-pincode');

  function checkShowMap() {
    const d = obDistrict ? obDistrict.value.trim() : '';
    const s = obState ? obState.value : '';
    if (d && s) showMapPreview(d, s);
  }

  if (obDistrict) obDistrict.addEventListener('input', checkShowMap);
  if (obState) obState.addEventListener('change', checkShowMap);
  if (obPincode) {
    obPincode.addEventListener('input', () => {
      obPincode.value = obPincode.value.replace(/\D/g, '');
    });
  }

  function showMapPreview(district, state) {
    const mapPreview = document.getElementById('map-preview');
    const mapLabelDistrict = document.getElementById('map-label-district');
    const mapLabelState = document.getElementById('map-label-state');
    if (mapPreview) {
      mapLabelDistrict.textContent = district;
      mapLabelState.textContent = state;
      mapPreview.style.display = 'block';
    }
  }

  const obStep2Back = document.getElementById('ob-step2-back');
  const obStep2Next = document.getElementById('ob-step2-next');

  if (obStep2Back) obStep2Back.addEventListener('click', () => showWizardStep(1));

  if (obStep2Next) {
    obStep2Next.addEventListener('click', () => {
      const pincode = obPincode ? obPincode.value.trim() : '';
      const state = obState ? obState.value : '';
      const district = obDistrict ? obDistrict.value.trim() : '';
      const pincodeError = document.getElementById('ob-pincode-error');

      if (pincode.length !== 6) {
        if (pincodeError) pincodeError.textContent = '❌ Pincode must be 6 digits.';
        return;
      }
      pincodeError.textContent = '';

      farmerProfile.pincode = pincode;
      farmerProfile.state = state || 'Kerala';
      farmerProfile.district = district || 'Palakkad';
      farmerProfile.village = document.getElementById('ob-village') ? document.getElementById('ob-village').value.trim() : 'Mannarkkad';

      showWizardStep(3);
    });
  }

  // ---- STEP 3: Land Details ----
  const landSlider = document.getElementById('ob-land-slider');
  const landInput = document.getElementById('ob-land-input');
  const landDisplay = document.getElementById('land-area-display');

  function updateLandDisplay(val) {
    const v = parseFloat(val) || 0.5;
    farmerProfile.landArea = v;
    if (landDisplay) landDisplay.textContent = v.toFixed(1);
    if (landSlider && v <= 50) landSlider.value = v;
    if (landInput) landInput.value = v;
  }

  if (landSlider) {
    landSlider.addEventListener('input', () => updateLandDisplay(landSlider.value));
  }
  if (landInput) {
    landInput.addEventListener('input', () => updateLandDisplay(landInput.value));
  }

  const landMinus = document.getElementById('land-minus');
  const landPlus = document.getElementById('land-plus');

  if (landMinus) {
    landMinus.addEventListener('click', () => {
      const current = parseFloat(landInput ? landInput.value : 5) || 5;
      updateLandDisplay(Math.max(0.5, current - 0.5));
    });
  }
  if (landPlus) {
    landPlus.addEventListener('click', () => {
      const current = parseFloat(landInput ? landInput.value : 5) || 5;
      updateLandDisplay(Math.min(100, current + 0.5));
    });
  }

  // Initialize display
  updateLandDisplay(5);

  const obStep3Back = document.getElementById('ob-step3-back');
  const obStep3Next = document.getElementById('ob-step3-next');

  if (obStep3Back) obStep3Back.addEventListener('click', () => showWizardStep(2));

  if (obStep3Next) {
    obStep3Next.addEventListener('click', () => {
      showWizardStep(4);
    });
  }

  // ---- STEP 4: Soil Type ----
  const soilSelector = document.getElementById('soil-selector');
  let selectedSoil = '';

  if (soilSelector) {
    soilSelector.querySelectorAll('.selector-card').forEach(card => {
      card.addEventListener('click', () => {
        soilSelector.querySelectorAll('.selector-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSoil = card.getAttribute('data-value');
        farmerProfile.soilType = selectedSoil;
        document.getElementById('ob-soil-error').textContent = '';
      });
    });
  }

  const obStep4Back = document.getElementById('ob-step4-back');
  const obStep4Next = document.getElementById('ob-step4-next');

  if (obStep4Back) obStep4Back.addEventListener('click', () => showWizardStep(3));

  if (obStep4Next) {
    obStep4Next.addEventListener('click', () => {
      if (!selectedSoil) {
        document.getElementById('ob-soil-error').textContent = '❌ Please select your soil type.';
        return;
      }
      showWizardStep(5);
    });
  }

  // ---- STEP 5: Water Supply ----
  const waterSelector = document.getElementById('water-selector');
  let selectedWaterSources = [];
  let selectedReliability = '';

  if (waterSelector) {
    waterSelector.querySelectorAll('.selector-card').forEach(card => {
      card.addEventListener('click', () => {
        const val = card.getAttribute('data-value');
        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
          selectedWaterSources = selectedWaterSources.filter(v => v !== val);
        } else {
          card.classList.add('selected');
          selectedWaterSources.push(val);
        }
        farmerProfile.waterSources = [...selectedWaterSources];
        document.getElementById('ob-water-error').textContent = '';
      });
    });
  }

  const reliabilitySelector = document.getElementById('reliability-selector');
  if (reliabilitySelector) {
    reliabilitySelector.querySelectorAll('.reliability-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        reliabilitySelector.querySelectorAll('.reliability-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedReliability = btn.getAttribute('data-value');
        farmerProfile.waterReliability = selectedReliability;
        document.getElementById('ob-reliability-error').textContent = '';
      });
    });
  }

  const obStep5Back = document.getElementById('ob-step5-back');
  const obStep5Finish = document.getElementById('ob-step5-finish');

  if (obStep5Back) obStep5Back.addEventListener('click', () => showWizardStep(4));

  if (obStep5Finish) {
    obStep5Finish.addEventListener('click', () => {
      if (selectedWaterSources.length === 0) {
        document.getElementById('ob-water-error').textContent = '❌ Please select at least one water source.';
        return;
      }
      if (!selectedReliability) {
        document.getElementById('ob-reliability-error').textContent = '❌ Please select supply reliability.';
        return;
      }

      // Save profile and show success
      farmerProfile.waterSources = selectedWaterSources;
      farmerProfile.waterReliability = selectedReliability;

      // Animate finish button
      obStep5Finish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Profile...';
      obStep5Finish.disabled = true;

      // Make API request to save profile in backend
      const token = sessionStorage.getItem('accessToken');
      fetch('http://localhost:3000/api/v1/farmer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: farmerProfile.name,
          pincode: farmerProfile.pincode,
          state: farmerProfile.state,
          district: farmerProfile.district,
          village: farmerProfile.village,
          landArea: farmerProfile.landArea,
          soilType: farmerProfile.soilType,
          waterSources: farmerProfile.waterSources.join(','),
          waterReliability: farmerProfile.waterReliability
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('Onboarding save failed');
        return res.json();
      })
      .then(data => {
        showToast('🎉 Onboarding configuration synced with secure database!');
        proceedToCropPlanning();
      })
      .catch(err => {
        // Offline / demo fallback
        showToast('⚠️ Backend offline. Onboarding configuration saved locally.', 4000, 'Warning');
        proceedToCropPlanning();
      })
      .finally(() => {
        obStep5Finish.innerHTML = 'Complete Setup <i class="fa-solid fa-check"></i>';
        obStep5Finish.disabled = false;
      });
    });
  }

  const proceedToCropPlanning = () => {
    // Update landing tags
    const trustBadge = document.querySelector('.trust-badge');
    if (trustBadge) {
      trustBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--krishi-success);"></i> <span>Logged in as ${farmerProfile.name} · ${farmerProfile.district}</span>`;
      trustBadge.style.backgroundColor = 'var(--krishi-green-100)';
      trustBadge.style.borderColor = 'var(--krishi-green-700)';
      trustBadge.style.color = 'var(--krishi-green-900)';
    }

    if (btnGetStarted) {
      btnGetStarted.innerHTML = 'Go to Dashboard <i class="fa-solid fa-gauge"></i>';
    }

    navigateToSection('crop-planning-section');
    initCropPlanning();
  };

  // ==========================================
  // PHASE 4 — CROP PLANNING STATE & UI
  // ==========================================

  const farmCrops = {
    North: { crop: 'Empty', area: 0 },
    South: { crop: 'Empty', area: 0 },
    East: { crop: 'Empty', area: 0 },
    West: { crop: 'Empty', area: 0 }
  };
  let selectedPlanningCrop = '';
  let selectedPlanningSector = '';

  const initCropPlanning = () => {
    selectedPlanningCrop = '';
    selectedPlanningSector = '';
    
    // Clear selections
    const cards = document.querySelectorAll('#planning-crop-selector .selector-card');
    cards.forEach(c => c.classList.remove('selected'));

    const sectors = document.querySelectorAll('.compass-sector');
    sectors.forEach(s => {
      s.classList.remove('active');
      const dir = s.getAttribute('data-sector');
      s.querySelector('.sector-crop-info').textContent = farmCrops[dir].crop === 'Empty' ? 'Empty' : `${farmCrops[dir].crop} (${farmCrops[dir].area} ac)`;
    });

    const cropAreaInput = document.getElementById('planning-crop-area');
    if (cropAreaInput) cropAreaInput.value = '1.0';
  };

  // Crop Selector cards
  const planningCropSelector = document.getElementById('planning-crop-selector');
  if (planningCropSelector) {
    planningCropSelector.querySelectorAll('.selector-card').forEach(card => {
      card.addEventListener('click', () => {
        planningCropSelector.querySelectorAll('.selector-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPlanningCrop = card.getAttribute('data-value');
      });
    });
  }

  // Planning area +/- buttons
  const planAreaMinus = document.getElementById('planning-area-minus');
  const planAreaPlus = document.getElementById('planning-area-plus');
  const planAreaInput = document.getElementById('planning-crop-area');

  if (planAreaMinus && planAreaInput) {
    planAreaMinus.addEventListener('click', () => {
      const current = parseFloat(planAreaInput.value) || 1.0;
      planAreaInput.value = Math.max(0.5, current - 0.5).toFixed(1);
    });
  }
  if (planAreaPlus && planAreaInput) {
    planAreaPlus.addEventListener('click', () => {
      const current = parseFloat(planAreaInput.value) || 1.0;
      planAreaInput.value = Math.min(farmerProfile.landArea, current + 0.5).toFixed(1);
    });
  }

  // Compass sectors assignment
  const compassSectors = document.querySelectorAll('.compass-sector');
  compassSectors.forEach(sector => {
    sector.addEventListener('click', () => {
      const sectorName = sector.getAttribute('data-sector');
      if (!selectedPlanningCrop) {
        showToast('⚠️ Please select a crop from Step 1 first.', 3000, 'Alert');
        return;
      }
      
      const valArea = parseFloat(planAreaInput.value) || 1.0;
      
      // Assign crop
      farmCrops[sectorName].crop = selectedPlanningCrop;
      farmCrops[sectorName].area = valArea;

      // Update UI text
      sector.querySelector('.sector-crop-info').textContent = `${selectedPlanningCrop} (${valArea} ac)`;
      sector.classList.add('active');
      showToast(`Assigned ${selectedPlanningCrop} (${valArea} Acres) to ${sectorName} sector.`);
    });
  });

  const btnPlanningBack = document.getElementById('btn-planning-back');
  const btnPlanningFinish = document.getElementById('btn-planning-finish');

  if (btnPlanningBack) {
    btnPlanningBack.addEventListener('click', () => {
      navigateToSection('onboarding-section');
      showWizardStep(5);
    });
  }

  if (btnPlanningFinish) {
    btnPlanningFinish.addEventListener('click', () => {
      // Validate that at least one sector is assigned
      let hasCrops = false;
      for (const s in farmCrops) {
        if (farmCrops[s].crop !== 'Empty') hasCrops = true;
      }

      if (!hasCrops) {
        showToast('⚠️ Please assign a crop to at least one sector on the compass.', 3000, 'Validation');
        return;
      }

      btnPlanningFinish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      btnPlanningFinish.disabled = true;

      // API request to save farm plots in backend
      const token = sessionStorage.getItem('accessToken');
      const plotsToSave = Object.keys(farmCrops)
        .filter(dir => farmCrops[dir].crop !== 'Empty')
        .map(dir => ({
          direction: dir,
          cropName: farmCrops[dir].crop,
          areaSize: farmCrops[dir].area
        }));

      // Map dynamic requests
      Promise.all(plotsToSave.map(plot => {
        return fetch('http://localhost:3000/api/v1/farms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: `${plot.cropName} Field`,
            direction: plot.direction,
            size: plot.areaSize,
            soilType: farmerProfile.soilType,
            waterSource: farmerProfile.waterSources.join(',')
          })
        });
      }))
      .then(() => {
        showToast('🌾 Plot coordinates mapped and stored in secure backend.');
        completePlanningFlow();
      })
      .catch(err => {
        showToast('⚠️ Backend offline. Farm layout saved locally.', 4000, 'Warning');
        completePlanningFlow();
      })
      .finally(() => {
        btnPlanningFinish.innerHTML = 'Go to Dashboard <i class="fa-solid fa-circle-check"></i>';
        btnPlanningFinish.disabled = false;
      });
    });
  }

  const completePlanningFlow = () => {
    navigateToSection('dashboard-section');
    updateDashboardView();
  };

  // ==========================================
  // PHASE 5 — DASHBOARD UPDATE VIEW & API
  // ==========================================

  const updateDashboardView = () => {
    const dashName = document.getElementById('dash-farmer-name');
    const dashLoc = document.getElementById('dash-location-text');
    const dashAdvText = document.getElementById('dash-advisory-text');
    const dashAdvMeta = document.getElementById('dash-advisory-meta');
    const dashAdvReason = document.getElementById('dash-advisory-reason');
    const dashAdvTime = document.getElementById('dash-advisory-time');

    if (dashName) dashName.textContent = farmerProfile.name || 'Farmer';
    if (dashLoc) dashLoc.textContent = farmerProfile.district ? `${farmerProfile.district}, ${farmerProfile.state}` : 'Palakkad, Kerala';

    // Set weather dynamically based on district or fallback
    fetchDashboardWeather();

    // Call Advisory endpoint
    fetchDashboardAdvisory(dashAdvText, dashAdvMeta, dashAdvReason, dashAdvTime);
  };

  const fetchDashboardWeather = () => {
    const lat = farmerProfile.latitude || 23.0225;
    const lon = farmerProfile.longitude || 72.5714;
    
    fetch(`http://localhost:3000/api/v1/weather/current?latitude=${lat}&longitude=${lon}`)
    .then(res => res.json())
    .then(data => {
      updateWeatherCardUI(data);
    })
    .catch(() => {
      // Mock data representing weather
      const mockWeather = {
        temperature: 31,
        condition: 'Partly Cloudy',
        humidity: 62,
        windSpeed: 14,
        precipitation: 0.2
      };
      updateWeatherCardUI(mockWeather);
    });
  };

  const updateWeatherCardUI = (data) => {
    const tempEl = document.getElementById('dash-weather-temp');
    const condEl = document.getElementById('dash-weather-condition');
    const humEl = document.getElementById('dash-weather-humidity');
    const windEl = document.getElementById('dash-weather-wind');
    const rainEl = document.getElementById('dash-weather-rain-chance');
    const alertEl = document.getElementById('dash-weather-alert');

    if (tempEl) tempEl.textContent = `${data.temperature}°C`;
    if (condEl) condEl.textContent = data.condition || 'Partly Cloudy';
    if (humEl) humEl.textContent = `${data.humidity}%`;
    if (windEl) windEl.textContent = `${data.windSpeed} km/h`;
    
    // Calculate simulated rain chance or display precipitation
    const chance = data.precipitation > 0 ? '70%' : '15%';
    if (rainEl) rainEl.textContent = chance;

    if (data.precipitation > 0.5 && alertEl) {
      alertEl.style.display = 'flex';
      const alertTxt = document.getElementById('dash-weather-alert-text');
      if (alertTxt) alertTxt.textContent = '🌧 Heavy rain expected. Avoid spraying/irrigation tomorrow.';
    } else if (alertEl) {
      alertEl.style.display = 'none';
    }
  };

  const fetchDashboardAdvisory = (dashAdvText, dashAdvMeta, dashAdvReason, dashAdvTime) => {
    // Collect crop inputs
    let activeCrops = [];
    for (const dir in farmCrops) {
      if (farmCrops[dir].crop !== 'Empty') activeCrops.push(farmCrops[dir].crop);
    }
    const targetCrop = activeCrops[0] || 'crops';
    const targetLanguage = langText.textContent.includes('Gujarati') ? 'gu' : 'en';

    const token = sessionStorage.getItem('accessToken');
    fetch('http://localhost:3000/api/v1/advisory/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cropName: targetCrop,
        soilType: farmerProfile.soilType || 'Black Soil',
        waterSource: farmerProfile.waterSources.join(',') || 'Rainwater',
        language: targetLanguage
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Advisory fetch failed');
      return res.json();
    })
    .then(data => {
      if (dashAdvText) dashAdvText.textContent = data.recommendation;
      if (dashAdvMeta) dashAdvMeta.style.display = 'flex';
      if (dashAdvReason) dashAdvReason.textContent = data.reason || 'Sufficient soil moisture';
      if (dashAdvTime) dashAdvTime.textContent = data.suggestedTime || 'Early Morning';
      
      // Store dynamic advisory locally for report rendering
      farmerProfile.activeAdvisory = data.recommendation;
    })
    .catch(() => {
      // Offline fallback
      let mockAdvisory = '';
      if (targetLanguage === 'gu') {
        mockAdvisory = `તમારા ${targetCrop} પાક અને ${farmerProfile.soilType || 'જમીન'} મુજબ સલાહ: આગામી ૨ દિવસમાં વરસાદની શક્યતા ઓછી છે, તેથી હળવું પિયત આપો.`;
      } else {
        mockAdvisory = `Based on your ${targetCrop} crop in ${farmerProfile.soilType || 'Black Soil'}, light irrigation is recommended tomorrow morning since weather forecast indicates low rain chance.`;
      }
      
      if (dashAdvText) dashAdvText.textContent = mockAdvisory;
      if (dashAdvMeta) dashAdvMeta.style.display = 'flex';
      if (dashAdvReason) dashAdvReason.textContent = 'Low soil moisture forecast';
      if (dashAdvTime) dashAdvTime.textContent = 'Early Morning';
      
      farmerProfile.activeAdvisory = mockAdvisory;
    });
  };

  // Dashboard View Full Advisory report link
  const btnDashViewAdvisory = document.getElementById('btn-dash-view-advisory');
  if (btnDashViewAdvisory) {
    btnDashViewAdvisory.addEventListener('click', () => {
      navigateToSection('pdf-report-section');
      updateReportView();
    });
  }

  // Dashboard Quick actions event maps
  const quickActions = {
    'qa-scan': 'disease-scan-section',
    'qa-ai': 'ai-chat-section',
    'qa-weather': 'weather-section',
    'qa-map': 'my-farm-section',
    'qa-schemes': 'schemes-section',
    'qa-expert': 'expert-help-section'
  };

  for (const id in quickActions) {
    const card = document.getElementById(id);
    if (card) {
      card.addEventListener('click', () => {
        const sec = quickActions[id];
        navigateToSection(sec);
        if (sec === 'weather-section') updateWeatherView();
        if (sec === 'my-farm-section') updateMapView();
        if (sec === 'expert-help-section') updateExpertView();
      });
    }
  }

  // ==========================================
  // PHASE 6 — AI CHAT ASSISTANT
  // ==========================================

  const chatMessagesContainer = document.getElementById('chat-messages-container');
  const chatInputText = document.getElementById('chat-input-text');
  const chatBtnSend = document.getElementById('chat-btn-send');
  const chatSuggestionsContainer = document.getElementById('chat-suggestions-container');

  const addChatMessage = (text, sender) => {
    if (!chatMessagesContainer) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    
    // Style settings based on sender
    Object.assign(bubble.style, {
      alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
      background: sender === 'user' ? 'var(--krishi-green-700)' : 'var(--krishi-beige-100)',
      border: '1px solid var(--krishi-beige-200)',
      borderRadius: sender === 'user' ? 'var(--border-radius-md) var(--border-radius-md) 0 var(--border-radius-md)' : 'var(--border-radius-md) var(--border-radius-md) var(--border-radius-md) 0',
      padding: '12px 16px',
      maxWidth: '80%',
      boxShadow: 'var(--shadow-card)',
      color: sender === 'user' ? 'white' : 'var(--text-primary)'
    });

    bubble.innerHTML = `<div class="bubble-text" style="font-size: 14px; line-height: 1.45;">${text}</div>`;
    chatMessagesContainer.appendChild(bubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  };

  const handleChatSubmit = () => {
    if (!chatInputText) return;
    const text = chatInputText.value.trim();
    if (text === '') return;

    addChatMessage(text, 'user');
    chatInputText.value = '';

    // Typing effect simulator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble bot typing';
    Object.assign(typingBubble.style, {
      alignSelf: 'flex-start',
      background: 'var(--krishi-beige-100)',
      border: '1px solid var(--krishi-beige-200)',
      borderRadius: 'var(--border-radius-md) var(--border-radius-md) var(--border-radius-md) 0',
      padding: '12px 16px',
      maxWidth: '80%',
      fontStyle: 'italic',
      color: 'var(--text-secondary)'
    });
    typingBubble.innerHTML = '<span class="typing-text"><i class="fa-solid fa-spinner fa-spin"></i> Krishi AI is typing...</span>';
    chatMessagesContainer.appendChild(typingBubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    setTimeout(() => {
      typingBubble.remove();
      const response = generateAIResponse(text);
      addChatMessage(response, 'bot');
    }, 1200);
  };

  const generateAIResponse = (query) => {
    const loc = farmerProfile.district || 'Palakkad';
    const activeCrops = Object.keys(farmCrops).filter(dir => farmCrops[dir].crop !== 'Empty').map(dir => farmCrops[dir].crop);
    const primaryCrop = activeCrops[0] || 'crops';
    
    let res = `Based on your profile in ${loc} and ${primaryCrop} field coordinates, soil conditions are stable. Let me know if you have specific disease questions.`;

    if (query.toLowerCase().includes('irrigate') || query.toLowerCase().includes('water') || query.toLowerCase().includes('પિયત')) {
      res = `Weather rules suggest that with humidity at 62% and low rain chance in ${loc}, you should irrigate your ${primaryCrop} field tomorrow morning. Avoid overwatering.`;
    } else if (query.toLowerCase().includes('rain') || query.toLowerCase().includes('weather') || query.toLowerCase().includes('હવામાન')) {
      res = `Current temperature in ${loc} is 31°C. Favorable winds of 14 km/h make it optimal for farm operations today. No storm warnings.`;
    } else if (query.toLowerCase().includes('fertilizer') || query.toLowerCase().includes('ખાતર')) {
      res = `For ${primaryCrop} in ${farmerProfile.soilType || 'Black Soil'}, consider NPK application ratio adjusted for early growth stages. Water the soil right after application.`;
    } else if (query.toLowerCase().includes('disease') || query.toLowerCase().includes('leaf') || query.toLowerCase().includes('પાંદડા')) {
      res = `If you notice leaf yellowing or linear rust patterns, please capture a photo and upload it in the Disease Scanner quick action card.`;
    }

    if (langText.textContent.includes('Gujarati')) {
      res = `[એઆઈ સહાયક]: ${loc} ના હવામાન અને તમારા ${primaryCrop} પાક મુજબ સલાહ: આવતીકાલે સવારે ખાતર આપવા માટે સમય અનુકૂળ છે.`;
    }

    return res;
  };

  if (chatBtnSend && chatInputText) {
    chatBtnSend.addEventListener('click', handleChatSubmit);
    chatInputText.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChatSubmit();
    });
  }

  // Suggestion pills clicking
  if (chatSuggestionsContainer) {
    chatSuggestionsContainer.querySelectorAll('.suggestion-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.getAttribute('data-query');
        if (chatInputText) {
          chatInputText.value = query;
          handleChatSubmit();
        }
      });
    });
  }

  const btnChatBack = document.getElementById('btn-chat-back');
  if (btnChatBack) {
    btnChatBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  const attachBtn = document.getElementById('chat-btn-attach');
  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      showToast('📎 Attachment feature selected (Integration coming soon)');
    });
  }
  const micBtn = document.getElementById('chat-btn-mic');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      showToast('🎙 Voice speech-to-text input activated (Simulator)');
    });
  }

  // ==========================================
  // PHASE 7 — AI CROP DISEASE DETECTION
  // ==========================================

  const scanDropzone = document.getElementById('scan-dropzone');
  const scanFileInput = document.getElementById('scan-file-input');
  const btnScanCamera = document.getElementById('btn-scan-camera');
  const btnScanSubmit = document.getElementById('btn-scan-submit');
  const scanLoader = document.getElementById('scan-loader');
  const scanResult = document.getElementById('scan-result');

  let selectedScanFile = null;

  if (scanDropzone && scanFileInput) {
    scanDropzone.addEventListener('click', () => {
      scanFileInput.click();
    });

    scanFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        selectedScanFile = e.target.files[0];
        scanDropzone.querySelector('.upload-text').textContent = `📄 Selected File: ${selectedScanFile.name}`;
        scanDropzone.style.borderColor = 'var(--krishi-green-700)';
        scanDropzone.style.background = 'var(--krishi-green-100)';
      }
    });

    // Drag-and-drop triggers
    ['dragenter', 'dragover'].forEach(eventName => {
      scanDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        scanDropzone.style.borderColor = 'var(--krishi-green-700)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      scanDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        scanDropzone.style.borderColor = 'var(--krishi-green-200)';
      }, false);
    });

    scanDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        selectedScanFile = files[0];
        scanDropzone.querySelector('.upload-text').textContent = `📄 Dropped File: ${selectedScanFile.name}`;
        scanDropzone.style.borderColor = 'var(--krishi-green-700)';
        scanDropzone.style.background = 'var(--krishi-green-100)';
      }
    });
  }

  if (btnScanCamera) {
    btnScanCamera.addEventListener('click', () => {
      showToast('📷 Camera module activated (Demo mock capture).');
      // Simulate file selection
      selectedScanFile = { name: 'camera_capture.jpg' };
      if (scanDropzone) {
        scanDropzone.querySelector('.upload-text').textContent = '📄 Capturing photo: camera_capture.jpg';
        scanDropzone.style.borderColor = 'var(--krishi-green-700)';
      }
    });
  }

  // Scan leaf submit
  if (btnScanSubmit) {
    btnScanSubmit.addEventListener('click', () => {
      if (!selectedScanFile) {
        showToast('⚠️ Please select or drop an image file first.', 3000, 'Alert');
        return;
      }

      if (scanLoader) scanLoader.style.display = 'flex';
      if (scanResult) scanResult.style.display = 'none';

      // Call Backend Diagnosis Upload API
      const token = sessionStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('image', selectedScanFile);

      // Hit API endpoint
      fetch('http://localhost:3000/api/v1/diagnosis/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      .then(res => {
        if (!res.ok) throw new Error('Diagnosis upload failed');
        return res.json();
      })
      .then(data => {
        showToast('✅ leaf image processed successfully.');
        displayScanResults(data);
      })
      .catch(() => {
        // Fallback simulated model diagnosis
        setTimeout(() => {
          const activeCrops = Object.keys(farmCrops).filter(dir => farmCrops[dir].crop !== 'Empty').map(dir => farmCrops[dir].crop);
          const crop = activeCrops[0] || 'Wheat';
          
          let mockIssue = 'Leaf Rust';
          let mockDesc = 'Small, orange-brown pustules on leaf blades. Spreads rapidly in moderate temperatures.';
          let mockGuid = '1. Apply Propiconazole 25% EC at recommended dosage.\n2. Ensure proper spacing between rows for ventilation.';

          if (crop === 'Groundnut') {
            mockIssue = 'Early Leaf Spot (Tikka)';
            mockDesc = 'Dark brown spots with yellow halos on leaf blades. Fungal spores remain in soil residue.';
            mockGuid = '1. Crop rotation for subsequent seasons.\n2. Spray Carbendazim 12% + Mancozeb 63% WP.';
          } else if (crop === 'Cotton') {
            mockIssue = 'Bacterial Leaf Blight';
            mockDesc = 'Angular water-soaked spots on leaves turning dark brown or black. Spreads in warm humid seasons.';
            mockGuid = '1. Destroy affected crop debris.\n2. Spray Streptocycline 100 ppm along with Copper Oxychloride.';
          }

          const mockData = {
            diagnosis: mockIssue,
            confidence: 0.82,
            details: mockDesc,
            recommendation: mockGuid
          };

          displayScanResults(mockData);
        }, 1500);
      });
    });
  }

  const displayScanResults = (data) => {
    if (scanLoader) scanLoader.style.display = 'none';
    if (scanResult) {
      scanResult.style.display = 'block';
      const confPct = Math.round(data.confidence * 100);
      document.getElementById('scan-result-confidence').textContent = `${confPct}%`;
      document.getElementById('scan-result-issue').textContent = data.diagnosis;
      document.getElementById('scan-result-desc').textContent = data.details || '';
      document.getElementById('scan-result-guidance').textContent = data.recommendation || '';
      
      // Store locally for PDF report injection
      farmerProfile.lastDiagnosis = data.diagnosis;
      farmerProfile.lastDiagnosisDesc = data.details;
      farmerProfile.lastDiagnosisGuidance = data.recommendation;
      
      scanResult.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const btnScanBack = document.getElementById('btn-scan-back');
  if (btnScanBack) {
    btnScanBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  // Scanner actions escalation
  const btnScanEscalate = document.getElementById('btn-scan-escalate');
  if (btnScanEscalate) {
    btnScanEscalate.addEventListener('click', () => {
      navigateToSection('expert-help-section');
      updateExpertView();
      
      // Pre-fill ticket fields based on scan results
      const expCrop = document.getElementById('expert-crop');
      const expDesc = document.getElementById('expert-desc');
      
      const activeCrops = Object.keys(farmCrops).filter(dir => farmCrops[dir].crop !== 'Empty').map(dir => farmCrops[dir].crop);
      if (expCrop) expCrop.value = activeCrops[0] || 'Wheat';
      if (expDesc) expDesc.value = `Auto-escalated from crop leaf scanner result: ${farmerProfile.lastDiagnosis}. My leaf photo shows these indicators.`;
      
      showToast('📝 Ticket pre-filled with scanner findings. Review and submit.');
    });
  }

  const btnScanSaveReport = document.getElementById('btn-scan-save-report');
  if (btnScanSaveReport) {
    btnScanSaveReport.addEventListener('click', () => {
      navigateToSection('pdf-report-section');
      updateReportView();
    });
  }

  // ==========================================
  // PHASE 8 — LIVE WEATHER PAGE
  // ==========================================

  const updateWeatherView = () => {
    // Current weather and details
    const tempVal = document.getElementById('weather-detail-temp');
    const condVal = document.getElementById('weather-detail-condition');
    const humVal = document.getElementById('weather-detail-humidity');
    const windVal = document.getElementById('weather-detail-wind');
    const precVal = document.getElementById('weather-detail-precipitation');
    const rulesList = document.getElementById('weather-detail-rules');

    // Sync from Dashboard state
    const dashTempText = document.getElementById('dash-weather-temp');
    const dashCondText = document.getElementById('dash-weather-condition');
    const dashHumText = document.getElementById('dash-weather-humidity');
    const dashWindText = document.getElementById('dash-weather-wind');

    if (tempVal && dashTempText) tempVal.textContent = dashTempText.textContent;
    if (condVal && dashCondText) condVal.textContent = dashCondText.textContent;
    if (humVal && dashHumText) humVal.textContent = dashHumText.textContent;
    if (windVal && dashWindText) windVal.textContent = dashWindText.textContent;
    
    // Append advisories warning cards dynamic
    if (rulesList) {
      const activeCrops = Object.keys(farmCrops).filter(dir => farmCrops[dir].crop !== 'Empty').map(dir => farmCrops[dir].crop);
      const crop = activeCrops[0] || 'crops';
      
      let alertContent = '';
      if (langText.textContent.includes('Gujarati')) {
        alertContent = `
          <div class="weather-rule-card warning" style="background: var(--krishi-amber-100); border: 1px solid var(--krishi-amber-400); border-radius: var(--border-radius-md); padding: 16px; display: flex; gap: 12px; align-items: flex-start; color: #925f05;">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 1.25rem; color: var(--krishi-warning); margin-top: 2px;"></i>
            <div class="rule-info" style="display: flex; flex-direction: column; gap: 2px; font-size: 13px;">
              <strong style="color: var(--krishi-green-900);">પિયત નિયંત્રણ સલાહ</strong>
              <p style="color: var(--text-secondary); line-height: 1.4;">આવતીકાલે વરસાદની સંભાવના હોવાથી તમારા ${crop} ના પાકમાં પિયત અને રાસાયણિક છંટકાવ મુલતવી રાખો.</p>
            </div>
          </div>
        `;
      } else {
        alertContent = `
          <div class="weather-rule-card warning" style="background: var(--krishi-amber-100); border: 1px solid var(--krishi-amber-400); border-radius: var(--border-radius-md); padding: 16px; display: flex; gap: 12px; align-items: flex-start; color: #925f05;">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 1.25rem; color: var(--krishi-warning); margin-top: 2px;"></i>
            <div class="rule-info" style="display: flex; flex-direction: column; gap: 2px; font-size: 13px;">
              <strong style="color: var(--krishi-green-900);">Irrigation Control Warning</strong>
              <p style="color: var(--text-secondary); line-height: 1.4;">Due to rain expectations in ${farmerProfile.district || 'Palakkad'}, cancel pesticide sprays and major water supply schedules on ${crop} for the next 24 hours.</p>
            </div>
          </div>
        `;
      }
      rulesList.innerHTML = alertContent;
    }
  };

  const btnWeatherBack = document.getElementById('btn-weather-back');
  if (btnWeatherBack) {
    btnWeatherBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  // ==========================================
  // PHASE 9 — MY FARM MAP INTERACTION
  // ==========================================

  const updateMapView = () => {
    // Populate Map sector crop tags
    for (const dir in farmCrops) {
      const crName = document.getElementById(`map-crop-${dir}`);
      const crArea = document.getElementById(`map-area-${dir}`);
      if (crName) crName.textContent = farmCrops[dir].crop;
      if (crArea) crArea.textContent = farmCrops[dir].crop === 'Empty' ? '—' : `${farmCrops[dir].area} Acres`;
    }

    // Default load panel North
    loadSectorDetails('North');
  };

  const mapSectors = document.querySelectorAll('.map-sector-block');
  mapSectors.forEach(block => {
    block.addEventListener('click', () => {
      mapSectors.forEach(b => b.classList.remove('selected'));
      block.classList.add('selected');
      const sector = block.getAttribute('data-sector');
      loadSectorDetails(sector);
    });
  });

  const loadSectorDetails = (sector) => {
    const secName = document.getElementById('map-detail-sector-name');
    const secCrop = document.getElementById('map-detail-crop');
    const secArea = document.getElementById('map-detail-area');
    const secSoil = document.getElementById('map-detail-soil');
    const secWater = document.getElementById('map-detail-water');
    const secAdv = document.getElementById('map-detail-advisory');
    const secHist = document.getElementById('map-detail-history');

    const plot = farmCrops[sector];

    if (secName) secName.textContent = sector;
    if (secCrop) secCrop.textContent = plot.crop;
    if (secArea) secArea.textContent = plot.crop === 'Empty' ? '0 Acres' : `${plot.area} Acres`;
    if (secSoil) secSoil.textContent = farmerProfile.soilType || 'Black Soil';
    
    const waterStr = farmerProfile.waterSources.join(', ');
    if (secWater) secWater.textContent = waterStr || 'Rainwater';
    if (secAdv) {
      secAdv.textContent = plot.crop === 'Empty' ? 'None' : 'Stable';
      secAdv.style.color = plot.crop === 'Empty' ? 'var(--text-secondary)' : 'var(--krishi-green-700)';
    }
    if (secHist) secHist.textContent = plot.crop === 'Empty' ? '—' : (farmerProfile.lastDiagnosis || 'None');
  };

  const btnMapBack = document.getElementById('btn-map-back');
  if (btnMapBack) {
    btnMapBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  // ==========================================
  // PHASE 10 — GOVERNMENT SCHEMES REDIRECTS
  // ==========================================

  const btnSchemesBack = document.getElementById('btn-schemes-back');
  if (btnSchemesBack) {
    btnSchemesBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  // ==========================================
  // PHASE 11 — EXPERT ESCALATION CONSULTATION
  // ==========================================

  const expertTicketsContainer = document.getElementById('expert-tickets-container');
  const btnExpertSubmit = document.getElementById('btn-expert-submit');
  const expertCropSelect = document.getElementById('expert-crop');
  const expertDescText = document.getElementById('expert-desc');

  const updateExpertView = () => {
    // Populate active crops in selector dropdown
    if (expertCropSelect) {
      expertCropSelect.innerHTML = '';
      let activeCrops = [];
      for (const dir in farmCrops) {
        if (farmCrops[dir].crop !== 'Empty') activeCrops.push(farmCrops[dir].crop);
      }
      
      const distinctCrops = [...new Set(activeCrops)];
      if (distinctCrops.length === 0) {
        distinctCrops.push('Wheat'); // default fallback
      }

      distinctCrops.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        expertCropSelect.appendChild(opt);
      });
    }
  };

  // Ticket submission API binding
  if (btnExpertSubmit) {
    btnExpertSubmit.addEventListener('click', () => {
      const crop = expertCropSelect ? expertCropSelect.value : 'Wheat';
      const desc = expertDescText ? expertDescText.value.trim() : '';

      if (!desc || desc.length < 5) {
        showToast('⚠️ Please provide details describing the crop problem.', 3000, 'Alert');
        return;
      }

      btnExpertSubmit.disabled = true;
      btnExpertSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

      const token = sessionStorage.getItem('accessToken');
      
      // Hit Backend Expert Escalation Endpoint
      fetch('http://localhost:3000/api/v1/officer/escalations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          farmerName: farmerProfile.name,
          mobileNumber: userMobile,
          district: farmerProfile.district || 'Palakkad',
          cropName: crop,
          description: desc,
          diagnosisResult: farmerProfile.lastDiagnosis || 'Unknown Leaf Yellowing',
          confidenceScore: 0.52
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('Ticket create failed');
        return res.json();
      })
      .then(data => {
        showToast('✅ consultation ticket successfully saved to District database.');
        appendTicketCard(crop, desc, 'Waiting for Expert', '🟡', 'waiting', null);
        simulateOfficerReply(crop);
      })
      .catch(() => {
        // Simulated offline flow
        showToast('⚠️ Backend offline. consultation details stored in offline queue.', 4000, 'Warning');
        appendTicketCard(crop, desc, 'Waiting for Expert', '🟡', 'waiting', null);
        simulateOfficerReply(crop);
      })
      .finally(() => {
        if (expertDescText) expertDescText.value = '';
        btnExpertSubmit.disabled = false;
        btnExpertSubmit.innerHTML = 'Submit to Officer';
      });
    });
  }

  const appendTicketCard = (crop, desc, status, icon, styleClass, response) => {
    if (!expertTicketsContainer) return;
    
    // Clear empty state card
    const emptyCard = expertTicketsContainer.querySelector('.empty-state');
    if (emptyCard) emptyCard.remove();

    const ticketId = Math.floor(1000 + Math.random() * 9000);
    const card = document.createElement('div');
    card.className = 'ticket-status-card';
    card.setAttribute('data-id', ticketId);
    
    // Style settings
    Object.assign(card.style, {
      background: 'var(--krishi-beige-100)',
      border: '1.5px solid var(--krishi-beige-200)',
      borderRadius: 'var(--border-radius-sm)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: 'var(--shadow-card)',
      transition: 'all 0.2s',
      marginBottom: '10px'
    });

    let respHtml = '';
    if (response) {
      respHtml = `
        <div class="ticket-officer-response-block" style="background: var(--krishi-beige-50); border-left: 3px solid var(--krishi-green-700); padding: 8px 12px; border-radius: 4px; font-size: 12.5px; margin-top: 8px; color: var(--text-primary);">
          <strong>Officer Response:</strong>
          <p style="margin-top: 4px; font-style: italic;">"${response}"</p>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="ticket-header-row" style="display: flex; justify-content: space-between; align-items: center;">
        <span class="ticket-crop-tag" style="font-size: 13px; font-weight: 700; color: var(--krishi-green-900);">${crop} Field (ID: #${ticketId})</span>
        <span class="ticket-status-badge ${styleClass}" style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--border-radius-pill);">${status} ${icon}</span>
      </div>
      <p class="ticket-desc-text" style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin: 0;">Query: "${desc}"</p>
      ${respHtml}
    `;

    expertTicketsContainer.insertBefore(card, expertTicketsContainer.firstChild);
  };

  const simulateOfficerReply = (crop) => {
    // Simulated Expert response note after 8 seconds
    setTimeout(() => {
      if (!expertTicketsContainer) return;
      const topTicket = expertTicketsContainer.firstElementChild;
      if (topTicket && topTicket.querySelector('.ticket-status-badge').classList.contains('waiting')) {
        const badge = topTicket.querySelector('.ticket-status-badge');
        badge.className = 'ticket-status-badge responded';
        badge.innerHTML = 'Expert Responded 🟢';
        
        let officerNote = `Based on your description of the ${crop} plot leaves, consider spraying Chlorpyriphos 20% EC (2ml/litre water) to control the spreading leaf insects. Irrigate light.`;
        if (langText.textContent.includes('Gujarati')) {
          officerNote = `તમારા ${crop} ના પાકના ચિત્રોનું નિરીક્ષણ કર્યા પછી સલાહ છે કે મેન્કોઝેબ ૭૫% ડબલ્યુપી (૨ ગ્રામ/લીટર પાણી) નો છંટકાવ તાત્કાલિક કરો અને જમીનમાં ભેજનું પ્રમાણ જાળવો.`;
        }

        const respBlock = document.createElement('div');
        respBlock.className = 'ticket-officer-response-block';
        Object.assign(respBlock.style, {
          background: 'var(--krishi-beige-50)',
          borderLeft: '3px solid var(--krishi-green-700)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12.5px',
          marginTop: '8px',
          color: 'var(--text-primary)'
        });
        respBlock.innerHTML = `
          <strong>Officer Response:</strong>
          <p style="margin-top: 4px; font-style: italic;">"${officerNote}"</p>
        `;
        topTicket.appendChild(respBlock);
        
        showToast('🟢 Expert officer reviewed and responded to your ticket!', 5000, 'Expert Support');
      }
    }, 8000);
  };

  const btnExpertBack = document.getElementById('btn-expert-back');
  if (btnExpertBack) {
    btnExpertBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  // ==========================================
  // PHASE 12 — FARMER PROFILE UPDATE VIEW
  // ==========================================

  const updateProfileView = () => {
    const pName = document.getElementById('prof-name');
    const pMobile = document.getElementById('prof-mobile');
    const pStatePin = document.getElementById('prof-state-pin');
    const pDistVillage = document.getElementById('prof-district-village');
    const pLand = document.getElementById('prof-land');
    const pSoil = document.getElementById('prof-soil');
    const pWater = document.getElementById('prof-water');
    const pReliability = document.getElementById('prof-reliability');

    if (pName) pName.textContent = farmerProfile.name;
    if (pMobile) pMobile.textContent = `+91 ${farmerProfile.mobile}`;
    if (pStatePin) pStatePin.textContent = `${farmerProfile.state} (${farmerProfile.pincode})`;
    if (pDistVillage) pDistVillage.textContent = `${farmerProfile.district} (${farmerProfile.village})`;
    if (pLand) pLand.textContent = `${farmerProfile.landArea.toFixed(1)} Acres`;
    if (pSoil) pSoil.textContent = farmerProfile.soilType;
    if (pWater) pWater.textContent = farmerProfile.waterSources.join(', ');
    if (pReliability) pReliability.textContent = farmerProfile.waterReliability;
  };

  const btnProfileBack = document.getElementById('btn-profile-back');
  if (btnProfileBack) {
    btnProfileBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  const btnProfileEdit = document.getElementById('btn-profile-edit');
  if (btnProfileEdit) {
    btnProfileEdit.addEventListener('click', () => {
      // Re-route to onboarding wizard for update edits
      navigateToSection('onboarding-section');
      initOnboarding();
      showToast('✏️ edit mode initialized.');
    });
  }

  const btnProfileAdvisoryHistory = document.getElementById('btn-profile-advisory-history');
  if (btnProfileAdvisoryHistory) {
    btnProfileAdvisoryHistory.addEventListener('click', () => {
      navigateToSection('pdf-report-section');
      updateReportView();
    });
  }

  // ==========================================
  // PHASE 13 — SETTINGS & PREFERENCES
  // ==========================================

  const settingsLangSelect = document.getElementById('settings-lang-select');
  if (settingsLangSelect) {
    settingsLangSelect.addEventListener('change', () => {
      const selected = settingsLangSelect.value;
      if (langText) langText.textContent = selected.includes('Gujarati') ? 'Gujarati (ગુજરાતી)' : 'English';
      showToast(`Language changed to: ${selected}`);
      updateLanguageStrings(selected);
    });
  }

  const settingsBtnTheme = document.getElementById('settings-btn-theme');
  if (settingsBtnTheme) {
    settingsBtnTheme.addEventListener('click', () => {
      toggleDarkMode();
    });
  }

  const btnSettingsBack = document.getElementById('btn-settings-back');
  if (btnSettingsBack) {
    btnSettingsBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  // Trigger settings view loading shortcut in Profile avatar click if desired
  const navProfileBtn = document.getElementById('navbar-profile-btn');
  if (navProfileBtn) {
    // Override profile avatar click to route directly to profile page
    navProfileBtn.onclick = (e) => {
      e.stopPropagation();
      if (isLoggedIn) {
        navigateToSection('profile-section');
        updateProfileView();
      } else {
        navigateToSection('login-section');
      }
    };
  }

  // ==========================================
  // PHASE 14 — PDF ADVISORY REPORT VIEW
  // ==========================================

  const updateReportView = () => {
    const repDate = document.getElementById('rep-date');
    const repName = document.getElementById('rep-farmer-name');
    const repMob = document.getElementById('rep-farmer-mobile');
    const repLoc = document.getElementById('rep-farmer-loc');
    const repLand = document.getElementById('rep-farmer-land');
    const repSoil = document.getElementById('rep-farmer-soil');
    const repWater = document.getElementById('rep-farmer-water');
    const repWeather = document.getElementById('rep-weather-txt');
    const repAdvTitle = document.getElementById('rep-advisory-title');
    const repAdvDesc = document.getElementById('rep-advisory-desc');

    // Date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    if (repDate) repDate.textContent = dateStr;

    if (repName) repName.textContent = farmerProfile.name;
    if (repMob) repMob.textContent = `+91 ${farmerProfile.mobile}`;
    if (repLoc) repLoc.textContent = `${farmerProfile.district}, ${farmerProfile.state}`;
    if (repLand) repLand.textContent = `${farmerProfile.landArea.toFixed(1)} Acres`;
    if (repSoil) repSoil.textContent = farmerProfile.soilType;
    if (repWater) repWater.textContent = `${farmerProfile.waterSources.join(', ')} (${farmerProfile.waterReliability})`;

    // Weather txt
    const dashWeatherCond = document.getElementById('dash-weather-condition');
    const dashWeatherTemp = document.getElementById('dash-weather-temp');
    if (repWeather && dashWeatherCond && dashWeatherTemp) {
      repWeather.textContent = `Temperature is ${dashWeatherTemp.textContent} with ${dashWeatherCond.textContent.toLowerCase()} skies. Humidity at ${document.getElementById('dash-weather-humidity').textContent} and wind speed is ${document.getElementById('dash-weather-wind').textContent}.`;
    }

    // Advisory desc
    const activeCrops = Object.keys(farmCrops).filter(dir => farmCrops[dir].crop !== 'Empty').map(dir => farmCrops[dir].crop);
    const primaryCrop = activeCrops[0] || 'Crop';
    if (repAdvTitle) repAdvTitle.textContent = `${primaryCrop} Field Advisory Guidelines`;
    if (repAdvDesc) repAdvDesc.textContent = farmerProfile.activeAdvisory || 'Weather is stable. Maintain standard irrigation intervals.';
  };

  // Download PDF API bindings
  const btnReportDownload = document.getElementById('btn-report-download');
  if (btnReportDownload) {
    btnReportDownload.addEventListener('click', () => {
      btnReportDownload.disabled = true;
      btnReportDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';

      const token = sessionStorage.getItem('accessToken');
      
      // Make Post request to backend reports generation API
      fetch('http://localhost:3000/api/v1/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          farmerName: farmerProfile.name,
          mobileNumber: userMobile,
          cropName: Object.keys(farmCrops).filter(dir => farmCrops[dir].crop !== 'Empty').map(dir => farmCrops[dir].crop)[0] || 'Wheat',
          advisoryContent: farmerProfile.activeAdvisory || '',
          language: langText.textContent.includes('Gujarati') ? 'gu' : 'en'
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('PDF generate failed');
        return res.blob();
      })
      .then(blob => {
        const fileUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = `Krishi_Sahayak_Advisory_${farmerProfile.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('📄 PDF report downloaded successfully.');
      })
      .catch(() => {
        // Fallback browser print trigger representing save
        showToast('⚠️ Backend offline. Using offline browser print dialog...', 3500, 'Warning');
        window.print();
      })
      .finally(() => {
        btnReportDownload.disabled = false;
        btnReportDownload.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
      });
    });
  }

  // Share report WhatsApp API triggering
  const btnReportWhatsapp = document.getElementById('btn-report-whatsapp');
  if (btnReportWhatsapp) {
    btnReportWhatsapp.addEventListener('click', () => {
      const crop = Object.keys(farmCrops).filter(dir => farmCrops[dir].crop !== 'Empty').map(dir => farmCrops[dir].crop)[0] || 'crop';
      const msg = `Namaste! Here is my Krishi Sahayak advisory report for my ${crop} crop in ${farmerProfile.district}. Recommendation: "${farmerProfile.activeAdvisory}"`;
      const url = `https://api.whatsapp.com/send?phone=91${userMobile}&text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      showToast('📲 Redirecting to WhatsApp to share your advisory report...');
    });
  }

  const btnReportBack = document.getElementById('btn-report-back');
  if (btnReportBack) {
    btnReportBack.addEventListener('click', () => {
      navigateToSection('dashboard-section');
    });
  }

  // Multilingual strings support mapping
  function updateLanguageStrings(lang) {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const getStartedText = document.getElementById('btn-get-started');
    const learnMoreText = document.getElementById('btn-learn-more');
    const featuresTitle = document.querySelector('.features-title');
    const formTitles = document.querySelectorAll('.form-title');
    const formSubtitles = document.querySelectorAll('.form-subtitle');
    
    const isGug = lang.includes('Gujarati');

    if (isGug) {
      if (heroTitle) heroTitle.innerHTML = 'તમારું ખેતર। <br>તમારો ડેટા। <br><span>વધુ સારા નિર્ણયો।</span>';
      if (heroSubtitle) heroSubtitle.textContent = 'તમારી જમીન, પાણીની ઉપલબ્ધતા અને હવામાનને આધારે એઆઈ-સંચાલિત પાક સલાહ અને રોગની શોધ।';
      if (getStartedText && !isLoggedIn) getStartedText.innerHTML = 'શરૂ કરો <i class="fa-solid fa-arrow-right"></i>';
      if (learnMoreText) learnMoreText.textContent = 'તે કેવી રીતે કામ કરે છે તે જાણો';
      if (featuresTitle) featuresTitle.textContent = 'તમારી સફળતા માટે વિશેષતાઓ';
      if (formTitles[0]) formTitles[0].textContent = 'સ્વાગત છે, ખેડૂત 👋';
      if (formSubtitles[0]) formSubtitles[0].textContent = 'પ્રવેશ કરવા અથવા નોંધણી કરવા માટે તમારો મોબાઈલ નંબર દાખલ કરો.';
      
      // Dashboard sections translate
      const dashGreeting = document.querySelector('.dashboard-greeting');
      if (dashGreeting) dashGreeting.innerHTML = `નમસ્તે, <span id="dash-farmer-name">${farmerProfile.name || 'ખેડૂત'}</span> 👋`;
      
      const dashAdvTitle = document.querySelector('.advisory-card-title');
      if (dashAdvTitle) dashAdvTitle.innerHTML = '<i class="fa-solid fa-seedling"></i> આજની ખેતી સલાહ';
      
      const qActionTitle = document.querySelector('.dashboard-section-title');
      if (qActionTitle) qActionTitle.textContent = 'ઝડપી કાર્યો';
      
      // Quick Actions Cards titles
      const qaCards = {
        'qa-scan': ['પાક રોગ સ્કેન', 'રોગ ઓળખો'],
        'qa-ai': ['કૃષિ એઆઈ', 'પ્રશ્ન પૂછો'],
        'qa-weather': ['હવામાન માહિતી', '૫-દિવસ આગાહી'],
        'qa-map': ['ખેતરનો નકશો', 'વિસ્તાર દર્શાવો'],
        'qa-schemes': ['યોજનાઓ', 'સરકારી યોજનાઓ'],
        'qa-expert': ['નિષ્ણાત મદદ', 'પરામર્શ મેળવો']
      };

      for (const id in qaCards) {
        const card = document.getElementById(id);
        if (card) {
          card.querySelector('h4').textContent = qaCards[id][0];
          card.querySelector('p').textContent = qaCards[id][1];
        }
      }

      // Scanner titles translate
      const scanBack = document.getElementById('btn-scan-back');
      if (scanBack) scanBack.innerHTML = '<i class="fa-solid fa-arrow-left"></i> ડેસ્કબોર્ડ';
      const scanTitle = document.querySelector('#disease-scan-section .wizard-title');
      if (scanTitle) scanTitle.textContent = 'પાક રોગ સ્કેનર 🌿';
      const scanSub = document.querySelector('#disease-scan-section .wizard-subtitle');
      if (scanSub) scanSub.textContent = 'રોગની ઓળખ મેળવવા માટે પાકના અસરગ્રસ્ત પાંદડાનો ફોટો અપલોડ કરો.';
      const scanText = document.querySelector('.upload-text');
      if (scanText && !selectedScanFile) scanText.textContent = 'ફોટો ડ્રેગ એન્ડ ડ્રોપ કરો અથવા પસંદ કરવા ક્લિક કરો';
      
      const expTitle = document.querySelector('#expert-help-section .wizard-title');
      if (expTitle) expTitle.textContent = 'નિષ્ણાત પરામર્શ 👨‍🌾';

      const profTitle = document.querySelector('#profile-section .wizard-title');
      if (profTitle) profTitle.textContent = 'ખેડૂત પ્રોફાઇલ 👤';

      const settingsTitle = document.querySelector('#settings-section .wizard-title');
      if (settingsTitle) settingsTitle.textContent = 'એપ સેટિંગ્સ ⚙';
      
    } else {
      if (heroTitle) heroTitle.innerHTML = 'Your Farm. <br>Your Data. <br><span>Smarter Decisions.</span>';
      if (heroSubtitle) heroSubtitle.textContent = 'AI-powered crop advisory, live weather forecasts, and disease detection tailored directly to your soil and water availability.';
      if (getStartedText && !isLoggedIn) getStartedText.innerHTML = 'Get Started <i class="fa-solid fa-arrow-right"></i>';
      if (learnMoreText) learnMoreText.textContent = 'Learn How It Works';
      if (featuresTitle) featuresTitle.textContent = 'Features Built For Your Success';
      if (formTitles[0]) formTitles[0].textContent = 'Welcome, Farmer 👋';
      if (formSubtitles[0]) formSubtitles[0].textContent = 'Enter your mobile number to log in or register.';
      
      const dashGreeting = document.querySelector('.dashboard-greeting');
      if (dashGreeting) dashGreeting.innerHTML = `Namaste, <span id="dash-farmer-name">${farmerProfile.name || 'Farmer'}</span> 👋`;
      
      const dashAdvTitle = document.querySelector('.advisory-card-title');
      if (dashAdvTitle) dashAdvTitle.innerHTML = '<i class="fa-solid fa-seedling"></i> Today\'s Farm Advisory';
      
      const qActionTitle = document.querySelector('.dashboard-section-title');
      if (qActionTitle) qActionTitle.textContent = 'Quick Actions';
      
      const qaCards = {
        'qa-scan': ['Disease Scan', 'Identify crop pests'],
        'qa-ai': ['Ask Krishi AI', '24/7 Advisor'],
        'qa-weather': ['Live Weather', 'Hourly & 5-Day'],
        'qa-map': ['My Farm', 'Layout sectors'],
        'qa-schemes': ['Schemes', 'Govt services'],
        'qa-expert': ['Expert Help', 'Officer support']
      };

      for (const id in qaCards) {
        const card = document.getElementById(id);
        if (card) {
          card.querySelector('h4').textContent = qaCards[id][0];
          card.querySelector('p').textContent = qaCards[id][1];
        }
      }

      const scanBack = document.getElementById('btn-scan-back');
      if (scanBack) scanBack.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Dashboard';
      const scanTitle = document.querySelector('#disease-scan-section .wizard-title');
      if (scanTitle) scanTitle.textContent = 'Crop Health Scanner 🌿';
      const scanSub = document.querySelector('#disease-scan-section .wizard-subtitle');
      if (scanSub) scanSub.textContent = 'Upload a clear photo of the affected crop leaf for instant diagnosis.';
      
      const expTitle = document.querySelector('#expert-help-section .wizard-title');
      if (expTitle) expTitle.textContent = 'Expert Consultation 👨‍🌾';

      const profTitle = document.querySelector('#profile-section .wizard-title');
      if (profTitle) profTitle.textContent = 'Farmer Profile 👤';

      const settingsTitle = document.querySelector('#settings-section .wizard-title');
      if (settingsTitle) settingsTitle.textContent = 'App Preferences & Settings ⚙';
    }
  }

  // Modern Toast Notification System
  function showToast(message, duration = 3500, title = 'Notification') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      Object.assign(toastContainer.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '360px',
        width: 'calc(100vw - 48px)'
      });
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-bubble';
    toast.innerHTML = `
      <div class="toast-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; border-bottom: 1px solid var(--krishi-beige-200); padding-bottom: 4px;">
        <span style="font-weight: 700; font-size: 14px; color: var(--krishi-green-900); display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-bell" style="color: var(--krishi-amber-400);"></i> ${title}
        </span>
        <button class="toast-close" style="font-size: 14px; color: var(--text-secondary); cursor: pointer;">&times;</button>
      </div>
      <div class="toast-body" style="font-size: 14px; color: var(--text-primary); line-height: 1.4;">
        ${message}
      </div>
    `;

    Object.assign(toast.style, {
      backgroundColor: 'var(--krishi-beige-50)',
      border: '2px solid var(--krishi-green-700)',
      borderRadius: 'var(--border-radius-md)',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-soft)',
      transform: 'translateY(-20px)',
      opacity: '0',
      transition: 'all 0.3s var(--ease-curve)'
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    const closeToast = () => {
      toast.style.transform = 'translateY(-20px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', closeToast);
    setTimeout(closeToast, duration);
  }
});
