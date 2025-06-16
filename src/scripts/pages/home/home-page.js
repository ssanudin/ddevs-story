import { getApiUrl, getStories } from '../../data/api';
import { generateStoryItemTemplate } from '../../template';
import { notifAutoClose } from '../../utils';
import { getAuth, isLoggedIn, logout } from '../../utils/auth';
import HomePresenter from './home-presenter';

export default class HomePage {
  #presenter;
  #sentinel;
  #observer;

  async render() {
    return `
      <section id="stories" class="max-w-2xl mx-auto">
        <div class="text-center mt-10 text-gray-700">Loading stories...</div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      apiModel: { getStories, isLoggedIn, getAuth, getApiUrl },
    });

    this.#observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.#presenter.loadStories();
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    await this.#presenter.loadStories();
  }

  renderStories(stories, initial = false) {
    if (Array.isArray(stories)) {
      if (initial) {
        document.body.querySelector('#stories').innerHTML = `
          <ul id="story-list"></ul>
          <div id="scroll-sentinel" class="h-1"></div>
        `;

        this.#sentinel = document.body.querySelector('#scroll-sentinel');
        this.#observer.observe(this.#sentinel);
      }
      if (stories.length < this.#presenter.size) {
        this.#observer.unobserve(this.#sentinel);
      }

      stories.forEach((story) => {
        const cardHTML = generateStoryItemTemplate(story);
        document.body.querySelector('#story-list').insertAdjacentHTML('beforeend', cardHTML);
      });
    }
  }

  renderStoriesFailed(initial, errorMsg) {
    if (this.#sentinel) {
      this.#observer.unobserve(this.#sentinel);
    }

    document.body.querySelector(initial ? '#stories' : '#story-list').innerHTML += `
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

      if (this.#sentinel) {
        this.#observer.observe(this.#sentinel);
      }
    });
  }

  renderSessionExpired(neverLogin = false) {
    if (neverLogin) {
      logout();
      return;
    }

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
