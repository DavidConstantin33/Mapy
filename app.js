'use strict';

const acc1 = {
    fullName: 'Constantin David',
    username: '1',
    password: '1',
    pic: '/images/davidpoza.png',
}

const pinContainer = document.querySelector('.pin__menu')

//////////App
class App {
    map;
    coords;
    constructor() {
        this.getPosition(location);
        this.login();
        this.comment();
    }

///////////////////////////functions
    getPosition() {
        if (navigator.geolocation.getCurrentPosition) {
            navigator.geolocation.getCurrentPosition(this.loadMap.bind(this),
                function () {
                    alert('Could not get your position.');
                });
        }
    }

    async loadMap(position) {
        const {latitude, longitude} = position.coords;
        this.coords = [latitude, longitude];

        this.map = L.map('map').setView(this.coords, 13);

        this.map.addEventListener('click', () => {
            pinContainer.style.display = 'none';
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        const streetAddress = await this.getStreet(latitude, longitude);

        const icon = L.icon({
            iconUrl: 'images/pin.svg',
            iconSize: [30, 30],
        });

        const marker = L.marker(this.coords, {icon: icon}).addTo(this.map);

        const popupMarkup = `
        <div class="popup__markup">
            <p>You are at ${streetAddress}😊</p>
            <p class="street-address" style="display: none;">${streetAddress}</p>
            <button id="pin-btn">Pin!</button>
        </div>`;

        const popup = L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'popup__class',
        }).setContent(popupMarkup);

        marker.bindPopup(popup).openPopup();

        // Event listener for "Pin!" button
        document.getElementById('pin-btn').addEventListener('click', () => {
            pinContainer.style.display = 'flex';
            document.getElementById('street').innerText = streetAddress;
        });

        // Add new marker on click
        this.map.on('click', (e) => {
            const {lat, lng} = e.latlng;
            this.newMarker(e, [lat, lng]);
        });
    };

    async newMarker(e, coords) {
        const icon = L.icon({
            iconUrl: 'images/pin.svg',
            iconSize: [30, 30],
        });

        const marker = L.marker(coords, {icon: icon})
            .addTo(this.map);


        const lon = parseFloat(marker._latlng.lng).toFixed(6);
        const lat = parseFloat(marker._latlng.lat).toFixed(6);

        try {
            const streetAddress = await this.getStreet(lat, lon);

            const popupMarkup = `
            <div class="popup__markup">
                <p>${streetAddress ? streetAddress + ' 😊' : 'Location Unknown 😰'}</p>
                <p class="street-address" style="display: none;">${streetAddress}</p>
                <button id="pin-btn">Pin!</button>
            </div>`;

            const popup = L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'popup__class',
            }).setContent(popupMarkup);

            marker.bindPopup(popup).openPopup();

            console.log(marker._latlng);

            document.addEventListener('click', (e) => {
                const pinBtn = e.target.closest('#pin-btn');
                if (pinBtn) {
                    e.preventDefault();
                    console.log('Button clicked');

                    const popupContent = pinBtn.closest('.leaflet-popup-content');
                    if (popupContent) {
                        const streetAddressElement = popupContent.querySelector('.street-address');
                        if (streetAddressElement) {
                            let streetAddress = streetAddressElement.textContent;
                            console.log('Street address:', streetAddress);
                            //open container
                            pinContainer.style.display = 'flex';
                            document.getElementById('street').innerText = streetAddress;
                        }
                    }
                }

            });

        } catch (error) {
            console.error('Error:', error);
        }
    }

    getStreet(latitude, longitude) {
        return new Promise((resolve, reject) => {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    const addressComponents = data.address;
                    let streetName = '';
                    if (addressComponents.hasOwnProperty('road')) {
                        streetName = addressComponents.road;
                    } else if (addressComponents.hasOwnProperty('pedestrian')) {
                        streetName = addressComponents.pedestrian;
                    }

                    let streetAddress = `${data.hasOwnProperty('house_number') ? data.house_number + ', ' : ''}${streetName}`;
                    resolve(streetAddress);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    ///////////////////all fine up here!
    login(pic, comPic, name, comName) {
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const loginBtn = document.getElementById('login');

        if (username && password && loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();

                if (username.value === acc1.username && password.value === acc1.password) {
                    pic = document.getElementById('user-photo');
                    comPic = document.getElementById('user-photo-comment');
                    name = document.getElementById('loginp');
                    comName = document.getElementById('userP');
                    document.querySelector('.modal').style.display = 'none';

                    if (pic && comPic && name) {
                        pic.src = acc1.pic;
                        comPic.src = acc1.pic;
                        name.innerText = `${acc1.fullName.split(' ')[1]}`;
                        comName.innerText = `${acc1.fullName.split(' ')[1]}`;
                        pic.style.width = '3em';
                        pic.style.borderRadius = '50%';
                        console.log('login succesfull');
                    } else {
                        console.error('Missing UI elements for login update.');
                    }
                }
            });
        } else {
            console.error('Missing DOM elements for login functionality.');
        }
    }
    comment(com, name, pic) {


        pic = acc1.pic;
        name = `${acc1.fullName.split(' ')[1]}`;
        const comInput = document.getElementById('pin--comment');
        const pinBtn = document.getElementById('pin--btn');
        const comContainer = document.getElementById('comments--container');

        if(pinBtn) {
            pinBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const noCom = document.getElementById('no--comm');
                noCom.style.display = 'none';
                const commMarkup = `
                                    <div class="comment--markup">
                                    <img src="${pic}" alt="pic"/><h1>${name}</h1>
                                    </div>
                                    <div class="comment--comment">
                                    <p>${comInput.value}</p>
                                    </div>`;

                comContainer.insertAdjacentHTML('afterbegin', commMarkup);
                comInput.value = '';
            })
        }

    }
}



const app = new App();