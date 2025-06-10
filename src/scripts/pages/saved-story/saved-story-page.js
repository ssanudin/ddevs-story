import Database from '../../data/database';
import { generateStoryItemTemplate } from '../../template';
import { notifAutoClose } from '../../utils';
import { getAuth, isLoggedIn, logout } from '../../utils/auth';
import SavedStoryPresenter from './saved-story-presenter';

export default class SavedStoryPage {
  #presenter;

  async render() {
    return `
      <section id="stories" class="max-w-2xl mx-auto">
        <div class="text-center mt-10 text-gray-700">Loading stories...</div>
      </section>
    `;
  }
  Sa;
  async afterRender() {
    this.#presenter = new SavedStoryPresenter({
      view: this,
      apiModel: { isLoggedIn, getAuth },
      dbModel: Database,
    });

    await this.#presenter.loadStories();
  }

  renderStories(stories, initial = false) {
    if (Array.isArray(stories)) {
      if (stories.length === 0) {
        document.body.querySelector('#stories').innerHTML = `
          <p class="text-center mt-10 mb-6 text-gray-700">You don't have any saved stories.</p>
          <a href="#/" class="block text-center text-sky-700 hover:underline"><i class="fa-solid fa-arrow-left"></i> Go back to Home</a>
        `;
        return;
      }

      document.body.querySelector('#stories').innerHTML = `
        <ul id="story-list"></ul>
      `;

      stories.forEach((story) => {
        const cardHTML = generateStoryItemTemplate(story);
        document.body.querySelector('#story-list').insertAdjacentHTML('beforeend', cardHTML);
      });
    }
  }

  renderStoriesFailed(errorMsg) {
    document.body.querySelector('#story-list').innerHTML += `
      <div id="reload-story" class="flex flex-col justify-center items-center mt-10">
        <p>${errorMsg}.</p>
        <p>Please reload.</p>
        <button id="reload-button" class="flex justify-center items-center flex-col gap-1 mt-4 px-8 py-3 border border-sky-600 text-sky-600 rounded-[1rem] hover:bg-sky-600 hover:text-white">
          <i class="fa-solid fa-rotate-right"></i>
          Reload
        </button>
      </div>
    `;
    const reloadButton = document.body.querySelector('#reload-button');
    reloadButton.addEventListener('click', () => {
      this.#presenter.loadStories();
      document.body.querySelector('#reload-story').remove();
    });
  }

  renderSessionExpired() {
    notifAutoClose
      .fire({
        icon: 'warning',
        title: 'Session expired',
        text: 'Redirecting to login page. Please log in.',
      })
      .then((result) => {
        if (result.isDismissed) {
          logout();
        }
      });
  }
}
