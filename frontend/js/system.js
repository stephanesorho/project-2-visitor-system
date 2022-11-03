const rowSelectColor = "#F5F5F5";
const rowClearColor = "white";

let selectedRowIx;
let prevSelection;
let table;

window.onload = () => {
  document.getElementById("status").innerHTML = "Fetching data...";
  table = document.getElementById("data-table");
  loadData();
};

/*
 * Routine to get all the database rows and populate the HTML table.
 * Makes the get request using the fetch API.
 * The response from the fetch has the data.
 */

async function loadData() {
  // 1. Hard-coding the host should be avoided.
  // Because this js and the backend runs on the same domain and host,
  // you can just use await fetch("/getVisitors") instead.
  // 2. Since you're already using async await, you don't need the
  // then() chain. Promise (where the then() function comes from)
  // is invented to replace the "callback hell" (which is nested) with a then() chain.
  // async / await is an improvement on top of that.
  // You can just assign the result of the await call to a variable,
  // and operate on the variable thereafter.
  // Like:
  // let res = await fetch("/getVisitors");
  // if (res.ok) ...
  await fetch("http://localhost:3000/getVisitors")
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        const text = res.text();
        throw new Error(text);
      }
    })
    .then((docs) => {
      console.log("docs: ", docs.result);
      buildTable(docs.result);
      return docs.result.length;
    })
    .then((n) => {
      document.getElementById("status").innerHTML = "Loaded " + n + " row(s)!";
      if (n > 0) {
        selectRow();
        scrollToSelection();
      }
    })
    .catch((error) => {
      console.error("# Error:", error);
      const msg =
        "Error: " +
        error.message +
        ". " +
        "The web server or database may not have started. " +
        "See browser's console for more details.";
      document.getElementById("status").innerHTML = msg;
    });
}

function buildTable(data) {
  data.forEach((doc) => addToTable(doc));
}

function addToTable(doc) {
  selectedRowIx = table.rows.length;
  const row = table.insertRow(selectedRowIx);
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);
  const cell3 = row.insertCell(2);
  const cell4 = row.insertCell(3);
  cell1.innerHTML = doc.name;
  cell2.innerHTML = doc.age;
  cell3.innerHTML =
    "<input type='radio' name='select' onclick='selectRow(this)' checked>";
  cell3.className = "tradio";
  cell4.innerHTML = "<input type='hidden' value=" + doc._id + ">";
}

function selectRow(obj) {
  const row = obj
    ? obj.parentElement.parentElement
    : table.rows[table.rows.length - 1];
  selectedRowIx = row.rowIndex;

  if (obj) {
    document.getElementById("status").innerHTML =
      "Selected row " + selectedRowIx;
  }

  setSelection(row);
}

function setSelection(row) {
  document.getElementById("name").value = row.cells.item(0).innerHTML;
  document.getElementById("age").value = row.cells.item(1).innerHTML;
  row.style.backgroundColor = rowSelectColor;

  if (prevSelection && prevSelection !== selectedRowIx) {
    table.rows[prevSelection].style.backgroundColor = rowClearColor;
  }

  prevSelection = selectedRowIx;
}

function scrollToSelection() {
  const ele = document.getElementById("table-wrapper");
  const bucketHt = ele.clientHeight;
  const itemHt = ele.scrollHeight / table.rows.length;
  const noItemsInBucket = parseInt(bucketHt / itemHt);
  const targetBucket = (selectedRowIx + 1) / noItemsInBucket;
  const scrollPos = bucketHt * (targetBucket - 1) + bucketHt / 2;
  ele.scrollTop = Math.round(scrollPos);
}

/*
 * Routine to add a new person data to the HTML table and the database.
 * Makes the post request using the fetch API.
 * The response from the fetch has the confirmation message about the
 * newly inserted document.
 */
function addData() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;

  if (!name) {
    alert("Name is required!!");
    document.getElementById("name").focus();
    return;
  }
  if (!age) {
    alert("Age is required!!");
    document.getElementById("age").focus();
    return;
  }

  postToDB({ name: name, age: age });
}

async function postToDB(doc) {
  await fetch("http://localhost:3000/addVisitors/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doc),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.text().then((text) => {
          throw new Error(text);
        });
      }
    })
    .then((data) => {
      const id = data.insertedId;
      if (id) {
        doc._id = id;
        addToTable(doc);
        document.getElementById("status").innerHTML = JSON.stringify(data);
        table.rows[selectedRowIx].style.backgroundColor = rowSelectColor;
        if (prevSelection) {
          table.rows[prevSelection].style.backgroundColor = rowClearColor;
        }
        prevSelection = selectedRowIx;
        scrollToSelection();
      }
    })
    .catch((error) => {
      console.error("# Error:", error);
      const msg =
        "Error: " +
        error.message +
        ". " +
        "There was an error posting data to the database. " +
        "See browser's console for more details.";
      document.getElementById("status").innerHTML = msg;
    });

  window.location.replace("system.html");
}

/*
 * Routine to delete a selected row from the HTML table and the database.
 * Makes the delete request using the fetch API.
 * The response from the fetch has the confirmation message about the
 * deleted document.
 */
function deleteData() {
  if (selectedRowIx) {
    let id = table.rows[selectedRowIx].cells.item(3).firstChild.value;
    console.log("Delete id:", id);
    deleteFromDB(id);
  } else {
    alert("Select a row to delete!");
  }
}

async function deleteFromDB(id) {
  await fetch("/deleteVisitor/" + id, {
    method: "DELETE",
  })
    .then((res) => {
      if (res.ok) {
        console.log("res OK", res.json);
      } else {
        const text = res.text();
        throw new Error(text);
      }
    })
    // .then((data) => {
    //   document.getElementById("status").innerHTML = JSON.stringify(data);
    //   console.log("data deleted:", data);
    //   console.log("json data:", JSON.stringify(data));
    //   deleteFromTable(data.deletedCount);
    // })
    .catch((error) => {
      console.error("# Error:", error);
      const msg =
        "Error: " +
        error.message +
        ". " +
        "There was an error while deleting the data. " +
        "See browser's console for more details.";
      document.getElementById("status").innerHTML = msg;
    });

  window.location.replace("system.html");
}

function deleteFromTable(deletedCount) {
  if (deletedCount > 0) {
    table.deleteRow(selectedRowIx);
    initValues();
  }
}

function initValues() {
  selectedRowIx = null;
  prevSelection = null;
  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
}

/*
 * Routine to clear the selected row in the HTML table as well
 * as the input fields.
 */
function clearData() {
  if (selectedRowIx) {
    table.rows[selectedRowIx].cells.item(2).firstChild.checked = false;
    table.rows[selectedRowIx].style.backgroundColor = rowClearColor;
  }

  initValues();
  document.getElementById("status").innerHTML = "";
}

/*
 * Routine for selecting the first or the last row of the HTML table
 * (depending upon the parameter "n" - the value 1 for selecting the first
 * row, otherwise the last one).
 */
function selectTopOrBottomRow(n) {
  if (table.rows.length < 2) {
    document.getElementById("status").innerHTML = "No data in table!";
    return;
  }

  selectedRowIx = n === 1 ? 1 : table.rows.length - 1;

  const row = table.rows[selectedRowIx];
  setSelection(row);
  document.getElementById("status").innerHTML = "Selected row " + selectedRowIx;
  row.cells[2].children[0].checked = true;
  scrollToSelection();
}
