const API_BASE = "/api";

let patients = [];
let doctors = [];
let labTests = [];
let medicines = [];
let billing = [];
let wards = [];
let activePatientFilter = "all";
let toastTimer;
let searchTimer;
let authToken = localStorage.getItem("medcore_token") || "";
let currentUser = null;

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function toInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function formatDateDisplay(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatExpiry(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function formatTime(dateTimeString) {
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function colorByDepartment(dept) {
  const map = {
    Cardiology: "#1e40af",
    Orthopedics: "#6d28d9",
    "General Medicine": "#1a5e4a",
    Neurology: "#c0392b",
    Maternity: "#d97706",
    ICU: "#c0392b",
    Dermatology: "#1e40af",
    Surgery: "#6d28d9",
    Pediatrics: "#2563eb",
  };
  return map[dept] || "#6b6860";
}

function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(`err-${inputId}`);
  if (input) input.classList.add("input-error");
  if (error) error.textContent = message;
}

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(`err-${inputId}`);
  if (input) input.classList.remove("input-error");
  if (error) error.textContent = "";
}

function clearValidationErrors(ids) {
  ids.forEach((id) => clearFieldError(id));
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok || !payload.success) {
    const error = new Error(payload.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function showView(name, btn) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  if (btn) btn.classList.add("active");
  const titles = {
    dashboard: "Dashboard",
    patients: "Patients",
    appointments: "Appointments",
    doctors: "Doctors & Staff",
    wards: "Wards & Beds",
    lab: "Laboratory",
    billing: "Billing",
    pharmacy: "Pharmacy",
    reports: "Reports",
  };
  document.getElementById("page-title").textContent = titles[name] || name;
  window.scrollTo(0, 0);
}

function setTab(el, view, tab) {
  el.closest(".tabs").querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  activePatientFilter = tab;
  renderPatientsTable();
  updatePageStatistics();
  showToast("Filter: " + tab + " patients");
}

function updateAuthUI() {
  const button = document.getElementById("auth-button");
  const chip = document.getElementById("auth-role-chip");
  const sidebarAvatar = document.getElementById("sidebar-avatar");
  const sidebarUserName = document.getElementById("sidebar-user-name");
  const sidebarUserRole = document.getElementById("sidebar-user-role");
  if (!button || !chip) return;

  if (currentUser) {
    button.textContent = "Sign Out";
    button.onclick = logout;
    chip.style.display = "inline-flex";
    chip.textContent = `${currentUser.role} - ${currentUser.name}`;
    if (sidebarAvatar) sidebarAvatar.textContent = toInitials(currentUser.name);
    if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
    if (sidebarUserRole) sidebarUserRole.textContent = currentUser.email;
  } else {
    button.textContent = "Sign In";
    button.onclick = openAuthModal;
    chip.style.display = "none";
    chip.textContent = "";
    if (sidebarAvatar) sidebarAvatar.textContent = "DR";
    if (sidebarUserName) sidebarUserName.textContent = "Dr. Rajan Sharma";
    if (sidebarUserRole) sidebarUserRole.textContent = "Chief Medical Officer";
  }
}

function openAuthModal() {
  clearValidationErrors(["auth-email", "auth-password"]);
  openModal("modal-auth");
}

function logout() {
  authToken = "";
  currentUser = null;
  localStorage.removeItem("medcore_token");
  updateAuthUI();
  showToast("Signed out");
}

async function loginFromModal() {
  clearValidationErrors(["auth-email", "auth-password"]);
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  let hasError = false;

  if (!email) {
    setFieldError("auth-email", "Email is required");
    hasError = true;
  }
  if (!password) {
    setFieldError("auth-password", "Password is required");
    hasError = true;
  }
  if (hasError) return;

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem("medcore_token", authToken);
    closeModal("modal-auth");
    updateAuthUI();
    showToast(`Signed in as ${currentUser.role}`);
  } catch (error) {
    setFieldError("auth-password", error.message);
  }
}

function handleUnauthorized(error) {
  if (error && (error.status === 401 || error.status === 403)) {
    showToast("Please sign in with the required role");
    openAuthModal();
    return true;
  }
  return false;
}

function renderPatientsTable() {
  const tbody = document.getElementById("patients-table-body");
  if (!tbody) return;
  const statusMap = { admitted: "badge-blue", opd: "badge-green", critical: "badge-red", discharged: "badge-gray" };
  const statusLabel = { admitted: "Admitted", opd: "OPD", critical: "Critical", discharged: "Discharged" };
  const filtered = activePatientFilter === "all" ? patients : patients.filter((p) => p.status === activePatientFilter);

  tbody.innerHTML = filtered
    .map(
      (p) => `
    <tr>
      <td><div class="pat-mini"><div class="pat-avatar" style="background:${p.color}20;color:${p.color}">${p.avatar}</div><div><div class="td-name">${p.name}</div></div></div></td>
      <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${p.id}</span></td>
      <td>${p.age} / ${p.gender}</td>
      <td>${p.dept}</td>
      <td>${p.doctor}</td>
      <td><span class="badge ${statusMap[p.status] || "badge-gray"}">${statusLabel[p.status] || p.status}</span></td>
      <td style="color:var(--text-muted);font-size:12px">${p.admitted}</td>
      <td><button class="btn btn-outline btn-sm" onclick="event.stopPropagation();viewPatientDetails('${p.id}', '${p.name}')">View</button></td>
    </tr>`
    )
    .join("");
}

function renderDoctors() {
  const grid = document.getElementById("doctors-grid");
  if (!grid) return;
  const statusColors = { "on-duty": "badge-green", off: "badge-gray", surgery: "badge-blue" };
  const statusLabel = { "on-duty": "On Duty", off: "Off Duty", surgery: "In Surgery" };
  grid.innerHTML = doctors
    .map(
      (d) => `
    <div class="card" style="cursor:pointer">
      <div class="card-body">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div class="avatar" style="width:44px;height:44px;font-size:14px">${d.avatar}</div>
          <div style="flex:1">
            <div style="font-weight:500;font-size:14px">${d.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">${d.department}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:12px;color:var(--text-muted)">${d.exp} exp - ${d.patients} active patients</div>
          <span class="badge ${statusColors[d.status] || "badge-gray"}">${statusLabel[d.status] || d.status}</span>
        </div>
      </div>
    </div>`
    )
    .join("");
}

function renderBeds(containerId, wardData) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = "";
  wardData.beds.forEach((bed) => {
    const cls = bed.status === "occupied" ? "bed bed-occ" : bed.status === "maintenance" ? "bed bed-maint" : "bed bed-free";
    const label = bed.status === "occupied" ? "OCC" : bed.status === "maintenance" ? "M" : "FREE";
    const patientInfo = bed.patient_id ? ` - Patient ID: ${bed.patient_id}` : "";
    html += `<div class="${cls}" title="Bed ${bed.bed_number}: ${label}${patientInfo}" onclick="toggleBedStatus('${containerId}', ${bed.id}, '${bed.status}', ${bed.patient_id || 'null'})">${bed.bed_number}</div>`;
  });
  container.innerHTML = html;
}

