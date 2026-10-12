
const $ = (id) => document.getElementById(id);

const initialJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechNova",
    location: "Lahore / Remote",
    category: "Development",
    salary: "PKR 80k–120k",
    type: "Full-time",
    description: "Build responsive web interfaces using HTML, CSS, JavaScript and modern frontend tools."
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "PixelCraft",
    location: "Remote",
    category: "Design",
    salary: "PKR 60k–100k",
    type: "Full-time",
    description: "Create user-friendly designs, wireframes and prototypes for digital products."
  },
  {
    id: 3,
    title: "Digital Marketing Intern",
    company: "GrowthLab",
    location: "Lahore",
    category: "Marketing",
    salary: "PKR 25k–40k",
    type: "Internship",
    description: "Support social media campaigns, content planning and marketing analytics."
  },
  {
    id: 4,
    title: "Python Developer",
    company: "CodeSphere",
    location: "Remote",
    category: "Development",
    salary: "PKR 90k–140k",
    type: "Full-time",
    description: "Develop Python applications, APIs and automation tools with a collaborative team."
  },
  {
    id: 5,
    title: "Business Analyst",
    company: "Nexa Solutions",
    location: "Islamabad",
    category: "Business",
    salary: "PKR 70k–110k",
    type: "Full-time",
    description: "Analyze business requirements, document processes and support data-driven decisions."
  },
  {
    id: 6,
    title: "Graphic Designer",
    company: "Creative House",
    location: "Remote",
    category: "Design",
    salary: "PKR 45k–75k",
    type: "Part-time",
    description: "Design engaging digital graphics, campaign assets and brand materials."
  }
];

const readStorage = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

let applications = readStorage("hirehubApplications");
let customJobs = readStorage("hirehubCustomJobs");
let jobs = [...initialJobs, ...customJobs];
let chart = null;
let toastTimer;

