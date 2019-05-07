var accessToken = "<<ACCESS_TOKEN>>";
var baseUrl = "https://api.api.ai/v1/";
$(document).ready(function() {
  $("#input").keyup(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      var text = $("#input")
        .val()
        .trim();
      setInput(text, "text");
    }
    if (event.which == 8) {
      if ($(this).val() != "") {
        $("#rec")
          .addClass("send")
          .html('<i class="fa fa-arrow-right"></i>');
      } else {
        $("#rec")
          .removeClass("send")
          .html('<i class="fa fa-microphone"></i>');
      }
    } else {
      $("#rec")
        .addClass("send")
        .html('<i class="fa fa-arrow-right"></i>');
    }
  });

  $("#rec").click(function(event) {
    if ($("#rec").hasClass("send")) {
      setInput(
        $("#input")
          .val()
          .trim(),
        "text"
      );
    } else {
      switchRecognition();
    }
  });

  $(".btn-sidebar").click(function() {
    $(".sidebar").addClass("active");
  });
  $(".btn-sidebar-close").click(function() {
    $(".sidebar").removeClass("active");
  });
});
var recognition;
function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.onstart = function(event) {
    updateRec();
  };
  recognition.onresult = function(event) {
    var text = "";
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      text += event.results[i][0].transcript;
    }
    setInput(text, "voice");
    stopRecognition();
  };
  recognition.onend = function() {
    stopRecognition();
  };
  recognition.lang = "en-US";
  recognition.start();
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  updateRec();
}
function switchRecognition() {
  if (recognition) {
    stopRecognition();
  } else {
    startRecognition();
  }
}
function setInput(text, type) {
  $("#input")
    .val("")
    .attr("data-last", type);
  setResponse(text, "req", "response .res-inner");
  send(text);
}
function updateRec() {
  $("#rec").html(
    recognition
      ? '<i class="fa fa-stop"></i>'
      : '<i class="fa fa-microphone"></i>'
  );
}
function send(text) {
  if (text == "") {
    setResponse(
      `Please input something for example 'Let's Go'`,
      "err",
      "input"
    );
  } else {
    if (
      $("#response .res-inner").height() <
      $("#response .res-inner").prop("scrollHeight")
    ) {
      $("#response .res-inner").animate(
        {
          scrollTop: $("#response .res-inner").prop("scrollHeight")
        },
        1000
      );
    }
    $.ajax({
      type: "POST",
      url: baseUrl + "query?v=20150910",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        Authorization: "Bearer " + accessToken
      },
      data: JSON.stringify({
        query: text,
        lang: "en",
        sessionId: "somerandomthing"
      }),
      beforeSend: function() {
        typing();
      },
      success: function(data) {
        resetInput();
        clearAni();
        data.result.fulfillment.messages.forEach(message => {
          setTimeout(() => {
            typing();
            scroll();
          }, 500);
          setTimeout(() => {
            clearAni();
            setResponse(message.speech, "res", "response .res-inner");
            if ($("#input").attr("data-last") == "voice") {
              speakResponce(message.speech);
            }
            scroll();
          }, 1000);
        });
      },
      error: function() {
        setResponse("Internal Server Error", "err", "input");
      }
    });
  }
}
function setResponse(val, type, place) {
  if (val != "") {
    $(`#${place}`).append(`<div class='${type}'>${val}</div>`);
  }
}
function clearAni() {
  $("#response .res-inner .res.ani").remove();
}
function resetInput() {
  $("#rec")
    .removeClass("send")
    .html('<i class="fa fa-microphone"></i>');
}
function typing() {
  let html = `
				<div class="animate-ball"></div>
				<div class="animate-ball"></div>
				<div class="animate-ball"></div>
				<div class="animate-ball"></div>
			`;
  setResponse(html, "res ani", "response .res-inner");
}
function scroll() {
  $("#response .res-inner").height() <
  $("#response .res-inner").prop("scrollHeight")
    ? $("#response .res-inner").animate({
        scrollTop: $("#response .res-inner").prop("scrollHeight")
      })
    : console.log("lala");
}
function speakResponce(message) {
  message = message.split("<br><br>");
  message.forEach(text => {
    if (/^Meaning:/.test(text.trim())) {
      let synth = window.speechSynthesis;
      let utterThis = new SpeechSynthesisUtterance(text);
      synth.speak(utterThis);
    }
  });
}
