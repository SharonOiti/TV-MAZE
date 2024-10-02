"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Given a search term, search for TV shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
  const response = await $.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  
  return response.map(show => ({
    id: show.show.id,
    name: show.show.name,
    summary: show.show.summary,
    image: show.show.image ? show.show.image.medium : "https://tinyurl.com/tv-missing"
  }));
}

/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(`
      <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
        <div class="media">
          <img
            src="${show.image}"
            alt="${show.name}"
            class="w-25 me-3">
          <div class="media-body">
            <h5 class="text-primary">${show.name}</h5>
            <div><small>${show.summary}</small></div>
            <button class="btn btn-outline-light btn-sm Show-getEpisodes">
              Episodes
            </button>
          </div>
        </div>
      </div>
    `);

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display. */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  const response = await $.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return response.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
}

/** Populate the episode list into the DOM */
function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(`
      <li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
    `);
    $episodesList.append($episode);
  }

  $episodesArea.show(); // Show the episodes area
}

/** Handle click on Episodes button to get and display episodes */
$("#showsList").on("click", ".Show-getEpisodes", async function() {
  const showId = $(this).closest(".Show").data("show-id"); // Get show ID from data attribute
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});
