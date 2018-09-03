import React from 'react';
import './../../App.css';
import CustomerForm from './../CustomerForm';
import FormInput from './../FormInput';
import Calendar from './../Calendar';
import moment from 'moment';
    
class Book extends React.Component {
  state = { 
    /*** Booking: ***/
    name: '',
    email: '',
    telephone: '',
    bdate: '',
    btime: '',
    numberOfGuests: '',
    customerId: '',
    /*** Calendar: ***/
    selectedDate: undefined,
    allBookings: [],
    disabledDates: [],
    availableAt18: true,
    availableAt21: true,
    /*** How far they have come in booking ***/
    bookingStep: "1",
  }
    
  /******************************************************/
  /***************** Booking functions ******************/
  /******************************************************/

     /* This function is called from the Calendar component: */
    onDayClick = (event,  modifiers = {}) => {
        if (modifiers.disabled) {
            return;
        }
        this.setState({ selectedDate: event})
        let selectedDate = event;
        /* Date is formatted to be compatible with disable date-function in calender: */
        selectedDate = moment(selectedDate).format("YYYY[,] MM[,] DD");
         
         this.setState({ bdate: selectedDate }, () => {
             /* When a date is selected, we need to check which times are available on that date, 
             so we are running another function to check that: */
            this.isSittingAvailable();
        });
    }
    
    changeBokingStep = (event) => {
        this.setState({ bookingStep: event.target.value}) 
    }
    
    setTime = (event) => {
        this.setState({ btime: event.target.dataset.btime})
    }

    /* This function sets name, email, telephone states */
    handleChange = (event) => {
        let email = event.target.value; 
        
        /* Email only pushed to state if it's valid. If empty state, the user will not be allowed to book. */
        if(event.target.name === 'email'){
            if(this.validateEmail(email)){
                this.setState({ email : email })
            } 
        }else{
            this.setState({ [event.target.name] : event.target.value })
        }
    }
    
    validateEmail(emailToValidate){
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(emailToValidate).toLowerCase());
    }
  
    postBooking = () => {
        fetch(`https://www.idabergstrom.se/restaurant-api/create.php`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
                name: this.state.name,
                email: this.state.email,
                telephone: this.state.telephone,
                bdate: this.state.bdate,
                btime: this.state.btime,
                numberOfGuests: this.state.numberOfGuests,
            }) 
        })
          .then(response => response.json())
//          .then(fetched => {
//            console.log(fetched);
//          })
          .catch(error => {
            console.log(error);
          });
    } 

    
    postBookingWithCustomerId = () => {
        fetch(`https://www.idabergstrom.se/restaurant-api/createWithCustomerId.php`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
                bdate: this.state.bdate,
                btime: this.state.btime,
                numberOfGuests: this.state.numberOfGuests,
                customerId: this.state.customerId
            }) 
        })
          .then(response => response.json())
