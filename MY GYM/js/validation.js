(function () {
  const contactForm = document.querySelector("#contactForm");
  const status = document.querySelector("#formStatus");
  const newsletterForm = document.querySelector("#newsletterForm");
  const newsletterStatus = document.querySelector("#newsletterStatus");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setError = (field, message) => {
    const wrapper = field.closest(".form-field");
    if (!wrapper) return;
    wrapper.classList.add("error");
    wrapper.querySelector("small").textContent = message;
  };

  const clearError = (field) => {
    const wrapper = field.closest(".form-field");
    if (!wrapper) return;
    wrapper.classList.remove("error");
    wrapper.querySelector("small").textContent = "";
  };

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let isValid = true;
      const fields = Array.from(contactForm.querySelectorAll("input, textarea"));

      fields.forEach((field) => {
        const value = field.value.trim();
        clearError(field);

        if (!value) {
          setError(field, "This field is required.");
          isValid = false;
        } else if (field.type === "email" && !emailPattern.test(value)) {
          setError(field, "Enter a valid email address.");
          isValid = false;
        } else if (field.name === "phone" && value.replace(/\D/g, "").length < 7) {
          setError(field, "Enter a valid phone number.");
          isValid = false;
        }
      });

      if (!isValid) {
        status.textContent = "Please fix the highlighted fields.";
        return;
      }

      status.textContent = "Thanks. A ForgeFit coach will contact you shortly.";
      contactForm.reset();
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = newsletterForm.querySelector("input");

      if (!emailPattern.test(input.value.trim())) {
        newsletterStatus.textContent = "Enter a valid email address.";
        return;
      }

      newsletterStatus.textContent = "You are subscribed.";
      newsletterForm.reset();
    });
  }
})();
