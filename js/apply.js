
 $(document).ready(function() {
  $('.dropdown').on('click', 'a.dept', function() {
    console.log("hello");
    const aki = $(this).attr('href');
    console.log(aki);
    // const david = $(aki).attr('id');
    // console.log(david);
   $(aki).css({'display':'block'});
      $('.guidelines').hide();
       $(aki).show();
   });
 });

// $(function() {
//     $('a.dropdown-content').click(function() {
//
//     $('#'+$(this).href
//
//
//   )
//
// }
//
// }




// $(document).ready(function(){
//   $('.guidelines').hide();
// });
//
// $(window).on('hashchange',function() {
//   if (window.location.hash == "#") {
//       $(n)
//
//   }





//   $('.apply').hide();
// });
//
// $(window).on('hashchange', function() {
//
//
//
// }
//
// )

//$(document).on('click', 'a.dept-option', function(e) {
//  const newDept = $(this).text();
//  $("selectedDept").text(newDept)
//  update(newDept);
// });

//function initializeDeptDropdown() {
//  for(department of DEPARTMENTS) {
//    $("departments").prepend(`<a href="#" //class="dept-option">${department}</a>`);)
//  }
// }

// $(document).ready(function(){
//     $().change(function(){
//         $(this).find().each(function(){
//             var optionValue = $(this).attr("value");
//             if(optionValue){
//                 $(".box").not("." + optionValue).hide();
//                 $("." + optionValue).show();
//             } else{
//                 $(".box").hide();
//             }
//         });
//     }).change();
// });
//document.getElementById("test").innerHTML= initializeGuidelineDrop;



// var DEPARTMENTS = ['MATH', 'CMSC', 'Other'];

// var GUIDELNES = {
