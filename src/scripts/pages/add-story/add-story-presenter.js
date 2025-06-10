import { addStory } from '../../data/api';

export default class AddStoryPresenter {
  #apiModel;
  #view;
  #token;

  constructor({ view, apiModel }) {
    this.#apiModel = apiModel;
    this.#view = view;
  }

  async addStory(formData, isGuest = false) {
    this.#view.showLoading();

    try {
      if (!isGuest && !this.#apiModel.isLoggedIn()) {
        this.#view.renderSessionExpired();
        return;
      } else if (!this.#token) {
        this.#token = await this.#apiModel.getAuth('token');
      }

      const { description, photo, lat, lon } = formData;

      if (!photo) {
        throw new Error('You have not taken a photo.');
      } else if (photo && photo.size > 1024 * 1024) {
        throw new Error('Photo size is too large. Max 1MB');
      }

      const data = new FormData();
      data.append('photo', photo);
      if (description) data.append('description', description);
      if (lat) data.append('lat', lat);
      if (lon) data.append('lon', lon);

      const response = await addStory({
        story: data,
        token: this.#token || '',
        isGuest,
      });

      this.#view.resetForm();
      this.#view.renderAddStorySuccess();
    } catch (error) {
      const errorMsg =
        error.name === 'HTTPError'
          ? (await error.response.json()).message
          : typeof error === 'string'
            ? error
            : error.message || 'Something went wrong';

      this.#view.renderAddStoryFailed(errorMsg);
    }
  }

  isLoggedIn() {
    if (!this.#apiModel.isLoggedIn()) {
      this.#view.renderSessionExpired('Please log in before uploading a story.');
    }
  }
}
