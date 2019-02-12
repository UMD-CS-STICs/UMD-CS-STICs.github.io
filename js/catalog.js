// Catalog broken in IE bc ES6 is used in this file.

$("document").ready(function() {
    initializeSemestersDropdown();
    initializeFilterTags();
    update(CURRENT_SEMESTER);
    initializeHashFragment();
});

// Written in this way so jQuery can see dynamically added elements
$(document).on('click', 'a.semester-option', function(e) {
  const newSemester = $(this).text();
  $("#selectedSemester").text(newSemester)
  initializeFilterTags();
  update(newSemester);
});

$("#catalog-search").on("input", function(e) {
  update($('#selectedSemester').text());
});

// Written in this way so jQuery can see dynamically added elements
$(document).on('click', 'a.tag-option', function(e) {
  if ($(this).attr("id") === "view-all") {
    $(".tag-option").each(function() {
      $(this).removeClass("tag-option-selected");
    });
  } else {
    $("#view-all").removeClass("tag-option-selected");
  }
  $(this).toggleClass("tag-option-selected");
  update($('#selectedSemester').text());
});

function initializeFilterTags() {
  $("#filter-tags").html('');
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
    $("#filter-tags").append(`<a id="${deptName}-tag" class="button tag-option">${deptName}</a>`)
  }

  $("#view-all").addClass("tag-option-selected");
}

function initializeSemestersDropdown() {
  for (semester of SEMESTERS) {
    $("#semesters").prepend(`<a href="#" class="semester-option">${semester}</a>`);
  }
  $("#selectedSemester").text(CURRENT_SEMESTER)
}

function initializeHashFragment() {
  if (window.location.hash) {
    const hash = window.location.hash;
    if ($(`${hash}-tag`).length) {
      $(`${hash}-tag`).toggleClass("tag-option-selected"); // select it
      $("#view-all").removeClass("tag-option-selected"); // deselect view all
      update($('#selectedSemester').text());
    }
  }
}

function getSelectedTags() {
  const selectedTags = [];
  $(".tag-option").each(function() {
    if ($(this).hasClass("tag-option-selected")) {
      selectedTags.push($(this).text())
    }
  })
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
  classesToDisplay = classDivs.join('')

  if (classesToDisplay === "")
    classesToDisplay = "No classes were found.";

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
  return `Advisor: ${a}`
}

function createDiv(cl) {
  const className = cl.department + cl.number;
  const selectedSemester = $('#selectedSemester').text();
  const year = selectedSemester.substr(selectedSemester.length - 4);
  const startMonth = (selectedSemester.substr(0, selectedSemester.length - 5) == "spring") ? "1" : "8";
  const testudoUrl =
  `
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
            ${(cl.website === undefined || cl.website === null) ? "" : `<a target="_blank" href="${cl.website}">Website</a><br>`} \
            ${(cl.syllabus === undefined || cl.syllabus === null) ? "" : `<a target="_blank" href="${cl.syllabus}">Syllabus</a>`} \
          </div> \
          <div class="col-8">
            ${cl.description} \
          </div> \
    </div>`;
}

// TODO add semesters here
var SEMESTERS = ['spring 2017', 'fall 2017', 'spring 2018', 'fall 2018', 'spring 2019'];

var CURRENT_SEMESTER = "spring 2019";

