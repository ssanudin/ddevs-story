export default class HomePresenter {
  #apiModel;
  #view;
  #token;
  #page;
  #loading;

  constructor({ view, apiModel }) {
    this.#apiModel = apiModel;
    this.#view = view;
    this.#page = 1;
    this.#loading = false;
    this.size = 10;
  }

  async loadStories() {
    if (this.#loading) return;
    this.#loading = true;

    if (!this.#apiModel.isLoggedIn()) {
      this.#view.renderSessionExpired();
      return;
    } else if (!this.#token) {
      this.#token = await this.#apiModel.getAuth('token');
    }

    try {
      const listStory = await this.fetchStories();

      this.#view.renderStories(listStory, this.#page === 1);
      this.#page += 1;
      this.#loading = false;
    } catch (error) {
      const errorMsg =
        error.name === 'HTTPError'
          ? (await error.response.json()).message
          : typeof error === 'string'
            ? error
            : error.message || 'Something went wrong';

      this.#loading = false;
      this.#view.renderStoriesFailed(this.#page === 1, errorMsg);
    }
  }

  async fetchStories() {
    try {
      const response = await this.#apiModel.getStories({
        token: this.#token,
        page: this.#page,
        size: this.size,
      });

      return response.listStory;
    } catch (networkError) {
      console.warn('Network failed, trying cache…', networkError);

      const url = `${getApiUrl('stories')}?page=${this.#page}&size=${this.size}&location=0`;
      const cache = await caches.open('story-api');
      const cachedResp = await cache.match(url);
      if (cachedResp) {
        const data = await cachedResp.json();
        return data.listStory;
      }

      throw networkError;
    }
  }
}
