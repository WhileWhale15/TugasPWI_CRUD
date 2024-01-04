var data;
var ActivePageNumber = 1;
var PageSize = 15;
var PageTo;
var PageFrom;
var rowCount;
var MaxId = 0;
var SuccessTime = 3000;

$(document).ready(function () {
  console.log($(window).width() + "x" + $(window).height());

  data = JSON.parse(localStorage.getItem("employeeData")) || [];

  if (data.length === 0) {
    data = [
      {
        id: 2,
        name: "Wenonah",
        profession: "Automation Specialist III",
        age: 60,
      },
      { id: 3, name: "Murdock", profession: "Structural Engineer", age: 33 },
      { id: 4, name: "Reinhold", profession: "Operator", age: 53 },
      { id: 5, name: "Enoch", profession: "Developer III", age: 39 },
    ];
  }

  getByText();
});

function saveDataToLocalStorage() {
  localStorage.setItem("employeeData", JSON.stringify(data));
}

function fncPagingClick(anchor) {
  $("#ulPagination .active").removeClass("active");
  $(anchor).parent().addClass("active");
  ActivePageNumber = parseInt($(anchor).text());
  fnPagination(ActivePageNumber);
}

function getIndexOf(el) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == el) {
      return i;
    }
  }
  return -1;
}

function Bind(myData) {
  $("#tblEmployee tbody tr").remove();
  if (myData.length > 0) {
    $("#tblEmployee tfoot").hide();
    $("#divPaging").show();

    $.each(myData, function (key, val) {
      var tr = $("<tr></tr>");
      var id;
      $.each(val, function (k, v) {
        if (k != "id") {
          $("<td>" + v + "</td>").appendTo(tr);
        } else {
          id = v;
          MaxId = Math.max(id, MaxId);
        }
      });
      $(
        '<td><a href="#editEmployeeModal" onclick="fncEdit(\'' +
          id +
          '\')" class="edit" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="" data-original-title="Edit"></i></a><a href="#deleteEmployeeModal' +
          id +
          '" class="delete" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="" data-original-title="Delete"></i></a><div id="deleteEmployeeModal' +
          id +
          '" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Delete Employee</h4><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>                     </div>                     <div class="modal-body">                                             <p>Are you sure you want to delete these Records?</p>                         <p class="text-warning"><small>This action cannot be undone.</small></p></div><div class="modal-footer"><input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel"><input type="button" class="btn btn-danger" onclick="fncDelete(\'' +
          id +
          '\')" value="Delete"> </div> </div></div> </div></td>'
      ).appendTo(tr);
      tr.appendTo("#tblEmployee tbody");
    });
    rowCount = $("#tblEmployee >tbody >tr").length;
    fnPagination(ActivePageNumber);
    var Page = Math.ceil(parseInt(rowCount) / PageSize);
    $("#bTotal").text(rowCount);
    if (Page > 0) {
      $("#ulPagination li").remove();
      for (var i = 1; i <= Page; i++) {
        var ul = $("#ulPagination");
        $(
          '<li class="page-item ' +
            (i == ActivePageNumber ? "active" : "") +
            '"><a href="javascript:void(0)" onclick="fncPagingClick(this)" class="page-link">' +
            i +
            "</a></li>"
        ).appendTo(ul);
      }
    }
  } else {
    $("#tblEmployee tfoot").show();
    $("#divPaging").hide();
  }
}

function fnPagination(num) {
  PageFrom = (num - 1) * PageSize;
  PageTo = PageFrom + PageSize;
  PageTo = PageTo > rowCount ? rowCount : PageTo;
  $("#bFrom").text(PageFrom + 1);
  $("#bTo").text(PageTo);
  $("#tblEmployee tbody tr").hide();
  $("#tblEmployee tr:gt(" + PageFrom + "):lt(" + PageSize + ")").show(100);
}

