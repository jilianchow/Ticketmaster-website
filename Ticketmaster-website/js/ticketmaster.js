function showContainer() {
    // display the shadow container IF the button is clicked
    var show = document.getElementById("shadow");
    show.style.display = "block";  // <-- Set it to block
}
// if you hit enter over the search bar will enter (75% keyboards)
$('#search-event').on('keyup', function(event){
    if(event.key=== 'Enter'){
        $('search-button').click();
    }
});
// event listener for the search button
$('#search-button').click(function () {
    // clear the container before adding new cards
    $('#result').empty();
    $('#eventNum').empty();
    $('#noResult').empty();
    $('#header').empty();
    // get values from the search bars
    const searchTerm = $('#search-event').val();
    const location = $('#search-city').val();
    // log search term and location
    console.log(searchTerm);
    console.log(location);

    /* -------------------------------------------------------------------------------------------------------------------------*/
    // check if search term input is empty
    if (!searchTerm) {
        $('#header').append('' +
            '<div class="alert alert-danger mt-4 text-start" role="alert" id="emptySearchTerm">' +
            'Search term cannot be empty. Please enter a search term ' +
            '</div>')
        // hide the container even though we pressed the search button
        $('#shadow').hide();
        return;
    } else {
        // else remove the box
        $('#emptySearchTerm').remove();
    }
    // check if location input is empty
    if (!location) {
        $('#header').append('' +
            '<div class="alert alert-danger mt-4 text-start" role="alert" id="emptyCity">' +
            'City cannot be empty. Please enter a city ' +
            '</div>')
        // hide the container even though we pressed the search button
        $('#shadow').hide();
        return;
    } else {
        // else remove the box
        $('#emptyCity').remove();
    }
    /* -------------------------------------------------------------------------------------------------------------------------*/
    // get and parse the data using AJAX
    $.ajax({
        type: "GET",
        url: `https://app.ticketmaster.com/discovery/v2/events.json?apikey=raDRfHog4c9fF2YdoGLDGR4mqE117Jcw&city=${location}&classificationName=${searchTerm}`,
        async: true,
        dataType: "json",
        success: function (json) {
            // log the json response
            console.log(json);
            // check if there are no results were found for that event
            if (json.page.totalElements === 0) {
                $('#noResult').append('' +
                    '<h4>' +
                    'Sorry... No results were found for the entered search term and city.</h4>');
            }
            // set count variable so that we can count the number of events
            let count = 0;
            // function to compare events for sorting
            function compareEvents(a, b){
                // compare events based on the year of the dateTime
                if(a.dateTime.getFullYear() !== b.dateTime.getFullYear()){
                    // if the years are different, return the difference in years
                    return a.dateTime.getFullYear() - b.dateTime.getFullYear();
                }
                // if the years are the same, compare the events based on the full dateTime
                return a.dateTime - b.dateTime;
            }
            // create empty array to store events in ascending order and sort them
            const formatEvent = [];
            // parse / iterate through the data
            // "event" is the index that is used to parse/iterate
            for (const event of json._embedded.events) {
                // increment the number of events
                count += 1;
                // display number of events
                console.log(count);
                // constants = event.class
                const eventName = event.name; // prints out the event name
                const eventUrl = event.url; // venue ticket link
                const eventImage = event.images[0].url; //will print out each image
                const eventVenue = event._embedded.venues[0].name; // event venue name
                const eventAddress = event._embedded.venues[0].address.line1; //event street
                const eventCity = event._embedded.venues[0].city.name; //event city
                const eventState = event._embedded.venues[0].state.name; //event state
                // prints to the console
                console.log(eventName);
                console.log(eventUrl);
                console.log(eventImage);
                console.log(eventVenue);
                console.log(eventAddress);
                console.log(eventCity);
                console.log(eventState);
                /* -------------------------------------------------------------------------------------------------------------------------*/
                // convert the date to standard || ex: wed jul 24 2024
                const eventDate = new Date(event.dates.start.dateTime);
                const newDay = eventDate.toDateString();
                console.log(newDay); // DAY
                /* -------------------------------------------------------------------------------------------------------------------------*/
                // convert the time to standard (24hr-> 12hr) || ex: 20:00:00 -> 8:00pm
                const eventStart = event.dates.start.localTime;
                // convert to standard 12-hour time and print to console
                const standardTime = convertTime(eventStart);
                console.log(standardTime); // TIME

                // create function that will convert
                function convertTime(eventStart) {
                    // check if the input is a string || assuming eventStart is in "20:00:00" format
                    if (typeof eventStart === 'string') {
                        const [hours, minutes] = eventStart.split(':'); // split hours and minutes
                        const formatHours = (hours % 12) || 12; // converts hours to 12-hour format
                        const morningNight = hours >= 12 ? 'PM' : 'AM'; // decided if night OR morning
                        return `${formatHours}:${minutes} ${morningNight}`; // format: 00:00 AM||PM
                    }
                    // check if input is a Date object, since not all of them are strings (got a console error)
                    if(eventStart instanceof Date){
                        const formatHours = (eventStart.getHours() % 12) || 12; // converts hours to 12-hour format
                        const minutes = eventStart.getMinutes(); // get the minutes
                        const morningNight = eventStart.getHours() >= 12 ? 'PM' : 'AM'; // decided if night OR morning
                        // 10 used as threshold for padding minutes with a leading 0. (ensures minutes always represented with 2 digits)
                        // ? = if min < 10 then add a 0 || 5 then 05.
                        return `${formatHours}:${minutes < 10 ? '0' : ''}${minutes}${morningNight}`; // format: 00:00 AM||PM
                    }
                }
                // create an object with the event info
                const eventInfo = {
                    name: eventName,
                    venue: eventVenue,
                    address: eventAddress,
                    city: eventCity,
                    state: eventState,
                    image: eventImage,
                    url: eventUrl,
                    day: newDay,
                    time: standardTime,
                    dateTime: new Date(eventDate)
                };
                // push the event info into the array
                formatEvent.push(eventInfo);
            } // end of "for" loop

            // sort the events
            formatEvent.sort(compareEvents);
            /* -------------------------------------------------------------------------------------------------------------------------*/
            // append the events to the result container (cards)
            for (const event of formatEvent) {
                $('#result').append('' + // the card and insert the data using { }
                    '                <div class="card shadow-lg mt-2">\n' +
                    '                    <div class="row g-0">\n' +
                    '                        <div class="col-lg-4 col-md-4">\n' +
                    `                           <img src=${event.image} id="images" class="img-fluid rounded" alt="ticket-master">\n` +
                    '                        </div>\n' + // end of image
                    '                        <div class="col-lg-4 col-md-4 col-6">\n' +
                    '                            <div class="card-body">\n' +
                    `                                <h2 class="card-title pt-4">${event.name}</h2>\n` +
                    `                                <h3 class="card-text text-body-secondary pt-4">${event.venue}</h3>\n<br>` +
                    `                                <h5 class="card-text text-body-secondary">${event.address}</h5>` +
                    `                                <h5 class="card-text text-body-secondary">${event.city}, ${event.state}</h5>` +
                    `                                <a href="${event.url}"><button class="btn btn-lg bg-primary text-light mt-3">Find tickets</button></a>\n` +
                    '                            </div>\n' +
                    '                        </div>\n' + // end of first col
                    '                        <div class="col-lg-4  col-md-4 col-6 text-end text-success">' +
                    '                            <div class="card-body">' +
                    `                                <h2 class="card-title d-flex flex-row-reverse">${event.day}</h2>\n` +
                    `                                <h4 class="card-title d-flex flex-row-reverse">${event.time}</h4>\n` +
                    '                            </div>\n' +
                    '                        </div>\n' + // end of second col
                    '                     </div>\n' + // end of row
                    '                </div>') // end of card
            } // end of for loop
            // display the number of events found
            $('#eventNum').append('' +
                `<h1 class ="pb-2 text-body-secondary">${count} events found</h1>`)

        }, // end of success function

        error: function (xhr, status, err) {
            // This time, we do not end up here!
        }

    }); // end of ajax (given by ticketmaster API website)
}) // end of search button function





