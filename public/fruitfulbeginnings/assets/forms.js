const ENDPOINT = "/api/fruitfulbeginnings/submit";
const STATUS = "/api/fruitfulbeginnings/status";

const notice = document.querySelector("#form-notice");

async function refreshNotice() {
  if (!notice) return;
  try {
    const response = await fetch(STATUS, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const data = await response.json();
    if (data.ready) notice.replaceChildren();
  } catch {
    /* Mail is not connected on this preview. The page stays quiet. */
  }
}

function showStatus(status, message) {
  status.textContent = message;
  status.tabIndex = -1;
  status.focus();
}

for (const form of document.querySelectorAll("form[data-mail]")) {
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    showStatus(status, "Sending…");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      if (data.setup) {
        showStatus(status, data.message || "Thank you. This couldn’t be sent just yet. Please try again soon.");
        return;
      }
      if (response.ok && data.ok) {
        form.reset();
        showStatus(status, data.message || "Thank you. Laura will be in touch soon.");
        return;
      }
      showStatus(status, data.message || "This didn’t send. Please try again.");
    } catch {
      showStatus(status, "This didn’t send. Your answers are still here.");
    } finally {
      button.disabled = false;
    }
  });
}

refreshNotice();
