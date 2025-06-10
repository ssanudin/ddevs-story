export default class Camera {
  #currentStream;
  #streaming;
  #width;
  #height;

  #cameraSection;
  #videoWrapper;
  #canvasWrapper;
  #takeButton;
  #cameraPreview;
  #cameraList;
  #photoInput;

  #initPromise;

  constructor() {
    this.#currentStream = null;
    this.#streaming = false;
    this.#width = 320;
    this.#height = 0;

    this.#initPromise = this.#init();
  }

  async #init() {
    this.#cameraSection = document.body.querySelector('#camera-section');
    this.#videoWrapper = document.body.querySelector('#video-wrapper');
    this.#canvasWrapper = document.body.querySelector('#canvas-wrapper');
    this.#takeButton = document.body.querySelector('#take-button');
    this.#cameraPreview = document.body.querySelector('#camera-preview');
    this.#cameraList = document.body.querySelector('#camera-list');
    this.#photoInput = document.body.querySelector('#photo');

    try {
      this.#currentStream = await this.getStream();
      this.cameraLaunch(this.#currentStream);

      this.eventListener();
      this.#currentStream.getVideoTracks().forEach((track) => {
        // console.log(track.getSettings());
      });
      this.#cameraSection.classList.remove('hidden');
      this.#takeButton.removeAttribute('disabled', '');
    } catch (error) {
      console.warn(error);
      document.body.querySelector('#camera-access-info').textContent =
        'Cannot access the camera. Please ensure your camera is connected and your browser supports camera technology.';
      document.body.querySelector('#camera-access-info').classList.remove('hidden');
    }
  }

  async getStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: !this.#streaming ? undefined : this.#cameraList.value,
          },
          aspectRatio: 16 / 9,
          width: 1280,
          height: 720,
        },
      });

      await this.populateCameraList(stream);
      return stream;
    } catch (error) {
      throw error;
    }
  }

  cameraLaunch(stream) {
    this.#videoWrapper.srcObject = stream;
    this.#videoWrapper.play();
  }

  async populateCameraList() {
    try {
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const listDevices = enumeratedDevices.filter((device) => device.kind === 'videoinput');

      this.#cameraList.innerHTML = listDevices.reduce((accumulator, device, currentIndex) => {
        return accumulator.concat(`
          <option value="${device.deviceId}">
            ${device.label || `Camera ${currentIndex + 1}`}
          </option>
        `);
      }, '');
    } catch (error) {
      throw error;
    }
  }

  cameraTakePicture() {
    const context = this.#canvasWrapper.getContext('2d');
    this.#canvasWrapper.width = this.#width;
    this.#canvasWrapper.height = this.#height;
    context.drawImage(this.#videoWrapper, 0, 0, this.#width, this.#height);

    return this.#canvasWrapper.toDataURL('image/png');
  }

  async previewTakenPicture(image) {
    const blob = await (await fetch(image)).blob();
    const file = new File([blob], 'photo.jpg', { type: blob.type });

    const url = URL.createObjectURL(file);
    this.#cameraPreview.innerHTML = `
      <img src="${url}" alt="Camera Preview" class="w-full object-cover">
    `;

    const dt = new DataTransfer();
    dt.items.add(file);
    this.#photoInput.files = dt.files;
  }

  stopCurrentStream() {
    if (!(this.#currentStream instanceof MediaStream)) {
      return;
    }

    this.#currentStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  eventListener() {
    this.#cameraList.addEventListener('change', async (event) => {
      this.stopCurrentStream();
      this.#currentStream = await this.getStream();
      this.cameraLaunch(this.#currentStream);
    });

    this.#takeButton.addEventListener('click', () => {
      const imageUrl = this.cameraTakePicture();
      this.previewTakenPicture(imageUrl);
    });

    this.#videoWrapper.addEventListener('canplay', () => {
      if (this.#streaming) {
        return;
      }

      this.#height = (this.#videoWrapper.videoHeight * this.#width) / this.#videoWrapper.videoWidth;
      this.#videoWrapper.setAttribute('width', this.#width.toString());
      this.#videoWrapper.setAttribute('height', this.#height.toString());
      this.#canvasWrapper.setAttribute('width', this.#width.toString());
      this.#canvasWrapper.setAttribute('height', this.#height.toString());
      this.#streaming = true;
    });

    window.addEventListener('beforeunload', () => {
      if (this.#currentStream) {
        this.stopCurrentStream();
      }
    });

    window.addEventListener('hashchange', () => {
      if (this.#currentStream) {
        this.stopCurrentStream();
      }
    });
  }
}