async function toggleBedStatus(containerId, bedId, currentStatus, patientId) {
  const statuses = ["free", "occupied", "maintenance"];
  const currentIndex = statuses.indexOf(currentStatus);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];

  // For occupied status, we need a patient ID
  let finalPatientId = null;
  if (nextStatus === "occupied") {
    const patientCode = prompt("Enter patient code to assign to this bed:");
    if (!patientCode) {
      showToast("❌ Patient code required to occupy bed");
      return;
    }
    // Find patient by code
    const patient = patients.find(p => p.id === patientCode);
    if (!patient) {
      showToast("❌ Patient not found");
      return;
    }
    finalPatientId = patient.dbId;
  }

  try {
    showToast(`Updating bed status to ${nextStatus}...`);
    await apiRequest(`/beds/${bedId}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status: nextStatus,
        patientId: finalPatientId,
      }),
    });
    showToast(`✓ Bed status updated to ${nextStatus}`);
    await loadModuleData(); // Refresh the data
  } catch (error) {
    if (handleUnauthorized(error)) return;
    showToast(`✗ Failed to update bed: ${error.message}`);
  }
}

function renderWards() {
  const map = { ICU: "beds-icu", "General Ward": "beds-general", Maternity: "beds-maternity", Pediatrics: "beds-pediatrics" };
  wards.forEach((ward) => {
    if (map[ward.name]) {
      renderBeds(map[ward.name], ward);
    }
  });
}

function renderLabTable() {
  const tbody = document.getElementById("lab-table-body");
  if (!tbody) return;
  const statusMap = { pending: "badge-amber", "in-progress": "badge-blue", ready: "badge-green" };
  const prioMap = { routine: "badge-gray", urgent: "badge-red", stat: "badge-red" };
  tbody.innerHTML = labTests
    .map(
      (t) => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace;font-size:12px">${t.id}</span></td>
      <td class="td-name">${t.patient}</td>
      <td>${t.test}</td>
      <td style="color:var(--text-muted)">${t.ordered}</td>
      <td><span class="badge ${prioMap[t.priority] || "badge-gray"}">${t.priority}</span></td>
      <td><span class="badge ${statusMap[t.status] || "badge-gray"}">${t.status}</span></td>
      <td style="color:var(--text-muted);font-size:12px">${t.time}</td>
    </tr>`
    )
    .join("");
}