function saveData() {
  try {
    localStorage.setItem("hirehubApplications", JSON.stringify(applications));
    localStorage.setItem("hirehubCustomJobs", JSON.stringify(customJobs));
  } catch {
    showToast("Browser storage unavailable. Changes may not persist.");
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function renderJobs() {
  const query = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;

  const filteredJobs = jobs.filter((job) => {
    const searchable = [
      job.title, job.company, job.location,
      job.category, job.description, job.type
    ].join(" ").toLowerCase();

    return searchable.includes(query) &&
      (!category || job.category === category);
  });

  $("jobCount").textContent = `${filteredJobs.length} jobs found`;

  if (!filteredJobs.length) {
    $("jobList").innerHTML =
      '<div class="empty-state">No matching jobs found. Try another search.</div>';
    return;
  }

  $("jobList").innerHTML = filteredJobs.map((job) => `
    <article class="job-card">
      <div class="job-top">
        <div class="company-icon">${escapeHTML(job.company.charAt(0).toUpperCase())}</div>
        <span class="tag">${escapeHTML(job.type)}</span>
      </div>
      <div>
        <h3>${escapeHTML(job.title)}</h3>
        <p class="company-name">${escapeHTML(job.company)}</p>
      </div>
      <div class="job-meta">
        <span>📍 ${escapeHTML(job.location)}</span>
        <span>✦ ${escapeHTML(job.category)}</span>
      </div>
      <p class="job-description">${escapeHTML(job.description)}</p>
      <p class="job-salary">${escapeHTML(job.salary)}</p>
      <div class="job-actions">
        <button class="btn-secondary" data-details="${job.id}">View Details</button>
        <button class="btn" data-apply="${job.id}">Apply Now</button>
      </div>
    </article>
  `).join("");
}

function showJobDetails(id) {
  const job = jobs.find((item) => item.id === Number(id));
  if (!job) return;

  $("jobDetails").innerHTML = `
    <span class="tag">${escapeHTML(job.category)}</span>
    <h2>${escapeHTML(job.title)}</h2>
    <p class="company-name">${escapeHTML(job.company)}</p>
    <p class="job-meta">${escapeHTML(job.location)} · ${escapeHTML(job.type)}</p>
    <h3 style="margin-top:20px">About this role</h3>
    <p class="job-description" style="margin:12px 0">${escapeHTML(job.description)}</p>
    <p class="job-salary">${escapeHTML(job.salary)}</p>
    <button class="btn" style="margin-top:20px" data-apply="${job.id}">Apply for this Job</button>
  `;

  $("detailsDialog").showModal();
}

function openApplication(id) {
  const job = jobs.find((item) => item.id === Number(id));
  if (!job) return;

  $("applyJobId").value = job.id;
  $("applyJobTitle").textContent = `${job.title} at ${job.company}`;
  $("detailsDialog").close();
  $("jobDialog").showModal();
}

function renderApplications() {
  $("applicationCount").textContent = applications.length;
  $("reviewCount").textContent = applications.filter(
    (app) => app.status === "Under Review"
  ).length;
  $("interviewCount").textContent = applications.filter(
    (app) => Boolean(app.interviewDate)
  ).length;
  $("offerCount").textContent = applications.filter(
    (app) => app.status === "Hired"
  ).length;

  if (!applications.length) {
    $("applicationList").innerHTML = `
      <div class="empty-state">
        No applications yet. Explore jobs and apply to get started.
      </div>`;
    return;
  }

  $("applicationList").innerHTML = applications.map((app) => `
    <article class="application-item">
      <div class="application-info">
        <h4>${escapeHTML(app.jobTitle)}</h4>
        <p>${escapeHTML(app.candidateName)} · ${escapeHTML(app.email)}</p>
        <p>Applied: ${escapeHTML(app.appliedAt)}</p>
        <span class="status-badge ${app.status === "Hired" ? "hired" : app.status === "Rejected" ? "rejected" : ""}">
          ${escapeHTML(app.status)}
        </span>
        ${app.interviewDate ? `
          <p>Interview: ${escapeHTML(app.interviewDate.replace("T", " "))} · ${escapeHTML(app.interviewType || "Online")}</p>
          ${app.interviewLocation ? `<p>${escapeHTML(app.interviewLocation)}</p>` : ""}
        ` : ""}
      </div>
      <div class="application-actions">
        <button class="btn-secondary" data-interview="${app.id}">Interview</button>
        <button class="btn-secondary" data-status="${app.id}">Update Status</button>
      </div>
    </article>
  `).join("");
}

function renderAnalytics() {
  const countStatus = (status) =>
    applications.filter((app) => app.status === status).length;

  const stages = [
    { label: "Under Review", value: countStatus("Under Review") },
    { label: "Shortlisted", value: countStatus("Shortlisted") },
    { label: "Interviews Scheduled", value: applications.filter((app) => Boolean(app.interviewDate)).length },
    { label: "Hired", value: countStatus("Hired") },
    { label: "Rejected", value: countStatus("Rejected") }
  ];

  $("analyticsJobs").textContent = jobs.length;
  $("analyticsApplications").textContent = applications.length;
  $("analyticsInterviews").textContent = applications.filter(
    (app) => Boolean(app.interviewDate)
  ).length;
  $("analyticsOffers").textContent = countStatus("Hired");

  const total = applications.length;

  $("progressBars").innerHTML = stages.map((stage) => {
    const percentage = total ? Math.round(stage.value / total * 100) : 0;

    return `
      <div class="progress-item">
        <div class="progress-label">
          <span>${escapeHTML(stage.label)}</span>
          <strong>${stage.value} · ${percentage}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${percentage}%"></div>
        </div>
      </div>`;
  }).join("");

  const canvas = $("statusChart");
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Under Review", "Shortlisted", "Hired", "Rejected"],
      datasets: [{
        data: [
          countStatus("Under Review"),
          countStatus("Shortlisted"),
          countStatus("Hired"),
          countStatus("Rejected")
        ],
        backgroundColor: ["#e9bd61", "#8e78d8", "#70d6a2", "#ff8888"],
        borderColor: "#151518",
        borderWidth: 4,
        hoverOffset: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#d8d5cf",
            padding: 17,
            usePointStyle: true,
            pointStyle: "circle"
          }
        }
      }
    }
  });
}

