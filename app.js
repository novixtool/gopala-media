document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     STORAGE
  ========================= */

  const CUSTOMER_KEY = "gopala_media_customers";
  const EQUIPMENT_KEY = "gopala_media_equipment";
  const RENTAL_KEY = "gopala_media_rentals";

  let customers = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "[]");
  let equipment = JSON.parse(localStorage.getItem(EQUIPMENT_KEY) || "[]");
  let rentals = JSON.parse(localStorage.getItem(RENTAL_KEY) || "[]");


  /* =========================
     BASIC HELPERS
  ========================= */

  function $(id) {
    return document.getElementById(id);
  }

  function makeId() {
    return Date.now().toString() + Math.random().toString(36).slice(2);
  }

  function saveData() {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers));
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment));
    localStorage.setItem(RENTAL_KEY, JSON.stringify(rentals));
  }

  function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function today() {
    const d = new Date();

    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date + "T00:00:00");

    if (isNaN(d.getTime())) return date;

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function calculateDays(start, end) {
    if (!start || !end) return 1;

    const a = new Date(start + "T00:00:00");
    const b = new Date(end + "T00:00:00");

    const diff = Math.ceil((b - a) / 86400000);

    return Math.max(1, diff);
  }

  function customerName(id) {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : "Unknown";
  }

  function equipmentName(id) {
    const item = equipment.find(e => e.id === id);
    return item ? item.name : "Unknown";
  }


  /* =========================
     TOAST
  ========================= */

  function toast(message, type = "success") {

    let box = $("gopalaToast");

    if (!box) {
      box = document.createElement("div");
      box.id = "gopalaToast";

      box.style.position = "fixed";
      box.style.left = "50%";
      box.style.bottom = "25px";
      box.style.transform = "translateX(-50%)";
      box.style.padding = "13px 18px";
      box.style.borderRadius = "10px";
      box.style.color = "#fff";
      box.style.fontWeight = "600";
      box.style.fontSize = "14px";
      box.style.zIndex = "99999";
      box.style.boxShadow = "0 8px 30px rgba(0,0,0,.25)";

      document.body.appendChild(box);
    }

    box.style.background =
      type === "error" ? "#dc2626" :
      type === "warning" ? "#d97706" :
      "#16a34a";

    box.textContent = message;
    box.style.display = "block";

    clearTimeout(window.gopalaToastTimer);

    window.gopalaToastTimer = setTimeout(function () {
      box.style.display = "none";
    }, 2500);
  }


  /* =========================
     NAVIGATION
  ========================= */

  const navButtons = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");

  const pageInfo = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Gopala Media overview"
    },
    customers: {
      title: "Customers",
      subtitle: "Manage all your rental customers."
    },
    equipment: {
      title: "Equipment",
      subtitle: "Manage cameras, lenses, microphones and accessories."
    },
    rentals: {
      title: "Rentals",
      subtitle: "Track issued and returned equipment."
    },
    payments: {
      title: "Payments",
      subtitle: "Track paid and pending rental amounts."
    }
  };

  function showPage(pageName) {

    pages.forEach(function (page) {
      page.classList.toggle(
        "active",
        page.id === pageName
      );
    });

    navButtons.forEach(function (button) {
      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );
    });

    const info = pageInfo[pageName];

    if (info) {
      if ($("pageTitle")) $("pageTitle").textContent = info.title;
      if ($("pageSubtitle")) $("pageSubtitle").textContent = info.subtitle;
    }

    if ($("sidebar")) {
      $("sidebar").classList.remove("open");
    }
  }

  navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      showPage(button.dataset.page);
    });
  });

  /* View All button */
  document.querySelectorAll("[data-page]").forEach(function (button) {

    if (!button.classList.contains("nav-btn")) {

      button.addEventListener("click", function () {
        const page = button.dataset.page;

        if (page) {
          showPage(page);
        }
      });

    }

  });


  /* =========================
     MOBILE MENU
  ========================= */

  if ($("menuBtn")) {

    $("menuBtn").addEventListener("click", function () {

      if ($("sidebar")) {
        $("sidebar").classList.toggle("open");
      }

    });

  }


  /* =========================
     MODALS
  ========================= */

  function openModal(id) {

    const modal = $(id);

    if (modal) {
      modal.classList.add("show");
      modal.style.display = "flex";
    }

  }

  function closeModal(id) {

    const modal = $(id);

    if (modal) {
      modal.classList.remove("show");
      modal.style.display = "none";
    }

  }


  document.querySelectorAll("[data-close]").forEach(function (button) {

    button.addEventListener("click", function () {
      closeModal(button.dataset.close);
    });

  });


  document.querySelectorAll(".modal").forEach(function (modal) {

    modal.addEventListener("click", function (event) {

      if (event.target === modal) {
        closeModal(modal.id);
      }

    });

  });


  /* =========================
     OPEN CUSTOMER MODAL
  ========================= */

  function openCustomerModal() {

    if ($("customerForm")) {
      $("customerForm").reset();
    }

    openModal("customerModal");
  }


  if ($("quickCustomer")) {
    $("quickCustomer").addEventListener(
      "click",
      openCustomerModal
    );
  }

  if ($("addCustomerBtn")) {
    $("addCustomerBtn").addEventListener(
      "click",
      openCustomerModal
    );
  }


  /* =========================
     ADD CUSTOMER
  ========================= */

  if ($("customerForm")) {

    $("customerForm").addEventListener("submit", function (event) {

      event.preventDefault();

      const name = $("customerName").value.trim();
      const phone = $("customerPhone").value.trim();

      if (!name || !phone) {
        toast("Name aur phone number zaroori hai.", "error");
        return;
      }

      const customer = {
        id: makeId(),
        name: name,
        phone: phone,
        document: $("customerDocument").value.trim(),
        email: $("customerEmail").value.trim(),
        address: $("customerAddress").value.trim(),
        createdAt: new Date().toISOString()
      };

      customers.push(customer);

      saveData();
      renderEverything();

      closeModal("customerModal");

      toast("Customer successfully add ho gaya.");
    });

  }


  /* =========================
     CUSTOMER TABLE
  ========================= */

  function renderCustomers() {

    const table = $("customerTable");

    if (!table) return;

    const search =
      ($("customerSearch")?.value || "")
        .toLowerCase()
        .trim();

    const list = customers.filter(function (customer) {

      return (
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        (customer.document || "")
          .toLowerCase()
          .includes(search)
      );

    });

    if (!list.length) {

      table.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:30px;">
            No customers found.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML = list.map(function (customer) {

      const customerRentals =
        rentals.filter(r => r.customerId === customer.id);

      const balance =
        customerRentals.reduce(
          (sum, r) => sum + Number(r.balance || 0),
          0
        );

      return `
        <tr>

          <td>
            <strong>${escapeHTML(customer.name)}</strong>
          </td>

          <td>${escapeHTML(customer.phone)}</td>

          <td>${escapeHTML(customer.document || "-")}</td>

          <td>${customerRentals.length}</td>

          <td>${money(balance)}</td>

          <td>
            <button
              class="secondary-btn"
              onclick="deleteCustomer('${customer.id}')"
            >
              Delete
            </button>
          </td>

        </tr>
      `;

    }).join("");

  }


  window.deleteCustomer = function (id) {

    const hasRental =
      rentals.some(r => r.customerId === id);

    if (hasRental) {

      toast(
        "Is customer ki rental history hai, delete nahi kar sakte.",
        "warning"
      );

      return;
    }

    if (!confirm("Customer delete karna hai?")) {
      return;
    }

    customers =
      customers.filter(c => c.id !== id);

    saveData();
    renderEverything();

    toast("Customer delete ho gaya.");
  };


  /* =========================
     CUSTOMER SEARCH
  ========================= */

  if ($("customerSearch")) {

    $("customerSearch").addEventListener(
      "input",
      renderCustomers
    );

  }


  /* =========================
     EQUIPMENT MODAL
  ========================= */

  function openEquipmentModal() {

    if ($("equipmentForm")) {
      $("equipmentForm").reset();
    }

    if ($("equipmentQuantity")) {
      $("equipmentQuantity").value = 1;
    }

    openModal("equipmentModal");
  }


  if ($("quickEquipment")) {

    $("quickEquipment").addEventListener(
      "click",
      openEquipmentModal
    );

  }

  if ($("addEquipmentBtn")) {

    $("addEquipmentBtn").addEventListener(
      "click",
      openEquipmentModal
    );

  }


  /* =========================
     ADD EQUIPMENT
  ========================= */

  if ($("equipmentForm")) {

    $("equipmentForm").addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const name =
          $("equipmentName").value.trim();

        const category =
          $("equipmentCategory").value;

        const quantity =
          Number($("equipmentQuantity").value);

        const rent =
          Number($("equipmentRent").value);

        if (!name || quantity <= 0) {

          toast(
            "Equipment name aur quantity sahi daalo.",
            "error"
          );

          return;
        }

        const item = {

          id: makeId(),

          name: name,

          category: category,

          quantity: quantity,

          available: quantity,

          rent: rent,

          serial:
            $("equipmentSerial").value.trim(),

          brand:
            $("equipmentBrand").value.trim(),

          notes:
            $("equipmentNotes").value.trim(),

          createdAt:
            new Date().toISOString()

        };

        equipment.push(item);

        saveData();
        renderEverything();

        closeModal("equipmentModal");

        toast("Equipment successfully add ho gaya.");

      }
    );

  }


  /* =========================
     EQUIPMENT TABLE
  ========================= */

  function renderEquipment() {

    const table = $("equipmentTable");

    if (!table) return;

    const search =
      ($("equipmentSearch")?.value || "")
        .toLowerCase()
        .trim();

    const filter =
      $("equipmentFilter")?.value || "all";

    const list = equipment.filter(function (item) {

      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        (item.brand || "")
          .toLowerCase()
          .includes(search) ||
        (item.serial || "")
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        filter === "all" ||
        item.category === filter;

      return matchesSearch && matchesCategory;

    });

    if (!list.length) {

      table.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:30px;">
            No equipment found.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML = list.map(function (item) {

      let status = "Available";

      if (item.available === 0) {
        status = "Rented Out";
      } else if (item.available < item.quantity) {
        status = "Partially Rented";
      }

      return `
        <tr>

          <td>
            <strong>${escapeHTML(item.name)}</strong>
          </td>

          <td>${escapeHTML(item.category)}</td>

          <td>${item.quantity}</td>

          <td>${item.available}</td>

          <td>${money(item.rent)}</td>

          <td>${status}</td>

          <td>
            <button
              class="secondary-btn"
              onclick="deleteEquipment('${item.id}')"
            >
              Delete
            </button>
          </td>

        </tr>
      `;

    }).join("");

  }


  window.deleteEquipment = function (id) {

    const activeRental =
      rentals.some(function (r) {

        return (
          r.equipmentId === id &&
          r.status === "active"
        );

      });

    if (activeRental) {

      toast(
        "Ye equipment abhi rental par hai.",
        "warning"
      );

      return;
    }

    if (!confirm("Equipment delete karna hai?")) {
      return;
    }

    equipment =
      equipment.filter(e => e.id !== id);

    saveData();
    renderEverything();

    toast("Equipment delete ho gaya.");
  };


  /* =========================
     EQUIPMENT SEARCH
  ========================= */

  if ($("equipmentSearch")) {

    $("equipmentSearch").addEventListener(
      "input",
      renderEquipment
    );

  }

  if ($("equipmentFilter")) {

    $("equipmentFilter").addEventListener(
      "change",
      renderEquipment
    );

  }


  /* =========================
     RENTAL MODAL
  ========================= */

  function setRentalDates() {

    if ($("rentalIssueDate")) {
      $("rentalIssueDate").value = today();
    }

    if ($("rentalReturnDate")) {

      const d = new Date();

      d.setDate(d.getDate() + 1);

      $("rentalReturnDate").value =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");

    }

  }


  function populateRentalCustomers() {

    const select = $("rentalCustomer");

    if (!select) return;

    select.innerHTML =
      `<option value="">Select Customer</option>` +
      customers.map(function (customer) {

        return `
          <option value="${customer.id}">
            ${escapeHTML(customer.name)}
            - ${escapeHTML(customer.phone)}
          </option>
        `;

      }).join("");

  }


  function populateRentalEquipment() {

    const select = $("rentalEquipment");

    if (!select) return;

    const available =
      equipment.filter(e => e.available > 0);

    select.innerHTML =
      `<option value="">Select Equipment</option>` +
      available.map(function (item) {

        return `
          <option
            value="${item.id}"
            data-rate="${item.rent}"
            data-available="${item.available}"
          >
            ${escapeHTML(item.name)}
            - ${item.available} available
          </option>
        `;

      }).join("");

  }


  function openRentalModal() {

    if ($("rentalForm")) {
      $("rentalForm").reset();
    }

    populateRentalCustomers();
    populateRentalEquipment();

    setRentalDates();

    if ($("rentalQuantity")) {
      $("rentalQuantity").value = 1;
    }

    if ($("rentalPaid")) {
      $("rentalPaid").value = 0;
    }

    updateRentalCalculation();

    openModal("rentalModal");
  }


  if ($("quickRental")) {

    $("quickRental").addEventListener(
      "click",
      openRentalModal
    );

  }

  if ($("dashboardRentalBtn")) {

    $("dashboardRentalBtn").addEventListener(
      "click",
      openRentalModal
    );

  }

  if ($("addRentalBtn")) {

    $("addRentalBtn").addEventListener(
      "click",
      openRentalModal
    );

  }


  /* =========================
     RENTAL CALCULATION
  ========================= */

  function updateRentalCalculation() {

    const equipmentId =
      $("rentalEquipment")?.value;

    const item =
      equipment.find(e => e.id === equipmentId);

    let rate = item ? Number(item.rent) : 0;

    if ($("rentalRate")) {
      $("rentalRate").value = rate;
    }

    const quantity =
      Number($("rentalQuantity")?.value || 1);

    const issue =
      $("rentalIssueDate")?.value;

    const returnDate =
      $("rentalReturnDate")?.value;

    const paid =
      Number($("rentalPaid")?.value || 0);

    const days =
      calculateDays(issue, returnDate);

    const total =
      rate * quantity * days;

    const balance =
      Math.max(0, total - paid);

    if ($("rentalTotal")) {
      $("rentalTotal").value = total;
    }

    if ($("rentalSummaryTotal")) {
      $("rentalSummaryTotal").textContent =
        money(total);
    }

    if ($("rentalSummaryPaid")) {
      $("rentalSummaryPaid").textContent =
        money(paid);
    }

    if ($("rentalSummaryBalance")) {
      $("rentalSummaryBalance").textContent =
        money(balance);
    }

  }


  [
    "rentalEquipment",
    "rentalQuantity",
    "rentalIssueDate",
    "rentalReturnDate",
    "rentalPaid"
  ].forEach(function (id) {

    if ($(id)) {

      $(id).addEventListener(
        "input",
        updateRentalCalculation
      );

      $(id).addEventListener(
        "change",
        updateRentalCalculation
      );

    }

  });


  /* =========================
     CREATE RENTAL
  ========================= */

  if ($("rentalForm")) {

    $("rentalForm").addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const customerId =
          $("rentalCustomer").value;

        const equipmentId =
          $("rentalEquipment").value;

        const quantity =
          Number($("rentalQuantity").value);

        const issueDate =
          $("rentalIssueDate").value;

        const returnDate =
          $("rentalReturnDate").value;

        const paid =
          Number($("rentalPaid").value || 0);

        const item =
          equipment.find(e => e.id === equipmentId);

        if (!customerId || !equipmentId) {

          toast(
            "Customer aur equipment select karo.",
            "error"
          );

          return;
        }

        if (!item) {

          toast(
            "Equipment nahi mila.",
            "error"
          );

          return;
        }

        if (quantity <= 0) {

          toast(
            "Quantity sahi daalo.",
            "error"
          );

          return;
        }

        if (quantity > item.available) {

          toast(
            "Itne equipment available nahi hain.",
            "error"
          );

          return;
        }

        if (
          new Date(returnDate) <
          new Date(issueDate)
        ) {

          toast(
            "Return date galat hai.",
            "error"
          );

          return;
        }

        const days =
          calculateDays(
            issueDate,
            returnDate
          );

        const rate =
          Number(item.rent || 0);

        const total =
          rate * quantity * days;

        if (paid > total) {

          toast(
            "Paid amount total se zyada nahi ho sakta.",
            "error"
          );

          return;
        }

        const rental = {

          id: makeId(),

          customerId: customerId,

          equipmentId: equipmentId,

          quantity: quantity,

          rate: rate,

          days: days,

          issueDate: issueDate,

          returnDate: returnDate,

          paid: paid,

          total: total,

          balance: total - paid,

          notes:
            $("rentalNotes").value.trim(),

          status: "active",

          createdAt:
            new Date().toISOString(),

          returnedAt: null

        };

        rentals.push(rental);

        item.available -= quantity;

        saveData();
        renderEverything();

        closeModal("rentalModal");

        toast("Rental successfully create ho gaya.");

      }
    );

  }


  /* =========================
     RENTAL TABLE
  ========================= */

  function renderRentals() {

    const table = $("rentalTable");

    if (!table) return;

    const search =
      ($("rentalSearch")?.value || "")
        .toLowerCase()
        .trim();

    const status =
      $("rentalStatusFilter")?.value || "all";

    const list = rentals
      .slice()
      .reverse()
      .filter(function (rental) {

        const customer =
          customerName(rental.customerId)
            .toLowerCase();

        const item =
          equipmentName(rental.equipmentId)
            .toLowerCase();

        const matchesSearch =
          customer.includes(search) ||
          item.includes(search);

        const matchesStatus =
          status === "all" ||
          rental.status === status;

        return matchesSearch && matchesStatus;

      });

    if (!list.length) {

      table.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;padding:30px;">
            No rentals found.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML = list.map(function (rental) {

      const statusHTML =
        rental.status === "active"
          ? `<span class="status active">Active</span>`
          : `<span class="status returned">Returned</span>`;

      const actionHTML =
        rental.status === "active"
          ? `
            <button
              class="primary-btn"
              onclick="returnRental('${rental.id}')"
            >
              Return
            </button>
          `
          : "Completed";

      return `
        <tr>

          <td>
            ${escapeHTML(customerName(rental.customerId))}
          </td>

          <td>
            ${escapeHTML(equipmentName(rental.equipmentId))}
          </td>

          <td>${rental.quantity}</td>

          <td>${formatDate(rental.issueDate)}</td>

          <td>${formatDate(rental.returnDate)}</td>

          <td>${money(rental.total)}</td>

          <td>${money(rental.paid)}</td>

          <td>${money(rental.balance)}</td>

          <td>${statusHTML}</td>

          <td>${actionHTML}</td>

        </tr>
      `;

    }).join("");

  }


  /* =========================
     RETURN RENTAL
  ========================= */

  window.returnRental = function (rentalId) {

    const rental =
      rentals.find(r => r.id === rentalId);

    if (!rental) return;

    if (rental.status !== "active") {
      return;
    }

    const item =
      equipment.find(
        e => e.id === rental.equipmentId
      );

    if (item) {

      item.available += rental.quantity;

      if (item.available > item.quantity) {
        item.available = item.quantity;
      }

    }

    rental.status = "returned";
    rental.returnedAt = new Date().toISOString();

    saveData();
    renderEverything();

    toast("Equipment return ho gaya.");

  };


  /* =========================
     RENTAL SEARCH
  ========================= */

  if ($("rentalSearch")) {

    $("rentalSearch").addEventListener(
      "input",
      renderRentals
    );

  }

  if ($("rentalStatusFilter")) {

    $("rentalStatusFilter").addEventListener(
      "change",
      renderRentals
    );

  }


  /* =========================
     PAYMENT TABLE
  ========================= */

  function renderPayments() {

    const table = $("paymentTable");

    if (!table) return;

    if (!rentals.length) {

      table.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:30px;">
            No payment records found.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML =
      rentals
        .slice()
        .reverse()
        .map(function (rental) {

          return `
            <tr>

              <td>
                ${escapeHTML(
                  customerName(rental.customerId)
                )}
              </td>

              <td>
                ${escapeHTML(
                  equipmentName(rental.equipmentId)
                )}
              </td>

              <td>${money(rental.total)}</td>

              <td>${money(rental.paid)}</td>

              <td>${money(rental.balance)}</td>

              <td>
                ${rental.status === "active"
                  ? "Active"
                  : "Returned"}
              </td>

            </tr>
          `;

        }).join("");

  }


  /* =========================
     DASHBOARD
  ========================= */

  function renderDashboard() {

    const total =
      equipment.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      );

    const available =
      equipment.reduce(
        (sum, item) =>
          sum + Number(item.available || 0),
        0
      );

    const rented =
      total - available;

    const pending =
      rentals.reduce(
        (sum, rental) =>
          sum + Number(rental.balance || 0),
        0
      );

    const activeRentals =
      rentals.filter(
        rental => rental.status === "active"
      ).length;

    if ($("statEquipment"))
      $("statEquipment").textContent = total;

    if ($("statAvailable"))
      $("statAvailable").textContent = available;

    if ($("statRented"))
      $("statRented").textContent = rented;

    if ($("statCustomers"))
      $("statCustomers").textContent =
        customers.length;

    if ($("statPending"))
      $("statPending").textContent =
        money(pending);

    if ($("statRentals"))
      $("statRentals").textContent =
        activeRentals;

    renderDashboardRentals();

  }


  function renderDashboardRentals() {

    const table =
      $("dashboardRentalTable");

    if (!table) return;

    const active =
      rentals
        .filter(r => r.status === "active")
        .slice()
        .reverse();

    if (!active.length) {

      table.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:25px;">
            No active rentals.
          </td>
        </tr>
      `;

      return;
    }

    table.innerHTML =
      active.map(function (rental) {

        return `
          <tr>

            <td>
              ${escapeHTML(
                customerName(rental.customerId)
              )}
            </td>

            <td>
              ${escapeHTML(
                equipmentName(rental.equipmentId)
              )}
            </td>

            <td>
              ${formatDate(rental.returnDate)}
            </td>

            <td>
              ${money(rental.total)}
            </td>

            <td>
              Active
            </td>

          </tr>
        `;

      }).join("");

  }


  /* =========================
     PAYMENT TOTALS
  ========================= */

  function renderPaymentTotals() {

    const collected =
      rentals.reduce(
        (sum, rental) =>
          sum + Number(rental.paid || 0),
        0
      );

    const pending =
      rentals.reduce(
        (sum, rental) =>
          sum + Number(rental.balance || 0),
        0
      );

    if ($("paymentCollected")) {
      $("paymentCollected").textContent =
        money(collected);
    }

    if ($("paymentPending")) {
      $("paymentPending").textContent =
        money(pending);
    }

  }


  /* =========================
     RENDER EVERYTHING
  ========================= */

  function renderEverything() {

    renderDashboard();

    renderCustomers();

    renderEquipment();

    renderRentals();

    renderPayments();

    renderPaymentTotals();

  }


  /* =========================
     ESC KEY
  ========================= */

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Escape") {

        document
          .querySelectorAll(".modal")
          .forEach(function (modal) {

            modal.classList.remove("show");
            modal.style.display = "none";

          });

        if ($("sidebar")) {
          $("sidebar").classList.remove("open");
        }

      }

    }
  );


  /* =========================
     START APP
  ========================= */

  renderEverything();

  console.log(
    "Gopala Media Rental Management loaded successfully."
  );

});