function renderBillingTable() {
  const tbody = document.getElementById("billing-table-body");
  if (!tbody) return;
  const statusMap = { paid: "badge-green", pending: "badge-amber", partial: "badge-blue", overdue: "badge-red" };
  tbody.innerHTML = billing
    .map(
      (b) => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace;font-size:12px">${b.inv}</span></td>
      <td class="td-name">${b.patient}</td>
      <td style="color:var(--text-muted);font-size:12px">${b.services}</td>
      <td style="font-weight:500">${b.amount}</td>
      <td style="color:var(--text-muted)">${b.ins}</td>
      <td style="font-weight:500;color:var(--accent)">${b.net}</td>
      <td><span class="badge ${statusMap[b.status] || "badge-gray"}">${b.status}</span></td>
    </tr>`
    )
    .join("");
}

function renderPharmacyTable() {
  const tbody = document.getElementById("pharmacy-table-body");
  if (!tbody) return;
  const statusMap = { ok: "badge-green", low: "badge-amber", critical: "badge-red" };
  tbody.innerHTML = medicines
    .map(
      (m) => `
    <tr>
      <td class="td-name">${m.name}</td>
      <td><span class="badge badge-blue">${m.category}</span></td>
      <td style="font-family:'DM Mono',monospace;font-weight:500;color:${m.status === "critical" ? "var(--red)" : m.status === "low" ? "var(--amber)" : "var(--accent)"}">${m.stock}</td>
      <td style="color:var(--text-muted)">${m.unit}</td>
      <td style="color:var(--text-muted);font-size:12px">${m.expiry}</td>
      <td><span class="badge ${statusMap[m.status] || "badge-gray"}">${m.status === "ok" ? "Adequate" : m.status === "low" ? "Low Stock" : "Critical"}</span></td>
      <td><button class="btn btn-outline btn-sm" onclick="reorderMedicine(${m.id}, '${m.name.replace(/'/g, "\\'")}')">Reorder</button></td>
    </tr>`
    )
    .join("");
}

function renderChart(containerId, labelId, data1, data2, colors, labels) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data1, ...(data2 || [0]));
  el.innerHTML = data1
    .map(
      (v, i) => `
    <div class="bar-wrap">
      <div class="bar" style="height:${Math.round((v / max) * 100)}%;background:${colors[0]}" title="${labels[i]}: ${v}"></div>
      ${data2 && data2.length ? `<div class="bar" style="height:${Math.round((data2[i] / max) * 100)}%;background:${colors[1]}" title="${labels[i]}: ${data2[i]}"></div>` : ""}
    </div>`
    )
    .join("");
  if (labelId) {
    const lbl = document.getElementById(labelId);
    if (lbl) lbl.innerHTML = labels.map((l) => `<span style="font-size:11px;color:var(--text-muted);flex:1;text-align:center">${l}</span>`).join("");
  }
}

function renderReports() {
  const reportList = document.getElementById("report-list");
  const reports = ["Monthly Admission Report", "Financial Summary", "Staff Performance", "Bed Occupancy Report", "Lab Turnaround Time", "Patient Satisfaction"];
  if (reportList) {
    reportList.innerHTML = reports
      .map(
        (r) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px">${r}</span>
      <button class="btn btn-outline btn-sm" onclick="showToast('Generating: ${r}')">Export PDF</button>
    </div>`
      )
      .join("");
  }
}

function renderCalendar() {
  const el = document.getElementById("mini-calendar");
  if (!el) return;
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const apptDays = [1, 3, 5, 7, 10, 12, 14, 17, 19, 21, 24, 26, 28];
  let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:8px">`;
  html += days.map((d) => `<div style="text-align:center;font-size:11px;font-weight:600;color:var(--text-muted);padding:4px 0">${d}</div>`).join("");
  html += "</div><div style=\"display:grid;grid-template-columns:repeat(7,1fr);gap:4px\">";
  for (let i = 0; i < 2; i++) html += "<div></div>";
  for (let i = 1; i <= 30; i++) {
    const isToday = i === 3;
    const hasAppt = apptDays.includes(i);
    html += `<div style="text-align:center;padding:5px 0;border-radius:6px;font-size:13px;cursor:pointer;
      background:${isToday ? "var(--accent)" : "transparent"};
      color:${isToday ? "#fff" : "var(--text)"};
      ${hasAppt && !isToday ? "position:relative" : ""}" 
      onclick="showToast('Appointments on Apr ${i}')" title="${hasAppt ? "Has appointments" : ""}">
      ${i}${hasAppt && !isToday ? '<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--accent);display:block"></span>' : ""}
    </div>`;
  }
  el.innerHTML = html + "</div>";
}

function updateDashboardSummary(summary) {
  const row = document.querySelector("#view-dashboard .stats-grid");
  if (!row) return;
  const cards = row.querySelectorAll(".stat-card");
  if (cards.length < 4) return;
  cards[0].querySelector(".stat-value").textContent = summary.totalPatients.toLocaleString("en-IN");
  cards[1].querySelector(".stat-value").innerHTML = `${summary.occupiedBeds}<span style="font-size:16px;color:var(--text-muted)">/${summary.totalBeds}</span>`;
  cards[2].querySelector(".stat-value").textContent = summary.todaysAppointments;
  cards[3].querySelector(".stat-value").textContent = rupee.format(summary.monthlyRevenue);
}

