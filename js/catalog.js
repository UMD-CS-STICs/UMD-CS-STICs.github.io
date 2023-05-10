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
  for (semester of SEMESTERS) {
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

  for (idx in fs) {
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

// TODO add semesters here
var SEMESTERS = ["spring 2017", "fall 2017", "spring 2018", "fall 2018", "spring 2019", "fall 2019", "spring 2020", "fall 2020", "fall 2021", "spring 2022", "fall 2022", "spring 2023", "fall 2023"];

var CURRENT_SEMESTER = "fall 2023";

// TODO add classes here
var CLASSES = {
  classes: {
    "spring 2017": {
      departments: ["CMSC"],
      classes: [
        {
          id: 0,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" },
            { name: "Sashank Thupukari", email: "sthupuka@umd.edu" },
          ],
          advisor: "Nelson Padua Perez",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kspring 2017",
          room: "CSIC1120",
          day: "Friday",
          time: "3-3:50 PM",
        },
      ],
    },
    "fall 2017": {
      departments: ["CMSC", "MATH", "BMGT", "ENSP", "MUSC"],
      classes: [
        {
          id: 6,
          department: "ENSP",
          number: "399E",
          title: "The Role of Evidence-based Advocacy in Environmental Politics",
          facilitators: [
            { name: "Margaret Houlihan", email: "mhouli@terpmail.umd.edu" },
            { name: "Camilla Arias", email: "carias3@umd.edu" },
          ],
          advisor: "Joanna Goger",
          credits: 1,
          description:
            "Students will learn about and discuss tools for effective advocacy and how that fits into the policy process by looking through the lenses of deforestation, water quality, and climate change.  They will become better able to enact change in environmental movements as they see fit using principles learned throughout the semester. They will be invited to share their opinions, and reflect on the opinions of their peers. Through assignments such as emailing members of congress or reaching out to UMD Facilities Management, students will practice involving others in their advocacy as well.",
          syllabus: "https://www.dropbox.com/s/zm6o7igkpcnzxm0/Syllabus%20ENSP399E.pdf?dl=0",
          room: "PLS1129",
          day: "Thursday",
          time: "12:30 - 1:20 PM",
        },
        {
          id: 1,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" },
            { name: "Sashank Thupukari", email: "sthupuka@umd.edu" },
          ],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to build back-end applications. Finally, we will learn about Express.js (server-side development framework) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kfall17",
          room: "CSIC3118",
          day: "Friday",
          time: "3-3:50 PM",
        },
        {
          id: 2,
          department: "CMSC",
          number: "389L",
          title: "Practical Cloud Computing with AWS",
          facilitators: [{ name: "Colin King", email: "colink@umd.edu" }],
          advisor: "Neil Spring",
          credits: 1,
          description:
            "This course provides a practical and project-oriented introduction to cloud computing with Amazon Web Services (AWS). Students will learn how to build applications using a variety of AWS services, including S3, EC2, Lambda, and Beanstalk. The course will culminate in a final resume-worthy project that will be built, deployed, and demoed to the class.",
          syllabus: "https://github.com/UMD-CS-STICs/389Lfall17",
          room: "CSIC3118",
          day: "Friday",
          time: "1-1:50 PM",
        },
        {
          id: 3,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Cameron Payton", email: "cpayton@umd.edu" },
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" },
          ],
          advisor: "Dave Levin",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Bit Manipulation and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          syllabus: "https://github.com/UMD-CS-STICs/389Ofall17",
          room: "CSIC3118",
          day: "Friday",
          time: "2-2:50 PM",
        },
        {
          id: 4,
          department: "BMGT",
          number: "298B",
          title: "Introduction to Product Design",
          facilitators: [{ name: "Jordan Steiner", email: "jasteiner11@gmail.com" }],
          advisor: "Pamela Armstrong",
          credits: 1,
          description:
            "This course will discuss the meaning behind design and how to communicate a message with product design. Students will interact in product discussions and understand how and why products are designed. From this, students will then apply learning to create concepts and prototypes for modern problems. Students will also get the chance to interact with real startup companies to assist in live cases to design products. Overall, students will learn and apply product design methodologies to concept a solution to a problem of their choosing.",
          syllabus: "https://www.dropbox.com/s/24nukb21ejyejni/product_design.pdf?dl=0",
          room: "VMH2509",
          day: "Thursday",
          time: "4-4:50 PM",
        },
        {
          id: 5,
          department: "MATH",
          number: "299N",
          title: "Mathematics of Ramanujan",
          facilitators: [
            { name: "Eric Metz", email: "emetz1618@gmail.com" },
            { name: "Tanay Wakhare", email: "twakhare@gmail.com" },
          ],
          advisor: "Lawrence Washington",
          credits: 1,
          description:
            "Srinivasan Ramanujan was born in rural India in 1887. Learning from a single book of theorems, he was able to rederive much of modern mathematics. After writing his first paper at 17, he recorded hundreds of pages of formulae that are still being explored today.  This course is meant to explain some of those results, and how they fit into modern number theory research today. This is not proof based; instead, this course is focused on presenting results and context.",
          syllabus: "https://www.dropbox.com/s/aaznuhcdppx05gf/MATH%20299N.pdf?dl=0",
          room: "MTH0405",
          day: "Friday",
          time: "3-3:50 PM",
        },

        {
          id: 7,
          department: "MUSC",
          number: "248D",
          title: "Rapping it Up: An Analysis of Hip Hop Music",
          facilitators: [
            { name: "Yannick Alexis", email: "yalexis@umd.edu" },
            { name: "Jordan Weber", email: "weberjordant@gmail.com" },
          ],
          advisor: "Richard King",
          credits: 1,
          description:
            "This course will discuss the history and analyze the evolution of Hip Hop and rap music from it’s early stages in the Nineteen Eighties to the Present day. Students will interact in class discussions and gain an understanding for the different sounds, messages, and impacts ofvarying Hip Hop artists and styles. From this, students will then apply learning from in class discussion by exploring previously unheard music and articulating their opinions. Throughout the course students will reflect on the value of Hip Hop to society and how it affects culture. Students will also get the chance to interact with local Hip-Hop artists as well as write and perform their own art as an extended learning opportunity to connect with the art form. Overall, students will learn and evaluate the intricacies of Hip Hop music and it’s importance to society.",
          syllabus: "https://www.dropbox.com/s/34bg31tbi0fx7lr/musc248d.pdf?dl=0",
          room: "PAC3160",
          day: "Thursday",
          time: "12:30 - 1:45 PM",
        },
      ],
    },
    "spring 2018": {
      departments: ["CMSC", "MATH", "BMGT", "ENSP", "MUSC"],
      classes: [
        {
          id: 8,
          department: "CMSC",
          number: "389C",
          title: "Bitcoin and Other Cryptocurrencies",
          facilitators: [
            { name: "Cameron Payton", email: "cpayton@umd.edu" },
            { name: "Neil Johnson", email: "nj13127@gmail.com" },
          ],
          advisor: "Jonathan Katz",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to the technology behind cryptocurrency and the economy surrounding it. This course will have a heavy emphasis on Bitcoin, but will touch on other types of cryptocurrency as well. This course is primarily intended to focus on the technological aspect of cryptocurrency, but we will also spend time discussing the economics of cryptocurrency.",
          syllabus: "https://github.com/UMD-CS-STICs/389Cspring19",
          room: "CSIC3118",
          day: "Friday",
          time: "2:00 - 2:50 PM",
        },
        {
          id: 9,
          department: "CMSC",
          number: "389K",
          title: "Full-Stack Web Development with Node.js",
          facilitators: [
            { name: "Timothy Chen", email: "tchen112@terpmail.umd.edu" },
            { name: "Allen Cheng", email: "ac@allencheng.me" },
          ],
          advisor: "Dr. John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kspring18",
          room: "CSIC2118",
          day: "Friday",
          time: "1:00 - 1:50 PM",
        },
        {
          id: 10,
          department: "CMSC",
          number: "389R",
          title: "Introduction to Ethical Hacking",
          facilitators: [
            { name: "Michael Reininger", email: "michael@csec.umiacs.umd.edu" },
            { name: "William Woodruff", email: "william@yossarian.net" },
            { name: "Joshua Fleming", email: "secretary@csec.umiacs.umd.edu" },
          ],
          advisor: "Dave Levin",
          credits: 1,
          description: "An introduction to ethical hacking geared towards entering the competitive world of cybersecurity Capture the Flag (CTF) competitions. Applications to a career in digital forensics, penetration testing, cryptology, and secure software development.",
          syllabus: "https://github.com/UMD-CS-STICs/389Rspring18",
          room: "CSIC2118",
          day: "Friday",
          time: "3:00 - 3:50 PM",
        },
        {
          id: 11,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Andi Hopkins", email: "andihop@umd.edu" },
            { name: "Maria McCulley", email: "mmccull2@umd.edu" },
            { name: "Sandra Sandeep", email: "ssandeep@umd.edu" },
          ],
          advisor: "Thomas Goldstein",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. Starting with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Bit Manipulation and Dynamic Programming. Most of the classes will be &quot;In-Class Interviews&quot; and take-home assignments will simulate real interview settings.",
          syllabus: "https://github.com/UMD-CS-STICs/389Ospring18",
          room: "ESJ2101",
          day: "Friday",
          time: "11:00 - 11:50 AM",
        },
        {
          id: 12,
          department: "CMSC",
          number: "389F",
          title: "Reinforcement Learning",
          facilitators: [
            { name: "Kevin Chen", email: "kev@umd.edu" },
            { name: "Zack Khan", email: "zkhan123@umd.edu" },
          ],
          advisor: "James Reggia",
          credits: 1,
          description:
            "From mastering impossibly complex games to creating precise AI for self-driving cars, Reinforcement Learning is set to be a breakthrough technology in the coming decade. \nReinforcement Learning is a powerful area of AI responsible for the recent successes of industry titans such as DeepMind, OpenAI, Google Brain, and Tesla. It’s inspired by a simple concept from behavioral psychology- people who receive a reward after doing an activity will continue doing that activity- and applies that principle in an algorithmic way to create intelligent systems. If you’d like to learn how to build an AI of your own using concepts from the cutting-edge of academic research and industry technology, come take CMSC389F: Reinforcement Learning! This course provides a theory-centric introduction to Reinforcement Learning, and students will learn the key concepts and algorithms driving Reinforcement Learning, including Markov Decision Processes, Monte Carlo Learning, and Policy Gradient methods.",
          syllabus: "https://github.com/mlatmd/cmsc389F",
          website: "http://cmsc389f.umd.edu",
          room: "CSIC3118",
          day: "Friday",
          time: "12:00 - 12:50 PM",
        },
        {
          id: 13,
          department: "CMSC",
          number: "389A",
          title: "Practical Deep Learning",
          facilitators: [{ name: "Sujith Vishwajith", email: "svishwaj@terpmail.umd.edu" }],
          advisor: "Jordan Boyd-Graber",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern deep learning networks and their applications to AI tasks. Specifically, the course will cover basic concepts in optimization, neural networks, convolutional neural networks (CNN), and recurrent neural networks (RNN). By the end of the course, it is expected that students will have a strong familiarity with the subject and be able to design and develop deep learning models for a variety of tasks.",
          syllabus: "https://github.com/UMD-CS-STICs/389Aspring18",
          room: "CSIC2118",
          day: "Friday",
          time: "12:00 - 12:50 PM",
        },
        {
          id: 14,
          department: "ENSP",
          number: "399E",
          title: "The Role of Evidenced Based Environmental Advocacy in Environmental Politics",
          facilitators: [
            { name: "Margaret Houlihan", email: "mhouli@terpmail.umd.edu" },
            { name: "Camilla Arias", email: "carias3@umd.edu" },
          ],
          advisor: "Joanna Goger",
          credits: 1,
          description:
            "In this course, students will explore the avenues of advocacy, and sound sources on which to base opinions and arguments in environmental policy. Through a discussion-based class, advocacy will be explored in in the areas of deforestation, climate change, and water quality. Students will analyze cases in the environmental movements of effective and ineffective advocacy, hear from a number of guest speakers who are experts in the above topics, and hold discussions on current events related to these topics.",
          syllabus: "https://docs.google.com/document/d/1-Drnr4f6Xy30LMjwVu6OHTBAb1_UML30MFQL7oBKqhE/edit?usp=sharing",
          room: "CHE2145",
          day: "Monday",
          time: "11:00 - 12:15 PM",
        },
        {
          id: 15,
          department: "ENME",
          number: "289P",
          title: "Additive Manufacturing for Prosthetic Design",
          facilitators: [
            { name: "Saul Schaffer", email: "saul@umd.edu" },
            { name: "Anna Packy", email: "apacky@eng.umd.edu" },
          ],
          advisor: "Angie Bryl, CPO",
          credits: 2,
          description:
            "This project-oriented course is designed to provide students an introduction to prosthetic design while empowering them to take advantage of the vast 3D printing resources at the University of Maryland to create and test a unique prosthetic prototype. The course will cover prosthetic components and design considerations, as well as the basics of 3D printing, before delving into the interface between the two subjects.",
          syllabus: "https://drive.google.com/file/d/18cfFFcEie6tZJnUZD_fSaOkgD8gkkkUh/view",
          room: "EGR3108",
          day: "Monday/Friday",
          time: "5:30 - 6:30 PM (Lec), 6:30 - 8:30 PM (Lab)",
        },
        {
          id: 16,
          department: "ARTT",
          number: "489Z",
          title: "Introduction to Design Software",
          facilitators: [
            { name: "Elise Nichols", email: "e.s.nichols17@gmail.com" },
            { name: "Drew Darden", email: "drew.d712@gmail.com" },
          ],
          advisor: "Liese Zahabi",
          credits: 1,
          description: "Covering the basics and processes of graphic design including Photoshop, Illustrator, and InDesign + basic GIFs.",
          syllabus: "https://drive.google.com/file/d/17vvRliu_hkbEFGWhSVLVHddzSfOdyRLd/view?usp=sharing",
          room: "TYD2102",
          day: "Thursday",
          time: "6:30 - 7:30 PM",
        },
        {
          id: 17,
          department: "CMSC",
          number: "389M",
          title: "SLAM: Why Robots Don't Crash",
          facilitators: [
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" },
            { name: "Michael Stevens", email: "msteven9@umd.edu" },
          ],
          advisor: "Larry Davis",
          credits: 1,
          description:
            "Students will be provided with a practical and lightly theoretical understanding of the most popular algorithms that solve the Simultaneous Localization and Mapping (SLAM) problem to enable self driving car technology. An emphasis will be placed on the probabilistic methods that underpin the SLAM problem.",
          syllabus: "",
          room: "CSI2118",
          day: "Friday",
          time: "2:00 - 2:50 PM",
        },
        {
          id: 18,
          department: "ENST",
          number: "499W",
          title: "Earth Systems Sustainability",
          facilitators: [{ name: "Gabriel Donnenberg", email: "gabedonnenberg@gmail.com" }],
          advisor: "Dr. Jose Luis-Izursa",
          credits: 1,
          description:
            "Earth Systems Sustainability offers a holistic examination of the diverse ways in which humans have affected natural systems of our planet over the last 15000 years of development. Considering unfolding environmental catastrophes and real, tangible, effective solutions in which we can all take part as individuals and advocate for as members of a globally conscious society. We will learn from each other and do what we can to save the parts of this world we consider most precious and worthy of fighting for.",
          syllabus: "https://drive.google.com/open?id=1fTjFX-S7TwKhl5_4YaQ6DfUyErBlwAgx",
          room: "ANS1422",
          day: "Wednesday",
          time: "10:00 - 11:15 AM",
        },
        {
          id: 19,
          department: "MATH",
          number: "299N",
          title: "The Mathematics of Ramanujan",
          facilitators: [
            { name: "Tanay Wakhare", email: "twakhare@gmail.com" },
            { name: "Aaron Benda", email: "abenda19@gmail.com" },
          ],
          advisor: "Lawrence Washington",
          credits: 1,
          description:
            "Srinivasan Ramanujan was born in rural India in 1887. Learning from a single book of theorems, he was able to rederive much of modern mathematics. After writing his first paper at 17, he recorded hundreds of pages of formulae that are still being explored today.  This course is meant to explain some of those results, and how they fit into modern number theory research today. This is not proof based; instead, this course is focused on presenting results and context.",
          syllabus: "https://www.dropbox.com/s/hli604km16q1k5n/syllabus.docx?dl=0",
          room: "MATH0103",
          day: "Friday",
          time: "12:00 - 12:50 PM",
        },
        {
          id: 20,
          department: "CMSC",
          number: "389L",
          title: "Practical Cloud Computing with AWS",
          facilitators: [{ name: "Colin King", email: "colink@umd.edu" }],
          advisor: "Neil Spring",
          credits: 1,
          description:
            "This course provides a practical and project-oriented introduction to cloud computing with Amazon Web Services (AWS). Students will learn how to build applications using a variety of AWS services, including S3, EC2, Lambda, and Beanstalk. The course will culminate in a final resume-worthy project that will be built, deployed, and demoed to the class.",
          syllabus: "https://github.com/UMD-CS-STICs/389Lspring18",
          room: "CSIC3118",
          day: "Friday",
          time: "3-3:50 PM",
        },
        {
          id: 21,
          department: "CMSC",
          number: "389E",
          title: "Digital Logic through Minecraft",
          facilitators: [
            { name: "Alex Brassel", email: "abrassel@umd.edu" },
            { name: "Jeremy Klein", email: "jklein@umd.edu" },
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "In this class, we will explore the theory and applications of combinatorial and sequential circuits. All projects will be done using Minecraft’s Redstone. The course will cover basic gates to more advanced circuits including memory gates and large sequential circuits. The first half of the class will focus on combinational logic gates, and the second half will introduce time-based sequential circuits.",
          syllabus: "https://www.sharelatex.com/read/dvyhxndvpcmg",
          room: "CSIC3118",
          day: "Friday",
          time: "1-1:50 PM",
        },
        {
          id: 22,
          department: "IDEA",
          number: "258D",
          title: "Explorations in Design",
          facilitators: [{ name: "Jordan Steiner", email: "jasteiner11@gmail.com" }],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "Explorations in Design will give students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real clients from various industries. We will explore how good and bad design plays a role in our everyday lives, from the way we order coffee to the logos you see to the signs that help you navigate (or get lost on) the metro.",
          syllabus: "ter.ps/IDEA258D",
          room: "ESJ2101",
          day: "Thursday",
          time: "2 - 3:15 PM",
        },
      ],
    },
    "fall 2018": {
      departments: ["CMSC"],
      classes: [
        {
          id: 23,
          department: "ARTT",
          number: "489Q",
          title: "Front End Web Design and Development",
          facilitators: [
            { name: "David Ng", email: "dng5@umd.edu" },
            { name: "Charlie Ching", email: "cching@terpmail.umd.edu" },
          ],
          advisor: "Brandon Morse",
          credits: 1,
          description: "This course presents a practical and project-oriented introduction to modern front end web development. Students will learn to design and build websites using technologies such as HTML, CSS, JS, Sass, Bootstrap, and Git.",
          syllabus: "./assets/syllabi/F18/ARTT489Q_F18.pdf",
          website: "http://stics.umd.edu/artt489q",
          room: "ASY3304",
          day: "Friday",
          time: "12 - 12:50 PM",
        },
        {
          id: 24,
          department: "CMSC",
          number: "389C",
          title: "Bitcoin and Other Cryptocurrencies",
          facilitators: [
            { name: "Cameron Payton", email: "cpayton@umd.edu" },
            { name: "John Kos", email: "jkos@terpmail.umd.edu" },
          ],
          advisor: "Jonathan Katz",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to the technology behind cryptocurrency and the economy surrounding it. This course will have a heavy emphasis on Bitcoin, but will dive into other types of cryptocurrency as well, such as Ethereum. This course is primarily intended to focus on the technological aspect of cryptocurrency, but we will also spend time discussing the economics of cryptocurrency.",
          syllabus: "./assets/syllabi/F18/CMSC389C_F18.pdf",
          room: "BPS1238",
          day: "Friday",
          time: "1 - 1:50 PM",
        },
        {
          id: 25,
          department: "CMSC",
          number: "389I",
          title: "Disrupting Healthcare with AI",
          facilitators: [
            { name: "Sanna Madan", email: "smadan12@umd.edu" },
            { name: "Kyle Liu", email: "kliu1234@umd.edu" },
          ],
          advisor: "Max Leiserson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to the intersection of machine learning and different challenges in healthcare. Students will apply basic predictive modeling techniques to fields such as early detection of disease, telemedicine, and mental health. Prior knowledge of biology is not required but a basic understanding of Python and/or machine learning techniques is recommended.",
          syllabus: "./assets/syllabi/F18/CMSC389I_F18.pdf",
          room: "CSI2118",
          day: "Friday",
          time: "2 - 2:50 PM",
        },
        {
          id: 26,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Maria McCulley", email: "mmccull2@umd.edu" },
            { name: "Sandra Sandeep", email: "sandrasandeep01@gmail.com" },
            { name: "Andi Hopkins", email: "andihop@terpmail.umd.edu" },
            { name: "Nelson Le", email: "nle@terpmail.umd.edu" },
          ],
          advisor: "Thomas Goldstein",
          credits: 1,
          description: `Students will be provided with a comprehensive, practical introduction to technical interviews. Starting with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Bit Manipulation and Dynamic Programming. Most of the classes will be "In-Class Interviews" and take-home assignments will simulate real interview settings.`,
          syllabus: "./assets/syllabi/F18/CMSC389O_F18.pdf",
          sections: [
            {
              room: "Section 0301: EGR2154",
              day: "Friday",
              time: "11 AM - 11:50 AM",
            },
            {
              room: "Section 0201: TWS0214",
              day: "Friday",
              time: "1 - 1:50 PM",
            },
            {
              room: "Section 0101: EDU1107",
              day: "Friday",
              time: "12 - 12:50 PM",
            },
          ],
        },
        {
          id: 27,
          department: "MATH",
          number: "299C",
          title: "Mathematics & Classical Music",
          facilitators: [{ name: "Siri Neerchal", email: "siri@terpmail.umd.edu" }],
          advisor: "Niranjan Ramachandran",
          credits: 1,
          description:
            "The aim of this course is to explore the historical discoveries in mathematics that have influenced Western classical music, as well as musical expressions of specific mathematical concepts. This course is not meant to be a rigorous introduction to music theory or mathematics; rather, it is focused on introducing students to classical music through mathematical ideas that appear in it. Students will also have an opportunity to explore mathematics through music in the form of a creative project.",
          syllabus: "./assets/syllabi/F18/MATH299C_F18.pdf",
          room: "MTH0103",
          day: "Friday",
          time: "12 - 12:50 PM",
        },
        {
          id: 28,
          department: "CMSC",
          number: "389Q",
          title: "iOS App Development",
          facilitators: [
            { name: "Travis Ho", email: "tho12@umd.edu" },
            { name: "Tamer Bader", email: "tbader@terpmail.umd.edu" },
          ],
          advisor: "Neil Spring",
          credits: 1,
          description:
            "This course teaches mobile development on the iOS platform. Students must have a Macintosh laptop (or access to one) in order to participate in this course. Topics covered will be Xcode, Swift, design patterns, creating UI, networking, and common libraries (as per request) such as ARKit and Core ML. By the end of this course, students should have the resources necessary to create their own apps and publish to the app store.",
          syllabus: "./assets/syllabi/F18/CMSC389Q_F18.pdf",
          room: "CSI3118",
          day: "Friday",
          time: "2 - 2:50 PM",
        },
        {
          id: 29,
          department: "MUSC",
          number: "248D",
          title: "Rapping it Up: An Analysis of Hip Hop Music",
          facilitators: [
            { name: "Yannick Alexis", email: "yalexis@umd.edu" },
            { name: "Jordan Weber", email: "weberjordant@gmail.com" },
          ],
          advisor: "William Evans",
          credits: 1,
          description:
            "This course will discuss the history and analyze the evolution of Hip Hop and rap music from it’s early stages in the Nineteen Eighties to the Present day. Students will interact in class discussions and gain an understanding for the different sounds, messages, and impacts ofvarying Hip Hop artists and styles. From this, students will then apply learning from in class discussion by exploring previously unheard music and articulating their opinions. Throughout the course students will reflect on the value of Hip Hop to society and how it affects culture. Students will also get the chance to interact with local Hip-Hop artists as well as write and perform their own art as an extended learning opportunity to connect with the art form. Overall, students will learn and evaluate the intricacies of Hip Hop music and it’s importance to society.",
          syllabus: "./assets/syllabi/F18/MUSC248D_F18.pdf",
          room: "PAC2164",
          day: "Wednesday",
          time: "11 AM - 12:15 PM",
        },
        {
          id: 30,
          department: "CMSC",
          number: "389U",
          title: "Introduction to Developing AR Applications with Hololens",
          facilitators: [
            { name: "John Ball", email: "jlball@terpmail.umd.edu" },
            { name: "Matt Graber", email: "mgraber1@terpmail.umd.edu" },
          ],
          advisor: "Matthias Zwicker",
          credits: 1,
          description:
            "A hands on, project driven introduction to developing Augmented Reality applications for devices like the Microsoft Hololens using the Microsoft Mixed Reality Toolkit and the Unity 3D engine. Topics will include AR design thinking, the Unity scripting API, deploying applications to Hololens, and the technology behind AR devices. Students will explore the capabilities of AR devices through bi-weekly projects designed to give them usable, valuable skills as quickly as possible. Basic programming and Unity experience, while not strictly required, are strongly recommended.",
          syllabus: "./assets/syllabi/F18/CMSC389U_F18.pdf",
          room: "CSI1122",
          day: "Friday",
          time: "1 - 1:50 PM",
        },
        {
          id: 31,
          department: "CMSC",
          number: "389F",
          title: "Reinforcement Learning",
          facilitators: [
            { name: "Dhruv Mehta", email: "dhruvnm@umd.edu" },
            { name: "Johann Miller", email: "jkmiller@umd.edu" },
          ],
          advisor: "James Reggia",
          credits: 1,
          description:
            "This course provides an overview of the key concepts and algorithms of Reinforcement Learning, an area of artificial intelligence research responsible for recent achievements such as AlphaGo and robotic control. Students will implement learning algorithms for simple tasks such as mazes and pong games.",
          syllabus: "./assets/syllabi/F18/CMSC389F_F18.pdf",
          room: "EGR2116",
          day: "Friday",
          time: "2 PM - 2:50 PM",
        },
        {
          id: 31,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Benny Cheng", email: "bcheng1996@gmail.com" },
            { name: "Chirag Shankar", email: "chishankar@gmail.com" },
          ],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kfall18/blob/master/README.md",
          room: "EGR2154",
          day: "Friday",
          time: "2 PM - 2:50 PM",
        },
        {
          id: 32,
          department: "MATH",
          number: "299M",
          title: "Visualization through Mathematica",
          facilitators: [{ name: "Ajeet Gary", email: "agary@terpmail.umd.edu" }],
          advisor: "William Goldman",
          credits: 1,
          description:
            "This course is designed to teach how to use the most common and useful features of Wolfram Mathematica, an extremely powerful technical computing system that can be used to model a wide range of problems. Plotting functions in several ways, making models that can be manipulated in real time by the user, and efficiently computing solutions to complicated equations are among the things we'll cover. We'll use these skills to model various structures in physics, economics, calculus and more, and for the final project every student will pick something relevant to their major (or interest otherwise) to model, whether that be in physics, math, engineering, economics, or anything else mathematical in nature. Over the course of learning these tools students will encounter profound examples of what Mathematica can do, seeing first hand that creating models that can be manipulated in real time helps greatly in understanding the underlying symmetries and properties of a problem.",
          syllabus: "./assets/syllabi/F18/MATH299M_F18.pdf",
          room: "MTH0401",
          day: "Friday",
          time: "2 PM - 2:50 PM",
        },
        {
          id: 33,
          department: "MATH",
          number: "299P",
          title: "Proofs from The Book",
          facilitators: [
            { name: "Tanay Wakhare", email: "twakhare@gmail.com" },
            { name: "Erik Metz", email: "emetz1618@gmail.com" },
          ],
          advisor: "Lawrence Washington",
          credits: 1,
          description:
            "Combinatorics is the study of counting. Despite its deceptively simple name, it is one of the most active areas of research in modern mathematics. We discuss some of the basic ideas behind combinatorics, and their unexpected applications. The proofs we discuss are so elegant that Paul Erdos once said they are from “The Book” – God’s book of the most elegant proof of each theorem.",
          syllabus: "./assets/syllabi/F18/MATH299P_F18.pdf",
          room: "MTH0407",
          day: "Friday",
          time: "1 PM - 1:50 PM",
        },
        {
          id: 34,
          department: "BMGT",
          number: "299A",
          title: "Designing for Business",
          facilitators: [{ name: "Katie Zeng", email: "zeng.katieli@gmail.com" }],
          advisor: "Mary Harms",
          credits: 1,
          description:
            "This course will introduce you to the fundamentals of graphic design in the context of business management. Students will be challenged to apply their design knowledge with hands-on activities, ranging from ideation to execution. Students will learn the necessity of branding, design and design thinking in the business world, while gaining the technical skills necessary to execute on their visions. To sharpen their communication skills, students will participate in in-class design challenges and a final class presentation.",
          syllabus: "./assets/syllabi/F18/BMGT299A_F18.pdf",
          room: "VMH1511",
          day: "Tuesday",
          time: "3:30 PM - 4:45 PM",
        },
        {
          id: 35,
          department: "IDEA",
          number: "258D",
          title: "Explorations in Design",
          facilitators: [{ name: "Tianxin Chen", email: "chen128@umd.edu" }],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "“Exploration in Design” gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real clients from various industries. We will explore how good and bad design plays a role in our everyday lives, from the way we order coffee to the logos on ads to the signs that help you navigate (or get lost on) the metro.",
          syllabus: "./assets/syllabi/F18/IDEA258D_F18.pdf",
          room: "ESJ2101",
          day: "Thursday",
          time: "12 PM - 1:30 PM",
        },
        {
          id: 36,
          department: "IDEA",
          number: "258Z",
          title: "Digital Product Design",
          facilitators: [
            { name: "Andres Arbelaez", email: "andresarbelaez08@gmail.com" },
            { name: "Nathalyn Nunoo", email: "nathalyn.nunoo@gmail.com" },
          ],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "In this course you’ll be introduced and immersed into user- centric design experiences for mobile and web products. You’ll get to apply your learnings to real startup companies and use your design and product-thinking skills to design your own digital product. This class is for all level of designers/builders - from newbie to pro!",
          syllabus: "./assets/syllabi/F18/IDEA258Z_F18.pdf",
          room: "ESJ2101",
          day: "Thursday",
          time: "2 PM - 3:15 PM",
        },
        {
          id: 37,
          department: "AASP",
          number: "299Y",
          title: "Introduction to Yoruba",
          facilitators: [{ name: "OreOluwa Aluko", email: "oaluko@terpmail.umd.edu" }],
          advisor: "Jason Nichols",
          credits: 1,
          description: "This is a beginner’s course for anyone who has had little to no exposure to Yorùbá or those who know Yorùbá but would like to learn how to read and write in the language. The main focus of this course will be basic greetings, sentence structure and vocabulary.",
          syllabus: "./assets/syllabi/F18/AASP299Y_F18.pdf",
          room: "WDS0104",
          day: "Monday",
          time: "3:30 PM - 4:45 PM",
        },
        {
          id: 38,
          department: "AASP",
          number: "299I",
          title: "Introduction to Igbo",
          facilitators: [
            { name: "Chidera Nosiri", email: "cnosiri@terpmail.umd.edu" },
            { name: "Janefrances Onyekonwu", email: "janeukas@gmail.com" },
          ],
          advisor: "Sangeetha Madhavan",
          credits: 1,
          description:
            "From language to tradition, Elementary Igbo I provides insight into tradition, culture and their importance to Igbo language. Students will be provided with the tool set to read, write, and speak Igbo. This is part of the STIC (student initiated courses) program and will be taught by undergraduates under the supervision of a faculty advisor.",
          syllabus: "./assets/syllabi/F18/AASP299I_F18.pdf",
          room: "LEF1201",
          day: "Monday",
          time: "3:30 PM - 4:45 PM",
        },
        {
          id: 39,
          department: "CMSC",
          number: "389R",
          title: "Introduction to Ethical Hacking",
          facilitators: [
            { name: "Michael Reininger", email: "michael@csec.umiacs.umd.edu" },
            { name: "Wesley Weidenhamer", email: "wesley@csec.umiacs.umd.edu" },
            { name: "Joshua Fleming", email: "wesley@csec.umiacs.umd.edu" },
          ],
          advisor: "Dave Levin",
          credits: 1,
          description:
            "This practical, hands-on 1-credit course provides students with an introduction to ethical hacking. The course begins with a discussion on the ethics behind security research and progresses to topics that surround penetration testing, forensics, cryptology, and binary reverse engineering and exploitation. This course is also meant to introduce students to Capture-the-Flag (CTF) style cybersecurity challenges, encourages participation in UMD’s Cybersecurity Club (UMDCSEC), and prepares for CMSC414.",
          syllabus: "./assets/syllabi/F18/CMSC389R_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated",
        },
        {
          id: 40,
          department: "AASP",
          number: "299T",
          title: "Introduction to Twi",
          facilitators: [
            { name: "Clydelle Agyei", email: "agyeiclydelle@gmail.com" },
            { name: "Ama Sapong", email: "asapong@terpmail.umd.edu​ " },
          ],
          advisor: "George Kintiba",
          credits: 1,
          description:
            "Akwaaba (Welcome)! This is a language course designed to provide basic communicative competence in oral Twi for beginners. We will begin by introducing students to the Ghanaian culture. As we advance through the course, you will notice that we place less emphasis on formal grammatical instruction and more emphasis on everyday speech. This is because we want to prepare you for everyday conversation with family and friends. Through weekly lessons and activities, we hope to build your confidence when speaking Twi and also help you build a community with other students on campus.",
          syllabus: "./assets/syllabi/F18/AASP299T_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated", // TODO deprecate these fields completely
        },
        {
          id: 40,
          department: "CMSC",
          number: "389Y",
          title: "Practical Methods For Self Driving Cars",
          facilitators: [{ name: "Michael Stevens", email: "msteven9@terpmail.umd.edu" }],
          advisor: "Larry Davis",
          credits: 1,
          description: "This course aims to provide students with a practical understanding of popular algorithms used in self driving cars. Both traditional and deep learning approaches will be used to solve scene understanding and control.",
          syllabus: "./assets/syllabi/F18/CMSC389Y_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated", // TODO deprecate these fields completely
        },
        {
          id: 41,
          department: "CMSC",
          number: "389E",
          title: "Digital Logic through Minecraft",
          facilitators: [{ name: "Alex Brassel", email: "abrassel@umd.edu" }],
          advisor: "Jason Filippou",
          credits: 1,
          description: "This class explores the fundamentals of digital logic design using Minecraft's Redstone. Using the low-level and intuitive visualization of circuitry Redstone provides, you will create a series of projects that apply principles of digital logic design learned in class.",
          syllabus: "./assets/syllabi/F18/CMSC389E_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated",
        },
      ],
    },
    "spring 2019": {
      departments: ["CMSC"],
      classes: [
        {
          id: 42,
          department: "CMSC",
          number: "388D",
          title: "2D Game Engine Design",
          facilitators: [
            { name: "Sina Mirnejad", email: "smirneja@terpmail.umd.edu" },
            { name: "Saadiq Shaik", email: "saadiqks@gmail.com" },
          ],
          advisor: "David Mount",
          credits: 1,
          description: "This course will provide basic insight into the design process of a Java game engine, 2D graphics, and the mathematics behind it. The primary focus of the course will be on 2D game engines but will discuss ideas relevant to 3D environments.",
          syllabus: "./assets/syllabi/S19/CMSC388D_S19.pdf",
          website: null,
        },
        {
          id: 44,
          department: "CMSC",
          number: "389C",
          title: "Bitcoin and Other Cryptocurrencies",
          facilitators: [{ name: "Cameron Payton", email: "cpayton@umd.edu" }],
          advisor: "Jonathan Katz",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to the technology behind cryptocur rency and the economy surrounding it. This course will have a heavy emphasis on Bitcoin, but will dive into other types of cryptocurrency as well, such as Ethereum. This course is primarily intended to focus on the technological aspect of cryptocurrency, but we will also spend time discussing the economics of cryptocurrency.",
          syllabus: null,
          website: null,
        },
        {
          id: 45,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Benny Cheng", email: "bcheng1996@gmail.com" },
            { name: "Chirag Shankar", email: "chishankar@gmail.com" },
            { name: "Camille Stacho", email: "camstach@gmail.com" },
            { name: "Chidi Udeze", email: "chidiu98@gmail.com" },
          ],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehens ive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavScr ipt. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development modu le) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kspring19",
          website: null,
        },
        {
          id: 46,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Maria McCulley", email: "mmccull2@umd.edu" },
            { name: "Blue Keleher", email: "keleherblue@gmail.com" },
            { name: "Katherine Chase", email: "katherine.m.chase@gmail.com" },
            { name: "George Tong", email: "gjtong@umd.edu" },
            { name: "Kusal De Alwis", email: "kdealwis@umd.edu" },
            { name: "Dhruv Mehta", email: "dhruvnm2@gmail.com" },
            { name: "Atharva Bhat", email: "abhat98@gmail.com" },
            { name: "Nelson Le", email: "nle@umd.edu" },
            { name: "Tim Chen", email: "hello@timothychen.me" },
          ],
          advisor: "Thomas Goldstein",
          credits: 1,
          description:
            'Students will be provided with a comprehensive, practical introduction to technical interviews. Starting with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Bit Manipulation and Dynamic Programming. Most of the classes will be "In-Class Interviews" and take-home assignments will simulate real interview settings.',
          syllabus: "./assets/syllabi/S19/CMSC389O_S19.pdf",
          website: null,
        },
        {
          id: 47,
          department: "CMSC",
          number: "388F",
          title: "Functional Pearls",
          facilitators: [
            { name: "Cameron Moy", email: "camoy@cs.umd.edu" },
            { name: "Ben Mariano", email: "benmar@cs.umd.edu" },
          ],
          advisor: "David Van Horn",
          credits: 1,
          description:
            "This course will explore elegant examples of functional programming. The first half will provide an introduction to Haskell and four important abstractions: monoids, functors, applicative functors, and monads. We will focus on simple and plentiful examples. The second half will cover a wide variety of functional programming techniques and applications.",
          syllabus: "./assets/syllabi/S19/CMSC388F_S19.pdf",
          website: null,
        },
        {
          id: 48,
          department: "IDEA",
          number: "258D",
          title: "Explorations in Design",
          facilitators: [{ name: "Tianxin Chen", email: "chen128@umd.edu" }],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "Explorations in Design will give students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real clients from various industries. We will explore how good and bad design plays a role in our everyday lives, from the way we order coffee to the logos you see to the signs that help you navigate (or get lost on) the metro.",
          syllabus: "./assets/syllabi/S19/IDEA258D_S19.pdf",
          website: null,
        },
        {
          id: 49,
          department: "MATH",
          number: "299C",
          title: "Mathematics & Classical Music",
          facilitators: [{ name: "Siri Neerchal", email: "siri@terpmail.umd.edu" }],
          advisor: "Niranjan Ramachandran",
          credits: 1,
          description:
            "The aim of this course is to explore the historical discoveries in mathematics that have influenced Western classical music, as well as musical expressions of specific mathematical concepts. This course is not meant to be a rigorous introduction to music theory or mathematics; rather, it is focused on introducing students to classical music through mathematical ideas that appear in it. Students will also have an opportunity to explore mathematics through music in the form of a creative project.",
          syllabus: "./assets/syllabi/S19/MATH299C_S19.pdf",
          website: null,
        },
        {
          id: 50,
          department: "CMSC",
          number: "388E",
          title: "Creative Approaches to Computing: Arts and Tech",
          facilitators: [
            { name: "Astha Singhal", email: "asinghal084@gmail.com" },
            { name: "Amy Zhao", email: "zhaoamy123@gmail.com" },
            { name: "Sana Shah", email: "sana@shah.org " },
          ],
          advisor: "Roger Eastman",
          credits: 1,
          description:
            "This class aims to bring the creativity back into computing by teaching basic art and design principles through the medium of coding. By bringing together Processing, a visual arts coding language, and different hallmarks of art theory, we want to teach an innovative class that empowers students to connect with their creative side. Students should come in with basic coding knowledge but can expect to leave with a greater appreciation for digital media.",
          syllabus: "./assets/syllabi/S19/CMSC388E_S19.pdf",
          website: null,
        },
        {
          id: 51,
          department: "ENME",
          number: "289P",
          title: "Additive Manufacturing for Prosthetic Design",
          facilitators: [
            { name: "Saul Schaffer", email: "saul@umd.edu" },
            { name: "Anna Packy", email: "apacky@eng.umd.edu" },
          ],
          advisor: "Angie Bryl",
          credits: 2,
          description: "Exploring how to leverage 3D printing to improve performance and comfort of prosthetic devices.",
          syllabus: "./assets/syllabi/S19/ENME289P_S19.pdf",
          website: null,
        },
        {
          id: 52,
          department: "MATH",
          number: "299O",
          title: "Algorithms and Probability in Board Games with a Focus of Bridge",
          facilitators: [{ name: "Hakan Berk", email: "hakan.t.berk@gmail.com" }],
          advisor: "Lawrence Washington",
          credits: 1,
          description:
            "The purpose of this course is to give students an application of algorithms and probability using games such as bridge, chess, and Go. First there will be an introduction to the card game of bridge for those that have never played before. This includes a history of the game and the basics of how to play. Second, there will be an introduction to probability for those that may not have taken a class in statistics or could use a refresher. Then, the course will go in depth on how bridge is an application of probability and how it can be used to improve quickly.  Within this context, we will think about how to implement these solutions programmatically. Finally the connection between bridge, chess, and Go AI’s will be explored in the last third of the course.",
          syllabus: "./assets/syllabi/S19/MATH299O_S19.pdf",
          website: null,
        },
        {
          id: 53,
          department: "CMSC",
          number: "388I",
          title: "WebAssembly OS",
          facilitators: [{ name: "Willem Wyndham", email: "willem@cs.umd.edu" }],
          advisor: "Michael Hicks",
          credits: 1,
          description:
            "WebAssembly (wasm) is a new virtual machine designed by the four major browsers to run code almost as fast as native code. The goal is to add Operating System features to WebAssembly. To implement these features students will use AssemblyScript, a subset of Javascript which compiles to wasm.",
          syllabus: "./assets/syllabi/S19/CMSC388I_S19.pdf",
          website: null,
        },
        {
          id: 54,
          department: "CMSC",
          number: "389R",
          title: "Introduction to Ethical Hacking",
          facilitators: [
            { name: "Michael Reininger", email: null },
            { name: "Wesley Weidenhamer", email: null },
          ],
          advisor: "David Levin",
          credits: 1,
          description: "An introduction to ethical hacking geared towards entering the competitive world of cybersecurity Capture the Flag (CTF) competitions. Applications to a career in digital forensics, penetration testing, cryptology, and secure software development.",
          syllabus: null,
          website: null,
        },
        {
          id: 55,
          department: "CMSC",
          number: "389E",
          title: "Digital Logic through Minecraft",
          facilitators: [
            { name: "Alex Brassel", email: "abrassel@umd.edu" },
            { name: "Ajeet Gary", email: "agary@terpmail.umd.edu" },
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description: "Explores the fundamentals of digital logic design using Minecraft's Redstone. Using the low-level and intuitive visualization ofcircuitry Redstone provides, you will create a series of projects thatapply principles of digital logic design learned in class.",
          syllabus: null,
          website: null,
        },
        // {
        //   id: 56,
        //   department: "AASP",
        //   number: "299I",
        //   title: "Elementary Igbo II",
        //   facilitators: [
        //     { name: "TBD", email: null },
        //   ],
        //   advisor: "Sangeetha Madhavan",
        //   credits: 1,
        //   description:
        //     "...",
        //   syllabus: null,
        //   website: null,
        // },
        {
          id: 57,
          department: "AASP",
          number: "299T",
          title: "Elementary Twi II",
          facilitators: [
            { name: "Maame Sapong", email: "asapong@terpmail.umd.edu" },
            { name: "Clydelle Agyei", email: "cagyei@terpmail.umd.edu" },
          ],
          advisor: "George Kintiba",
          credits: 1,
          description:
            "Akwaaba (Welcome)! This is a language course designed to provide basic communicative competence in oral Twi for beginners. We will begin by introducing students to the Ghanaian culture. As we advance through the course, you will notice that we place less emphasis on formal grammatical instruction and more emphasis on everyday speech. This is because we want to prepare you for an everyday conversation with family and friends. Through weekly lessons and activities, we hope to build your confidence when speaking Twi and also help you build a community with other students on campus.",
          syllabus: "./assets/syllabi/S19/AASP299T_S19.pdf",
          website: null,
        },
        // {
        //   id: 58,
        //   department: "AASP",
        //   number: "299Y",
        //   title: "Elemantary Yoruba II",
        //   facilitators: [
        //     { name: "TBD", email: null },
        //   ],
        //   advisor: "Jason Nichols",
        //   credits: 1,
        //   description:
        //     "...",
        //   syllabus: null,
        //   website: null,
        // },
        {
          id: 59,
          department: "IDEA",
          number: "258Z",
          title: "Digital Product Design",
          facilitators: [
            { name: "Andy Moon", email: "msoohyun88@gmail.com" },
            { name: "Chloe Jones", email: "cjones97@umd.edu" },
          ],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "Welcome to Digital Product Design! In this course you'll be introduced and immersed into user-centric design experiences for mobile and web products. You'll get to apply your learnings to real startup companies and use your design and product-thinking skills to design your own digital product. This class is for all levels of designers/builders - from newbie to pro!",
          syllabus: "./assets/syllabi/S19/IDEA258Z_S19.pdf",
          website: null,
        },
        {
          id: 60,
          department: "IDEA",
          number: "489",
          title: "Learning Experience Design Studio",
          facilitators: [
            { name: "Tianxin Chen", email: "chen128@umd.edu" },
            { name: "Ishaan Parikh", email: "parikh.i.m@gmail.com" },
          ],
          advisor: "Meenu Singh",
          credits: 2,
          description: "In this class, we will deconstruct the elements of a learning experience and consider each element as a variable to experiment with in your teaching. You will also have the opportunity to share and discuss your teaching experiences with fellow facilitators.",
          syllabus: "https://docs.google.com/document/d/1xaSIhIQpPZdrm8lI4tw9Xk1NfAertoY7Cu99AmCMjXk/edit?usp=sharing",
          website: null,
        },
        {
          id: 61,
          department: "MATH",
          number: "299M",
          title: "Visualization through Mathematica",
          facilitators: [{ name: "Ajeet Gary", email: "agary@terpmail.umd.edu" }],
          advisor: "William Goldman",
          credits: 1,
          description:
            "A comprehensive course on the technical computing language Mathematica, starting with basics including plotting, computation, 3D modeling, and interactive output. The last weeks focus on advanced topics including parallelization, evaluation control, precomputation, and advanced dynamic functionality. The course culminates in personalized final projects on a topic of each student's choice - application vary from physics to finance to nueroscience and more.",
          syllabus: "./assets/syllabi/S19/MATH299M_S19.pdf",
          website: null,
        },
        {
          id: 62,
          department: "CMSC",
          number: "388G",
          title: "Virtual Reality Game Development",
          facilitators: [{ name: "Galen Stetsyuk", email: "stetsyuk@umd.edu" }],
          advisor: "Ashok Agrawala",
          credits: 1,
          description:
            "Explores the virtual reality game development best practices and use of commercial game engines to build VR experiences that are engaging, immersive, and reduce the onset of simulation sickness. Also, focuses on development with Unreal Engine using C++, using 3d models, lighting, and graphics to optimize experiences for VR.",
          syllabus: "./assets/syllabi/S19/CMSC388G_S19.pdf",
          website: null,
        },
        {
          id: 63,
          department: "CMSC",
          number: "389J",
          title: "Introduction to Reverse Engineering",
          facilitators: [
            { name: "Drake Petersen", email: "drakemp@terpmail.umd.edu" },
            { name: "Christopher Brown", email: "chris03@terpmail.umd.edu" },
          ],
          advisor: "Jonathan Katz",
          credits: 1,
          description:
            "The course will assist students in gaining experience in a high demand practice of cybersecurity through weekly reversing assignments. Students will be challenged to think outside the box in order to solve reversing challenges. Assignments will be challenges focused in the analysis of Linux binaries including various malware. The goal is to have students go from beginner to intermediate level reverse engineers. Students will be expected to have some assembly experience prior to the class (calling conventions, stack/heap, registers), but students will be taught x86_64 assembly as the semester progresses.",
          syllabus: "./assets/syllabi/S19/CMSC389J_S19.pdf",
          website: null,
        },
        {
          id: 64,
          department: "MUSC",
          number: "248D",
          title: "Analysis of Hip Hop Music",
          facilitators: [
            { name: "Yannick Alexis", email: "yannickalexis@gmail.com" },
            { name: "Jordan Weber", email: "jwebs2@umd.edu" },
          ],
          advisor: "William Evans",
          credits: 1,
          description:
            "This course will discuss the history and analyze the evolution of Hip Hop and rap music from it’s early stages in the Nineteen Eighties to the Present day. Students will interact in class discussions and gain an understanding for the different sounds, messages, and impacts ofvarying Hip Hop artists and styles. From this, students will then apply learning from in class discussion by exploring previously unheard music and articulating their opinions. Throughout the course students will reflect on the value of Hip Hop to society and how it affects culture. Students will also get the chance to interact with local Hip-Hop artists as well as write and perform their own art as an extended learning opportunity to connect with the art form. Overall, students will learn and evaluate the intricacies of Hip Hop music and it’s importance to society.",
          syllabus: null,
          website: null,
        },
      ],
    },
    "fall 2019": {
      departments: ["CMSC", "MATH", "BSCI", "AASP", "IDEA"],
      classes: [
        {
          id: 65,
          department: "CMSC",
          number: "388D",
          title: "2D Game Engine Design",
          facilitators: [{ name: "Sina Mirnejad", email: "smirneja@terpmail.umd.edu" }],
          advisor: "David Mount",
          credits: 2,
          description: "This course will provide basic insight into the design process of a Java game engine, 2D graphics, and the mathematics behind it. The primary focus of the course will be on 2D game engines but will discuss ideas relevant to 3D environments.",
          syllabus: null,
          website: null,
        },
        {
          id: 66,
          department: "CMSC",
          number: "388J",
          title: "Building Secure Web Applications with Python and Flask",
          facilitators: [
            { name: "Yashas Lokesh", email: "yashloke@terpmail.umd.edu" },
            { name: "Kenton Wong", email: "kdubbs0@umd.edu" },
          ],
          advisor: "Michael Marsh",
          credits: 1,
          description:
            "This course is an introduction to building secure, full-stack web applications with Python and Flask. We'll start with Python and Flask and transition to web application security, where we'll look at different types of security vulnerabilities and best practices to patch up these vulnerabilities in your own apps. Then, we'll go to building your own API and securely authenticating with it, and finish by showing you how you can deploy your web app!",
          syllabus: "./assets/syllabi/F19/CMSC388J_F19.pdf",
          website: null,
        },
        {
          id: 67,
          department: "CMSC",
          number: "388L",
          title: "Readings in HCI Research",
          facilitators: [
            { name: "Selena Alvarado", email: "selalvarado25@gmail.com" },
            { name: "Justin Goodman", email: "jugoodma@terpmail.umd.edu" },
          ],
          advisor: "Evan Golub",
          credits: 1,
          description:
            "In this course, most weeks students will read a particular research paper from the leading conference in Human-Computer Interaction, CHI2019, prepare in some way, and then participate in an in-class discussion. During the discussion, the key elements of HCI mentioned in the paper will be highlighted, and things like potential follow-up project ideas will be explored.",
          syllabus: "./assets/syllabi/F19/CMSC388L_F19.pdf",
          website: null,
        },
        {
          id: 68,
          department: "CMSC",
          number: "388M",
          title: "Introduction to Mobile XR",
          facilitators: [
            { name: "Sahil Mayenkar", email: "sahil.mayenkar@gmail.com" },
            { name: "Joseph Feldmann", email: "josfeldmann@gmail.com" },
          ],
          advisor: "Roger Eastman",
          credits: 1,
          description: "Students will explore the basics of smartphone-based augmented and virtual reality. Focus is placed on development of XR apps with Unity as well as the hardware, mathematics, physics, algorithms, best practices, and principles that make immersive experiences possible.",
          syllabus: "./assets/syllabi/F19/CMSC388M_F19.pdf",
          website: null,
        },
        {
          id: 69,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [{ name: "Camille Stacho", email: "camstach@gmail.com" }],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kspring19",
          website: null,
        },
        {
          id: 70,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Allen Cheng", email: "ac@allencheng.me" },
            { name: "Andrew Witten", email: null },
            { name: "Dhruv Mehta", email: "dhruvnm@umd.edu" },
            { name: "Kusal De Alwis", email: "kdealwis@umd.edu" },
            { name: "Lauren Kosub", email: null },
            { name: "Omkar Konaraddi", email: null },
            { name: "Shubhankar Sachdev,", email: null },
          ],
          advisor: "Tom Goldstein",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Graphs and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          syllabus: "./assets/syllabi/F19/CMSC389O_F19.pdf",
          website: null,
        },
        {
          id: 71,
          department: "CMSC",
          number: "389R",
          title: "Introduction to Ethical Hacking",
          facilitators: [
            { name: "Michael Reininger", email: "michael@csec.umiacs.umd.edu" },
            { name: "Wesley  Weidenhamer", email: null },
          ],
          advisor: "Dave Levin",
          credits: 1,
          description: "An introduction to ethical hacking geared towards entering the competitive world of cybersecurity Capture the Flag (CTF) competitions. Applications to a career in digital forensics, penetration testing, cryptology, and secure software development.",
          syllabus: "./assets/syllabi/F19/CMSC389R_F19.pdf",
          website: null,
        },
        {
          id: 72,
          department: "CMSC",
          number: "389W",
          title: "Visualization Through Mathematica",
          facilitators: [
            { name: "Devan Tamot", email: "tamotd@gmail.com" },
            { name: "Vlad Dobrin", email: "vlad.a.dobrin@gmail.com" },
            { name: "Dan Zou", email: null },
          ],
          advisor: "William Goldman",
          credits: 1,
          description:
            "This course is designed to teach how to use the most common and useful features of Wolfram Mathematica, an extremely powerful technical computing system that can be used to model a wide range of problems. Students will also learn important techniques and styles that will equip them with a profound mastery of Mathematica.",
          syllabus: "./assets/syllabi/F19/CMSC389W_F19.pdf",
          website: null,
        },
        {
          id: 73,
          department: "MATH",
          number: "299C",
          title: "Mathematics & Classical Music",
          facilitators: [
            { name: "Siri Neerchal", email: "siri@terpmail.umd.edu" },
            { name: "Noah Whiteman", email: "whiteman@terpmail.umd.edu" },
          ],
          advisor: "Niranjan Ramachandran",
          credits: 1,
          description:
            "The aim of this course is to explore the historical discoveries in mathematics that have influenced Western classical music, as well as musical expressions of specific mathematical concepts. This course is not meant to be a rigorous introduction to music theory or mathematics; rather, it is focused on introducing students to classical music through mathematical ideas that appear in it. Students will also have an opportunity to explore mathematics through music in the form of a creative project.",
          syllabus: "./assets/syllabi/F19/MATH299C_F19.pdf",
          website: null,
        },
        {
          id: 74,
          department: "MATH",
          number: "299E",
          title: "The Mathematics of Erdos",
          facilitators: [
            { name: "Tanay Wakhare", email: "twakhare@gmail.com" },
            { name: "Aaron Benda", email: "abenda19@gmail.com" },
          ],
          advisor: "Larry Washington",
          credits: 1,
          description:
            "Combinatorics is the study of counting. Despite its deceptively simple name, it is one of the most active areas of research in modern mathematics. We discuss some of the basic ideas behind combinatorics, and their unexpected applications. The proofs we discuss are so elegant that Paul Erdos once said they are from “The Book” – God’s book of the most elegant proof of each theorem.",
          syllabus: "./assets/syllabi/F19/MATH299E_F19.pdf",
          website: null,
        },
        {
          id: 75,
          department: "MATH",
          number: "299T",
          title: "Poker Theory and Analysis",
          facilitators: [{ name: "John Horine", email: "jhorine@umd.edu" }],
          advisor: "Wiseley Wong",
          credits: 1,
          description:
            "The purpose of this course is to apply probability and statistical models to optimize strategy in the game of No Limit Texas Hold’em. First we will introduce the basics of poker and fundamental strategies and explore the statistical foundations that govern the game. Then we will expand upon this initial framework and study concepts such as range analysis, exploitative playstyles, and frequencies as they relate to optimal strategy. Finally we will conclude the course with a discussion and application of tournament play.",
          syllabus: "./assets/syllabi/F19/MATH299T_F19.pdf",
          website: null,
        },
        {
          id: 76,
          department: "BSCI",
          number: "238A",
          title: "Ornithology",
          facilitators: [{ name: "Madison Plunkert", email: "mplunker@terpmail.umd.edu" }],
          advisor: "Thomas Holtz",
          credits: 1,
          description:
            "This course serves as an introduction to the field of ornithology, including the identification, evolution, and ecology of birds, as well as the methods by which biologists study these topics. Homework consists mainly of field observation. BSCI160 is a recommended prerequisite, as this course builds on introductory ecology principles and an understanding of natural selection.",
          syllabus: "./assets/syllabi/F19/BSCI238A_F19.pdf",
          website: null,
        },
        {
          id: 77,
          department: "AASP",
          number: "299T",
          title: "Introduction to Twi",
          facilitators: [
            { name: "Maame Sapong", email: "asapong@terpmail.umd.edu" },
            { name: "Clydelle Agyei", email: "agyeiclydelle@gmail.com" },
          ],
          advisor: "George Kintiba",
          credits: 1,
          description:
            "Akwaaba (Welcome)! This is a language course designed to provide basic communicative competence in oral Twi for beginners. We will begin by introducing students to the Ghanaian culture. As we advance through the course, you will notice that we place less emphasis on formal grammatical instruction and more emphasis on everyday speech. This is because we want to prepare you for everyday conversation with family and friends. Through weekly lessons and activities, we hope to build your confidence when speaking Twi and also help you build a community with other students on campus.",
          syllabus: null,
          website: null,
        },
        {
          id: 78,
          department: "IDEA",
          number: "258D",
          title: "Explorations in Design",
          facilitators: [
            { name: "Cat Chiang", email: "catchiang02@gmail.com" },
            { name: "Clark Mitchell", email: "clarkmitchell@me.com" },
          ],
          advisor: "Brooke Smith",
          credits: 1,
          description:
            "“Explorations in Design” gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real world applications to incorporate design thinking into everyday life. We will explore how good and bad design plays a role in the mundane, from the way we order coffee to the logos you see to the signs that help you navigate (or get lost) on the metro.",
          syllabus: "./assets/syllabi/F19/IDEA258D_F19.pdf",
          website: null,
        },
        {
          id: 79,
          department: "IDEA",
          number: "258C",
          title: "Designing Ethical Campaigns",
          facilitators: [
            { name: "Andrew String", email: "​apstring@umd.edu​" },
            { name: "Alexis Amos", email: "​aamos1@umd.edu" },
          ],
          advisor: "Mira Azarm ",
          credits: 1,
          description:
            "This course will introduce students and immerse students in the methods of designing an ethical campaign. Through our campus, local, state, and national government, we have seen how dirty campaigns can get. Throughout the semester students will be able to apply their learnings to design a campaign that can make tangible differences, but stay true to their core values. We will explore the different functions and methods it takes to run an ethical campaign. Our assignments and activities will allow for students to have hands on engagement with stakeholders at UMD to create and test their own ethical campaign.",
          syllabus: "./assets/syllabi/F19/IDEA258C_F19.pdf",
          website: null,
        },
      ],
    },
    "spring 2020": {
      departments: ["CMSC", "MATH", "BSCI", "AASP", "IDEA", "BMGT", "BCHM"],
      classes: [
        {
          id: 80,
          department: "CMSC",
          number: "389E",
          title: "Digital Logic through Minecraft",
          facilitators: [
            { name: "Akilesh Praveen", email: "apraveen@umd.edu" },
            { name: "Ashwath Krishnan", email: "abkrish9@umd.edu" },
          ],
          advisor: "Alex Brassel",
          credits: 1,
          description:
            "In this class, we will explore the theory and applications of combinational and sequential circuits. All projects will be done using Minecraft’s Redstone. The course will cover basic gates to more advanced circuits including memory gates and large sequential circuits. The first half of the class will focus on com- binational logic gates, and the second half will introduce time-based sequential circuits. By the end of the class you should be able to complete the final project, which will be assigned for the last three classes.",
          syllabus: "./assets/syllabi/S20/CMSC389E_S20.pdf",
          website: null,
        },
        {
          id: 81,
          department: "CMSC",
          number: "388L",
          title: "Readings in HCI Research",
          facilitators: [
            { name: "Selena Alvarado", email: "selalvarado25@gmail.com" },
            { name: "Justin Goodman", email: "jugoodma@terpmail.umd.edu" },
          ],
          advisor: "Evan Golub",
          credits: 1,
          description:
            "In this course, most weeks students will read a particular research paper from the leading conference in Human-Computer Interaction, CHI2019, prepare in some way, and then participate in an in-class discussion. During the discussion, the key elements of HCI mentioned in the paper will be highlighted, and things like potential follow-up project ideas will be explored.",
          syllabus: "./assets/syllabi/S20/CMSC388L_S20.pdf",
          website: null,
        },
        {
          id: 82,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Robert Choe", email: "robert.d.choe67@gmail.com" },
            { name: "Camille Stacho", email: "camstach@gmail.com" },
            { name: "Jordan Mess", email: "jordanrmess@gmail.com" },
            { name: " Eli Schwelling", email: "eschwe333@gmail.com " },
          ],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus: "./assets/syllabi/S20/CMSC389K_S20.pdf",
          website: null,
        },
        {
          id: 83,
          department: "CMSC",
          number: "388J",
          title: "Building Secure Web Applications with Python and Flask",
          facilitators: [
            { name: "Yashas Lokesh", email: "yashloke@umd.edu" },
            { name: "Kenton Wong", email: "kdubbs0@umd.edu" },
          ],
          advisor: "Michael Marsh",
          credits: 1,
          description:
            "This course is an introduction to building secure, full-stack web applications with Python and Flask. We'll start with Python and Flask and transition to web application security, where we'll look at different types of security vulnerabilities and best practices to patch up these vulnerabilities in your own apps. Then, we'll go to building your own API and securely authenticating with it, and finish by showing you how you can deploy your web app!",
          syllabus: "./assets/syllabi/S20/CMSC388J_S20.pdf",
          website: null,
        },
        {
          id: 84,
          department: "CMSC",
          number: "388M",
          title: "Intro to Mobile XR",
          facilitators: [
            { name: "Sahil Mayenkar", email: "sahil.mayenkar@gmail.com" },
            { name: "Joseph Feldmann", email: "josfeldmann@gmail.com" },
          ],
          advisor: "Roger Eastman",
          credits: 1,
          description:
            "In this course, students will explore the basics of mobile augmented, mixed, and virtual reality. Focus will be placed on development of XR apps with Unity as well as on the hardware, mathematics, physics, algorithms, best practices, and principles that make immersive experiences possible. By the end of the course, students will have also gained experience working in a team to develop a real-world XR application of their own choosing.",
          syllabus: "./assets/syllabi/S20/CMSC388M_S20.pdf",
          website: null,
        },
        {
          id: 85,
          department: "CMSC",
          number: "389W",
          title: "Visualization in Mathematica",
          facilitators: [
            { name: "Devan Tamot", email: "tamotd@cs.umd.edu" },
            { name: "Dan Zou", email: "danzou12@cs.umd.edu" },
            { name: "Vlad Dobrin", email: "vdobrin@umd.edu" },
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "This course is designed to teach how to use the most common and useful features of Wolfram Mathatica, an extremely powerful technical computing system that can be used to model a wide range of problems. Students will also learn important techniques and styles that will equip them with a profound mastery of Mathematica. Plotting functions in several ways, making models that can be manipulated in real time by the user, and efficiently computing solutions to complicated equations are among the things we'll cover. We'll use these skills to model various structures in math, computer science and physics, and for the final project every student will pick something relevant to their major (or interest otherwise) to model, whether that be in physics, math, engineering, economics, or anything else mathematical in nature.",
          syllabus: "./assets/syllabi/S20/CMSC389W_S20.pdf",
          website: null,
        },
        {
          id: 86,
          department: "MATH",
          number: "299M",
          title: "Visualization in Mathematica",
          facilitators: [
            { name: "Devan Tamot", email: "tamotd@cs.umd.edu" },
            { name: "Dan Zou", email: "danzou12@cs.umd.edu" },
            { name: "Vlad Dobrin", email: "vdobrin@umd.edu" },
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "This course is designed to teach how to use the most common and useful features of Wolfram Mathatica, an extremely powerful technical computing system that can be used to model a wide range of problems. Students will also learn important techniques and styles that will equip them with a profound mastery of Mathematica. Plotting functions in several ways, making models that can be manipulated in real time by the user, and efficiently computing solutions to complicated equations are among the things we'll cover. We'll use these skills to model various structures in math, computer science and physics, and for the final project every student will pick something relevant to their major (or interest otherwise) to model, whether that be in physics, math, engineering, economics, or anything else mathematical in nature.",
          syllabus: "./assets/syllabi/S20/MATH299M_S20.pdf",
          website: null,
        },
        {
          id: 87,
          department: "CMSC",
          number: "389B",
          title: "Theory of Programming Languages",
          facilitators: [{ name: "Ian Sweet", email: "ins@cs.umd.edu" }],
          advisor: "Michael Hicks",
          credits: 1,
          description:
            "This course provides an introduction to type systems and the basic theory of programming languages. Part I of the course will focus on the Simply Typed Lambda Calculus (STLC), and then extend that language with features such as algebraic data types (ADTs), references, and exceptions. For each extension, we will revise a proof of type safety. Part II of the course will focus on 'fancy' type extensions to the STLC including parametric polymorphism, recursive types, and subtyping.",
          syllabus: "./assets/syllabi/S20/CMSC389B_S20.pdf",
          website: null,
        },
        {
          id: 88,
          department: "CMSC",
          number: "89D",
          title: "Ethics of Artifical Intelligence and Machine Learning",
          facilitators: [{ name: "Anthony Ostuni", email: "aostuni@umd.edu" }],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This discussion-based course will provide an introduction to the ethical issues related to artificial intelligence and machine learning. The first half of the semester will focus on concerns existing in the present day, such as bias and transparency. During the semester's second half, we will cover topics that will be increasingly important going forward, from consciousness to the future of labor.",
          syllabus: "https://github.com/aostuni/Ethics-of-AI-ML",
          website: "https://github.com/aostuni/Ethics-of-AI-ML",
        },
        {
          id: 89,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Kusal De Alwis", email: "kdealwis@umd.edu" },
            { name: "Andrew Witten", email: "awitten1@terpmail.umd.edu" },
            { name: "Shubhankar Sachdev", email: "ssachdev@umd.edu" },
            { name: "Dhruv Mehta", email: "dhruvnm@umd.edu" },
            { name: "Omkar Konaraddi", email: "okonarad@umd.edu" },
            { name: "Lauren Kosub", email: "lkosub@umd.edu" },
          ],
          advisor: "Tom Goldstein",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Graphs and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          syllabus: "./assets/syllabi/S20/CMSC389O_S20.pdf",
          website: null,
        },
        {
          id: 89,
          department: "MATH",
          number: "299F",
          title: "Philosophy & the Foundations of Mathematics",
          facilitators: [{ name: "Conner Gorman", email: "cgorman@umd.edu" }],
          advisor: "Roohollah Ebrahimian",
          credits: 1,
          description:
            "The goal of this course is two-fold. In the first half of the course, we will introduce students to three common philosophical treatments of mathematics: Logicism, Formalism, and Intuitionism. In the latter half, we will cover the efforts of mathematicians and philosophers throughout the late 19th and early 20th century to reduce mathematics to logic. In many ways, this effort culminated in 1931 with Kurt Gödel’s Incompleteness Theorems. Our course will conclude with the philosophical and mathematical implications of the Incompleteness Theorems. Some familiarity with higher-level math and comfort with elementary logic is strongly recommended.",
          syllabus: "./assets/syllabi/S20/MATH299F_S20.pdf",
          website: null,
        },
        {
          id: 90,
          department: "MATH",
          number: "299T",
          title: "Poker Theory and Analytics",
          facilitators: [{ name: "John Horine", email: "jhorine@outlook.com" }],
          advisor: "Wiseley Wong",
          credits: 1,
          description:
            "The purpose of this course is to apply probability and statistical models to optimize strategy in the game of No Limit Texas Hold’em. First we will introduce the basics of poker and fundamental strategies and explore the statistical foundations that govern the game. Then we will expand upon this initial framework and study concepts such as range analysis, exploitative playstyles, and frequencies as they relate to optimal strategy. Finally we will conclude the course with a discussion and application of tournament play.",
          syllabus: null,
          website: null,
        },
        {
          id: 91,
          department: "MATH",
          number: "299C",
          title: "Mathematics & Classical Music",
          facilitators: [
            { name: "Noah Whiteman", email: "whiteman@terpmail.umd.edu" },
            { name: "Jeffrey Wack", email: "jwack@terpmail.umd.edu" },
          ],
          advisor: "Niranjan Ramachandran",
          credits: 1,
          description:
            "The aim of this course is to explore the historical discoveries in mathematics that have influenced Western classical music, as well as musical expressions of specific mathematical concepts. This course is not meant to be a rigorous introduction to music theory or mathematics; rather, it is focused on introducing students to classical music through mathematical ideas that appear in it. Students will also have an opportunity to explore mathematics through music in the form of a creative project.",
          syllabus: "./assets/syllabi/S20/MATH299C_S20.pdf",
          website: null,
        },
        {
          id: 92,
          department: "BMGT",
          number: "299B",
          title: "Applied Cloud Computing in Information Systems",
          facilitators: [
            { name: "Graham Schuckman", email: "gschuckm@terpmail.umd.edu" },
            { name: "Nicholas Summers", email: "nsummer2@terpmail.umd.edu" },
          ],
          advisor: "Louiqa Raschid, Gorkem Ozer",
          credits: 1,
          description:
            "Cloud computing has become ubiquitous over the last few years. The demand for big data platforms and flexible computational resources has made it important for organizations to build upon cloud computing solutions. This course will explore the fundamentals of cloud computing, and review its adoption within an organizational setting. We will cover topics such as data storage, cloud security, data availability and more.",
          syllabus: "./assets/syllabi/S20/BMGT299B_S20.pdf",
          website: null,
        },
        {
          id: 93,
          department: "IDEA",
          number: "258D",
          title: "Explorations in Design",
          facilitators: [
            { name: "Clark Mitchell", email: "clarkmitchell@me.com" },
            { name: "Cat Chiang", email: "catchiang02@gmail.com" },
          ],
          advisor: "Erica Estrada-Liou",
          credits: 1,
          description:
            "“Explorations in Design” gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real world applications to incorporate design thinking into everyday life. We will explore how good and bad design plays a role in the mundane, from the way we order coffee to the logos you see to the signs that help you navigate (or get lost) on the metro.",
          syllabus: "./assets/syllabi/S20/IDEA258D_S20.pdf",
          website: null,
        },
        {
          id: 94,
          department: "IDEA",
          number: "258C",
          title: "Designing Ethical Campaigns",
          facilitators: [
            { name: "Andrew String", email: "​apstring@umd.edu​" },
            { name: "Alexis Amos", email: "aamos1@umd.edu" },
          ],
          advisor: "Mira Azarm",
          credits: 1,
          description:
            "This course will introduce students and immerse students in the methods of designing an ethical campaign. Through our campus, local, state, and national government, we have seen how dirty campaigns can get. Throughout the semester students will be able to apply their learnings to design a campaign that can make tangible differences, but stay true to their core values. We will explore the different functions and methods it takes to run an ethical campaign. Our assignments and activities will allow for students to have hands on engagement with stakeholders at UMD to create and test their own ethical campaign.",
          syllabus: "./assets/syllabi/S20/IDEA258C_S20.pdf",
          website: "https://designingethicalcampaigns.splashthat.com/",
        },
        {
          id: 95,
          department: "BSCI",
          number: "238B",
          title: "Astrobiology: Abiogenesis (the Origin of Life) and Early Life",
          facilitators: [{ name: "Noah Katz", email: "​nkatz19@gmail.com​" }],
          advisor: "Charles Delwiche",
          credits: 1,
          description:
            "Students are provided with an immersive and wide spanning introduction to the topic of abiogenesis (the origin of life) and the background necessary to understand how it could have happened. It is intended to be taken by students with a strong background in the natural sciences.",
          syllabus: "./assets/syllabi/S20/BSCI238B_S20.pdf",
          website: null,
        },
        {
          id: 96,
          department: "BCHM",
          number: "111Y",
          title: "BrewMD",
          facilitators: [
            { name: "Gilad Hampel", email: "​ghampel@terpmail.umd.edu​" },
            { name: "William Ryba", email: "wryba@terpmail.umd.edu" },
          ],
          advisor: "Lee Friedman",
          credits: 1,
          description:
            "This course is for those interested in learning how to brew. We will discuss the theory behind brewing alcohol, the mechanisms that govern the process of yeast fermentation, and the proper techniques for applying that knowledge to produce alcoholic/fermented beverages in a safe, sterile, and efficient manner. This course will delve into the history of brewing on the planet, which several historians have stated is the reason for the development of stationary cultures. We will delve into the evolution of the modern brewing industry, from home breweries to multinational brewing corporations. This course will look into the complex distribution networkrequired to market the brewed products globally. Ultimately we will apply the knowledge taught in this class to brew mead, beer, and cider in a safe sterile setting.",
          syllabus: "./assets/syllabi/S20/BCHM111Y_S20.pdf",
          website: null,
        },
      ],
    },
    "fall 2020": {
      departments: ["CMSC", "MATH", "BMGT", "IDEA"],
      classes: [
        {
          id: 97,
          department: "BMGT",
          number: "299B",
          title: "Applied Cloud Computing in Information Systems",
          facilitators: [
            { name: "Graham Schuckman", email: "gschuckm@terpmail.umd.edu" },
            { name: "Nicholas Summers", email: "nsummer2@terpmail.umd.edu" },
          ],
          advisor: "Louiqa Raschid, Gorkem Ozer",
          credits: 1,
          description:
            "Cloud computing has become ubiquitous over the last few years. The demand for big data platforms and flexible computational resources has made it important for organizations to build upon cloud computing solutions. This course will explore the fundamentals of cloud computing, and review its adoption within an organizational setting. We will cover topics such as data storage, cloud security, data availability and more.",
          syllabus: "./assets/syllabi/F20/BMGT299B_F20.pdf",
          website: null,
        },
        {
          id: 98,
          department: "CMSC",
          number: "388J",
          title: "Building Secure Web Applications with Python and Flask",
          facilitators: [
            { name: "Yashas Lokesh", email: "yashloke@umd.edu" },
            { name: "Kenton Wong", email: "kdubbs0@umd.edu" },
          ],
          advisor: "Michael Marsh",
          credits: 1,
          description:
            "This course is an introduction to building secure, full-stack web applications with Python and Flask. We'll start with Python and Flask and transition to web application security, where we'll look at different types of security vulnerabilities and best practices to patch up these vulnerabilities in your own apps. Then, we'll go to building your own API and securely authenticating with it, and finish by showing you how you can deploy your web app!",
          syllabus: "./assets/syllabi/F20/CMSC388J_F20.pdf",
          website: null,
        },
        {
          id: 99,
          department: "CMSC",
          number: "389A",
          title: "Law and Computer Science",
          facilitators: [{ name: "Yaelle Goldschlag", email: "ygoldsch@umd.edu" }],
          advisor: "Neil Spring",
          credits: 1,
          description:
            "Technology touches every aspect of our lives, accomplishing old tasks in new ways as well as creating entirely new industries. The legal system is entering a period of profound transformation brought on by these new technologies. The course will engage with two complementary questions: How is digital technology being deployed in key areas of legal work such as contracting and dispute resolution? How should current legal doctrine be applied to new technologies? The structure of the course involves weekly readings and discussions as well as four essays throughout the course and a semester-long project building a service on top of a smart contract. The readings and essays will enable students to gain a deep understanding and think critically about current issues at the intersection of law and computer science. The project will encourage students to think creatively about societal needs and their legal and technical solutions, and to gain experience with smart contracts as well as thinking concurrently about technical challenges and legal considerations.",
          syllabus: "./assets/syllabi/F20/CMSC389A_F20.pdf",
          website: null,
        },
        {
          id: 100,
          department: "CMSC",
          number: "389B",
          title: "A Tour of Programming Languages",
          facilitators: [
            { name: "Justin Goodman", email: "jugoodma@terpmail.umd.edu" },
            { name: "Clifford Bakalian", email: "cliffbakalian@gmail.com" },
          ],
          advisor: "David Van Horn",
          credits: 1,
          description: "We will examine various programming languages to gain a better understanding of PL design. Over the semester, students will complete a handful of programming projects to gain experience in uncommon programming paradigms.",
          syllabus: "./assets/syllabi/F20/CMSC389B_F20.pdf",
          website: null,
        },
        {
          id: 101,
          department: "CMSC",
          number: "389E",
          title: "Digital Logic Design Through Minecraft",
          facilitators: [
            { name: "Akilesh Praveen", email: "apraveen@umd.edu" },
            { name: "Ashwath Krishnan", email: "abkrish9@umd.edu" },
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "In this class, we will explore the theory and applications of combinational and sequential circuits. All projects will be done using Minecraft’s Redstone. The course will cover basic gates to more advanced circuits including memory gates and large sequential circuits. The first half of the class will focus on com- binational logic gates, and the second half will introduce time-based sequential circuits. By the end of the class you should be able to complete the final project, which will be assigned for the last three classes.",
          syllabus: "./assets/syllabi/F20/CMSC389E_F20.pdf",
          website: null,
        },
        {
          id: 102,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Dhruv Mehta", email: "dhruvnm@umd.edu" },
            { name: "Naveen Raman", email: "nav.j.raman@gmail.com" },
          ],
          advisor: "Tom Goldstein",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Graphs and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          syllabus: "./assets/syllabi/F20/CMSC389O_F20.pdf",
          website: null,
        },
        {
          id: 103,
          department: "CMSC",
          number: "389P",
          title: "Mastering the PM Interview",
          facilitators: [
            { name: "Srivarshini Parameswaren", email: "srivparam17@gmail.com" },
            { name: "Desiree Abrokwa", email: "dabrokw1@umd.edu" },
          ],
          advisor: "Michelle Mazurek",
          credits: 1,
          description:
            "Our course is geared towards getting students ready for PM interviews in the technology industry. The class will be a combination of lectures and in-class activities that will provide hands-on practice for PM roles. We will begin with interview questions involving behavioral and technical concepts, and transition to more complex PM-specific topics including product design, analytical, and case questions.",
          syllabus: "./assets/syllabi/F20/CMSC389P_F20.pdf",
          website: null,
        },
        {
          id: 104,
          department: "CMSC",
          number: "389V",
          title: "Ethics of Artificial Intelligence and Machine Learning",
          facilitators: [{ name: "Anthony Ostuni", email: "anthonyjostuni@gmail.com" }],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This discussion-based course will provide an introduction to the ethical issues related to artificial intelligence and machine learning. The first half of the semester will focus on concerns existing in the present day, such as bias and transparency. During the semester's second half, we will cover topics that will be increasingly important going forward, from consciousness to the future of labor.",
          syllabus: "./assets/syllabi/F20/CMSC389V_F20.pdf",
          website: null,
        },
        {
          id: 105,
          department: "CMSC",
          number: "389W",
          title: "Visualization in Mathematica",
          facilitators: [
            { name: "Devan Tamot", email: "tamotd@cs.umd.edu" },
            { name: "Vlad Dobrin", email: "vdobrin@cs.umd.edu" },
            { name: "Dan Zou", email: "danzou12@cs.umd.edu" },
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "This course is designed to teach how to use the most common and useful features of Wolfram Mathatica, an extremely powerful technical computing system that can be used to model a wide range of problems. Students will also learn important techniques and styles that will equip them with a profound mastery of Mathematica. Plotting functions in several ways, making models that can be manipulated in real time by the user, and efficiently computing solutions to complicated equations are among the things we'll cover. We'll use these skills to model various structures in math, computer science and physics, and for the final project every student will pick something relevant to their major (or interest otherwise) to model, whether that be in physics, math, engineering, economics, or anything else mathematical in nature.",
          syllabus: "./assets/syllabi/F20/CMSC389W_MATH299M_F20.pdf",
          website: null,
        },
        {
          id: 106,
          department: "MATH",
          number: "299M",
          title: "Visualization in Mathematica",
          facilitators: [
            { name: "Devan Tamot", email: "tamotd@cs.umd.edu" },
            { name: "Vlad Dobrin", email: "vdobrin@cs.umd.edu" },
            { name: "Dan Zou", email: "danzou12@cs.umd.edu" },
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "This course is designed to teach how to use the most common and useful features of Wolfram Mathatica, an extremely powerful technical computing system that can be used to model a wide range of problems. Students will also learn important techniques and styles that will equip them with a profound mastery of Mathematica. Plotting functions in several ways, making models that can be manipulated in real time by the user, and efficiently computing solutions to complicated equations are among the things we'll cover. We'll use these skills to model various structures in math, computer science and physics, and for the final project every student will pick something relevant to their major (or interest otherwise) to model, whether that be in physics, math, engineering, economics, or anything else mathematical in nature.",
          syllabus: "./assets/syllabi/F20/CMSC389W_MATH299M_F20.pdf",
          website: null,
        },
        {
          id: 107,
          department: "IDEA",
          number: "258C",
          title: "Special Topics in Innovation; Designing Ethical Campaigns",
          facilitators: [
            { name: "Caroline Marr", email: "" },
            { name: "Michael Mareno", email: "" },
          ],
          advisor: "Mira Azarm",
          credits: 1,
          description:
            "This course will introduce students to and immerse them in the methods running an ethical campaign. Through our campus, local, state, national government, we have seen how dirty politics can get. Throughout the semester students will be able to apply their learnings to design a campaign that can make tangible differences, but stay true to their core values. We will explore the different functions and methods it takes to run an ethical campaign. Our assignments and activities will allow for students to have hands-on engagement with stakeholders at UMD to create and test their own ethical campaign.",
          syllabus: null,
          website: null,
        },
        {
          id: 108,
          department: "IDEA",
          number: "258D",
          title: "Special Topics in Innovation; Explorations in Design",
          facilitators: [
            { name: "Ilana Pelzman-Kern", email: "" },
            { name: "Paloma Zagarra", email: "" },
          ],
          advisor: "Brooke Smith",
          credits: 1,
          description:
            "'Explorations in Design' gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real world applications to incorporate design thinking into everyday life. By exploring each stage of the design process (from ideating to prototyping), students will develop a final project to pitch at the end of the semester.",
          syllabus: null,
          website: null,
        },
      ],
    },

    // -------------------------------------------------------------
    // BEGIN
    // FALL 2021
    // CATALOG
    // -------------------------------------------------------------

    "fall 2021": {
      departments: ["MATH", "CMSC", "IDEA", "INST"],
      classes: [
        {
          number: "389E",
          advisor: "Roger Eastman",
          facilitators: [
            {
              name: "Akilesh Praveen",
              email: "",
            },
            {
              name: " Dhanvee Ivaturi",
              email: "",
            },
          ],
          description:
            "Learn and apply key concepts from digital logic, discrete math, and computer systems while playing the hit sandbox videogame Minecraft! Students will create an ALU, ROM, RAM, Clocks, and more as they build out the final project: a fully functional 3-bit computer in Minecraft.",
          id: 123,
          title: "Digital Logic Design Through Minecraft",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "299J",
          advisor: "Wiseley Wong",
          facilitators: [
            {
              name: "Nathan Hayes",
              email: "",
            },
            {
              name: " Davin Park",
              email: "",
            },
          ],
          description: "Adjacency/Laplacian matrices of graphs, eigenvalues of these matrices, and related\ntheory. Applications to Kirchhoff\u2019s Matrix Theorem and the Sensitivity Conjecture.",
          id: 109,
          title: "Spectral Graph Theory and Applications",
          website: null,
          department: "MATH",
          credits: 1,
        },
        {
          number: "389O",
          advisor: "Tom Goldstein",
          facilitators: [
            {
              name: "Naveen Raman",
              email: "",
            },
            {
              name: " William Liu",
              email: "",
            },
            {
              name: " Ethan Schaffer",
              email: "",
            },
            {
              name: " Franklin Yang",
              email: "",
            },
            {
              name: " Arjun Rajkumar",
              email: "",
            },
            {
              name: " Varun Singhai",
              email: "",
            },
            {
              name: " Sahir Mody",
              email: "",
            },
            {
              name: " Thomas Varano",
              email: "",
            },
            {
              name: " Patrick Tu",
              email: "",
            },
            {
              name: " Amanda Liu",
              email: "",
            },
          ],
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Graphs and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          id: 110,
          title: "The Coding Interview",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "388J",
          advisor: "Michael Marsh",
          facilitators: [
            {
              name: "Rahul Kiefer",
              email: "",
            },
            {
              name: " Rahul Narla",
              email: "",
            },
            {
              name: " Nikolay Pomytkin",
              email: "",
            },
          ],
          description:
            "This course is an introduction to building secure, full-stack web applications with Python and Flask. We'll start with Python and Flask and transition to web application security, where we'll look at different types of security vulnerabilities and best practices to patch up these vulnerabilities in your own apps. Then, we'll go to building your own API and securely authenticating with it, and finish by showing you how you can deploy your web app!",
          id: 111,
          title: "Building Secure Web Applications with Python and Flask",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "389G",
          advisor: "Garrett Vanhoy",
          facilitators: [
            {
              name: "Adithya Solai",
              email: "",
            },
            {
              name: " Ananya Ramkumar",
              email: "",
            },
          ],
          description:
            "In this course, students are given a scoped experience of a Software Engineering industry job and relevant tools/practices to accelerate acclimation to a future SWE Intern or Full-Time role. Topics/Skills covered include: Git, Code Reviews, AWS basics, Design Docs, unit testing, virtual machines, etc. Students will contribute to a complex code base to simulate designing, implementing, and testing new features in a professional setting.",
          id: 112,
          title: "What to do AFTER Landing an SWE Job",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "258U",
          advisor: "Mira Azarm",
          facilitators: [
            {
              name: "Katherine-Aria Close",
              email: "",
            },
          ],
          description:
            "\u201cUser Experience.\u201d What does that mean? It was a term coined by cognitive psychologist and designer Don Norman in the 1990s on the cusp of the new digital era; however, the field in practice has existed long before that. Unfortunately, due to its over use and misuse, the pure concept of UX has become lost in the weeds and details of all of its components and methods. In this course, we will take a deep look at the true meaning of UX as simply \u201ca user\u2019s experience\u201d and what that means for you as both a designer and a user. You will learn about core UX principles and methodologies from both an academic and practical standpoint and be challenged to apply what you learn in classroom workshops and assignments. Finally, you will be asked to think outside the bounds of technology to find innovative solutions to real world design problems.",
          id: 113,
          title: "Introduction to UI/UX Design",
          website: null,
          department: "IDEA",
          credits: 1,
        },
        {
          number: "238D",
          advisor: "Jonathan Dinman",
          facilitators: [
            {
              name: "Kevin Tu",
              email: "",
            },
          ],
          description:
            "This research methodology course is designed for students who are interested in gaining research experience and learning how common bench techniques work on the chemical level. We will also cover how to troubleshoot experiments when these techniques don't work. This is a blended learning course, with about 60% of lectures being online and 40% being in person. Oh, and you can create memes for extra credit too.",
          id: 114,
          title: "A Primer on Research Kits in the College of Life Sciences",
          website: null,
          department: "BSCI",
          credits: 1,
        },
        {
          number: "299G",
          advisor: "Tamas Darvas",
          facilitators: [
            {
              name: "Elliot Kienzle",
              email: "",
            },
          ],
          description:
            "This course is an introduction to differential geometry in physics using the language of differential forms. We will start with differential forms on R^n, seen through the lens of electrodynamics and culminating in the statement of maxwell\u2019s equations: d\u200b\u22c6dA=0. Then, we will develop classical mechanics on manifolds using symplectic geometry. Finally, we will discuss symmetry via group actions on manifolds, and prove Noether\u2019s theorem. This course will emphasize intuition, and the abstraction of that intuition into mathematical formalism.",
          id: 115,
          title: "Geometry in Physics",
          website: null,
          department: "MATH",
          credits: 1,
        },
        {
          number: "258C",
          advisor: "Mira Azarm",
          facilitators: [
            {
              name: "Cecilia Hu",
              email: "",
            },
            {
              name: " Pooja Dharmendran",
              email: "",
            },
          ],
          description:
            "Have you ever wondered how to strategically contribute to a cause you care about and how to convince others to care as well? Throughout the semester students will be able to apply their knowledge to designing a campaign that can make tangible differences, but stay true to their core values. We will explore various scenarios and hold discussions on ethics to help you better understand the different components of running an ethical campaign. Our assignments and activities will allow for studentsto have hands-on engagement with different target audiences at UMD to create and test their own ethical campaigns.",
          id: 116,
          title: "Designing Ethical Campaigns",
          website: null,
          department: "IDEA",
          credits: 1,
        },
        {
          number: "238F",
          advisor: "Daniel Butts",
          facilitators: [
            {
              name: "Ethan Cheng",
              email: "",
            },
          ],
          description:
            '"Introduction to Python Programming for Life Sciences" (BSCI238F) is a Fall 2021 one-credit, student-taught course (STIC) for undergraduate life sciences students with little-to-no programming experience who are looking to start building a strong computational foundation starting with Python, while exploring how programming is used in the broader context of the life sciences, research, and healthcare. Sign up at ter.ps/pythonSTIC to receive more info/updates about this STIC course, including the syllabus.',
          id: 117,
          title: "Introduction to Python Programming for Life Sciences",
          website: null,
          department: "BSCI",
          credits: 1,
        },
        {
          number: "389T",
          advisor: "Anwar Mamat",
          facilitators: [
            {
              name: "Sagar Saxena",
              email: "",
            },
            {
              name: " Nandhini Krishnan",
              email: "",
            },
            {
              name: " Sanjay Srikumar",
              email: "",
            },
          ],
          description:
            "Version control is an essential skill for developers to learn. Git and Github have become ubiquitous tools to version control, collaborate on, and share code. In this course, we will introduce fundamental concepts of the git architecture. We will work in an agile environment with basic to advanced commands to track changes, collaborate on shared codebases, automate testing and deployment pipelines, and enhance project management workflows. ",
          id: 118,
          title: "Introduction to Git, Github and Project Management",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "299B",
          advisor: "John Bono, Louiqa Raschid",
          facilitators: [
            {
              name: "Henry Stought",
              email: "",
            },
            {
              name: " Josh Lobo",
              email: "",
            },
          ],
          description:
            "Cloud computing has become ubiquitous over the last few years. The demand for big data platforms and flexible computational resources has made it important for organizations to build upon cloud computing solutions. This course will explore the fundamentals of cloud computing through Amazon Web Services. We will cover topics such as data storage, cloud security, data availability and more.",
          id: 119,
          title: "Applied Cloud Computing in Information Systems",
          website: null,
          department: "BMGT",
          credits: 1,
        },
        {
          number: "299Y",
          advisor: "Justin Wyss-Gallifent",
          facilitators: [
            {
              name: "Marie Brodsky",
              email: "",
            },
          ],
          description:
            "The goal of this course is to take complex and interesting ideas in math that are usually not covered in the school curriculum, and learn to present them in simple and surprising ways to young students. Some topics that we'll discuss ways to teach are those of combinatorics, logic puzzles, infinities, and fractals. The class is for those interested in recreational math, teaching, or both. ",
          id: 120,
          title: "Teaching Math to a Young Audience",
          website: null,
          department: "MATH",
          credits: 1,
        },
        {
          number: "258D",
          advisor: "Brooke Smith",
          facilitators: [
            {
              name: "Ilana Pelzman-Kern",
              email: "",
            },
            {
              name: " Sarah Flores",
              email: "",
            },
          ],
          description:
            '"Explorations in Design" gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real world applications to incorporate design thinking into everyday life. By exploring each stage of the design process (from ideating to prototyping), students will develop a final project to pitch at the end of the semester.',
          id: 121,
          title: "Explorations in Design",
          website: null,
          department: "IDEA",
          credits: 1,
        },
        {
          number: "388Y",
          advisor: "Michael Hicks",
          facilitators: [
            {
              name: "Guido Ambasz",
              email: "",
            },
          ],
          description:
            "This class will explore the history computer science from the perspective of the people that built it. We will look at the achievements of each generation, and see how they shaped the ones after them. We will see the developments since antiquity all the way to today, exploring a range of topics from theoretical computing, code-cracking, the Internet, A.I, Open Source, and more. This class is intended to give you a comprehensive view of the history of Computer Science, without too much focus on any specific topic.",
          id: 122,
          title: "History of Computer Science",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "388Z",
          advisor: "Michael Hicks",
          facilitators: [
            {
              name: "Dongze He",
              email: "",
            },
          ],
          description:
            "The Rust programming language eliminates serious classes of bugs compared to unsafe languages, such as C, while retaining high performance. However, the Rust language can be challenging to learn. In this course, students will learn how to program effectively in Rust. The course includes a project, in which students will work in small groups on projects of their choice.",
          id: 123,
          title: "Programming in Rust",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "388U",
          advisor: "Dave Levin",
          facilitators: [
            {
              name: "Alden Schmidt",
              email: "",
            },
            {
              name: "John (Vanya) Gorbachev",
              email: "",
            },
          ],
          description:
            "This hands-on course provides an introduction to ethical hacking that begins with a discussion on the ethics behind security research and progresses to topics including penetration testing, forensics, cryptography, reverse engineering, and exploitation. This course is also meant to introduce students to Capture-the-Flag (CTF) style cybersecurity challenges, encourages participation in the Cybersecurity Club at UMD, and prepares for CMSC414.",
          id: 124,
          title: "Introduction to Ethical Hacking (Hack the Class)",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "208L",
          advisor: "Donal Heidenblad",
          facilitators: [
            {
              name: "Shiv Patel",
              email: "",
            },
          ],
          description:
            "Whether working in Information Technology, Data Science, Networking, Cybersecurity, Business Analytics/Intelligence, or Human Computer Interaction (HCI), the command line is a powerful tool that is used in many professional settings. This course is intended for all students looking to build a better understanding of how to use the command line to efficiently interact with the computer’s file system, automate computer tasks, and more.",
          id: 125,
          title: "Linux Command Line Tools",
          website: null,
          department: "INST",
          credits: 1,
        },
        {
          number: "299I",
          advisor: "Richard Wentworth",
          facilitators: [
            {
              name: "Siddharth Taneja",
              email: "",
            },
          ],
          description:
            "The goal of this course is to give a basic introduction to category theory on it's own from a undergraduate perspective. We'll start with the definition of a category, universal properties , adjoints, and the connections to set theory. In the second part of the course we'll discuss representations, Yoneda's Theorem, limits, colimits, and pullbacks. In the final part of the course (time-permitting) we'll talk about some extensions and some student requested topics. I would recommend having a background in proofs (410, 403, or 405 are good prerequisites), but contact me if you have questions.",
          id: 126,
          title: "Introduction to Category Theory",
          website: null,
          department: "MATH",
          credits: 1,
        },
      ],
    },

    // -------------------------------------------------------------
    // BEGIN
    // SPRING 2022
    // CATALOG
    // -------------------------------------------------------------

    "spring 2022": {
      departments: ["MATH", "CMSC", "IDEA", "SOCY", "BMGT", "BSCI", "FMSC"],
      classes: [
        {
          number: "389E",
          advisor: "Roger Eastman",
          facilitators: [
            {
              name: "Aayush Nepal",
              email: "",
            },
            {
              name: " Jordan Marry",
              email: "",
            },
          ],
          description:
            "Learn and apply key concepts from digital logic, discrete math, and computer systems while playing the hit sandbox videogame Minecraft! Students will create an ALU, ROM, RAM, Clocks, and more as they build out the final project: a fully functional 3-bit computer in Minecraft.",
          id: 127,
          title: "Digital Logic Design Through Minecraft",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "299E",
          advisor: "Wiseley Wong",
          facilitators: [
            {
              name: "Nathan Hayes",
              email: "",
            },
            {
              name: " Eric Shen",
              email: "",
            },
          ],
          description:
            "Paul Erdős was one of the most famous and prolific mathematicians of the last century, notable for his talent for posing problems, his many collaborations, and his brilliant insight. In this course, we examine his most notable results, which primarily lie in number theory, combinatorics, graph theory, and probability. We will also examine his legacy, including the field of Ramsey theory which he founded, as well as the new techniques and open problems he has left behind.",
          id: 128,
          title: "The Mathematics of Erdos",
          website: null,
          department: "MATH",
          credits: 1,
        },
        {
          number: "389O",
          advisor: "Tom Goldstein",
          facilitators: [
            {
              name: " Naveen Raman",
              email: "",
            },
            {
              name: " Amanda Liu",
              email: "",
            },
            {
              name: " Arjun Rajkumar",
              email: "",
            },
            {
              name: " Franklin Yang",
              email: "",
            },
            {
              name: " Ethan Schaffer",
              email: "",
            },
            {
              name: " William Liu",
              email: "",
            },
            {
              name: " Sahir Mody",
              email: "",
            },
            {
              name: " Thomas Varano",
              email: "",
            },
            {
              name: " Patrick Tu",
              email: "",
            },
          ],
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Graphs and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          id: 129,
          title: "The Coding Interview",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "388J",
          advisor: "Michael Marsh",
          facilitators: [
            {
              name: "Vyoma Jani",
              email: "",
            },
            {
              name: " Nikolay Pomytkin",
              email: "",
            },
          ],
          description:
            "This course is an introduction to building secure, full-stack web applications with Python and Flask. We'll start with Python and Flask and transition to web application security, where we'll look at different types of security vulnerabilities and best practices to patch up these vulnerabilities in your own apps. Then, we'll go to building your own API and securely authenticating with it, and finish by showing you how you can deploy your web app!",
          id: 130,
          title: "Building Secure Web Applications with Python and Flask",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "389G",
          advisor: "Garrett Vanhoy",
          facilitators: [
            {
              name: "Adithya Solai",
              email: "",
            },
            {
              name: " Jack Zhao",
              email: "",
            },
            {
              name: " Siddharth Cherukupalli",
              email: "",
            },
          ],
          description:
            "In this course, students are given a scoped experience of a Software Engineering industry job and relevant tools/practices to accelerate acclimation to a future SWE Intern or Full-Time role. Topics/Skills covered include: Git, Code Reviews, AWS basics, Design Docs, unit testing, virtual machines, etc. Students will contribute to a complex code base to simulate designing, implementing, and testing new features in a professional setting.",
          id: 131,
          title: "What to do AFTER Landing an SWE Job",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "258U",
          advisor: "Mira Azarm",
          facilitators: [
            {
              name: "Katherine-Aria Close",
              email: "",
            },
          ],
          description:
            "\u201cUser Experience.\u201d What does that mean? It was a term coined by cognitive psychologist and designer Don Norman in the 1990s on the cusp of the new digital era; however, the field in practice has existed long before that. Unfortunately, due to its over use and misuse, the pure concept of UX has become lost in the weeds and details of all of its components and methods. In this course, we will take a deep look at the true meaning of UX as simply \u201ca user\u2019s experience\u201d and what that means for you as both a designer and a user. You will learn about core UX principles and methodologies from both an academic and practical standpoint and be challenged to apply what you learn in classroom workshops and assignments. Finally, you will be asked to think outside the bounds of technology to find innovative solutions to real world design problems.",
          id: 132,
          title: "Introduction to UI/UX Design",
          website: null,
          department: "IDEA",
          credits: 1,
        },
        {
          number: "238D",
          advisor: "Jonathan Dinman",
          facilitators: [
            {
              name: "Kevin Tu",
              email: "",
            },
          ],
          description:
            "This research methodology course is designed for students who are interested in gaining research experience and learning how common bench techniques work on the chemical level. We will also cover how to troubleshoot experiments when these techniques don't work. This is a blended learning course, with about 60% of lectures being online and 40% being in person. Oh, and you can create memes for extra credit too.",
          id: 133,
          title: "A Primer on Research Kits in the College of Life Sciences",
          website: null,
          department: "BSCI",
          credits: 1,
        },
        {
          number: "258C",
          advisor: "Mira Azarm",
          facilitators: [
            {
              name: "Cecilia Hu",
              email: "",
            },
            {
              name: " Pooja Dharmendran",
              email: "",
            },
          ],
          description:
            "Have you ever wondered how to strategically contribute to a cause you care about and how to convince others to care as well? Throughout the semester students will be able to apply their knowledge to designing a campaign that can make tangible differences, but stay true to their core values. We will explore various scenarios and hold discussions on ethics to help you better understand the different components of running an ethical campaign. Our assignments and activities will allow for studentsto have hands-on engagement with different target audiences at UMD to create and test their own ethical campaigns.",
          id: 134,
          title: "Designing Ethical Campaigns",
          website: null,
          department: "IDEA",
          credits: 1,
        },
        {
          number: "389T",
          advisor: "Cliff Bakalian",
          facilitators: [
            {
              name: "Sagar Saxena",
              email: "",
            },
            {
              name: " Nandhini Krishnan",
              email: "",
            },
          ],
          description:
            "Version control is an essential skill for developers to learn. Git and Github have become ubiquitous tools to version control, collaborate on, and share code. In this course, we will introduce fundamental concepts of the git architecture. We will work in an agile environment with basic to advanced commands to track changes, collaborate on shared codebases, automate testing and deployment pipelines, and enhance project management workflows. ",
          id: 135,
          title: "Introduction to Git, Github and Project Management",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "299B",
          advisor: "John Bono, Louiqa Raschid",
          facilitators: [
            {
              name: "Henry Stought",
              email: "",
            },
            {
              name: " Josh Lobo",
              email: "",
            },
          ],
          description:
            "Cloud computing has become ubiquitous over the last few years. The demand for big data platforms and flexible computational resources has made it important for organizations to build upon cloud computing solutions. This course will explore the fundamentals of cloud computing through Amazon Web Services. We will cover topics such as data storage, cloud security, data availability and more.",
          id: 136,
          title: "Applied Cloud Computing in Information Systems",
          website: null,
          department: "BMGT",
          credits: 1,
        },
        {
          number: "299Y",
          advisor: "Justin Wyss-Gallifent",
          facilitators: [
            {
              name: "Marie Brodsky",
              email: "",
            },
          ],
          description:
            "The goal of this course is to take complex and interesting ideas in math that are usually not covered in the school curriculum, and learn to present them in simple and surprising ways to young students. Some topics that we'll discuss ways to teach are those of combinatorics, logic puzzles, infinities, and fractals. The class is for those interested in recreational math, teaching, or both. ",
          id: 137,
          title: "Teaching Math to a Young Audience",
          website: null,
          department: "MATH",
          credits: 1,
        },
        {
          number: "258D",
          advisor: "Brooke Smith",
          facilitators: [
            {
              name: "Ilana Pelzman-Kern",
              email: "",
            },
            {
              name: " Sarah Flores",
              email: "",
            },
          ],
          description:
            '"Explorations in Design" gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real world applications to incorporate design thinking into everyday life. By exploring each stage of the design process (from ideating to prototyping), students will develop a final project to pitch at the end of the semester.',
          id: 138,
          title: "Explorations in Design",
          website: null,
          department: "IDEA",
          credits: 1,
        },
        {
          number: "388U",
          advisor: "Dave Levin",
          facilitators: [
            {
              name: "Alden Schmidt",
              email: "",
            },
            {
              name: "John (Vanya) Gorbachev",
              email: "",
            },
          ],
          description:
            "This hands-on course provides an introduction to ethical hacking that begins with a discussion on the ethics behind security research and progresses to topics including penetration testing, forensics, cryptography, reverse engineering, and exploitation. This course is also meant to introduce students to Capture-the-Flag (CTF) style cybersecurity challenges, encourages participation in the Cybersecurity Club at UMD, and prepares for CMSC414.",
          id: 139,
          title: "Introduction to Ethical Hacking (Hack the Class)",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "298C",
          advisor: "Joan Kahn",
          facilitators: [
            {
              name: "Jennifer Laila Mondle",
              email: "",
            },
          ],
          description:
            "A sociological exploration of current healthcare policies in relation to trends in health, illness and disease. This course will focus more broadly on the U.S. healthcare system, and students will explore contemporary trends in the sociodemographic determinants of health, with a particular focus on socioeconomic status, race/ethnicity and gender. Other discussion topics include approaching disparities in the prevalence of maternal mortality, HIV/AIDS, diabetes, and other conditions. We will discuss alternative policies to improve healthcare accessibility for vulnerable groups, with the social determinants of health in mind. This is an ideal course for those interested in a career in healthcare, policy advocacy, and/or law, but open to anyone with interest.",
          id: 140,
          title: "Sociological Perspectives on Healthcare Policy",
          website: null,
          department: "SOCY",
          credits: 1,
        },
        {
          number: "299C",
          advisor: "Niranjan Ramachandran",
          facilitators: [
            {
              name: "Jeffery Wack",
              email: "",
            },
            {
              name: "Noah Whiteman",
              email: "",
            },
          ],
          description:
            "The aim of this course is to explore the historical discoveries in mathematics that have influenced Western classical music, as well as musical expressions of specific mathematical concepts. This course is not meant to be a rigorous introduction to music theory or mathematics; rather, it is focused on introducing students to classical music through mathematical ideas that appear in it. Students will also have an opportunity to explore mathematics through music in the form of a creative project.",
          id: 141,
          title: "Mathematics & Classical Music",
          website: null,
          department: "MATH",
          credits: 1,
        },
        {
          number: "238G",
          advisor: "Brian Pierce",
          facilitators: [
            {
              name: "Spence Skylar Chan",
              email: "",
            },
          ],
          description:
            "This course will teach life science majors the basics of the Bash shell, scripting, and the command line environment. Students will learn about navigating the shell, using and combining commands, and basic scripting, all in the context of biologically relevant applications. No prior programming experience is assumed.",
          id: 142,
          title: "Introduction to Shell Scripting for the Life Sciences",
          website: null,
          department: "BSCI",
          credits: 1,
        },
        {
          number: "215",
          advisor: "Kerry Tripp",
          facilitators: [
            {
              name: "Brianna Hope Nabet",
              email: "",
            },
          ],
          description:
            "In this Student Initiated Course, students will examine what it means to grow up in the foster care system or to be an adopted member of a family. We will ask questions such as how this impacts mental health and later life outcomes. Your student instructor and faculty advisor will help you explore and critically think about issues surrounding these types of blended families, and the systems that surround them, in Maryland, nationally, and internationally. Students will examine and challenge the topics' laws and policies, including issues on LGBTQ, religious, and trans-racial adoption and the socioeconomic impacts of these systems on families. Students will examine their preconceived notions and contrast them with how these systems impact families. The class welcomes various guest speakers. Classes and activities will be discussion-based, allowing students to explore issues from ethical consideration and for possible life paths.",
          id: 143,
          title: "Foster Care and Adoption; Law, Policy, and Family",
          website: null,
          department: "FMSC",
          credits: 1,
        },
        {
          number: "389P",
          advisor: "Michelle Mazurek",
          facilitators: [
            {
              name: "Ben Lin",
              email: "",
            },
            {
              name: "Aadria Bagchi",
              email: "",
            },
          ],
          description: "Students are introduced to the tools, techniques, and resources to nail their PM (Product Management) interviews. We'll be providing hands-on practice with PM specific topics including product design, analytical, and case questions.",
          id: 144,
          title: "Mastering the PM Interview",
          website: null,
          department: "CMSC",
          credits: 1,
        },
        {
          number: "388X",
          advisor: "Leonidas Lampropoulos",
          facilitators: [
            {
              name: "Pierce Darragh",
              email: "",
            },
            {
              name: "Justin Frank",
              email: "",
            },
          ],
          description:
            "Introduction to Programming Language Theory seeks to introduce undergraduate students to the realm of programming languages research. During one part of the semester, we will cover well-known results in the literature by reading and discussing research papers (which we will teach you how to read). In the other part, we will explore language features through extensions to the lambda calculus — an important tool in programming language theory. These extensions will be exhibited through student homework, and will culminate in an end-of-semester final project.",
          id: 145,
          title: "Introduction to Programming Language Theory",
          website: null,
          department: "CMSC",
          credits: 2,
        },
        {
          number: "389F",
          advisor: "John Dickerson",
          facilitators: [
            {
              name: "Pranav Bharadwaj",
              email: "",
            },
            {
              name: " Vineeth Vajipey",
              email: "",
            },
          ],
          description:
            "This course provides an overview of the key concepts and algorithms of Reinforcement Learning, an area of artificial intelligence research responsible for recent achievements such as AlphaGo and robotic control. Students will learn topics such as Markov decision processes, value and policy iteration, Q Learning, Proximal Policy Optimization, etc.",
          id: 146,
          title: "Reinforcement Learning",
          website: null,
          department: "CMSC",
          credits: 1,
        },
      ],
    },

    // -------------------------------------------------------------
    // BEGIN
    // FALL 2022
    // CATALOG
    // -------------------------------------------------------------

    "fall 2022": {
      departments: ["MATH", "CMSC", "IDEA", "BSCI", "GVPT"],
      classes: [
        {
          number: "258A",
          advisor: "Christina Hnatov, Brooke Smith, Rachel Thompson, Mira Azarm",
          facilitators: [
            {
              name: "Claire Knorr",
              email: "clairepknorr@gmail.com",
            },
          ],
          description:
            "This introductory course allows students to try on the behaviors of a creative problem-solver, leveraging the methods and tools of design thinking, a human-centered innovation process. This is a highly experiential, often experimental course. All majors are encouraged to enroll.",
          id: 147,
          title: "Innovation Tools & Mindsets",
          website: null,
          department: "IDEA",
          credits: 1,
        },

        {
          number: "258D",
          advisor: "Brooke Smith",
          facilitators: [
            {
              name: "Paula Shin",
              email: "paulashin15@gmail.com",
            },
            {
              name: " Grace Suhyun Lee",
              email: "glee1236@terpmail.umd.edu",
            },
          ],
          description:
            '"Explorations in Design" gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real world applications to incorporate design thinking into everyday life. By exploring each stage of the design process (from ideating to prototyping), students will develop a final project to pitch at the end of the semester.',
          id: 148,
          title: "Explorations in Design",
          website: null,
          department: "IDEA",
          credits: 1,
        },

        {
          number: "258U",
          advisor: "Mira Azarm",
          facilitators: [
            {
              name: "Kat Close",
              email: "kclose1@terpmail.umd.edu",
            },
          ],
          description:
            'What does "User Experience" mean? It was a term coined by cognitive psychologist and designer Don Norman in the 1990s on the cusp of the new digital era; however, the field in practice has existed long before that. Unfortunately, due to its over use and misuse, the pure concept of UX has become lost in the weeds and details of all of its components and methods. In this course, we will take a deep look at the true meaning of UX as simply a user\'s experience and what that means for you as both a designer and a user. You will learn about core UX principles and methodologies from both an academic and practical standpoint and be challenged to apply what you learn in classroom workshops and assignments. Finally, you will be asked to think both inside and outside the bounds of technology to find innovative solutions to real world design problems.',
          id: 149,
          title: "Introduction to UI/UX Design",
          website: "go.umd.edu/idea258u",
          department: "IDEA",
          credits: 1,
        },

        {
          number: "299R",
          advisor: "Terence Long",
          facilitators: [
            {
              name: "Samuel Lidz",
              email: "slidz@terpmail.umd.edu",
            },
            {
              name: " Ezra Aylaian",
              email: "daylaian@terpmail.umd.edu",
            },
          ],
          /* updated description */
          description:
            "Do mathematical objects exist? If so, in what way, and how are we allowed to reason about them? How do our answers to these questions affect our mathematics? Mathematicians have been arguing over the mathematical and philosophical foundations of math for as long as math has been around. We will go through ideas largely in their historical order of development, beginning with Platonism, then proceeding to the Formalism of Hilbert, the Constructivism of Bishop, and finishing with a look at various modern perspectives. Out of this debate, one thing is clear: our philosophical tastes inform which axioms we should accept (if any), what math we should do, and how we are allowed to do it. In this course, we will overview several of the prevailing philosophical viewpoints that have emerged. These perspectives are often at odds with each other, so this course is designed to help you develop your own perspective about these topics. This course will require both mathematical and philosophical discussion, as the philosophy will inform the mathematical systems we develop, and the consequences of the mathematical systems we develop will in turn inform our philosophy. We will be talking about the math arising from philosophical ideas as much as we will be talking about the philosophical ideas themselves.",
          id: 150,
          title: "Ripping Logic at the Seams: The Philosophical Foundations of Math",
          website: null,
          department: "MATH",
          credits: 1,
        },

        {
          number: "299W",
          advisor: "Niranjan Ramachandran",
          facilitators: [
            {
              name: "Karthik Sellakumaran Latha",
              email: "karthiks@terpmail.umd.edu",
            },
            {
              name: " Rae Wu",
              email: "rwuu@terpmail.umd.edu",
            },
          ],
          /* description needed? */
          description: "",
          id: 151,
          title: "Mathematics and Art",
          website: null,
          department: "MATH",
          credits: 1,
        },

        {
          number: "238D",
          advisor: "Dr. Jonathan Dinman, Dr. David Straney",
          facilitators: [
            {
              name: "Kevin Tu",
              email: "ktu@umd.edu",
            },
          ],
          /* updated description */
          description: "This course will introduce students to common research techniques found in molecular biology labs, how they work, and how to troubleshoot them. Lecture topics will focus on the biochemical and biophysical theory behind techniques rather than hands-on experience.",
          id: 152,
          title: "A Primer on Research Kits in the Life Sciences",
          website: null,
          department: "BSCI",
          credits: 1,
        },

        {
          number: "238F",
          advisor: "Dr. Daniel Butts",
          facilitators: [
            {
              name: "Rakshita Balaji",
              email: "rbalaji@terpmail.umd.edu",
            },
            {
              name: " Garmani Thein",
              email: "gthein@terpmail.umd.edu",
            },
          ],
          /* updated description */
          description: "This course is for the undergraduate students with little-to-no programming experience who are looking to start building a strong computational foundation in Python while exploring how programming is used in the broader context of the life sciences.",
          id: 153,
          title: "Introduction to Python Programming for the Life Sciences",
          website: null,
          department: "BSCI",
          credits: 1,
        },

        {
          number: "388J",
          advisor: "Michael Marsh",
          facilitators: [
            {
              name: "Shrikar Vasisht",
              email: "svasisht@terpmail.umd.edu",
            },
            {
              name: " Pace Ockerman",
              email: "pace@terpmail.umd.edu",
            },
            {
              name: " Alex Liu",
              email: "aliu4131@terpmail.umd.edu",
            },
          ],
          /* description is carried over from spring 2022 */
          description:
            "This course is an introduction to building secure, full-stack web applications with Python and Flask. We'll start with Python and Flask and transition to web application security, where we'll look at different types of security vulnerabilities and best practices to patch up these vulnerabilities in your own apps. Then, we'll go to building your own API and securely authenticating with it, and finish by showing you how you can deploy your web app!",
          id: 154,
          title: "Building Secure Web Applications with Python and Flask",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389P",
          advisor: "Michelle Mazurek, Huaishu Peng",
          facilitators: [
            {
              name: "Aadria Bagchi",
              email: "abagchi@terpmail.umd.edu",
            },
          ],
          /* description is carried over from spring 2022 */
          description: "Students are introduced to the tools, techniques, and resources to nail their PM (Product Management) interviews. We'll be providing hands-on practice with PM specific topics including product design, analytical, and case questions.",
          id: 155,
          title: "Mastering the PM Interview",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "388U",
          advisor: "Dave Levin",
          facilitators: [
            {
              name: "John Gorbachev",
              email: "jgorbach@umd.edu",
            },
            {
              name: " Alden Schmidt",
              email: "schmidta@umd.edu",
            },
          ],
          /* description is carried over from spring 2022 */
          description:
            "This hands-on course provides an introduction to ethical hacking that begins with a discussion on the ethics behind security research and progresses to topics including penetration testing, forensics, cryptography, reverse engineering, and exploitation. This course is also meant to introduce students to Capture-the-Flag (CTF) style cybersecurity challenges, encourages participation in the Cybersecurity Club at UMD, and prepares for CMSC414.",
          id: 156,
          title: "Introduction to Ethical Hacking",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389O",
          advisor: "Thomas Goldstein",
          facilitators: [
            {
              name: "Vidushi Vahist",
              email: "vvashist@terpmail.umd.edu",
            },
            {
              name: " Abhinav Vedmala",
              email: "avedmala@terpmail.umd.edu",
            },
            {
              name: " Elliot Ruebush",
              email: "eruebush@terpmail.umd.edu",
            },
            {
              name: " Michael Mannino",
              email: "mmannino@terpmail.umd.edu",
            },
            {
              name: " Stephanie Wang",
              email: "swang115@terpmail.umd.edu",
            },
            {
              name: " Eugene Domrachev",
              email: "edomrach@terpmail.umd.edu",
            },
            {
              name: " Andrew Yuan",
              email: "ayuan124@terpmail.umd.edu",
            },
            {
              name: " Harleen Kaur",
              email: "hkaur@terpmail.umd.edu",
            },
            {
              name: " Jason Devers",
              email: "jdevers1@terpmail.umd.edu",
            },
            {
              name: " Kevin Tang",
              email: "ktang124@terpmail.umd.edu",
            },
          ],
          /* description is carried over from spring 2022 */
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Graphs and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          id: 157,
          title: "The Coding Interview",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389G",
          advisor: "Garrett Vanhoy",
          facilitators: [
            {
              name: "Siddharth Cherukupalli",
              email: "scheruku@terpmail.umd.edu",
            },
          ],
          /* description is carried over from spring 2022 */
          description:
            "In this course, students are given a scoped experience of a Software Engineering industry job and relevant tools/practices to accelerate acclimation to a future SWE Intern or Full-Time role. Topics/Skills covered include: Git, Code Reviews, AWS basics, Design Docs, unit testing, virtual machines, etc. Students will contribute to a complex code base to simulate designing, implementing, and testing new features in a professional setting.",
          id: 158,
          title: "What to do After Landing a SWE Job",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389T",
          advisor: "Cliff Bakalian",
          facilitators: [
            {
              name: "Nandhini Krishnan",
              email: "nankri3@terpmail.umd.edu",
            },
            {
              name: " Sagar Saxena",
              email: "ssaxena1@terpmail.umd.edu",
            },
          ],
          /* description is carried over from spring 2022 */
          description:
            "Version control is an essential skill for developers to learn. Git and Github have become ubiquitous tools to version control, collaborate on, and share code. In this course, we will introduce fundamental concepts of the git architecture. We will work in an agile environment with basic to advanced commands to track changes, collaborate on shared codebases, automate testing and deployment pipelines, and enhance project management workflows.",
          id: 159,
          title: "Introduction to Git, Github and Project Management",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398D",
          advisor: "Wiseley Wong",
          facilitators: [
            {
              name: "Bilal Mohammed",
              email: "bmohamm7@terpmail.umd.edu",
            },
          ],
          /* description needed? */
          description: "",
          id: 160,
          title: "Introduction to Artificial Intelligence in Healthcare",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398E",
          advisor: "Justin Wyss Gallifent",
          facilitators: [
            {
              name: "Sneha Sureshanand",
              email: "ssuresha@terpmail.umd.edu",
            },
            {
              name: " Ananya Vepa",
              email: "avepa@terpmail.umd.edu",
            },
          ],
          /* description needed? */
          description: "",
          id: 161,
          title: "Essential Data Science Skills & Techniques",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398F",
          advisor: "Jonathan Katz",
          facilitators: [
            {
              name: "Om Pathak",
              email: "ompathak@terpmail.umd.edu",
            },
            {
              name: " Nikhil Ghate",
              email: "sdigamba@terpmail.umd.edu",
            },
            {
              name: " Soham Digambar",
              email: "nghate@terpmail.umd.edu",
            },
          ],
          /* description needed? */
          description: "",
          id: 162,
          title: "Introduction to Blockchain and Cryptocurrency",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "289U",
          advisor: "",
          facilitators: [
            {
              name: "Jacob Toll",
              email: "",
            },
          ],
          description: "An introduction to various forms of political comedy and its sociopolitical impact in the past and present.",
          id: 163,
          title: "Political Comedy: How Laughter Shapes Political Discourse",
          website: null,
          department: "GVPT",
          credits: 1,
        },
      ],
    },

    // -------------------------------------------------------------
    // BEGIN
    // SPRING 2023
    // CATALOG
    // -------------------------------------------------------------

    "spring 2023": {
      departments: ["BMGT", "BSCI", "CMSC", "GVPT", "IDEA", "IMDM", "MATH", "MUSC", "HLTH"],
      classes: [
        {
          number: "388J",
          advisor: "Michael Marsh",
          facilitators: [
            {
              name: "Shrikar Vasisht",
              email: "svasisht@terpmail.umd.edu",
            },
            {
              name: " Pace Ockerman",
              email: "pace@terpmail.umd.edu",
            },
            {
              name: " Alex Liu",
              email: "aliu4131@terpmail.umd.edu",
            },
          ],
          description:
            "This course is an introduction to building secure, full-stack web applications with Python and Flask. We'll start with Python and Flask and transition to web application security, where we'll look at different types of security vulnerabilities and best practices to patch up these vulnerabilities in your own apps. Then, we'll go to building your own API and securely authenticating with it, and finish by showing you how you can deploy your web app!",
          id: 164,
          title: "Building Secure Web Applications with Python and Flask",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "388Y",
          advisor: "Evan Golub",
          facilitators: [
            {
              name: "Logan Stevens",
              email: "lsteven7@terpmail.umd.edu",
            },
          ],
          description:
            "This class will explore the history and evolution of computer science from its early foundations through the atomic age, the Y2K Bug, the internet revolution, the present day, and beyond. This course will cover not only the people and work behind the advances in computing, but also the technologies of yesteryear that eventually evolved into the devices that have become ubiquitous today. We will observe how computing has impacted society throughout time, and the reactions to its advances through the normalization of digital technologies.",
          id: 165,
          title: "History of Computer Science and Digital Technologies",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389G",
          advisor: "Garrett Vanhoy",
          facilitators: [
            {
              name: "Siddharth Cherukupalli",
              email: "scheruku@terpmail.umd.edu",
            },
            {
              name: " Venkata Sai Santhosh Bhuvan Jammalamadaka",
              email: "bhuvanj@terpmail.umd.edu",
            },
          ],
          description:
            "In this course, students are given a scoped experience of a Software Engineering industry job and relevant tools/practices to accelerate acclimation to a future SWE Intern or Full-Time role. Topics/Skills covered include: Git, Code Reviews, AWS basics, Design Docs, unit testing, virtual machines, etc. Students will contribute to a complex code base to simulate designing, implementing, and testing new features in a professional setting.",
          id: 166,
          title: "What to do After Landing a SWE Job",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389O",
          advisor: "Thomas Goldstein",
          facilitators: [
            {
              name: "Amanda Liu",
              email: "asliu@umd.edu",
            },
            {
              name: " Jason Devers",
              email: "jdevers1@terpmail.umd.edu",
            },
            {
              name: " Harleen Kaur",
              email: "ehkaur@terpmail.umd.edu",
            },
            {
              name: " Vidushi Vashist",
              email: "vvashist@terpmail.umd.edu",
            },
            {
              name: " Stephanie Wang",
              email: "swang115@terpmail.umd.edu",
            },
            {
              name: " Kevin Tang",
              email: "ktang124@terpmail.umd.edu",
            },
            {
              name: " Andrew Yuan",
              email: "ayuan124@terpmail.umd.edu",
            },
            {
              name: " Eugene Domr",
              email: "edomrach@terpmail.umd.edu",
            },
            {
              name: " Michael Mannino",
              email: "mmannino@terpmail.umd.edu",
            },
          ],
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Graphs and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          id: 167,
          title: "The Coding Interview",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389P",
          advisor: "Huaishu Peng",
          facilitators: [
            {
              name: "Aadria Bagchi",
              email: "abagchi@terpmail.umd.edu",
            },
            {
              name: " Shreya Kumaraswamy",
              email: "shreyak7@terpmail.umd.edu",
            },
            {
              name: " Rachel Modi",
              email: "rachel.modi@yahoo.com",
            },
          ],
          description:
            "Product Management is an interesting intersection of technology and business that students are given the opportunity to learn more about in this class. Students are introduced to the tools, techniques, and resources to nail their PM (Product Management) interviews. We'll be providing hands-on practice with PM specific topics including product design, analytical, and case questions. By the end of the class, you should be acing all your PM interviews!",
          id: 168,
          title: "Mastering the PM Interview",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389T",
          advisor: "Cliff Bakalian",
          facilitators: [
            {
              name: "Nandhini Krishnan",
              email: "nankri3@terpmail.umd.edu",
            },
            {
              name: " Sagar Saxena",
              email: "ssaxena1@terpmail.umd.edu",
            },
          ],
          description: "Version control and collaboration are essential skills for developers to learn. Students will learn how to use Git for basic and advanced workflows, GitHub for team and project management, and explore tools to help them excel in a DevOps environment.",
          id: 169,
          title: "Introduction to Git, Github and Project Management",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398D",
          advisor: "Wiseley Wong",
          facilitators: [
            {
              name: "Bilal Mohammed",
              email: "bmohamm7@terpmail.umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 170,
          title: "Introduction to Artificial Intelligence in Healthcare",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398E",
          advisor: "Justin Wyss Gallifent",
          facilitators: [
            {
              name: "Sneha Sureshanand",
              email: "ssuresha@terpmail.umd.edu",
            },
            {
              name: " Ananya Vepa",
              email: "avepa@terpmail.umd.edu",
            },
          ],
          description:
            "In this course, students will learn the tools and techniques needed to succeed in the field of data science. They will engage in simulations that allow them to develop SQL/R coding skills, and learn how to effectively present these findings. They will also utilize analytical thinking to solve real-world data science problems.",
          id: 171,
          title: "Essential Data Science Skills & Techniques",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398F",
          /* advisor needed */
          advisor: "",
          facilitators: [
            {
              name: "Om Pathak",
              email: "ompathak@terpmail.umd.edu",
            },
            {
              name: " Nikhil Ghate",
              email: "sdigamba@terpmail.umd.edu",
            },
            {
              name: " Soham Digambar",
              email: "nghate@terpmail.umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 172,
          title: "Introduction to Blockchain and Cryptocurrency",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398I",
          advisor: "David Van Horn",
          facilitators: [
            {
              name: "Varun Chari",
              email: "vchari@terpmail.umd.edu",
            },
          ],
          description:
            "This course will introduce students to shell scripting, the glue between various utilities and the method of choice of many programmers to interact with their systems. The differences between and shell languages and their more mainstream counterparts will be explored. Topics include composing programs, concurrency, error handling, customizing ones shell, security vulnerabilities. Projects will be based on reimplementing common utilities.  ",
          id: 173,
          title: "Introduction to Shell Scripting",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398K",
          advisor: "Matthias Zwicker",
          facilitators: [
            {
              name: "Andy Qu",
              email: "aqu1@terpmail.umd.edu",
            },
          ],
          description:
            "In this course, students will learn about shaders and how they contribute to the underlying processes that make visualizing 3D games and simulations possible. This course will cover basic concepts of linear algebra and go over creating scenes and shaders using the popular JavaScript library, Three.js. We will then cover basic lighting systems as well as the normal, flat, goraud, phong, blinn-phong, cel, and contour shading techniques and explore the various visual effects they achieve.",
          id: 174,
          title: "Basic Shaders in Three.js",
          website: null,
          department: "CMSC",
          credits: 1,
        },

        {
          number: "238G",
          advisor: "Brian Pierce",
          facilitators: [
            {
              name: "Spencer Skylar Chan",
              email: "schan12@terpmail.umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 175,
          title: "Introduction to Shell Scripting for the Life Sciences",
          website: null,
          department: "BSCI",
          credits: 1,
        },

        {
          number: "299C",
          advisor: "Jeff Mund",
          facilitators: [
            {
              name: "Mihika Kulkarni",
              email: "mkulkar2@umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 176,
          title: "The Business of Music",
          website: null,
          department: "BMGT",
          credits: 1,
        },

        /* listed on testudo but not with stics */
        {
          number: "289U",
          advisor: "",
          facilitators: [
            {
              name: "Jacob Toll",
              email: "",
            },
          ],
          description: "An introduction to various forms of political comedy and its sociopolitical impact in the past and present.",
          id: 177,
          title: "Political Comedy: How Laughter Shapes Political Discourse",
          website: null,
          department: "GVPT",
          credits: 1,
        },

        {
          number: "289K",
          advisor: "Dr. William Reed",
          facilitators: [
            {
              name: "Samira Mudd",
              email: "smudd@terpmail.umd.edu",
            },
          ],
          description: "",
          id: 178,
          title: "International Security & Relations Simulation Lab",
          website: null,
          department: "GVPT",
          credits: 1,
        },

        {
          number: "258A",
          advisor: "Christina Hnatov, Brooke Smith, Rachel Thompson, Mira Azarm",
          facilitators: [
            {
              name: "Claire Knorr",
              email: "clairepknorr@gmail.com",
            },
          ],
          description:
            "This introductory course allows students to try on the behaviors of a creative problem-solver, leveraging the methods and tools of design thinking, a human-centered innovation process. This is a highly experiential, often experimental course. All majors are encouraged to enroll.",
          id: 179,
          title: "Innovation Tools & Mindsets",
          website: null,
          department: "IDEA",
          credits: 1,
        },

        {
          number: "258D",
          advisor: "Brooke Smith",
          facilitators: [
            {
              name: "Paula Shin",
              email: "paulashin15@gmail.com",
            },
            {
              name: " Grace Lee",
              email: "glee1236@terpmail.umd.edu",
            },
          ],
          description:
            '"Explorations in Design" gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real world applications to incorporate design thinking into everyday life. By exploring each stage of the design process (from ideating to prototyping), students will develop a final project to pitch at the end of the semester.',
          id: 180,
          title: "Explorations in Design",
          website: null,
          department: "IDEA",
          credits: 1,
        },

        {
          number: "258U",
          advisor: "Mira Azarm",
          facilitators: [
            {
              name: "Kat Close",
              email: "kclose1@terpmail.umd.edu",
            },
            {
              name: " Anjali Verma",
              email: "averma12@terpmail.umd.edu",
            },
          ],
          description:
            'What does "User Experience" mean? It was a term coined by cognitive psychologist and designer Don Norman in the 1990s on the cusp of the new digital era; however, the field in practice has existed long before that. Unfortunately, due to its over use and misuse, the pure concept of UX has become lost in the weeds and details of all of its components and methods. In this course, we will take a deep look at the true meaning of UX as simply a user\'s experience and what that means for you as both a designer and a user. You will learn about core UX principles and methodologies from both an academic and practical standpoint and be challenged to apply what you learn in classroom workshops and assignments. Finally, you will be asked to think both inside and outside the bounds of technology to find innovative solutions to real world design problems.',
          id: 181,
          title: "Introduction to UI/UX Design",
          website: "go.umd.edu/idea258u",
          department: "IDEA",
          credits: 1,
        },

        {
          number: "498B",
          advisor: "Roger Eastman",
          facilitators: [
            {
              name: "Mahum Qadeer",
              email: "mqadeer@terpmail.umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 182,
          title: "Exploring Product Design and Management in Immersive Media",
          website: null,
          department: "IMDM",
          credits: 1,
        },

        {
          number: "299Q",
          advisor: "Amin Gholampour",
          facilitators: [
            {
              name: "Neelam Akula",
              email: "nakula@umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 183,
          title: "Quiver Representations",
          website: null,
          department: "MATH",
          credits: 1,
        },

        {
          number: "299C",
          advisor: "Niranjan Ramachandran",
          facilitators: [
            {
              name: "Turner McLaurin",
              email: "hmclauri@terpmail.umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 184,
          title: "Category Theory",
          website: null,
          department: "MATH",
          credits: 1,
        },

        {
          number: "299W",
          advisor: "Niranjan Ramachandran",
          facilitators: [
            {
              name: "Karthik Sellakumaran Latha",
              email: "karthiks@terpmail.umd.edu",
            },
            {
              name: " Rae Wu",
              email: "rwuu@terpmail.umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 185,
          title: "Mathematics and Art",
          website: null,
          department: "MATH",
          credits: 1,
        },

        {
          number: "248E",
          advisor: "William Evans",
          facilitators: [
            {
              name: "Ethan Limansky",
              email: "elimansk@umd.edu",
            },
          ],
          /* description needed */
          description: "",
          id: 186,
          title: "Exploring Vocal Styles Between Styles of Music",
          website: null,
          department: "MUSC",
          credits: 1,
        },

        {
          number: "289A",
          advisor: "Dr. Craig S Fryer",
          facilitators: [
            {
              name: "Ada Beams",
              email: "adabeams@gmail.com",
            },
          ],
          /* description needed */
          description: "",
          id: 187,
          title: "Achieving Wellbeing",
          website: null,
          department: "HLTH",
          credits: 1,
        },
      ],
    },

    // -------------------------------------------------------------
    // BEGIN
    // FALL 2023
    // CATALOG
    // -------------------------------------------------------------

    "fall 2023": {
      departments: ["BMGT", "BSCI", "CMSC", "GVPT", "HLTH", "IDEA", "IMDM", "MATH", "MUSC"],
      classes: [
        {
          number: "388J",
          advisor: "Michael Marsh",
          facilitators: [
            {
              name: "Anders Spear",
              email: "aspr@umd.edu",
            },
            {
              name: " Sanketh Varamballi",
              email: "sankethv@umd.edu",
            },
            {
              name: " Stephanie Albornoz",
              email: "salborno@umd.edu",
            },
          ],
          description: "",
          id: 188,
          title: "Building Secure Web Applications with Python and Flask",
          website: "https://docs.google.com/document/d/1AgeBC6535rxiO7ZFxGQVSpLMG-rm3BJv2TzbnPcqraM/edit?usp=sharing",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "388Y",
          advisor: "Evan Golub",
          facilitators: [
            {
              name: "Logan Stevens",
              email: "lsteven7@terpmail.umd.edu",
            },
          ],
          description: "",
          id: 189,
          title: "History of Computer Science and Digital Technologies",
          website: "https://drive.google.com/drive/folders/1Zqc-FC44UlJhZcJs3WPHxHyPIokfJsUZ?usp=sharing",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398E",
          advisor: "Justin Olav Wyss-Gallifent",
          facilitators: [
            {
              name: "Sanjana Vellanki",
              email: "svellank@terpmail.umd.edu",
            },
            {
              name: " Akul Gokaram",
              email: "agokaram@terpmail.umd.edu",
            },
          ],
          description: "",
          id: 190,
          title: "Essential Data Science Skills and Techniques",
          website: "https://docs.google.com/document/d/1iGMYi_COctptTYrewlkoQL7glOalRNW6/edit?usp=sharing&ouid=108358106802873218030&rtpof=true&sd=true",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398L",
          advisor: "Laxman Dhulipala",
          facilitators: [
            {
              name: "Cheng-Yuan Lee",
              email: "cl571128@terpmail.umd.edu",
            },
            {
              name: " Danesh Sivakumar",
              email: "dsivakum@terpmail.umd.edu",
            },
          ],
          description: "",
          id: 191,
          title: "Introduction to Competitive Programming",
          website: "https://docs.google.com/document/d/11V1tetBqNUpslwRIUGTz9YSQ4B3XEVR4iaHkP5w5OJA/edit?usp=sharing",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389P",
          advisor: "Huaishu Peng",
          facilitators: [
            {
              name: "Rachel Modi",
              email: "rmodi1@terpmail.umd.edu",
            },
          ],
          description: "",
          id: 192,
          title: "Mastering the PM Interview",
          website: "https://docs.google.com/document/d/1PrrS0H5kvz1m7LbY7erJXg1hiIOtD66emiNF2OMjflY/edit?usp=sharing",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398M",
          advisor: "Clifford Bakalian",
          facilitators: [
            {
              name: "Joshua Kalampanayil",
              email: "jkalam@terpmail.umd.edu",
            },
            {
              name: " Devika Elakara",
              email: "delakara@umd.edu",
            },
            {
              name: " Faris Ali",
              email: "farisali@umd.edu",
            },
          ],
          description: "",
          id: 193,
          title: "Product Design with Figma",
          website: "https://drive.google.com/file/d/1DmEE34dBFIjcdCN25CitqkRfgfMCLx1u/view?usp=share_link",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "398N",
          advisor: "Elias Gonzalez",
          facilitators: [
            {
              name: "Logan Stevens",
              email: "lsteven7@umd.edu",
            },
          ],
          description: "",
          id: 194,
          title: "Ethics in Computer Science",
          website: "https://drive.google.com/file/d/1H3jEOA3Dt6kJH0RtRpxPW-T1z4CXVVOU/view?usp=sharing",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389T",
          advisor: "Cliff Bakalian",
          facilitators: [
            {
              name: "Jason Devers",
              email: "jdevers1@umd.edu",
            },
            {
              name: " Abhinav Vedmala",
              email: "avedmala@umd.edu",
            },
          ],
          description: "",
          id: 195,
          title: "Introduction to Git, Github and Project Management",
          website: "https://drive.google.com/drive/u/1/folders/1R1uD9cgEnUjSdMY2iX2oDAgNSXRyDOq6",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389O",
          advisor: "Tom Goldstein",
          facilitators: [
            {
              name: "Amanda Liu",
              email: "asliu@umd.edu",
            },
            {
              name: " Andrew Yuan",
              email: "andrewyuantw@gmail.com",
            },
            {
              name: " Kevin Tang",
              email: "ktang124@terpmail.umd.edu",
            },
            {
              name: " Jason Devers",
              email: "jdevers1@terpmail.umd.edu",
            },
            {
              name: " Kevin Tang",
              email: "ktang124@terpmail.umd.edu",
            },
            {
              name: " Alexander Tanimoto",
              email: "atanimot@umd.edu",
            },
          ],
          description: "",
          id: 196,
          title: "The Coding Interview",
          website: "https://drive.google.com/file/d/1BP8Nt6hrZrowRM1YAXVVbiGYi4c78uxs/view?usp=sharing",
          department: "CMSC",
          credits: 1,
        },

        {
          number: "389G",
          advisor: "Justin Wyss Gallifent",
          facilitators: [
            {
              name: "Siddharth Cherukupalli",
              email: "cherukusid@gmail.com",
            },
            {
              name: " Bhuvan Jammalamadaka",
              email: "bhuvanjama@gmail.com",
            },
          ],
          description: "",
          id: 197,
          title: "What to do After Landing a SWE Job",
          website: "https://docs.google.com/document/d/1nEjeXrEwdlpqPo2PsMzU5j1oFLWMBPD18IYWi5fhupQ/edit?usp=sharing",
          department: "CMSC",
          credits: 1,
        },

        // {
        //   number: "----",
        //   advisor: "Timothy Reedy",
        //   facilitators: [
        //     {
        //       name: "Azmeena Rao",
        //       email: "arao2760@umd.edu",
        //     },
        //     {
        //       name: " MaryAnne Onianwah",
        //       email: "monianwa@umd.edu",
        //     },
        //   ],
        //   description: "",
        //   id: 198,
        //   title: "Introduction to Undergraduate Research at The University of Maryland",
        //   website: "https://drive.google.com/file/d/17jPR5jUZNXJtidOqpaaXvSkR_cD-O98-/view?usp=sharing",
        //   department: "CMSC",
        //   credits: 1,
        // },
      ],
    },
  },
};