function onlyNumbers(evt) {
  var evtobj = window.event ? event : evt;
  var charCode = evtobj.charCode ? evtobj.charCode : evtobj.keyCode;
  if (
    (charCode > 47 && charCode < 58) ||
    charCode == 43 ||
    charCode == 45 ||
    charCode == 32 ||
    charCode == 8 ||
    charCode == 9 ||
    charCode == 2 ||
    charCode == 3 ||
    charCode == 14 ||
    charCode == 15 ||
    charCode == 46 ||
    charCode == 36 ||
    charCode == 35
  )
    return true;
  else return false;
}

function showMessage(msg) {
  $(".myAlert-top").show(800);
  $("#spnMsg").text(msg);
  setTimeout(function () {
    $(".myAlert-top").hide(800);
  }, SuccessTime);
}

function getByText() {
  var txt = $("#txtSearch").val();
  if (txt != null && txt != "undefined" && txt.trim() != "") {
    var search = [];
    for (var i = 0; i < data.length; i++) {
      if (
        data[i].name.toLowerCase().includes(txt.toLowerCase()) ||
        txt.toLowerCase().includes(data[i].name.toLowerCase()) ||
        data[i].profession.toLowerCase().includes(txt.toLowerCase()) ||
        txt.toLowerCase().includes(data[i].profession.toLowerCase())
      ) {
        search.unshift(data[i]);
      }
    }
    Bind(search);
  } else {
    Bind(data);
  }
  $("#txtSearch").blur();
}

function BindEnter(event) {
  if (event.which == 13 || event.keyCode == 13) {
    getByText();
  }
}

function fncUpdate(index) {
  event.preventDefault();
  var id = data[index].id;

  $("#txtEditId").val(id);
  data[index].name = $("#txtEditName").val();
  data[index].profession = $("#txtEditProfession").val();
  data[index].age = $("#txtEditAge").val();
  $("#editEmployeeModal").modal("toggle");
  $("#editEmployeeModal input:text").val("");
  showMessage("row updated successfully.");
  getByText();

  saveDataToLocalStorage();

  $.ajax({
    type: "POST",
    url: "process.php",
    data: $("#editform").serialize(),
    success: function (response) {
      var result = JSON.parse(response);
      if (result.status === "success") {
        showMessage(result.message);
        getByText();
      }
    },
    error: function () {
      showMessage("Error occurred while updating the record.");
    },
  });
}

function fncEdit(id) {
  var index = getIndexOf(id);
  if (index > -1) {
    $("#txtEditName").val(data[index].name);
    $("#txtEditProfession").val(data[index].profession);
    $("#txtEditAge").val(data[index].age);
    $("#editform").attr("onSubmit", "fncUpdate('" + index + "')");
  }
}

function fncAdd() {
  event.preventDefault();
  if ($("#txtName").val().length > 0) {
    data.unshift({
      id: MaxId + 1,
      name: $("#txtName").val(),
      profession: $("#txtProfession").val(),
      age: $("#txtAge").val(),
    });
    ActivePageNumber = 1;
    $("#addEmployeeModal").modal("toggle");
    $("#addEmployeeModal input:text").val("");
    showMessage("row added successfully.");
    getByText();

    saveDataToLocalStorage();

    $.ajax({
      type: "POST",
      url: "process.php",
      data: $("#addEmployeeModal form").serialize(),
      success: function (response) {
        var result = JSON.parse(response);
        if (result.status === "success") {
          showMessage(result.message);
          getByText();
        }
      },
      error: function () {
        showMessage("Error occurred while adding the record.");
      },
    });
  }
}

function fncDelete(val, modal) {
  event.preventDefault();
  var index = getIndexOf(val);
  if (index > -1) {
    data.splice(index, 1);
    saveDataToLocalStorage();
    $("#deleteEmployeeModal" + val).modal("hide");
    $("body").removeClass("modal-open");
    $(".modal-backdrop").remove();
    showMessage("row deleted successfully.");
    getByText();
  }

  $.ajax({
    type: "POST",
    url: "process.php",
    data: { action: "delete", txtDeleteId: val }, // Send employee ID to delete
    success: function (response) {
      var result = JSON.parse(response);
      if (result.status === "success") {
        showMessage(result.message);
        getByText();
      }
    },
    error: function () {
      showMessage("Error occurred while deleting the record.");
    },
  });
}