function updatePageStatistics() {
  // Update patient statistics
  const admittedCount = patients.filter(p => p.status === "admitted").length;
  const patientEl = document.getElementById("patient-stats-summary");
  if (patientEl) {
    patientEl.textContent = `${patients.length} registered patients • ${admittedCount} currently admitted`;
  }

  // Update patient table stats
  const tableStatsEl = document.getElementById("patient-table-stats");
  if (tableStatsEl) {
    const filtered = activePatientFilter === "all" ? patients : patients.filter((p) => p.status === activePatientFilter);
    tableStatsEl.textContent = `Showing ${Math.min(10, filtered.length)}–${Math.min(10, filtered.length)} of ${filtered.length}`;
  }

  // Update doctor statistics
  const onDutyDoctors = doctors.filter(d => d.status === "on-duty").length;
  const doctorEl = document.getElementById("doctor-stats-summary");
  if (doctorEl) {
    doctorEl.textContent = `${doctors.length} doctors • ${onDutyDoctors} on duty today`;
  }

  // Update bed statistics
  if (wards && wards.length > 0) {
    const totalOccupied = wards.reduce((sum, w) => sum + w.occupied, 0);
    const totalFree = wards.reduce((sum, w) => sum + w.free, 0);
    const totalMaint = wards.reduce((sum, w) => sum + w.maintenance, 0);
    const bedsEl = document.getElementById("beds-stats-summary");
    if (bedsEl) {
      bedsEl.textContent = `${totalOccupied} occupied · ${totalFree} available · ${totalMaint} maintenance`;
    }

    wards.forEach(w => {
      const dbWardName = w.name === "ICU" ? "icu" :
                         w.name === "General Ward" ? "general" :
                         w.name === "Maternity" ? "maternity" :
                         w.name === "Pediatrics" ? "pediatrics" :
                         w.name === "Surgery" ? "surgery" : null;
      if (dbWardName) {
        const total = (w.beds && w.beds.length) ? w.beds.length : (w.free + w.occupied + w.maintenance);
        const occ = w.occupied;
        const pct = total > 0 ? Math.round((occ / total) * 100) : 0;
        
        // Update Dashboard text
        const dashText = document.getElementById(`dash-occ-text-${dbWardName}`);
        if (dashText) {
          dashText.innerHTML = `${occ}/${total} <span style="font-weight:400;color:var(--text-muted);font-size:12px">${pct}%</span>`;
        }
        // Update Dashboard progress bar
        const dashProg = document.getElementById(`dash-occ-prog-${dbWardName}`);
        if (dashProg) {
          dashProg.style.width = `${pct}%`;
        }
        // Update Wards view badge
        const badge = document.getElementById(`ward-badge-${dbWardName}`);
        if (badge) {
          badge.textContent = `${pct}% full`;
          badge.className = `badge ${pct > 85 ? "badge-red" : (pct > 70 ? "badge-amber" : "badge-green")}`;
        }
      }
    });

    const totalBeds = totalOccupied + totalFree + totalMaint;
    const occPct = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;
    const row = document.querySelector("#view-dashboard .stats-grid");
    if (row) {
      const cards = row.querySelectorAll(".stat-card");
      if (cards.length >= 2) {
        const statChange = cards[1].querySelector(".stat-change");
        if (statChange) {
          statChange.textContent = `↑ ${occPct}% occupancy rate`;
        }
      }
    }
  }

  // Update lab statistics
  const labPending = labTests.filter(t => t.status === "pending").length;
  const labReady = labTests.filter(t => t.status === "ready").length;
  const labEl = document.getElementById("lab-stats-summary");
  if (labEl) {
    labEl.textContent = `${labPending} tests pending • ${labReady} results ready`;
  }

  // Update billing statistics
  if (billing && billing.length > 0) {
    const totalBilling = billing.reduce((sum, b) => {
      const amount = typeof b.amount === "string" ? parseFloat(b.amount.replace(/[₹,]/g, "")) : 0;
      return sum + amount;
    }, 0);
    const totalCollected = billing.reduce((sum, b) => {
      const status = b.status;
      const amount = typeof b.net === "string" ? parseFloat(b.net.replace(/[₹,]/g, "")) : 0;
      return sum + (status === "paid" ? amount : 0);
    }, 0);
    const billingEl = document.getElementById("billing-stats-summary");
    if (billingEl) {
      const pending = totalBilling - totalCollected;
      billingEl.textContent = `₹${(pending / 100000).toFixed(1)}L pending • ₹${(totalCollected / 100000).toFixed(1)}L collected`;
    }
  }

  // Update pharmacy statistics
  if (medicines && medicines.length > 0) {
    const lowStock = medicines.filter(m => m.status !== "ok").length;
    const pharmacyEl = document.getElementById("pharmacy-stats-summary");
    if (pharmacyEl) {
      pharmacyEl.textContent = `${medicines.length} medicines • ${lowStock} low stock alerts`;
    }
  }
}

function populateDoctorSelects() {
  const patientDoctor = document.getElementById("add-patient-doctor");
  const appointmentDoctor = document.getElementById("book-appt-doctor");
  const labDoctor = document.getElementById("add-lab-doctor");
  if (patientDoctor) patientDoctor.innerHTML = doctors.map((d) => `<option value="${d.id}">${d.name} (${d.department})</option>`).join("");
  if (appointmentDoctor) appointmentDoctor.innerHTML = doctors.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
  if (labDoctor) labDoctor.innerHTML = `<option value="">Select Doctor</option>` + doctors.map((d) => `<option value="${d.id}">${d.name} (${d.department})</option>`).join("");
}

