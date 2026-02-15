'use strict'

// Enable update button only when form changes
const form = document.querySelector("#updateForm");
if (form) {
  const updateBtn = form.querySelector("button[type='submit']");
  if (updateBtn) {
    // Disable initially
    updateBtn.setAttribute("disabled", "disabled");
    
    // Enable on any form change
    form.addEventListener("change", function () {
      updateBtn.removeAttribute("disabled");
    });
  }
}