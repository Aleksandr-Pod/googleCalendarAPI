// G-CalendarApp            // *** FROM HABR *** //

// const fs = require('fs');

const {google} = require('googleapis');
require('dotenv').config();
const {CLIENT_EMAIL, PRIVATE_KEY} = process.env;
console.log("Client email:", CLIENT_EMAIL);
console.log("Private Key:", PRIVATE_KEY);
const CALENDAR_ID = '60d6393c80c8ec51a78ef097825197af272744930b66021608ab84459113fc62@group.calendar.google.com';
// const KEYFILE = 'my-project-calendar-364306-9b5671b92dfc.json'; // path to JSON with private key been downloaded from Google
const SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar'; // authorization / scopes
const SCOPE_EVENTS = 'https://www.googleapis.com/auth/calendar.events';

(async function run() {
    // INNER FUNCTIONS
    async function authenticate() {
        const jwtClient = new google.auth.JWT(
            CLIENT_EMAIL,
            null,
            PRIVATE_KEY,
            [SCOPE_CALENDAR, SCOPE_EVENTS]
        );
        await jwtClient.authorize();
        return jwtClient;
    }

    async function createEvent(auth, evtStartTime, evtEndTime) {
        const event = {
            'summary': 'New Post Demo',
            'description': 'Текст календаря - Google Calendar API.',
            'start': {
                'dateTime': `${evtStartTime.toISOString()}`,
                // 'dateTime': '2022-10-20T16:00:00+02:00',
                'timeZone': 'Europe/Kiev'
            },
            'end': {
                'dateTime': `${evtEndTime.toISOString()}`,
                // 'dateTime': '2022-10-21T16:00:00+02:00',
                'timeZone': 'Europe/Kiev'
            }
        };
        
        const resp = await calendar.events.insert({
            auth,
            calendarId: CALENDAR_ID,
            resource: event,
        });
        console.log("response after cteation:", resp);
    }

    async function deleteEvent (auth, id){
        const resp = await calendar.events.delete({
            auth,
            calendarId: CALENDAR_ID,
            eventId: id
        });
        console.log("DELETE response:", resp);
    }

    async function getEventList(auth, startTime, endTime, q = ""){
        calendar.events.list({
            auth,
            calendarId: CALENDAR_ID,
            q,
            timeMin: startTime.toISOString(),
            timeMax: endTime.toISOString(),
            timeZone: 'Europe/Kiev',
            },
            (err, res) => {
                if(err) return console.error('Events list Error: ', err);
                const eventsArr = res.data.items;
                console.log('Events:', eventsArr)
                // if there is no any events in theese days
                if (eventsArr.length === 0) return console.log('no events found');
                // if some events exist
                console.log('we have events:');
                eventsArr.forEach(el => console.log(el));
                return;
            }
        )
    }
    // update - стираются не указанные поля !!!
    async function updateEventTime(auth, startTime, endTime, id) {
        const event = {
            'start': {
                'dateTime': `${startTime.toISOString()}`,
                // 'dateTime': '2022-10-20T16:00:00+02:00',
                'timeZone': 'Europe/Kiev'
            },
            'end': {
                'dateTime': `${endTime.toISOString()}`,
                // 'dateTime': '2022-10-21T16:00:00+02:00',
                'timeZone': 'Europe/Kiev'
            }
        }
        calendar.events.update({
            auth,
            calendarId: CALENDAR_ID,
            eventId: id,
            resource: event,
        })
    }

    async function patchEventTime(auth, startTime, endTime, id, summary) {
        const event = {
            'summary': summary,
            'start': {
                'dateTime': `${startTime.toISOString()}`,
                // 'dateTime': '2022-10-20T16:00:00+02:00',
                'timeZone': 'Europe/Kiev'
            },
            'end': {
                'dateTime': `${endTime.toISOString()}`,
                // 'dateTime': '2022-10-21T16:00:00+02:00',
                'timeZone': 'Europe/Kiev'
            }
        }
        calendar.events.patch({
            auth,
            calendarId: CALENDAR_ID,
            eventId: id,
            resource: event,
        })
    }

    // async function getFreeBusy (auth, startTime, endTime) {
    //     calendar.freebusy.query({
    //         auth: auth,
    //         resource: {
    //             timeMin: startTime.toISOString(),
    //             timeMax: endTime.toISOString(),
    //             timeZone: 'Europe/Kiev',
    //             items: [{id: CALENDAR_ID}] // may be some calendars !!!
    //         }},
    //         (err, res) => {
    //             if(err) return console.error('freebusy Error: ', err);
    //             const freeBusyArr = res.data.calendars[CALENDAR_ID].busy;
    //             // if there is no any events in theese days
    //             if (freeBusyArr.length === 0) return console.log('no events found')
    //             // if some events exist
    //             console.log('we have event there:');
    //             freeBusyArr.forEach(el => console.log(el));
    //             return;
    //         }
    //     )
    // }


    // MAIN
    let calendar = google.calendar('v3');
    try {
        const auth = await authenticate();

        // calc event start time & end time
        const evtStartTime = new Date();
        // evtStartTime.setDate(evtStartTime.getDate() + 1); // for tomorrow
        const evtEndTime = new Date();
        evtEndTime.setDate(evtEndTime.getDate() + 2); // for tomorrow
        // evtEndTime.setMinutes(evtEndTime.getMinutes() + 45); // duration 45 min
        
            //  ========    METHODS     ==========
        // await createEvent(auth, evtStartTime, evtEndTime);
        // await getFreeBusy(auth, evtStartTime, evtEndTime);
        await getEventList(auth, evtStartTime, evtEndTime);
        // await deleteEvent(auth, 'blmaou09gcfcke78sfvd0rqig2');
        // await updateEventTime(auth, evtStartTime, evtEndTime, '8reg7qcvdci5lq4lnfgivt8fvs');
        // await patchEventTime(auth, evtStartTime, evtEndTime, '8reg7qcvdci5lq4lnfgivt8fvs', 'New Post - Demo');
    } catch (e) {
        console.error('Error: ', e.code, " - ", e.message);
    }
})();