function populateAppointmentPatientSelect() {
  const patientSelect = document.getElementById("book-appt-patient");
  if (!patientSelect) return;
  
  // For input field, we'll use a datalist or autocomplete functionality
  // Create a hidden datalist for autocomplete
  let datalist = document.getElementById("patients-datalist");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "patients-datalist";
    document.body.appendChild(datalist);
    patientSelect.setAttribute("list", "patients-datalist");
  }
  
  datalist.innerHTML = patients
    .map((p) => `<option value="${p.id} - ${p.name}">`)
    .join("");
}

async function reorderMedicine(id, name) {
  try {
    await apiRequest(`/medicines/${id}/reorder`, { method: "POST", body: JSON.stringify({ qtyToAdd: 100 }) });
    showToast(`Reorder placed for ${name}`);
    await loadModuleData();
  } catch (error) {
    if (handleUnauthorized(error)) return;
    showToast(`Reorder failed: ${error.message}`);
  }
}

async function createPatientFromModal() {
  const fields = ["add-patient-first-name", "add-patient-last-name", "add-patient-dob", "add-patient-gender", "add-patient-phone"];
  clearValidationErrors(fields);

  const firstName = document.getElementById("add-patient-first-name").value.trim();
  const lastName = document.getElementById("add-patient-last-name").value.trim();
  const dob = document.getElementById("add-patient-dob").value;
  const genderInput = document.getElementById("add-patient-gender").value;
  const doctorId = Number(document.getElementById("add-patient-doctor").value);
  const phone = document.getElementById("add-patient-phone").value.trim();
  const bloodGroup = document.getElementById("add-patient-blood-group").value;
  const insuranceProvider = document.getElementById("add-patient-insurance-provider").value.trim();
  const admissionType = document.getElementById("add-patient-admission-type").value;
  const department = (() => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.department : "General Medicine";
  })();

  let hasError = false;
  if (!firstName) {
    setFieldError("add-patient-first-name", "First name is required");
    hasError = true;
  }
  if (!lastName) {
    setFieldError("add-patient-last-name", "Last name is required");
    hasError = true;
  }
  if (!dob) {
    setFieldError("add-patient-dob", "Date of birth is required");
    hasError = true;
  }
  if (genderInput === "Select gender" || !genderInput) {
    setFieldError("add-patient-gender", "Gender is required");
    hasError = true;
  }
  if (!/^\+?\d{10,13}$/.test(phone.replace(/\s+/g, ""))) {
    setFieldError("add-patient-phone", "Enter a valid phone number (10-13 digits)");
    hasError = true;
  }
  if (hasError) return;

  const age = Math.max(0, new Date().getFullYear() - new Date(dob).getFullYear());
  const gender = genderInput === "Male" ? "M" : genderInput === "Female" ? "F" : "Other";
  const status = admissionType === "IPD" ? "admitted" : admissionType === "Emergency" ? "critical" : "opd";

  try {
    showToast("Registering patient...");
    const created = await apiRequest("/patients", {
      method: "POST",
      body: JSON.stringify({
        firstName,
        lastName,
        age,
        gender,
        department,
        doctorId,
        status,
        admittedOn: new Date().toISOString().slice(0, 10),
        phone,
        bloodGroup,
        insuranceProvider,
      }),
    });

    closeModal("modal-add-patient");
    showToast(`✓ Patient registered - ID: ${created.patientCode}`);
    // Clear form fields
    document.getElementById("add-patient-first-name").value = "";
    document.getElementById("add-patient-last-name").value = "";
    document.getElementById("add-patient-dob").value = "";
    document.getElementById("add-patient-gender").value = "Select gender";
    document.getElementById("add-patient-phone").value = "";
    await loadModuleData();
  } catch (error) {
    if (handleUnauthorized(error)) return;
    setFieldError("add-patient-phone", `Registration failed: ${error.message}`);
    showToast(`✗ Registration failed: ${error.message}`);
  }
}

async function createDoctorFromModal() {
  const fields = ["add-doctor-name", "add-doctor-department", "add-doctor-experience"];
  clearValidationErrors(fields);

  const name = document.getElementById("add-doctor-name").value.trim();
  const department = document.getElementById("add-doctor-department").value;
  const experienceYears = Number(document.getElementById("add-doctor-experience").value);
  const status = document.getElementById("add-doctor-status").value;

  let hasError = false;
  if (!name) {
    setFieldError("add-doctor-name", "Doctor name is required");
    hasError = true;
  }
  if (!department) {
    setFieldError("add-doctor-department", "Department is required");
    hasError = true;
  }
  if (!experienceYears || experienceYears < 0) {
    setFieldError("add-doctor-experience", "Valid experience years is required");
    hasError = true;
  }
  if (hasError) return;

  try {
    showToast("Adding doctor...");
    const created = await apiRequest("/doctors", {
      method: "POST",
      body: JSON.stringify({
        name,
        department,
        experienceYears,
        status,
      }),
    });

    closeModal("add-doctor-modal");
    showToast(`✓ Doctor added successfully`);
    // Clear form fields
    document.getElementById("add-doctor-name").value = "";
    document.getElementById("add-doctor-department").value = "";
    document.getElementById("add-doctor-experience").value = "";
    document.getElementById("add-doctor-status").value = "on-duty";
    await loadModuleData();
  } catch (error) {
    if (handleUnauthorized(error)) return;
    setFieldError("add-doctor-name", `Failed to add doctor: ${error.message}`);
    showToast(`✗ Failed to add doctor: ${error.message}`);
  }
}

