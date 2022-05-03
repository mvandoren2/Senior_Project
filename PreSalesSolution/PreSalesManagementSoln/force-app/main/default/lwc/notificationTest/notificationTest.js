import { LightningElement } from 'lwc';
import notifyNinjaUsers from '@salesforce/apex/NinjaNotifications.notifyNinjaUsers';

export default class NotificationTest extends LightningElement {
    
    
    click = () => {
        notifyNinjaUsers({userIds: ["0055f0000041g1mAAA"], notifData_json: {
            title: "Test",
            body: "Testing some custom notifications.",
            targetId: "0065f000008xnXzAAI",
            customNotificationType: " "
        
        }}).catch(err => console.error("Error: ", err))
    }
}