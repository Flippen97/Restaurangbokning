import React from 'react';
import './../../App.css';
import CustomerForm from './../CustomerForm';
import FormInput from './../FormInput';

import Calendar from 'react-calendar'

    
class Book extends React.Component {
  state = {
    name: '',
    email: '',
    telephone: '',
    tables: '',
    bdate: '',
    btime: ''
  }

 onChange = bdate => this.setState({ bdate })
    
  setTime = (event) => {
      this.setState({ btime: event.target.dataset.btime })
  }
  
  setTables = (event) => {
    /* Calculates number of tables depending on number of guests */
    let tables;
    if((event.target.value % 6) === 0){
        tables = event.target.value / 6;
        console.log(event.target.value + ' guests will need ' + tables + ' tables.');
    }else{
        tables = Math.ceil(parseFloat(event.target.value / 6));
        console.log(event.target.value + ' guests will need ' + tables + ' tables.');
    }
    this.setState({ tables: tables })
  }
  
  handleChange = (event) => {
    this.setState({ [event.target.name] : event.target.value })
  }

//  postBooking = (event) => {
//      event.preventDefault();
//      console.log('Du har nu bokat och dina uppgifter är' + JSON.stringify(this.state));  
//  }

  
    postBooking = (event) => {
        
        fetch(`https://www.idabergstrom.se/restaurant-api/product/create.php`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            name: this.state.name,
            email: this.state.email,
            telephone: this.state.telephone,
            bdate: this.state.bdate,
            btime: this.state.btime 
          }) 
        })
          .then(response => response.json())
          .then(fetched => {
            console.log(fetched);
          })
          .catch(error => {
            console.log(error);
          });
        


  }
    
  render() {
      
    let timepickerText = '';
      
    if(!this.state.date){
        timepickerText = `Välkommen till våran bordsbokning! Var god välj ett datum i kalendern.`
    }else if(this.state.date && !this.state.time){
        timepickerText = `Välj en sittning. Du kan välja mellan kl 18 och kl 21.`
    }else if(this.state.date && this.state.time){
        timepickerText = `Nu kan du fylla i dina kontaktuppgifter i formuläret till höger.`
    }
    
    return (
        <React.Fragment>
            <div className="bookContainer">
                <div className="bookHeader">
                    <h2>Bordsboking</h2>
                    {timepickerText}
                </div>
        
                <div className="bookSection">
                    <h3>Välj ett datum:</h3>
                    <Calendar
                      onChange={this.onChange}
                      value={this.state.bdate}
                    />
                    Antal personer: <br />
                    <FormInput name="tables" type="text" onChange={this.setTables}/>

                </div>
        
                <div className="bookSection">
                    <h3>Välj en sittning:</h3>
                    
                    <form>
                    { /* Put disabled on these if a date has not yet been picked */ }
                      <input type="radio" onClick={this.setTime} data-btime="18" /> 18:00 <br />
                      <input type="radio" onClick={this.setTime} data-btime="21" /> 21:00
                    </form>
        
                </div>
        
                <div className="bookSection">
                    <h3>Dina uppgifter:</h3>
                    <CustomerForm onChange={this.handleChange} postBooking={this.postBooking} state={this.state.btime}/>
                </div>
        
            </div>
        </React.Fragment>
    );
  }
}

export default Book;