// TODO add classes here
var CLASSES = {
  classes: {
    'spring 2017': {
      departments: ["CMSC"],
      classes: [
        {
          id: 0,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" },
            { name: "Sashank Thupukari", email: "sthupuka@umd.edu" }
          ],
          advisor: "Nelson Padua Perez",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kspring 2017",
          room: "CSIC1120",
          day: "Friday",
          time: "3-3:50 PM"
        }
      ]
    },
    'fall 2017': {
      departments: ["CMSC", "MATH", "BMGT", "ENSP", "MUSC"],
      classes: [
        {
          id: 6,
          department: "ENSP",
          number: "399E",
          title:
            "The Role of Evidence-based Advocacy in Environmental Politics",
          facilitators: [
            { name: "Margaret Houlihan", email: "mhouli@terpmail.umd.edu" },
            { name: "Camilla Arias", email: "carias3@umd.edu" }
          ],
          advisor: "Joanna Goger",
          credits: 1,
          description:
            "Students will learn about and discuss tools for effective advocacy and how that fits into the policy process by looking through the lenses of deforestation, water quality, and climate change.  They will become better able to enact change in environmental movements as they see fit using principles learned throughout the semester. They will be invited to share their opinions, and reflect on the opinions of their peers. Through assignments such as emailing members of congress or reaching out to UMD Facilities Management, students will practice involving others in their advocacy as well.",
          syllabus:
            "https://www.dropbox.com/s/zm6o7igkpcnzxm0/Syllabus%20ENSP399E.pdf?dl=0",
          room: "PLS1129",
          day: "Thursday",
          time: "12:30 - 1:20 PM"
        },
        {
          id: 1,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" },
            { name: "Sashank Thupukari", email: "sthupuka@umd.edu" }
          ],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to build back-end applications. Finally, we will learn about Express.js (server-side development framework) and MongoDB (database) in order to create a complete web application.",
          syllabus: "https://github.com/UMD-CS-STICs/389Kfall17",
          room: "CSIC3118",
          day: "Friday",
          time: "3-3:50 PM"
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
          time: "1-1:50 PM"
        },
        {
          id: 3,
          department: "CMSC",
          number: "389O",
          title: "The Coding Interview",
          facilitators: [
            { name: "Cameron Payton", email: "cpayton@umd.edu" },
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" }
          ],
          advisor: "Dave Levin",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. The course will start with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Bit Manipulation and Dynamic Programming. Most of the classes will be in-class interviews to give real interview practice.",
          syllabus: "https://github.com/UMD-CS-STICs/389Ofall17",
          room: "CSIC3118",
          day: "Friday",
          time: "2-2:50 PM"
        },
        {
          id: 4,
          department: "BMGT",
          number: "298B",
          title: "Introduction to Product Design",
          facilitators: [
            { name: "Jordan Steiner", email: "jasteiner11@gmail.com" }
          ],
          advisor: "Pamela Armstrong",
          credits: 1,
          description:
            "This course will discuss the meaning behind design and how to communicate a message with product design. Students will interact in product discussions and understand how and why products are designed. From this, students will then apply learning to create concepts and prototypes for modern problems. Students will also get the chance to interact with real startup companies to assist in live cases to design products. Overall, students will learn and apply product design methodologies to concept a solution to a problem of their choosing.",
          syllabus:
            "https://www.dropbox.com/s/24nukb21ejyejni/product_design.pdf?dl=0",
          room: "VMH2509",
          day: "Thursday",
          time: "4-4:50 PM"
        },
        {
          id: 5,
          department: "MATH",
          number: "299N",
          title: "Mathematics of Ramanujan",
          facilitators: [
            { name: "Eric Metz", email: "emetz1618@gmail.com" },
            { name: "Tanay Wakhare", email: "twakhare@gmail.com" }
          ],
          advisor: "Lawrence Washington",
          credits: 1,
          description:
            "Srinivasan Ramanujan was born in rural India in 1887. Learning from a single book of theorems, he was able to rederive much of modern mathematics. After writing his first paper at 17, he recorded hundreds of pages of formulae that are still being explored today.  This course is meant to explain some of those results, and how they fit into modern number theory research today. This is not proof based; instead, this course is focused on presenting results and context.",
          syllabus:
            "https://www.dropbox.com/s/aaznuhcdppx05gf/MATH%20299N.pdf?dl=0",
          room: "MTH0405",
          day: "Friday",
          time: "3-3:50 PM"
        },

        {
          id: 7,
          department: "MUSC",
          number: "248D",
          title: "Rapping it Up: An Analysis of Hip Hop Music",
          facilitators: [
            { name: "Yannick Alexis", email: "yalexis@umd.edu" },
            { name: "Jordan Weber", email: "weberjordant@gmail.com" }
          ],
          advisor: "Richard King",
          credits: 1,
          description:
            "This course will discuss the history and analyze the evolution of Hip Hop and rap music from it’s early stages in the Nineteen Eighties to the Present day. Students will interact in class discussions and gain an understanding for the different sounds, messages, and impacts ofvarying Hip Hop artists and styles. From this, students will then apply learning from in class discussion by exploring previously unheard music and articulating their opinions. Throughout the course students will reflect on the value of Hip Hop to society and how it affects culture. Students will also get the chance to interact with local Hip-Hop artists as well as write and perform their own art as an extended learning opportunity to connect with the art form. Overall, students will learn and evaluate the intricacies of Hip Hop music and it’s importance to society.",
          syllabus:
            "https://www.dropbox.com/s/34bg31tbi0fx7lr/musc248d.pdf?dl=0",
          room: "PAC3160",
          day: "Thursday",
          time: "12:30 - 1:45 PM"
        }
      ]
    },
    'spring 2018': {
      departments: ["CMSC", "MATH", "BMGT", "ENSP", "MUSC"],
      classes: [
        {
          id: 8,
          department: "CMSC",
          number: "389C",
          title:
            "Bitcoin and Other Cryptocurrencies",
          facilitators: [
            { name: "Cameron Payton", email: "cpayton@umd.edu" },
            { name: "Neil Johnson", email: "nj13127@gmail.com" }
          ],
          advisor: "Jonathan Katz",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to the technology behind cryptocurrency and the economy surrounding it. This course will have a heavy emphasis on Bitcoin, but will touch on other types of cryptocurrency as well. This course is primarily intended to focus on the technological aspect of cryptocurrency, but we will also spend time discussing the economics of cryptocurrency.",
          syllabus:
            "https://github.com/UMD-CS-STICs/389Cspring18",
          room: "CSIC3118",
          day: "Friday",
          time: "2:00 - 2:50 PM"
        },
        {
          id: 9,
          department: "CMSC",
          number: "389K",
          title:
            "Full-Stack Web Development with Node.js",
          facilitators: [
            { name: "Timothy Chen", email: "tchen112@terpmail.umd.edu" },
            { name: "Allen Cheng", email: "ac@allencheng.me" }
          ],
          advisor: "Dr. John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus:
            "https://github.com/UMD-CS-STICs/389Kspring18",
          room: "CSIC2118",
          day: "Friday",
          time: "1:00 - 1:50 PM"
        },
        {
          id: 10,
          department: "CMSC",
          number: "389R",
          title:
            "Introduction to Ethical Hacking",
          facilitators: [
            { name: "Michael Reininger", email: "michael@csec.umiacs.umd.edu" },
            { name: "William Woodruff", email: "william@yossarian.net" },
            { name: "Joshua Fleming", email: "secretary@csec.umiacs.umd.edu" }
          ],
          advisor: "Dave Levin",
          credits: 1,
          description:
            "An introduction to ethical hacking geared towards entering the competitive world of cybersecurity Capture the Flag (CTF) competitions. Applications to a career in digital forensics, penetration testing, cryptology, and secure software development.",
          syllabus:
            "https://github.com/UMD-CS-STICs/389Rspring18",
          room: "CSIC2118",
          day: "Friday",
          time: "3:00 - 3:50 PM"
        },
        {
          id: 11,
          department: "CMSC",
          number: "389O",
          title:
            "The Coding Interview",
          facilitators: [
            { name: "Andi Hopkins", email: "andihop@umd.edu" },
            { name: "Maria McCulley", email: "mmccull2@umd.edu" },
            { name: "Sandra Sandeep", email: "ssandeep@umd.edu" }
          ],
          advisor: "Thomas Goldstein",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to technical interviews. Starting with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Bit Manipulation and Dynamic Programming. Most of the classes will be &quot;In-Class Interviews&quot; and take-home assignments will simulate real interview settings.",
          syllabus:
            "https://github.com/UMD-CS-STICs/389Ospring18",
          room: "ESJ2101",
          day: "Friday",
          time: "11:00 - 11:50 AM"
        },
        {
          id: 12,
          department: "CMSC",
          number: "389F",
          title:
            "Reinforcement Learning",
          facilitators: [
            { name: "Kevin Chen", email: "kev@umd.edu" },
            { name: "Zack Khan", email: "zkhan123@umd.edu" }
          ],
          advisor: "James Reggia",
          credits: 1,
          description:
            "From mastering impossibly complex games to creating precise AI for self-driving cars, Reinforcement Learning is set to be a breakthrough technology in the coming decade. \nReinforcement Learning is a powerful area of AI responsible for the recent successes of industry titans such as DeepMind, OpenAI, Google Brain, and Tesla. It’s inspired by a simple concept from behavioral psychology- people who receive a reward after doing an activity will continue doing that activity- and applies that principle in an algorithmic way to create intelligent systems.\nIf you’d like to learn how to build an AI of your own using concepts from the cutting-edge of academic research and industry technology, come take CMSC389F: Reinforcement Learning! This course provides a theory-centric introduction to Reinforcement Learning, and students will learn the key concepts and algorithms driving Reinforcement Learning, including Markov Decision Processes, Monte Carlo Learning, and Policy Gradient methods.",
          syllabus:
            "https://github.com/mlatmd/cmsc389F",
          website:
            "http://cmsc389f.umd.edu",
          room: "CSIC3118",
          day: "Friday",
          time: "12:00 - 12:50 PM"
        },
        {
          id: 13,
          department: "CMSC",
          number: "389A",
          title:
            "Practical Deep Learning",
          facilitators: [
            { name: "Sujith Vishwajith", email: "svishwaj@terpmail.umd.edu" },
          ],
          advisor: "Jordan Boyd-Graber",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern deep learning networks and their applications to AI tasks. Specifically, the course will cover basic concepts in optimization, neural networks, convolutional neural networks (CNN), and recurrent neural networks (RNN). By the end of the course, it is expected that students will have a strong familiarity with the subject and be able to design and develop deep learning models for a variety of tasks.",
          syllabus:
            "https://github.com/UMD-CS-STICs/389Aspring18",
          room: "CSIC2118",
          day: "Friday",
          time: "12:00 - 12:50 PM"
        },
        {
          id: 14,
          department: "ENSP",
          number: "399E",
          title:
            "The Role of Evidenced Based Environmental Advocacy in Environmental Politics",
          facilitators: [
            { name: "Margaret Houlihan", email: "mhouli@terpmail.umd.edu" },
            { name: "Camilla Arias", email: "carias3@umd.edu" }
          ],
          advisor: "Joanna Goger",
          credits: 1,
          description:
            "In this course, students will explore the avenues of advocacy, and sound sources on which to base opinions and arguments in environmental policy. Through a discussion-based class, advocacy will be explored in in the areas of deforestation, climate change, and water quality. Students will analyze cases in the environmental movements of effective and ineffective advocacy, hear from a number of guest speakers who are experts in the above topics, and hold discussions on current events related to these topics.",
          syllabus:
            "https://docs.google.com/document/d/1-Drnr4f6Xy30LMjwVu6OHTBAb1_UML30MFQL7oBKqhE/edit?usp=sharing",
          room: "CHE2145",
          day: "Monday",
          time: "11:00 - 12:15 PM"
        },
        {
          id: 15,
          department: "ENME",
          number: "289P",
          title:
            "Additive Manufacturing for Prosthetic Design",
          facilitators: [
            { name: "Saul Schaffer", email: "saul@umd.edu" },
            { name: "Anna Packy", email: "apacky@eng.umd.edu" }
          ],
          advisor: "Angie Bryl, CPO",
          credits: 2,
          description:
            "This project-oriented course is designed to provide students an introduction to prosthetic design while empowering them to take advantage of the vast 3D printing resources at the University of Maryland to create and test a unique prosthetic prototype. The course will cover prosthetic components and design considerations, as well as the basics of 3D printing, before delving into the interface between the two subjects.",
          syllabus:
            "https://drive.google.com/file/d/18cfFFcEie6tZJnUZD_fSaOkgD8gkkkUh/view",
          room: "EGR3108",
          day: "Monday/Friday",
          time: "5:30 - 6:30 PM (Lec), 6:30 - 8:30 PM (Lab)"
        },
        {
          id: 16,
          department: "ARTT",
          number: "489Z",
          title:
            "Introduction to Design Software",
          facilitators: [
            { name: "Elise Nichols", email: "e.s.nichols17@gmail.com" },
            { name: "Drew Darden", email: "drew.d712@gmail.com" }
          ],
          advisor: "Liese Zahabi",
          credits: 1,
          description:
            "Covering the basics and processes of graphic design including Photoshop, Illustrator, and InDesign + basic GIFs.",
          syllabus:
            "https://drive.google.com/file/d/17vvRliu_hkbEFGWhSVLVHddzSfOdyRLd/view?usp=sharing",
          room: "TYD2102",
          day: "Thursday",
          time: "6:30 - 7:30 PM"
        },
        {
          id: 17,
          department: "CMSC",
          number: "389M",
          title:
            "SLAM: Why Robots Don't Crash",
          facilitators: [
            { name: "Ishaan Parikh", email: "iparikh@umd.edu" },
            { name: "Michael Stevens", email: "msteven9@umd.edu" }
          ],
          advisor: "Larry Davis",
          credits: 1,
          description:
            "Students will be provided with a practical and lightly theoretical understanding of the most popular algorithms that solve the Simultaneous Localization and Mapping (SLAM) problem to enable self driving car technology. An emphasis will be placed on the probabilistic methods that underpin the SLAM problem.",
          syllabus:
            "",
          room: "CSI2118",
          day: "Friday",
          time: "2:00 - 2:50 PM"
        },
        {
          id: 18,
          department: "ENST",
          number: "499W",
          title:
            "Earth Systems Sustainability",
          facilitators: [
            { name: "Gabriel Donnenberg", email: "gabedonnenberg@gmail.com" }
          ],
          advisor: "Dr. Jose Luis-Izursa",
          credits: 1,
          description:
            "Earth Systems Sustainability offers a holistic examination of the diverse ways in which humans have affected natural systems of our planet over the last 15000 years of development. Considering unfolding environmental catastrophes and real, tangible, effective solutions in which we can all take part as individuals and advocate for as members of a globally conscious society. We will learn from each other and do what we can to save the parts of this world we consider most precious and worthy of fighting for.",
          syllabus:
            "https://drive.google.com/open?id=1fTjFX-S7TwKhl5_4YaQ6DfUyErBlwAgx",
          room: "ANS1422",
          day: "Wednesday",
          time: "10:00 - 11:15 AM"
        },
        {
          id: 19,
          department: "MATH",
          number: "299N",
          title:
            "The Mathematics of Ramanujan",
          facilitators: [
            { name: "Tanay Wakhare", email: "twakhare@gmail.com" },
            { name: "Aaron Benda", email: "abenda19@gmail.com" }
          ],
          advisor: "Lawrence Washington",
          credits: 1,
          description:
            "Srinivasan Ramanujan was born in rural India in 1887. Learning from a single book of theorems, he was able to rederive much of modern mathematics. After writing his first paper at 17, he recorded hundreds of pages of formulae that are still being explored today.  This course is meant to explain some of those results, and how they fit into modern number theory research today. This is not proof based; instead, this course is focused on presenting results and context.",
          syllabus:
            "https://www.dropbox.com/s/hli604km16q1k5n/syllabus.docx?dl=0",
          room: "MATH0103",
          day: "Friday",
          time: "12:00 - 12:50 PM"
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
          time: "3-3:50 PM"
        },
        {
          id: 21,
          department: "CMSC",
          number: "389E",
          title: "Digital Logic through Minecraft",
          facilitators: [{ name: "Alex Brassel", email: "abrassel@umd.edu" }, { name: "Jeremy Klein", email: "jklein@umd.edu"}],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "In this class, we will explore the theory and applications of combinatorial and sequential circuits. All projects will be done using Minecraft’s Redstone. The course will cover basic gates to more advanced circuits including memory gates and large sequential circuits. The first half of the class will focus on combinational logic gates, and the second half will introduce time-based sequential circuits.",
          syllabus: "https://www.sharelatex.com/read/dvyhxndvpcmg",
          room: "CSIC3118",
          day: "Friday",
          time: "1-1:50 PM"
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
          time: "2 - 3:15 PM"
        }
      ]
    },
    'fall 2018': {
      departments: ["CMSC"],
      classes: [
        {
          id: 23,
          department: "ARTT",
          number: "489Q",
          title: "Front End Web Design and Development",
          facilitators: [
            { name: "David Ng", email: "dng5@umd.edu" },
            { name: "Charlie Ching", email: "cching@terpmail.umd.edu" }
          ],
          advisor: "Brandon Morse",
          credits: 1,
          description:
            "This course presents a practical and project-oriented introduction to modern front end web development. Students will learn to design and build websites using technologies such as HTML, CSS, JS, Sass, Bootstrap, and Git.",
          syllabus: "./assets/syllabi/F18/ARTT489Q_F18.pdf",
          website: "http://stics.umd.edu/artt489q",
          room: "ASY3304",
          day: "Friday",
          time: "12 - 12:50 PM"
        },
        {
          id: 24,
          department: "CMSC",
          number: "389C",
          title: "Bitcoin and Other Cryptocurrencies",
          facilitators: [
            { name: "Cameron Payton", email: "cpayton@umd.edu" },
            { name: "John Kos", email: "jkos@terpmail.umd.edu" }
          ],
          advisor: "Jonathan Katz",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to the technology behind cryptocurrency and the economy surrounding it. This course will have a heavy emphasis on Bitcoin, but will dive into other types of cryptocurrency as well, such as Ethereum. This course is primarily intended to focus on the technological aspect of cryptocurrency, but we will also spend time discussing the economics of cryptocurrency.",
          syllabus: "./assets/syllabi/F18/CMSC389C_F18.pdf",
          room: "BPS1238",
          day: "Friday",
          time: "1 - 1:50 PM"
        },
        {
          id: 25,
          department: "CMSC",
          number: "389I",
          title: "Disrupting Healthcare with AI",
          facilitators: [
            { name: "Sanna Madan", email: "smadan12@umd.edu" },
            { name: "Kyle Liu", email: "kliu1234@umd.edu" }
          ],
          advisor: "Max Leiserson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to the intersection of machine learning and different challenges in healthcare. Students will apply basic predictive modeling techniques to fields such as early detection of disease, telemedicine, and mental health. Prior knowledge of biology is not required but a basic understanding of Python and/or machine learning techniques is recommended.",
          syllabus: "./assets/syllabi/F18/CMSC389I_F18.pdf",
          room: "CSI2118",
          day: "Friday",
          time: "2 - 2:50 PM"
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
            { name: "Nelson Le", email: "nle@terpmail.umd.edu" }
          ],
          advisor: "Thomas Goldstein",
          credits: 1,
          description:
            `Students will be provided with a comprehensive, practical introduction to technical interviews. Starting with basic topics such as Big O and String Manipulation. We will then move into more complex topics such as Bit Manipulation and Dynamic Programming. Most of the classes will be "In-Class Interviews" and take-home assignments will simulate real interview settings.`,
          syllabus: "./assets/syllabi/F18/CMSC389O_F18.pdf",
          sections: [
            {
              room: "Section 0301: EGR2154",
              day: "Friday",
              time: "11 AM - 11:50 AM"
            },
            {
              room: "Section 0201: TWS0214",
              day: "Friday",
              time: "1 - 1:50 PM"
            },
            {
              room: "Section 0101: EDU1107",
              day: "Friday",
              time: "12 - 12:50 PM"
            }
          ],
        },
        {
          id: 27,
          department: "MATH",
          number: "299C",
          title: "Mathematics & Classical Music",
          facilitators: [
            { name: "Siri Neerchal", email: "siri@terpmail.umd.edu" }
          ],
          advisor: "Niranjan Ramachandran",
          credits: 1,
          description:
            "The aim of this course is to explore the historical discoveries in mathematics that have influenced Western classical music, as well as musical expressions of specific mathematical concepts. This course is not meant to be a rigorous introduction to music theory or mathematics; rather, it is focused on introducing students to classical music through mathematical ideas that appear in it. Students will also have an opportunity to explore mathematics through music in the form of a creative project.",
          syllabus: "./assets/syllabi/F18/MATH299C_F18.pdf",
          room: "MTH0103",
          day: "Friday",
          time: "12 - 12:50 PM"
        },
        {
          id: 28,
          department: "CMSC",
          number: "389Q",
          title: "iOS App Development",
          facilitators: [
            { name: "Travis Ho", email: "tho12@umd.edu" },
            { name: "Tamer Bader", email: "tbader@terpmail.umd.edu" }
          ],
          advisor: "Neil Spring",
          credits: 1,
          description:
            "This course teaches mobile development on the iOS platform. Students must have a Macintosh laptop (or access to one) in order to participate in this course. Topics covered will be Xcode, Swift, design patterns, creating UI, networking, and common libraries (as per request) such as ARKit and Core ML. By the end of this course, students should have the resources necessary to create their own apps and publish to the app store.",
          syllabus: "./assets/syllabi/F18/CMSC389Q_F18.pdf",
          room: "CSI3118",
          day: "Friday",
          time: "2 - 2:50 PM"
        },
        {
          id: 29,
          department: "MUSC",
          number: "248D",
          title: "Rapping it Up: An Analysis of Hip Hop Music",
          facilitators: [
            { name: "Yannick Alexis", email: "yalexis@umd.edu" },
            { name: "Jordan Weber", email: "weberjordant@gmail.com" }
          ],
          advisor: "William Evans",
          credits: 1,
          description:
            "This course will discuss the history and analyze the evolution of Hip Hop and rap music from it’s early stages in the Nineteen Eighties to the Present day. Students will interact in class discussions and gain an understanding for the different sounds, messages, and impacts ofvarying Hip Hop artists and styles. From this, students will then apply learning from in class discussion by exploring previously unheard music and articulating their opinions. Throughout the course students will reflect on the value of Hip Hop to society and how it affects culture. Students will also get the chance to interact with local Hip-Hop artists as well as write and perform their own art as an extended learning opportunity to connect with the art form. Overall, students will learn and evaluate the intricacies of Hip Hop music and it’s importance to society.",
          syllabus:
            "./assets/syllabi/F18/MUSC248D_F18.pdf",
          room: "PAC2164",
          day: "Wednesday",
          time: "11 AM - 12:15 PM"
        },
        {
          id: 30,
          department: "CMSC",
          number: "389U",
          title: "Introduction to Developing AR Applications with Hololens",
          facilitators: [
            { name: "John Ball", email: "jlball@terpmail.umd.edu" },
            { name: "Matt Graber", email: "mgraber1@terpmail.umd.edu" }
          ],
          advisor: "Matthias Zwicker",
          credits: 1,
          description:
            "A hands on, project driven introduction to developing Augmented Reality applications for devices like the Microsoft Hololens using the Microsoft Mixed Reality Toolkit and the Unity 3D engine. Topics will include AR design thinking, the Unity scripting API, deploying applications to Hololens, and the technology behind AR devices. Students will explore the capabilities of AR devices through bi-weekly projects designed to give them usable, valuable skills as quickly as possible. Basic programming and Unity experience, while not strictly required, are strongly recommended.",
          syllabus:
            "./assets/syllabi/F18/CMSC389U_F18.pdf",
          room: "CSI1122",
          day: "Friday",
          time: "1 - 1:50 PM"
        },
        {
          id: 31,
          department: "CMSC",
          number: "389F",
          title: "Reinforcement Learning",
          facilitators: [
            { name: "Dhruv Mehta", email: "dhruvnm@umd.edu" },
            { name: "Johann Miller", email: "jkmiller@umd.edu" }
          ],
          advisor: "James Reggia",
          credits: 1,
          description:
            "This course provides an overview of the key concepts and algorithms of Reinforcement Learning, an area of artificial intelligence research responsible for recent achievements such as AlphaGo and robotic control. Students will implement learning algorithms for simple tasks such as mazes and pong games.",
          syllabus:
            "./assets/syllabi/F18/CMSC389F_F18.pdf",
          room: "EGR2116",
          day: "Friday",
          time: "2 PM - 2:50 PM"
        },
        {
          id: 31,
          department: "CMSC",
          number: "389K",
          title: "Full-stack Web Development with Node.js",
          facilitators: [
            { name: "Benny Cheng", email: "bcheng1996@gmail.com" },
            { name: "Chirag Shankar", email: "chishankar@gmail.com" }
          ],
          advisor: "John Dickerson",
          credits: 1,
          description:
            "This course provides a comprehensive, practical introduction to modern full-stack web development using JavaScript and Node.js. The course will start with basic HTML/CSS/JavaScript. Then, we will move into Node.js and learn how to deploy a website from there. We will learn about Express.js (server-side development module) and MongoDB (database) in order to create a complete web application.",
          syllabus:
            "https://github.com/UMD-CS-STICs/389Kfall18/blob/master/README.md",
          room: "EGR2154",
          day: "Friday",
          time: "2 PM - 2:50 PM"
        },
        {
          id: 32,
          department: "MATH",
          number: "299M",
          title: "Visualization through Mathematica",
          facilitators: [
            { name: "Ajeet Gary", email: "agary@terpmail.umd.edu" }
          ],
          advisor: "William Goldman",
          credits: 1,
          description:
            "This course is designed to teach how to use the most common and useful features of Wolfram Mathematica, an extremely powerful technical computing system that can be used to model a wide range of problems. Plotting functions in several ways, making models that can be manipulated in real time by the user, and efficiently computing solutions to complicated equations are among the things we'll cover. We'll use these skills to model various structures in physics, economics, calculus and more, and for the final project every student will pick something relevant to their major (or interest otherwise) to model, whether that be in physics, math, engineering, economics, or anything else mathematical in nature. Over the course of learning these tools students will encounter profound examples of what Mathematica can do, seeing first hand that creating models that can be manipulated in real time helps greatly in understanding the underlying symmetries and properties of a problem.",
          syllabus:
            "./assets/syllabi/F18/MATH299M_F18.pdf",
          room: "MTH0401",
          day: "Friday",
          time: "2 PM - 2:50 PM"
        },
        {
          id: 33,
          department: "MATH",
          number: "299P",
          title: "Proofs from The Book",
          facilitators: [
            { name: "Tanay Wakhare", email: "twakhare@gmail.com" },
            { name: "Erik Metz", email: "emetz1618@gmail.com" }
          ],
          advisor: "Lawrence Washington",
          credits: 1,
          description:
            "Combinatorics is the study of counting. Despite its deceptively simple name, it is one of the most active areas of research in modern mathematics. We discuss some of the basic ideas behind combinatorics, and their unexpected applications. The proofs we discuss are so elegant that Paul Erdos once said they are from “The Book” – God’s book of the most elegant proof of each theorem.",
          syllabus:
            "./assets/syllabi/F18/MATH299P_F18.pdf",
          room: "MTH0407",
          day: "Friday",
          time: "1 PM - 1:50 PM"
        },
        {
          id: 34,
          department: "BMGT",
          number: "299A",
          title: "Designing for Business",
          facilitators: [
            { name: "Katie Zeng", email: "zeng.katieli@gmail.com" }
          ],
          advisor: "Mary Harms",
          credits: 1,
          description:
            "This course will introduce you to the fundamentals of graphic design in the context of business management. Students will be challenged to apply their design knowledge with hands-on activities, ranging from ideation to execution. Students will learn the necessity of branding, design and design thinking in the business world, while gaining the technical skills necessary to execute on their visions. To sharpen their communication skills, students will participate in in-class design challenges and a final class presentation.",
          syllabus:
            "./assets/syllabi/F18/BMGT299A_F18.pdf",
          room: "VMH1511",
          day: "Tuesday",
          time: "3:30 PM - 4:45 PM"
        },
        {
          id: 35,
          department: "IDEA",
          number: "258D",
          title: "Explorations in Design",
          facilitators: [
            { name: "Tianxin Chen", email: "chen128@umd.edu" }
          ],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "“Exploration in Design” gives students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real clients from various industries. We will explore how good and bad design plays a role in our everyday lives, from the way we order coffee to the logos on ads to the signs that help you navigate (or get lost on) the metro.",
          syllabus:
            "./assets/syllabi/F18/IDEA258D_F18.pdf",
          room: "ESJ2101",
          day: "Thursday",
          time: "12 PM - 1:30 PM"
        },
        {
          id: 36,
          department: "IDEA",
          number: "258Z",
          title: "Digital Product Design",
          facilitators: [
            { name: "Andres Arbelaez", email: "andresarbelaez08@gmail.com" },
            { name: "Nathalyn Nunoo", email: "nathalyn.nunoo@gmail.com" }
          ],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "In this course you’ll be introduced and immersed into user- centric design experiences for mobile and web products. You’ll get to apply your learnings to real startup companies and use your design and product-thinking skills to design your own digital product. This class is for all level of designers/builders - from newbie to pro!",
          syllabus:
            "./assets/syllabi/F18/IDEA258Z_F18.pdf",
          room: "ESJ2101",
          day: "Thursday",
          time: "2 PM - 3:15 PM"
        },
        {
          id: 37,
          department: "AASP",
          number: "299Y",
          title: "Introduction to Yoruba",
          facilitators: [
            { name: "OreOluwa Aluko", email: "oaluko@terpmail.umd.edu" },
          ],
          advisor: "Jason Nichols",
          credits: 1,
          description:
            "This is a beginner’s course for anyone who has had little to no exposure to Yorùbá or those who know Yorùbá but would like to learn how to read and write in the language. The main focus of this course will be basic greetings, sentence structure and vocabulary.",
          syllabus:
            "./assets/syllabi/F18/AASP299Y_F18.pdf",
          room: "WDS0104",
          day: "Monday",
          time: "3:30 PM - 4:45 PM"
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
          syllabus:
            "./assets/syllabi/F18/AASP299I_F18.pdf",
          room: "LEF1201",
          day: "Monday",
          time: "3:30 PM - 4:45 PM"
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
          syllabus:
            "./assets/syllabi/F18/CMSC389R_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated"
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
          syllabus:
            "./assets/syllabi/F18/AASP299T_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated" // TODO deprecate these fields completely
        },
        {
          id: 40,
          department: "CMSC",
          number: "389Y",
          title: "Practical Methods For Self Driving Cars",
          facilitators: [
            { name: "Michael Stevens", email: "msteven9@terpmail.umd.edu" },
          ],
          advisor: "Larry Davis",
          credits: 1,
          description:
            "This course aims to provide students with a practical understanding of popular algorithms used in self driving cars. Both traditional and deep learning approaches will be used to solve scene understanding and control.",
          syllabus:
            "./assets/syllabi/F18/CMSC389Y_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated" // TODO deprecate these fields completely
        },
        {
          id: 41,
          department: "CMSC",
          number: "389E",
          title: "Digital Logic through Minecraft",
          facilitators: [{ name: "Alex Brassel", email: "abrassel@umd.edu" }],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "This class explores the fundamentals of digital logic design using Minecraft's Redstone. Using the low-level and intuitive visualization of circuitry Redstone provides, you will create a series of projects that apply principles of digital logic design learned in class.",
          syllabus: "./assets/syllabi/F18/CMSC389E_F18.pdf",
          room: "deprecated",
          day: "deprecated",
          time: "deprecated"
        },
      ]
    },
    'spring 2019': {
      departments: ["CMSC"],
      classes: [
        {
          id: 42,
          department: "CMSC",
          number: "388D",
          title: "2D Game Engine Design",
          facilitators: [
            { name: "Sina Mirnejad", email: null },
            { name: "Saadiq Shaik", email: null }
          ],
          advisor: "David Mount",
          credits: 1,
          description:
            "This course will provide basic insight into the design process of a Java game engine, 2D graphics, and the mathematics behind it. The primary focus of the course will be on 2D game engines but will discuss ideas relevant to 3D environments.",
          syllabus: "./assets/syllabi/S19/CMSC388D_S19.pdf",
          website: null,
        },
        {
          id: 44,
          department: "CMSC",
          number: "389C",
          title: "Bitcoin and Other Cryptocurrencies",
          facilitators: [
            { name: "Cameron Payton", email: "cpayton@umd.edu" },
          ],
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
            { name: "Chirag Shankar", email: "chishankar@gmail.com" }
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
            { name: "Nelson Le", email: "nle@terpmail.umd.edu" }
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
            { name: "Ben Mariano", email: "benmar@cs.umd.edu" }
          ],
          advisor: "David Van Horn",
          credits: 1,
          description:
            "This course will explore elegant examples of functional programming. The first half will provide an introduction to Haskell and four important abstractions: monoids, functors, applicative functors, and monads. We will focus on simple and plentiful examples. The second half will cover a wide variety of functional programming techniques and applications.",
          syllabus: './assets/syllabi/S19/CMSC388F_S19.pdf',
          website: null,
        },
        {
          id: 48,
          department: "IDEA",
          number: "258D",
          title: "Explorations in Design",
          facilitators: [
            { name: "Tianxin Chen", email: "chen128@umd.edu" },
          ],
          advisor: "Meenu Singh",
          credits: 1,
          description:
            "Explorations in Design will give students the opportunity to apply their unique backgrounds to the realm of design. Students will engage in hands-on learning with real clients from various industries. We will explore how good and bad design plays a role in our everyday lives, from the way we order coffee to the logos you see to the signs that help you navigate (or get lost on) the metro.",
          syllabus: './assets/syllabi/S19/IDEA258D_S19.pdf',
          website: null,
        },
        {
          id: 49,
          department: "MATH",
          number: "299C",
          title: "Mathematics & Classical Music",
          facilitators: [
            { name: "Siri Neerchal", email: "siri@terpmail.umd.edu" },
          ],
          advisor: "Niranjan Ramachandran",
          credits: 1,
          description:
            "The aim of this course is to explore the historical discoveries in mathematics that have influenced Western classical music, as well as musical expressions of specific mathematical concepts. This course is not meant to be a rigorous introduction to music theory or mathematics; rather, it is focused on introducing students to classical music through mathematical ideas that appear in it. Students will also have an opportunity to explore mathematics through music in the form of a creative project.",
          syllabus: './assets/syllabi/S19/MATH299C_S19.pdf',
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
          description:
            "Exploring how to leverage 3D printing to improve performance and comfort of prosthetic devices.",
          syllabus: "./assets/syllabi/S19/ENME289P_S19.pdf",
          website: null,
        },
        {
          id: 52,
          department: "MATH",
          number: "299O",
          title: "Algorithms and Probability in Board Games with a Focus of Bridge",
          facilitators: [
            { name: "Hakan Berk", email: "hakan.t.berk@gmail.com" },
          ],
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
          facilitators: [
            { name: "Willem Wyndham", email: null },
          ],
          advisor: "Michael Hicks",
          credits: 1,
          description:
            "WebAssembly (wasm) is a new virtual machine designed by the four major browsers to run code almost as fast as native code. The goal is to add Operating System features to WebAssembly. To implement these features students will use AssemblyScript, a subset of Javascript which compiles to wasm.",
          syllabus: "./assets/syllabi/S19/CMSC389I_S19.pdf",
          website: null,
        },
        {
          id: 54,
          department: "CMSC",
          number: "389R",
          title: "Introduction to Ethical Hacking",
          facilitators: [
            { name: "Michael Reininger", email: null },
            { name: "Wesley Weidenhamer", email: null }
          ],
          advisor: "David Levin",
          credits: 1,
          description:
            "An introduction to ethical hacking geared towards entering the competitive world of cybersecurity Capture the Flag (CTF) competitions. Applications to a career in digital forensics, penetration testing, cryptology, and secure software development.",
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
            { name: "Ajeet Gary", email: "agary@terpmail.umd.edu" }
          ],
          advisor: "Jason Filippou",
          credits: 1,
          description:
            "Explores the fundamentals of digital logic design using Minecraft's Redstone. Using the low-level and intuitive visualization ofcircuitry Redstone provides, you will create a series of projects thatapply principles of digital logic design learned in class.",
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
            { name: "TBD", email: null },
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
            { name: "Tianxin Chen", email: "msoohyun88@gmail.com" },
            { name: "Ishaan Parikh", email: "parikh.i.m@gmail.com" },
          ],
          advisor: "Meenu Singh",
          credits: 2,
          description:
            "In this class, we will deconstruct the elements of a learning experience and consider each element as a variable to experiment with in your teaching. You will also have the opportunity to share and discuss your teaching experiences with fellow facilitators.",
          syllabus: "https://docs.google.com/document/d/1xaSIhIQpPZdrm8lI4tw9Xk1NfAertoY7Cu99AmCMjXk/edit?usp=sharing",
          website: null,
        }
      ],
    }
  }
};
