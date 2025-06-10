export default class LoginPresenter {
  #view;
  #apiModel;

  constructor({ view, apiModel }) {
    this.#apiModel = apiModel;
    this.#view = view;
  }

  async auth(email, password) {
    this.#view.showLoading();

    try {
      if (!this.#apiModel.validate.email(email)) {
        throw new Error('Invalid email');
      }
      if (!this.#apiModel.validate.password(password)) {
        throw new Error('Invalid password');
      }

      const response = await this.#apiModel.login({ email, password });
      const { loginResult } = response;

      this.#view.resetForm();
      this.#apiModel.setAuth(loginResult);
      this.#view.renderLoginSuccess();
    } catch (error) {
      const errorMsg =
        error.name === 'HTTPError'
          ? (await error.response.json()).message
          : typeof error === 'string'
            ? error
            : error.message || 'Something went wrong';

      this.#view.renderLoginFailed(errorMsg);
    }
  }

  isLoggedIn() {
    if (this.#apiModel.isLoggedIn()) {
      this.#view.renderLoginSuccess('Please continue your session');
    }
  }
}
