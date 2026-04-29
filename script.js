// ===== HELPERS =====
const $ = (id) => document.getElementById(id);
const eyeOpen = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeClosed = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

// ===== CLOCK =====
const clock = $("clock");
const tick = () => {
  clock.textContent = new Date().toLocaleTimeString("en-US", {
    hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
};
tick();
setInterval(tick, 1000);

// ===== DATE BOUNDS =====
const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];
const dobInput = $("dob");
dobInput.max = fmt(today);
const minDate = new Date(today);
minDate.setFullYear(minDate.getFullYear() - 100);
dobInput.min = fmt(minDate);

// ===== AGE CALC =====
const ageBadge = $("ageBadge");
function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  if (age < 0 || age > 130) return null;
  return age;
}

dobInput.addEventListener("input", () => {
  const age = calcAge(dobInput.value);
  if (age !== null) {
    ageBadge.textContent = "AGE · " + age;
    ageBadge.classList.add("show");
  } else {
    ageBadge.classList.remove("show");
  }
  validate();
});

// ===== PASSWORD STRENGTH =====
const pwdInput = $("password");
const confInput = $("confirm");
const strengthEl = $("strength");
const strengthLabel = $("strengthLabel");
const matchRow = $("matchRow");

function strengthOf(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 5);
}
const labels = ["", "Weak", "Fair", "Good", "Strong", "Fortress"];

function updatePassword() {
  const score = strengthOf(pwdInput.value);
  strengthEl.className = "strength s" + score;
  strengthLabel.textContent = labels[score];
  updateMatch();
  validate();
}

function updateMatch() {
  const c = confInput.value;
  matchRow.className = "match-row";
  matchRow.textContent = "";
  if (!c) return;
  if (c === pwdInput.value) {
    matchRow.classList.add("ok");
    matchRow.textContent = "✓ Passwords matched";
  } else {
    matchRow.classList.add("bad");
    matchRow.textContent = "✗ Passwords do not match";
  }
}

pwdInput.addEventListener("input", updatePassword);
confInput.addEventListener("input", () => { updateMatch(); validate(); });

// ===== EYE TOGGLES =====
document.querySelectorAll(".toggle-eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = $(btn.dataset.target);
    const isPwd = target.type === "password";
    target.type = isPwd ? "text" : "password";
    btn.innerHTML = isPwd ? eyeClosed : eyeOpen;
  });
});

// ===== GENDER SEGMENT =====
const genderInputs = document.querySelectorAll('input[name="gender"]');
genderInputs.forEach((input) => {
  input.addEventListener("change", validate);
});

// ===== VALIDATION =====
const form = $("signupForm");
const submitBtn = $("submitBtn");
const agree = $("agree");
const pills = document.querySelectorAll("[data-pill]");

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function isValidPhone(p) { return /^[0-9+\-\s()]{7,}$/.test(p); }

function validate() {
  const v = {
    prefix: $("prefix").value,
    firstName: $("firstName").value.trim(),
    lastName: $("lastName").value.trim(),
    username: $("username").value.trim(),
    dob: dobInput.value,
    pwd: pwdInput.value,
    conf: confInput.value,
    gender: document.querySelector('input[name="gender"]:checked')?.value || "",
    contact: $("contact").value.trim(),
    email: $("email").value.trim(),
    agree: agree.checked,
  };
  const age = calcAge(v.dob);
  const ok =
    v.prefix && v.firstName && v.lastName && v.username &&
    v.dob && age !== null && age >= 13 &&
    v.pwd.length >= 8 && v.conf === v.pwd &&
    v.gender &&
    isValidPhone(v.contact) && isValidEmail(v.email) &&
    v.agree;

  submitBtn.disabled = !ok;

  // Step pills progress
  const steps = [
    v.prefix && v.firstName && v.lastName,
    v.username && v.dob && v.gender,
    v.pwd && v.conf === v.pwd && v.contact && v.email,
  ];
  pills.forEach((p, i) => {
    p.classList.toggle("on", !!steps[i]);
  });
}

// Wire validation to all simple inputs
["prefix","firstName","lastName","username","contact","email"].forEach((id) => {
  $(id).addEventListener("input", validate);
  $(id).addEventListener("change", validate);
});

// Strip whitespace from username
$("username").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\s+/g, "");
});

agree.addEventListener("change", validate);

// ===== SUBMIT =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;
  const prefix = $("prefix").value;
  const first = $("firstName").value.trim();
  $("successName").textContent =
    "Welcome aboard, " + (prefix ? prefix + ". " : "") + first + ".";
  $("success").classList.add("show");
});

// ===== RESET =====
$("resetBtn").addEventListener("click", () => {
  form.reset();
  ageBadge.classList.remove("show");
  strengthEl.className = "strength s0";
  strengthLabel.textContent = "";
  matchRow.className = "match-row";
  matchRow.textContent = "";
  document.querySelectorAll(".toggle-eye").forEach((btn) => {
    $(btn.dataset.target).type = "password";
    btn.innerHTML = eyeOpen;
  });
  pills.forEach((p) => p.classList.remove("on"));
  submitBtn.disabled = true;
  $("success").classList.remove("show");
});
