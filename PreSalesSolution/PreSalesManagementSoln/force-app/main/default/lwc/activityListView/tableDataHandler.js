import Id from "@salesforce/user/Id"
import { buildDetailedActivitiesList, url } from "c/dataUtils"

export class TableDataHandler {

    fetchCurrentUser() {
        const userID = Id ? Id : '0055f0000041g1mAAA'
        const urlString = url + 'member/' + userID + '/'

        return fetch(urlString)
            .then(res => res.json())
    }    

    async fetchActivities() {
        let activities = await fetch(this.getActivityQueryString())
            .then(res => res.json())

        activities = await buildDetailedActivitiesList(activities)

        return this.sortActivities(activities)
    }

    getActivityQueryString() {
        let endpoint = 'activities/'
        let query = ''

        if(this.params.status)
            if(this.params.status) {
                switch(this.params.status) {
                    case 'accepted' :
                    case 'requests' :
                    case 'past' :
                    case 'current' :
                        endpoint += this.params.status + '/'
                        break
    
                    default :                
                        query += '?status=' + this.params.status
                }
            }

        let queryAdded = query !== ''
    
        if(this.params.opportunity) {
            query += (queryAdded ? "&" : '?') + 'opportunity=' + this.params.opportunity 
            queryAdded = true
        }

        else if(this.params.account) {
            query += (queryAdded ? "&" : '?') + 'account=' + this.params.account
            queryAdded = true
        }

        if(this.params.product) {
            query += (queryAdded ? "&" : '?') + 'product=' + this.params.product
            queryAdded = true
        }

        if(this.params.member){
            query += (queryAdded ? "&" : '?') + 'member=' + this.params.member
            queryAdded = true
        }

        if(this.params.activityType){
            query += (queryAdded ? "&" : '?') + 'activityType=' + this.params.activityType
            queryAdded = true
        }

        if(this.params.flag){
            query += (queryAdded ? "&" : '?') + 'flag=' + this.params.flag
            queryAdded = true
        }

        return url + endpoint + query
    }

    sortActivities(activities) {
        activities = activities.sort((a , b) => {
            const date_a =  a.selectedDate ? a.selectedDate.date : a.dates[0].date
            const date_b = b.selectedDate ? b.selectedDate.date : b.dates[0].date

            let ret = 0

            if (date_a > date_b)
                ret = 1

            else if(date_b > date_a)
                ret = -1

            return ret
        })

        const statusesInOrder = [
            'Request',
            'Reschedule',
            'Expire',
            'Accept',
            'Scheduled',
            'Cancel',
            'Decline'
        ]

        let sortedActivities = []
        
        statusesInOrder.forEach(status => {
            sortedActivities = sortedActivities.concat(activities.filter(activity => activity.status === status))
        })

        if(this.params.date)
            this.filterActivitiesByDate(this.params.date, sortedActivities)


        return sortedActivities
    }

    filterActivitiesByDate(date, activities) {
        date = new Date(date)

        return activities.filter(activity => this.dateFilter(date, activity))
    }

    dateFilter(filterDate, activity) {
        let include = false

        activity.dates.forEach(date => {
            date = date.date.setHours(0,0,0,0)

            if (date === filterDate.setHours(0,0,0,0))
                include = true
        })

        return include
    }

    //
    //Serve Processed Table Data
    //
    async getTableData(params) {
        this.params = params

        let detailedData
        let currentUser

        [currentUser, detailedData] = await Promise.all([this.fetchCurrentUser(), this.fetchActivities()])

        return  detailedData.length ?
            {activities: detailedData, user: currentUser} : null
    }
}
