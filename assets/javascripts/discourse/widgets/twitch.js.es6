import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

//  Create our widget named twitch
export default createWidget('twitch', {
  tagName: 'div.twich-users.widget-container',
  buildKey: () => 'twitch-users',

  defaultState(){
    return { rendered: 0 };
  },

  //  Create and render the HTML to display the streambox.
  html(attrs, state){

    // Output to be rendered
    let output = [];

    // Get the title of the stream box if set.
    if(this.siteSettings.twitch_sidebar_user){
      output.push(h('h2',this.siteSettings.twitch_sidebar_title));

      // Add an hr after the title
      output.push(h('hr',""));
    }


    // add a spinner.
    output.push(h('div.stream-container.spinner',""));

    //  check if users are set
    if(this.siteSettings.twitch_sidebar_user){
      let finishedRequest = false
      // Get the list of users
      const names = this.siteSettings.twitch_sidebar_user;

      // split the names into an array of names
      const names_array = names.split(",");

      // initialize counter
      let counter= 0;

      let streamers = {};

      // Iterate through the list of names and query twitch api
      // TODO HANDLE NO ITEMS AT ALL ACTIVE
      for (counter = 0; counter < names_array.length; counter++){

        // Get the json data for each name in the array
        const request = $.getJSON(`https://api.twitch.tv/kraken/streams/${names_array[counter].trim()}?client_id=jnyy96xyqfu0osastfovsclhlzsa7n`, function(data){

          // If the stream is active.
            if(data.stream){

              // Channel Name
              const channel_name = data.stream.channel.display_name;
              // Viewer Count
              const channel_viewers = data.stream.viewers;

              // Build crappy html to render our items.
              //  I was hoping to push this to output, but it won't get added
              //  so we append the container with each streamer
              if(!$('a.streamer.'+channel_name).length > 0){
                streamers[channel_name] = channel_viewers
              }

              // Remove spinner once we have an item
              $('div.spinner').removeClass('spinner');
            }
        });

        //  I guess we only execute this on the last item of the for loop
        //  Im sure promises are much better then this shit
        if(counter === (names_array.length - 1)){

          // when the last request is done we can sort the array
          request.done(function(){
            setTimeout(
              function(){
            // sexy array sort
            const streamerMap = new Map([...Object.entries(streamers)].sort(function(a,b){
              return b[1] - a[1];
            }))

            //  If the map size is empty we have no items.  Remove Spinner and display empty text
            if(streamerMap.size === 0 ){
                $('div.spinner').removeClass('spinner');
                $('.stream-container').html('<div class="no-streamer">No Active Streamers</div>');
            }
            // Add the items of the array to the streamer container
            for(let [name, viewcount] of streamerMap){
              $('.stream-container').append(`<a class="streamer ${name}" target="_blank" href="https://twitch.tv/${name}"><div class="streamer-wrapper clearfix"><div class="streamer-name">${name}</div><div class="viewer-count">${streamers[name]}</div></div></a>`);
            }
          }, 5)
          })
        }
      }
    }

    return h('div.twitch-container',output);
  }
});
