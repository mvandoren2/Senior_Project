import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import FullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS';
import getOppo from '@salesforce/apex/oppoCloseDate.getOppo';
import heySfLogo from '@salesforce/resourceUrl/heySfLogo';
/**
 * @description Full Calendar JS - Lightning Web Components
 */
export default class opportunityVisualizer extends LightningElement {
//  @track eventData ;
  @track returnedOppo = [] ;
  @track finalOppo = [] ;
  SfLogo = heySfLogo ;

  renderedCallback() {
    Promise.all([
      loadScript(this, FullCalendarJS + '/FullCalendarJS/jquery.min.js'),
      loadScript(this, FullCalendarJS + '/FullCalendarJS/moment.min.js'),
      loadScript(this, FullCalendarJS + '/FullCalendarJS/fullcalendar.min.js'),
      loadStyle(this, FullCalendarJS + '/FullCalendarJS/fullcalendar.min.css'),
      // loadStyle(this, FullCalendarJS + '/fullcalendar.print.min.css')
    ])
    .then(() => {
      // Initialise the calendar configuration
      this.getTasks();
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error({
        message: 'Not Loading FullCalendarJS',
        error
      });
    })
  }
  initialiseFullCalendarJs() {
    var str = window.location.href;
    var pos = str.indexOf(".com/");
    var last = pos + 4;
    var tDomain = str.slice(0,last);
    for(var i = 0 ; i < this.returnedOppo.length ; i++)
    {
      this.finalOppo.push({
        start : this.returnedOppo[i].CloseDate,
        title : this.returnedOppo[i].Name,
        url : tDomain+'/lightning/r/Opportunity/'+this.returnedOppo[i].Id+'/view'
    });
    }
    const ele = this.template.querySelector('div.fullcalendarjs');
    // eslint-disable-next-line no-undef
    $(ele).fullCalendar({
      header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,basicWeek,basicDay'
      },
     // defaultDate: '2020-03-12',
      defaultDate: new Date(), // default day is today
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      events : this.finalOppo
    });
  }
  getTasks(){
    getOppo()
        .then(result =>{   
           this.returnedOppo = JSON.parse(result);
            this.initialiseFullCalendarJs();
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
            this.outputResult = undefined;
        });
  }
}