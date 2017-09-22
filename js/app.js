if (typeof google === 'undefined') {
    alert('ERROR: Google maps failed to load');
}

/* -- Model -- */

var Model = {
    // set up Controls for map and styles
    mapControlsAndStyles: {
        center: {
            lat: 38.5733155,
            lng: -109.54983950000002
        },
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER
        },
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        styles: [{
            featureType: 'water',
            stylers: [{
                color: '#19a0d8'
            }]
        }, {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{
                    color: '#efe9e4'
                },
                {
                    lightness: -40
                }
            ]
        }, {
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [{
                visibility: 'on'
            }]
        }, {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{
                lightness: 100
            }]
        }, {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{
                lightness: -100
            }]
        }, {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{
                    visibility: 'on'
                },
                {
                    color: '#f0e4d3'
                }
            ]
        }, {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{
                    color: '#efe9e4'
                },
                {
                    lightness: -25
                }
            ]
        }]
    },


    // locations that would normally be imported for a database
    locations: [{
            name: 'Chile Pepper Bike Shop',
            type: 'Bike Shop'
        },
        {
            name: 'Poison Spider Bicycles',
            type: 'Bike Shop'
        },
        {
            name: 'Bike Fiend',
            type: 'Bike Shop'
        },
        {
            name: 'Moab Adventure Center',
            type: 'Outfitter'
        },
        {
            name: 'Red River Adventures',
            type: 'Outfitter'
        },
        {
            name: 'Tag-A-Long Expeditions',
            type: 'Outfitter'
        },
        {
            name: 'The Spoke on Center',
            type: 'Food'
        },
        {
            name: 'Moab Diner',
            type: 'Food'
        },
        {
            name: 'Quesadilla Mobilla',
            type: 'Food'
        }
    ],

    // Four Square credentials
    fourSquareInfo: {
        clientID: 'FX112SKJ5WNJYYOK0ZBFVILLQMY5RURNKBQQC1O5FDGPVLXR',
        clientSecret: 'BSG4AJ0KZ1BNYS5YPTCX1NPM52YYEENNWEZPGNFMX1QHWSQ0',
        version: 20170815
    },

    // Find Four Square's lat/lng data for each location and place onto map
    fourSquareLocationData: function() {
        // construct base url
        var fSData = Model.fourSquareInfo;
        var centerCanvas = Model.mapControlsAndStyles.center;
        // construct base url to search with supplied coordinates
        var baseURL = 'https://api.foursquare.com/v2/venues/search?client_id=' +
            fSData.clientID + '&client_secret=' +
            fSData.clientSecret + '&v=' +
            fSData.version + '&ll=' +
            centerCanvas.lat + ',' +
            centerCanvas.lng + '&query=';

        // set variables for ajax request
        var i, fullURL, fsDataObject, lat, lng, venue_id;
        var locations = Model.locations;
        var locationsLength = locations.length;
        var counter = 0;

        var timeout = setTimeout(function() {
            alert('ERROR: Failed to get location resources');
        }, 5000);


        function getData(fullURL, i, location) {
            $.ajax(fullURL, {
                i: i,
                dataType: 'jsonp',
                success: function(data) {
                    // get data needed from four square
                    fsDataObject = data.response.venues[0];
                    lat = fsDataObject.location.lat;
                    lng = fsDataObject.location.lng;
                    venue_id = fsDataObject.id;


                    i = this.i;
                    // set properties of location with correct data
                    location.coordinates = {
                        lat: lat,
                        lng: lng
                    };

                    location.fourSquareID = venue_id;

                    counter++;

                    if (counter === locationsLength) {
                        clearTimeout(timeout);
                        myViewModel.initMap();
                    }
                }
            });
        }

        // Four Square ajax request for supplied locations
        for (i = 0; i < locationsLength; i++) {
            // construct the full url with base url and supplied location name
            fullURL = baseURL + locations[i].name;

            getData(fullURL, i, locations[i]);
        }
    },

    // use google to set up an icon image for each location type
    iconLocation: function() {
        // set variables for icon images
        var i, iconImage, location, locationType;
        var locationsLength = Model.locations.length;

        for (i = 0; i < locationsLength; i++) {
            location = Model.locations[i];
            locationType = location.type;

            // sort image with location type
            if (locationType === 'Bike Shop')
                iconImage = 'cycling.png';
            else if (locationType === 'Outfitter')
                iconImage = 'trail.png';
            else if (locationType === 'Food')
                iconImage = 'snack_bar.png';

            location.icon = 'https://maps.google.com/mapfiles/kml/shapes/' + iconImage;
        }
    },

    infoWindowContent: null,

    // construct info window content
    makeFourSquareInfoWindow: function(i, markerCopy) {
        // define variables to construct our full URL
        var venue_id = Model.locations[i].fourSquareID;
        var fourSquare = Model.fourSquareInfo;
        // construct full URL to make ajax request
        var fullURL = 'https://api.foursquare.com/v2/venues/' +
            venue_id + '?client_id=' +
            fourSquare.clientID + '&client_secret=' +
            fourSquare.clientSecret + '&v=' +
            fourSquare.version;

        var timeout = setTimeout(function() {
            alert('ERROR: Failed to get Foursquare location data');
        }, 5000);

        // ajax request for location details
        $.ajax(fullURL, {
            dataType: 'jsonp',
            success: function(data) {
                // Four Square data
              //  console.log(data);
                // get data for each location
                var fsDataObject = data.response.venue;
                // define variables for objects to avoid repetition
                var location = fsDataObject.location;
                var firstPhoto = fsDataObject.bestPhoto;
                var secondPhoto = fsDataObject.photos.groups[0].items[1];
                var tips = fsDataObject.tips.groups[0].items;

                var address, likes, phone, rating, website;
                address = location.address || 'No Address Provided';
                likes = fsDataObject.likes.count || 'No Likes Yet';
                phone = fsDataObject.contact.formattedPhone || 'No Phone Provided';
                rating = fsDataObject.rating || 'No Rating Available';


                // set up information for the info window and inculde the following,
                // popularity/category, photos, tips, and attribution
                Object.defineProperty(Model, 'infoWindowContent', {
                    value: '<div class="info-window">' +

                        '<h1>' + fsDataObject.name + '</h1>' +
                        '<p>' + address + '</p>' +
                        '<p>' + location.formattedAddress[1] + '</p>' +
                        '<a target="_blank" href="' + fsDataObject.url + '">' + 'Website' + '</a>' +
                        ' | ' + '<span>' + phone + '</span>' +

                        '<hr>' +

                        '<p>' +
                        '<span>' + '<strong class="rating green-text">' + rating + '</strong>' + '/10 rating' + '</span>' +
                        ' | ' + '<span>' + '<strong>' + likes + '</strong>' + ' likes' + '</span>' +
                        '</p>' +
                        '<p class="line-height category">' + fsDataObject.categories[0].name + '</p>' +

                        '<a target="_blank" class="plain-link" href="' + fsDataObject.canonicalUrl + '"' + 'ref="' + fourSquare.clientID + '"' + '>' +
                        '<img class="best-photo" src="' + firstPhoto.prefix + '125x125' + firstPhoto.suffix + '">' +
                        '<img class="second-photo" src="' + secondPhoto.prefix + '125x125' + secondPhoto.suffix + '">' +
                        '</a>' +

                        '<a target="_blank" class="plain-link" href="' + fsDataObject.canonicalUrl + '"' + 'ref="' + fourSquare.clientID + '"' + '>' +
                        '<p class="line-height">' +
                        '<strong>' + 'Tip 1:  ' + '</strong>' + tips[0].text +
                        '</p>' +
                        '<p class="line-height">' +
                        '<strong>' + 'Tip 2:  ' + '</strong>' + tips[1].text +
                        '</p>' +
                        '<p class="line-height">' +
                        '<strong>' + 'Tip 3:  ' + '</strong>' + tips[2].text +
                        '</p>' +
                        '</a>' +
                        '</div>'
                });

                clearTimeout(timeout);
                // set info window to correct marker using the View Model
                myViewModel.initFourSqureInfoWindow(markerCopy);
            }
        });
    },

    // categories to filter the locations
    filterLocationType: [{
            name: 'All',
            image: null
        },
        {
            name: 'Bike Shop',
            image: 'https://maps.google.com/mapfiles/kml/shapes/cycling.png',
        },
        {
            name: 'Outfitter',
            image: 'https://maps.google.com/mapfiles/kml/shapes/trail.png'
        },
        {
            name: 'Food',
            image: 'https://maps.google.com/mapfiles/kml/shapes/snack_bar.png'
        }
    ]
};