async function createLabTestFromModal() {
  const fields = ["add-lab-patient", "add-lab-test-name", "add-lab-priority", "add-lab-doctor"];
  clearValidationErrors(fields);

  const patientInput = document.getElementById("add-lab-patient").value.trim();
  const testName = document.getElementById("add-lab-test-name").value;
  const priority = document.getElementById("add-lab-priority").value;
  const doctorId = Number(document.getElementById("add-lab-doctor").value);

  let hasError = false;
  if (!patientInput) {
    setFieldError("add-lab-patient", "Patient is required");
    hasError = true;
  }
  if (!testName) {
    setFieldError("add-lab-test-name", "Test name is required");
    hasError = true;
  }
  if (!priority) {
    setFieldError("add-lab-priority", "Priority is required");
    hasError = true;
  }
  if (!doctorId) {
    setFieldError("add-lab-doctor", "Doctor is required");
    hasError = true;
  }
  if (hasError) return;

  // Find patient by code or name
  const searchStr = patientInput.split(" - ")[0].trim().toLowerCase();
  let patient = patients.find(p => p.id.toLowerCase() === searchStr);
  if (!patient) {
    patient = patients.find(p => p.name.toLowerCase().includes(searchStr));
  }
  if (!patient) {
    setFieldError("add-lab-patient", "Patient not found");
    return;
  }

  try {
    showToast("Creating lab test request...");
    const created = await apiRequest("/lab-tests", {
      method: "POST",
      body: JSON.stringify({
        patientId: patient.dbId,
        orderedByDoctorId: doctorId,
        testName,
        priority,
        orderedAt: new Date().toISOString(),
      }),
    });

    closeModal("add-lab-test-modal");
    showToast(`✓ Lab test requested - ID: ${created.testCode}`);
    // Clear form fields
    document.getElementById("add-lab-patient").value = "";
    document.getElementById("add-lab-test-name").value = "";
    document.getElementById("add-lab-priority").value = "routine";
    document.getElementById("add-lab-doctor").value = "";
    await loadModuleData();
  } catch (error) {
    if (handleUnauthorized(error)) return;
    setFieldError("add-lab-patient", `Failed to create test: ${error.message}`);
    showToast(`✗ Failed to create lab test: ${error.message}`);
  }
}

async function createMedicineFromModal() {
  const fields = ["add-medicine-name", "add-medicine-category", "add-medicine-stock", "add-medicine-unit", "add-medicine-expiry"];
  clearValidationErrors(fields);

  const name = document.getElementById("add-medicine-name").value.trim();
  const category = document.getElementById("add-medicine-category").value;
  const stock = Number(document.getElementById("add-medicine-stock").value);
  const unit = document.getElementById("add-medicine-unit").value;
  const expiryDate = document.getElementById("add-medicine-expiry").value;

  let hasError = false;
  if (!name) {
    setFieldError("add-medicine-name", "Medicine name is required");
    hasError = true;
  }
  if (!category) {
    setFieldError("add-medicine-category", "Category is required");
    hasError = true;
  }
  if (!stock || stock < 0) {
    setFieldError("add-medicine-stock", "Valid stock quantity is required");
    hasError = true;
  }
  if (!unit) {
    setFieldError("add-medicine-unit", "Unit is required");
    hasError = true;
  }
  if (!expiryDate) {
    setFieldError("add-medicine-expiry", "Expiry date is required");
    hasError = true;
  }
  if (hasError) return;

  try {
    showToast("Adding medicine to inventory...");
    const created = await apiRequest("/medicines", {
      method: "POST",
      body: JSON.stringify({
        name,
        category,
        stock,
        unit,
        expiryDate,
      }),
    });

    closeModal("add-medicine-modal");
    showToast(`✓ Medicine added successfully`);
    // Clear form fields
    document.getElementById("add-medicine-name").value = "";
    document.getElementById("add-medicine-category").value = "";
    document.getElementById("add-medicine-stock").value = "";
    document.getElementById("add-medicine-unit").value = "tablets";
    document.getElementById("add-medicine-expiry").value = "";
    await loadModuleData();
  } catch (error) {
    if (handleUnauthorized(error)) return;
    setFieldError("add-medicine-name", `Failed to add medicine: ${error.message}`);
    showToast(`✗ Failed to add medicine: ${error.message}`);
  }
}

