/* -- Model -- */
var Model = {

    // locations that would normally be imported from a database
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
        // make Four Square variable that contains api credentials
        var fSData = Model.fourSquareInfo;

        // set the center of the map
        var centerCanvas = {
            lat: 38.5733155,
            lng: -109.54983950000002
        };

        // construct the base url for getData()
        var baseURL = 'https://api.foursquare.com/v2/venues/search?client_id=' +
            fSData.clientID + '&client_secret=' +
            fSData.clientSecret + '&v=' +
            fSData.version + '&ll=' +
            centerCanvas.lat + ',' +
            centerCanvas.lng + '&query=';

        // set variables for ajax request
        var i, fullURL, fsDataObject, lat, lng, venue_id;
        var locations = Model.locations;
        //var counter = 0;

        // var timeout = setTimeout(function() {
        //     alert('ERROR: Failed to get location resources');
        // }, 5000);

        // ajax request for location data
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

                    myViewModel.makeMarker(location);

                    location.fourSquareID = venue_id;

                    //counter++;

                    // if (counter === locations.length) {
                    //     clearTimeout(timeout);
                    //     //myViewModel.initMap();
                    // }
                }
            })  .done(function(data) {
                // Successful
            })  .fail(function(error) {
                alert('Error: Failed to get location resources.');
            })
        }

        // Four Square ajax request for supplied locations
        for (i = 0; i < locations.length; i++) {
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

        // ajax request for location description
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

                //clearTimeout(timeout);
                // set info window to correct marker using the View Model
                myViewModel.initFourSqureInfoWindow(markerCopy);
            }
        });
    }
};


/* --------------------- ViewModel ----------------------*/

var ViewModel = function() {
    var self = this;

    Model.fourSquareLocationData();
    Model.iconLocation();

    // use knockout js for search query changes
    self.query = ko.observable('');

    self.selectedCategory = ko.observable('All');

    // make observables to show and hide the locations list
    self.show = ko.observable(false);
    self.showButtonValue = ko.observable('Show List');

    // use knockout js to put the locations into a list
    self.locationsList = [];
    Model.locations.forEach(function(element) {
        self.locationsList.push(element);
    });

    // make an array so we can push each marker into it
    self.markersList = [];

    // animate marker and show info window when a marker is clicked
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
        self.responsiveList();
    };

    self.responsiveList = function() {
        if($(window).width() >= 768) {
            self.show(true)
        } else {
            self.show(false)
            self.showButtonValue('Show List');
        }
    };

    self.showList = function() {
        if(self.show() === false){
            self.show(true);
            self.showButtonValue('Hide List');
        } else {
            self.show(false);
            self.showButtonValue('Show List');
        }
    };

    // Use knockout to set up search function that will
    // return a filtered query list and set marker
    // visibility.
    self.search = ko.computed(function() {
        var query = self.query().toLowerCase();
        var selectedCategory = self.selectedCategory();

        console.log(selectedCategory === 'All', !query)

        if (!query && selectedCategory === 'All') {
            self.locationsList.forEach(function(location) {
                if (location.marker) location.marker.setVisible(true);
            });
            return self.locationsList;
        } else {
            return ko.utils.arrayFilter(self.locationsList, function(location) {
                var name = location.name.toLowerCase();
                var match = name.indexOf(query) >= 0 && (location.type === selectedCategory || selectedCategory === 'All');

                location.marker.setVisible(match);

                return match;
            });
        }
    });


    // Set categoryList with an empty array so
    // the Model.locations array can be 'mapped'
    // into it.
    self.categoryList = [];

    // dynamically retrieve categories for drop down list
    self.categoryList.push('All');

    Model.locations.map(function(location) {
        if (!self.categoryList.includes(location.type)) {
            self.categoryList.push(location.type);
        }
    });

    self.locationArray = ko.observableArray(Model.locations);
    //observable array for drop down list
    self.categories = ko.observableArray(self.categoryList);
    //this holds the selected value for the list

    /*
        Filter Function, return filtered location
        by selected category from <select>
    */

    self.filterLocation = ko.computed(function() {
        if (!self.selectedCategory()) {
            return self.locationArray();
        } else {
            return ko.utils.arrayFilter(self.locationArray(), function(location) {
                return (location.type === self.selectedCategory());
            });
        }
    });

    self.makeMarker = function(location) {
        // make a new marker
        var marker = new google.maps.Marker({
            position: location.coordinates,
            icon: location.icon
        });

        console.log(marker)
        //add marker object to each locations array
        location.marker = marker;

        marker.setMap(self.map);
        // add each marker to an array
        self.markersList.push(marker);
        // add info windows
        self.makeFourSquareInfoWindow(0, marker);
        //  console.log(marker);
    };

    // initialize the map
    self.initMap = function() {
        // set up map styles and controls
        var mapControlsAndStyles = {
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
        };

        // Create the map
        var mapCanvas = document.getElementById('map');
        self.map = new google.maps.Map(mapCanvas, mapControlsAndStyles);
        // make one info window
        self.infoWindow = new google.maps.InfoWindow({
            maxWidth: 300,
        });
    };

    // prevent form from submitting when user presses enter key
    // $(document).on('keypress', 'form', function(e) {
    //     var code = e.keyCode || e.which;

    //     if (code === 13) {
    //         e.preventDefault();

    //         return false;
    //     }
    // });

    ko.bindingHandlers.hotkey = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = ko.utils.unwrapObservable(valueAccessor());

            if (typeof options === "object") {
                var trigger = options.trigger.toLowerCase();
                var action = options.action;
            } else {
                var trigger = options;
            }

            var shift = trigger.indexOf("shift") > -1;
            var ctrl = trigger.indexOf("ctrl") > -1;
            var alt = trigger.indexOf("alt") > -1;
            var key = trigger.substring(trigger.length - 1);

            $(document).on("keydown", function(e) {
                if (e.shiftKey === shift && e.ctrlKey === ctrl && e.altKey === alt && e.which === key.toUpperCase().charCodeAt(13)) {
                    // hotkey hit
                    // console.log(action);
                    if (action && typeof action === "function") {
                        action(element);
                    } else {
                        $(element).click(); // trigger the element click event
                    }
                    e.preventDefault();
                }
            });
        }
    };
};

googleMapError = function googleMapError() {
    alert('Google Maps failed to load. Please refresh the page to try again.')
};

// refrence the View Model instance
var myViewModel = new ViewModel();

// use knockout js to organize mvvm
ko.applyBindings(myViewModel);