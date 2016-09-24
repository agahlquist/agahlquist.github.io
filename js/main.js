"use strict";

$(document).ready(function() {
  var mobile = checkSize();

  var hovered;
  var active = $('#nav-about');
  var activeProject = $('#webButton');
  var currentContent = $('.about');
  var movingContent;
  
  var projects = [
    {
      title: "SHIRIN SALEMNIA'S SITE",
      desc: "<p>Shirin’s site was one of my first projects for an actual client. Her site was actually the first personal site I ever made and I used a lot of what I learned in making that to make this site. During production, I focused on improving my knowledge of <em class='em-projects'>jQuery</em>, <em class='em-projects'>PHP</em>, and <em class='em-projects'>media queries</em> for sites in order to make a responsive and interactive site.</p>",
      img: 'img/projects/shirin.png',
      alt: 'Shirin Salemnia Site',
      link: 'http://shirinlaorrazsalemnia.com/'
    },
//    {
//      title: 'DIE BUDDY',
//      desc: "<p>Die Buddy is a <em class='em-projects'>multi-user web app</em> that allows users to either host a room or connect to an existing room. There, they can create simple DnD character sheets with basic attributes and roll different amounts of numbered die that are broadcasted to each user in the room.</p><p>This project was made for my Rich Media II class and utilized an <em class='em-projects'>MVC structure</em> along with <em class='em-projects'>node.js</em>, <em class='em-projects'>MongoDB</em>, <em class='em-projects'>Redis</em>, and <em class='em-projects'>Jade</em> in order to create it.</p>",
//      img: '',
//      alt: '',
//      link: 'https://diebuddy.herokuapp.com/'
//    },
    {
      title: 'BATTLEBALLS',
      desc: "<p>BattleBalls was initially a two person project for my Casual Games class. When we decided to continue to work on it, we brought on a third in order to effectively handle the workload. BB is a <em class='em-projects'>multiplayer battle arena game</em> that utilizes a smartphone as a controller and a computer as a game screen. Multiple users connect to the same room and use the accelerometer on their phone to control their avatar in game.</p><p>For this, we used <em class='em-projects'>node.js</em>, <em class='em-projects'>MongoDB</em>, <em class='em-projects'>Redis</em>, and <em class='em-projects'>HTML’s Canvas Rendering Context</em>.</p>",
      img: 'img/projects/battleballs.jpg',
      alt: 'Battle Balls',
      link: 'https://battleballs.herokuapp.com/'
    },
    {
      title: 'THE CRAWL',
      desc: "<p>The Crawl was a project for my Rich Media I class wherein we had to combine <em class='em-projects'>two APIs</em> together to create a <em class='em-projects'>web app</em>.  In it, users can search for the locations of bars using either their current location or searching an address/city. From there, they can select bars to add to their bar crawling route and the app will give the user the shortest walking directions between each bar.</p><p>For this, I mashed <em class='em-projects'>Google’s Directions</em> and <em class='em-projects'>Maps APIs</em> together using <em class='em-projects'>JavaScript</em>.</p>",
      img: 'img/projects/thecrawl.jpg',
      alt: 'The Crawl',
      link: 'demo/TheCrawl'
    },
    {
      title: 'THE ANIMAKER',
      desc: "<p>The Animaker was a two person project and my first for Rich Media I. We create a <em class='em-projects'>simple online animation tool</em> that allows users to drag and drop images into a frame, reposition the frame, add/delete frames, and playback what the user has already created.</p><p>For this, we simply used <em class='em-projects'>HTML</em>, <em class='em-projects'>CSS</em>, and <em class='em-projects'>JavaScript</em>.</p>",
      img: 'img/projects/animaker.png',
      alt: 'The Animaker',
      link: 'demo/TheAnimaker'
    }
  ];
  
  var acting = [
    {
      title: 'COMING SOON!',
      desc: "",
      img: '',
      alt: '',
      link: ''
    }
  ];

  //handle nav hovering
  $('.nav-bar li').hover(function() {
    if(!mobile) {
      hovered = $(this);
      if(!$(this).hasClass('nav-active')) {
        hovered.stop().animate({
          width: '165px'
        }, 200, 'swing');
      }
    }
  }, function () {
    if(!mobile) {
      hovered.stop().animate({
        width: '150px'
      }, 200, 'swing');
    }
  });

  //handle nav clicking
  $('nav li').click(function() {
    if(!mobile) {
      if(!$(this).hasClass('nav-active') && !$("nav[class='nav-bar'] ul").hasClass('disabled')) {
        $("nav[class='nav-bar'] ul").addClass('disabled');

        hovered.animate({
          width: '175px'
        }, 100, 'linear', function() {
          hovered.animate({
            width: '150px'
          }, 400, 'easeOutBounce');
        });

        switch($(this).attr('id')) {
          case 'nav-about':
            movingContent = $('.about');
            break;
          case 'nav-projects':
            movingContent = $('.projects');
            break;
          case 'nav-contact':
            movingContent = $('.contact');
            break;
        }

        movingContent.removeClass('hidden');

        movingContent.css({
          zIndex: '-2',
          top: $(window).scrollTop()
        });

        $('#nav-bg2').css('background-color', $(this).css('background-color'));
        $('#nav-bg2').stop().animate({
          left: 0
        }, 800, 'easeOutBounce', function() {
          $('#nav-bg').css('background-color', $('#nav-bg2').css('background-color'));
          $('#nav-bg2').css('left', '-200px');
        });

        movingContent.animate({
          left: 0
        }, 800, 'easeOutBounce', function() {

          movingContent.css({
            top: 0,
            scrollTop: 0
          });

          currentContent.css({
            zIndex: '-2',
            left: '100vw'
          });
          currentContent.addClass('hidden');
          currentContent = movingContent;
          currentContent.css({
            zIndex: '-5'
          });

          $("nav[class='nav-bar'] ul").removeClass('disabled');
        });

        active.removeClass('nav-active');
        active = $(this);
        active.addClass('nav-active');
      }
    } else {
      if(!$(this).hasClass('nav-active') && !$("nav[class='nav-bar'] ul").hasClass('disabled')) {
        $("nav[class='nav-bar'] ul").addClass('disabled');

        switch($(this).attr('id')) {
          case 'nav-about':
            $('.nav-bar').animate({
              backgroundColor: '#438EC8'
            });
            movingContent = $('.about');
            break;
          case 'nav-projects':
            $('.nav-bar').animate({
              backgroundColor: '#3BC6B6'
            });
            movingContent = $('.projects');
            break;
          case 'nav-contact':
            $('.nav-bar').animate({
              backgroundColor: '#9957CD'
            });
            movingContent = $('.contact');
            break;
        }

        movingContent.css({
          zIndex: '-2',
          top: $(window).scrollTop()
        });

        movingContent.removeClass('hidden');

        currentContent.animate({
          left: '-100vw'
        }, 300, 'linear', function() {
          movingContent.css({
            top: 0,
            scrollTop: 0
          });

          currentContent.css({
            zIndex: '-5',
            left: '0'
          });
          currentContent.addClass('hidden');

          currentContent = movingContent;
          movingContent.css('z-index', '-1');

          $("nav[class='nav-bar'] ul").removeClass('disabled');
        });

        active.removeClass('nav-active');
        active = $(this);
        active.addClass('nav-active');
      }
    }
  });

  //handle project button click
  $('.project-nav').click(function() {
    if($(this).hasClass('project-nav-active')) {
      return;
    } else {
      var that = this;
      
      if(!$("h2[class='project-nav']").hasClass('disabled')) {
        $("h2[class='project-nav']").addClass('disabled');
        
        $(activeProject).removeClass('project-nav-active');
        activeProject = this;
        $(activeProject).addClass('project-nav-active');
        
        $('#activeProjectsWrapper').stop().animate({
          height: 0,
        }, 600, 'easeOutExpo', function() {
          switch($(that).attr('id')) {
            case 'webButton':
              loadProjectContent(projects);
              break;
            case 'actButton':
              loadProjectContent(acting);
              break;
          }
          $('#activeProjectsWrapper').stop().animate({
            height: $('#activeProjects').height()
          }, 1000, 'easeInOutExpo', function() {
            $("h2[class='project-nav']").removeClass('disabled');
          });
        });
      }
    }
  });

  loadProjectContent(projects);
  $(window).resize(checkSize);
});

function checkSize() {
  if($('#nav-bg').css('display') == 'none')
    return true;
  else
    return false;
}

function loadProjectContent(data) {
  $('#activeProjects').empty();
  
  $.each(data, function(i, project) {
    if(project.link != '') {
      $('#activeProjects').append("<div class='project'>" +
                                    "<div class='project-top'>" +
                                      "<img class='project-img' src='" + project.img + "' alt='" + project.alt + "' />" +
                                      "<h2 class='project-text'>" + project.title + "</h2>" +
                                    "</div>" +
                                    "<p>" + project.desc + "</p>" +
                                    "<p>Click <em><a href='" + project.link + "' target='_blank'>HERE</a></em> to check it out!" +
                                  "</div>");
    } else {
      $('#activeProjects').append("<div class='project'>" +
                                "<h2>" + project.title + "</h2>" +
                                "<p>" + project.desc + "</p>" +
                              "</div>");
    }
  });
}