function renderAll() {
  renderJobs();
  renderApplications();
  renderAnalytics();
}

$("searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderJobs();
});

$("searchInput").addEventListener("input", renderJobs);
$("categoryFilter").addEventListener("change", renderJobs);

$("jobList").addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-details]");
  const applyButton = event.target.closest("[data-apply]");

  if (detailsButton) showJobDetails(detailsButton.dataset.details);
  if (applyButton) openApplication(applyButton.dataset.apply);
});

$("jobDetails").addEventListener("click", (event) => {
  const button = event.target.closest("[data-apply]");
  if (button) openApplication(button.dataset.apply);
});

$("applicationForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const jobId = Number($("applyJobId").value);
  const job = jobs.find((item) => item.id === jobId);
  const name = $("candidateName").value.trim();
  const email = $("candidateEmail").value.trim().toLowerCase();
  const phone = $("candidatePhone").value.trim();
  const skills = $("candidateSkills").value.trim();

  if (!job || !name || !email || !phone || !skills) {
    showToast("Please complete all required fields.");
    return;
  }

  const duplicate = applications.some(
    (app) => app.jobId === jobId && app.email.toLowerCase() === email
  );

  if (duplicate) {
    showToast("You have already applied for this job.");
    return;
  }

  applications.unshift({
    id: Date.now(),
    jobId,
    jobTitle: job.title,
    candidateName: name,
    email,
    phone,
    skills,
    status: "Under Review",
    interviewDate: "",
    interviewType: "",
    interviewLocation: "",
    appliedAt: new Date().toLocaleDateString()
  });

  saveData();
  $("applicationForm").reset();
  $("jobDialog").close();
  renderAll();
  showToast("Application submitted successfully!");
});

$("postJobBtn").addEventListener("click", () => {
  $("postJobDialog").showModal();
});

$("postJobForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const newJob = {
    id: Date.now(),
    title: $("newJobTitle").value.trim(),
    company: $("newJobCompany").value.trim(),
    location: $("newJobLocation").value.trim(),
    category: $("newJobCategory").value,
    salary: $("newJobSalary").value.trim(),
    type: $("newJobType").value,
    description: $("newJobDescription").value.trim()
  };

  if (!newJob.title || !newJob.company || !newJob.location ||
      !newJob.salary || !newJob.description) {
    showToast("Please complete all job details.");
    return;
  }

  customJobs.unshift(newJob);
  jobs = [...initialJobs, ...customJobs];

  saveData();
  $("postJobForm").reset();
  $("postJobDialog").close();
  renderAll();
  showToast("New job published successfully!");
});

$("applicationList").addEventListener("click", (event) => {
  const interviewButton = event.target.closest("[data-interview]");
  const statusButton = event.target.closest("[data-status]");

  if (interviewButton) {
    $("interviewApplicationId").value = interviewButton.dataset.interview;
    $("interviewDate").value = "";
    $("interviewLocation").value = "";
    $("interviewDialog").showModal();
  }

  if (statusButton) {
    const app = applications.find(
      (item) => item.id === Number(statusButton.dataset.status)
    );
    if (!app) return;

    const statuses = ["Under Review", "Shortlisted", "Hired", "Rejected"];
    const currentIndex = statuses.indexOf(app.status);
    app.status = statuses[(currentIndex + 1) % statuses.length];

    saveData();
    renderAll();
    showToast(`Status updated to ${app.status}.`);
  }
});

$("interviewForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const appId = Number($("interviewApplicationId").value);
  const app = applications.find((item) => item.id === appId);
  const date = $("interviewDate").value;

  if (!app || !date) {
    showToast("Please select an interview date and time.");
    return;
  }

  if (new Date(date).getTime() <= Date.now()) {
    showToast("Please select a future date and time.");
    return;
  }

  app.interviewDate = date;
  app.interviewType = $("interviewType").value;
  app.interviewLocation = $("interviewLocation").value.trim();

  saveData();
  $("interviewDialog").close();
  renderAll();
  showToast("Interview scheduled successfully!");
});

renderAll();

