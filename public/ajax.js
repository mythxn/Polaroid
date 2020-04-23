$("#newComment").submit(function (e) {
  e.preventDefault();
  var comment = $(this).serializeArray();
  console.log(comment);
  var text = comment[0].value;
  var name = comment[1].value;
  var author = comment[2].value;

  $.post("/polaroids/" + name + "/comments", comment, function (data) {
    $("#commentsView").append(
      `
       <div class="col-md-12">
          <strong>${author}</strong>
          <p>${text}</p>
        </div>
       `
    );
  });
});

$("#newPost").submit(function (e) {
  e.preventDefault();
  var post = $(this).serializeArray();
  var name = post[0].value;
  var image = post[1].value;
  var desc = post[2].value;
  var author = post[3].value;

  $.post("/polaroids/", post, function (data) {
    location.reload();
  });
});

$("#logoutButton").click(function (e) {
  e.preventDefault();

  $.post("/logout", function () {
    location.reload();
  });
});

$("#loginForm").submit(function (e) {
  e.preventDefault();
  var credentials = $(this).serializeArray();
  var username = credentials[0].value;
  var password = credentials[1].value;
  var auth = {
    username: username,
    password: password,
  };

  $.post("/login", auth, function () {
    location.reload();
  });
});

$("#registerForm").submit(function (e) {
  e.preventDefault();
  var credentials = $(this).serializeArray();
  var username = credentials[0].value;
  var password = credentials[1].value;
  var auth = {
    username: username,
    password: password,
  };

  $.post("/register", auth, function () {
    location.reload();
  });
});

$("#search").on("input", function (e) {
  e.preventDefault();
  console.log(e.target.value);
  $.get(`/polaroids?keyword=${encodeURIComponent(e.target.value)}`, function (
    data
  ) {
    $("#polaroidResults").html("");
    data.forEach(function (polaroid) {
      $("#polaroidResults").append(
        `
				<div class="col-md-3 col-sm-6">
         <div class="thumbnail" style="min-height:90%;">
            <img src=" ${polaroid.image}" style="min-width: 100%; max-height: 200px; object-fit: cover;">
            <div class="caption">
               <h4>  ${polaroid.name} </h4>
               <em> ${polaroid.name}</em>
            </div>
            <p>
               <a href="/polaroids/${polaroid.name}" class="btn btn-primary">More Info</a>
            </p>
         </div>
      </div>
				`
      );
    });
  });
});

$(".moreInfo").click(function (e) {
  e.preventDefault();
  var nameOfPost = $(this).attr("data");

  $.get("polaroids/" + nameOfPost, function (page) {
    $("body").html(page);
  });
});
