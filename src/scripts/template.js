import { escapeHtml, showFormattedDate } from './utils';

export function generateStoryItemTemplate({
  id,
  photoUrl,
  name,
  description,
  lat,
  lon,
  createdAt,
}) {
  return `
    <li class="story-item">
      <a href="#/story/${id}" class="card-story" data-id="${id}" aria-labelledby="story-title-${id}" aria-describedby="story-desc-${id} story-date-${id}">
        <div class="flex items-center px-4 py-3">
          <img class="w-10 h-10 rounded-full object-cover" src="https://ui-avatars.com/api/?background=0D8ABC&color=fff&rounded=true&name=${name}" alt="Avatar of ${name}" loading="lazy" />
          <div class="ml-3">
            <div id="story-title-${id}" class="text-md font-semibold text-gray-900">${name}</div>
            ${
              lat && lon
                ? `
              <div class="text-sm text-gray-700 flex items-center" aria-label="Location coordinates">
                <i class="fa-solid fa-location-dot me-1"></i>
                <span class="truncate w-50">Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</span>
              </div>
            `
                : ''
            }
          </div>
        </div>
        <!-- photo -->
        <div class="bg-gray-500 min-h-[150px] sm:min-h-[250px] w-full flex justify-center items-center">
          <img class="w-full object-contain  min-h-fit story-item-image" src="${photoUrl}" alt="${name}" loading="lazy" />
        </div>
        <!-- caption -->
        <div class="px-4 pt-3 pb-4">
          <p id="story-desc-${id}" class="text-md flex items-center">
            <span class="font-semibold text-gray-900 truncate max-w-50 inline-block" title="${name}">${name}</span>
            <span class="ml-2 text-gray-900 truncate max-w-50 inline-block">${escapeHtml(description)}</span>
          </p>
          <p id="story-date-${id}" class="text-sm text-gray-700">${showFormattedDate(createdAt)}</p>
        </div>
      </a>
    </li>
  `;
}

export function generateStoryDetailTemplate(
  { id, photoUrl, name, description, lat, lon, createdAt },
  isBookmarked
) {
  return `
    <article id="${id}" tabindex="-1" class="max-w-2xl mx-auto bg-white overflow-hidden" aria-labelledby="story-title-${id}" aria-describedby="story-desc-${id} story-date-${id}">
      <div class="aspect-w-16 aspect-h-9 bg-gray-500" role="img" aria-label="Photo of ${name}">
        <img
          src="${photoUrl}"
          alt="${name}"
          class="story-detail-image w-full h-full object-cover min-h-[250px]"
          loading="lazy"
        />
      </div>

      <div class="p-6 flex flex-col relative">
        <h2 id="story-title-${id}" class="text-2xl font-bold text-gray-900 mb-2">${name}</h2>
        <p id="story-date-${id}" class="text-sm text-gray-700 mb-4">${showFormattedDate(createdAt)}</p>
          <p id="story-desc-${id}" class="text-gray-800 mb-4 break-words">
            ${escapeHtml(description)}
          </p>

        <button id="bookmark-btn" aria-label="Bookmark story" data-status="${isBookmarked ? '1' : '0'}" class="absolute top-6 right-6 text-sky-700 hover:text-red-400 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 rounded">
          ${generateBookmarkBtnContent(isBookmarked)}
        </button>

        ${lat && lon ? '<div id="map" class="w-full h-64 rounded-md"></div>' : ''}
      </div>
    </article>
  `;
}

export function generateBookmarkBtnContent(isBookmarked) {
  return `
    <i class="fa-solid ${isBookmarked ? 'fa-book-bookmark' : 'fa-bookmark'}"></i>
    ${isBookmarked ? 'Saved' : 'Save story'}
  `;
}

export function generateMainNavMenu(isSubscribed, subscribeBtnDisabled) {
  return `
    <a href="/#/" class="flex flex-col items-center text-xs hover:underline">
      <i class="fa-solid fa-house h-[1.5rem]! mb-1"></i>
      Home
    </a>
    <a href="/#/add-story" class="flex flex-col items-center text-xs hover:underline">
      <i class="fa-solid fa-circle-plus h-[1.5rem]! mb-1"></i>
      Add Story
    </a>
    <button type="button" id="subscribe-btn" data-text="${isSubscribed ? 'unsubscribe' : 'subscribe'}" class="flex flex-col items-center text-xs hover:underline hover:cursor-pointer disabled:text-gray-400"${subscribeBtnDisabled ? 'disabled' : ' '} >
      ${generateSubscribeBtnContent(isSubscribed)}
    </button>
  `;
}

export function generateSubscribeBtnContent(isSubscribed) {
  return isSubscribed
    ? '<i class="fa-solid fa-bell-slash h-[1.5rem]! mb-1"></i> Unsubscribe'
    : '<i class="fa-solid fa-bell h-[1.5rem]! mb-1"></i> Subscribe';
}

export function generateProfileBtnContent(name = 'My Profile') {
  return `
    <img src="https://i.pravatar.cc/40" alt="${name}" class="w-8 h-8 rounded-full" />
    <span class="text-sm hidden sm:inline ms-1">${name}</span>
  `;
}

export function generateDropdownMenu() {
  return `
    <div class="p-1">
      <a
        href="/#/saved-story"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-sky-700"
      >
        <i class="fa-solid fa-book-bookmark"></i>
        Saved Story
      </a>
    </div>
    <hr class="my-1 border-gray-300" />
    <div class="p-1">
      <a
        href="/#/logout"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-400"
      >
        <i class="fa-solid fa-right-from-bracket"></i>
        Logout
      </a>
    </div>
  `;
}
