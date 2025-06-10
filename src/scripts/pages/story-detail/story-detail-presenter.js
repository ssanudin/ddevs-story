export default class StoryDetailPresenter {
  #storyId;
  #storyData;
  #view;
  #apiModel;
  #dbModel;
  #token;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
    this.#view = view;
  }

  async getStoryDetail() {
    if (!this.#apiModel.isLoggedIn()) {
      this.#view.renderSessionExpired();
      return;
    } else if (!this.#token) {
      this.#token = await this.#apiModel.getAuth('token');
    }

    try {
      const response = await this.#apiModel.getStoryDetail(this.#token, this.#storyId);
      const { story } = response;
      this.#storyData = story;

      this.#view.renderStoryDetail(story, await this.isBookmarked());
    } catch (error) {
      const errorMsg =
        error.name === 'HTTPError'
          ? (await error.response.json()).message
          : typeof error === 'string'
            ? error
            : error.message || 'Something went wrong';

      if (errorMsg === 'Story not found') {
        await this.bookmarkStory('remove');
      }
      this.#view.renderStoryDetailFailed(errorMsg);
    }
  }

  async bookmarkStory(operation) {
    if (operation === 'add') {
      if (this.#storyData) {
        const dbPut = await this.#dbModel.putStory(this.#storyData);
      }
    } else if (operation === 'remove') {
      const dbDelete = await this.#dbModel.removeStory(this.#storyId);
    }

    if (this.#storyData) {
      this.#view.renderBookmarkBtn(await this.isBookmarked());
    }
  }

  async isBookmarked() {
    const obj1 = this.#storyData;
    const obj2 = await this.#dbModel.getStoryById(this.#storyId);

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }
}
