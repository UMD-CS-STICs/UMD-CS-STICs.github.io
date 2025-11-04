/*CLASSES has all the catalog information for different semesters
The class information used to be all in this file, but I moved 
them to different files, so each semester has its own file within
the catalog-data folder - Brennen*/

import { CLASSES, SEMESTERS, CURRENT_SEMESTER } from "./catalog-data/classes.js";

// Catalog broken in IE bc ES6 is used in this file.

//this code below means that "When the page finishes loading, call all of these functions"
$("document").ready(function () {
  initializeSemestersDropdown();
  initializeFilterTags();
  update(CURRENT_SEMESTER);
  initializeHashFragment();
});

// Written in this way so jQuery can see dynamically added elements
$(document).on("click", "a.semester-option", function (e) {
  const newSemester = $(this).text();
  $("#selectedSemester").text(newSemester);
  initializeFilterTags();
  update(newSemester);
});

$("#catalog-search").on("input", function (e) {
  update($("#selectedSemester").text());
});

// Written in this way so jQuery can see dynamically added elements
$(document).on("click", "a.tag-option", function (e) {
  if ($(this).attr("id") === "view-all") {
    $(".tag-option").each(function () {
      $(this).removeClass("tag-option-selected");
    });
  } else {
    $("#view-all").removeClass("tag-option-selected");
  }
  $(this).toggleClass("tag-option-selected");
  update($("#selectedSemester").text());
});

//Beginning to define functions, but not necessarily calling them
function initializeFilterTags() {
  $("#filter-tags").html("");
  const semester = $("#selectedSemester").text();
  const classes = CLASSES.classes[semester].classes;
  const depts = new Set();
  for (const course of classes) {
    depts.add(course.department);
  }

  const sortedDepts = [];
  for (const dept of depts) {
    sortedDepts.push(dept);
  }
  sortedDepts.sort();

  for (const dept of sortedDepts) {
    const deptName = dept.toLowerCase();
    $("#filter-tags").append(`<a id="${deptName}-tag" class="button tag-option">${deptName}</a>`);
  }

  $("#view-all").addClass("tag-option-selected");
}

function initializeSemestersDropdown() {
  for (let semester of SEMESTERS) {
    $("#semesters").prepend(`<a href="#" class="semester-option">${semester}</a>`);
  }
  $("#selectedSemester").text(CURRENT_SEMESTER);
}

function initializeHashFragment() {
  if (window.location.hash) {
    const hash = window.location.hash;
    if ($(`${hash}-tag`).length) {
      $(`${hash}-tag`).toggleClass("tag-option-selected"); // select it
      $("#view-all").removeClass("tag-option-selected"); // deselect view all
      update($("#selectedSemester").text());
    }
  }
}

function getSelectedTags() {
  const selectedTags = [];
  $(".tag-option").each(function () {
    if ($(this).hasClass("tag-option-selected")) {
      selectedTags.push($(this).text());
    }
  });
  return selectedTags;
}

function update(semester) {
  const input = $("#catalog-search").val().toUpperCase();
  const classes = CLASSES.classes[semester].classes;

  // Filter by search first
  let filteredBySearch = [];
  if (input !== "") {
    for (const i in classes) {
      const course = classes[i];
      const toTestStr = course.department + course.number;
      if (toTestStr.indexOf(input) == 0) {
        filteredBySearch.push(course);
      }
    }
  } else {
    filteredBySearch = classes;
  }

  // Next filter by selected tags
  let filteredByTags = [];
  if ($("#view-all").hasClass("tag-option-selected")) {
    filteredByTags = filteredBySearch;
  } else {
    for (const i in filteredBySearch) {
      const course = filteredBySearch[i];
      const toTestStr = course.department + course.number;
      for (let tag of getSelectedTags()) {
        tag = tag.toUpperCase();
        if (toTestStr.indexOf(tag) == 0) {
          filteredByTags.push(course);
          break;
        }
      }
    }
  }

  // Organize the classes to output
  let classDivs = [];
  for (const course of filteredByTags) {
    classDivs.push(createDiv(course));
  }
  classDivs.sort();

  let classesToDisplay = "";
  classesToDisplay = classDivs.join("");

  if (classesToDisplay === "") classesToDisplay = "No classes were found.";

  // if (semester === CURRENT_SEMESTER)
  //   classesToDisplay += '<div class="classes-footer"><h3>More classes coming soon.</h3></div>';
  $("#displayedCourses").html(classesToDisplay);
}

function getFacilitatorsText(fs) {
  var text = "";
  text += `Facilitator${fs.length == 1 ? "" : "s"}: `;

  for (let idx in fs) {
    if (fs[idx].email) {
      text += `<a href="mailto:${fs[idx].email}">${fs[idx].name}</a>`;
    } else {
      text += fs[idx].name;
    }
    if (idx != fs.length - 1) text += ", ";
  }

  return text;
}

function getAdvisorText(a) {
  return `Advisor: ${a}`;
}

function createDiv(cl) {
  const className = cl.department + cl.number;
  const selectedSemester = $("#selectedSemester").text();
  const year = selectedSemester.substr(selectedSemester.length - 4);
  const startMonth = selectedSemester.substr(0, selectedSemester.length - 5) == "spring" ? "1" : "8";
  const testudoUrl = `
    https://app.testudo.umd.edu/soc/search?courseId=${className}&sectionId=&termId=${year}0${startMonth}&_openSectionsOnly=on&creditCompare=&credits=&courseLevelFilter=ALL&instructor=&_facetoface=on&_blended=on&_online=on&courseStartCompare=&courseStartHour=&courseStartMin=&courseStartAM=&courseEndHour=&courseEndMin=&courseEndAM=&teachingCenter=ALL&_classDay1=on&_classDay2=on&_classDay3=on&_classDay4=on&_classDay5=on
  `;

  return `<div class="row class"> \
          <div class="col-4"> \
            <h2><a class="class-num" target="_blank" href="${testudoUrl}">${className}</a></h2> \
            <div class="heading"> \
              <p>${cl.title}</p> \
              <p>Credits: ${cl.credits}</p> \
            </div> \
            <p>${getFacilitatorsText(cl.facilitators)}</p> \
            <p>${getAdvisorText(cl.advisor)}</p> \
            ${cl.website === undefined || cl.website === null ? "" : `<a target="_blank" href="${cl.website}">Website</a><br>`} \
            ${cl.syllabus === undefined || cl.syllabus === null ? "" : `<a target="_blank" href="${cl.syllabus}">Syllabus</a>`} \
          </div> \
          <div class="col-8">
            ${cl.description} \
          </div> \
    </div>`;
}