//          .then(fetched => {
//            console.log(fetched);
//          })
          .catch(error => {
            console.log(error);
          });
    } 
    
    
    
  /******************************************************/
  /***************** Availability content ***************/
  /******************************************************/

    disabledDates = () => {
        let bookingsArray = this.state.allBookings;
        var counts = {};
        let disabledDatesArray = [];
        /* This counts how many times a specific date has occured in the bookingsArray: */
        bookingsArray.forEach(function(x) { counts[x.bdate] = (counts[x.bdate] || 0)+1; });
        /* This takes bookings that has over 30 counts (= restaurant fully booked) and push them into disabledDates state: */
        for(var key in counts){
            if(counts[key] >= 2){ // LATER ON THIS SHALL BE CHANGED TO 29!
                disabledDatesArray.push(key);
            }
        }
        this.setState({ disabledDates: disabledDatesArray }) 
    }
  
    isSittingAvailable = () => {
        /* We get the date to calculate from state (set there because user selected the date in calendar) */
        let selectedDate = this.state.bdate;
        let bookingsArray = this.state.allBookings;
        
        /* Creating two seperate arrays, one for where time (btime) is 18, and one for 21: */
        let bookingsAt18 = bookingsArray.filter((day) => ((day.bdate === selectedDate) && (day.btime === '18')));
        let bookingsAt21 = bookingsArray.filter((day) => ((day.bdate === selectedDate) && (day.btime === '21')));
        
        /* Setting different states depening on amount of booknigs (== length of array -1, because array start at zero.) */
        /* These state are then used to toggle different style depending on whether any table is available. */
        if(bookingsAt18.length >= 1){ // TEST, THESE MUST BE CHANGED TO 14 LATER ON!
            this.setState({ availableAt18: false }) 
        }
        if(bookingsAt21.length >= 1){ // TEST, THESE MUST BE CHANGED TO 14 LATER ON!
            this.setState({ availableAt21: false }) 
        }
    }
    
    allreadyCustomer = () => {
        /* For returning customers, they can type in phone number only and rest of the info will be fetchd from database. */
        fetch('https://www.idabergstrom.se/restaurant-api/fetchOneWithTelephone.php', {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            telephone: this.state.telephone
          }) 
        })
          .then(response => response.json())
          .then(data => {
             this.setState({ 
                    /* A customers bookings are connected with their id only, so we're fetching that and put it into state. */
                    customerId: data[0].id, 
                }, () => {
                    /* Proceed to post to database: */
                    this.postBookingWithCustomerId();
                })
          })
          .catch(error => {
            console.log(error);
          });
    }

//    fetchBookings = () => {
//    return fetch("https://www.idabergstrom.se/restaurant-api/fetchAll.php")
//      .then((response) => response.json())
//    }
  
    componentDidMount = () => {
//        this.fetchBookings()
        fetch("https://www.idabergstrom.se/restaurant-api/fetchAll.php")
        .then((response) => response.json())
        .then((data) => { 
            this.setState({ allBookings: data }, () => {
                /* As soon as the bookings are set in state, we can proceed to calculate adjustments in booking calendar: */
                this.disabledDates();
            });
        })
        .catch(error => {
          console.log(error);
        });
    }
    
  render() {
      

     
    let timepickerText = '';
      
    if(!this.state.bdate){
        timepickerText = `Välkommen till våran bordsbokning! Var god välj ett datum i kalendern.`
    }else if(this.state.bdate && !this.state.btime){
        timepickerText = `Välj en sittning. Du kan välja mellan kl 18 och kl 21.`
    }else if(this.state.bdate && this.state.btime){
        timepickerText = `Nu kan du fylla i dina kontaktuppgifter i formuläret till höger.`
    }

    
    return (
        <React.Fragment>
            <div className="headerImg">
                <h2>Boka bord</h2>
            </div>
            <div className="bookContainer">
        
                <div className="bookHeader">
                    <h2>Bordsboking</h2>
                    {timepickerText}
                </div>
        
                <Calendar 
                    onDayClick={this.onDayClick} 
                    setTime={this.setTime} 
                    setTables={this.setTables}
                    disabledDates={this.state.disabledDates}
                    bdate={this.state.bdate}
                    selectedDate={this.state.selectedDate}
                    bookingStep={this.state.bookingStep}
                    changeBokingStep={this.changeBokingStep}
                    setNumberOfGuests={this.setNumberOfGuests}
                    onChange={this.handleChange}
                    postBooking={this.postBooking}
                    availableAt18={this.state.availableAt18}
                    availableAt21={this.state.availableAt21}
                />
        
        
                {this.state.bookingStep === "3" ? (
                <div className="bookSection">
        
                    Bokat tidigare? V.g. fyll i telefonnummer: 
                    <FormInput onChange={this.handleChange} name="telephone" />
                    <button onClick={this.allreadyCustomer}> Boka! </button>
        
        
                    <h3>Dina uppgifter:</h3>
                    <CustomerForm onChange={this.handleChange} postBooking={this.postBooking} state={this.state.btime}/>
                    <button>Nästa</button>
                </div>) 
                : (<React.Fragment />)}
        

            </div>
        </React.Fragment>
    );
  }
}

export default Book;