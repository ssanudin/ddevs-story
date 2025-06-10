export default class SavedStoryPresenter {
  #apiModel;
  #dbModel;
  #view;
  #loading;

  constructor({ view, apiModel, dbModel }) {
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
    this.#view = view;
    this.#loading = false;
  }

  async loadStories() {
    if (this.#loading) return;
    this.#loading = true;

    if (!this.#apiModel.isLoggedIn()) {
      this.#view.renderSessionExpired();
      return;
    }

    try {
      const listStory = await this.#dbModel.getAllStroy();

      this.#view.renderStories(listStory);
      this.#loading = false;
    } catch (error) {
      const errorMsg =
        error.name === 'HTTPError'
          ? (await error.response.json()).message
          : typeof error === 'string'
            ? error
            : error.message || 'Something went wrong';

      this.#loading = false;
      this.#view.renderStoriesFailed(errorMsg);
    }
  }
}