/* --------------------- ViewModel ----------------------*/

var ViewModel = function() {
    var self = this;

    Model.fourSquareLocationData();
    Model.iconLocation();

    // use knockout js for search query changes
    self.query = ko.observable('');

    // use knockout js to put location type into the view model
    self.filterLocationsList = [];
    Model.filterLocationType.forEach(function(element) {
        self.filterLocationsList.push(element);
    });

    // use knockout js to put the locations into a list
    self.locationsList = [];
    Model.locations.forEach(function(element) {
        self.locationsList.push(element);
    });

    // use locations length in the view model for search queries and show functions
    self.locationsListLength = self.locationsList.length;

    // make an array so we can push each marker into it
    self.markersList = [];
   // console.log(self.markersList);

    // animate mare and show info window when a marker is clicked
    self.makeFourSquareInfoWindow = function(i, markerCopy) {
        // make a click event hander for each marker
        google.maps.event.addListener(markerCopy, 'click', function() {
            // use the info window constructor from the Model
            Model.makeFourSquareInfoWindow(i, markerCopy);
        });
    };

    // set up info window
    self.initFourSqureInfoWindow = function(markerCopy) {
        var infoWindow = self.infoWindow;
        // put correct content into info window
        infoWindow.setContent(Model.infoWindowContent);
        // info window will open when clicked
        infoWindow.open(self.map, markerCopy);
        // info windo will bounce when clicked
        self.setUpMarkerAnimation(markerCopy);
    };

    self.setUpMarkerAnimation = function(markerCopy) {
        // Stop marker animation. Previous marker will stop bouncing
        self.markersList.forEach(function(element) {
            element.setAnimation(null);
        });
        // make the clicked marker bounce
        markerCopy.setAnimation(google.maps.Animation.BOUNCE);
        // make an event listener that will stop animation when info window is closed
        google.maps.event.addListener(self.infoWindow, 'closeclick', function() {
            markerCopy.setAnimation(null);
        });
    };

    // connect each list item to correct info window
    self.makeListClickable = function(index) {
       // console.log(self.markersList[index()]);
        google.maps.event.trigger(self.markersList[index()], 'click');
        self.hideList();
    };

    // hide list for smaller screens
    self.hideList = function() {
        if ($(window).width() < 750) {
            $('.list-container').hide();
            $('.show-locations').show();
        }
    };

    // will show the full list on smaller screens when clicked
    self.showList = function() {
        $('.list-container').show();
        $('.show-locations').hide();
    };

    self.whatEver = ko.computed(function() {
        var query = self.query().toLowerCase();

        console.log(query)

        if (!query) {
            return self.locationsList
        } else {

            // ko.utils.arrayFilter
            // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf

            // query

            return [] // instead, return a matching subset of location objects
        }
    });

    // set up search function
  /*  self.search = function() {
        var searchValue = new RegExp(self.query(), 'i');
        var i, result;

        // ================ FOCUS ON THIS SNIPPET ===========================

        // // reset everything
        // self.infoWindow.close();
        // // all markers will show on the screen
        // self.markersList.forEach(function(element) {
        //     element.setAnimation(null);
        //     element.setMap(self.map);
        // });



        // reset everything
        self.infoWindow.close();
        // all markers will show on the screen
        self.markersList.forEach(function(element) {
            element.setAnimation(null);
            element.setMap(self.map);
        });

        // ================= End OF SNIPPET ===============================



        // ================ FOCUS ON THIS SNIPPET ===========================

        // all list items will be displayed on the screen
        $('.list-item').show();

        for (i = 0; i < self.locationsListLength; i++) {
            // check if location matches search query
            result = searchValue.test(self.locationsList[i].name);
            // hide marker if search query does not match
            if (result === false) {
                self.markersList[i].setMap(null);

                $('#' + i).hide();
            }
        }
    };

    // ================= End OF SNIPPET ===============================


    // if changes in the search box, call the search function
    self.query.subscribe(self.search);

    // name is the category clicked by the user
    self.setUpCategoryFilter = function(name) {
        var i, result;

        // reset everything
        self.infoWindow.close();
        // first show all markers and list items on screen
        self.markersList.forEach(function(element) {
            element.setAnimation(null);
            element.setMap(self.map);
        });
        $('.list-item').show();

        // display all each location type depending on what filter
        // the user clicks on
        if (name !== 'All') {
            for (i = 0; i < self.locationsListLength; i++) {
                // save each location's type
                result = self.locationsList[i].type;
                // hide marker if it is not the clicked
                // location type
                if (result !== name) {
                    self.markersList[i].setMap(null);

                    $('#' + i).hide();
                }
            }
        }
    };*/

    // initialize the map
    self.initMap = function() {
        // create the map
        var mapCanvas = document.getElementById('map');
        self.map = new google.maps.Map(mapCanvas, Model.mapControlsAndStyles);

        // define variables for the map
        var locations = self.locationsList;
        var locationsLength = locations.length;
        var i, marker;
        // make one info window
        self.infoWindow = new google.maps.InfoWindow({
            maxWidth: 300,
        });
       // console.log(locationsLength);

        // make markers with info windows
        for (i = 0; i < locationsLength; i++) {
            // make a new marker
            marker = new google.maps.Marker({
                position: locations[i].coordinates,
                icon: locations[i].icon
            });
            marker.setMap(self.map);
            // add each marker to an array
            self.markersList.push(marker);
            // add info windows
            self.makeFourSquareInfoWindow(i, marker);
          //  console.log(marker);
        }
    };

    // prevent form from submitting when user presses enter key
    $(document).on('keypress', 'form', function(e) {
        var code = e.keyCode || e.which;

        if (code === 13) {
            e.preventDefault();

            return false;
        }
    });
};

// refrence the View Model instance
var myViewModel = new ViewModel();

// use knockout js to organize mvvm
ko.applyBindings(myViewModel);

