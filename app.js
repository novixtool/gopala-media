/* =====================================================
   GOPALA MEDIA - RENTAL MANAGEMENT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     STORAGE
  ========================= */

  const STORAGE = {
    customers: "gopala_media_customers",
    equipment: "gopala_media_equipment",
    rentals: "gopala_media_rentals"
  };

  let customers = loadData(STORAGE.customers);
  let equipment = loadData(STORAGE.equipment);
  let rentals = loadData(STORAGE.rentals);

  function loadData(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE.customers, JSON.stringify(customers));
    localStorage.setItem(STORAGE.equipment, JSON.stringify(equipment));
    localStorage.setItem(STORAGE.rentals, JSON.stringify(rentals));
  }

  /* =========================
     HELPERS
  ========================= */

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  function id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date + "T00:00:00");

    if (Number.isNaN(d.getTime())) return date;

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function today() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${d.getFullYear()}-${month}-${day}`;
  }

  function calculateDays(start, end) {
    if (!start || !end) return 1;

    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");

    const difference = endDate - startDate;
    const days = Math.ceil(difference / 86400000);

    return Math.max(1, days);
  }

  function customerName(customerId) {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  }

  function equipmentName(equipmentId) {
    const item = equipment.find(e => e.id === equipmentId);
    return item ? item.name : "Unknown Equipment";
  }

  function showToast(message, type = "success") {
    let toast = $("#toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";

      toast.style.position = "fixed";
      toast.style.bottom = "20px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.padding = "12px 18px";
      toast.style.borderRadius = "10px";
      toast.style.color = "white";
      toast.style.fontSize = "13px";
      toast.style.fontWeight = "600";
      toast.style.zIndex = "9999";
      toast.style.boxShadow = "0 8px 25px rgba(0,0,0,.2)";

      document.body.appendChild(toast);
    }

    toast.style.background =
      type === "error" ? "#dc2626" :
      type === "warning" ? "#d97706" :
      "#16a34a";

    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
  }

  /* =========================
     NAVIGATION
  ========================= */

  const navButtons = $$(".nav-btn");
  const pages = $$(".page");
  const topTitle = $("#topbar-title");

  const pageTitles = {
    dashboard: "Dashboard",
    customers: "Customers",
    equipment: "Equipment",
    rentals: "Rentals",
    payments: "Payments"
  };

  function openPage(pageName) {
    pages.forEach(page => {
      page.classList.toggle(
        "active",
        page.dataset.page === pageName
      );
    });

    navButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );
    });

    if (topTitle) {
      topTitle.textContent = pageTitles[pageName] || "Gopala Media";
    }

    closeSidebar();
  }

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      openPage(button.dataset.page);
    });
  });

  /* =========================
     MOBILE SIDEBAR
  ========================= */

  const sidebar = $(".sidebar");
  const overlay = $(".sidebar-overlay");
  const menuToggle = $(".menu-toggle");

  function openSidebar() {
    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("show");
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", openSidebar);
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  /* =========================
     MODALS
  ========================= */

  function openModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
      modal.classList.add("show");
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
      modal.classList.remove("show");
    }
  }

  $$(".close-modal").forEach(button => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");

      if (modal) {
        modal.classList.remove("show");
      }
    });
  });

  $$(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        modal.classList.remove("show");
      }
    });
  });

  /* =========================
     QUICK ACTION BUTTONS
  ========================= */

  $$(".open-customer-modal").forEach(button => {
    button.addEventListener("click", () => {
      resetCustomerForm();
      openModal("customer-modal");
    });
  });

  $$(".open-equipment-modal").forEach(button => {
    button.addEventListener("click", () => {
      resetEquipmentForm();
      openModal("equipment-modal");
    });
  });

  $$(".open-rental-modal").forEach(button => {
    button.addEventListener("click", () => {
      resetRentalForm();
      populateRentalDropdowns();
      openModal("rental-modal");
    });
  });

  /* =========================
     CUSTOMER
  ========================= */

  const customerForm = $("#customer-form");

  function resetCustomerForm() {
    if (customerForm) customerForm.reset();

    const idInput = $("#customer-id");

    if (idInput) {
      idInput.value = "";
    }
  }

  if (customerForm) {
    customerForm.addEventListener("submit", event => {
      event.preventDefault();

      const customer = {
        id: id(),
        name: $("#customer-name")?.value.trim(),
        phone: $("#customer-phone")?.value.trim(),
        document: $("#customer-document")?.value.trim(),
        email: $("#customer-email")?.value.trim(),
        address: $("#customer-address")?.value.trim(),
        createdAt: new Date().toISOString()
      };

      if (!customer.name || !customer.phone) {
        showToast("Name aur phone number zaroori hai.", "error");
        return;
      }

      customers.push(customer);

      saveData();
      renderAll();

      closeModal("customer-modal");
      resetCustomerForm();

      showToast("Customer successfully add ho gaya.");
    });
  }

  function renderCustomers(search = "") {
    const tbody = $("#customers-table-body");

    if (!tbody) return;

    const query = search.toLowerCase().trim();

    const filtered = customers.filter(customer => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        (customer.email || "").toLowerCase().includes(query)
      );
    });

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">👤</div>
              <p>No customers found.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(customer => {
      const customerRentals = rentals.filter(
        rental => rental.customerId === customer.id
      );

      const active = customerRentals.filter(
        rental => rental.status === "active"
      ).length;

      return `
        <tr>
          <td>
            <strong>${escapeHTML(customer.name)}</strong>
          </td>

          <td>${escapeHTML(customer.phone)}</td>

          <td>${escapeHTML(customer.email || "-")}</td>

          <td>
            <span class="badge ${
              active > 0 ? "badge-warning" : "badge-gray"
            }">
              ${active} Active
            </span>
          </td>

          <td>${customerRentals.length}</td>

          <td>
            <button
              class="btn btn-danger btn-small"
              onclick="deleteCustomer('${customer.id}')"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  window.deleteCustomer = function(customerId) {
    const hasRentals = rentals.some(
      rental => rental.customerId === customerId
    );

    if (hasRentals) {
      showToast(
        "Is customer ka rental history hai, delete nahi kar sakte.",
        "warning"
      );
      return;
    }

    if (!confirm("Kya aap is customer ko delete karna chahte ho?")) {
      return;
    }

    customers = customers.filter(
      customer => customer.id !== customerId
    );

    saveData();
    renderAll();

    showToast("Customer delete ho gaya.");
  };

  /* =========================
     EQUIPMENT
  ========================= */

  const equipmentForm = $("#equipment-form");

  function resetEquipmentForm() {
    if (equipmentForm) equipmentForm.reset();

    const idInput = $("#equipment-id");

    if (idInput) {
      idInput.value = "";
    }
  }

  if (equipmentForm) {
    equipmentForm.addEventListener("submit", event => {
      event.preventDefault();

      const quantity = Number(
        $("#equipment-quantity")?.value || 0
      );

      const item = {
        id: id(),
        name: $("#equipment-name")?.value.trim(),
        category: $("#equipment-category")?.value.trim(),
        quantity,
        available: quantity,
        rent: Number($("#equipment-rent")?.value || 0),
        serial: $("#equipment-serial")?.value.trim(),
        brand: $("#equipment-brand")?.value.trim(),
        notes: $("#equipment-notes")?.value.trim(),
        createdAt: new Date().toISOString()
      };

      if (!item.name || quantity <= 0) {
        showToast(
          "Equipment name aur valid quantity daalo.",
          "error"
        );
        return;
      }

      equipment.push(item);

      saveData();
      renderAll();

      closeModal("equipment-modal");
      resetEquipmentForm();

      showToast("Equipment successfully add ho gaya.");
    });
  }

  function renderEquipment(search = "", category = "") {
    const tbody = $("#equipment-table-body");

    if (!tbody) return;

    const query = search.toLowerCase().trim();

    const filtered = equipment.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        (item.brand || "").toLowerCase().includes(query) ||
        (item.serial || "").toLowerCase().includes(query);

      const matchesCategory =
        !category || item.category === category;

      return matchesSearch && matchesCategory;
    });

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-state-icon">📷</div>
              <p>No equipment found.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      let statusClass = "badge-success";
      let statusText = "Available";

      if (item.available === 0) {
        statusClass = "badge-danger";
        statusText = "Rented Out";
      } else if (item.available < item.quantity) {
        statusClass = "badge-warning";
        statusText = "Partially Rented";
      }

      return `
        <tr>
          <td>
            <strong>${escapeHTML(item.name)}</strong>
          </td>

          <td>${escapeHTML(item.category || "-")}</td>

          <td>${escapeHTML(item.brand || "-")}</td>

          <td>
            ${item.available} / ${item.quantity}
          </td>

          <td>${money(item.rent)}/day</td>

          <td>
            <span class="badge ${statusClass}">
              ${statusText}
            </span>
          </td>

          <td>
            <button
              class="btn btn-danger btn-small"
              onclick="deleteEquipment('${item.id}')"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  window.deleteEquipment = function(equipmentId) {
    const hasActiveRental = rentals.some(
      rental =>
        rental.equipmentId === equipmentId &&
        rental.status === "active"
    );

    if (hasActiveRental) {
      showToast(
        "Ye equipment abhi rental par hai.",
        "warning"
      );
      return;
    }

    if (!confirm("Kya aap is equipment ko delete karna chahte ho?")) {
      return;
    }

    equipment = equipment.filter(
      item => item.id !== equipmentId
    );

    saveData();
    renderAll();

    showToast("Equipment delete ho gaya.");
  };

  /* =========================
     RENTAL DROPDOWNS
  ========================= */

  function populateRentalDropdowns() {
    const customerSelect = $("#rental-customer");
    const equipmentSelect = $("#rental-equipment");

    if (customerSelect) {
      customerSelect.innerHTML = `
        <option value="">Select Customer</option>
        ${customers.map(customer => `
          <option value="${customer.id}">
            ${escapeHTML(customer.name)} - ${escapeHTML(customer.phone)}
          </option>
        `).join("")}
      `;
    }

    if (equipmentSelect) {
      const availableEquipment = equipment.filter(
        item => item.available > 0
      );

      equipmentSelect.innerHTML = `
        <option value="">Select Equipment</option>
        ${availableEquipment.map(item => `
          <option
            value="${item.id}"
            data-rent="${item.rent}"
            data-available="${item.available}"
          >
            ${escapeHTML(item.name)} - ${item.available} available
          </option>
        `).join("")}
      `;
    }
  }

  /* =========================
     RENTAL FORM
  ========================= */

  const rentalForm = $("#rental-form");

  function resetRentalForm() {
    if (rentalForm) {
      rentalForm.reset();
    }

    const issueDate = $("#rental-issue-date");
    const returnDate = $("#rental-return-date");

    if (issueDate) issueDate.value = today();

    if (returnDate) {
      const d = new Date();
      d.setDate(d.getDate() + 1);

      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      returnDate.value =
        `${d.getFullYear()}-${month}-${day}`;
    }

    updateRentalSummary();
  }

  function updateRentalSummary() {
    const equipmentSelect = $("#rental-equipment");
    const quantityInput = $("#rental-quantity");
    const rentInput = $("#rental-rent-day");
    const issueInput = $("#rental-issue-date");
    const returnInput = $("#rental-return-date");
    const paidInput = $("#rental-paid");

    if (!equipmentSelect) return;

    const selected =
      equipmentSelect.options[equipmentSelect.selectedIndex];

    const selectedEquipmentId = equipmentSelect.value;

    const item = equipment.find(
      equipmentItem => equipmentItem.id === selectedEquipmentId
    );

    const quantity = Math.max(
      1,
      Number(quantityInput?.value || 1)
    );

    let rentPerDay = Number(
      rentInput?.value || 0
    );

    if (item && !rentInput?.dataset.manual) {
      rentPerDay = Number(item.rent || 0);

      if (rentInput) {
        rentInput.value = rentPerDay;
      }
    }

    if (
      selected &&
      selected.dataset.rent &&
      !rentInput?.dataset.manual
    ) {
      rentPerDay = Number(selected.dataset.rent);

      if (rentInput) {
        rentInput.value = rentPerDay;
      }
    }

    const days = calculateDays(
      issueInput?.value,
      returnInput?.value
    );

    const total = rentPerDay * quantity * days;
    const paid = Number(paidInput?.value || 0);
    const balance = Math.max(0, total - paid);

    const daysElement = $("#summary-days");
    const rentElement = $("#summary-rent");
    const totalElement = $("#summary-total");
    const paidElement = $("#summary-paid");
    const balanceElement = $("#summary-balance");

    if (daysElement) daysElement.textContent = days;
    if (rentElement) rentElement.textContent = money(rentPerDay);
    if (totalElement) totalElement.textContent = money(total);
    if (paidElement) paidElement.textContent = money(paid);
    if (balanceElement) balanceElement.textContent = money(balance);
  }

  [
    "#rental-equipment",
    "#rental-quantity",
    "#rental-rent-day",
    "#rental-issue-date",
    "#rental-return-date",
    "#rental-paid"
  ].forEach(selector => {
    const element = $(selector);

    if (element) {
      element.addEventListener("input", updateRentalSummary);
      element.addEventListener("change", updateRentalSummary);
    }
  });

  const rentInput = $("#rental-rent-day");

  if (rentInput) {
    rentInput.addEventListener("input", () => {
      rentInput.dataset.manual = "true";
    });
  }

  if (rentalForm) {
    rentalForm.addEventListener("submit", event => {
      event.preventDefault();

      const customerId = $("#rental-customer")?.value;
      const equipmentId = $("#rental-equipment")?.value;

      const quantity = Number(
        $("#rental-quantity")?.value || 0
      );

      const rentPerDay = Number(
        $("#rental-rent-day")?.value || 0
      );

      const issueDate =
        $("#rental-issue-date")?.value;

      const returnDate =
        $("#rental-return-date")?.value;

      const paid = Number(
        $("#rental-paid")?.value || 0
      );

      const notes =
        $("#rental-notes")?.value.trim() || "";

      if (!customerId || !equipmentId) {
        showToast(
          "Customer aur equipment select karo.",
          "error"
        );
        return;
      }

      if (quantity <= 0) {
        showToast(
          "Quantity valid honi chahiye.",
          "error"
        );
        return;
      }

      const item = equipment.find(
        equipmentItem => equipmentItem.id === equipmentId
      );

      if (!item) {
        showToast("Equipment nahi mila.", "error");
        return;
      }

      if (quantity > item.available) {
        showToast(
          `Sirf ${item.available} item available hain.`,
          "error"
        );
        return;
      }

      if (!issueDate || !returnDate) {
        showToast(
          "Issue aur return date select karo.",
          "error"
        );
        return;
      }

      if (new Date(returnDate) < new Date(issueDate)) {
        showToast(
          "Return date issue date se pehle nahi ho sakti.",
          "error"
        );
        return;
      }

      const days = calculateDays(
        issueDate,
        returnDate
      );

      const total = rentPerDay * quantity * days;

      if (paid > total) {
        showToast(
          "Paid amount total rent se zyada nahi ho sakta.",
          "error"
        );
        return;
     
