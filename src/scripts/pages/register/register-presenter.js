export default class RegisterPresenter {
  #view;
  #apiModel;

  constructor({ view, apiModel }) {
    this.#apiModel = apiModel;
    this.#view = view;
  }

  async register(name, email, password) {
    this.#view.showLoading();

    try {
      if (!this.#apiModel.validate.email(email)) {
        throw new Error('Invalid email');
      }
      if (!this.#apiModel.validate.password(password)) {
        throw new Error('Invalid password. Min 8 characters.');
      }

      const response = await this.#apiModel.register({ name, email, password });
      this.#view.renderRegisterSuccess();
      this.#view.resetForm();
    } catch (error) {
      const errorMsg =
        error.name === 'HTTPError'
          ? (await error.response.json()).message
          : typeof error === 'string'
            ? error
            : error.message || 'Something went wrong';

      this.#view.renderRegisterFailed(errorMsg);
    }
  }
}