async function createInvoiceFromModal() {
  const fields = ["add-invoice-patient", "add-invoice-services", "add-invoice-amount", "add-invoice-net"];
  clearValidationErrors(fields);

  const patientInput = document.getElementById("add-invoice-patient").value.trim();
  const services = document.getElementById("add-invoice-services").value.trim();
  const amount = Number(document.getElementById("add-invoice-amount").value);
  const insuranceAmount = Number(document.getElementById("add-invoice-insurance").value) || 0;
  const netAmount = Number(document.getElementById("add-invoice-net").value);

  let hasError = false;
  if (!patientInput) {
    setFieldError("add-invoice-patient", "Patient is required");
    hasError = true;
  }
  if (!services) {
    setFieldError("add-invoice-services", "Services description is required");
    hasError = true;
  }
  if (!amount || amount <= 0) {
    setFieldError("add-invoice-amount", "Valid amount is required");
    hasError = true;
  }
  if (netAmount < 0) {
    setFieldError("add-invoice-net", "Net amount cannot be negative");
    hasError = true;
  }
  if (hasError) return;

  // Find patient by code or name
  const searchStr = patientInput.split(" - ")[0].trim().toLowerCase();
  let patient = patients.find(p => p.id.toLowerCase() === searchStr);
  if (!patient) {
    patient = patients.find(p => p.name.toLowerCase().includes(searchStr));
  }
  if (!patient) {
    setFieldError("add-invoice-patient", "Patient not found");
    return;
  }

  try {
    showToast("Creating invoice...");
    const created = await apiRequest("/invoices", {
      method: "POST",
      body: JSON.stringify({
        patientId: patient.dbId,
        services,
        amount,
        insuranceAmount,
        netAmount,
        issuedAt: new Date().toISOString(),
      }),
    });

    closeModal("add-invoice-modal");
    showToast(`✓ Invoice created - ID: ${created.invoiceCode}`);
    // Clear form fields
    document.getElementById("add-invoice-patient").value = "";
    document.getElementById("add-invoice-services").value = "";
    document.getElementById("add-invoice-amount").value = "";
    document.getElementById("add-invoice-insurance").value = "0";
    document.getElementById("add-invoice-net").value = "";
    await loadModuleData();
  } catch (error) {
    if (handleUnauthorized(error)) return;
    setFieldError("add-invoice-patient", `Failed to create invoice: ${error.message}`);
    showToast(`✗ Failed to create invoice: ${error.message}`);
  }
}

async function createAppointmentFromModal() {
  const fields = ["book-appt-patient", "book-appt-date", "book-appt-time"];
  clearValidationErrors(fields);

  const patientInput = String(document.getElementById("book-appt-patient").value || "").trim();
  const doctorId = Number(document.getElementById("book-appt-doctor").value);
  const department = document.getElementById("book-appt-department").value;
  const appointmentType = document.getElementById("book-appt-type").value;
  const date = document.getElementById("book-appt-date").value;
  const time = document.getElementById("book-appt-time").value;
  const notes = document.getElementById("book-appt-notes").value.trim();

  let hasError = false;
  if (!patientInput) {
    setFieldError("book-appt-patient", "Patient is required");
    hasError = true;
  }
  if (!date) {
    setFieldError("book-appt-date", "Date is required");
    hasError = true;
  }
  if (!time) {
    setFieldError("book-appt-time", "Time is required");
    hasError = true;
  }
  if (hasError) return;

  // Find patient by ID or name
  let patient = null;
  const searchStr = patientInput.split(" - ")[0].trim().toLowerCase();
  const patientIdNumeric = Number(searchStr);
  if (!Number.isNaN(patientIdNumeric) && patientIdNumeric > 0) {
    patient = patients.find((p) => Number(p.dbId) === patientIdNumeric) || null;
  }
  if (!patient) {
    patient = patients.find((p) => p.id.toLowerCase() === searchStr || p.name.toLowerCase().includes(searchStr));
  }
  if (!patient) {
    setFieldError("book-appt-patient", "Patient not found. Please search from the list.");
    return;
  }

  const scheduledAt = `${date}T${time}:00`;
  try {
    showToast("Booking appointment...");
    await apiRequest("/appointments", {
      method: "POST",
      body: JSON.stringify({
        patientId: patient.dbId,
        doctorId,
        department,
        appointmentType,
        scheduledAt,
        status: "scheduled",
        notes,
      }),
    });

    closeModal("modal-add-appt");
    showToast("✓ Appointment booked successfully");
    // Clear form
    document.getElementById("book-appt-patient").value = "";
    document.getElementById("book-appt-date").value = "";
    document.getElementById("book-appt-notes").value = "";
    await loadModuleData();
  } catch (error) {
    if (handleUnauthorized(error)) return;
    showToast(`✗ Appointment failed: ${error.message}`);
  }
}

async function handleSearch(val) {
  clearTimeout(searchTimer);
  if (!val || val.length < 2) return;
  searchTimer = setTimeout(async () => {
    try {
      const data = await apiRequest(`/search?q=${encodeURIComponent(val)}`);
      const total = (data.patients?.length || 0) + (data.doctors?.length || 0) + (data.medicines?.length || 0);
      showToast(`Found ${total} matches for "${val}"`);
    } catch (error) {
      showToast(`Search failed: ${error.message}`);
    }
  }, 300);
}

function mapApiPatients(data) {
  return data.map((p) => ({
    dbId: p.id,
    id: p.patientCode,
    name: p.fullName,
    age: p.age,
    gender: p.gender,
    dept: p.department,
    doctor: p.doctorName || "Unassigned",
    status: p.status,
    admitted: formatDateDisplay(p.admittedOn),
    avatar: toInitials(p.fullName),
    color: colorByDepartment(p.department),
  }));
}

