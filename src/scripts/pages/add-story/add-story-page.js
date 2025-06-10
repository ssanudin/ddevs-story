import { addStory } from '../../data/api';
import { actionLoading, notifAutoClose, notifCommon } from '../../utils';
import { getAuth, isLoggedIn, logout } from '../../utils/auth';
import Camera from '../../utils/camera';
import Map from '../../utils/map';
import AddStoryPresenter from './add-story-presenter';

export default class AddStoryPage {
  #presenter;
  #map;
  #camera;
  #form;

  async render() {
    return `
      <section id="add-story" class="max-w-2xl mx-auto p-6">
        <div id="p-wrapper" class="mb-5">
          <div id="camera-section" class="hidden w-full">
            <video id="video-wrapper" class="w-full h-64 rounded-xl">Video stream not available.</video>
            <canvas id="canvas-wrapper" class="hidden"></canvas>  
            <select id="camera-list" class="w-full border mt-4 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-xl hover:cursor-pointer"></select>
          </div>
          <div class="flex flex-col mt-4">
            <button id="take-button" class="w-50 max-w-52 self-center py-2 mt-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-900 disabled:bg-gray-200 disabled:text-gray-500 hover:cursor-pointer" type="button" disabled>
              <i class="fa-solid fa-camera"></i>
              Take Photo
            </button>
            <span id="camera-access-info" class="hidden text-sm text-red-600 text-center mt-1"></span>
            <button id="gallery-button" class="w-50 max-w-52 self-center py-2 mt-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-900 hover:cursor-pointer" type="button">
              <i class="fa-solid fa-images"></i>
              Browse My Gallery
            </button>
          </div>

          <p class="mt-5 mb-1 font-medium">Photo Preview</p>
          <div id="camera-preview" class="rounded-xl h-fit overflow-auto bg-gray-50"></div>
        </div>

        <form id="add-story-form" class="flex flex-col gap-4 mt-4">
          <div class="mb-4">
            <label for="description" class="block mb-1 font-medium">My Story</label>
            <textarea id="description" name="description" rows="4" required class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
          </div>
          <div>
            <div id="map" class="w-full h-64 rounded-md"></div>
            <div class="mb-4 flex gap-3 mt-4">
              <div>
                <label for="lat" class="block mb-1 font-medium">Latitude</label>
                <input id="lat" type="text" autocomplete="" required readonly class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label for="lon" class="block mb-1 font-medium">Longitude</label>
                <input id="lon" type="text" autocomplete="" required readonly class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
          </div>
          <div class="mb-4 hidden">
            <label for="photo" class="block mb-1 font-medium">Photo</label>
            <input id="photo" name="photo" type="file" accept="image/*" class="w-full" />
          </div>
          <div class="mt-2 flex items-center">
            <input id="is-guest" type="checkbox" class="mr-3" />
            <label for="is-guest" class="text-sm select-none cursor-pointer">Add story as <b>Guest</b></label>
          </div>
          <button type="submit" class="w-full py-3 mt-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-900 hover:cursor-pointer">
            <i class="fa-solid fa-paper-plane"></i>
            Add my story
          </button>
        </form>
        <hr class="my-4 border-gray-300">
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      apiModel: {
        addStory,
        isLoggedIn,
        getAuth,
      },
    });

    await this.#presenter.isLoggedIn();

    this.#map = new Map({ userPos: true });
    this.#map.addMarker('current', {
      draggable: true,
      onDragEnd: this.onMarkerDragEnd.bind(this),
    });

    this.#camera = new Camera();

    this.#form = document.body.querySelector('#add-story-form');
    this.#form.removeEventListener('submit', this.onSubmit.bind(this));
    this.#form.addEventListener('submit', this.onSubmit.bind(this));

    const photoInput = this.#form.querySelector('#photo');
    photoInput.addEventListener('change', () => {
      const photo = photoInput.files[0];
      if (!photo) return;

      const url = URL.createObjectURL(photo);
      document.body.querySelector('#camera-preview').innerHTML =
        `<img src="${url}" alt="Photo Preview" class="w-full object-cover">`;
    });
    document.body.querySelector('#gallery-button').addEventListener('click', () => {
      this.#form.querySelector('#photo').click();
    });
  }

  async onSubmit(e) {
    e.preventDefault();
    const lat = this.#form.querySelector('#lat').value;
    const lon = this.#form.querySelector('#lon').value;
    const description = this.#form.querySelector('#description').value;
    const fileInput = this.#form.querySelector('#photo');
    const photo = fileInput.files[0];
    const isGuest = this.#form.querySelector('#is-guest').checked;

    await this.#presenter.addStory({ lat, lon, description, photo }, isGuest);
  }

  onMarkerDragEnd(coords) {
    if (this.#form) {
      const latInput = this.#form.querySelector('#lat');
      const lonInput = this.#form.querySelector('#lon');
      if (latInput && lonInput) {
        latInput.value = coords[0];
        lonInput.value = coords[1];
      }
    }
  }

  showLoading() {
    actionLoading.fire({
      title: 'Loading...',
    });
  }

  renderAddStorySuccess() {
    this.#camera.stopCurrentStream();

    notifAutoClose
      .fire({
        icon: 'success',
        title: 'Story added successfully',
        text: 'Redirecting to the main page',
      })
      .then((result) => {
        if (result.isDismissed) {
          window.location.href = '#/';
        }
      });
  }

  renderAddStoryFailed(errorMsg) {
    notifCommon.fire({
      icon: 'error',
      title: 'Failed to add story',
      text: errorMsg,
    });
  }

  renderSessionExpired(message) {
    this.#camera.stopCurrentStream();

    notifAutoClose
      .fire({
        icon: 'warning',
        title: 'Session expired',
        text: message || 'Redirecting to login page. Please log in.',
      })
      .then((result) => {
        if (result.isDismissed) {
          logout();
        }
      });
  }

  resetForm() {
    const form = document.body.querySelector('#add-story-form');
    if (form) {
      form.reset();
    }
  }
}
