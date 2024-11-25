document.addEventListener("DOMContentLoaded", () => {
  let drawerBalance = 0;

  const calculateBtn = document.getElementById("calculate-change");

  const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

  denominations.forEach((denomination) => {
    addDenominationRow(denomination);
  });

  function addDenominationRow(value = 0) {
    const tableBody = document.getElementById("denomination-row");

    if (tableBody) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="number" class="denomination-value" min="0" value="${value}" readonly /></td>
        <td><input type="number" class="denomination-quantity" min="0" /></td>
        <td class="denomination-total">₹0</td>
      `;

      row.className = "table-row";

      tableBody.appendChild(row);

      const denominationValue = row.querySelector(".denomination-value");
      const denominationQuantity = row.querySelector(".denomination-quantity");

      denominationValue.addEventListener("input", updateDenominationTotal);
      denominationQuantity.addEventListener("input", updateDenominationTotal);

      denominationValue.addEventListener("input", preventNegativeInput);
      denominationQuantity.addEventListener("input", preventNegativeInput);

      updateDrawerTotals();
    } else {
      console.error("Denomination row container not found");
    }
  }

  function updateDenominationTotal(event) {
    const row = event.target.closest("tr");
    const value =
      parseFloat(row.querySelector(".denomination-value").value) || 0;
    const quantity =
      parseFloat(row.querySelector(".denomination-quantity").value) || 0;
    const total = value * quantity;
    row.querySelector(".denomination-total").textContent = `₹${total.toFixed(
      2
    )}`;
    updateDrawerTotals();
  }

  function preventNegativeInput(event) {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
  }

  calculateBtn.addEventListener("click", () => {
    const billAmount =
      parseFloat(document.getElementById("bill-amount").value, 10) || 0;
    const customerPayment =
      parseFloat(document.getElementById("customer-payment").value, 10) || 0;

    if (billAmount > customerPayment) {
      alert("Customer payment should be greater than or equal to bill amount");
      return;
    } else if (billAmount === customerPayment) {
      document.getElementById("change-output").textContent =
        "No change required!";
    } else {
      let change = customerPayment - billAmount;
      const changeBreakdown = calculateChange(change);

      if (change > 0 && change <= drawerBalance) {
        updateDrawerAfterChange(changeBreakdown);
        document.querySelector(".change-output").textContent = `₹${change}`;
        displayChangeDetails(changeBreakdown);
      } else {
        document.querySelector(".change-output").textContent =
          "Not enough change in drawer!";
      }
    }
  });

  function calculateChange(change) {
    const changeBreakdown = {};

    const rows = Array.from(document.querySelectorAll("#denomination-row tr"));
    rows.sort((a, b) => {
      const aValue =
        parseFloat(a.querySelector(".denomination-value").value, 10) || 0;
      const bValue =
        parseFloat(b.querySelector(".denomination-value").value, 10) || 0;
      return bValue - aValue;
    });

    rows.forEach((row) => {
      const denominationInput = row.querySelector(".denomination-value");
      const quantityInput = row.querySelector(".denomination-quantity");

      const value = parseFloat(denominationInput.value, 10) || 0;
      const availableNotes = parseFloat(quantityInput.value, 10) || 0;
      const requiredNotes = Math.min(
        availableNotes,
        Math.floor(change / value)
      );

      if (requiredNotes > 0) {
        changeBreakdown[value] = requiredNotes;
        change -= requiredNotes * value;
      }
    });

    return changeBreakdown;
  }

  function updateDrawerAfterChange(changeBreakdown) {
    Object.entries(changeBreakdown).forEach(([denomination, quantity]) => {
      document.querySelectorAll("#denomination-row tr").forEach((row) => {
        const denominationInput = row.querySelector(".denomination-value");
        const quantityInput = row.querySelector(".denomination-quantity");

        if (
          parseFloat(denominationInput.value, 10) ===
          parseFloat(denomination, 10)
        ) {
          const currentQuantity = parseFloat(quantityInput.value, 10) || 0;
          quantityInput.value = currentQuantity - quantity;
        }
      });
    });
    updateDrawerTotals();
  }

  function updateDrawerTotals() {
    let newBalance = 0;

    document.querySelectorAll("#denomination-row tr").forEach((row) => {
      const denominationInput = row.querySelector(".denomination-value");
      const quantityInput = row.querySelector(".denomination-quantity");
      const totalCell = row.querySelector(".denomination-total");

      const value = parseInt(denominationInput.value, 10) || 0;
      const quantity = parseInt(quantityInput.value, 10) || 0;
      const total = value * quantity;

      totalCell.textContent = `₹${total}`;
      newBalance += total;
    });

    drawerBalance = newBalance;
    document.getElementById(
      "drawer-balance"
    ).textContent = `Total Balance: ₹${drawerBalance}`;
  }

  function displayChangeDetails(changeBreakdown) {
    const changeDetails = document.createElement("ul");
    changeDetails.className = "change-details";

    changeDetails.innerHTML = "";

    Object.entries(changeBreakdown).forEach(([denomination, count]) => {
      const li = document.createElement("li");
      li.textContent = `₹${denomination}: ${count} notes`;
      changeDetails.appendChild(li);
    });

    const changeOutputContainer = document.getElementById("change-output");
    changeOutputContainer.innerHTML = "";
    changeOutputContainer.appendChild(changeDetails);
  }
});
