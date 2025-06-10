import { map, control, tileLayer, Icon, icon, marker } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

export default class Map {
  #map;
  #IDCoor;
  #zoom;
  #zoomMarker;
  #userPos;
  #initPromise;

  constructor({ userPos = false } = {}) {
    this.#IDCoor = [-2.548926, 118.0148634];
    this.#zoom = 4;
    this.#zoomMarker = 12;
    this.#userPos = userPos;

    this.#initPromise = this.#init();
  }

  async #init() {
    if (!document.body.querySelector('#map')) {
      return;
    }

    if (this.#userPos) {
      try {
        this.#IDCoor = await this.getCurrentLocation();
      } catch (error) {
        console.warn('Failed to get user location, using default coordinates.', error);
      }
    }

    // 1) OpenStreetMap Standard
    const osmStandard = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });
    // 2) OpenStreetMap Humanitarian (HOT)
    const osmHOT = tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
    });
    // 3) OpenTopoMap
    const openTopo = tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org/" target="_blank">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org/" target="_blank">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">CC-BY-SA</a>)',
    });

    const baseMaps = {
      OpenStreetMap: osmStandard,
      OpenStreetMapHOT: osmHOT,
      OpenTopoMap: openTopo,
    };

    this.#map = map('map', {
      zoom: this.#zoom,
      center: this.#IDCoor,
      layers: [osmStandard],
    });

    control.layers(baseMaps).addTo(this.#map);
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  async addMarker(coor, { popup, draggable = false, onDragEnd = null }) {
    await this.#initPromise;

    if (!this.#map) {
      return;
    }
    if (coor === 'current') {
      coor = this.getCenter();
    }

    if (
      Array.isArray(coor) &&
      coor.length === 2 &&
      typeof coor[0] === 'number' &&
      typeof coor[1] === 'number'
    ) {
      const _marker = marker(coor, { draggable, icon: this.createIcon(), alt: 'Marker' }).addTo(
        this.#map
      );
      this.#map.flyTo(_marker.getLatLng(), this.#zoomMarker, {
        animate: true,
        duration: 1.5,
      });

      if (popup && typeof popup === 'string') {
        _marker.bindPopup(popup).openPopup();
      }

      if (draggable && typeof onDragEnd === 'function') {
        onDragEnd(coor);

        _marker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          this.#map.flyTo([position.lat, position.lng]);
          onDragEnd([position.lat, position.lng]);
        });

        this.#map.on('click', (event) => {
          _marker.setLatLng(event.latlng);
          this.#map.flyTo(event.latlng);
          onDragEnd([event.latlng.lat, event.latlng.lng]);
        });
      }
    }
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  }

  getCenter() {
    if (!this.#map) {
      return null;
    }

    const center = this.#map.getCenter();
    return [center.lat, center.lng];
  }
}
