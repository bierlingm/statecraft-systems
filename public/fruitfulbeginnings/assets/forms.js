const ENDPOINT = "/api/fruitfulbeginnings/submit";
const STATUS = "/api/fruitfulbeginnings/status";

const notice = document.querySelector("#form-notice");

async function refreshNotice() {
  if (!notice) return;
  try {
    const response = await fetch(STATUS, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const data = await response.json();
    if (data.ready) {
      notice.innerHTML = "<p><strong>The forms are connected.</strong> A submission is emailed to Laura. Sending one does not hold or confirm a place.</p>";
    }
  } catch {
    /* The worker is not on this preview yet. The notice already says so. */
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
        showStatus(status, data.message || "Forms are being set up. Nothing was sent.");
        return;
      }
      if (response.ok && data.ok) {
        form.reset();
        showStatus(status, data.message || "Thank you. Your form was sent to Laura. It does not hold or confirm a place.");
        return;
      }
      showStatus(status, data.message || "We couldn’t send this. Nothing was delivered. Please try again.");
    } catch {
      showStatus(status, "We couldn’t reach the form. Nothing was sent. Your answers are still on this page.");
    } finally {
      button.disabled = false;
    }
  });
}

refreshNotice();
