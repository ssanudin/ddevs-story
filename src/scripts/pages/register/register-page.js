import { registerUser } from '../../data/api';
import {
  actionLoading,
  notifAutoClose,
  notifCommon,
  validateEmail,
  validatePassword,
} from '../../utils';
import RegisterPresenter from './register-presenter';

export default class RegisterPage {
  #presenter;

  async render() {
    return `
      <section id="register-section" class="flex justify-center h-125 mt-20"> 
        <div class="w-full h-fit max-w-sm p-6 bg-white rounded-2xl shadow-xl/30">
          <h2 class="text-2xl font-bold mb-6 text-center">Create Account Form</h2>
          <form id="register-form">
            <div class="mb-4">
              <label for="name" class="block mb-1 font-medium">Name</label>
              <input id="name" type="text" autocomplete="fullname" required class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div class="mb-4">
              <label for="email" class="block mb-1 font-medium">Email</label>
              <input id="email" type="email" autocomplete="email" required class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div class="mb-4">
              <label for="password" class="block mb-1 font-medium">Password</label>
              <input id="password" type="password" autocomplete="current-password" required class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <div class="mt-2 flex items-center">
                <input id="show-password" type="checkbox" class="mr-3" />
                <label for="show-password" class="text-sm select-none cursor-pointer">Show Password</label>
              </div>
            </div>
            <button type="submit" class="w-full py-2 mt-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-900 hover:cursor-pointer">Create Account</button>
          </form>
          <p class="mt-4 text-center text-sm">
            Already have an account? 
            <a href="#/login" class="text-sky-700 underline hover:font-bold">
              Log in 
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      apiModel: {
        register: registerUser,
        validate: { email: validateEmail, password: validatePassword },
      },
    });

    const form = document.body.querySelector('#register-form');
    form.removeEventListener('submit', (e) => {
      this.onSubmit(e);
    });
    form.addEventListener('submit', (e) => {
      this.onSubmit(e);
    });

    const showPasswordCheckbox = document.body.querySelector('#show-password');
    const passwordInput = document.body.querySelector('#password');
    showPasswordCheckbox.addEventListener('change', (e) => {
      passwordInput.type = e.target.checked ? 'text' : 'password';
    });
  }

  async onSubmit(e) {
    e.preventDefault();
    const name = document.body.querySelector('#name').value;
    const email = document.body.querySelector('#email').value;
    const password = document.body.querySelector('#password').value;

    await this.#presenter.register(name, email, password);
  }

  showLoading() {
    actionLoading.fire({
      title: 'Loading...',
    });
  }

  renderRegisterSuccess() {
    notifAutoClose
      .fire({
        icon: 'success',
        title: 'Successfully created account',
        text: 'Redirecting to login page. Please log in.',
      })
      .then((result) => {
        if (result.isDismissed) {
          window.location.href = '#/login';
        }
      });
  }

  renderRegisterFailed(errorMsg) {
    notifCommon.fire({
      icon: 'error',
      title: 'Failed to create account',
      text: errorMsg,
    });
  }

  resetForm() {
    const form = document.body.querySelector('#register-form');
    if (form) {
      form.reset();
    }
  }
}
