let page = setPage();
mngNav();

function setPage() {
  let page = 0;
  let search = window.location.search;
  if (search.includes("page")) {
    let arr = search.split("page=");
    page = parseInt(arr[arr.length - 1]);
  }

  return page;
}

function mngNav() {
  if (page === 0) $(".navPrev").parent().addClass("disabled");
  if ($(".navPage").length / 2 === page + 1)
    $(".navNext").parent().addClass("disabled");
  $(".navPage").each((e) => {
    let element = $(".navPage")[e];
    if (parseInt($(element).attr("page")) === page) {
      $(element).parent().addClass("active");
    }
  });
}

function navPage(page) {
  let arrHref = window.location.href.split("?");
  let arrParams = null;
  if (arrHref.length > 1) arrParams = arrHref[1].split("&");
  if (arrParams === null || arrParams[0].includes("page")) {
    window.location.href = arrHref[0].concat(`?page=${page}`);
  } else {
    window.location.href = arrHref[0].concat(`?${arrParams[0]}&page=${page}`);
  }
}

$("#title").on("click", () => {
	window.location.href = "?";
});

$("#queryRandom").on("click", () => {
	window.location.href = "?random=true";
});

$("#queryText").on("keyup", () => {
	if ($("#queryText").val().trim() === "") {
		$("#querySubmit").addClass("disabled");
	} else {
		$("#querySubmit").removeClass("disabled");
	}
});

$("#querySubmit").on("click", () => {
	let query = "?";
	query = query.concat($("#queryType").val());
	query = query.concat("=");
	query = query.concat($("#queryText").val().trim());
	window.location.href = query;
});

$(".navPrev").on("click", (e) => {
  navPage(page - 1);
});

$(".navNext").on("click", (e) => {
  navPage(page + 1);
});

$(".navPage").on("click", (e) => {
  const page = parseInt($(e.target).attr("page"));
  navPage(page);
});

$(".movie").each((e) => {
  let element = $(".movie")[e];
  let poster = $(element).find(".poster")[0];
  let rating = $(element).find(".ratings")[0];
  fetch("/movie-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imdbID: element.id }),
  })
    .then((response) => response.text())
    .then((text) => {
      const json = JSON.parse(text);
      $(poster).attr("src", json.poster);
      rating.innerHTML = rating.innerHTML.concat(" " + json.ratings);
    });
});

$(".poster").each((e) => {
  let element = $(".poster")[e];
  let width = $(element).width();
  $(element).attr("style", `height: ${width * 1.5}px;`);
});
