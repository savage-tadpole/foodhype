var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var restaurantData;

//////////////////////////
/// React Views        ///
//////////////////////////

// Creates a View for the whole app, with only two things in it: a single WindowView, and the map canvas
var AppView = React.createClass({
  componentDidMount: function() {
    $(document).on('markerClick', this.handleMarkerClick);
    $(document).on('sendData', this.handleDataFromMap);
  },
  handleMarkerClick: function(e, data) {
    //If the user clicks on a marker, update the state, which gets passed to the window view.
    this.setState({
      selectedMarkerData: data
    });
    this.render();
  },
  handleDataFromMap: function(e, data) {
    this.setState({
      restaurantData: data
    });
  },
  getInitialState: function() {
    return {
      selectedMarkerData: {
        display: false,
      }, 
      restaurantData: {}
    }
  },
  render: function() {
    // Every React component needs a single DOM element to wrap all its html. In this case it's <div id="wrapper">
      // The WindowView component will be updated with data associated with a clicked marker
    return (
      <div id="wrapper">
        <h1 id="title">Food Hyped</h1>
        <ReactCSSTransitionGroup transitionName="window" transitionAppear="true">
          <WindowView data={this.state.selectedMarkerData} />
        </ReactCSSTransitionGroup>
        <FilterView data={this.state.restaurantData}/>
      </div>
    )
  }
});
// Creates a View for the browser window
var WindowView = React.createClass({
  handleTwilioClick: function(){


    var theDiv = $('<div id="twilioForm"><form method="post" action="">Enter phone number, dude...<br><input type="text" name="phoneNumber" id="phoneNumber"><input type="submit"></div>').hide().fadeIn(1500);
    $("body").append(theDiv);

    var restName = this.props.data.name;
    var restAddress = this.props.data.address;
    var restScore = this.props.data.score;

    $("#twilioForm form").on("submit", function(e) {
      e.preventDefault();
      var theNumber = $("#phoneNumber").val();

      $.ajax({
        url: "/twilioSend",
        type: 'POST',
        data: JSON.stringify({
          'theNum': theNumber,
          'restName': restName,
           'restAddress': restAddress,
           'restScore': restScore
        }),
        dataType: "text",
        contentType: "application/json",
        success: function(data) {
          console.log('response',data);
          $("#twilioForm").fadeOut(1000, function() {
            $(this).remove();
          });
        },
        error: function(err) {
          console.error(err);
        }
      })
    });


    console.log('clicked twilio and awesome, tubular');
  },
  render: function() {
    if(this.props.data.display === false) {return(<div></div>);}
    var instagramPictureUrl = this.props.data.instagramPictureUrl ||
      'http://upload.wikimedia.org/wikipedia/commons/0/0c/Cow_female_black_white.jpg';
    return (
      <div id="window">
        <div id="windowTitle">{this.props.data.name}</div>
        <img id="windowPicture" src={instagramPictureUrl}></img>
        <div>Its at {this.props.data.address} </div>
        <div id="windowScore">{this.props.data.score}</div>
        <a href={this.props.data.yelpUrl}><button className="linkButton" id="yelp"></button></a>
        <a href={this.props.data.twitterUrl}><button className="linkButton" id="twitter"></button></a>
        <a href={this.props.data.instagramUrl}><button className="linkButton" id="instagram"></button></a>
        <a href={this.props.data.googlePlacesUrl}><button className="linkButton" id="googlePlaces"></button></a>
        <a onClick={this.handleTwilioClick}><button className="linkButton" id="twilio"></button></a>
      </div>
    )
  }
});

var FilterView = React.createClass({
  getInitialState: function() {
    return {
      checkedCategories: []
    }
  },
  handleFilterSelection: function(e) {
    var newCheckedCategories = this.state.checkedCategories;
    if (e.target.checked) {
      newCheckedCategories.push(e.target.value);
    } else {
      var index = newCheckedCategories.indexOf(e.target.value);
      newCheckedCategories.splice(index, 1);
    }

    this.setState({
      checkedCategories: newCheckedCategories
    });
    $(document).trigger('filterChange', [newCheckedCategories]);
  }, 
  render: function() {
    if (Array.isArray(this.props.data)) {
      var categories = this.props.data.map(function(restaurant) {
        var restaurantCategory = restaurant.categories[0][0];
        return (
          <div> 
            <input type="checkbox" value = {restaurantCategory} /> {restaurantCategory}
          </div>
        );
      });

      return (
        <div className="filterBox">
          <form onClick={this.handleFilterSelection}>
            {categories}
          </form>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }
});

// Renders the whole application
React.render(
  <AppView />,
  document.getElementById('AppView')
);