function mapApiDoctors(data) {
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    department: d.department,
    exp: `${d.experienceYears} yrs`,
    patients: d.activePatients,
    status: d.status,
    avatar: d.avatar || toInitials(d.name),
  }));
}

function mapApiLabTests(data) {
  return data.map((t) => ({
    id: t.testCode,
    patient: t.patientName,
    test: t.testName,
    ordered: t.orderedByDoctorName,
    priority: t.priority,
    status: t.status,
    time: formatTime(t.orderedAt),
  }));
}

function mapApiInvoices(data) {
  return data.map((b) => ({
    inv: b.invoiceCode,
    patient: b.patientName,
    services: b.services,
    amount: rupee.format(b.amount),
    ins: rupee.format(b.insuranceAmount),
    net: rupee.format(b.netAmount),
    status: b.status,
  }));
}

function mapApiMedicines(data) {
  return data.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    stock: m.stock,
    unit: m.unit,
    expiry: formatExpiry(m.expiryDate),
    status: m.status,
  }));
}

async function loadModuleData() {
  try {
    const [patientsData, doctorsData, wardsData, labData, billingData, medicineData, summaryData] = await Promise.all([
      apiRequest("/patients"),
      apiRequest("/doctors"),
      apiRequest("/wards"),
      apiRequest("/lab-tests"),
      apiRequest("/invoices"),
      apiRequest("/medicines"),
      apiRequest("/dashboard/summary"),
    ]);

    patients = mapApiPatients(patientsData);
    doctors = mapApiDoctors(doctorsData);
    labTests = mapApiLabTests(labData);
    billing = mapApiInvoices(billingData);
    medicines = mapApiMedicines(medicineData);
    wards = wardsData;

    renderPatientsTable();
    renderDoctors();
    renderWards();
    renderLabTable();
    renderBillingTable();
    renderPharmacyTable();
    populateDoctorSelects();
    populateAppointmentPatientSelect();
    updateDashboardSummary(summaryData);
    updatePageStatistics();
    renderCalendar();
    renderReports();
    renderCharts();
  } catch (error) {
    if (!handleUnauthorized(error)) {
      showToast(`Failed to load data: ${error.message}`);
      console.error("Data loading error:", error);
    }
  }
}

function renderCharts() {
  renderChart("admissions-chart", "admissions-labels", [22, 31, 18, 27, 34, 29, 24], [18, 24, 14, 22, 28, 26, 20], ["var(--accent)", "var(--blue)"], ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  setTimeout(() => {
    renderChart("revenue-chart", "revenue-labels", [38, 42, 35, 48, 52, 45, 48, 44, 50, 56, 48, 52], [], ["var(--purple)"], ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]);
    renderChart("opd-chart", "opd-labels", [280, 310, 290, 340, 360, 320, 340], [220, 260, 240, 280, 300, 270, 290], ["var(--blue)", "var(--amber)"], ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  }, 150);
}

async function restoreSession() {
  if (!authToken) return;
  try {
    currentUser = await apiRequest("/auth/me");
  } catch {
    authToken = "";
    localStorage.removeItem("medcore_token");
    currentUser = null;
  }
}

async function initApp() {
  document.querySelectorAll(".modal-overlay").forEach((m) =>
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.remove("open");
    })
  );

  // Auto-calculate net amount for invoices
  const insuranceInput = document.getElementById("add-invoice-insurance");
  const amountInput = document.getElementById("add-invoice-amount");
  const netInput = document.getElementById("add-invoice-net");

  if (insuranceInput && amountInput && netInput) {
    const calculateNet = () => {
      const amount = Number(amountInput.value) || 0;
      const insurance = Number(insuranceInput.value) || 0;
      netInput.value = Math.max(0, amount - insurance);
    };
    insuranceInput.addEventListener("input", calculateNet);
    amountInput.addEventListener("input", calculateNet);
  }

  await restoreSession();
  updateAuthUI();

  try {
    await loadModuleData();
  } catch (error) {
    showToast("Backend unavailable. Start server: cd backend && npm run dev");
    console.error(error);
  }
}

window.openModal = openModal;
window.closeModal = closeModal;
window.showView = showView;
window.setTab = setTab;
window.handleSearch = handleSearch;
window.showToast = showToast;
window.reorderMedicine = reorderMedicine;
window.toggleBedStatus = toggleBedStatus;
window.createPatientFromModal = createPatientFromModal;
window.createDoctorFromModal = createDoctorFromModal;
window.createLabTestFromModal = createLabTestFromModal;
window.createMedicineFromModal = createMedicineFromModal;
window.createInvoiceFromModal = createInvoiceFromModal;
window.createAppointmentFromModal = createAppointmentFromModal;
window.openAuthModal = openAuthModal;
window.loginFromModal = loginFromModal;
window.logout = logout;
window.viewPatientDetails = function(patientCode, patientName) {
  const patient = patients.find(p => p.id === patientCode);
  if (!patient) {
    showToast("Patient not found");
    return;
  }
  showToast(`Viewing patient record: ${patientName}`);
  console.log("Patient details:", patient);
};

initApp();
